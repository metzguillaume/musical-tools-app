import React, { useEffect, useCallback, useState } from 'react';
import { useTools } from '../../context/ToolsContext';

// Import all the possible quiz/tool components the runner might need to render
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

// **FIX:** This is now the single source for rendering a component. It now accepts props.
const getComponentForPreset = (preset, props) => {
    if (!preset || !preset.gameId) return null;

    switch (preset.gameId) {
        case 'caged-system-quiz': return <CAGEDSystemQuiz {...props} />;
        case 'chord-trainer': return <ChordTrainer {...props} />;
        case 'interval-ear-trainer': return <IntervalEarTrainer {...props} />;
        case 'melodic-ear-trainer': return <MelodicEarTrainer {...props} />;
        case 'interval-fretboard-quiz': return <IntervalFretboardQuiz {...props} />;
        case 'intervals-quiz': return <IntervalsQuiz {...props} />;
        case 'triad-quiz': return <TriadQuiz {...props} />;
        // Generators don't have progress, so they don't need the prop
        case 'chord-progression-generator': return <ChordProgressionGenerator />;
        case 'interval-generator': return <IntervalGenerator />;
        case 'note-generator': return <NoteGenerator />;
        default: return <p>Error: Unknown game ID "{preset.gameId}"</p>;
    }
};

/**
 * The Challenge HUD component displays the current status of the challenge.
 */
const ChallengeHUD = ({ challenge, stepIndex, progress, timeLeft }) => {
    const currentStep = challenge.steps[stepIndex];
    let goalDisplay = '';

    if (challenge.type === 'PracticeRoutine') {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        goalDisplay = `Time Left: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } else if (challenge.type === 'Gauntlet') {
        goalDisplay = `Answered: ${progress.totalAsked} / ${currentStep.goalValue}`;
    } else if (challenge.type === 'Streak') {
        goalDisplay = `Current Streak: ${progress.streak}`;
    }

    return (
        <div className="w-full bg-slate-900 border-b-4 border-indigo-500 p-4 mb-8 rounded-lg text-center shadow-lg">
            <h2 className="text-2xl font-bold text-teal-300">{challenge.name}</h2>
            <div className="flex justify-around items-center mt-2 text-lg">
                <span className="font-semibold text-gray-300">Step: {stepIndex + 1} / {challenge.steps.length}</span>
                <span className="font-bold text-amber-300">{goalDisplay}</span>
            </div>
        </div>
    );
};


/**
 * The main ChallengeRunner component.
 */
const ChallengeRunner = () => {
    const {
        activeChallenge, challengeStepIndex, challengeProgress, presets, loadPreset, nextChallengeStep, endChallenge, updateChallengeProgress,
        timeLeft, isTimerRunning, toggleTimer, resetTimer,
        isStopwatchRunning, toggleStopwatch, resetStopwatch
    } = useTools();

    const [isFinished, setIsFinished] = useState(false);

    const currentStep = activeChallenge?.steps[challengeStepIndex];
    const currentPreset = presets.find(p => p.id === currentStep?.presetId);

    // This effect runs when the step changes, setting everything up.
    useEffect(() => {
        if (!activeChallenge || !currentStep || !currentPreset) {
            if (activeChallenge && !isFinished) endChallenge();
            return;
        }

        loadPreset(currentPreset);

        if (activeChallenge.type === 'PracticeRoutine') {
            const durationInMinutes = currentStep.goalValue / 60;
            resetTimer(durationInMinutes);
            if (!isTimerRunning) setTimeout(() => toggleTimer(), 50);
        } else if (activeChallenge.type === 'Gauntlet') {
            resetStopwatch();
            if (!isStopwatchRunning) toggleStopwatch();
        }

        return () => {
            if (isTimerRunning) toggleTimer();
        };
    }, [activeChallenge, challengeStepIndex, currentPreset, currentStep, endChallenge, isFinished, isStopwatchRunning, isTimerRunning, loadPreset, resetStopwatch, resetTimer, toggleStopwatch, toggleTimer]);

    // This effect checks for completion of time-based challenges.
    useEffect(() => {
        if (activeChallenge?.type === 'PracticeRoutine' && timeLeft <= 0 && isTimerRunning) {
            if (isTimerRunning) toggleTimer();
            
            if (challengeStepIndex >= activeChallenge.steps.length - 1) {
                setIsFinished(true);
                endChallenge();
            } else {
                nextChallengeStep();
            }
        }
    }, [timeLeft, isTimerRunning, activeChallenge, challengeStepIndex, nextChallengeStep, endChallenge, toggleTimer]);

    // This is the new callback function that quizzes will call.
    const handleProgressUpdate = useCallback((progress) => {
        if (!activeChallenge || !currentStep) return;

        updateChallengeProgress({
            totalAsked: progress.totalAsked,
            score: progress.score,
            streak: progress.wasCorrect ? (challengeProgress?.streak || 0) + 1 : 0
        });

        if (activeChallenge.type === 'Gauntlet' && progress.totalAsked >= currentStep.goalValue) {
            if (isStopwatchRunning) toggleStopwatch();
            setIsFinished(true);
            endChallenge();
        } else if (activeChallenge.type === 'Streak' && !progress.wasCorrect) {
            setIsFinished(true);
            endChallenge();
        }
    }, [activeChallenge, currentStep, challengeProgress, updateChallengeProgress, endChallenge, isStopwatchRunning, toggleStopwatch]);
    

    if (isFinished) {
        return (
            <div className="text-center p-8">
                <h2 className="text-4xl font-bold text-green-400">Challenge Complete!</h2>
                <button onClick={() => setIsFinished(false)} className="mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg">
                    Return to Hub
                </button>
            </div>
        );
    }
    
    if (!activeChallenge || !currentPreset) {
        return (
             <div className="text-center p-8">
                <h2 className="text-2xl font-bold text-gray-400">Loading Challenge...</h2>
            </div>
        );
    }
    
    return (
        <div className="w-full">
            <ChallengeHUD 
                challenge={activeChallenge} 
                stepIndex={challengeStepIndex}
                progress={challengeProgress || { totalAsked: 0, streak: 0 }}
                timeLeft={timeLeft}
            />
            
            <div className="w-full p-4 bg-slate-900/50 rounded-lg">
                {/* **FIX:** Directly call the single helper function and pass the props object. */}
                {getComponentForPreset(currentPreset, { onProgressUpdate: handleProgressUpdate })}
            </div>

            <div className="mt-8 flex justify-center">
                 <button onClick={() => { setIsFinished(true); endChallenge(); }} className="bg-red-700 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg">
                    End Challenge Manually
                </button>
            </div>
        </div>
    );
};

export default ChallengeRunner;