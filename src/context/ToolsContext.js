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
    const [metronomeVolume, setMetronomeVolume] = useState(0);
    const [isMetronomeReady, setIsMetronomeReady] = useState(false);
    const metronomePlayer = useRef(null);

    // ---- Drone State ----
    const [droneNote, setDroneNote] = useState('C');
    const [isDronePlaying, setIsDronePlaying] = useState(false);
    const [droneVolume, setDroneVolume] = useState(-10);
    const [areDronesReady, setAreDronesReady] = useState(false);
    const dronePlayers = useRef({});

    // ---- Timer State ----
    const [timerDuration, setTimerDuration] = useState(10 * 60);
    const [timeLeft, setTimeLeft] = useState(timerDuration);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const timerIntervalRef = useRef(null);
    const timerAlarm = useRef(null);

    // ---- Stopwatch State ----
    const [stopwatchTime, setStopwatchTime] = useState(0);
    const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
    const [laps, setLaps] = useState([]);
    const stopwatchIntervalRef = useRef(null);

    // ---- Practice Log State ----
    const [practiceLog, setPracticeLog] = useState(() => {
        try {
            const savedLog = localStorage.getItem('musical-tools-log');
            return savedLog ? JSON.parse(savedLog) : [];
        } catch (error) {
            console.error("Could not load practice log from localStorage", error);
            return [];
        }
    });

    const addLogEntry = (entry) => {
        const newLog = [...practiceLog, entry];
        setPracticeLog(newLog);
        try {
            localStorage.setItem('musical-tools-log', JSON.stringify(newLog));
        } catch (error) {
            console.error("Could not save practice log to localStorage", error);
        }
    };

    const clearLog = () => {
        setPracticeLog([]);
        try {
            localStorage.removeItem('musical-tools-log');
        } catch (error) {
            console.error("Could not clear practice log from localStorage", error);
        }
    };


    // Initialize ALL audio components
    useEffect(() => {
        // Metronome, Timer, and Drone setup...
        metronomePlayer.current = new Tone.Player({ url: `${process.env.PUBLIC_URL}/sounds/click.wav`, fadeOut: 0.1, onload: () => setIsMetronomeReady(true) }).toDestination();
        timerAlarm.current = new Tone.Player({ url: `${process.env.PUBLIC_URL}/sounds/ding.wav`, fadeOut: 0.1, }).toDestination();
        const notes = ['c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g', 'gs', 'a', 'as', 'b'];
        const players = {};
        notes.forEach(note => {
            players[note.toUpperCase().replace('S', '#')] = new Tone.Player({ url: `${process.env.PUBLIC_URL}/sounds/${note}_drone.mp3`, loop: true, fadeOut: 3, fadeIn: 3 }).toDestination();
        });
        dronePlayers.current = players;
        Tone.loaded().then(() => setAreDronesReady(true));

        return () => {
            metronomePlayer.current?.dispose();
            timerAlarm.current?.dispose();
            Object.values(dronePlayers.current).forEach(player => player.dispose());
        };
    }, []);

    // ---- All other useEffect hooks and logic for tools...
    useEffect(() => { if (isMetronomeReady) metronomePlayer.current.volume.value = metronomeVolume; }, [metronomeVolume, isMetronomeReady]);
    useEffect(() => { if (areDronesReady) Object.values(dronePlayers.current).forEach(p => p.volume.value = droneVolume); }, [droneVolume, areDronesReady]);
    const startMetronome = useCallback(() => { if (!isMetronomeReady) return; Tone.start(); setIsMetronomePlaying(true); Tone.Transport.bpm.value = bpm; Tone.Transport.scheduleRepeat(t => metronomePlayer.current.start(t), "4n"); Tone.Transport.start(); }, [bpm, isMetronomeReady]);
    const stopMetronome = useCallback(() => { setIsMetronomePlaying(false); Tone.Transport.stop(); Tone.Transport.cancel(); }, []);
    const toggleMetronome = useCallback(() => { if (isMetronomePlaying) stopMetronome(); else startMetronome(); }, [isMetronomePlaying, startMetronome, stopMetronome]);
    useEffect(() => { if (isMetronomePlaying) Tone.Transport.bpm.value = bpm; }, [bpm, isMetronomePlaying]);
    const toggleDrone = useCallback(() => { if (!areDronesReady) return; setIsDronePlaying(p => !p); }, [areDronesReady]);
    useEffect(() => { const p = dronePlayers.current[droneNote]; Object.entries(dronePlayers.current).forEach(([n, pl]) => { if (n !== droneNote && pl.state === 'started') pl.stop(); }); if (isDronePlaying && p?.loaded && p.state !== 'started') { Tone.start().then(() => p.start()); } else if (!isDronePlaying && p?.state === 'started') { p.stop(); } }, [droneNote, isDronePlaying, areDronesReady]);
    useEffect(() => { if (isTimerRunning) { timerIntervalRef.current = setInterval(() => setTimeLeft(t => { if (t <= 1) { clearInterval(timerIntervalRef.current); setIsTimerRunning(false); if (timerAlarm.current.loaded) timerAlarm.current.start(); return 0; } return t - 1; }), 1000); } else { clearInterval(timerIntervalRef.current); } return () => clearInterval(timerIntervalRef.current); }, [isTimerRunning]);
    const toggleTimer = () => { if (timeLeft > 0) setIsTimerRunning(p => !p); };
    const resetTimer = (d) => { const s = (d || timerDuration / 60) * 60; setIsTimerRunning(false); setTimerDuration(s); setTimeLeft(s); };
    useEffect(() => { if (isStopwatchRunning) { stopwatchIntervalRef.current = setInterval(() => setStopwatchTime(t => t + 10), 10); } else { clearInterval(stopwatchIntervalRef.current); } return () => clearInterval(stopwatchIntervalRef.current); }, [isStopwatchRunning]);
    const toggleStopwatch = () => setIsStopwatchRunning(p => !p);
    const resetStopwatch = () => { setIsStopwatchRunning(false); setStopwatchTime(0); setLaps([]); };
    const addLap = () => setLaps(p => [...p, stopwatchTime]);

    const value = {
        activeTool, toggleActiveTool,
        bpm, setBpm, isMetronomePlaying, toggleMetronome, metronomeVolume, setMetronomeVolume, isMetronomeReady,
        droneNote, setDroneNote, isDronePlaying, toggleDrone, droneVolume, setDroneVolume, areDronesReady,
        timeLeft, isTimerRunning, toggleTimer, resetTimer, timerDuration,
        stopwatchTime, isStopwatchRunning, laps, toggleStopwatch, resetStopwatch, addLap,
        practiceLog, addLogEntry, clearLog,
    };

    return (
        <ToolsContext.Provider value={value}>
            {children}
        </ToolsContext.Provider>
    );
};
