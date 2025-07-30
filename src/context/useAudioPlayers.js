import { useState, useRef, useCallback, useEffect } from 'react';
import * as Tone from 'tone';

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
        const now = Tone.now();
        // Use fixed second values instead of "8n" or "4n"
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
        const playNote = (noteId, time) => {
            const player = fretboardPlayers.current.player(noteId);
            player.start(time);
        };
        // Play notes with fixed timing, not based on BPM
        playNote(rootNoteId, now);
        playNote(targetNoteId, now + 0.4);
        // Play them together as a chord
        playNote(rootNoteId, now + 0.9);
        playNote(targetNoteId, now + 0.9);
    }, [areFretboardSoundsReady, unlockAudio, bpm, fretboardVolume]);

    return { playInterval, playFretboardNotes, areFretboardSoundsReady, fretboardVolume, setFretboardVolume, intervalSynthVolume, setIntervalSynthVolume, fretboardPlayers };
};