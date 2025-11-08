// src/hooks/useRhythmEngine.js

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import * as Tone from 'tone';
import { useTools } from '../../context/ToolsContext';
import { NOTE_TYPES, TIME_SIGNATURES, ALL_RHYTHM_TYPES, REST_TYPES, RHYTHM_PATTERN_BANK } from './rhythmConstants';

// ... (DEFAULT_SETTINGS, createEmptyMeasure, getAtomicRests, generateQuizRhythm... no changes) ...

const DEFAULT_SETTINGS = {
    timeSignature: TIME_SIGNATURES[0], // 4/4
    measureCount: 1,
    mode: 'read', 
    countdownClicks: 4,
    showBeatDisplay: true,
    useMetronome: true,
    writeMeasureCount: 1, 
    quizMeasureCount: 1, 
    quizComplexity: 1, 
    allowedRhythms: [
        'half', 'quarter', 'eighth', 'sixteenth',
        'wholeRest', 'quarterRest', 'eighthRest'
    ]
};

const createEmptyMeasure = () => ([]);

const getAtomicRests = (duration) => {
    const rests = [];
    const sortedRests = Object.values(REST_TYPES).sort((a, b) => b.duration - a.duration);
    let remaining = duration;

    for (const rest of sortedRests) {
        while (remaining >= rest.duration - 0.001) {
            rests.push(rest.label.toLowerCase().replace(' ', ''));
            remaining -= rest.duration;
        }
    }
    return rests;
};

const generateQuizRhythm = (settings) => {
    const { timeSignature, quizMeasureCount, allowedRhythms, quizComplexity } = settings;
    const measureCount = quizMeasureCount || 1;
    const beatsPerMeasure = (timeSignature.beats * (4 / timeSignature.beatType));
    
    const allowedItemKeys = allowedRhythms.length > 0 ? allowedRhythms : ['quarter', 'quarterRest'];

    const availablePatterns = RHYTHM_PATTERN_BANK.filter(pattern => {
        if (pattern.complexity > quizComplexity) return false;
        const hasAllIngredients = pattern.types.every(type => allowedRhythms.includes(type));
        if (!hasAllIngredients) return false;
        if (pattern.duration > beatsPerMeasure) return false;
        return true;
    });

    if (availablePatterns.length === 0) {
        const fallbackItem = { key: 'quarter', ...NOTE_TYPES.quarter, id: uuidv4() };
        return Array.from({ length: measureCount }, () => [fallbackItem]);
    }

    const quizMeasures = [];
    for (let i = 0; i < measureCount; i++) {
        let currentMeasure = [];
        let currentDuration = 0;
        let isAllRests = true;
        let isDuplicate = true;
        let measureGenAttempts = 0;

        do {
            currentMeasure = [];
            currentDuration = 0;
            let attempts = 0;

            while (currentDuration < beatsPerMeasure && attempts < 20) {
                const remainingDuration = beatsPerMeasure - currentDuration;
                
                const fittingPatterns = availablePatterns.filter(p => p.duration <= remainingDuration + 0.001);

                if (fittingPatterns.length === 0) {
                    const restsToFill = getAtomicRests(remainingDuration);
                    for (const restKey of restsToFill) {
                        currentMeasure.push({ ...ALL_RHYTHM_TYPES[restKey], id: uuidv4(), key: restKey });
                    }
                    currentDuration += remainingDuration; 
                    break;
                }

                let patternsToUse = fittingPatterns;
                if (currentDuration === 0) {
                    const notePatterns = fittingPatterns.filter(p => !p.notes[0].includes('Rest'));
                    if (notePatterns.length > 0) {
                        patternsToUse = notePatterns;
                    }
                }
                
                const randomPattern = patternsToUse[Math.floor(Math.random() * patternsToUse.length)];
                
                for (const noteKey of randomPattern.notes) {
                    currentMeasure.push({ ...ALL_RHYTHM_TYPES[noteKey], id: uuidv4(), key: noteKey });
                }
                currentDuration += randomPattern.duration;
                attempts++;
            }
            
            isAllRests = currentMeasure.length === 0 || currentMeasure.every(item => item.type === 'rest');
            
            const newMeasureSignature = JSON.stringify(currentMeasure.map(item => item.key));
            isDuplicate = quizMeasures.some(existingMeasure => 
                JSON.stringify(existingMeasure.map(item => item.key)) === newMeasureSignature
            );
            
            measureGenAttempts++;

        } while ((isAllRests || isDuplicate) && measureGenAttempts < 10); 

        quizMeasures.push(currentMeasure);
    }
    return quizMeasures;
};


export const useRhythmEngine = () => {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [bpm, setLocalBpm] = useState(60); 

    const [initialQuiz] = useState(() => {
        if (DEFAULT_SETTINGS.mode === 'read') {
            return generateQuizRhythm(DEFAULT_SETTINGS);
        }
        return Array.from({ length: DEFAULT_SETTINGS.writeMeasureCount }, createEmptyMeasure);
    });

    const [measures, setMeasures] = useState(initialQuiz);
    const [quizAnswer, setQuizAnswer] = useState(DEFAULT_SETTINGS.mode === 'read' ? initialQuiz : null);
    
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null);
    const [currentlyPlayingMeasureIndex, setCurrentlyPlayingMeasureIndex] = useState(null);
    const transportEventsRef = useRef([]);
    // +++ REMOVED: globalMetronomeWasPlaying ref +++

    const { 
        unlockAudio, 
        rhythmNotePlayer,
        isRhythmNoteReady,
        fretboardVolume, 
        countdownPlayers,
        metronomeVolume,
        isMetronomeReady, 
        setBpm: setGlobalBpm, 
        metronomePlayer,
        // +++ REMOVED: startMetronome and isMetronomePlaying +++
        stopMetronome,
    } = useTools();

    const setBpm = useCallback((newBpm) => {
        setLocalBpm(newBpm);
        setGlobalBpm(newBpm);
    }, [setGlobalBpm]);

    useEffect(() => {
        setGlobalBpm(60);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

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
                    return m.slice(0, newCount); 
                });
                return { ...newSettings, measureCount: newCount };
            }
            
            if ( (key === 'timeSignature' || key === 'quizMeasureCount' || key === 'allowedRhythms' || key === 'quizComplexity') && newSettings.mode === 'read' ) {
                if (key === 'quizMeasureCount') {
                    newSettings.measureCount = value;
                }
                const quiz = generateQuizRhythm(newSettings);
                setQuizAnswer(quiz);
                setMeasures(quiz);
                return newSettings;
            }

            if (key === 'mode') {
                if (value === 'read') {
                    const quizSettings = {...newSettings, measureCount: newSettings.quizMeasureCount || 1}; 
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

    // ... (removeMeasure, addRhythmItem, etc. are unchanged) ...
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
        setCurrentlyPlayingId(null);
        setCurrentlyPlayingMeasureIndex(null); 

        transportEventsRef.current.forEach(eventId => Tone.Transport.clear(eventId));
        transportEventsRef.current = [];

        Tone.Transport.stop();
        Tone.Transport.cancel();
        Tone.Transport.position = 0;
        
        setIsPlaying(false);

        // +++ FIX: Removed restart logic +++
        // (No logic here)

    }, []); // <-- Removed startMetronome dependency

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

        // +++ FIX: Stop global metronome. No need to remember state. +++
        stopMetronome();
        // +++ END FIX +++

        const { countdownClicks, timeSignature, useMetronome } = settings; 
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

        const totalDurationInBeats = measuresToPlay.length * beatsPerMeasure;
        const totalDurationInSeconds = totalDurationInBeats * quarterNoteDuration;

        if (useMetronome && isMetronomeReady && metronomePlayer.current) {
            
            const metronomeEventId = transport.scheduleRepeat(time => {
                if (metronomePlayer.current?.loaded) {
                    metronomePlayer.current.volume.value = metronomeVolume;
                    metronomePlayer.current.start(time);
                }
            }, quarterNoteDuration, rhythmStartTime, totalDurationInSeconds); 
            
            transportEventsRef.current.push(metronomeEventId);
        }

        let scheduleTime = rhythmStartTime;
        measuresToPlay.forEach((measure, measureIndex) => { 
            
            const firstNoteTime = scheduleTime;
            const highlightMeasureEvent = transport.scheduleOnce(time => {
                Tone.Draw.schedule(() => setCurrentlyPlayingMeasureIndex(measureIndex), time);
            }, firstNoteTime);
            transportEventsRef.current.push(highlightMeasureEvent);

            measure.forEach((item) => {
                const itemDuration = item.duration * quarterNoteDuration;
                
                if (item.type === 'note' || item.type === 'rest') {
                    const noteId = item.id;
                    if (item.type === 'note') {
                        const eventId = transport.scheduleOnce(time => {
                            if (rhythmNotePlayer.current?.loaded) {
                                rhythmNotePlayer.current.volume.value = fretboardVolume; 
                                const duration = itemDuration;
                                rhythmNotePlayer.current.start(time, 0, duration > 0 ? duration : 0.01); 
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
                        const noteId = `${item.id}-sub-${index}`; 

                        const eventId = transport.scheduleOnce(time => {
                            if (rhythmNotePlayer.current?.loaded) {
                                rhythmNotePlayer.current.volume.value = fretboardVolume;
                                const duration = subDurationInSeconds;
                                rhythmNotePlayer.current.start(time, 0, duration > 0 ? duration : 0.01);
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

            const measureFullDuration = beatsPerMeasure * quarterNoteDuration;
            scheduleTime = rhythmStartTime + ( (measureIndex + 1) * measureFullDuration );
        });

        const cleanupTime = rhythmStartTime + totalDurationInSeconds + 0.1;
        
        const cleanupEvent = transport.scheduleOnce(time => {
            Tone.Draw.schedule(() => {
                setCurrentlyPlayingId(null); 
                setCurrentlyPlayingMeasureIndex(null); 
                setIsPlaying(false);
                // +++ FIX: Removed restart logic +++
                // (No logic here)
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
        isRhythmNoteReady,
        countdownPlayers, isMetronomeReady,
        metronomePlayer,
        fretboardVolume, 
        metronomeVolume,
        rhythmNotePlayer,
        beatsPerMeasure,
        stopMetronome // <-- Removed isMetronomePlaying and startMetronome
    ]);

    const playRhythm = useCallback(() => {
        const rhythmToPlay = settings.mode === 'read' ? quizAnswer : measures;
        playMeasures(rhythmToPlay);
    }, [playMeasures, settings.mode, quizAnswer, measures]);

    const playMeasure = useCallback((measureIndex) => {
        const measureToPlay = measures[measureIndex];
        if (measureToPlay) {
            playMeasures([measureToPlay]);
        }
    }, [playMeasures, measures]);


    return {
        settings,
        setSettings,
        bpm: bpm,      
        setBpm: setBpm,  
        measures,
        measureDurations,
        beatsPerMeasure,
        isPlaying,
        currentlyPlayingId, 
        currentlyPlayingMeasureIndex, 
        isQuizMode: settings.mode === 'read',
        actions: {
            handleSettingChange,
            removeMeasure,
            addRhythmItem,
            removeLastRhythmItem,
            clearMeasure,
            clearBoard,
            playRhythm,
            playMeasure,
            stopRhythm,
            generateNewQuiz,
        }
    };
};