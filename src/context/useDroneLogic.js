import { useState, useRef, useCallback, useEffect } from 'react';
import * as Tone from 'tone';

export const useDroneLogic = (unlockAudio) => {
    const [droneNote, setDroneNote] = useState('C');
    const [isDronePlaying, setIsDronePlaying] = useState(false);
    const [droneVolume, setDroneVolume] = useState(-10);
    const [areDronesReady, setAreDronesReady] = useState(false);
    const dronePlayers = useRef({});

    useEffect(() => {
        const players = {};
        const notes = ['c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g', 'gs', 'a', 'as', 'b'];
        let loadedDronesCount = 0;
        notes.forEach(note => {
            players[note.toUpperCase().replace('S', '#')] = new Tone.Player({ 
                url: `${process.env.PUBLIC_URL}/sounds/${note}_drone.mp3`, 
                loop: true, fadeOut: 3, fadeIn: 3,
                onload: () => {
                    loadedDronesCount++;
                    if (loadedDronesCount === notes.length) setAreDronesReady(true);
                }
            }).toDestination();
        });
        dronePlayers.current = players;
        return () => { Object.values(dronePlayers.current).forEach(player => player.dispose()); };
    }, []);
    
    useEffect(() => { if (areDronesReady) Object.values(dronePlayers.current).forEach(p => p.volume.value = droneVolume); }, [droneVolume, areDronesReady]);

    const toggleDrone = useCallback(async () => {
        await unlockAudio();
        if (!areDronesReady) return;
        setIsDronePlaying(prev => !prev);
    }, [areDronesReady, unlockAudio]);

    const randomizeDroneNote = useCallback(() => {
        const notes = Object.keys(dronePlayers.current);
        if (notes.length === 0) return;
        let newNote;
        do {
            newNote = notes[Math.floor(Math.random() * notes.length)];
        } while (newNote === droneNote && notes.length > 1);
        setDroneNote(newNote);
    }, [droneNote]);

    useEffect(() => {
        const currentPlayer = dronePlayers.current[droneNote];
        if (isDronePlaying) {
            if (!currentPlayer || !currentPlayer.loaded) return;
            Object.values(dronePlayers.current).forEach(p => {
                if (p !== currentPlayer && p.state === 'started') p.stop();
            });
            if (currentPlayer.state !== 'started') currentPlayer.start();
        } else {
            Object.values(dronePlayers.current).forEach(p => {
                if (p.state === 'started') p.stop();
            });
        }
    }, [droneNote, isDronePlaying, areDronesReady]);

    return { droneNote, setDroneNote, isDronePlaying, toggleDrone, droneVolume, setDroneVolume, areDronesReady, randomizeDroneNote };
};