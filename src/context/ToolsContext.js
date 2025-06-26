import React, { createContext, useState, useContext, useRef, useCallback, useEffect } from 'react';
import * as Tone from 'tone';

const ToolsContext = createContext(null);

export const useTools = () => useContext(ToolsContext);

export const ToolsProvider = ({ children }) => {
    // ---- Global Tool State ----
    const [activeTool, setActiveTool] = useState(null); // 'metronome', 'drone', 'timer', or null

    const toggleActiveTool = (tool) => {
        setActiveTool(prevTool => (prevTool === tool ? null : tool));
    };
    
    // ---- Metronome State ----
    const [bpm, setBpm] = useState(120);
    const [isMetronomePlaying, setIsMetronomePlaying] = useState(false);
    const metronomeIntervalRef = useRef(null);
    const metronomeSynth = useRef(null);

    // ---- Drone State ----
    const [droneNote, setDroneNote] = useState('C4');
    const [isDronePlaying, setIsDronePlaying] = useState(false);
    const droneSynth = useRef(null);
    
    // ---- Timer State ----
    const [time, setTime] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const timerIntervalRef = useRef(null);

    // Initialize Synths
    useEffect(() => {
        metronomeSynth.current = new Tone.MembraneSynth().toDestination();
        droneSynth.current = new Tone.Oscillator('C4', 'sine').toDestination();
        return () => {
            metronomeSynth.current?.dispose();
            droneSynth.current?.dispose();
        };
    }, []);

    // ---- Metronome Logic ----
    const startMetronome = useCallback(() => {
        Tone.start();
        setIsMetronomePlaying(true);
        const intervalTime = (60 / bpm) * 1000;
        metronomeSynth.current.triggerAttackRelease("C4", "8n", Tone.now());
        metronomeIntervalRef.current = setInterval(() => {
            metronomeSynth.current.triggerAttackRelease("C4", "8n", Tone.now());
        }, intervalTime);
    }, [bpm]);

    const stopMetronome = useCallback(() => {
        setIsMetronomePlaying(false);
        clearInterval(metronomeIntervalRef.current);
    }, []);

    const toggleMetronome = useCallback(() => {
        if (isMetronomePlaying) stopMetronome();
        else startMetronome();
    }, [isMetronomePlaying, startMetronome, stopMetronome]);

    useEffect(() => {
        if (isMetronomePlaying) {
            stopMetronome();
            startMetronome();
        }
    }, [bpm, isMetronomePlaying, startMetronome, stopMetronome]);

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
