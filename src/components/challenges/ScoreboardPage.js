import React, { useState, useMemo } from 'react';
import { useTools } from '../../context/ToolsContext';
import { ChallengeResult } from './ChallengeResult';
import SectionHeader from '../common/SectionHeader';

const ScoreboardPage = () => {
    const { scores, presets, folders, challenges, lastChallengeResultId, setLastChallengeResultId, clearScoreboard, deleteScore, startChallenge } = useTools();
    const [nameFilter, setNameFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [gameFilter, setGameFilter] = useState('All');
    const [folderFilter, setFolderFilter] = useState('All');

    const latestResult = useMemo(() => {
        if (!lastChallengeResultId) return null;
        return scores.find(s => s.id === lastChallengeResultId);
    }, [lastChallengeResultId, scores]);

    const handleRetryChallenge = () => {
        if (!latestResult) return;
        const challengeToRetry = challenges.find(c => c.id === latestResult.challengeId);
        if (challengeToRetry) {
            setLastChallengeResultId(null);
            startChallenge(challengeToRetry);
        } else {
            alert("Error: Could not find the original challenge to retry.");
        }
    };

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
        return scores.filter(score => {
            if (score.id === lastChallengeResultId) return false;
            
            const originalChallenge = challenges.find(c => c.id === score.challengeId);
            const nameMatch = score.challengeName.toLowerCase().includes(nameFilter.toLowerCase());
            const typeMatch = typeFilter === 'All' || score.challengeType === typeFilter;
            const gameMatch = gameFilter === 'All' || score.steps.some(step => {
                const preset = presets.find(p => p.id === step.presetId);
                return preset && preset.gameName === gameFilter;
            });
            const folderMatch = folderFilter === 'All' 
                || (folderFilter === 'Uncategorized' && (!originalChallenge || !originalChallenge.folderIds || originalChallenge.folderIds.length === 0))
                || (originalChallenge && originalChallenge.folderIds && originalChallenge.folderIds.includes(folderFilter));

            return nameMatch && typeMatch && gameMatch && folderMatch;
        });
    }, [scores, nameFilter, typeFilter, gameFilter, folderFilter, lastChallengeResultId, presets, challenges]);
    
    return (
        <div className="max-w-4xl mx-auto">
            {latestResult ? (
                <div className="mb-12">
                    <h2 className="text-4xl font-bold text-green-400 text-center mb-4">Challenge Complete!</h2>
                    <ChallengeResult result={latestResult} isSummary={true} />
                    <div className="text-center mt-6 flex justify-center gap-4">
                        <button 
                            onClick={handleRetryChallenge}
                            className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-lg"
                        >
                            Retry Challenge
                        </button>
                        <button 
                            onClick={() => setLastChallengeResultId(null)}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg"
                        >
                            View Full Scoreboard
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center">
                        <SectionHeader title="Challenge Scoreboard" />
                        <button 
                            onClick={clearScoreboard} 
                            className="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm"
                        >
                            Clear All History
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6 p-4 bg-slate-700/50 rounded-lg">
                        <div>
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
                        <div className="md:col-span-3">
                            <label className="block text-sm font-semibold text-gray-300 mb-1">Filter by Folder</label>
                            <select value={folderFilter} onChange={(e) => setFolderFilter(e.target.value)} className="w-full p-2 rounded-md bg-slate-600 text-white">
                                <option value="All">All Folders</option>
                                <option value="Uncategorized">Uncategorized</option>
                                {folders.map(folder => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {filteredScores.length > 0 ? (
                            filteredScores.map(score => <ChallengeResult key={score.id} result={score} onDelete={() => deleteScore(score.id)} />)
                        ) : (
                             <div className="text-center p-8 bg-slate-700/50 rounded-lg">
                                <h3 className="text-xl font-semibold text-gray-300">No Results Found</h3>
                                <p className="text-gray-400 mt-2">No scoreboard entries match your current filter criteria.</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default ScoreboardPage;