import React, { createContext, useState, useContext, useCallback, useEffect, useMemo } from 'react';
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

const ToolsContext = createContext(null);
export const useTools = () => useContext(ToolsContext);

export const ToolsProvider = ({ children }) => {
    // All state and logic hooks...
    const [activeTool, setActiveTool] = useState(null);
    const [activeTab, setActiveTab] = useState('welcome');
    const [openCategory, setOpenCategory] = useState(null);
    const [presetToLoad, setPresetToLoad] = useState(null);
    const [activeRoutine, setActiveRoutine] = useState(null);
    const [routineStepIndex, setRoutineStepIndex] = useState(0);
    const [routineProgress, setRoutineProgress] = useState(null);
    const [lastRoutineResultId, setLastRoutineResultId] = useState(null);

    const unlockAudio = useCallback(async () => {
        if (Tone.context.state === 'suspended') {
            try {
                await Tone.start();
                console.log("Audio Context unlocked and running.");
            } catch (e) {
                console.error("Could not start Audio Context", e);
            }
        }
    }, []);

    const navigate = useCallback((tabName) => {
        unlockAudio();
        setActiveTab(tabName);
        setOpenCategory(null);
    }, [unlockAudio]);

    const handleCategoryClick = useCallback((categoryName) => {
        setOpenCategory(prev => prev === categoryName ? null : categoryName);
    }, []);
    
    const toggleActiveTool = useCallback((tool) => {
        setActiveTool(prev => (prev === tool ? null : tool))
    }, []);

    useEffect(() => {
        const oneTimeUnlock = () => unlockAudio();
        window.addEventListener('click', oneTimeUnlock, { once: true });
        return () => window.removeEventListener('click', oneTimeUnlock);
    }, [unlockAudio]);
    
    const clearPresetToLoad = useCallback(() => setPresetToLoad(null), []);

    const log = usePracticeLogLogic();
    const metronome = useMetronomeLogic(unlockAudio);
    const drone = useDroneLogic(unlockAudio);
    const timer = useTimerLogic(unlockAudio);
    const stopwatch = useStopwatchLogic();
    const audioPlayers = useAudioPlayers(unlockAudio, metronome.bpm);
    const scoreboard = useScoreboardLogic();
    const routinesLogic = useRoutinesLogic();
    const presets = usePresetsLogic(routinesLogic.routines);

    const loadPreset = useCallback((presetToLoad) => {
        presets.updatePreset(presetToLoad.id, { ...presetToLoad, lastUsed: new Date().toISOString() });
        setPresetToLoad(presetToLoad);
    }, [presets]);

    const startRoutine = useCallback((routine) => {
        unlockAudio();
        routinesLogic.updateRoutineLastPlayed(routine.id);
        setActiveRoutine(routine);
        setRoutineStepIndex(0);
        setRoutineProgress({ totalScore: 0, totalAsked: 0, streak: 0, stepResults: routine.steps.map(() => ({ score: 0, asked: 0 })) });
    }, [unlockAudio, routinesLogic]);

    const nextRoutineStep = useCallback(() => setRoutineStepIndex(prev => prev + 1), []);

    const endRoutine = useCallback(() => {
        if (stopwatch.isStopwatchRunning) stopwatch.toggleStopwatch();
        setActiveRoutine(null);
        setRoutineStepIndex(0);
        setRoutineProgress(null);
    }, [stopwatch]);

    const updateRoutineProgress = useCallback((stepIndex, quizProgress, currentProgress) => {
        if (!currentProgress?.stepResults?.[stepIndex]) return currentProgress;
        const newStepResults = [...currentProgress.stepResults];
        newStepResults[stepIndex] = { score: quizProgress.score, asked: quizProgress.totalAsked };
        const totalScore = newStepResults.reduce((sum, r) => sum + r.score, 0);
        const totalAsked = newStepResults.reduce((sum, r) => sum + r.asked, 0);
        const newState = { ...currentProgress, stepResults: newStepResults, totalScore, totalAsked, streak: quizProgress.wasCorrect ? (currentProgress.streak || 0) + 1 : 0 };
        setRoutineProgress(newState);
        return newState;
    }, []);
    
    const finishRoutine = useCallback((finalProgress) => {
        if (!activeRoutine || !finalProgress) return;
        const result = {
            id: `res_${Date.now()}`, routineId: activeRoutine.id, routineName: activeRoutine.name,
            routineType: activeRoutine.type, completionTime: new Date().toISOString(), steps: activeRoutine.steps,
            stepResults: finalProgress.stepResults, totalScore: finalProgress.totalScore, totalAsked: finalProgress.totalAsked,
            streak: finalProgress.streak, finalTime: activeRoutine.type === 'Gauntlet' ? stopwatch.stopwatchTime : null,
        };
        scoreboard.saveRoutineResult(result);
        setLastRoutineResultId(result.id);
        endRoutine();
    }, [activeRoutine, endRoutine, stopwatch, scoreboard]); // MODIFIED: Added 'scoreboard' to satisfy ESLint warning

    const value = useMemo(() => ({
        unlockAudio, activeTool, toggleActiveTool,
        activeTab, navigate, openCategory, handleCategoryClick,
        ...log, ...metronome, ...drone, ...timer, ...stopwatch, ...audioPlayers, ...presets, ...routinesLogic,
        exportRoutine: (r) => routinesLogic.exportRoutine(r, presets.presets),
        exportFolder: (id) => routinesLogic.exportFolder(id, presets.presets),
        importRoutines: (f) => routinesLogic.importRoutines(f, presets.savePreset),
        ...scoreboard,
        presetToLoad, loadPreset, clearPresetToLoad,
        activeRoutine, routineStepIndex, routineProgress, setRoutineProgress,
        startRoutine, nextRoutineStep, endRoutine, updateRoutineProgress, finishRoutine,
        lastRoutineResultId, setLastRoutineResultId,
    }), [
        unlockAudio, activeTool, toggleActiveTool, activeTab, navigate, openCategory, handleCategoryClick, log, metronome, drone,
        timer, stopwatch, audioPlayers, presets, routinesLogic, // MODIFIED: Added missing comma
        scoreboard, presetToLoad, activeRoutine, routineStepIndex, routineProgress, lastRoutineResultId, loadPreset, startRoutine, nextRoutineStep, endRoutine, updateRoutineProgress, finishRoutine, setRoutineProgress, setLastRoutineResultId, clearPresetToLoad
    ]);

    return (
        <ToolsContext.Provider value={value}>
            {children}
        </ToolsContext.Provider>
    );
};