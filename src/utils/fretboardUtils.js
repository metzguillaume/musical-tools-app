/**
 * This file contains utility functions and data models related to the guitar fretboard.
 */

import { NOTE_TO_MIDI } from './musicTheory';

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

/**
 * Finds a playable, low-position fretboard voicing for a given set of chord notes.
 * @param {string[]} noteNames - An array of note names (e.g., ['G', 'B', 'D']).
 * @param {Object} model - The fretboardModel.
 * @returns {Array<{string: number, fret: number}> | null} An array of note position objects or null if a voicing can't be found.
 */
export const findChordVoicing = (noteNames, model = fretboardModel) => {
    const targetMidiSet = new Set(noteNames.map(note => {
        const midi = NOTE_TO_MIDI[note];
        return midi % 12;
    }));

    // Start searching from the lowest string for the root
    for (let startStringIdx = 5; startStringIdx >= 2; startStringIdx--) {
        for (let startFret = 0; startFret <= 5; startFret++) {
            const rootNote = model[startStringIdx][startFret];
            
            // Check if this fret contains one of the notes of our chord
            if (targetMidiSet.has(rootNote.midi % 12)) {
                const voicing = [{ string: 6 - startStringIdx, fret: startFret, midi: rootNote.midi }];
                const remainingMidi = new Set(targetMidiSet);
                remainingMidi.delete(rootNote.midi % 12); // Note is found

                // Now search for the remaining notes on higher strings
                for (let nextStringIdx = startStringIdx - 1; nextStringIdx >= 0; nextStringIdx--) {
                    if (remainingMidi.size === 0) break;

                    for (let nextFret = Math.max(0, startFret - 2); nextFret <= startFret + 2; nextFret++) {
                        const nextNote = model[nextStringIdx][nextFret];
                        if (remainingMidi.has(nextNote.midi % 12)) {
                            voicing.push({ string: 6 - nextStringIdx, fret: nextFret, midi: nextNote.midi });
                            remainingMidi.delete(nextNote.midi % 12);
                            break; // Move to the next string once a note is found
                        }
                    }
                }

                // If we found all the notes, we have a valid voicing
                if (remainingMidi.size === 0) {
                    return voicing;
                }
            }
        }
    }
    return null; // No suitable voicing found
};