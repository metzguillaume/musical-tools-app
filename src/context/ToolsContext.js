import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import * as Tone from 'tone';
import { usePracticeLogLogic } from './usePracticeLogLogic';
import { useMetronomeLogic } from './useMetronomeLogic';
import { useDroneLogic } from './useDroneLogic';
import { useTimerLogic } from './useTimerLogic';
import { useStopwatchLogic } from './useStopwatchLogic';
import { useAudioPlayers } from './useAudioPlayers';
import { usePresetsLogic } from './usePresetsLogic';
import { useChallengesLogic } from './useChallengesLogic';
import { useScoreboardLogic } from './useScoreboardLogic';

const ToolsContext = createContext(null);
export const useTools = () => useContext(ToolsContext);

export const ToolsProvider = ({ children }) => {
    // Core App State
    const [activeTool, setActiveTool] = useState(null);
    const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
    
    // NAVIGATION STATE & HANDLERS ARE NOW MANAGED BY THE CONTEXT
    const [activeTab, setActiveTab] = useState('welcome');
    const [openCategory, setOpenCategory] = useState(null);
    
    // Other global states
    const [presetToLoad, setPresetToLoad] = useState(null);
    const [activeChallenge, setActiveChallenge] = useState(null);
    const [challengeStepIndex, setChallengeStepIndex] = useState(0);
    const [challengeProgress, setChallengeProgress] = useState(null);
    const [lastChallengeResultId, setLastChallengeResultId] = useState(null);

    const unlockAudio = useCallback(async () => {
        if (Tone.context.state === 'suspended') await Tone.start();
        if (isAudioUnlocked) return;
        try {
            await Tone.start();
            setIsAudioUnlocked(true);
            console.log("Audio Context unlocked and running.");
        } catch (e) { console.error("Could not start Audio Context", e); }
    }, [isAudioUnlocked]);

    // This is the single navigation function for the entire app
    const navigate = useCallback((tabName) => {
        unlockAudio();
        setActiveTab(tabName);
        setOpenCategory(null); // Close dropdowns on navigation
    }, [unlockAudio]);

    const handleCategoryClick = useCallback((categoryName) => {
        setOpenCategory(prev => prev === categoryName ? null : categoryName);
    }, []);
    
    const toggleActiveTool = (tool) => setActiveTool(prev => (prev === tool ? null : tool));

    useEffect(() => {
        const oneTimeUnlock = () => unlockAudio();
        window.addEventListener('click', oneTimeUnlock, { once: true });
        return () => window.removeEventListener('click', oneTimeUnlock);
    }, [unlockAudio]);
    
    const clearPresetToLoad = useCallback(() => setPresetToLoad(null), []);

    // --- Custom Hooks for each tool's logic ---
    const log = usePracticeLogLogic();
    const metronome = useMetronomeLogic(unlockAudio);
    const drone = useDroneLogic(unlockAudio);
    const timer = useTimerLogic(unlockAudio);
    const stopwatch = useStopwatchLogic();
    const audioPlayers = useAudioPlayers(unlockAudio, metronome.bpm);
    const scoreboard = useScoreboardLogic();
    const challengesLogic = useChallengesLogic();
    const presets = usePresetsLogic(challengesLogic.challenges);

    const loadPreset = useCallback((presetToLoad) => {
        presets.updatePreset(presetToLoad.id, { ...presetToLoad, lastUsed: new Date().toISOString() });
        setPresetToLoad(presetToLoad);
        toggleActiveTool(null); 
    }, [presets]);
    
    // --- Challenge Runner Functions (no changes needed here) ---
    const startChallenge = useCallback((challenge) => {
        unlockAudio();
        challengesLogic.updateChallengeLastPlayed(challenge.id);
        setActiveChallenge(challenge);
        setChallengeStepIndex(0);
        setChallengeProgress({ totalScore: 0, totalAsked: 0, streak: 0, stepResults: challenge.steps.map(() => ({ score: 0, asked: 0 })) });
    }, [unlockAudio, challengesLogic]);
    const nextChallengeStep = useCallback(() => setChallengeStepIndex(prev => prev + 1), []);
    const endChallenge = useCallback(() => {
        if (stopwatch.isStopwatchRunning) stopwatch.toggleStopwatch();
        setActiveChallenge(null);
        setChallengeStepIndex(0);
        setChallengeProgress(null);
    }, [stopwatch]);
    const updateChallengeProgress = useCallback((stepIndex, quizProgress, currentProgress) => {
        if (!currentProgress?.stepResults?.[stepIndex]) return currentProgress;
        const newStepResults = [...currentProgress.stepResults];
        newStepResults[stepIndex] = { score: quizProgress.score, asked: quizProgress.totalAsked };
        const totalScore = newStepResults.reduce((sum, r) => sum + r.score, 0);
        const totalAsked = newStepResults.reduce((sum, r) => sum + r.asked, 0);
        const newState = { ...currentProgress, stepResults: newStepResults, totalScore, totalAsked, streak: quizProgress.wasCorrect ? (currentProgress.streak || 0) + 1 : 0 };
        setChallengeProgress(newState);
        return newState;
    }, []);
    
    // The complete value object provided to all components
    const value = {
        unlockAudio,
        activeTool, toggleActiveTool,
        // Provide navigation state and handlers to all components
        activeTab, navigate, openCategory, handleCategoryClick,
        ...log,
        ...metronome,
        ...drone,
        ...timer,
        ...stopwatch,
        ...audioPlayers,
        ...presets,
        ...challengesLogic,
        // Wrapper functions to pass dependencies at call time
        exportChallenge: (c) => challengesLogic.exportChallenge(c, presets.presets),
        exportFolder: (id) => challengesLogic.exportFolder(id, presets.presets),
        importChallenges: (f) => challengesLogic.importChallenges(f, presets.savePreset),
        ...scoreboard,
        presetToLoad, loadPreset, clearPresetToLoad,
        activeChallenge, challengeStepIndex, challengeProgress,
        startChallenge, nextChallengeStep, endChallenge, updateChallengeProgress,
        lastChallengeResultId, setLastChallengeResultId,
    };

    return (
        <ToolsContext.Provider value={value}>
            {children}
        </ToolsContext.Provider>
    );
};