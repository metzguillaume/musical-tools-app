/**
 * This utility file contains data and logic for music theory concepts
 * like scales and chords.
 */

// Data structure defining common scales by their intervals in semitones
export const SCALES = {
    'Major': { intervals: [0, 2, 4, 5, 7, 9, 11] },
    'Natural Minor': { intervals: [0, 2, 3, 5, 7, 8, 10] },
    'Harmonic Minor': { intervals: [0, 2, 3, 5, 7, 8, 11] },
    'Major Pentatonic': { intervals: [0, 2, 4, 7, 9] },
    'Minor Pentatonic': { intervals: [0, 3, 5, 7, 10] },
    'Blues': { intervals: [0, 3, 5, 6, 7, 10] },
    'Dorian': { intervals: [0, 2, 3, 5, 7, 9, 10] },
    'Mixolydian': { intervals: [0, 2, 4, 5, 7, 9, 10] },
};

// Data structure defining common chords by their intervals in semitones
export const CHORDS = {
    'Major Triad': { intervals: [0, 4, 7] },
    'Minor Triad': { intervals: [0, 3, 7] },
    'Diminished Triad': { intervals: [0, 3, 6] },
    'Augmented Triad': { intervals: [0, 4, 8] },
    'Major 7th': { intervals: [0, 4, 7, 11] },
    'Minor 7th': { intervals: [0, 3, 7, 10] },
    'Dominant 7th': { intervals: [0, 4, 7, 10] },
};

// A helper map to find the MIDI value for a root note name.
// Assumes octave 3 as a good middle ground for root notes.
const NOTE_TO_MIDI = {
    'C': 48, 'C#': 49, 'D': 50, 'D#': 51, 'E': 52, 'F': 53,
    'F#': 54, 'G': 55, 'G#': 56, 'A': 57, 'A#': 58, 'B': 59,
};

/**
 * Finds all notes on the fretboard that belong to a given scale or chord.
 * @param {string} rootNoteName - The name of the root note (e.g., "G").
 * @param {Array<number>} intervals - An array of semitone intervals (e.g., [0, 4, 7]).
 * @param {Array<Array<object>>} fretboardModel - The fretboard data model.
 * @returns {Array<object>} An array of note objects found on the fretboard.
 */
export const getNotesFor = (rootNoteName, intervals, fretboardModel) => {
    const rootMidi = NOTE_TO_MIDI[rootNoteName];
    if (rootMidi === undefined) {
        console.error("Invalid root note name");
        return [];
    }

    // UPDATED: This logic is now expanded to cover a much wider octave range,
    // ensuring all notes on the fretboard are found regardless of the root note.
    const targetMidiValues = new Set();
    const octaveOffsets = [-2, -1, 0, 1, 2, 3]; // Covers a wide range of octaves

    intervals.forEach(interval => {
        octaveOffsets.forEach(octaveOffset => {
            targetMidiValues.add(rootMidi + interval + (12 * octaveOffset));
        });
    });

    const foundNotes = [];
    // Iterate over the entire fretboard model to find matching notes
    fretboardModel.forEach((string, stringIndex) => {
        string.forEach((noteData, fretIndex) => {
            if (targetMidiValues.has(noteData.midi)) {
                foundNotes.push({
                    string: 6 - stringIndex, // Calculate string number (6=low E)
                    fret: fretIndex,
                    label: noteData.note,
                    midi: noteData.midi,
                    isRoot: noteData.midi % 12 === rootMidi % 12, // Mark any note with the same name as the root
                });
            }
        });
    });

    return foundNotes;
};