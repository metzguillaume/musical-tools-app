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
    const metronomePlayer = useRef(null); // Changed from synth to player

    // ---- Drone State ----
    const [droneNote, setDroneNote] = useState('C4');
    const [isDronePlaying, setIsDronePlaying] = useState(false);
    const droneSynth = useRef(null);
    
    // ---- Timer State ----
    const [time, setTime] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const timerIntervalRef = useRef(null);

    // Initialize Synths and Players
    useEffect(() => {
        // Use Tone.Player for the metronome, pointing to the file in the public folder
        metronomePlayer.current = new Tone.Player({
            url: `${process.env.PUBLIC_URL}/sounds/click.wav`,
            fadeOut: 0.1,
        }).toDestination();

        droneSynth.current = new Tone.Oscillator('C4', 'sine').toDestination();
        
        return () => {
            metronomePlayer.current?.dispose();
            droneSynth.current?.dispose();
        };
    }, []);

    // ---- Metronome Logic ----
    const startMetronome = useCallback(() => {
        if (!metronomePlayer.current || metronomePlayer.current.loaded === false) {
             console.log("Metronome sound not loaded yet.");
             return;
        }
        Tone.start();
        setIsMetronomePlaying(true);
        // Use Tone.Transport to schedule the clicks precisely
        Tone.Transport.bpm.value = bpm;
        Tone.Transport.scheduleRepeat(time => {
            metronomePlayer.current.start(time);
        }, "4n"); // "4n" means every quarter note
        Tone.Transport.start();
    }, [bpm]);

    const stopMetronome = useCallback(() => {
        setIsMetronomePlaying(false);
        Tone.Transport.stop();
        Tone.Transport.cancel(); // Clear the scheduled events
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
        bpm, setBpm, isMetronomePlaying, toggleMetronome,
        droneNote, setDroneNote, isDronePlaying, toggleDrone,
        time, isTimerRunning, toggleTimer, resetTimer,
    };

    return (
        <ToolsContext.Provider value={value}>
            {children}
        </ToolsContext.Provider>
    );
};
