// src/hooks/useRhythmEngine.js

import { useState, useMemo, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import * as Tone from 'tone';
import { useTools } from '../../context/ToolsContext';
import { NOTE_TYPES, TIME_SIGNATURES } from './rhythmConstants';

const DEFAULT_SETTINGS = {
    timeSignature: TIME_SIGNATURES[0], // 4/4
    measureCount: 1, 
    mode: 'write', 
    countdownClicks: 4,
    showBeatDisplay: true,
    useMetronome: true, // +++ FIX: Added local metronome setting
};

const createEmptyMeasure = () => ([]);

// ... (generateQuizRhythm - no changes) ...
const generateQuizRhythm = (settings) => {
    const { measureCount } = settings;
    const quizMeasures = [];
    for (let i = 0; i < measureCount; i++) {
        quizMeasures.push([
            { id: `q${i}-1`, ...NOTE_TYPES.quarter },
            { id: `q${i}-2`, ...NOTE_TYPES.quarter },
            { id: `q${i}-3`, ...NOTE_TYPES.quarter },
            { id: `q${i}-4`, ...NOTE_TYPES.quarter },
        ]);
    }
    return quizMeasures;
};

export const useRhythmEngine = () => {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [measures, setMeasures] = useState(() => 
        Array.from({ length: DEFAULT_SETTINGS.measureCount }, createEmptyMeasure)
    );
    const [quizAnswer, setQuizAnswer] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null);
    const transportEventsRef = useRef([]);

    const { 
        unlockAudio, 
        rhythmNotePlayer,
        isRhythmNoteReady,
        fretboardVolume, 
        countdownPlayers,
        metronomeVolume,
        isMetronomeReady, 
        bpm,
        setBpm,
        // +++ FIX: Removed isMetronomePlaying, startMetronome, stopMetronome +++
        metronomePlayer // +++ FIX: Added metronomePlayer for the sound +++
    } = useTools();

    // +++ FIX: Removed metronomeWasPlayingRef +++

    const beatsPerMeasure = useMemo(() => {
        // ... (no changes)
        const { beats, beatType } = settings.timeSignature;
        return (beats * (4 / beatType)); 
    }, [settings.timeSignature]);

    const measureDurations = useMemo(() => {
        // ... (no changes)
        return measures.map(measure => 
            measure.reduce((sum, item) => sum + item.duration, 0)
        );
    }, [measures]);

    const handleSettingChange = useCallback((key, value) => {
        // ... (no changes)
        setSettings(prev => {
            const newSettings = { ...prev, [key]: value };
            if (key === 'timeSignature') {
                setMeasures(Array.from({ length: newSettings.measureCount }, createEmptyMeasure));
            }
            if (key === 'measureCount') {
                const diff = value - prev.measureCount;
                if (diff > 0) {
                    setMeasures(m => [...m, ...Array.from({ length: diff }, createEmptyMeasure)]);
                }
            }
            if (key === 'mode') {
                if (value === 'read') {
                    const quiz = generateQuizRhythm(newSettings);
                    setQuizAnswer(quiz);
                    setMeasures(quiz);
                } else {
                    setMeasures(Array.from({ length: newSettings.measureCount }, createEmptyMeasure));
                }
            }
            return newSettings;
        });
    }, []);

    const removeMeasure = useCallback((measureIndex) => {
        // ... (no changes)
        setMeasures(prevMeasures => {
            if (prevMeasures.length <= 1) return prevMeasures; 
            const newMeasures = [...prevMeasures];
            newMeasures.splice(measureIndex, 1);
            setSettings(prevSettings => ({...prevSettings, measureCount: newMeasures.length }));
            return newMeasures;
        });
    }, []);

    const addRhythmItem = useCallback((measureIndex, item) => {
        // ... (no changes)
        if (settings.mode === 'read') return; 
        setMeasures(prevMeasures => {
            const newMeasures = [...prevMeasures];
            const targetMeasure = [...newMeasures[measureIndex]];
            const currentDuration = measureDurations[measureIndex];
            if (currentDuration + item.duration > beatsPerMeasure) return prevMeasures; 
            targetMeasure.push({ ...item, id: uuidv4() });
            newMeasures[measureIndex] = targetMeasure;
            return newMeasures;
        });
    }, [beatsPerMeasure, measureDurations, settings.mode]);

    const removeRhythmItem = useCallback((measureIndex, itemId) => {
        // ... (no changes)
        if (settings.mode === 'read') return;
        setMeasures(prevMeasures => {
            const newMeasures = [...prevMeasures];
            newMeasures[measureIndex] = newMeasures[measureIndex].filter(item => item.id !== itemId);
            return newMeasures;
        });
    }, [settings.mode]);
    
    const clearBoard = useCallback(() => {
        // ... (no changes)
        setMeasures(Array.from({ length: 1 }, createEmptyMeasure)); 
        setSettings(prev => ({...prev, measureCount: 1}));
        if (settings.mode === 'read') {
             handleSettingChange('mode', 'write');
        }
    }, [settings.mode, handleSettingChange]);

    // +++ FIX: Simplified stopRhythm to only control Tone.Transport +++
    const stopRhythm = useCallback(() => {
        transportEventsRef.current.forEach(eventId => Tone.Transport.clear(eventId));
        transportEventsRef.current = [];

        // Stop and reset the transport
        Tone.Transport.stop();
        Tone.Transport.cancel();
        Tone.Transport.position = 0;
        
        setCurrentlyPlayingId(null);
        setIsPlaying(false);
    }, []); // +++ FIX: Removed dependencies

    const playRhythm = useCallback(async () => {
        if (isPlaying) {
            stopRhythm();
            return;
        }
        
        transportEventsRef.current.forEach(eventId => Tone.Transport.clear(eventId));
        transportEventsRef.current = [];
        
        if (!isMetronomeReady || !isRhythmNoteReady) {
            alert("Audio is still loading, please wait a moment.");
            return;
        }

        await unlockAudio(); 
        setIsPlaying(true);

        // +++ FIX: Removed all global metronome logic (wasPlayingRef, stopMetronome()) +++

        const rhythmToPlay = settings.mode === 'read' ? quizAnswer : measures;
        const { countdownClicks, timeSignature } = settings;
        const quarterNoteDuration = 60 / bpm;
        const transport = Tone.getTransport();
        
        transport.bpm.value = bpm;
        
        transport.stop();
        transport.cancel();
        transport.position = 0;
        transport.timeSignature = [timeSignature.beats, timeSignature.beatType];
        
        const sequenceStartTime = 0.1; 
        transport.start(Tone.now(), sequenceStartTime); // Start transport at an offset to sync with AudioContext
        
        const rhythmStartTime = sequenceStartTime + (countdownClicks * quarterNoteDuration);

        // --- Countdown scheduling ---
        if (countdownClicks > 0 && countdownPlayers.current?.length > 0) {
            for (let i = 0; i < countdownClicks; i++) {
                const clickTime = sequenceStartTime + i * quarterNoteDuration;
                const eventId = transport.scheduleOnce(time => {
                    const player = countdownPlayers.current[i] || countdownPlayers.current[0];
                    if (player?.loaded) {
                        player.volume.value = metronomeVolume;
                        player.start(time);
                    }
                }, clickTime);
                transportEventsRef.current.push(eventId);
            }
        }

        // +++ FIX: Add local metronome scheduling +++
        if (settings.useMetronome && isMetronomeReady && metronomePlayer.current) {
            const measureDuration = beatsPerMeasure * quarterNoteDuration;
            const totalDuration = measureDuration * rhythmToPlay.length;
            
            // Schedule repeating clicks for the duration of the rhythm
            const metronomeEventId = transport.scheduleRepeat(time => {
                if (metronomePlayer.current?.loaded) {
                    metronomePlayer.current.volume.value = metronomeVolume;
                    metronomePlayer.current.start(time);
                }
            }, quarterNoteDuration, rhythmStartTime, totalDuration); // Schedule repeats
            
            transportEventsRef.current.push(metronomeEventId);
        }

        // --- Rhythm scheduling ---
        let scheduleTime = rhythmStartTime;
        rhythmToPlay.forEach((measure) => {
            measure.forEach((item) => {
                const itemDuration = item.duration * quarterNoteDuration;
                
                if (item.type === 'note') {
                    const eventId = transport.scheduleOnce(time => {
                        if (rhythmNotePlayer.current?.loaded) {
                            rhythmNotePlayer.current.volume.value = fretboardVolume;
                            
                            // +++ FIX 2: Schedule start AND stop +++
                            rhythmNotePlayer.current.start(time);
                            // Stop note just before its duration ends, allowing for 10ms fadeOut
                            rhythmNotePlayer.current.stop(time + itemDuration - 0.01); 
                        }
                    }, scheduleTime);
                    transportEventsRef.current.push(eventId);
                }
                
                const highlightId = transport.scheduleOnce(time => {
                    Tone.Draw.schedule(() => {
                        setCurrentlyPlayingId(item.id);
                    }, time);
                }, scheduleTime);
                transportEventsRef.current.push(highlightId);

                scheduleTime += itemDuration;
            });
        });

        // --- Cleanup event ---
        const cleanupTime = scheduleTime + 0.1;
        const cleanupEvent = transport.scheduleOnce(time => {
            Tone.Draw.schedule(() => {
                setCurrentlyPlayingId(null);
                setIsPlaying(false);
            }, time);
            
            transport.stop(time); 
            transport.scheduleOnce(() => {
                transport.cancel();
                transport.position = 0;

                // +++ FIX: Removed all global metronome logic +++

            }, time + 0.05);
            
            transportEventsRef.current.forEach(eventId => Tone.Transport.clear(eventId));
            transportEventsRef.current = [];

        }, cleanupTime); 
        
        transportEventsRef.current.push(cleanupEvent);

    }, [
        // +++ FIX: Cleaned up dependencies +++
        settings, measures, quizAnswer, isPlaying, bpm,
        unlockAudio, stopRhythm, beatsPerMeasure,
        rhythmNotePlayer, isRhythmNoteReady, fretboardVolume,
        countdownPlayers, metronomeVolume, isMetronomeReady,
        metronomePlayer // Added
    ]);

    return {
        settings,
        setSettings,
        bpm,
        setBpm,
        measures,
        measureDurations,
        beatsPerMeasure,
        isPlaying,
        currentlyPlayingId,
        isQuizMode: settings.mode === 'read',
        actions: {
            handleSettingChange,
            removeMeasure,
            addRhythmItem,
            removeRhythmItem,
            clearBoard,
            playRhythm,
            stopRhythm
        }
    };
};