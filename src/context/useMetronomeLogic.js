// src/hooks/useMetronomeLogic.js

import { useState, useRef, useCallback, useEffect } from 'react';
import * as Tone from 'tone';

export const useMetronomeLogic = (unlockAudio) => {
    const [bpm, setBpm] = useState(120);
    const [isMetronomePlaying, setIsMetronomePlaying] = useState(false);
    const [metronomeVolume, setMetronomeVolume] = useState(-10);
    const [isMetronomeReady, setIsMetronomeReady] = useState(false);
    const [countdownClicks, setCountdownClicks] = useState(4);
    
    // Ref to hold the current countdownClicks value
    const countdownClicksRef = useRef(countdownClicks);

    const metronomePlayer = useRef(null);
    const countdownPlayers = useRef([]);
    
    // activeInterval: Remembers the last interval to prevent resets during re-renders
    const transportEventRef = useRef({ id: null, beatCounter: 0, activeInterval: null });
    const scheduledTaskRef = useRef(null); 
    
    useEffect(() => {
        countdownClicksRef.current = countdownClicks;
    }, [countdownClicks]);

    useEffect(() => {
        let clickLoaded = false;
        let countdownLoaded = false;

        const checkAllLoaded = () => {
            if (clickLoaded && countdownLoaded) {
                setIsMetronomeReady(true);
            }
        };

        metronomePlayer.current = new Tone.Player({ 
            url: `${process.env.PUBLIC_URL}/sounds/click.wav`, 
            fadeOut: 0.1, 
            onload: () => {
                clickLoaded = true;
                checkAllLoaded();
            }
        }).toDestination();
        
        let loadedCountdownCount = 0;
        const countdownFileNames = ['1.wav', '2.wav', '3.wav', '4.wav', '5.wav', '6.wav', '7.wav'];
        const totalCountdownFiles = countdownFileNames.length;
        countdownPlayers.current = countdownFileNames.map(fileName => 
            new Tone.Player({ 
                url: `${process.env.PUBLIC_URL}/sounds/${fileName}`,
                onload: () => {
                    loadedCountdownCount++;
                    if (loadedCountdownCount === totalCountdownFiles) {
                        countdownLoaded = true;
                        checkAllLoaded();
                    }
                }
            }).toDestination()
        );

        return () => {
            metronomePlayer.current?.dispose();
            countdownPlayers.current.forEach(player => player.dispose());
            if (Tone.getTransport().state === 'started') {
                Tone.getTransport().stop();
                Tone.getTransport().cancel();
            }
        };
    }, []);

    useEffect(() => { 
        if (isMetronomeReady) {
            metronomePlayer.current.volume.value = metronomeVolume;
            countdownPlayers.current.forEach(player => { player.volume.value = metronomeVolume; });
        }
    }, [metronomeVolume, isMetronomeReady]);

    const startMetronome = useCallback(() => {
        if (!isMetronomeReady) return;

        const transport = Tone.getTransport();
        transport.bpm.value = bpm;
        if (transportEventRef.current.id) transport.clear(transportEventRef.current.id);
        
        // Always reset counter when starting from a full stop
        if (transport.state === 'stopped') {
            transportEventRef.current.beatCounter = 0;
        }

        transportEventRef.current.id = transport.scheduleRepeat(time => {
            const task = scheduledTaskRef.current;
            const currentBeat = transportEventRef.current.beatCounter;

            // --- SCENARIO A: Normal Metronome (No Auto-Generate) ---
            if (!task || !task.callback || task.interval <= 0) {
                if (metronomePlayer.current && metronomePlayer.current.loaded) {
                    metronomePlayer.current.start(time);
                }
                transportEventRef.current.beatCounter++;
                return;
            }

            // --- SCENARIO B: Auto-Generate Enabled ---
            const mainInterval = task.interval;
            const countIn = countdownClicksRef.current > 0 ? countdownClicksRef.current : 0;
            const cycleLength = mainInterval + countIn;
            
            const positionInCycle = currentBeat % cycleLength;
            
            // 1. Trigger Generation
            if (positionInCycle === 0) {
                setTimeout(() => task.callback(), 0);
            }
            
            // 2. Play Sounds
            if (positionInCycle < countIn) {
                // Countdown Phase
                const countdownNumber = positionInCycle; 
                const playerIndex = countdownNumber % countdownPlayers.current.length;
                const player = countdownPlayers.current[playerIndex];

                if (player && player.loaded) {
                    player.start(time);
                } else if (metronomePlayer.current && metronomePlayer.current.loaded) {
                    metronomePlayer.current.start(time);
                }
            } else {
                // Waiting Phase
                if (metronomePlayer.current && metronomePlayer.current.loaded) {
                    metronomePlayer.current.start(time);
                }
            }

            transportEventRef.current.beatCounter++;

        }, "4n");
        
        if (transport.state !== 'started') {
            transport.start();
        }
        setIsMetronomePlaying(true);
    }, [bpm, isMetronomeReady]);

    const stopMetronome = useCallback(() => {
        const transport = Tone.getTransport();
        transport.stop();
        transport.cancel(); 
        transport.position = 0; 
        transportEventRef.current.id = null;
        transportEventRef.current.beatCounter = 0;
        transportEventRef.current.activeInterval = null;
        
        setIsMetronomePlaying(false);
    }, []);

    // FIXED: Simplified logic - only reset beat counter when interval actually changes
    const setMetronomeSchedule = useCallback((task) => {
        scheduledTaskRef.current = task;

        if (task && task.interval > 0) {
            // Only reset the beat counter if the interval has actually changed
            if (task.interval !== transportEventRef.current.activeInterval) {
                transportEventRef.current.beatCounter = 0;
                transportEventRef.current.activeInterval = task.interval;
            }
        } else {
            // Clear the schedule only when explicitly set to null
            // Don't clear activeInterval - let it persist for re-renders
            transportEventRef.current.activeInterval = null;
        }
    }, []);

    const toggleMetronome = useCallback(async () => {
        await unlockAudio();
        if (isMetronomePlaying) stopMetronome();
        else startMetronome();
    }, [isMetronomePlaying, stopMetronome, startMetronome, unlockAudio]);

    useEffect(() => { 
        if (Tone.getTransport().state === 'started') {
            Tone.getTransport().bpm.value = bpm;
        }
    }, [bpm]);

    return { 
        bpm, setBpm, 
        isMetronomePlaying, toggleMetronome, 
        startMetronome,
        stopMetronome,
        metronomeVolume, setMetronomeVolume, 
        isMetronomeReady, setMetronomeSchedule, 
        countdownClicks, setCountdownClicks,
        metronomePlayer,
        countdownPlayers
    };
};