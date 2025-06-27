import React, { createContext, useState, useContext, useRef, useCallback, useEffect } from 'react';
import * as Tone from 'tone';

const ToolsContext = createContext(null);

export const useTools = () => useContext(ToolsContext);

export const ToolsProvider = ({ children }) => {
    const [activeTool, setActiveTool] = useState(null);
    const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
    const [practiceLog, setPracticeLog] = useState(() => {
        try {
            const savedLog = localStorage.getItem('practiceLog');
            return savedLog ? JSON.parse(savedLog) : [];
        } catch (error) { return []; }
    });

    useEffect(() => {
        localStorage.setItem('practiceLog', JSON.stringify(practiceLog));
    }, [practiceLog]);

    const addLogEntry = useCallback((entry) => {
        setPracticeLog(prevLog => [...prevLog, entry]);
    }, []);

    const clearLog = useCallback(() => {
        if (window.confirm("Are you sure you want to clear the entire practice log?")) {
            setPracticeLog([]);
        }
    }, []);

    const toggleActiveTool = (tool) => {
        setActiveTool(prevTool => (prevTool === tool ? null : tool));
    };

    const unlockAudio = useCallback(async () => {
        if (isAudioUnlocked) return;
        try {
            await Tone.start();
            setIsAudioUnlocked(true);
            console.log("Audio Context unlocked and running.");
        } catch (e) {
            console.error("Could not start Audio Context", e);
        }
    }, [isAudioUnlocked]);
    
    // ---- State for all tools ----
    const [bpm, setBpm] = useState(120);
    const [isMetronomePlaying, setIsMetronomePlaying] = useState(false);
    const [metronomeVolume, setMetronomeVolume] = useState(0);
    const [isMetronomeReady, setIsMetronomeReady] = useState(false);
    const metronomePlayer = useRef(null);

    const [droneNote, setDroneNote] = useState('C');
    const [isDronePlaying, setIsDronePlaying] = useState(false);
    const [droneVolume, setDroneVolume] = useState(-10);
    const [areDronesReady, setAreDronesReady] = useState(false);
    const dronePlayers = useRef({});

    const [timerDuration, setTimerDuration] = useState(10 * 60);
    const [timeLeft, setTimeLeft] = useState(timerDuration);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const timerIntervalRef = useRef(null);
    const timerAlarm = useRef(null);

    const [stopwatchTime, setStopwatchTime] = useState(0);
    const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
    const [laps, setLaps] = useState([]);
    const stopwatchIntervalRef = useRef(null);

    // Initialize ALL audio components
    useEffect(() => {
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
                onload: () => {
                    loadedDronesCount++;
                    if (loadedDronesCount === totalDrones) {
                        setAreDronesReady(true);
                    }
                }
            }).toDestination();
        });
        dronePlayers.current = players;

        return () => {
            metronomePlayer.current?.dispose();
            timerAlarm.current?.dispose();
            Object.values(dronePlayers.current).forEach(player => player.dispose());
        };
    }, []);

    useEffect(() => { if (isMetronomeReady) metronomePlayer.current.volume.value = metronomeVolume; }, [metronomeVolume, isMetronomeReady]);
    useEffect(() => { if (areDronesReady) Object.values(dronePlayers.current).forEach(p => p.volume.value = droneVolume); }, [droneVolume, areDronesReady]);

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

    const toggleMetronome = useCallback(async () => {
        await unlockAudio();
        if (isMetronomePlaying) stopMetronome(); else startMetronome();
    }, [isMetronomePlaying, startMetronome, stopMetronome, unlockAudio]);

    useEffect(() => { if (isMetronomePlaying) Tone.Transport.bpm.value = bpm; }, [bpm, isMetronomePlaying]);

    const toggleDrone = useCallback(async () => {
        await unlockAudio();
        if (!areDronesReady) return;
        setIsDronePlaying(prev => !prev);
    }, [areDronesReady, unlockAudio]);

    // --- MODIFIED: This entire block is restructured to correctly handle stopping the drone ---
    useEffect(() => {
        const currentPlayer = dronePlayers.current[droneNote];

        if (isDronePlaying) {
            // This is the PLAY logic
            if (!currentPlayer || !currentPlayer.loaded) return;

            // Stop other drones before starting the new one
            Object.values(dronePlayers.current).forEach(p => {
                if (p !== currentPlayer && p.state === 'started') {
                    p.stop();
                }
            });
            
            // Start the current player if it's not already started
            if (currentPlayer.state !== 'started') {
                currentPlayer.start();
            }
        } else {
            // This is the STOP logic
            // Stop any drone that is currently playing
            Object.values(dronePlayers.current).forEach(p => {
                if (p.state === 'started') {
                    p.stop();
                }
            });
        }
    }, [droneNote, isDronePlaying, areDronesReady]);


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

    const toggleTimer = useCallback(async () => {
        await unlockAudio();
        if (timeLeft > 0) setIsTimerRunning(p => !p);
    }, [timeLeft, unlockAudio]);
    
    const resetTimer = (newDuration) => { 
        const s = (newDuration || timerDuration / 60) * 60; 
        setIsTimerRunning(false); 
        setTimerDuration(s); 
        setTimeLeft(s); 
    };

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