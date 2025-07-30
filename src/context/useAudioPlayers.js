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
        intervalSynth.current.triggerAttackRelease(notes[0], "8n", now);
        intervalSynth.current.triggerAttackRelease(notes[1], "8n", now + 0.5);
        intervalSynth.current.triggerAttackRelease(notes, "4n", now + 1.2);
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
        const quarterNoteDuration = 60 / bpm;
        const playNote = (noteId, time) => {
            const player = new Tone.Player({
                buffer: fretboardPlayers.current.player(noteId).buffer,
                fadeIn: 0.05,
                fadeOut: 0.1
            }).toDestination();
            player.volume.value = fretboardVolume;
            player.start(time);
        };
        playNote(rootNoteId, now);
        playNote(targetNoteId, now + quarterNoteDuration);
        playNote(rootNoteId, now + (2 * quarterNoteDuration));
        playNote(targetNoteId, now + (2 * quarterNoteDuration));
    }, [areFretboardSoundsReady, unlockAudio, bpm, fretboardVolume]);

    return { playInterval, playFretboardNotes, areFretboardSoundsReady, fretboardVolume, setFretboardVolume, intervalSynthVolume, setIntervalSynthVolume, fretboardPlayers };
};