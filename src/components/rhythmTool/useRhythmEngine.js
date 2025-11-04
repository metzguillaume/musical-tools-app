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
};

const createEmptyMeasure = () => ([]);

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
        fretboardPlayers, 
        fretboardVolume,
        areFretboardSoundsReady,
        countdownPlayers,
        metronomeVolume,
        isMetronomeReady, 
        bpm,
        setBpm,
        isMetronomePlaying
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

    const handleSettingChange = useCallback((key, value) => {
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
                    setQuizAnswer(null);
                    setMeasures(Array.from({ length: newSettings.measureCount }, createEmptyMeasure));
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
            setSettings(prevSettings => ({...prevSettings, measureCount: newMeasures.length }));
            return newMeasures;
        });
    }, []);

    const addRhythmItem = useCallback((measureIndex, item) => {
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
        if (settings.mode === 'read') return;
        setMeasures(prevMeasures => {
            const newMeasures = [...prevMeasures];
            newMeasures[measureIndex] = newMeasures[measureIndex].filter(item => item.id !== itemId);
            return newMeasures;
        });
    }, [settings.mode]);
    
    const clearBoard = useCallback(() => {
        setMeasures(Array.from({ length: 1 }, createEmptyMeasure)); 
        setSettings(prev => ({...prev, measureCount: 1}));
        if (settings.mode === 'read') {
             handleSettingChange('mode', 'write');
        }
    }, [settings.mode, handleSettingChange]);

    // This function is correct. The problem is not here.
    const stopRhythm = useCallback(() => {
        transportEventsRef.current.forEach(eventId => Tone.Transport.clear(eventId));
        transportEventsRef.current = [];

        if (!isMetronomePlaying) {
            Tone.Transport.stop();
            Tone.Transport.cancel(); 
            Tone.Transport.position = 0; 
        }
        
        setCurrentlyPlayingId(null);
        setIsPlaying(false);
    }, [isMetronomePlaying]);

    const playRhythm = useCallback(async () => {
        if (isPlaying) {
            stopRhythm();
            return;
        }
        
        if (!isMetronomeReady || !areFretboardSoundsReady) {
            alert("Audio is still loading, please wait a moment.");
            return;
        }

        await unlockAudio();
        setIsPlaying(true);

        const rhythmToPlay = settings.mode === 'read' ? quizAnswer : measures;
        const { countdownClicks, timeSignature } = settings;
        const quarterNoteDuration = 60 / bpm;
        const transport = Tone.getTransport();
        
        transport.bpm.value = bpm;
        
        let sequenceStartTime;
        const now = Tone.now() + 0.1;

        if (isMetronomePlaying) {
            // Metronome is on. Sync to it.
            const nextMeasureTime = transport.nextSubdivision('1m');
            sequenceStartTime = nextMeasureTime - (countdownClicks * quarterNoteDuration);
            if (sequenceStartTime < now) { 
                sequenceStartTime = nextMeasureTime + transport.toSeconds('1m') - (countdownClicks * quarterNoteDuration);
            }
        } else {
            // Metronome is off. We are in control.
            
            // +++ FIX PART 1: Clean up transport state BEFORE starting. +++
            // This guarantees we are in a pristine state.
            transport.stop();
            transport.cancel();
            transport.position = 0;

            // Now, set up and start the transport.
            transport.timeSignature = [timeSignature.beats, timeSignature.beatType];
            sequenceStartTime = now;
            transport.start(now);
        }

        const rhythmStartTime = sequenceStartTime + (countdownClicks * quarterNoteDuration);
        transportEventsRef.current = [];

        // ... (Countdown scheduling logic - this is fine) ...
        if (countdownClicks > 0 && countdownPlayers.current?.length > 0) {
            for (let i = 0; i < countdownClicks; i++) {
                const clickTime = sequenceStartTime + i * quarterNoteDuration;
                const player = countdownPlayers.current[i] || countdownPlayers.current[0];
                
                const eventId = transport.scheduleOnce(time => {
                    if (player?.loaded) {
                        player.volume.value = metronomeVolume;
                        player.start(time);
                    }
                }, clickTime);
                transportEventsRef.current.push(eventId);
            }
        }

        // ... (Rhythm scheduling logic - this is fine) ...
        let scheduleTime = rhythmStartTime;
        rhythmToPlay.forEach((measure) => {
            measure.forEach((item) => {
                const itemDuration = item.duration * quarterNoteDuration;
                
                if (item.type === 'note') {
                    const eventId = transport.scheduleOnce(time => {
                        if (fretboardPlayers.current?.has('4-5')) {
                            const player = fretboardPlayers.current.player('4-5');
                            player.volume.value = fretboardVolume;
                            player.start(time);
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

        // ... (Cleanup event logic) ...
        const cleanupEvent = transport.scheduleOnce(time => {
            Tone.Draw.schedule(() => {
                setCurrentlyPlayingId(null);
                setIsPlaying(false);
            }, time);
            
            // +++ FIX PART 2: ONLY schedule the stop. +++
            // Do not reset position or cancel here.
            if (!isMetronomePlaying) {
                transport.stop(time + 0.1);
                // transport.cancel(time + 0.1); // <-- REMOVED
                // transport.position = 0;         // <-- REMOVED
            }
            transportEventsRef.current = [];
        }, scheduleTime + 0.1); // Schedule cleanup just after the last note
        transportEventsRef.current.push(cleanupEvent);

    }, [
        settings, measures, quizAnswer, isPlaying, isMetronomePlaying, bpm,
        unlockAudio, stopRhythm,
        fretboardPlayers, fretboardVolume, areFretboardSoundsReady,
        countdownPlayers, metronomeVolume, isMetronomeReady
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