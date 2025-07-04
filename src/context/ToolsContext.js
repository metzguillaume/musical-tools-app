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
    // --- FIX: Refs to manage scheduled tasks and beat counting ---
    const transportEventRef = useRef({ id: null, beatCounter: 0 });
    const scheduledTaskRef = useRef(null); // Will hold { callback, interval }

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

    const intervalSynth = useRef(null);

    useEffect(() => {
        let loadedDronesCount = 0;
        const notes = ['c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g', 'gs', 'a', 'as', 'b'];
        const totalDrones = notes.length;

        metronomePlayer.current = new Tone.Player({ url: `${process.env.PUBLIC_URL}/sounds/click.wav`, fadeOut: 0.1, onload: () => setIsMetronomeReady(true) }).toDestination();
        timerAlarm.current = new Tone.Player({ url: `${process.env.PUBLIC_URL}/sounds/ding.wav`, fadeOut: 0.1 }).toDestination();
        
        intervalSynth.current = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'sine' },
            envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 },
        }).toDestination();
        intervalSynth.current.volume.value = 5;

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
            intervalSynth.current?.dispose();
        };
    }, []);

    useEffect(() => { if (isMetronomeReady) metronomePlayer.current.volume.value = metronomeVolume; }, [metronomeVolume, isMetronomeReady]);
    useEffect(() => { if (areDronesReady) Object.values(dronePlayers.current).forEach(p => p.volume.value = droneVolume); }, [droneVolume, areDronesReady]);

    // --- FIX: New function to allow components to set a scheduled task ---
    const setMetronomeSchedule = useCallback((task) => {
        scheduledTaskRef.current = task;
    }, []);

    // --- FIX: Upgraded startMetronome to handle custom scheduled tasks ---
    const startMetronome = useCallback(() => {
        if (!isMetronomeReady) return;
        
        Tone.Transport.bpm.value = bpm;
        if (transportEventRef.current.id) {
            Tone.Transport.clear(transportEventRef.current.id);
        }
        
        transportEventRef.current.beatCounter = 0;

        transportEventRef.current.id = Tone.Transport.scheduleRepeat(time => {
            transportEventRef.current.beatCounter++;
            
            // UI updates should be scheduled with Tone.Draw to sync with audio
            Tone.Draw.schedule(() => {
                metronomePlayer.current.start(time);
                const task = scheduledTaskRef.current;
                if (task && task.callback && task.interval > 0) {
                    if (transportEventRef.current.beatCounter % task.interval === 0) {
                        task.callback();
                    }
                }
            }, time);
        }, "4n");
        
        Tone.Transport.start();
        setIsMetronomePlaying(true);
    }, [bpm, isMetronomeReady]);

    const stopMetronome = useCallback(() => {
        Tone.Transport.stop();
        if (transportEventRef.current.id) {
            Tone.Transport.clear(transportEventRef.current.id);
            transportEventRef.current.id = null;
        }
        setIsMetronomePlaying(false);
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

    useEffect(() => {
        const currentPlayer = dronePlayers.current[droneNote];
        if (isDronePlaying) {
            if (!currentPlayer || !currentPlayer.loaded) return;
            Object.values(dronePlayers.current).forEach(p => {
                if (p !== currentPlayer && p.state === 'started') {
                    p.stop();
                }
            });
            if (currentPlayer.state !== 'started') {
                currentPlayer.start();
            }
        } else {
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
    
    useEffect(() => {
        if (isStopwatchRunning) {
            stopwatchIntervalRef.current = setInterval(() => {
                setStopwatchTime(prevTime => prevTime + 10);
            }, 10);
        } else {
            clearInterval(stopwatchIntervalRef.current);
        }
        return () => clearInterval(stopwatchIntervalRef.current);
    }, [isStopwatchRunning]);

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

    const playInterval = useCallback(async (notes) => {
        if (!notes || notes.length < 2) return;
        await unlockAudio();
        
        const now = Tone.now();
        intervalSynth.current.triggerAttackRelease(notes[0], "8n", now);
        intervalSynth.current.triggerAttackRelease(notes[1], "8n", now + 0.5);
        intervalSynth.current.triggerAttackRelease(notes, "4n", now + 1.2);

    }, [unlockAudio]);

    const value = {
        unlockAudio, activeTool, toggleActiveTool,
        // Add the new scheduler function and metronome playing state to the context value
        bpm, setBpm, isMetronomePlaying, toggleMetronome, metronomeVolume, setMetronomeVolume, isMetronomeReady, setMetronomeSchedule,
        droneNote, setDroneNote, isDronePlaying, toggleDrone, droneVolume, setDroneVolume, areDronesReady,
        timeLeft, isTimerRunning, toggleTimer, resetTimer, timerDuration,
        stopwatchTime, isStopwatchRunning, laps, toggleStopwatch, resetStopwatch, addLap,
        practiceLog, addLogEntry, clearLog,
        playInterval,
    };

    return (
        <ToolsContext.Provider value={value}>
            {children}
        </ToolsContext.Provider>
    );
};