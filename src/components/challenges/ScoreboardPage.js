import React, { useState, useMemo, useEffect } from 'react';
import { useTools } from '../../context/ToolsContext';
import { ChallengeResult } from './ChallengeResult';
import SectionHeader from '../common/SectionHeader';

const ScoreboardPage = () => {
    const { scores, lastChallengeResultId, setLastChallengeResultId, clearScoreboard } = useTools();
    const [filter, setFilter] = useState('');

    // Find the most recent result if we were just redirected here
    const latestResult = useMemo(() => {
        if (!lastChallengeResultId) return null;
        return scores.find(s => s.id === lastChallengeResultId);
    }, [lastChallengeResultId, scores]);

    const filteredScores = useMemo(() => {
        // Exclude the latest result from the main list if it's being shown at the top
        const olderScores = lastChallengeResultId ? scores.filter(s => s.id !== lastChallengeResultId) : scores;
        if (!filter) return olderScores;
        return olderScores.filter(s => s.challengeName.toLowerCase().includes(filter.toLowerCase()));
    }, [scores, filter, lastChallengeResultId]);
    
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

            <div className="flex justify-between items-center my-6">
                <input 
                    type="text"
                    placeholder="Filter by name..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="p-2 rounded-md bg-slate-700 text-white"
                />
                <button onClick={clearScoreboard} className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg">
                    Clear History
                </button>
            </div>

            <div className="space-y-8">
                {filteredScores.length > 0 ? (
                    filteredScores.map(score => <ChallengeResult key={score.id} result={score} />)
                ) : (
                    <p className="text-center text-gray-400 py-8">No previous results found.</p>
                )}
            </div>
        </div>
    );
};

export default ScoreboardPage;