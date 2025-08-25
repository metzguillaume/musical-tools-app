import { useState, useRef, useCallback, useEffect } from 'react';
import * as Tone from 'tone';

export const useMetronomeLogic = (unlockAudio) => {
    const [bpm, setBpm] = useState(120);
    const [isMetronomePlaying, setIsMetronomePlaying] = useState(false);
    const [metronomeVolume, setMetronomeVolume] = useState(-10);
    const [isMetronomeReady, setIsMetronomeReady] = useState(false);
    const [countdownClicks, setCountdownClicks] = useState(4);
    
    const metronomePlayer = useRef(null);
    const countdownPlayers = useRef([]);
    const transportEventRef = useRef({ id: null, beatCounter: 0 });
    const scheduledTaskRef = useRef(null); 

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
        
        if (transport.state === 'stopped') {
            transportEventRef.current.beatCounter = 0;
        }

        transportEventRef.current.id = transport.scheduleRepeat(time => {
            const task = scheduledTaskRef.current;
            if (!task || !task.callback || task.interval <= 0) {
                // MODIFIED: Added safety check
                if (metronomePlayer.current && metronomePlayer.current.loaded) {
                    metronomePlayer.current.start(time);
                }
                return;
            }
            const mainInterval = task.interval;
            const countIn = countdownClicks > 0 ? countdownClicks : 0;
            const cycleLength = mainInterval + countIn;
            const positionInCycle = transportEventRef.current.beatCounter % cycleLength;
            
            if (positionInCycle === 0) task.callback();
            
            if (positionInCycle < countIn) {
                const countdownNumber = positionInCycle;
                const player = countdownPlayers.current[countdownNumber];
                // MODIFIED: Added safety check
                if (player && player.loaded) {
                    player.start(time);
                } else if (metronomePlayer.current && metronomePlayer.current.loaded) {
                    metronomePlayer.current.start(time);
                }
            } else {
                // MODIFIED: Added safety check
                if (metronomePlayer.current && metronomePlayer.current.loaded) {
                    metronomePlayer.current.start(time);
                }
            }
            transportEventRef.current.beatCounter++;
        }, "4n");
        
        if (transport.state !== 'started') {
            transport.start(Tone.now() + 0.1);
        }
        setIsMetronomePlaying(true);
    }, [bpm, isMetronomeReady, countdownClicks]);

    const stopMetronome = useCallback(() => {
        const transport = Tone.getTransport();
        transport.stop();
        transport.cancel(); 
        transport.position = 0; 
        transportEventRef.current.id = null;
        transportEventRef.current.beatCounter = 0;
        setIsMetronomePlaying(false);
    }, []);

    const setMetronomeSchedule = useCallback((task) => {
        const wasPlaying = Tone.getTransport().state === 'started';
        if (wasPlaying) {
            stopMetronome();
        }
        scheduledTaskRef.current = task;
        if (wasPlaying) {
             setTimeout(() => { startMetronome(); }, 50);
        }
    }, [startMetronome, stopMetronome]);

    const toggleMetronome = useCallback(async () => {
        await unlockAudio();
        if (isMetronomePlaying) stopMetronome();
        else startMetronome();
    }, [isMetronomePlaying, stopMetronome, startMetronome, unlockAudio]);

    useEffect(() => { 
        if (isMetronomePlaying) Tone.getTransport().bpm.value = bpm;
    }, [bpm, isMetronomePlaying]);

    return { bpm, setBpm, isMetronomePlaying, toggleMetronome, metronomeVolume, setMetronomeVolume, isMetronomeReady, setMetronomeSchedule, countdownClicks, setCountdownClicks };
};