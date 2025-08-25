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
import RoutineHUD from './RoutineHUD';

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

// This is the original, horizontal HUD for mobile view
const RoutineHUDMobile = ({ routine, stepIndex, progress, timeLeft, stopwatchTime, onEndRoutine }) => {
    const currentStep = routine.steps[stepIndex];
    const formatTime = (ms) => { const minutes = Math.floor(ms / 60000); const seconds = Math.floor((ms % 60000) / 1000); return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`; };
    const currentProgress = progress || {};
    let goalDisplay = '';
    if (routine.type === 'PracticeRoutine' && currentStep.goalType === 'time') { goalDisplay = `Time Left: ${formatTime(timeLeft * 1000)}`; } else if ((routine.type === 'PracticeRoutine' && currentStep.goalType === 'questions') || routine.type === 'Gauntlet') { const stepProgress = currentProgress.stepResults ? currentProgress.stepResults[stepIndex] : { asked: 0 }; goalDisplay = `Answered: ${stepProgress?.asked || 0} / ${currentStep.goalValue}`; } else if (routine.type === 'Streak') { goalDisplay = `Current Streak: ${currentProgress.streak || 0}`; }
    return (
        <div className="w-full bg-slate-900 border-b-4 border-indigo-500 p-4 mb-8 rounded-lg text-center shadow-lg">
            <h2 className="text-2xl font-bold text-teal-300">{routine.name}</h2>
            <div className="grid grid-cols-3 justify-items-center items-center mt-2 text-lg"><span className="font-semibold text-gray-300 justify-self-start">Step: {stepIndex + 1} / {routine.steps.length}</span><div className="flex flex-col items-center"><span className="font-bold text-amber-300">{goalDisplay}</span>{routine.type === 'Gauntlet' && stopwatchTime !== undefined && (<span className="font-mono text-xl text-yellow-300">{new Date(stopwatchTime).toISOString().slice(14, 22)}</span>)}</div><button onClick={onEndRoutine} className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm justify-self-end">End Routine</button></div>
        </div>
    );
};


const RoutineRunner = () => {
    const {
        activeRoutine, routineStepIndex, routineProgress, setRoutineProgress, presets, loadPreset, nextRoutineStep, endRoutine, updateRoutineProgress, finishRoutine,
        isStopwatchRunning, toggleStopwatch, resetStopwatch, stopwatchTime
    } = useTools();

    const [stepTimeLeft, setStepTimeLeft] = useState(0);
    const [currentStreakPresetId, setCurrentStreakPresetId] = useState(null);
    const timeoutRef = useRef(null);
    const gameAreaRef = useRef(null);

    // --- START: New logic using Refs to prevent stale closures ---
    const callbacks = useRef();
    useEffect(() => {
        callbacks.current = {
            finishRoutine,
            nextRoutineStep,
            setRoutineProgress,
            routineProgress, // also keep track of the latest progress
            activeRoutine,
            routineStepIndex
        };
    }, [finishRoutine, nextRoutineStep, setRoutineProgress, routineProgress, activeRoutine, routineStepIndex]);
    // --- END: New logic ---

    // Effect for setting up the current step
    useEffect(() => {
        if (!activeRoutine) return;
        const currentStep = activeRoutine.steps[routineStepIndex];
        const presetIdToLoad = activeRoutine.type === 'Streak' ? currentStreakPresetId || activeRoutine.steps[0]?.presetId : currentStep?.presetId;
        const currentPreset = presets.find(p => p.id === presetIdToLoad);
        if (!currentStep || !currentPreset) return;
        loadPreset(currentPreset);
        if (activeRoutine.type === 'Gauntlet' && routineStepIndex === 0) {
            resetStopwatch();
            toggleStopwatch();
        } else if (activeRoutine.type === 'Streak' && !currentStreakPresetId) {
            setCurrentStreakPresetId(activeRoutine.steps[0]?.presetId);
        }
    }, [activeRoutine, routineStepIndex, presets, loadPreset, resetStopwatch, toggleStopwatch, currentStreakPresetId]);
    
    // MODIFIED: This is the definitive timer effect
    useEffect(() => {
        if (activeRoutine?.type !== 'PracticeRoutine' || activeRoutine.steps[routineStepIndex]?.goalType !== 'time') {
            return;
        }

        const currentStep = activeRoutine.steps[routineStepIndex];
        setStepTimeLeft(currentStep.goalValue);

        const intervalId = setInterval(() => {
            setStepTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(intervalId);
                    const { routineStepIndex, activeRoutine, finishRoutine, nextRoutineStep, routineProgress } = callbacks.current;
                    if (routineStepIndex >= activeRoutine.steps.length - 1) {
                        finishRoutine(routineProgress);
                    } else {
                        nextRoutineStep();
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, [activeRoutine, routineStepIndex]); // Minimal, stable dependencies

    const handleProgressUpdate = useCallback((progress) => {
        if (!activeRoutine) return;
        const newProgress = updateRoutineProgress(routineStepIndex, progress, routineProgress);
        const currentStep = activeRoutine.steps[routineStepIndex];
        const isFinalStep = routineStepIndex >= activeRoutine.steps.length - 1;
        const advance = (isFinished, finalProgress) => {
            timeoutRef.current = setTimeout(() => {
                if (isFinished) {
                    if (isStopwatchRunning) toggleStopwatch();
                    finishRoutine(finalProgress);
                } else {
                    nextRoutineStep();
                }
            }, 2000);
        };
        const questionsAnsweredForStep = progress.totalAsked;
        if (activeRoutine.type === 'PracticeRoutine' && currentStep.goalType === 'questions') { if (questionsAnsweredForStep >= currentStep.goalValue) advance(isFinalStep, newProgress); } else if (activeRoutine.type === 'Gauntlet') { if (questionsAnsweredForStep >= currentStep.goalValue) advance(isFinalStep, newProgress); } else if (activeRoutine.type === 'Streak') { if (!progress.wasCorrect) { advance(true, newProgress); } else { const nextPreset = activeRoutine.steps[Math.floor(Math.random() * activeRoutine.steps.length)]; setCurrentStreakPresetId(nextPreset.presetId); } }
    }, [activeRoutine, routineStepIndex, routineProgress, isStopwatchRunning, nextRoutineStep, toggleStopwatch, updateRoutineProgress, finishRoutine]);
    
    useEffect(() => { return () => clearTimeout(timeoutRef.current); }, []);

    const presetIdToLoad = activeRoutine?.type === 'Streak' ? currentStreakPresetId : activeRoutine?.steps[routineStepIndex]?.presetId;
    const currentPreset = presets.find(p => p.id === presetIdToLoad);
    
    if (!activeRoutine || !currentPreset) {
        return ( <div className="text-center p-8"><h2 className="text-2xl font-bold text-gray-400">Loading Routine...</h2></div> );
    }
    
    const hudProps = {
        routine: activeRoutine,
        stepIndex: routineStepIndex,
        progress: routineProgress,
        timeLeft: stepTimeLeft,
        stopwatchTime: stopwatchTime,
        onEndRoutine: () => endRoutine()
    };
    
    return (
        <div className="w-full h-full md:flex md:flex-row md:gap-8">
            <div className="md:hidden flex-shrink-0">
                <RoutineHUDMobile {...hudProps} />
            </div>
            <div ref={gameAreaRef} className="bg-slate-900/50 rounded-lg flex-grow overflow-y-auto min-h-0">
                <div className="p-4">
                    {getComponentForPreset(currentPreset, { onProgressUpdate: handleProgressUpdate })}
                </div>
            </div>
            <div className="hidden md:block md:w-56 lg:w-64 flex-shrink-0">
                <RoutineHUD {...hudProps} />
            </div>
        </div>
    );
};

export default RoutineRunner;