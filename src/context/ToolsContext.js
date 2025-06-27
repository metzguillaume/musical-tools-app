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
    const [droneNote, setDroneNote] = useState('C'); // Note name, e.g., 'C', 'C#'
    const [isDronePlaying, setIsDronePlaying] = useState(false);
    const [droneVolume, setDroneVolume] = useState(-10);
    const [areDronesReady, setAreDronesReady] = useState(false);
    const dronePlayers = useRef({}); // Will hold all 12 player objects

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
        // Metronome Player
        metronomePlayer.current = new Tone.Player({
            url: `${process.env.PUBLIC_URL}/sounds/click.wav`,
            fadeOut: 0.1,
            onload: () => setIsMetronomeReady(true)
        }).toDestination();

        // Timer Alarm Player
        timerAlarm.current = new Tone.Player({
            url: `${process.env.PUBLIC_URL}/sounds/ding.wav`,
            fadeOut: 0.1,
        }).toDestination();

        // Drone Players
        const notes = ['c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g', 'gs', 'a', 'as', 'b'];
        const players = {};
        notes.forEach(note => {
            players[note.toUpperCase().replace('S', '#')] = new Tone.Player({
                url: `${process.env.PUBLIC_URL}/sounds/${note}_drone.mp3`,
                loop: true,
                fadeOut: 3, // Increased crossfade duration
                fadeIn: 3 // Increased initial fade-in duration
            }).toDestination();
        });
        dronePlayers.current = players;

        // Wait for all drone files to load
        Tone.loaded().then(() => {
            console.log("All drone sounds loaded.");
            setAreDronesReady(true);
        });

        return () => {
            metronomePlayer.current?.dispose();
            timerAlarm.current?.dispose();
            Object.values(dronePlayers.current).forEach(player => player.dispose());
        };
    }, []);

    // ---- Volume Effects ----
    useEffect(() => {
        if (isMetronomeReady) metronomePlayer.current.volume.value = metronomeVolume;
    }, [metronomeVolume, isMetronomeReady]);

    useEffect(() => {
        if (areDronesReady) {
            Object.values(dronePlayers.current).forEach(player => {
                player.volume.value = droneVolume;
            });
        }
    }, [droneVolume, areDronesReady]);

    // ---- Metronome Logic ----
    const startMetronome = useCallback(() => {
        if (!isMetronomeReady) return;
        Tone.start();
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
        if (isMetronomePlaying) stopMetronome(); else startMetronome();
    }, [isMetronomePlaying, startMetronome, stopMetronome]);

    useEffect(() => {
        if (isMetronomePlaying) Tone.Transport.bpm.value = bpm;
    }, [bpm, isMetronomePlaying]);

    // ---- Drone Logic ----
    const toggleDrone = useCallback(() => {
        if (!areDronesReady) return;
        setIsDronePlaying(prev => !prev);
    }, [areDronesReady]);

    useEffect(() => {
        // This effect handles starting/stopping and switching drones
        const currentPlayer = dronePlayers.current[droneNote];
        
        // Stop all other drones to prevent overlap
        Object.entries(dronePlayers.current).forEach(([note, player]) => {
            if (note !== droneNote && player.state === 'started') {
                player.stop();
            }
        });

        if (isDronePlaying && currentPlayer && currentPlayer.loaded) {
            if (currentPlayer.state !== 'started') {
                Tone.start().then(() => {
                    currentPlayer.start();
                });
            }
        } else if (!isDronePlaying && currentPlayer && currentPlayer.state === 'started') {
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
        } else {
            clearInterval(timerIntervalRef.current);
        }
        return () => clearInterval(timerIntervalRef.current);
    }, [isTimerRunning]);

    const toggleTimer = () => {
        if (timeLeft > 0) setIsTimerRunning(p => !p);
    };
    const resetTimer = (newDuration) => {
        const durationInSeconds = (newDuration || timerDuration / 60) * 60;
        setIsTimerRunning(false);
        setTimerDuration(durationInSeconds);
        setTimeLeft(durationInSeconds);
    };

    // ---- Stopwatch Logic ----
    useEffect(() => {
        if (isStopwatchRunning) {
            stopwatchIntervalRef.current = setInterval(() => setStopwatchTime(t => t + 10), 10);
        } else {
            clearInterval(stopwatchIntervalRef.current);
        }
        return () => clearInterval(stopwatchIntervalRef.current);
    }, [isStopwatchRunning]);

    const toggleStopwatch = () => setIsStopwatchRunning(p => !p);
    const resetStopwatch = () => {
        setIsStopwatchRunning(false);
        setStopwatchTime(0);
        setLaps([]);
    };
    const addLap = () => {
        setLaps(prevLaps => [...prevLaps, stopwatchTime]);
    };

    const value = {
        activeTool, toggleActiveTool,
        bpm, setBpm, isMetronomePlaying, toggleMetronome, metronomeVolume, setMetronomeVolume, isMetronomeReady,
        droneNote, setDroneNote, isDronePlaying, toggleDrone, droneVolume, setDroneVolume, areDronesReady,
        timeLeft, isTimerRunning, toggleTimer, resetTimer, timerDuration,
        stopwatchTime, isStopwatchRunning, laps, toggleStopwatch, resetStopwatch, addLap,
    };

    return (
        <ToolsContext.Provider value={value}>
            {children}
        </ToolsContext.Provider>
    );
};
