import React from 'react';
import { useTools } from '../../context/ToolsContext';

export const ChallengeResult = ({ result, onDelete, isSummary = false }) => {
    const { presets } = useTools();

    const getPresetName = (presetId) => presets.find(p => p.id === presetId)?.name || 'Unknown Preset';
    const accuracy = result.totalAsked > 0 ? ((result.totalScore / result.totalAsked) * 100).toFixed(0) : 0;

    const getBorderColor = () => {
        if (isSummary) return 'border-indigo-500';
        switch (result.challengeType) {
            case 'PracticeRoutine': return 'border-blue-600';
            case 'Gauntlet': return 'border-yellow-500';
            case 'Streak': return 'border-green-600';
            default: return 'border-slate-700';
        }
    };

    const SummaryView = () => (
        <summary className="list-none cursor-pointer p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                {/* Left Side: Title and Date */}
                <div className="flex-grow">
                    <div className="flex justify-between items-start">
                        <h3 className="text-xl font-semibold text-teal-300">{result.challengeName}</h3>
                        {onDelete && (
                            <button onClick={(e) => { e.preventDefault(); onDelete(); }} className="md:hidden text-red-500 hover:text-red-400 font-bold text-3xl px-2 leading-none flex-shrink-0 ml-4">-</button>
                        )}
                    </div>
                    <p className="text-gray-400 text-sm mt-1">
                        {new Date(result.completionTime).toLocaleString()}
                    </p>
                </div>

                {/* Right Side: Key Stats (with reduced spacing) */}
                <div className="flex items-center gap-2 md:ml-4 mt-4 md:mt-0 flex-shrink-0">
                    <div className="text-left w-24">
                        <span className="text-sm text-gray-400">Score</span>
                        <p className="font-bold text-lg">{result.totalScore}/{result.totalAsked}</p>
                    </div>
                    <div className="text-left w-24">
                        <span className="text-sm text-gray-400">Accuracy</span>
                        <p className="font-bold text-lg">{accuracy}%</p>
                    </div>
                    <div className="text-left w-24">
                        <span className="text-sm text-gray-400">Time</span>
                        {result.challengeType === 'Gauntlet' ? (
                            <p className="font-bold text-lg font-mono">{new Date(result.finalTime).toISOString().slice(14, 22)}</p>
                        ) : (
                            <p className="font-bold text-lg text-gray-500">-</p>
                        )}
                    </div>
                    <div className="text-left w-24">
                        <span className="text-sm text-gray-400">Streak</span>
                        {result.challengeType === 'Streak' ? (
                            <p className="font-bold text-lg">{result.streak}</p>
                        ) : (
                            <p className="font-bold text-lg text-gray-500">-</p>
                        )}
                    </div>
                    {onDelete && (
                        <button onClick={(e) => { e.preventDefault(); onDelete(); }} className="hidden md:block text-red-500 hover:text-red-400 font-bold text-3xl px-2 leading-none flex-shrink-0 ml-4">-</button>
                    )}
                </div>
            </div>
        </summary>
    );

    // The detailed view shown when expanded
    const DetailedView = () => (
        <div className="p-4 border-t border-slate-600/50">
             <h4 className="font-bold text-indigo-300 mb-2">Step Breakdown</h4>
             <div className="space-y-3">
                {result.steps.map((step, index) => (
                    <div key={index} className="p-3 bg-slate-800 rounded-lg text-left">
                        <p className="font-semibold text-gray-200">Step {index + 1}: {getPresetName(step.presetId)}</p>
                        <div className="flex justify-between text-sm mt-1">
                            <span className="text-gray-400">
                                Goal: {step.goalType === 'time' ? `${step.goalValue / 60} min` : `${step.goalValue || 'N/A'} questions`}
                            </span>
                            <span className="font-semibold text-white">
                                Result: {result.stepResults[index].score} / {result.stepResults[index].asked}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    if (isSummary) {
        return (
            <div className={`bg-slate-800 rounded-lg w-full max-w-2xl mx-auto border-2 ${getBorderColor()} shadow-lg`}>
                <div className="p-0">
                    <SummaryView />
                </div>
                <DetailedView />
            </div>
        );
    }
    
    return (
        <details className={`bg-slate-800 rounded-lg w-full max-w-2xl mx-auto border-2 ${getBorderColor()}`}>
            <SummaryView />
            <DetailedView />
        </details>
    );
};