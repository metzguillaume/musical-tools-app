// Synchronized playback for a v2 take. Receives already-mounted media
// elements (the consumer renders them via React). Routes mic and tab audio
// through Web Audio gain nodes, keeps the followers within ~80 ms of the
// leader (the video element when present), and reports time / duration to
// the consumer via callbacks.
//
// IMPORTANT: AudioContext is shared across engine instances and never closed.
// `createMediaElementSource` may only be called once per element for the
// lifetime of that element — calling it again throws InvalidStateError. With
// React StrictMode double-running effects in dev, creating a fresh ctx per
// engine would bind the audio element to a context that the next cleanup
// closes, leaving the element's output orphaned to a closed graph and
// permanently silent. Sharing one ctx + caching the source per element via
// a WeakMap sidesteps the whole class of bug.

const SYNC_TOLERANCE_MS = 80;

let sharedAudioCtx = null;
const elementSources = new WeakMap();

const getSharedCtx = () => {
    if (!sharedAudioCtx) {
        sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return sharedAudioCtx;
};

const getOrCreateMediaSource = (ctx, element) => {
    if (!element) return null;
    let src = elementSources.get(element);
    if (!src) {
        try {
            src = ctx.createMediaElementSource(element);
            elementSources.set(element, src);
        } catch (e) {
            console.warn('createMediaElementSource failed', e);
            return null;
        }
    }
    return src;
};

export const createPlaybackEngine = ({
    videoEl = null,
    micEl = null,
    tabEl = null,
    onTimeUpdate,
    onDurationChange,
    onPlay,
    onPause,
    onEnded,
}) => {
    const leader = videoEl || micEl || tabEl;
    if (!leader) {
        return {
            play: () => Promise.resolve(),
            pause: () => {},
            seek: () => {},
            setMicGain: () => {},
            setTabGain: () => {},
            getDuration: () => 0,
            getCurrentTime: () => 0,
            isPlaying: () => false,
            destroy: () => {},
        };
    }

    const ctx = getSharedCtx();
    const micGainNode = ctx.createGain();
    const tabGainNode = ctx.createGain();
    micGainNode.connect(ctx.destination);
    tabGainNode.connect(ctx.destination);

    const micSrc = getOrCreateMediaSource(ctx, micEl);
    const tabSrc = getOrCreateMediaSource(ctx, tabEl);
    if (micSrc) micSrc.connect(micGainNode);
    if (tabSrc) tabSrc.connect(tabGainNode);

    // The video element doesn't need Web Audio routing since the composited
    // video has no audio track. Mute it just to be safe.
    if (videoEl) videoEl.muted = true;

    const followers = [micEl, tabEl, videoEl].filter((el) => el && el !== leader);
    const playables = [leader, ...followers];

    let knownDuration = 0;
    const probe = () => {
        playables.forEach((el) => {
            if (el && isFinite(el.duration) && el.duration > 0) {
                knownDuration = Math.max(knownDuration, el.duration);
            }
        });
        if (knownDuration > 0 && onDurationChange) onDurationChange(knownDuration);
    };
    leader.addEventListener('loadedmetadata', probe);
    leader.addEventListener('durationchange', probe);
    if (onTimeUpdate) leader.addEventListener('timeupdate', () => onTimeUpdate(leader.currentTime));
    if (onPlay) leader.addEventListener('play', onPlay);
    if (onPause) leader.addEventListener('pause', onPause);
    if (onEnded) leader.addEventListener('ended', onEnded);

    // Nudge the video off zero once metadata loads so Chrome paints the
    // first frame instead of holding a black canvas.
    if (videoEl) {
        const paintFirstFrame = () => {
            try { videoEl.currentTime = 0.001; } catch (_) {}
        };
        if (videoEl.readyState >= 1) paintFirstFrame();
        else videoEl.addEventListener('loadedmetadata', paintFirstFrame, { once: true });
    }

    let driftInterval = null;
    const startDriftLoop = () => {
        if (driftInterval) return;
        driftInterval = setInterval(() => {
            const t = leader.currentTime;
            followers.forEach((el) => {
                if (el.paused) return;
                const diff = Math.abs(el.currentTime - t) * 1000;
                if (diff > SYNC_TOLERANCE_MS) {
                    try { el.currentTime = t; } catch (_) {}
                }
            });
        }, 250);
    };
    const stopDriftLoop = () => {
        if (driftInterval) clearInterval(driftInterval);
        driftInterval = null;
    };

    // Resolves once `el` has decoded enough data that its MediaElementSource
    // will produce real samples instead of silence. Falls back after `timeoutMs`
    // so a misbehaving element can't deadlock playback.
    const waitForReady = (el, timeoutMs = 1500) => {
        if (!el || el.readyState >= 3) return Promise.resolve();
        return new Promise((resolve) => {
            let done = false;
            const finish = () => {
                if (done) return;
                done = true;
                el.removeEventListener('canplay', finish);
                el.removeEventListener('canplaythrough', finish);
                el.removeEventListener('loadeddata', finish);
                resolve();
            };
            el.addEventListener('canplay', finish);
            el.addEventListener('canplaythrough', finish);
            el.addEventListener('loadeddata', finish);
            setTimeout(finish, timeoutMs);
        });
    };

    // Resolves when the element fires `seeked` for the most recent seek.
    // The MediaElementSource taps silence until the seek lands, so we wait
    // for that explicitly before starting playback. `currentTime = t` may not
    // fire `seeked` if it's already at `t`, so a no-op resolve is safe.
    const seekAndWait = (el, t, timeoutMs = 500) => {
        if (!el) return Promise.resolve();
        return new Promise((resolve) => {
            let done = false;
            const finish = () => {
                if (done) return;
                done = true;
                el.removeEventListener('seeked', finish);
                resolve();
            };
            el.addEventListener('seeked', finish, { once: true });
            try {
                if (Math.abs(el.currentTime - t) < 0.01) {
                    // Already there — nudge to force a seeked event.
                    el.currentTime = Math.max(0, t + 0.001);
                }
                el.currentTime = t;
            } catch (_) {
                finish();
                return;
            }
            setTimeout(finish, timeoutMs);
        });
    };

    const play = async () => {
        if (ctx.state === 'suspended') {
            try { await ctx.resume(); } catch (_) {}
        }
        // First playback after mount can leave audio silent: the
        // MediaElementSource binds at engine-creation time but the audio
        // element hasn't decoded data yet, so the source taps an empty
        // stream. We now (1) wait for the elements to actually have data,
        // then (2) issue a seek and await `seeked` so the buffer is aligned
        // before play() starts. Without the await, play() raced the seek
        // and the source produced silence until the buffer caught up.
        await Promise.all([micEl, tabEl].map((el) => waitForReady(el)));
        const t = Math.max(0, leader.currentTime);
        await Promise.all([micEl, tabEl].map((el) => seekAndWait(el, t)));
        await Promise.all(playables.map((el) => el.play().catch(() => {})));
        startDriftLoop();
    };
    const pause = () => {
        playables.forEach((el) => { try { el.pause(); } catch (_) {} });
        stopDriftLoop();
    };
    const seek = (t) => {
        const target = Math.max(0, Math.min(knownDuration || 1e6, t));
        playables.forEach((el) => { try { el.currentTime = target; } catch (_) {} });
    };

    const setMicGain = (v) => { micGainNode.gain.value = Math.max(0, v); };
    const setTabGain = (v) => { tabGainNode.gain.value = Math.max(0, v); };

    const destroy = () => {
        stopDriftLoop();
        // Disconnect the per-engine gain branch from the shared graph but
        // DON'T close the shared ctx and DON'T disconnect the cached
        // MediaElementSource (it stays bound to the element so the next
        // engine can reattach without throwing InvalidStateError).
        try { if (micSrc) micSrc.disconnect(micGainNode); } catch (_) {}
        try { if (tabSrc) tabSrc.disconnect(tabGainNode); } catch (_) {}
        try { micGainNode.disconnect(); } catch (_) {}
        try { tabGainNode.disconnect(); } catch (_) {}
    };

    // Run an immediate probe in case metadata is already available
    setTimeout(probe, 0);

    return {
        play, pause, seek,
        setMicGain, setTabGain,
        getDuration: () => knownDuration,
        getCurrentTime: () => leader.currentTime,
        isPlaying: () => !leader.paused,
        destroy,
    };
};
