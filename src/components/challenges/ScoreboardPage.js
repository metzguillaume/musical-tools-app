import React, { useState, useMemo, useEffect } from 'react';
import { useTools } from '../../context/ToolsContext';
import { ChallengeResult } from './ChallengeResult';
import SectionHeader from '../common/SectionHeader';

const ScoreboardPage = () => {
    const { scores, presets, lastChallengeResultId, setLastChallengeResultId, clearScoreboard } = useTools();
    const [nameFilter, setNameFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [gameFilter, setGameFilter] = useState('All');

    // Find the most recent result if we were just redirected here
    const latestResult = useMemo(() => {
        if (!lastChallengeResultId) return null;
        return scores.find(s => s.id === lastChallengeResultId);
    }, [lastChallengeResultId, scores]);

    // Automatically generate a list of unique game names found in the scoreboard
    const availableGames = useMemo(() => {
        const gameNames = new Set();
        scores.forEach(score => {
            score.steps.forEach(step => {
                const preset = presets.find(p => p.id === step.presetId);
                if (preset) {
                    gameNames.add(preset.gameName);
                }
            });
        });
        return ['All', ...Array.from(gameNames).sort()];
    }, [scores, presets]);

    const filteredScores = useMemo(() => {
        // Exclude the latest result from the main list if it's being shown at the top
        const olderScores = lastChallengeResultId ? scores.filter(s => s.id !== lastChallengeResultId) : scores;

        return olderScores.filter(score => {
            // Name Filter
            const nameMatch = score.challengeName.toLowerCase().includes(nameFilter.toLowerCase());
            
            // Type Filter
            const typeMatch = typeFilter === 'All' || score.challengeType === typeFilter;

            // Game Filter
            const gameMatch = gameFilter === 'All' || score.steps.some(step => {
                const preset = presets.find(p => p.id === step.presetId);
                return preset && preset.gameName === gameFilter;
            });

            return nameMatch && typeMatch && gameMatch;
        });
    }, [scores, nameFilter, typeFilter, gameFilter, lastChallengeResultId, presets]);
    
    // Clear the redirect ID after the component has rendered
    useEffect(() => {
        return () => {
            if (lastChallengeResultId) {
                setLastChallengeResultId(null);
            }
        };
    }, [lastChallengeResultId, setLastChallengeResultId]);

    return (
        <div className="max-w-4xl mx-auto">
            {latestResult && (
                <div className="mb-12">
                    <h2 className="text-4xl font-bold text-green-400 text-center mb-4">Congratulations!</h2>
                    <ChallengeResult result={latestResult} />
                </div>
            )}
            
            <SectionHeader title="Challenge Scoreboard" />

            <div className="grid grid-cols-1 md:grid-cols-4 items-end gap-4 my-6 p-4 bg-slate-700/50 rounded-lg">
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-300 mb-1">Filter by Name</label>
                    <input 
                        type="text"
                        placeholder="Enter challenge name..."
                        value={nameFilter}
                        onChange={(e) => setNameFilter(e.target.value)}
                        className="w-full p-2 rounded-md bg-slate-600 text-white"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1">Filter by Type</label>
                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full p-2 rounded-md bg-slate-600 text-white">
                        <option value="All">All Types</option>
                        <option value="PracticeRoutine">Practice Routine</option>
                        <option value="Gauntlet">The Gauntlet</option>
                        <option value="Streak">The Streak</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-1">Filter by Game</label>
                    <select value={gameFilter} onChange={(e) => setGameFilter(e.target.value)} className="w-full p-2 rounded-md bg-slate-600 text-white">
                        {availableGames.map(game => <option key={game} value={game}>{game}</option>)}
                    </select>
                </div>
                <div className="md:col-span-4 mt-4">
                    <button onClick={clearScoreboard} className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg">
                        Clear History
                    </button>
                </div>
            </div>

            <div className="space-y-8">
                {filteredScores.length > 0 ? (
                    filteredScores.map(score => <ChallengeResult key={score.id} result={score} />)
                ) : (
                     <div className="text-center p-8 bg-slate-700/50 rounded-lg">
                        <h3 className="text-xl font-semibold text-gray-300">No Results Found</h3>
                        <p className="text-gray-400 mt-2">No scoreboard entries match your current filter criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScoreboardPage;