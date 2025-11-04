// src/context/ToolsContext.js

import React, { createContext, useState, useContext, useCallback, useEffect, useMemo, useRef } from 'react';
import * as Tone from 'tone';
import { usePracticeLogLogic } from './usePracticeLogLogic';
import { useMetronomeLogic } from './useMetronomeLogic';
import { useDroneLogic } from './useDroneLogic';
import { useTimerLogic } from './useTimerLogic';
import { useStopwatchLogic } from './useStopwatchLogic';
import { useAudioPlayers } from './useAudioPlayers';
import { usePresetsLogic } from './usePresetsLogic';
import { useRoutinesLogic } from './useRoutinesLogic';
import { useScoreboardLogic } from './useScoreboardLogic';

const shuffle = (array) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
};

const ToolsContext = createContext(null);
export const useTools = () => useContext(ToolsContext);

export const ToolsProvider = ({ children }) => {
    // +++ FIX: Re-added all the missing useState definitions +++
    const [activeTool, setActiveTool] = useState(null);
    const [activeTab, setActiveTab] = useState('welcome');
    const [openCategory, setOpenCategory] = useState(null);
    const [presetToLoad, setPresetToLoad] = useState(null);
    const [activeRoutine, setActiveRoutine] = useState(null);
    const [routineStepIndex, setRoutineStepIndex] = useState(0);
    const [routineProgress, setRoutineProgress] = useState(null);
    const [lastRoutineResultId, setLastRoutineResultId] = useState(null);
    // +++ END FIX +++

    const unlockAudio = useCallback(async () => { 
        if (Tone.context.state === 'suspended') { 
            try { 
                await Tone.start(); 
                console.log("Audio Context unlocked and running.");
                const dummyOsc = new Tone.Oscillator(0, "sine").toDestination();
                dummyOsc.volume.value = -Infinity;
                dummyOsc.start(Tone.now());
                dummyOsc.stop(Tone.now() + 0.01);
                setTimeout(() => dummyOsc.dispose(), 50);
            } catch (e) { 
                console.error("Could not start Audio Context", e); 
            } 
        } 
    }, []);
    
    const navigate = useCallback((tabName) => { unlockAudio(); setActiveTab(tabName); setOpenCategory(null); }, [unlockAudio]);
    const handleCategoryClick = useCallback((categoryName) => { setOpenCategory(prev => prev === categoryName ? null : categoryName); }, []);
    const toggleActiveTool = useCallback((tool) => { setActiveTool(prev => (prev === tool ? null : tool)) }, []);
    
    useEffect(() => { const oneTimeUnlock = () => unlockAudio(); window.addEventListener('click', oneTimeUnlock, { once: true }); return () => window.removeEventListener('click', oneTimeUnlock); }, [unlockAudio]);

    useEffect(() => {
        const keepAudioAlive = setInterval(async () => {
            if (Tone.context.state === 'suspended') {
                try {
                    await Tone.context.resume(); 
                } catch (e) {
                    console.error("Failed to auto-resume AudioContext.", e);
                }
            }
        }, 500); 
        return () => { clearInterval(keepAudioAlive); };
    }, []); 

    const clearPresetToLoad = useCallback(() => setPresetToLoad(null), []);

    const log = usePracticeLogLogic();
    const metronome = useMetronomeLogic(unlockAudio);
    const drone = useDroneLogic(unlockAudio);
    const timer = useTimerLogic(unlockAudio);
    const stopwatch = useStopwatchLogic();
    const audioPlayers = useAudioPlayers(unlockAudio, metronome.bpm);
    const scoreboard = useScoreboardLogic();
    const routinesLogic = useRoutinesLogic();
    const { presets, updatePreset, ...presetsLogic } = usePresetsLogic(routinesLogic.routines);

    const rhythmNotePlayer = useRef(null);
    const [isRhythmNoteReady, setIsRhythmNoteReady] = useState(false);
    useEffect(() => {
        const url = `${process.env.PUBLIC_URL}/sounds/fretboard/4-5.mp3`;
        rhythmNotePlayer.current = new Tone.Player({
            url: url,
            onload: () => {
                setIsRhythmNoteReady(true);
            },
            fadeOut: 0.1
        }).toDestination();
        return () => {
            rhythmNotePlayer.current?.dispose();
        };
    }, []);

    // +++ FIX: Depend on the stable 'setMetronomeSchedule' function, not the 'metronome' object
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (metronome.setMetronomeSchedule) {
            metronome.setMetronomeSchedule(null);
        }
    }, [activeTab, metronome.setMetronomeSchedule]);
    // +++ END FIX +++

    const loadPreset = useCallback((presetToLoad) => { 
        updatePreset(presetToLoad.id, { ...presetToLoad, lastUsed: new Date().toISOString() }); 
        setPresetToLoad(presetToLoad); 
    }, [updatePreset]);

    const startRoutine = useCallback(async (routine) => {
        await unlockAudio();
        let routineToStart = { ...routine };
        if (routine.executionOrder === 'random') {
            routineToStart.steps = shuffle([...routine.steps]);
        }
        routinesLogic.updateRoutineLastPlayed(routine.id);
        setActiveRoutine(routineToStart);
        setRoutineStepIndex(0);
        setRoutineProgress({ totalScore: 0, totalAsked: 0, streak: 0, stepResults: routineToStart.steps.map(() => ({ score: 0, asked: 0 })) });
    }, [unlockAudio, routinesLogic]);

    const nextRoutineStep = useCallback(() => setRoutineStepIndex(prev => prev + 1), []);
    const endRoutine = useCallback(() => { if (stopwatch.isStopwatchRunning) stopwatch.toggleStopwatch(); setActiveRoutine(null); setRoutineStepIndex(0); setRoutineProgress(null); }, [stopwatch]);
    const updateRoutineProgress = useCallback((stepIndex, quizProgress, currentProgress) => { if (!currentProgress?.stepResults?.[stepIndex]) return currentProgress; const newStepResults = [...currentProgress.stepResults]; newStepResults[stepIndex] = { score: quizProgress.score, asked: quizProgress.totalAsked }; const totalScore = newStepResults.reduce((sum, r) => sum + r.score, 0); const totalAsked = newStepResults.reduce((sum, r) => sum + r.asked, 0); const newState = { ...currentProgress, stepResults: newStepResults, totalScore, totalAsked, streak: quizProgress.wasCorrect ? (currentProgress.streak || 0) + 1 : 0 }; setRoutineProgress(newState); return newState; }, []);
    const finishRoutine = useCallback((finalProgress) => {
        if (!activeRoutine || !finalProgress) return;
        const result = {
            id: `res_${Date.now()}`,
            routineId: activeRoutine.id,
            routineName: activeRoutine.name,
            routineType: activeRoutine.type,
            completionTime: new Date().toISOString(),
            steps: activeRoutine.steps,
            stepResults: finalProgress.stepResults,
            totalScore: finalProgress.totalScore,
            totalAsked: finalProgress.totalAsked,
            streak: finalProgress.streak,
            finalTime: activeRoutine.type === 'Gauntlet' ? stopwatch.stopwatchTime : null,
        };

        if (result.routineType === 'Streak') {
            result.totalScore = result.streak;
            result.totalAsked = result.streak;
        }

        scoreboard.saveRoutineResult(result);
        setLastRoutineResultId(result.id);
        endRoutine();
    }, [activeRoutine, endRoutine, stopwatch, scoreboard]);

    const value = useMemo(() => ({
        unlockAudio, activeTool, toggleActiveTool,
        activeTab, navigate, openCategory, handleCategoryClick,
        ...log, ...metronome, ...drone, ...timer, ...stopwatch, ...audioPlayers, 
        
        startMetronome: metronome.startMetronome,
        stopMetronome: metronome.stopMetronome,
        
        rhythmNotePlayer,
        isRhythmNoteReady,

        presets, updatePreset, ...presetsLogic, 
        ...routinesLogic,
        exportRoutine: (r) => routinesLogic.exportRoutine(r, presets),
        exportFolder: (id, fileName) => routinesLogic.exportFolder(id, presets, fileName),
        importRoutines: (f) => routinesLogic.importRoutines(f, presetsLogic.savePreset),
        ...scoreboard,
        presetToLoad, loadPreset, clearPresetToLoad,
        activeRoutine, routineStepIndex, routineProgress, setRoutineProgress,
        startRoutine, nextRoutineStep, endRoutine, updateRoutineProgress, finishRoutine,
        lastRoutineResultId, setLastRoutineResultId,
    }), [
        unlockAudio, activeTool, toggleActiveTool, activeTab, navigate, openCategory, handleCategoryClick,
        log, metronome, drone, timer, stopwatch, audioPlayers, presets, updatePreset, presetsLogic, routinesLogic, scoreboard,
        presetToLoad, activeRoutine, routineStepIndex, routineProgress, lastRoutineResultId,
        loadPreset, startRoutine, nextRoutineStep, endRoutine, updateRoutineProgress, finishRoutine,
        setRoutineProgress, setLastRoutineResultId, clearPresetToLoad,
        isRhythmNoteReady
    ]
    );

    return (
        <ToolsContext.Provider value={value}>
            {children}
        </ToolsContext.Provider>
    );
};