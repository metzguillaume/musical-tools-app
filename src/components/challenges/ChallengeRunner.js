import React, { useEffect } from 'react';
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

/**
 * A helper function to map a preset's gameId to the actual component.
 * This is crucial for dynamically rendering the correct exercise.
 */
const getComponentForPreset = (preset) => {
    if (!preset || !preset.gameId) return null;

    switch (preset.gameId) {
        case 'caged-system-quiz':
            return <CAGEDSystemQuiz />;
        case 'chord-progression-generator':
            return <ChordProgressionGenerator />;
        case 'chord-trainer':
            return <ChordTrainer />;
        case 'interval-ear-trainer':
            return <IntervalEarTrainer />;
        case 'melodic-ear-trainer':
            return <MelodicEarTrainer />;
        case 'interval-fretboard-quiz':
            return <IntervalFretboardQuiz />;
        case 'interval-generator':
            return <IntervalGenerator />;
        case 'intervals-quiz':
            return <IntervalsQuiz />;
        case 'note-generator':
            return <NoteGenerator />;
        case 'triad-quiz':
            return <TriadQuiz />;
        default:
            return <p>Error: Unknown game ID "{preset.gameId}"</p>;
    }
};

/**
 * The Challenge HUD component displays the current status of the challenge.
 */
const ChallengeHUD = ({ challenge, stepIndex, timeLeft, stopwatchTime }) => {
    let goalDisplay = '';
    if (challenge.type === 'PracticeRoutine') {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        goalDisplay = `Time Remaining: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    // Future logic for other types will go here

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
        activeChallenge, challengeStepIndex, presets, loadPreset, nextChallengeStep, endChallenge,
        timeLeft, isTimerRunning, toggleTimer, resetTimer,
        stopwatchTime
        // Removed unused stopwatch variables for now
    } = useTools();

    // Find the current step and its corresponding preset from the user's library
    const currentStep = activeChallenge?.steps[challengeStepIndex];
    const currentPreset = presets.find(p => p.id === currentStep?.presetId);

    // This effect is the core of the runner. It runs when the step changes.
    useEffect(() => {
        if (!activeChallenge || !currentStep || !currentPreset) {
            if (activeChallenge) endChallenge();
            return;
        }
        
        loadPreset(currentPreset);

        if (activeChallenge.type === 'PracticeRoutine' && currentStep.goalType === 'time') {
            const durationInMinutes = currentStep.goalValue / 60;
            resetTimer(durationInMinutes);
            if (!isTimerRunning) {
                // Use a timeout to ensure the state update from resetTimer has propagated
                setTimeout(() => toggleTimer(), 50);
            }
        }
        
        // This cleanup function now properly handles stopping the timer
        return () => {
            if (isTimerRunning) {
                toggleTimer();
            }
        };
    // Correctly added all dependencies for this effect
    }, [activeChallenge, challengeStepIndex, currentPreset, currentStep, endChallenge, isTimerRunning, loadPreset, resetTimer, toggleTimer]);

    
    // This effect checks the completion condition for time-based challenges.
    useEffect(() => {
        if (activeChallenge?.type === 'PracticeRoutine' && timeLeft <= 0 && isTimerRunning) {
             toggleTimer();
             
             if (challengeStepIndex >= activeChallenge.steps.length - 1) {
                 endChallenge();
             } else {
                 nextChallengeStep();
             }
        }
    // Correctly added all dependencies for this effect
    }, [timeLeft, activeChallenge, challengeStepIndex, isTimerRunning, endChallenge, nextChallengeStep, toggleTimer]);


    if (!activeChallenge || !currentPreset) {
        return (
            <div className="text-center p-8">
                <h2 className="text-2xl font-bold text-gray-400">No Active Challenge.</h2>
                <p className="text-gray-500">Go to the Challenge Hub to start a new challenge.</p>
            </div>
        );
    }
    
    return (
        <div className="w-full">
            <ChallengeHUD 
                challenge={activeChallenge} 
                stepIndex={challengeStepIndex}
                timeLeft={timeLeft}
                stopwatchTime={stopwatchTime}
            />
            
            <div className="w-full p-4 bg-slate-900/50 rounded-lg">
                {getComponentForPreset(currentPreset)}
            </div>

            <div className="mt-8 flex justify-center">
                 <button onClick={endChallenge} className="bg-red-700 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg">
                    End Challenge Manually
                </button>
            </div>
        </div>
    );
};

export default ChallengeRunner;