/**
 * This file contains utility functions and data models related to the guitar fretboard.
 */

import { NOTE_TO_MIDI, TRIAD_DEFINITIONS } from './musicTheory';

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

const SEMITONE_TO_DEGREE = {
    0: '1', 1: 'b2', 2: '2', 3: 'b3', 4: '3', 5: '4',
    6: '#4/b5', 7: '5', 8: 'b6', 9: '6', 10: 'b7', 11: '7'
};

export const getDegree = (rootMidi, targetMidi) => {
    const interval = (targetMidi - rootMidi) % 12;
    const positiveInterval = interval < 0 ? interval + 12 : interval;
    return SEMITONE_TO_DEGREE[positiveInterval] || '?';
};

const NOTE_TO_MIDI_CLASS = {
    'C': 0, 'B#': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'Fb': 4, 'F': 5, 'E#': 5, 'F#': 6, 'Gb': 6, 'G': 7,
    'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11, 'Cb': 11,
};

export const getTriadNoteNamesAsMap = (rootNoteName, quality) => {
    const intervals = TRIAD_DEFINITIONS.qualities[quality];
    if (!intervals) return {};

    const SHARP_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

    // Use flats for keys with 'b' in the name, and for F major. Otherwise use sharps.
    const useFlats = (rootNoteName.includes('b') || rootNoteName === 'F');
    const scale = useFlats ? FLAT_NOTES : SHARP_NOTES;
    
    const rootMidiClass = NOTE_TO_MIDI_CLASS[rootNoteName];
    if (rootMidiClass === undefined) return {};

    const noteMap = {};
    intervals.forEach(interval => {
        const noteMidiClass = (rootMidiClass + interval) % 12;
        noteMap[noteMidiClass] = scale[noteMidiClass];
    });

    // Handle exceptions where the simple rule doesn't produce the most common spelling
    if (rootNoteName === 'F#' && (quality === 'Major' || quality === 'Augmented')) noteMap[10] = 'A#';
    if (rootNoteName === 'Gb' && (quality === 'Major' || quality === 'Minor')) noteMap[10] = 'Bb';
    if (rootNoteName === 'C#' && (quality === 'Major' || quality === 'Augmented')) noteMap[5] = 'E#';

    return noteMap;
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

    for (let startStringIdx = 5; startStringIdx >= 2; startStringIdx--) {
        for (let startFret = 0; startFret <= 5; startFret++) {
            const rootNote = model[startStringIdx][startFret];
            
            if (targetMidiSet.has(rootNote.midi % 12)) {
                const voicing = [{ string: 6 - startStringIdx, fret: startFret, midi: rootNote.midi }];
                const remainingMidi = new Set(targetMidiSet);
                remainingMidi.delete(rootNote.midi % 12);

                for (let nextStringIdx = startStringIdx - 1; nextStringIdx >= 0; nextStringIdx--) {
                    if (remainingMidi.size === 0) break;

                    for (let nextFret = Math.max(0, startFret - 2); nextFret <= startFret + 2; nextFret++) {
                        const nextNote = model[nextStringIdx][nextFret];
                        if (remainingMidi.has(nextNote.midi % 12)) {
                            voicing.push({ string: 6 - nextStringIdx, fret: nextFret, midi: nextNote.midi });
                            remainingMidi.delete(nextNote.midi % 12);
                            break;
                        }
                    }
                }

                if (remainingMidi.size === 0) {
                    return voicing;
                }
            }
        }
    }
    return null;
};

/**
 * Finds all playable, close-voiced triad shapes that match a specific inversion voicing.
 * @returns {Array<Array<{string, fret, midi, label, isRoot, degree}>>} An array of found shapes.
 */
export const findTriadShapes = (rootNoteName, quality, inversion, stringSet, fretboard = fretboardModel) => {
    const baseIntervals = TRIAD_DEFINITIONS.qualities[quality];
    if (!baseIntervals) return [];
    
    const rootMidi = NOTE_TO_MIDI[rootNoteName];
    if (rootMidi === undefined) return [];

    const rootMidiClass = rootMidi % 12;
    const targetMidiClasses = new Set(baseIntervals.map(interval => (rootMidiClass + interval) % 12));
    
    const foundShapes = [];
    const fretSpan = 5; 

    for (let startFret = 0; startFret <= 15; startFret++) {
        const potentialShape = [];
        for (const stringNum of stringSet) {
            let foundNoteOnString = null;
            for (let fret = startFret; fret < startFret + fretSpan; fret++) {
                if (fret >= fretboard[6 - stringNum].length) continue;

                const note = fretboard[6 - stringNum][fret];
                if (targetMidiClasses.has(note.midi % 12)) {
                    if (!potentialShape.some(n => n.midi % 12 === note.midi % 12)) {
                        foundNoteOnString = { string: stringNum, fret: fret, midi: note.midi, label: note.note };
                        break;
                    }
                }
            }
            if (foundNoteOnString) {
                potentialShape.push(foundNoteOnString);
            }
        }

        if (potentialShape.length === 3) {
            const shapeWithDegrees = potentialShape.map(note => {
                const interval = (note.midi - rootMidi) % 12;
                const positiveInterval = interval < 0 ? interval + 12 : interval;
                const degree = getDegree(rootMidi, note.midi);
                return { ...note, isRoot: positiveInterval === 0, degree };
            });

            const s3 = Math.max(...stringSet);
            const bassNote = shapeWithDegrees.find(n => n.string === s3);

            if (!bassNote) continue;

            let actualInversion = null;
            if (bassNote.degree === '1') actualInversion = 'Root';
            else if (bassNote.degree === '5') actualInversion = '2nd';
            else actualInversion = '1st';

            if (actualInversion === inversion) {
                const sortedByString = [...shapeWithDegrees].sort((a, b) => b.string - a.string);
                const noteDegreesInOrder = sortedByString.map(n => n.degree);

                if (quality === 'Sus2' && inversion === 'Root' && (noteDegreesInOrder[1] !== '2' || noteDegreesInOrder[2] !== '5')) {
                    continue;
                }

                if (quality === 'Sus4' && inversion === '2nd' && (noteDegreesInOrder[1] !== '1' || noteDegreesInOrder[2] !== '4')) {
                    continue;
                }
                
                const shapeSignature = shapeWithDegrees.map(n => `${n.string}-${n.fret}`).sort().join(',');
                if (!foundShapes.some(s => s.signature === shapeSignature)) {
                    foundShapes.push({ signature: shapeSignature, notes: shapeWithDegrees });
                }
            }
        }
    }
    
    return foundShapes.map(s => s.notes);
};