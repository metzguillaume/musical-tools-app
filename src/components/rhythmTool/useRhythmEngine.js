// src/hooks/useRhythmEngine.js

import { useState, useMemo, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import * as Tone from 'tone';
import { useTools } from '../../context/ToolsContext';
import { NOTE_TYPES, TIME_SIGNATURES, RHYTHM_BANK, ALL_RHYTHM_TYPES, REST_TYPES } from './rhythmConstants';

const DEFAULT_SETTINGS = {
    timeSignature: TIME_SIGNATURES[0], // 4/4
    measureCount: 1, 
    mode: 'write', 
    countdownClicks: 4,
    showBeatDisplay: true,
    useMetronome: true,
    quizDifficulty: 'level1', 
    writeMeasureCount: 1, 
};

const createEmptyMeasure = () => ([]);

const generateQuizRhythm = (settings) => {
    // ... (This function is unchanged)
    const { quizDifficulty, timeSignature } = settings;
    const measureCount = 2;
    const beatsPerMeasure = (timeSignature.beats * (4 / timeSignature.beatType));
    const allowedItemKeys = RHYTHM_BANK[quizDifficulty]?.items || RHYTHM_BANK['level1'].items;
    const possibleItems = allowedItemKeys
        .map(key => ({ id: key, ...ALL_RHYTHM_TYPES[key] }))
        .filter(item => item.duration <= beatsPerMeasure);
    if (possibleItems.length === 0) {
        return Array.from({ length: measureCount }, () => [{ id: `q-1`, ...NOTE_TYPES.quarter }]);
    }
    const quizMeasures = [];
    for (let i = 0; i < measureCount; i++) {
        let currentMeasure = [];
        let currentDuration = 0;
        let attempts = 0;
        while (currentDuration < beatsPerMeasure && attempts < 20) {
            const remainingDuration = beatsPerMeasure - currentDuration;
            const validItems = possibleItems.filter(item => item.duration <= remainingDuration + 0.001);
            if (validItems.length === 0) {
                 if (remainingDuration >= 0.25) {
                    const restKey = Object.keys(REST_TYPES).find(k => REST_TYPES[k].duration === remainingDuration) || 'quarterRest';
                    currentMeasure.push({ id: uuidv4(), ...ALL_RHYTHM_TYPES[restKey] });
                }
                break; 
            }
            const randomItem = validItems[Math.floor(Math.random() * validItems.length)];
            currentMeasure.push({ ...randomItem, id: uuidv4() });
            currentDuration += randomItem.duration;
            attempts++;
        }
        quizMeasures.push(currentMeasure);
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
        metronomePlayer
    } = useTools();

    const beatsPerMeasure = useMemo(() => {
        const { beats, beatType } = settings.timeSignature;
        return (beats * (4 / beatType)); 
    }, [settings.timeSignature]);

    const measureDurations = useMemo(() => {
        return measures.map(measure => 
            measure.reduce((sum, item) => sum + item.duration, 0)
        );
    }, [measures]);

    const generateNewQuiz = useCallback(() => {
        setSettings(prevSettings => {
            const quiz = generateQuizRhythm(prevSettings);
            setQuizAnswer(quiz);
            setMeasures(quiz);
            return prevSettings; 
        });
    }, []); 

    const handleSettingChange = useCallback((key, value) => {
        setSettings(prev => {
            let newSettings = { ...prev, [key]: value };

            if (key === 'measureCount' && prev.mode === 'read') {
                return prev; 
            }
            
            if (key === 'measureCount') {
                const newCount = value;
                newSettings.writeMeasureCount = newCount;
                setMeasures(m => {
                    const diff = newCount - m.length;
                    if (diff > 0) {
                        return [...m, ...Array.from({ length: diff }, createEmptyMeasure)];
                    }
                    return m;
                });
                return { ...newSettings, measureCount: newCount };
            }
            
            if ( (key === 'timeSignature' || key === 'quizDifficulty') && newSettings.mode === 'read' ) {
                const quiz = generateQuizRhythm(newSettings);
                setQuizAnswer(quiz);
                setMeasures(quiz);
            }

            if (key === 'mode') {
                if (value === 'read') {
                    const quizSettings = {...newSettings, measureCount: 2}; 
                    const quiz = generateQuizRhythm(quizSettings);
                    setQuizAnswer(quiz);
                    setMeasures(quiz);
                    return quizSettings; 
                } else {
                    const writeCount = prev.writeMeasureCount || 1;
                    setMeasures(Array.from({ length: writeCount }, createEmptyMeasure));
                    return {...newSettings, measureCount: writeCount};
                }
            }
            return newSettings;
        });
    }, []);

    const removeMeasure = useCallback((measureIndex) => {
        setMeasures(prevMeasures => {
            if (prevMeasures.length <= 1) return prevMeasures; 
            const newMeasures = [...prevMeasures];
            newMeasures.splice(measureIndex, 1);
            setSettings(prevSettings => ({...prevSettings, measureCount: newMeasures.length, writeMeasureCount: newMeasures.length }));
            return newMeasures;
        });
    }, []);

    const addRhythmItem = useCallback((measureIndex, item) => {
        if (settings.mode === 'read') return; 
        setMeasures(prevMeasures => {
            const newMeasures = [...prevMeasures];
            const targetMeasure = [...newMeasures[measureIndex]];
            const currentDuration = measureDurations[measureIndex];
            
            if (currentDuration + item.duration > beatsPerMeasure + 0.001) return prevMeasures; 

            targetMeasure.push({ ...item, id: uuidv4() });
            newMeasures[measureIndex] = targetMeasure;
            return newMeasures;
        });
    }, [beatsPerMeasure, measureDurations, settings.mode]);

    const removeLastRhythmItem = useCallback((measureIndex) => {
        if (settings.mode === 'read') return;
        setMeasures(prevMeasures => {
            const newMeasures = [...prevMeasures];
            const targetMeasure = [...newMeasures[measureIndex]];
            if (targetMeasure.length > 0) {
                targetMeasure.pop(); 
                newMeasures[measureIndex] = targetMeasure;
            }
            return newMeasures;
        });
    }, [settings.mode]);

    const clearMeasure = useCallback((measureIndex) => {
        if (settings.mode === 'read') return;
        setMeasures(prevMeasures => {
            const newMeasures = [...prevMeasures];
            newMeasures[measureIndex] = []; 
            return newMeasures;
        });
    }, [settings.mode]);
    
    const clearBoard = useCallback(() => {
        setMeasures(Array.from({ length: 1 }, createEmptyMeasure)); 
        setSettings(prev => ({...prev, measureCount: 1, writeMeasureCount: 1}));
        if (settings.mode === 'read') {
             handleSettingChange('mode', 'write');
        }
    }, [settings.mode, handleSettingChange]);

    const stopRhythm = useCallback(() => {
        const oldId = currentlyPlayingId;
        if (oldId) {
            // Find the VexFlow group element
            const el = document.getElementById(oldId);
            if (el) {
                // Reset all paths inside it (notehead, stem, etc.) to black
                el.querySelectorAll('path').forEach(path => {
                    path.setAttribute('fill', 'black');
                });
            }
        }
        setCurrentlyPlayingId(null);

        transportEventsRef.current.forEach(eventId => Tone.Transport.clear(eventId));
        transportEventsRef.current = [];

        Tone.Transport.stop();
        Tone.Transport.cancel();
        Tone.Transport.position = 0;
        
        setIsPlaying(false);
    }, [currentlyPlayingId]); // Added dependency

    // +++ NEW: Generic play function +++
    const playMeasures = useCallback(async (measuresToPlay) => {
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

        const { countdownClicks, timeSignature } = settings;
        const quarterNoteDuration = 60 / bpm;
        const transport = Tone.getTransport();
        
        transport.bpm.value = bpm;
        
        transport.stop();
        transport.cancel();
        transport.position = 0;
        transport.timeSignature = [timeSignature.beats, timeSignature.beatType];
        
        const sequenceStartTime = 0.1; 
        transport.start(Tone.now(), sequenceStartTime); 
        
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

        // --- Metronome scheduling ---
        if (settings.useMetronome && isMetronomeReady && metronomePlayer.current) {
            // Calculate total duration for the metronome
            const totalBeats = measuresToPlay.reduce((total, measure) => {
                return total + measure.reduce((measureSum, item) => measureSum + item.duration, 0);
            }, 0);
            const totalDuration = totalBeats * quarterNoteDuration;
            
            const metronomeEventId = transport.scheduleRepeat(time => {
                if (metronomePlayer.current?.loaded) {
                    metronomePlayer.current.volume.value = metronomeVolume;
                    metronomePlayer.current.start(time);
                }
            }, quarterNoteDuration, rhythmStartTime, totalDuration); 
            
            transportEventsRef.current.push(metronomeEventId);
        }

        // --- Note scheduling ---
        let scheduleTime = rhythmStartTime;
        measuresToPlay.forEach((measure) => {
            measure.forEach((item) => {
                const itemDuration = item.duration * quarterNoteDuration;
                
                if (item.type === 'note' || item.type === 'rest') {
                    const noteId = item.id;
                    if (item.type === 'note') {
                        const eventId = transport.scheduleOnce(time => {
                            if (rhythmNotePlayer.current?.loaded) {
                                rhythmNotePlayer.current.volume.value = fretboardVolume;
                                rhythmNotePlayer.current.start(time); 
                                rhythmNotePlayer.current.stop(time + itemDuration - 0.01); 
                            }
                        }, scheduleTime);
                        transportEventsRef.current.push(eventId);
                    }
                    
                    const highlightId = transport.scheduleOnce(time => {
                        Tone.Draw.schedule(() => setCurrentlyPlayingId(noteId), time);
                    }, scheduleTime);
                    transportEventsRef.current.push(highlightId);

                } else if (item.type === 'group' || item.type === 'triplet') {
                    let subNoteTime = scheduleTime;
                    item.playback.forEach((subDuration, index) => {
                        const subDurationInSeconds = subDuration * quarterNoteDuration;
                        const noteId = `${item.id}-sub-${index}`; // Unique ID for sub-note

                        const eventId = transport.scheduleOnce(time => {
                            if (rhythmNotePlayer.current?.loaded) {
                                rhythmNotePlayer.current.volume.value = fretboardVolume;
                                rhythmNotePlayer.current.start(time);
                                rhythmNotePlayer.current.stop(time + subDurationInSeconds - 0.01);
                            }
                        }, subNoteTime);
                        transportEventsRef.current.push(eventId);
                        
                        const highlightId = transport.scheduleOnce(time => {
                            Tone.Draw.schedule(() => setCurrentlyPlayingId(noteId), time);
                        }, subNoteTime);
                        transportEventsRef.current.push(highlightId);

                        subNoteTime += subDurationInSeconds; 
                    });
                }
                
                scheduleTime += itemDuration;
            });
        });

        // --- Cleanup event ---
        const cleanupTime = scheduleTime + 0.1;
        const cleanupEvent = transport.scheduleOnce(time => {
            Tone.Draw.schedule(() => {
                // This will trigger the useEffect in RhythmTool to clean the last note
                setCurrentlyPlayingId(null); 
                setIsPlaying(false);
            }, time);
            
            transport.stop(time); 
            transport.scheduleOnce(() => {
                transport.cancel();
                transport.position = 0;
            }, time + 0.05);
            
            transportEventsRef.current.forEach(eventId => Tone.Transport.clear(eventId));
            transportEventsRef.current = [];

        }, cleanupTime); 
        
        transportEventsRef.current.push(cleanupEvent);

    }, [
        settings, isPlaying, bpm,
        unlockAudio, stopRhythm,
        rhythmNotePlayer, isRhythmNoteReady, fretboardVolume,
        countdownPlayers, metronomeVolume, isMetronomeReady,
        metronomePlayer
    ]);

    // +++ NEW: Specific play functions +++
    const playRhythm = useCallback(() => {
        const rhythmToPlay = settings.mode === 'read' ? quizAnswer : measures;
        playMeasures(rhythmToPlay);
    }, [playMeasures, settings.mode, quizAnswer, measures]);

    const playMeasure = useCallback((measureIndex) => {
        const measureToPlay = measures[measureIndex];
        if (measureToPlay) {
            playMeasures([measureToPlay]); // Pass the single measure as an array
        }
    }, [playMeasures, measures]);


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
            removeLastRhythmItem,
            clearMeasure,
            clearBoard,
            playRhythm, // Plays all measures
            playMeasure, // +++ NEW: Plays one measure +++
            stopRhythm,
            generateNewQuiz,
        }
    };
};