import React, { createContext, useState, useContext, useRef, useCallback, useEffect } from 'react';
import * as Tone from 'tone';

const ToolsContext = createContext(null);

export const useTools = () => useContext(ToolsContext);

export const ToolsProvider = ({ children }) => {
    // ---- Global Tool State ----
    const [activeTool, setActiveTool] = useState(null);

    const toggleActiveTool = (tool) => {
        setActiveTool(prevTool => (prevTool === tool ? null : tool));
    };
    
    // ---- Metronome State ----
    const [bpm, setBpm] = useState(120);
    const [isMetronomePlaying, setIsMetronomePlaying] = useState(false);
    const [metronomeVolume, setMetronomeVolume] = useState(0); // Volume in dB
    const [isMetronomeReady, setIsMetronomeReady] = useState(false); // NEW: Tracks if the sound is loaded
    const metronomePlayer = useRef(null);

    // ---- Drone State ----
    const [droneNote, setDroneNote] = useState('C4');
    const [isDronePlaying, setIsDronePlaying] = useState(false);
    const [droneVolume, setDroneVolume] = useState(-10); // Volume in dB for a quieter default
    const droneSynth = useRef(null);
    
    // ---- Timer State ----
    const [time, setTime] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const timerIntervalRef = useRef(null);

    // Initialize Synths and Players ONCE on component mount
    useEffect(() => {
        // Create the metronome player and set an onload callback
        metronomePlayer.current = new Tone.Player({
            url: `${process.env.PUBLIC_URL}/sounds/click.wav`,
            fadeOut: 0.1,
            onload: () => {
                setIsMetronomeReady(true); // Set ready state when the sound file is loaded
                console.log("Metronome sound loaded.");
            }
        }).toDestination();

        // Create the drone synth
        droneSynth.current = new Tone.Oscillator('C4', 'sine').toDestination();
        
        // Cleanup on unmount
        return () => {
            metronomePlayer.current?.dispose();
            droneSynth.current?.dispose();
        };
    }, []); // Empty dependency array ensures this runs only once

    // ---- Volume Effects ----
    // This effect now ONLY updates the volume, it doesn't re-create the player
    useEffect(() => {
        if (isMetronomeReady) {
            metronomePlayer.current.volume.value = metronomeVolume;
        }
    }, [metronomeVolume, isMetronomeReady]);

    useEffect(() => {
        if (droneSynth.current) {
            droneSynth.current.volume.value = droneVolume;
        }
    }, [droneVolume]);


    // ---- Metronome Logic ----
    const startMetronome = useCallback(() => {
        // Guard against trying to play before the sound is loaded
        if (!isMetronomeReady) {
             console.log("Metronome sound not loaded yet.");
             return;
        }
        Tone.start();
        setIsMetronomePlaying(true);
        Tone.Transport.bpm.value = bpm;
        Tone.Transport.scheduleRepeat(time => {
            metronomePlayer.current.start(time);
        }, "4n");
        Tone.Transport.start();
    }, [bpm, isMetronomeReady]);

    const stopMetronome = useCallback(() => {
        setIsMetronomePlaying(false);
        Tone.Transport.stop();
        Tone.Transport.cancel();
    }, []);

    const toggleMetronome = useCallback(() => {
        if (isMetronomePlaying) stopMetronome();
        else startMetronome();
    }, [isMetronomePlaying, startMetronome, stopMetronome]);

    useEffect(() => {
        if (isMetronomePlaying) {
            Tone.Transport.bpm.value = bpm;
        }
    }, [bpm, isMetronomePlaying]);

    // ---- Drone Logic ----
    const toggleDrone = useCallback(() => {
        if (isDronePlaying) {
            droneSynth.current.stop();
            setIsDronePlaying(false);
        } else {
            Tone.start();
            droneSynth.current.frequency.value = droneNote;
            droneSynth.current.start();
            setIsDronePlaying(true);
        }
    }, [isDronePlaying, droneNote]);
    
    useEffect(() => {
        if (isDronePlaying) {
            droneSynth.current.frequency.value = droneNote;
        }
    }, [droneNote, isDronePlaying]);


    // ---- Timer Logic ----
    useEffect(() => {
        if (isTimerRunning) {
            timerIntervalRef.current = setInterval(() => {
                setTime(prevTime => prevTime + 1);
            }, 1000);
        } else {
            clearInterval(timerIntervalRef.current);
        }
        return () => clearInterval(timerIntervalRef.current);
    }, [isTimerRunning]);

    const toggleTimer = () => setIsTimerRunning(prev => !prev);
    const resetTimer = () => {
        setIsTimerRunning(false);
        setTime(0);
    };

    const value = {
        activeTool, toggleActiveTool,
        bpm, setBpm, isMetronomePlaying, toggleMetronome, metronomeVolume, setMetronomeVolume, isMetronomeReady,
        droneNote, setDroneNote, isDronePlaying, toggleDrone, droneVolume, setDroneVolume,
        time, isTimerRunning, toggleTimer, resetTimer,
    };

    return (
        <ToolsContext.Provider value={value}>
            {children}
        </ToolsContext.Provider>
    );
};
