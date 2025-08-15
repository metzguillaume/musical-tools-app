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
    
    // Preset loading state
    const [presetToLoad, setPresetToLoad] = useState(null);

    // --- Challenge Runner State ---
    const [activeChallenge, setActiveChallenge] = useState(null);
    const [challengeStepIndex, setChallengeStepIndex] = useState(0);
    const [challengeProgress, setChallengeProgress] = useState(null);
    const [lastChallengeResultId, setLastChallengeResultId] = useState(null);

    const toggleActiveTool = (tool) => {
        setActiveTool(prevTool => (prevTool === tool ? null : tool));
    };

    const unlockAudio = useCallback(async () => {
        if (Tone.context.state === 'suspended') {
            try {
                await Tone.start();
                console.log("Audio Context resumed successfully.");
            } catch (e) {
                console.error("Could not resume Audio Context", e);
            }
        }
        
        if (isAudioUnlocked) return;
        try {
            await Tone.start();
            setIsAudioUnlocked(true);
            console.log("Audio Context unlocked and running.");
        } catch (e) {
            console.error("Could not start Audio Context", e);
        }
    }, [isAudioUnlocked]);

    // Robust, one-time audio unlock on the first user interaction anywhere on the page
    useEffect(() => {
        const oneTimeUnlock = () => {
            unlockAudio();
        };
        window.addEventListener('click', oneTimeUnlock, { once: true });
        return () => {
            window.removeEventListener('click', oneTimeUnlock);
        };
    }, [unlockAudio]);
    
    // Preset loading logic
    const loadPreset = useCallback((preset) => {
        setPresetToLoad(preset);
        toggleActiveTool(null); 
    }, []);

    const clearPresetToLoad = useCallback(() => {
        setPresetToLoad(null);
    }, []);

    // --- Custom Hooks for each tool's logic ---
    const log = usePracticeLogLogic();
    const metronome = useMetronomeLogic(unlockAudio);
    const drone = useDroneLogic(unlockAudio);
    const timer = useTimerLogic(unlockAudio);
    const stopwatch = useStopwatchLogic();
    const audioPlayers = useAudioPlayers(unlockAudio, metronome.bpm);
    const presets = usePresetsLogic();
    const challengesLogic = useChallengesLogic(presets.presets, presets.savePreset);
    const scoreboard = useScoreboardLogic();
    
    // --- Challenge Runner Functions ---
    const startChallenge = useCallback((challenge) => {
        unlockAudio();
        challengesLogic.updateChallengeLastPlayed(challenge.id); // UPDATE: Record last played time
        setActiveChallenge(challenge);
        setChallengeStepIndex(0);
        setChallengeProgress({
            totalScore: 0,
            totalAsked: 0,
            streak: 0,
            stepResults: challenge.steps.map(() => ({ score: 0, asked: 0 })),
        });
    }, [unlockAudio, challengesLogic]);

    const nextChallengeStep = useCallback(() => {
        setChallengeStepIndex(prevIndex => prevIndex + 1);
    }, []);

    const endChallenge = useCallback(() => {
        setActiveChallenge(null);
        setChallengeStepIndex(0);
        setChallengeProgress(null);
    }, []);

    const updateChallengeProgress = useCallback((stepIndex, quizProgress) => {
        let newState = null;
        setChallengeProgress(prev => {
            if (!prev || !prev.stepResults || prev.stepResults[stepIndex] === undefined) {
                return prev;
            }
            const newStepResults = [...prev.stepResults];
            newStepResults[stepIndex] = { score: quizProgress.score, asked: quizProgress.totalAsked };
            const totalScore = newStepResults.reduce((sum, r) => sum + r.score, 0);
            const totalAsked = newStepResults.reduce((sum, r) => sum + r.asked, 0);
            
            newState = {
                ...prev,
                stepResults: newStepResults,
                totalScore,
                totalAsked,
                streak: quizProgress.wasCorrect ? (prev.streak || 0) + 1 : 0
            };
            return newState;
        });
        return newState;
    }, []);
    
    // Combine all state and functions into a single value object
    const value = {
        unlockAudio,
        activeTool,
        toggleActiveTool,
        ...log,
        ...metronome,
        ...drone,
        ...timer,
        ...stopwatch,
        ...audioPlayers,
        ...presets,
        ...challengesLogic,
        ...scoreboard,
        presetToLoad,
        loadPreset,
        clearPresetToLoad,
        activeChallenge,
        challengeStepIndex,
        challengeProgress,
        startChallenge,
        nextChallengeStep,
        endChallenge,
        updateChallengeProgress,
        lastChallengeResultId,
        setLastChallengeResultId,
    };

    return (
        <ToolsContext.Provider value={value}>
            {children}
        </ToolsContext.Provider>
    );
};