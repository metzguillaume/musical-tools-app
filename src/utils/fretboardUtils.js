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
        { openNote: 'E', midi: 64 }, // String 1 (High E)
        { openNote: 'B', midi: 59 }, // String 2
        { openNote: 'G', midi: 55 }, // String 3
        { openNote: 'D', midi: 50 }, // String 4
        { openNote: 'A', midi: 45 }, // String 5
        { openNote: 'E', midi: 40 }, // String 6 (Low E)
    ];
    const fretCount = 12; // We can generate up to the 12th fret for questions

    const fretboard = tuning.map(openString => {
        const stringNotes = [];
        for (let fret = 0; fret <= fretCount; fret++) {
            const midiValue = openString.midi + fret;
            const noteName = notes[midiValue % 12];
            stringNotes.push({ note: noteName, midi: midiValue });
        }
        return stringNotes;
    });

    // The model is indexed [string-1][fret]. We reverse it so string 1 is at index 0.
    return fretboard.reverse();
};

// We generate the model once and export it directly for other components to use.
export const fretboardModel = generateFretboardModel();