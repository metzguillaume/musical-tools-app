// Records the live-composited video on one MediaRecorder and the two audio
// sources (mic, tab) on their own MediaRecorders. Keeping audio split lets
// the export step adjust mic-vs-tab balance after the fact; the video is
// flattened at record time so the PiP layout is fixed once captured.

const VIDEO_MIMES = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4;codecs=avc1.42E01F',
    'video/mp4;codecs=h264',
    'video/mp4',
];

const AUDIO_MIMES = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4;codecs=mp4a.40.2',
    'audio/mp4',
];

const pickMime = (candidates) => {
    if (typeof window === 'undefined' || !window.MediaRecorder) return null;
    for (const m of candidates) {
        try { if (MediaRecorder.isTypeSupported(m)) return m; } catch (_) { /* ignore */ }
    }
    return null;
};

export const isMp4Mime = (mime) => !!mime && mime.startsWith('video/mp4');

const startSubRecorder = ({ stream, mime, videoBitsPerSecond, audioBitsPerSecond, onError }) => {
    const opts = { mimeType: mime };
    if (videoBitsPerSecond) opts.videoBitsPerSecond = videoBitsPerSecond;
    if (audioBitsPerSecond) opts.audioBitsPerSecond = audioBitsPerSecond;
    let chunks = [];
    const rec = new MediaRecorder(stream, opts);
    rec.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunks.push(e.data); };
    if (onError) rec.onerror = (e) => onError(e?.error || e);
    rec.start(1000);
    return {
        rec,
        mime,
        getSize: () => chunks.reduce((s, c) => s + c.size, 0),
        stop: () => new Promise((resolve, reject) => {
            if (rec.state === 'inactive') {
                resolve(new Blob(chunks, { type: mime }));
                return;
            }
            const onStop = () => {
                rec.removeEventListener('stop', onStop);
                try { resolve(new Blob(chunks, { type: mime })); }
                catch (e) { reject(e); }
            };
            rec.addEventListener('stop', onStop);
            try { rec.stop(); } catch (e) { reject(e); }
        }),
    };
};

// Spawns one MediaRecorder per non-empty source. Video stream is recorded
// without audio (audio is captured by its own recorders so balance can be
// adjusted at export).
export const createMultiRecorder = ({
    videoStream = null,
    micAudioStream = null,
    tabAudioStream = null,
    videoBitsPerSecond = 4_000_000,
    onError,
} = {}) => {
    const videoMime = pickMime(VIDEO_MIMES);
    const audioMime = pickMime(AUDIO_MIMES);
    if (!videoMime && !audioMime) {
        throw new Error('MediaRecorder is not supported in this browser.');
    }

    const subs = {};
    if (videoStream && videoMime) {
        const videoOnly = new MediaStream(videoStream.getVideoTracks());
        subs.video = startSubRecorder({
            stream: videoOnly,
            mime: videoMime,
            videoBitsPerSecond,
            onError,
        });
    }
    if (micAudioStream && audioMime && micAudioStream.getAudioTracks().length > 0) {
        subs.mic = startSubRecorder({
            stream: new MediaStream(micAudioStream.getAudioTracks()),
            mime: audioMime,
            audioBitsPerSecond: 128_000,
            onError,
        });
    }
    if (tabAudioStream && audioMime && tabAudioStream.getAudioTracks().length > 0) {
        subs.tab = startSubRecorder({
            stream: new MediaStream(tabAudioStream.getAudioTracks()),
            mime: audioMime,
            audioBitsPerSecond: 128_000,
            onError,
        });
    }

    if (Object.keys(subs).length === 0) {
        throw new Error('No streams to record.');
    }

    const startedAt = Date.now();
    let totalPausedMs = 0;
    let pausedAt = 0;

    const allRecs = () => Object.values(subs).map((s) => s.rec);
    const someState = () => allRecs()[0]?.state || 'inactive';

    const pause = () => {
        if (someState() !== 'recording') return;
        allRecs().forEach((r) => { try { r.pause(); } catch (_) {} });
        pausedAt = Date.now();
    };
    const resume = () => {
        if (someState() !== 'paused') return;
        totalPausedMs += Date.now() - pausedAt;
        pausedAt = 0;
        allRecs().forEach((r) => { try { r.resume(); } catch (_) {} });
    };

    const stop = async () => {
        const out = { videoMime, audioMime };
        const entries = Object.entries(subs);
        const blobs = await Promise.all(entries.map(([k, s]) => s.stop().then((b) => [k, b])));
        for (const [k, b] of blobs) {
            if (k === 'video') out.videoBlob = b;
            else if (k === 'mic') out.micBlob = b;
            else if (k === 'tab') out.tabBlob = b;
        }
        return out;
    };

    const elapsedMs = () => {
        const now = someState() === 'paused' ? pausedAt : Date.now();
        return now - startedAt - totalPausedMs;
    };

    const totalSize = () => Object.values(subs).reduce((s, sub) => s + sub.getSize(), 0);

    return {
        videoMime,
        audioMime,
        subs,
        pause,
        resume,
        stop,
        elapsedMs,
        totalSize,
        getState: someState,
    };
};
