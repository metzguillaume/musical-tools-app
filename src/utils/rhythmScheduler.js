// Get a single, shared AudioContext instance.
const getAudioContext = () => {
    if (!window.audioContext) {
        window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return window.audioContext;
};

// This function plays a single "click" sound at a precise time.
const playClick = (audioContext, time) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = 'triangle'; // A "click" sound is better than a "beep"
    oscillator.frequency.setValueAtTime(880, time); // A high-pitched "tick"
    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05); // Short decay

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start(time);
    oscillator.stop(time + 0.05);
};

/**
 * Schedules the playback of the entire rhythm.
 * @param {Array} measures - The 2D array of measure objects from useRhythmEngine.
 * @param {Object} settings - The settings object (bpm, timeSignature).
 */
export const playRhythm = (measures, settings) => {
    const audioContext = getAudioContext();
    const { bpm, timeSignature } = settings;
    
    // Calculate duration of a single beat (e.g., one quarter note in 4/4)
    const beatDuration = 60 / bpm;

    // TODO: This logic assumes 4/4. For 6/8, the 'beatDuration' would be
    // for a dotted quarter, and eighth notes would be 0.33 * beatDuration.
    // For now, we'll keep it simple and assume the 'beatType' is 4.
    const quarterNoteDuration = beatDuration; 

    let scheduleTime = audioContext.currentTime + 0.1; // Start 100ms in the future

    measures.forEach((measure) => {
        measure.forEach((item) => {
            if (item.type === 'note') {
                // Schedule the note to be played at the exact time
                playClick(audioContext, scheduleTime);
            }
            
            // Advance the schedule "playhead" by the duration of the current item
            const itemDurationInSeconds = item.duration * quarterNoteDuration;
            scheduleTime += itemDurationInSeconds;
        });
    });
};

// Function to generate a quiz rhythm (for "Reading Mode")
export const generateQuizRhythm = (settings) => {
    const { measureCount, timeSignature } = settings;
    const beatsPerMeasure = timeSignature.beats; // e.g., 4
    
    // This is a stub. A real generator would be more complex.
    // For now, it just creates one measure of four quarter notes.
    const quizMeasures = [];
    for (let i = 0; i < measureCount; i++) {
        const newMeasure = [
            { id: `q${i}-1`, ...NOTE_TYPES.quarter },
            { id: `q${i}-2`, ...NOTE_TYPES.quarter },
            { id: `q${i}-3`, ...NOTE_TYPES.quarter },
            { id: `q${i}-4`, ...NOTE_TYPES.quarter },
        ];
        quizMeasures.push(newMeasure);
    }
    return quizMeasures;
};