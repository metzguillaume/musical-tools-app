import React, { createContext, useState, useContext, useRef, useCallback, useEffect } from 'react';
import * as Tone from 'tone';

const ToolsContext = createContext(null);

export const useTools = () => useContext(ToolsContext);

export const ToolsProvider = ({ children }) => {
    // ---- Global Tool State ----
    const [activeTool, setActiveTool] = useState(null);
    const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);

    // ---- Practice Log State ----
    const [practiceLog, setPracticeLog] = useState(() => {
        try {
            const savedLog = localStorage.getItem('practiceLog');
            return savedLog ? JSON.parse(savedLog) : [];
        } catch (error) {
            console.error("Could not parse practice log from localStorage", error);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('practiceLog', JSON.stringify(practiceLog));
        } catch (error) {
            console.error("Could not save practice log to localStorage", error);
        }
    }, [practiceLog]);

    const addLogEntry = useCallback((entry) => {
        setPracticeLog(prevLog => [...prevLog, entry]);
    }, []);

    const clearLog = useCallback(() => {
        if (window.confirm("Are you sure you want to clear the entire practice log? This cannot be undone.")) {
            setPracticeLog([]);
        }
    }, []);


    const toggleActiveTool = (tool) => {
        setActiveTool(prevTool => (prevTool === tool ? null : tool));
    };

    const unlockAudio = useCallback(() => {
        if (!isAudioUnlocked) {
            Tone.start().then(() => {
                setIsAudioUnlocked(true);
                console.log("Audio Context unlocked by user interaction.");
            }).catch(e => {
                console.error("Could not start audio context", e);
            });
        }
    }, [isAudioUnlocked]);
    
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

    // Initialize ALL audio components
    useEffect(() => {
        // --- NEW: Counter for manual load tracking ---
        let loadedDronesCount = 0;
        const notes = ['c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g', 'gs', 'a', 'as', 'b'];
        const totalDrones = notes.length;

        metronomePlayer.current = new Tone.Player({ url: `${process.env.PUBLIC_URL}/sounds/click.wav`, fadeOut: 0.1, onload: () => setIsMetronomeReady(true) }).toDestination();
        timerAlarm.current = new Tone.Player({ url: `${process.env.PUBLIC_URL}/sounds/ding.wav`, fadeOut: 0.1 }).toDestination();
        
        const players = {};
        notes.forEach(note => {
            players[note.toUpperCase().replace('S', '#')] = new Tone.Player({ 
                url: `${process.env.PUBLIC_URL}/sounds/${note}_drone.mp3`, 
                loop: true, 
                fadeOut: 3, 
                fadeIn: 3,
                // --- MODIFIED: Add onload callback for each drone ---
                onload: () => {
                    loadedDronesCount++;
                    console.log(`Loaded drone: ${note} (${loadedDronesCount}/${totalDrones})`);
                    if (loadedDronesCount === totalDrones) {
                        console.log("All drones loaded successfully.");
                        setAreDronesReady(true);
                    }
                }
            }).toDestination();
        });
        dronePlayers.current = players;

        // --- REMOVED: Unreliable Tone.loaded() call ---
        // Tone.loaded().then(() => setAreDronesReady(true));

        return () => {
            metronomePlayer.current?.dispose();
            timerAlarm.current?.dispose();
            Object.values(dronePlayers.current).forEach(player => player.dispose());
        };
    }, []);

    // ---- Volume Effects ----
    useEffect(() => { if (isMetronomeReady) metronomePlayer.current.volume.value = metronomeVolume; }, [metronomeVolume, isMetronomeReady]);
    useEffect(() => { if (areDronesReady) Object.values(dronePlayers.current).forEach(p => p.volume.value = droneVolume); }, [droneVolume, areDronesReady]);

    // ---- Metronome Logic ----
    const startMetronome = useCallback(() => {
        if (!isMetronomeReady) return;
        setIsMetronomePlaying(true);
        Tone.Transport.bpm.value = bpm;
        Tone.Transport.scheduleRepeat(time => metronomePlayer.current.start(time), "4n");
        Tone.Transport.start();
    }, [bpm, isMetronomeReady]);

    const stopMetronome = useCallback(() => {
        setIsMetronomePlaying(false);
        Tone.Transport.stop();
        Tone.Transport.cancel();
    }, []);

    const toggleMetronome = useCallback(() => {
        unlockAudio();
        if (isMetronomePlaying) stopMetronome(); else startMetronome();
    }, [isMetronomePlaying, startMetronome, stopMetronome, unlockAudio]);

    useEffect(() => { if (isMetronomePlaying) Tone.Transport.bpm.value = bpm; }, [bpm, isMetronomePlaying]);

    // ---- Drone Logic ----
    const toggleDrone = useCallback(() => {
        unlockAudio();
        if (!areDronesReady) return;
        setIsDronePlaying(prev => !prev);
    }, [areDronesReady, unlockAudio]);

    useEffect(() => {
        const currentPlayer = dronePlayers.current[droneNote];
        Object.entries(dronePlayers.current).forEach(([note, player]) => { if (note !== droneNote && player.state === 'started') player.stop(); });
        if (isDronePlaying && currentPlayer?.loaded && currentPlayer.state !== 'started') {
            currentPlayer.start();
        } else if (!isDronePlaying && currentPlayer?.state === 'started') {
            currentPlayer.stop();
        }
    }, [droneNote, isDronePlaying, areDronesReady]);

    // ---- Countdown Timer Logic ----
    useEffect(() => {
        if (isTimerRunning) {
            timerIntervalRef.current = setInterval(() => {
                setTimeLeft(t => {
                    if (t <= 1) {
                        clearInterval(timerIntervalRef.current);
                        setIsTimerRunning(false);
                        if (timerAlarm.current.loaded) timerAlarm.current.start();
                        return 0;
                    }
                    return t - 1;
                });
            }, 1000);
        } else { clearInterval(timerIntervalRef.current); }
        return () => clearInterval(timerIntervalRef.current);
    }, [isTimerRunning]);

    const toggleTimer = () => {
        unlockAudio();
        if (timeLeft > 0) setIsTimerRunning(p => !p);
    };
    
    const resetTimer = (newDuration) => { const s = (newDuration || timerDuration / 60) * 60; setIsTimerRunning(false); setTimerDuration(s); setTimeLeft(s); };

    // ---- Stopwatch Logic ----
    useEffect(() => {
        if (isStopwatchRunning) {
            stopwatchIntervalRef.current = setInterval(() => setStopwatchTime(t => t + 10), 10);
        } else { clearInterval(stopwatchIntervalRef.current); }
        return () => clearInterval(stopwatchIntervalRef.current);
    }, [isStopwatchRunning]);

    const toggleStopwatch = () => setIsStopwatchRunning(p => !p);
    const resetStopwatch = () => { setIsStopwatchRunning(false); setStopwatchTime(0); setLaps([]); };
    const addLap = () => setLaps(prevLaps => [...prevLaps, stopwatchTime]);

    const value = {
        unlockAudio, activeTool, toggleActiveTool,
        bpm, setBpm, isMetronomePlaying, toggleMetronome, metronomeVolume, setMetronomeVolume, isMetronomeReady,
        droneNote, setDroneNote, isDronePlaying, toggleDrone, droneVolume, setDroneVolume, areDronesReady,
        timeLeft, isTimerRunning, toggleTimer, resetTimer, timerDuration,
        stopwatchTime, isStopwatchRunning, laps, toggleStopwatch, resetStopwatch, addLap,
        practiceLog, addLogEntry, clearLog
    };

    return (
        <ToolsContext.Provider value={value}>
            {children}
        </ToolsContext.Provider>
    );
};