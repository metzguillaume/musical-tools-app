// Routes mic + tab/system audio to TWO separate MediaStream outputs (one per
// source) so the recorder can capture them as independent tracks, leaving
// balance adjustments for the export step. Also exposes a mic VU analyser.

export const createAudioMixer = ({
    micStream = null,
    systemStream = null,
    micGain = 1,
    systemGain = 1,
    limiterEnabled = true,
} = {}) => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const micDest = ctx.createMediaStreamDestination();
    const tabDest = ctx.createMediaStreamDestination();

    const state = {
        micStream: null,
        systemStream: null,
        micSrc: null,
        systemSrc: null,
        micGainNode: ctx.createGain(),
        systemGainNode: ctx.createGain(),
        // Brick-wall-ish limiter on the mic chain. Fast attack/release so it
        // catches transients without audibly compressing dynamics.
        limiterNode: ctx.createDynamicsCompressor(),
        analyser: ctx.createAnalyser(),
        analyserBuffer: null,
        limiterEnabled,
    };

    state.micGainNode.gain.value = micGain;
    state.systemGainNode.gain.value = systemGain;
    state.limiterNode.threshold.value = -1; // dB — hold output ceiling near 0 dBFS
    state.limiterNode.knee.value = 0;
    state.limiterNode.ratio.value = 20;
    state.limiterNode.attack.value = 0.001;
    state.limiterNode.release.value = 0.05;
    state.analyser.fftSize = 1024;
    state.analyserBuffer = new Uint8Array(state.analyser.fftSize);
    // Smoothed bar level + peak-hold marker. Mapped on a dBFS scale so the
    // meter actually shows a useful range for music recording.
    state.smoothedLevel = 0;
    state.peakHold = 0;
    state.peakHoldAt = 0;

    // Wire the mic chain. Analyser sits POST-gain, PRE-limiter so the meter
    // shows the level the recording will actually receive (before limiting).
    const wireMicChain = () => {
        try { state.micGainNode.disconnect(); } catch (_) {}
        try { state.limiterNode.disconnect(); } catch (_) {}
        state.micGainNode.connect(state.analyser);
        if (state.limiterEnabled) {
            state.micGainNode.connect(state.limiterNode);
            state.limiterNode.connect(micDest);
        } else {
            state.micGainNode.connect(micDest);
        }
    };
    wireMicChain();
    state.systemGainNode.connect(tabDest);

    const setMicStream = async (stream) => {
        // No-op if same stream — avoids needlessly re-creating the source
        // node which would briefly cut audio.
        if (state.micStream === stream) return;
        if (state.micSrc) {
            try { state.micSrc.disconnect(); } catch (_) {}
            state.micSrc = null;
        }
        state.micStream = stream || null;
        if (stream && stream.getAudioTracks().length > 0) {
            const audioOnly = new MediaStream(stream.getAudioTracks());
            state.micSrc = ctx.createMediaStreamSource(audioOnly);
            state.micSrc.connect(state.micGainNode);
        }
        if (ctx.state === 'suspended') {
            try { await ctx.resume(); } catch (_) {}
        }
    };

    const setSystemStream = async (stream) => {
        if (state.systemStream === stream) return;
        if (state.systemSrc) {
            try { state.systemSrc.disconnect(); } catch (_) {}
            state.systemSrc = null;
        }
        state.systemStream = stream || null;
        if (stream && stream.getAudioTracks().length > 0) {
            const audioOnly = new MediaStream(stream.getAudioTracks());
            state.systemSrc = ctx.createMediaStreamSource(audioOnly);
            state.systemSrc.connect(state.systemGainNode);
        }
        if (ctx.state === 'suspended') {
            try { await ctx.resume(); } catch (_) {}
        }
    };

    const setMicGain = (v) => { state.micGainNode.gain.value = Math.max(0, v); };
    const setSystemGain = (v) => { state.systemGainNode.gain.value = Math.max(0, v); };
    const setLimiterEnabled = (v) => {
        state.limiterEnabled = !!v;
        wireMicChain();
    };

    // Returns { level, peak } — both 0..1, mapped linearly in dB across the
    // displayed range FLOOR_DB..0. `level` is fast-attack / slow-release
    // smoothed so the bar tracks the actual envelope; `peak` lingers ~1.5 s
    // so brief transients remain visible.
    const FLOOR_DB = -50;
    const dbToVisual = (db) => {
        if (!isFinite(db)) return 0;
        const v = (db - FLOOR_DB) / (0 - FLOOR_DB);
        return Math.max(0, Math.min(1, v));
    };
    const getMicLevel = () => {
        if (!state.analyserBuffer) return { level: 0, peak: 0 };
        state.analyser.getByteTimeDomainData(state.analyserBuffer);
        let peak = 0;
        for (let i = 0; i < state.analyserBuffer.length; i++) {
            const v = Math.abs((state.analyserBuffer[i] - 128) / 128);
            if (v > peak) peak = v;
        }
        const peakDb = 20 * Math.log10(Math.max(1e-6, peak));
        const target = dbToVisual(peakDb);

        // Fast attack, slow release — the bar jumps to a new peak instantly
        // but decays gradually so a sustained note doesn't make the bar
        // flicker frame-by-frame.
        if (target > state.smoothedLevel) {
            state.smoothedLevel = target;
        } else {
            state.smoothedLevel = state.smoothedLevel * 0.88 + target * 0.12;
        }

        // Peak-hold tick — refresh whenever we beat the current hold or after
        // the hold has aged out (1.5 s).
        const now = performance.now();
        if (target > state.peakHold || now - state.peakHoldAt > 1500) {
            state.peakHold = target;
            state.peakHoldAt = now;
        }

        return { level: state.smoothedLevel, peak: state.peakHold };
    };

    const dispose = () => {
        try { state.micSrc?.disconnect(); } catch (_) {}
        try { state.systemSrc?.disconnect(); } catch (_) {}
        try { state.micGainNode.disconnect(); } catch (_) {}
        try { state.systemGainNode.disconnect(); } catch (_) {}
        try { state.limiterNode.disconnect(); } catch (_) {}
        try { state.analyser.disconnect(); } catch (_) {}
        try { micDest.disconnect(); } catch (_) {}
        try { tabDest.disconnect(); } catch (_) {}
        try { ctx.close(); } catch (_) {}
    };

    // wire initial inputs
    if (micStream) setMicStream(micStream);
    if (systemStream) setSystemStream(systemStream);

    return {
        // Mic-only output (post-gain, post-limiter). Recorded as its own track.
        micOutputStream: micDest.stream,
        // Tab/system audio output (post-gain only). Recorded as its own track.
        tabOutputStream: tabDest.stream,
        setMicStream,
        setSystemStream,
        setMicGain,
        setSystemGain,
        setLimiterEnabled,
        getMicLevel,
        hasMic: () => !!state.micSrc,
        hasTab: () => !!state.systemSrc,
        dispose,
    };
};
