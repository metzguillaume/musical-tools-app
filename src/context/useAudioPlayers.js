import { useState, useRef, useCallback, useEffect } from 'react';
import * as Tone from 'tone';
import { NOTE_TO_MIDI } from '../utils/musicTheory';
import { fretboardModel } from '../utils/fretboardUtils';

export const useAudioPlayers = (unlockAudio, bpm) => {
    const intervalSynth = useRef(null);
    const fretboardPlayers = useRef(null);
    const [areFretboardSoundsReady, setAreFretboardSoundsReady] = useState(false);
    const [fretboardVolume, setFretboardVolume] = useState(-6);
    const [intervalSynthVolume, setIntervalSynthVolume] = useState(0);

    useEffect(() => {
        intervalSynth.current = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'sine' },
            envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 },
        }).toDestination();

        const fretboardSoundUrls = {};
        for (let s = 1; s <= 6; s++) {
            for (let f = 0; f <= 12; f++) {
                fretboardSoundUrls[`${s}-${f}`] = `${process.env.PUBLIC_URL}/sounds/fretboard/${s}-${f}.mp3`;
            }
        }
        fretboardPlayers.current = new Tone.Players(fretboardSoundUrls, {
            onload: () => {
                setAreFretboardSoundsReady(true);
                console.log("Fretboard sounds loaded.");
            },
            fadeIn: 0.05,
            fadeOut: 0.1
        }).toDestination();

        return () => {
            intervalSynth.current?.dispose();
            fretboardPlayers.current?.dispose();
        };
    }, []);

    useEffect(() => { if (areFretboardSoundsReady && fretboardPlayers.current) fretboardPlayers.current.volume.value = fretboardVolume; }, [fretboardVolume, areFretboardSoundsReady]);
    useEffect(() => { if (intervalSynth.current) intervalSynth.current.volume.value = intervalSynthVolume; }, [intervalSynthVolume]);

    const playInterval = useCallback(async (notes) => {
        if (!notes || notes.length < 2 || !intervalSynth.current) return;
        await unlockAudio();

        intervalSynth.current.releaseAll();

        const now = Tone.now();
        intervalSynth.current.triggerAttackRelease(notes[0], 0.4, now);
        intervalSynth.current.triggerAttackRelease(notes[1], 0.4, now + 0.5);
        intervalSynth.current.triggerAttackRelease(notes, 0.8, now + 1.2);
    }, [unlockAudio]);

    const playFretboardNotes = useCallback(async (notePositions) => {
        if (!areFretboardSoundsReady || !notePositions || notePositions.length < 2) return;
        await unlockAudio();

        const firstNoteId = `${notePositions[0].string}-${notePositions[0].fret}`;
        const secondNoteId = `${notePositions[1].string}-${notePositions[1].fret}`;

        if (!fretboardPlayers.current.has(firstNoteId) || !fretboardPlayers.current.has(secondNoteId)) {
            console.error("Audio for notes not found:", firstNoteId, secondNoteId);
            return;
        }

        const now = Tone.now();
        const player1 = fretboardPlayers.current.player(firstNoteId);
        const player2 = fretboardPlayers.current.player(secondNoteId);

        // Ensure notes are stopped before playing to prevent overlap
        if (player1.state === "started") player1.stop(0);
        if (player2.state === "started") player2.stop(0);

        // Arpeggio: Root -> Target
        player1.start(now);
        player2.start(now + 0.5);

        // Chord: Both together
        player1.start(now + 1.2);
        player2.start(now + 1.2);

    }, [areFretboardSoundsReady, unlockAudio]);

    const playChord = useCallback(async (noteNames) => {
        if (!areFretboardSoundsReady || !noteNames || noteNames.length === 0) return;
        await unlockAudio();

        let lastMidi = 52;
        const voicing = [];
        for (const noteName of noteNames) {
            const targetMidiVal = NOTE_TO_MIDI[noteName] % 12;
            let foundNote = null;
            for (let midi = lastMidi + 1; midi < 80; midi++) {
                if (midi % 12 === targetMidiVal) {
                    for (let s = 1; s <= 6; s++) {
                        for (let f = 0; f <= 12; f++) {
                            if (fretboardModel[6 - s][f].midi === midi) {
                                foundNote = { string: s, fret: f, midi: midi };
                                break;
                            }
                        }
                        if (foundNote) break;
                    }
                }
                if (foundNote) break;
            }
            if (foundNote) {
                voicing.push(foundNote);
                lastMidi = foundNote.midi;
            }
        }

        if (voicing.length !== noteNames.length) {
            console.error("Could not build a full ascending voicing for:", noteNames.join(', '));
            return;
        }

        const now = Tone.now();
        const noteDuration = 0.4;

        const playVoicingNote = (note, time) => {
            const noteId = `${note.string}-${note.fret}`;
            if (fretboardPlayers.current.has(noteId)) {
                const player = fretboardPlayers.current.player(noteId);
                if (player.state === "started") {
                    player.stop(0);
                }
                player.start(time);
            }
        };

        voicing.forEach((note, index) => {
            playVoicingNote(note, now + index * noteDuration);
        });

        const chordTime = now + (voicing.length * noteDuration) + 0.1;
        voicing.forEach(note => {
            playVoicingNote(note, chordTime);
        });

    }, [areFretboardSoundsReady, unlockAudio]);

    return { playInterval, playChord, playFretboardNotes, areFretboardSoundsReady, fretboardVolume, setFretboardVolume, intervalSynthVolume, setIntervalSynthVolume, fretboardPlayers };
};