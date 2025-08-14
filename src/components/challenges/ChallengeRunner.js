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

const ChallengeHUD = ({ challenge, stepIndex, progress, timeLeft, stopwatchTime }) => {
    const currentStep = challenge.steps[stepIndex];
    let goalDisplay = '';
    
    const formatTime = (ms) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const milliseconds = Math.floor((ms % 1000) / 10);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
    };
    
    const currentProgress = progress || {};

    if (challenge.type === 'PracticeRoutine' && currentStep.goalType === 'time') {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        goalDisplay = `Time Left: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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
                <span className="font-bold text-amber-300">{goalDisplay}</span>
                {challenge.type === 'Gauntlet' && stopwatchTime !== undefined && (
                    <span className="font-mono text-xl text-yellow-300 justify-self-end">{formatTime(stopwatchTime)}</span>
                )}
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
    const initialStepRender = useRef(true);

    const finishChallenge = useCallback(() => {
        if (!activeChallenge || !challengeProgress) return;

        const result = {
            id: `res_${Date.now()}`,
            challengeId: activeChallenge.id,
            challengeName: activeChallenge.name,
            challengeType: activeChallenge.type,
            completionTime: new Date().toISOString(),
            steps: activeChallenge.steps,
            stepResults: challengeProgress.stepResults,
            totalScore: challengeProgress.totalScore,
            totalAsked: challengeProgress.totalAsked,
            streak: challengeProgress.streak,
            finalTime: activeChallenge.type === 'Gauntlet' ? stopwatchTime : null,
        };

        saveChallengeResult(result);
        setLastChallengeResultId(result.id);
        endChallenge();

    }, [activeChallenge, challengeProgress, endChallenge, saveChallengeResult, setLastChallengeResultId, stopwatchTime]);

    useEffect(() => {
        if (!activeChallenge) return;
        const currentStep = activeChallenge.steps[challengeStepIndex];
        const presetIdToLoad = activeChallenge.type === 'Streak' 
            ? currentStreakPresetId || activeChallenge.steps[0]?.presetId
            : currentStep?.presetId;

        const currentPreset = presets.find(p => p.id === presetIdToLoad);

        if (!currentStep || !currentPreset) return;
        
        initialStepRender.current = true;
        loadPreset(currentPreset);

        if (activeChallenge.type === 'PracticeRoutine' && currentStep.goalType === 'time') { 
            setStepTimeLeft(currentStep.goalValue); 
        } else if (activeChallenge.type === 'Gauntlet' && challengeStepIndex === 0) {
            resetStopwatch();
            toggleStopwatch();
        } else if (activeChallenge.type === 'Streak' && !currentStreakPresetId) {
            setCurrentStreakPresetId(activeChallenge.steps[0]?.presetId);
        }
    }, [activeChallenge, challengeStepIndex, presets, loadPreset, resetStopwatch, toggleStopwatch, currentStreakPresetId]);

    useEffect(() => {
        if (!activeChallenge || activeChallenge.type !== 'PracticeRoutine' || activeChallenge.steps[challengeStepIndex]?.goalType !== 'time') return;
        if (initialStepRender.current) { initialStepRender.current = false; return; }
        if (stepTimeLeft <= 0) {
            if (challengeStepIndex >= activeChallenge.steps.length - 1) {
                finishChallenge();
            } else {
                nextChallengeStep();
            }
            return;
        }
        const intervalId = setInterval(() => setStepTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(intervalId);
    }, [stepTimeLeft, activeChallenge, challengeStepIndex, nextChallengeStep, finishChallenge]);

    const handleProgressUpdate = useCallback((progress) => {
        if (!activeChallenge) return;
        updateChallengeProgress(challengeStepIndex, progress);
        const currentStep = activeChallenge.steps[challengeStepIndex];
        const isFinalStep = challengeStepIndex >= activeChallenge.steps.length - 1;

        const advance = (isFinished) => {
            timeoutRef.current = setTimeout(() => {
                if (isFinished) {
                    if (isStopwatchRunning) toggleStopwatch();
                    finishChallenge();
                } else {
                    nextChallengeStep();
                }
            }, 2000);
        };

        const questionsAnsweredForStep = progress.totalAsked;

        if (activeChallenge.type === 'PracticeRoutine' && currentStep.goalType === 'questions') {
            if (questionsAnsweredForStep >= currentStep.goalValue) advance(isFinalStep);
        } else if (activeChallenge.type === 'Gauntlet') {
            if (questionsAnsweredForStep >= currentStep.goalValue) advance(isFinalStep);
        } else if (activeChallenge.type === 'Streak') {
            if (!progress.wasCorrect) {
                advance(true); // End the challenge on incorrect answer
            } else {
                // On correct answer, pick a new random preset for the next question
                const nextPreset = activeChallenge.steps[Math.floor(Math.random() * activeChallenge.steps.length)];
                setCurrentStreakPresetId(nextPreset.presetId);
            }
        }
    }, [activeChallenge, challengeStepIndex, isStopwatchRunning, nextChallengeStep, toggleStopwatch, updateChallengeProgress, finishChallenge]);
    
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
                />
            </div>
            <div className="w-full p-4 bg-slate-900/50 rounded-lg">
                {getComponentForPreset(currentPreset, { onProgressUpdate: handleProgressUpdate })}
            </div>
            <div className="mt-8 flex justify-center">
                 <button onClick={() => endChallenge()} className="bg-red-700 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg">End Challenge</button>
            </div>
        </div>
    );
};

export default ChallengeRunner;