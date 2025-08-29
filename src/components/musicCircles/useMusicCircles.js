import { useState, useMemo, useCallback } from 'react';
import { getDiatonicChords, getScaleNotes } from '../../utils/musicTheory';

// --- CHANGE: Using flat names as the standard ---
const CHROMATIC_SCALE_FLATS = [
    { name: 'C', midiClass: 0 }, { name: 'Db', midiClass: 1 }, { name: 'D', midiClass: 2 },
    { name: 'Eb', midiClass: 3 }, { name: 'E', midiClass: 4 }, { name: 'F', midiClass: 5 },
    { name: 'F#', midiClass: 6 }, { name: 'G', midiClass: 7 }, { name: 'Ab', midiClass: 8 },
    { name: 'A', midiClass: 9 }, { name: 'Bb', midiClass: 10 }, { name: 'B', midiClass: 11 }
];
const MIDI_CLASS_TO_NOTE = Object.fromEntries(CHROMATIC_SCALE_FLATS.map(n => [n.midiClass, n.name]));
const NOTE_TO_MIDI_CLASS = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 
    'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
};

// --- This hook is now completely rewritten to be dynamic ---
export const useMusicCircles = (settings) => {
    const [rotationOffset, setRotationOffset] = useState(0);

    const circleData = useMemo(() => {
        let baseCircle = [];

        // Step 1: Generate the base circle dynamically based on the mode
        if (settings.mode === 'Notes') {
            let currentMidiClass = NOTE_TO_MIDI_CLASS[settings.rootNote];
            do {
                const noteName = MIDI_CLASS_TO_NOTE[currentMidiClass];
                baseCircle.push({ name: noteName, midiClass: currentMidiClass, label: noteName, isActive: true });
                currentMidiClass = (currentMidiClass + settings.circleInterval) % 12;
            } while (currentMidiClass !== NOTE_TO_MIDI_CLASS[settings.rootNote]);

        } else if (settings.mode === 'Scale') {
            const scaleNotes = getScaleNotes(settings.rootNote, settings.scaleType);
            const rootNoteMidiClass = NOTE_TO_MIDI_CLASS[settings.rootNote];
            const degrees = ['1', 'b2', '2', 'b3', '3', '4', '#4/b5', '5', 'b6', '6', 'b7', '7'];
            
            baseCircle = scaleNotes.map(noteName => {
                const midiClass = NOTE_TO_MIDI_CLASS[noteName];
                const interval = (midiClass - rootNoteMidiClass + 12) % 12;
                const degree = degrees[interval];
                return { name: noteName, midiClass, label: settings.showLabels ? degree : noteName, isActive: true };
            });

        } else if (settings.mode === 'Chord') {
            const diatonicChords = getDiatonicChords(settings.rootNote, settings.scaleType, 'Triads');
            baseCircle = diatonicChords.map(chord => ({
                name: chord.root,
                midiClass: NOTE_TO_MIDI_CLASS[chord.root],
                label: settings.showLabels ? chord.roman : chord.name,
                chordName: chord.name,
                isActive: true,
            }));
        }

        // Step 2: Apply rotation
        const offset = (baseCircle.length - rotationOffset) % baseCircle.length;
        const rotatedCircle = [
            ...baseCircle.slice(offset),
            ...baseCircle.slice(0, offset)
        ];

        return rotatedCircle;

    }, [settings, rotationOffset]);

    const rotateCircle = useCallback((direction) => {
        const len = circleData.length || 1;
        setRotationOffset(prev => (prev + direction + len) % len);
    }, [circleData.length]);

    return { circleData, rotateCircle, setRotationOffset };
};