// Lazy-loads ffmpeg.wasm. Composes a v2 take into a final MP4 (or WebM):
// the composited video + mic and/or tab audio mixed at user-chosen gains.

let ffmpegInstance = null;
let loadPromise = null;

const CORE_BASE = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd';

const ensureLoaded = async (onProgress) => {
    if (ffmpegInstance) return ffmpegInstance;
    if (loadPromise) return loadPromise;
    loadPromise = (async () => {
        const { FFmpeg } = await import('@ffmpeg/ffmpeg');
        const { toBlobURL } = await import('@ffmpeg/util');
        const ff = new FFmpeg();
        if (onProgress) {
            ff.on('progress', ({ progress, time }) => onProgress({ progress, time }));
        }
        await ff.load({
            coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        ffmpegInstance = ff;
        return ff;
    })();
    try { return await loadPromise; }
    catch (e) { loadPromise = null; throw e; }
};

const blobToBuffer = async (blob) => new Uint8Array(await blob.arrayBuffer());
const guessExt = (mime) => {
    if (!mime) return 'webm';
    if (mime.includes('mp4')) return 'mp4';
    return 'webm';
};

export const isLoaded = () => !!ffmpegInstance;
export const preload = (onProgress) => ensureLoaded(onProgress);

const videoEncoderArgs = (outputFormat) => {
    if (outputFormat === 'mp4') {
        return ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '22', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'];
    }
    return ['-c:v', 'libvpx-vp9', '-b:v', '4M', '-deadline', 'realtime', '-cpu-used', '6'];
};
const audioEncoderArgs = (outputFormat) => {
    if (outputFormat === 'mp4') return ['-c:a', 'aac', '-b:a', '128k'];
    return ['-c:a', 'libopus', '-b:a', '128k'];
};

// Compose a v2 take. videoBlob is required; mic/tab are optional. Trim is
// applied via -ss/-t. v1 takes (single mixed blob) take the v1Blob branch.
export const exportComposed = async ({
    videoBlob = null,
    micBlob = null,
    tabBlob = null,
    videoMime,
    audioMime,
    micGain = 1,
    tabGain = 1,
    startSec = null,
    endSec = null,
    outputFormat = 'mp4',
    onProgress,
    v1Blob = null,
}) => {
    const ff = await ensureLoaded(onProgress);
    const outputName = outputFormat === 'mp4' ? 'out.mp4' : 'out.webm';
    const outputMime = outputFormat === 'mp4' ? 'video/mp4' : 'video/webm';

    const trimArgs = [];
    if (startSec != null) trimArgs.push('-ss', String(Math.max(0, startSec)));
    const durationArgs = [];
    if (endSec != null && startSec != null) {
        durationArgs.push('-t', String(Math.max(0.05, endSec - startSec)));
    } else if (endSec != null) {
        durationArgs.push('-to', String(endSec));
    }

    // ---------- v1 fallback ----------
    if (v1Blob) {
        const inputName = `in.${guessExt(v1Blob.type)}`;
        await ff.writeFile(inputName, await blobToBuffer(v1Blob));
        // -ss / -t after -i is precise (output seek). Slower than input
        // seek but reliable when the input has wonky duration metadata.
        await ff.exec([
            '-i', inputName,
            ...trimArgs,
            ...durationArgs,
            ...videoEncoderArgs(outputFormat),
            ...audioEncoderArgs(outputFormat),
            outputName,
        ]);
        const data = await ff.readFile(outputName);
        try { await ff.deleteFile(inputName); } catch (_) {}
        try { await ff.deleteFile(outputName); } catch (_) {}
        return new Blob([data.buffer], { type: outputMime });
    }

    // ---------- v2 ----------
    if (!videoBlob) throw new Error('No video to export.');

    const inputs = [];
    const writeInput = async (kind, blob, mime) => {
        if (!blob) return;
        const name = `${kind}.${guessExt(mime || blob.type)}`;
        await ff.writeFile(name, await blobToBuffer(blob));
        inputs.push({ kind, name, index: inputs.length });
    };
    await writeInput('video', videoBlob, videoMime);
    await writeInput('mic', micBlob, audioMime);
    await writeInput('tab', tabBlob, audioMime);

    const idx = {};
    inputs.forEach((it) => { idx[it.kind] = it.index; });

    // -ss / -t go AFTER -i and the maps (output seek). Slower than input
    // seek but precise even on canvas-captured WebMs whose duration metadata
    // can't be trusted. With multiple inputs we just declare each one and
    // let ffmpeg align them at their natural t=0.
    const args = [];
    inputs.forEach((it) => { args.push('-i', it.name); });

    const filters = [];
    let audioOutLabel = null;
    const haveMic = idx.mic != null;
    const haveTab = idx.tab != null;
    if (haveMic && haveTab) {
        filters.push(`[${idx.mic}:a]volume=${micGain}[mg]`);
        filters.push(`[${idx.tab}:a]volume=${tabGain}[tg]`);
        filters.push(`[mg][tg]amix=inputs=2:duration=longest:dropout_transition=0[a]`);
        audioOutLabel = '[a]';
    } else if (haveMic) {
        filters.push(`[${idx.mic}:a]volume=${micGain}[a]`);
        audioOutLabel = '[a]';
    } else if (haveTab) {
        filters.push(`[${idx.tab}:a]volume=${tabGain}[a]`);
        audioOutLabel = '[a]';
    }

    if (filters.length > 0) {
        args.push('-filter_complex', filters.join(';'));
    }
    args.push('-map', `${idx.video}:v`);
    if (audioOutLabel) args.push('-map', audioOutLabel);
    // Output seek + duration limit
    if (trimArgs.length > 0) args.push(...trimArgs);
    if (durationArgs.length > 0) args.push(...durationArgs);
    args.push(...videoEncoderArgs(outputFormat));
    if (audioOutLabel) args.push(...audioEncoderArgs(outputFormat));
    else args.push('-an');
    args.push(outputName);

    await ff.exec(args);
    const data = await ff.readFile(outputName);
    for (const it of inputs) { try { await ff.deleteFile(it.name); } catch (_) {} }
    try { await ff.deleteFile(outputName); } catch (_) {}

    return new Blob([data.buffer], { type: outputMime });
};
