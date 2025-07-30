import React, { createContext, useState, useContext, useCallback } from 'react';
import * as Tone from 'tone';
import { usePracticeLogLogic } from './usePracticeLogLogic';
import { useMetronomeLogic } from './useMetronomeLogic';
import { useDroneLogic } from './useDroneLogic';
import { useTimerLogic } from './useTimerLogic';
import { useStopwatchLogic } from './useStopwatchLogic';
import { useAudioPlayers } from './useAudioPlayers';
import { usePresetsLogic } from './usePresetsLogic';
import { useChallengesLogic } from './useChallengesLogic';

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

    const toggleActiveTool = (tool) => {
        setActiveTool(prevTool => (prevTool === tool ? null : tool));
    };

    const unlockAudio = useCallback(async () => {
        if (isAudioUnlocked) return;
        try {
            await Tone.start();
            setIsAudioUnlocked(true);
            console.log("Audio Context unlocked and running.");
        } catch (e) {
            console.error("Could not start Audio Context", e);
        }
    }, [isAudioUnlocked]);
    
    // Preset loading logic
    const loadPreset = useCallback((preset) => {
        setPresetToLoad(preset);
        toggleActiveTool(null); 
    }, []);

    const clearPresetToLoad = useCallback(() => {
        setPresetToLoad(null);
    }, []);

    // --- Challenge Runner Functions ---
    const startChallenge = useCallback((challenge) => {
        setActiveChallenge(challenge);
        setChallengeStepIndex(0);
        setChallengeProgress({
            score: 0,
            totalAsked: 0,
            streak: 0,
            time: 0,
        });
    }, []);

    const nextChallengeStep = useCallback(() => {
        setChallengeStepIndex(prevIndex => prevIndex + 1);
    }, []);

    const endChallenge = useCallback(() => {
        setActiveChallenge(null);
        setChallengeStepIndex(0);
        setChallengeProgress(null);
    }, []);

    const updateChallengeProgress = useCallback((newProgress) => {
        setChallengeProgress(prev => ({ ...prev, ...newProgress }));
    }, []);

    // --- Custom Hooks for each tool's logic ---
    const log = usePracticeLogLogic();
    const metronome = useMetronomeLogic(unlockAudio);
    const drone = useDroneLogic(unlockAudio);
    const timer = useTimerLogic(unlockAudio);
    const stopwatch = useStopwatchLogic();
    const audioPlayers = useAudioPlayers(unlockAudio, metronome.bpm);
    const presets = usePresetsLogic();
    
    // **FIX:** Renamed 'challenges' to 'challengesLogic' to avoid naming collision
    const challengesLogic = useChallengesLogic(presets.presets, presets.savePreset);
    
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
        ...challengesLogic, // **FIX:** Spread the correctly named object
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
    };

    return (
        <ToolsContext.Provider value={value}>
            {children}
        </ToolsContext.Provider>
    );
};