/**
 * This utility file contains data and logic for music theory concepts
 * like scales and chords.
 */

// --- Constants ---
export const SEMITONE_TO_DEGREE = {
    0: '1', 1: 'b2', 2: '2', 3: 'b3', 4: '3', 5: '4',
    6: '#4/b5', 7: '5', 8: 'b6', 9: '6', 10: 'b7', 11: '7'
};

const NOTE_LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const NOTE_TO_MIDI_BASE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

const SCALE_INTERVALS = {
    'Major': [0, 2, 4, 5, 7, 9, 11],
    'Natural Minor': [0, 2, 3, 5, 7, 8, 10],
    'Harmonic Minor': [0, 2, 3, 5, 7, 8, 11],
    'Melodic Minor': [0, 2, 3, 5, 7, 9, 11], // Ascending
};

const DIATONIC_CHORD_QUALITIES = {
    // For Triads: [I, ii, iii, IV, V, vi, vii°]
    'Major_Triads': ['Major', 'Minor', 'Minor', 'Major', 'Major', 'Minor', 'Diminished'],
    'Natural Minor_Triads': ['Minor', 'Diminished', 'Major', 'Minor', 'Minor', 'Major', 'Major'],
    'Harmonic Minor_Triads': ['Minor', 'Diminished', 'Augmented', 'Minor', 'Major', 'Major', 'Diminished'],
    'Melodic Minor_Triads': ['Minor', 'Minor', 'Augmented', 'Major', 'Major', 'Diminished', 'Diminished'],
    // For 7th Chords: [Imaj7, ii7, iii7, IVmaj7, V7, vi7, viiø7]
    'Major_7ths': ['Major 7th', 'Minor 7th', 'Minor 7th', 'Major 7th', 'Dominant 7th', 'Minor 7th', 'Half-Diminished 7th'],
    'Natural Minor_7ths': ['Minor 7th', 'Half-Diminished 7th', 'Major 7th', 'Minor 7th', 'Minor 7th', 'Major 7th', 'Dominant 7th'],
    'Harmonic Minor_7ths': ['Minor-Major 7th', 'Half-Diminished 7th', 'Augmented Major 7th', 'Minor 7th', 'Dominant 7th', 'Major 7th', 'Diminished 7th'],
    'Melodic Minor_7ths': ['Minor-Major 7th', 'Minor 7th', 'Augmented Major 7th', 'Dominant 7th', 'Dominant 7th', 'Half-Diminished 7th', 'Half-Diminished 7th'],
};

export const QUALITY_TO_SUFFIX = {
    'Major': '',
    'Minor': 'm',
    'Diminished': 'dim', // Changed from ° to 'dim' for better compatibility with note names
    'Augmented': '+',
    'Major 7th': 'maj7',
    'Minor 7th': 'm7',
    'Dominant 7th': '7',
    'Half-Diminished 7th': 'm7b5', // Common alternative to ø7
    'Diminished 7th': '°7',
    'Minor-Major 7th': 'm(maj7)',
    'Augmented Major 7th': '+maj7',
    'Sus2': 'sus2',
    'Sus4': 'sus4',
};

export const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

export const SCALES = {
    'Major': { intervals: SCALE_INTERVALS['Major'] },
    'Natural Minor': { intervals: SCALE_INTERVALS['Natural Minor'] },
    'Harmonic Minor': { intervals: SCALE_INTERVALS['Harmonic Minor'] },
    'Melodic Minor': { intervals: SCALE_INTERVALS['Melodic Minor'] },
};

export const CHORDS = {
    'Major': { intervals: [0, 4, 7], quality: 'Major' },
    'Minor': { intervals: [0, 3, 7], quality: 'Minor' },
    'Diminished': { intervals: [0, 3, 6], quality: 'Diminished' },
    'Augmented': { intervals: [0, 4, 8], quality: 'Augmented' },
    'Major 7th': { intervals: [0, 4, 7, 11], quality: 'Major 7th' },
    'Minor 7th': { intervals: [0, 3, 7, 10], quality: 'Minor 7th' },
    'Dominant 7th': { intervals: [0, 4, 7, 10], quality: 'Dominant 7th' },
    'Half-Diminished 7th': { intervals: [0, 3, 6, 10], quality: 'Half-Diminished 7th' },
    'Diminished 7th': { intervals: [0, 3, 6, 9], quality: 'Diminished 7th' },
    'Minor-Major 7th': { intervals: [0, 3, 7, 11], quality: 'Minor-Major 7th' },
    'Augmented Major 7th': { intervals: [0, 4, 8, 11], quality: 'Augmented Major 7th' },
    'Sus2': { intervals: [0, 2, 7], quality: 'Sus' },
    'Sus4': { intervals: [0, 5, 7], quality: 'Sus' },
};

export const NOTE_TO_MIDI = {
    'C': 48, 'C#': 49, 'Db': 49, 'D': 50, 'D#': 51, 'Eb': 51, 'E': 52, 'F': 53,
    'F#': 54, 'Gb': 54, 'G': 55, 'G#': 56, 'Ab': 56, 'A': 57, 'A#': 58, 'Bb': 58, 'B': 59,
};

/**
 * **REWRITTEN FUNCTION**
 * Calculates the correct note names for a scale, respecting diatonic spelling.
 * This ensures keys with flats produce flat notes (e.g., Bb in F Major) instead of sharp equivalents (A#).
 */
export const getScaleNotes = (rootNoteName, scaleName) => {
    const scaleIntervals = SCALE_INTERVALS[scaleName];
    if (!scaleIntervals) return [];

    const rootMidi = NOTE_TO_MIDI[rootNoteName];
    if (rootMidi === undefined) return [];

    const rootLetter = rootNoteName.charAt(0);
    const rootLetterIndex = NOTE_LETTERS.indexOf(rootLetter);

    const scaleNotes = scaleIntervals.map((interval, index) => {
        const noteLetter = NOTE_LETTERS[(rootLetterIndex + index) % 7];
        const targetMidi = rootMidi + interval;
        const naturalNoteMidiInC = NOTE_TO_MIDI_BASE[noteLetter];
        
        let octaveOffset = Math.floor(targetMidi / 12) * 12;
        let naturalNoteMidi = naturalNoteMidiInC + octaveOffset;
        
        // Adjust octave to find the closest natural note
        if (Math.abs(targetMidi - naturalNoteMidi) > 6) {
            if (targetMidi > naturalNoteMidi) naturalNoteMidi += 12;
            else naturalNoteMidi -= 12;
        }
        if (Math.abs(targetMidi - (naturalNoteMidi - 12)) < Math.abs(targetMidi - naturalNoteMidi)){
            naturalNoteMidi -= 12;
        }
         if (Math.abs(targetMidi - (naturalNoteMidi + 12)) < Math.abs(targetMidi - naturalNoteMidi)){
            naturalNoteMidi += 12;
        }

        const accidentalValue = targetMidi - naturalNoteMidi;
        
        let accidental = '';
        if (accidentalValue === 1) accidental = '#';
        else if (accidentalValue === 2) accidental = '##';
        else if (accidentalValue === -1) accidental = 'b';
        else if (accidentalValue === -2) accidental = 'bb';

        return `${noteLetter}${accidental}`;
    });

    return scaleNotes;
};

export const getDiatonicChords = (rootNoteName, scaleName, complexity) => {
    const scaleNotes = getScaleNotes(rootNoteName, scaleName);
    const qualityKey = `${scaleName}_${complexity}`;
    const qualities = DIATONIC_CHORD_QUALITIES[qualityKey];
    if (!scaleNotes.length || !qualities) return [];
    
    return scaleNotes.map((note, index) => {
        const quality = qualities[index];
        const suffix = QUALITY_TO_SUFFIX[quality] ?? '';
        return {
            roman: ROMAN_NUMERALS[index],
            name: `${note}${suffix}`,
            root: note,
            quality: quality,
            type: 'diatonic'
        };
    });
};

export const getNotesFor = (rootNoteName, intervals, fretboardModel) => {
    const rootMidi = NOTE_TO_MIDI[rootNoteName];
    if (rootMidi === undefined) {
        console.error("Invalid root note name");
        return [];
    }
    
    const targetMidiValues = new Set();
    const octaveOffsets = [-2, -1, 0, 1, 2, 3];

    intervals.forEach(interval => {
        octaveOffsets.forEach(octaveOffset => {
            targetMidiValues.add(rootMidi + interval + (12 * octaveOffset));
        });
    });

    const foundNotes = [];
    fretboardModel.forEach((string, stringIndex) => {
        string.forEach((noteData, fretIndex) => {
            if (targetMidiValues.has(noteData.midi)) {
                const interval = (noteData.midi - rootMidi) % 12;
                const degree = SEMITONE_TO_DEGREE[interval < 0 ? interval + 12 : interval];

                foundNotes.push({
                    string: 6 - stringIndex,
                    fret: fretIndex,
                    label: noteData.note,
                    midi: noteData.midi,
                    isRoot: noteData.midi % 12 === rootMidi % 12,
                    degree: degree,
                });
            }
        });
    });

    return foundNotes;
};