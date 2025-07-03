/**
 * This utility file contains data and logic for music theory concepts
 * like scales and chords.
 */

const SEMITONE_TO_DEGREE = {
    0: '1', 1: 'b2', 2: '2', 3: 'b3', 4: '3', 5: '4',
    6: '#4/b5', 7: '5', 8: 'b6', 9: '6', 10: 'b7', 11: '7'
};

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

export const CHORDS = {
    'Major Triad': { intervals: [0, 4, 7] },
    'Minor Triad': { intervals: [0, 3, 7] },
    'Diminished Triad': { intervals: [0, 3, 6] },
    'Augmented Triad': { intervals: [0, 4, 8] },
    'Major 7th': { intervals: [0, 4, 7, 11] },
    'Minor 7th': { intervals: [0, 3, 7, 10] },
    'Dominant 7th': { intervals: [0, 4, 7, 10] },
};

// UPDATED: The map now understands common flat enharmonic equivalents
const NOTE_TO_MIDI = {
    'C': 48, 'C#': 49, 'Db': 49, 'D': 50, 'D#': 51, 'Eb': 51, 'E': 52, 'F': 53,
    'F#': 54, 'Gb': 54, 'G': 55, 'G#': 56, 'Ab': 56, 'A': 57, 'A#': 58, 'Bb': 58, 'B': 59,
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