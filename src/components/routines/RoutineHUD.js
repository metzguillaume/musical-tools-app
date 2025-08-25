import React from 'react';

const RoutineHUD = ({ routine, stepIndex, progress, timeLeft, stopwatchTime, onEndRoutine }) => {
    const currentStep = routine.steps[stepIndex];

    const formatTime = (ms) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };
    
    const currentProgress = progress || {};
    let goalDisplay = '';
    let goalLabel = 'Goal';

    if (routine.type === 'PracticeRoutine' && currentStep.goalType === 'time') {
        goalLabel = 'Time Left';
        goalDisplay = formatTime(timeLeft * 1000);
    } else if ((routine.type === 'PracticeRoutine' && currentStep.goalType === 'questions') || routine.type === 'Gauntlet') {
        goalLabel = 'Answered';
        const stepProgress = currentProgress.stepResults ? currentProgress.stepResults[stepIndex] : { asked: 0 };
        goalDisplay = `${stepProgress?.asked || 0} / ${currentStep.goalValue}`;
    } else if (routine.type === 'Streak') {
        goalLabel = 'Current Streak';
        goalDisplay = `${currentProgress.streak || 0}`;
    }

    const StatDisplay = ({ label, value }) => (
        <div className="bg-slate-800/50 p-3 rounded-lg text-center">
            <div className="text-sm text-gray-400">{label}</div>
            <div className="text-2xl font-bold font-mono text-white">{value}</div>
        </div>
    );

    return (
        <div className="bg-slate-900/70 border border-slate-700 p-4 rounded-lg flex flex-col gap-4 h-full">
            <h2 className="text-xl font-bold text-teal-300 text-center border-b border-slate-700 pb-3">{routine.name}</h2>
            
            <div className="space-y-3">
                {/* FIXED: This will now only show for non-Streak routines */}
                {routine.type !== 'Streak' && (
                    <StatDisplay label="Step" value={`${stepIndex + 1} / ${routine.steps.length}`} />
                )}

                <StatDisplay label={goalLabel} value={goalDisplay} />
                
                {routine.type === 'Gauntlet' && (
                    <StatDisplay label="Total Time" value={new Date(stopwatchTime).toISOString().slice(14, 22)} />
                )}
            </div>

            {/* NEW: Display for Custom Instruction */}
            {currentStep.instruction && (
                <div className="bg-slate-800/50 p-3 rounded-lg text-center">
                    <div className="text-sm text-amber-400 font-bold">Your Note</div>
                    <p className="text-md text-white italic mt-1">"{currentStep.instruction}"</p>
                </div>
            )}
            
            <div className="flex-grow"></div>

            <button onClick={onEndRoutine} className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-3 rounded-lg text-lg">
                End Routine
            </button>
        </div>
    );
};

export default RoutineHUD;