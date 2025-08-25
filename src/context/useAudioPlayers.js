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

        // Safety check: Stop any currently playing synth notes before starting new ones.
        intervalSynth.current.releaseAll();

        const now = Tone.now();
        intervalSynth.current.triggerAttackRelease(notes[0], 0.4, now);
        intervalSynth.current.triggerAttackRelease(notes[1], 0.4, now + 0.5);
        intervalSynth.current.triggerAttackRelease(notes, 0.8, now + 1.2);
    }, [unlockAudio]);

    const playFretboardNotes = useCallback(async (notes) => {
        if (!areFretboardSoundsReady || !notes || notes.length < 2) return;
        await unlockAudio();

        const rootNoteId = `${notes[0].string}-${notes[0].fret}`;
        const targetNoteId = `${notes[1].string}-${notes[1].fret}`;

        if (!fretboardPlayers.current.has(rootNoteId) || !fretboardPlayers.current.has(targetNoteId)) {
            console.error("Audio for notes not found:", rootNoteId, targetNoteId);
            return;
        }

        const now = Tone.now();
        
        // This helper function now contains the stop-before-start safety check.
        const playNote = (noteId, time) => {
            const player = fretboardPlayers.current.player(noteId);
            // This is the key fix: stop any previous playback of this specific note before starting it again.
            if (player.state === "started") {
                player.stop(0);
            }
            player.start(time);
        };

        playNote(rootNoteId, now);
        playNote(targetNoteId, now + 0.4);
        playNote(rootNoteId, now + 0.9);
        playNote(targetNoteId, now + 0.9);
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

        // This new helper function ensures the stop-before-start safety check is applied everywhere.
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

        // Play as an arpeggio using the safe helper function.
        voicing.forEach((note, index) => {
            playVoicingNote(note, now + index * noteDuration);
        });

        // Play as a chord using the safe helper function.
        const chordTime = now + (voicing.length * noteDuration) + 0.1;
        voicing.forEach(note => {
            playVoicingNote(note, chordTime);
        });

    }, [areFretboardSoundsReady, unlockAudio]);

    return { playInterval, playChord, playFretboardNotes, areFretboardSoundsReady, fretboardVolume, setFretboardVolume, intervalSynthVolume, setIntervalSynthVolume, fretboardPlayers };
};