/**
 * This file contains utility functions and data models related to the guitar fretboard.
 */

/**
 * Generates a 2D array representing the guitar fretboard.
 * @returns {Array<Array<{note: string, midi: number}>>} A 2D array where [string][fret] gives note data.
 */
const generateFretboardModel = () => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const tuning = [
        { openNote: 'E', midi: 40 }, // String 6 (Low E)
        { openNote: 'A', midi: 45 }, // String 5
        { openNote: 'D', midi: 50 }, // String 4
        { openNote: 'G', midi: 55 }, // String 3
        { openNote: 'B', midi: 59 }, // String 2
        { openNote: 'E', midi: 64 }, // String 1 (High E)
    ];
    
    const fretCount = 24; 

    const fretboard = tuning.map(openString => {
        const stringNotes = [];
        for (let fret = 0; fret <= fretCount; fret++) {
            const midiValue = openString.midi + fret;
            const noteName = notes[midiValue % 12];
            stringNotes.push({ note: noteName, midi: midiValue });
        }
        return stringNotes;
    });

    return fretboard;
};

// We generate the model once and export it directly for other components to use.
export const fretboardModel = generateFretboardModel();

// NEW: Helper function to calculate the degree of a note relative to a root
const SEMITONE_TO_DEGREE = {
    0: '1', 1: 'b2', 2: '2', 3: 'b3', 4: '3', 5: '4',
    6: '#4/b5', 7: '5', 8: 'b6', 9: '6', 10: 'b7', 11: '7'
};

export const getDegree = (rootMidi, targetMidi) => {
    const interval = (targetMidi - rootMidi) % 12;
    const positiveInterval = interval < 0 ? interval + 12 : interval;
    return SEMITONE_TO_DEGREE[positiveInterval] || '?';
};