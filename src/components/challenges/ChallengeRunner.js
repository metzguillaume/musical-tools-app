import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useTools } from '../../context/ToolsContext';

// Import all the possible quiz/tool components
import CAGEDSystemQuiz from '../caged/CAGEDSystemQuiz';
import ChordProgressionGenerator from '../chordProgressionGenerator/ChordProgressionGenerator';
import ChordTrainer from '../chordTrainer/ChordTrainer';
import IntervalEarTrainer from '../earTraining/IntervalEarTrainer';
import MelodicEarTrainer from '../earTraining/MelodicEarTrainer';
import IntervalFretboardQuiz from '../intervalFretboardQuiz/IntervalFretboardQuiz';
import IntervalGenerator from '../intervalGenerator/IntervalGenerator';
import IntervalsQuiz from '../intervalsQuiz/IntervalsQuiz';
import NoteGenerator from '../noteGenerator/NoteGenerator';
import TriadQuiz from '../triadQuiz/TriadQuiz';

const getComponentForPreset = (preset, props) => {
    if (!preset || !preset.gameId) return null;
    switch (preset.gameId) {
        case 'caged-system-quiz': return <CAGEDSystemQuiz {...props} />;
        case 'chord-trainer': return <ChordTrainer {...props} challengeSettings={preset.settings} />;
        case 'interval-ear-trainer': return <IntervalEarTrainer {...props} />;
        case 'melodic-ear-trainer': return <MelodicEarTrainer {...props} />;
        case 'interval-fretboard-quiz': return <IntervalFretboardQuiz {...props} />;
        case 'intervals-quiz': return <IntervalsQuiz {...props} />;
        case 'triad-quiz': return <TriadQuiz {...props} />;
        case 'chord-progression-generator': return <ChordProgressionGenerator />;
        case 'interval-generator': return <IntervalGenerator />;
        case 'note-generator': return <NoteGenerator />;
        default: return <p>Error: Unknown game ID "{preset.gameId}"</p>;
    }
};

const ChallengeHUD = ({ challenge, stepIndex, progress, timeLeft, stopwatchTime, onEndChallenge }) => {
    const currentStep = challenge.steps[stepIndex];
    let goalDisplay = '';
    
    const formatTime = (ms) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };
    
    const currentProgress = progress || {};

    if (challenge.type === 'PracticeRoutine' && currentStep.goalType === 'time') {
        goalDisplay = `Time Left: ${formatTime(timeLeft * 1000)}`;
    } else if ((challenge.type === 'PracticeRoutine' && currentStep.goalType === 'questions') || challenge.type === 'Gauntlet') {
        const stepProgress = currentProgress.stepResults ? currentProgress.stepResults[stepIndex] : { asked: 0 };
        goalDisplay = `Answered: ${stepProgress?.asked || 0} / ${currentStep.goalValue}`;
    } else if (challenge.type === 'Streak') {
        goalDisplay = `Current Streak: ${currentProgress.streak || 0}`;
    }

    return (
        <div className="w-full bg-slate-900 border-b-4 border-indigo-500 p-4 mb-8 rounded-lg text-center shadow-lg">
            <h2 className="text-2xl font-bold text-teal-300">{challenge.name}</h2>
            <div className="grid grid-cols-3 justify-items-center items-center mt-2 text-lg">
                <span className="font-semibold text-gray-300 justify-self-start">Step: {stepIndex + 1} / {challenge.steps.length}</span>
                <div className="flex flex-col items-center">
                    <span className="font-bold text-amber-300">{goalDisplay}</span>
                    {challenge.type === 'Gauntlet' && stopwatchTime !== undefined && (
                        <span className="font-mono text-xl text-yellow-300">{new Date(stopwatchTime).toISOString().slice(14, 22)}</span>
                    )}
                </div>
                <button onClick={onEndChallenge} className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm justify-self-end">
                    End Challenge
                </button>
            </div>
        </div>
    );
};


const ChallengeRunner = () => {
    const {
        activeChallenge, challengeStepIndex, challengeProgress, presets, loadPreset, nextChallengeStep, endChallenge, updateChallengeProgress,
        isStopwatchRunning, toggleStopwatch, resetStopwatch, stopwatchTime,
        saveChallengeResult, setLastChallengeResultId
    } = useTools();

    const [stepTimeLeft, setStepTimeLeft] = useState(0);
    const [currentStreakPresetId, setCurrentStreakPresetId] = useState(null);
    const timeoutRef = useRef(null);
    const gameAreaRef = useRef(null); // Ref for auto-scrolling

    const finishChallenge = useCallback((finalProgress) => {
        if (!activeChallenge || !finalProgress) return;

        const result = {
            id: `res_${Date.now()}`,
            challengeId: activeChallenge.id,
            challengeName: activeChallenge.name,
            challengeType: activeChallenge.type,
            completionTime: new Date().toISOString(),
            steps: activeChallenge.steps,
            stepResults: finalProgress.stepResults,
            totalScore: finalProgress.totalScore,
            totalAsked: finalProgress.totalAsked,
            streak: finalProgress.streak,
            finalTime: activeChallenge.type === 'Gauntlet' ? stopwatchTime : null,
        };

        saveChallengeResult(result);
        setLastChallengeResultId(result.id);
        endChallenge();

    }, [activeChallenge, endChallenge, saveChallengeResult, setLastChallengeResultId, stopwatchTime]);

    // Effect for setting up the current step (loading presets, starting timers)
    useEffect(() => {
        if (!activeChallenge) return;

        // Auto-scroll the game area into view
        gameAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        const currentStep = activeChallenge.steps[challengeStepIndex];
        const presetIdToLoad = activeChallenge.type === 'Streak' 
            ? currentStreakPresetId || activeChallenge.steps[0]?.presetId
            : currentStep?.presetId;
        const currentPreset = presets.find(p => p.id === presetIdToLoad);

        if (!currentStep || !currentPreset) return;
        
        loadPreset(currentPreset);

        if (activeChallenge.type === 'Gauntlet' && challengeStepIndex === 0) {
            resetStopwatch();
            toggleStopwatch();
        } else if (activeChallenge.type === 'Streak' && !currentStreakPresetId) {
            setCurrentStreakPresetId(activeChallenge.steps[0]?.presetId);
        }
    }, [activeChallenge, challengeStepIndex, presets, loadPreset, resetStopwatch, toggleStopwatch, currentStreakPresetId]);

    // New, reliable useEffect for the Practice Routine timer countdown
    useEffect(() => {
        if (activeChallenge?.type !== 'PracticeRoutine' || activeChallenge.steps[challengeStepIndex]?.goalType !== 'time') {
            return; // Not a timed routine step, so do nothing.
        }

        const currentStep = activeChallenge.steps[challengeStepIndex];
        setStepTimeLeft(currentStep.goalValue);

        const intervalId = setInterval(() => {
            setStepTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(intervalId);
                    if (challengeStepIndex >= activeChallenge.steps.length - 1) {
                        finishChallenge(challengeProgress); // Pass current progress
                    } else {
                        nextChallengeStep();
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, [activeChallenge, challengeStepIndex, nextChallengeStep, finishChallenge, challengeProgress]);

    const handleProgressUpdate = useCallback((progress) => {
        if (!activeChallenge) return;
        
        const newProgress = updateChallengeProgress(challengeStepIndex, progress, challengeProgress);

        const currentStep = activeChallenge.steps[challengeStepIndex];
        const isFinalStep = challengeStepIndex >= activeChallenge.steps.length - 1;

        const advance = (isFinished, finalProgress) => {
            timeoutRef.current = setTimeout(() => {
                if (isFinished) {
                    if (isStopwatchRunning) toggleStopwatch();
                    finishChallenge(finalProgress);
                } else {
                    nextChallengeStep();
                }
            }, 2000);
        };

        const questionsAnsweredForStep = progress.totalAsked;

        if (activeChallenge.type === 'PracticeRoutine' && currentStep.goalType === 'questions') {
            if (questionsAnsweredForStep >= currentStep.goalValue) advance(isFinalStep, newProgress);
        } else if (activeChallenge.type === 'Gauntlet') {
            if (questionsAnsweredForStep >= currentStep.goalValue) advance(isFinalStep, newProgress);
        } else if (activeChallenge.type === 'Streak') {
            if (!progress.wasCorrect) {
                advance(true, newProgress);
            } else {
                const nextPreset = activeChallenge.steps[Math.floor(Math.random() * activeChallenge.steps.length)];
                setCurrentStreakPresetId(nextPreset.presetId);
            }
        }
    }, [activeChallenge, challengeStepIndex, challengeProgress, isStopwatchRunning, nextChallengeStep, toggleStopwatch, updateChallengeProgress, finishChallenge]);
    
    useEffect(() => { return () => clearTimeout(timeoutRef.current); }, []);

    const presetIdToLoad = activeChallenge.type === 'Streak' ? currentStreakPresetId : activeChallenge?.steps[challengeStepIndex]?.presetId;
    const currentPreset = presets.find(p => p.id === presetIdToLoad);

    if (!activeChallenge || !currentPreset) {
        return ( <div className="text-center p-8"><h2 className="text-2xl font-bold text-gray-400">Loading Challenge...</h2></div> );
    }
    
    return (
        <div className="w-full relative">
            <div className="sticky top-0 z-10">
                <ChallengeHUD 
                    challenge={activeChallenge} 
                    stepIndex={challengeStepIndex} 
                    progress={challengeProgress} 
                    timeLeft={stepTimeLeft} 
                    stopwatchTime={stopwatchTime}
                    onEndChallenge={() => endChallenge()} 
                />
            </div>
            <div ref={gameAreaRef} className="w-full p-4 bg-slate-900/50 rounded-lg">
                {getComponentForPreset(currentPreset, { onProgressUpdate: handleProgressUpdate })}
            </div>
        </div>
    );
};

export default ChallengeRunner;