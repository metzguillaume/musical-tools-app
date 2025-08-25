import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useTools } from '../../context/ToolsContext';
import RoutineHUD from './RoutineHUD';
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

const getComponentForPreset = (preset, props) => { if (!preset || !preset.gameId) return null; switch (preset.gameId) { case 'caged-system-quiz': return <CAGEDSystemQuiz {...props} />; case 'chord-trainer': return <ChordTrainer {...props} challengeSettings={preset.settings} />; case 'interval-ear-trainer': return <IntervalEarTrainer {...props} />; case 'melodic-ear-trainer': return <MelodicEarTrainer {...props} />; case 'interval-fretboard-quiz': return <IntervalFretboardQuiz {...props} />; case 'intervals-quiz': return <IntervalsQuiz {...props} />; case 'triad-quiz': return <TriadQuiz {...props} />; case 'chord-progression-generator': return <ChordProgressionGenerator />; case 'interval-generator': return <IntervalGenerator />; case 'note-generator': return <NoteGenerator />; default: return <p>Error: Unknown game ID "{preset.gameId}"</p>; } };
const RoutineHUDMobile = ({ routine, stepIndex, progress, timeLeft, stopwatchTime, onEndRoutine }) => { const currentStep = routine.steps[stepIndex]; const formatTime = (ms) => { const minutes = Math.floor(ms / 60000); const seconds = Math.floor((ms % 60000) / 1000); return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`; }; const currentProgress = progress || {}; let goalDisplay = ''; if (routine.type === 'PracticeRoutine' && currentStep.goalType === 'time') { goalDisplay = `Time Left: ${formatTime(timeLeft * 1000)}`; } else if ((routine.type === 'PracticeRoutine' && currentStep.goalType === 'questions') || routine.type === 'Gauntlet') { const stepProgress = currentProgress.stepResults ? currentProgress.stepResults[stepIndex] : { asked: 0 }; goalDisplay = `Answered: ${stepProgress?.asked || 0} / ${currentStep.goalValue}`; } else if (routine.type === 'Streak') { goalDisplay = `Current Streak: ${currentProgress.streak || 0}`; } return ( <div className="w-full bg-slate-900 border-b-4 border-indigo-500 p-4 mb-8 rounded-lg text-center shadow-lg"> <h2 className="text-2xl font-bold text-teal-300">{routine.name}</h2> <div className="grid grid-cols-3 justify-items-center items-center mt-2 text-lg"><span className="font-semibold text-gray-300 justify-self-start">Step: {stepIndex + 1} / {routine.steps.length}</span><div className="flex flex-col items-center"><span className="font-bold text-amber-300">{goalDisplay}</span>{routine.type === 'Gauntlet' && stopwatchTime !== undefined && (<span className="font-mono text-xl text-yellow-300">{new Date(stopwatchTime).toISOString().slice(14, 22)}</span>)}</div><button onClick={onEndRoutine} className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm justify-self-end">End Routine</button></div> </div> ); };


const RoutineRunner = () => {
    const {
        activeRoutine, routineStepIndex, routineProgress, setRoutineProgress, presets, loadPreset, nextRoutineStep, endRoutine, updateRoutineProgress, finishRoutine,
        isStopwatchRunning, toggleStopwatch, resetStopwatch, stopwatchTime
    } = useTools();

    const [stepTimeLeft, setStepTimeLeft] = useState(0);
    const timeoutRef = useRef(null);
    const gameAreaRef = useRef(null);
    const gauntletStarted = useRef(false);
    const loadedPresetIdRef = useRef(null); // NEW: "Memory" for the currently loaded preset.
    
    const [streakState, setStreakState] = useState({ currentStepIndex: 0, questionsAsked: 0 });

    const callbacks = useRef();
    useEffect(() => { callbacks.current = { finishRoutine, nextRoutineStep, setRoutineProgress, routineProgress, activeRoutine, routineStepIndex }; }, [finishRoutine, nextRoutineStep, setRoutineProgress, routineProgress, activeRoutine, routineStepIndex]);

    // This effect sets up the current step for any routine type.
    useEffect(() => {
        if (!activeRoutine) {
            gauntletStarted.current = false;
            loadedPresetIdRef.current = null; // Reset preset memory when routine ends.
            return;
        }

        let currentStepIndexForPreset = routineStepIndex;
        if (activeRoutine.type === 'Streak') {
            currentStepIndexForPreset = streakState.currentStepIndex;
        }

        const currentStep = activeRoutine.steps[currentStepIndexForPreset];
        const currentPreset = presets.find(p => p.id === currentStep?.presetId);
        
        if (!currentStep || !currentPreset) return;
        
        // MODIFIED: This condition prevents the re-render loop.
        // It only loads a preset if the required preset is different from the one already loaded.
        if (currentPreset.id !== loadedPresetIdRef.current) {
            loadPreset(currentPreset);
            loadedPresetIdRef.current = currentPreset.id;
        }
        
        if (activeRoutine.type === 'Gauntlet' && routineStepIndex === 0 && !gauntletStarted.current) {
            resetStopwatch();
            toggleStopwatch();
            gauntletStarted.current = true;
        } else if (activeRoutine.type === 'Streak' && routineStepIndex === 0 && streakState.questionsAsked === 0 && !loadedPresetIdRef.current) {
            // Initialize the very first step of a new streak.
            const firstStepIndex = Math.floor(Math.random() * activeRoutine.steps.length);
            setStreakState({ currentStepIndex: firstStepIndex, questionsAsked: 0 });
        }
    }, [activeRoutine, routineStepIndex, presets, loadPreset, resetStopwatch, toggleStopwatch, streakState]);
    
    // This effect handles the timer for Practice Routines.
    useEffect(() => {
        if (activeRoutine?.type !== 'PracticeRoutine' || activeRoutine.steps[routineStepIndex]?.goalType !== 'time') { return; }
        const currentStep = activeRoutine.steps[routineStepIndex];
        setStepTimeLeft(currentStep.goalValue);
        const intervalId = setInterval(() => {
            setStepTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(intervalId);
                    const { routineStepIndex, activeRoutine, finishRoutine, nextRoutineStep, routineProgress } = callbacks.current;
                    if (routineStepIndex >= activeRoutine.steps.length - 1) { finishRoutine(routineProgress); } else { nextRoutineStep(); }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(intervalId);
    }, [activeRoutine, routineStepIndex]);

// This function handles progress updates from quizzes.
    const handleProgressUpdate = useCallback((progress) => {
        if (!activeRoutine) return;

        let currentStepIdx = (activeRoutine.type === 'Streak') ? streakState.currentStepIndex : routineStepIndex;
        // The 'routineProgress' variable holds the state BEFORE this update. Its streak count is the one we want to save.
        const newProgress = updateRoutineProgress(currentStepIdx, progress, routineProgress);
        const currentStep = activeRoutine.steps[currentStepIdx];
        const isFinalStep = routineStepIndex >= activeRoutine.steps.length - 1;
        
        const advance = (isFinished, finalProgress) => { timeoutRef.current = setTimeout(() => { if (isFinished) { if (isStopwatchRunning) toggleStopwatch(); finishRoutine(finalProgress); } else { nextRoutineStep(); } }, 2000); };
        
        if (activeRoutine.type === 'Streak') {
            if (!progress.wasCorrect) {
                // FIXED: When the streak ends, we create a final result object
                // that uses the streak count from *before* it was reset to 0.
                const finalProgress = { ...newProgress, streak: routineProgress.streak || 0 };
                advance(true, finalProgress);
            } else {
                // If correct, wait 2 seconds before choosing the next question.
                timeoutRef.current = setTimeout(() => {
                    const newQuestionsAsked = streakState.questionsAsked + 1;
                    const requiredQuestions = currentStep.questionsInARow || 1;
                    
                    if (newQuestionsAsked >= requiredQuestions) {
                        let nextStepIndex;
                        do {
                            nextStepIndex = Math.floor(Math.random() * activeRoutine.steps.length);
                        } while (activeRoutine.steps.length > 1 && nextStepIndex === streakState.currentStepIndex);
                        setStreakState({ currentStepIndex: nextStepIndex, questionsAsked: 0 });
                    } else {
                        setStreakState(prev => ({ ...prev, questionsAsked: newQuestionsAsked }));
                    }
                }, 2000);
            }
        } else {
            const questionsAnsweredForStep = newProgress.stepResults[currentStepIdx].asked;
            if (activeRoutine.type === 'PracticeRoutine' && currentStep.goalType === 'questions') { if (questionsAnsweredForStep >= currentStep.goalValue) advance(isFinalStep, newProgress); } 
            else if (activeRoutine.type === 'Gauntlet') { if (questionsAnsweredForStep >= currentStep.goalValue) advance(isFinalStep, newProgress); }
        }
    }, [activeRoutine, routineStepIndex, routineProgress, isStopwatchRunning, nextRoutineStep, toggleStopwatch, updateRoutineProgress, finishRoutine, streakState]);
    
    useEffect(() => { return () => clearTimeout(timeoutRef.current); }, []);

    let presetIdToLoad = activeRoutine?.steps[routineStepIndex]?.presetId;
    if (activeRoutine?.type === 'Streak') {
        presetIdToLoad = activeRoutine.steps[streakState.currentStepIndex]?.presetId;
    }
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
            <div className="md:hidden flex-shrink-0"><RoutineHUDMobile {...hudProps} /></div>
            <div ref={gameAreaRef} className="bg-slate-900/50 rounded-lg flex-grow overflow-y-auto min-h-0"><div className="p-4">{getComponentForPreset(currentPreset, { onProgressUpdate: handleProgressUpdate })}</div></div>
            <div className="hidden md:block md:w-56 lg:w-64 flex-shrink-0"><RoutineHUD {...hudProps} /></div>
        </div>
    );
};

export default RoutineRunner;