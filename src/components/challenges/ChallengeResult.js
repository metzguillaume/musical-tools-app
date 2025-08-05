import React from 'react';
import { useTools } from '../../context/ToolsContext';

export const ChallengeResult = ({ result }) => {
    const { presets } = useTools(); // stopwatchTime might be needed for Gauntlets

    const getPresetName = (presetId) => presets.find(p => p.id === presetId)?.name || 'Unknown Preset';

    const accuracy = result.totalAsked > 0 ? ((result.totalScore / result.totalAsked) * 100).toFixed(0) : 0;

    return (
        <div className="text-center p-6 md:p-8 bg-slate-800 rounded-lg w-full max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold text-teal-300 mt-2 mb-2">{result.challengeName}</h3>
            <p className="text-gray-400 text-sm mb-6">
                Completed on: {new Date(result.completionTime).toLocaleString()}
            </p>

            <div className="space-y-4 mb-6">
                {result.steps.map((step, index) => (
                    <div key={index} className="p-3 bg-slate-700/50 rounded-lg text-left">
                        <p className="font-bold text-indigo-300">Step {index + 1}: {getPresetName(step.presetId)}</p>
                        <div className="flex justify-between text-sm mt-1">
                            <span className="text-gray-300">
                                Goal: {step.goalType === 'time' ? `${step.goalValue / 60} min` : `${step.goalValue || 'N/A'} questions`}
                            </span>
                            <span className="font-semibold text-white">
                                Result: {result.stepResults[index].score} / {result.stepResults[index].asked}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-4 text-left p-4 bg-slate-900/50 rounded-lg">
                <div className="font-semibold text-gray-300 text-lg">Total Score:</div>
                <div className="font-bold text-white text-xl">{result.totalScore} / {result.totalAsked}</div>
                
                <div className="font-semibold text-gray-300 text-lg">Overall Accuracy:</div>
                <div className="font-bold text-white text-xl">{accuracy}%</div>

                {result.challengeType === 'Gauntlet' && ( <> <div className="font-semibold text-gray-300 text-lg">Final Time:</div><div className="font-bold text-white text-xl">{new Date(result.finalTime).toISOString().slice(14, 22)}</div></>)}
                {result.challengeType === 'Streak' && ( <> <div className="font-semibold text-gray-300 text-lg">Longest Streak:</div><div className="font-bold text-white text-xl">{result.streak}</div></> )}
            </div>
        </div>
    );
};