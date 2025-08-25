import React, { useState, useMemo } from 'react';
import { useTools } from '../../context/ToolsContext';
import { RoutineResult } from './RoutineResult'; // UPDATED
import SectionHeader from '../common/SectionHeader';
import InfoModal from '../common/InfoModal';
import InfoButton from '../common/InfoButton';

const ScoreboardPage = () => {
    const { scores, presets, folders, routines, lastRoutineResultId, setLastRoutineResultId, clearScoreboard, deleteScore, startRoutine } = useTools(); // RENAMED
    const [nameFilter, setNameFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [gameFilter, setGameFilter] = useState('All');
    const [folderFilter, setFolderFilter] = useState('All');
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    const latestResult = useMemo(() => {
        if (!lastRoutineResultId) return null; // RENAMED
        return scores.find(s => s.id === lastRoutineResultId); // RENAMED
    }, [lastRoutineResultId, scores]); // RENAMED

    const handleRetryRoutine = () => { // RENAMED
        if (!latestResult) return;
        const routineToRetry = routines.find(r => r.id === latestResult.routineId); // RENAMED
        if (routineToRetry) { // RENAMED
            setLastRoutineResultId(null); // RENAMED
            startRoutine(routineToRetry); // RENAMED
        } else {
            alert("Error: Could not find the original routine to retry."); // RENAMED
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
            if (score.id === lastRoutineResultId) return false; // RENAMED
            
            const originalRoutine = routines.find(r => r.id === score.routineId); // RENAMED
            const nameMatch = score.routineName.toLowerCase().includes(nameFilter.toLowerCase()); // RENAMED
            const typeMatch = typeFilter === 'All' || score.routineType === typeFilter; // RENAMED
            const gameMatch = gameFilter === 'All' || score.steps.some(step => {
                const preset = presets.find(p => p.id === step.presetId);
                return preset && preset.gameName === gameFilter;
            });
            const folderMatch = folderFilter === 'All' 
                || (folderFilter === 'Uncategorized' && (!originalRoutine || !originalRoutine.folderIds || originalRoutine.folderIds.length === 0))
                || (originalRoutine && originalRoutine.folderIds && originalRoutine.folderIds.includes(folderFilter));

            return nameMatch && typeMatch && gameMatch && folderMatch;
        });
    }, [scores, nameFilter, typeFilter, gameFilter, folderFilter, lastRoutineResultId, presets, routines]); // RENAMED
    
    return (
        <>
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Scoreboard Guide" verticalAlign="top">
                <p>The Scoreboard tracks your performance every time you complete a routine.</p> {/*RENAMED*/}
                <h4 className="font-bold text-indigo-300 mt-4">Features</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                    <li><strong>Routine Complete Screen:</strong> After finishing a routine, you'll see a detailed summary of your results. From here, you can retry the same routine or view the full scoreboard.</li> {/*RENAMED*/}
                    <li><strong>Color-Coded Entries:</strong> Each result is framed in a color that matches its routine type for quick identification (Blue for Routines, Yellow for Gauntlets, Green for Streaks).</li> {/*RENAMED*/}
                    <li><strong>Detailed View:</strong> Click on any scoreboard entry to expand it (like an accordion) and see a step-by-step breakdown of your performance.</li>
                    <li><strong>Advanced Filtering:</strong> Use the filter controls to find specific results by name, type, the games included, or the folder it belongs to.</li>
                    <li><strong>Managing Scores:</strong> You can delete any individual result by clicking the "-" button, or clear your entire history with the "Clear All History" button.</li>
                </ul>
            </InfoModal>

            <div className="max-w-4xl mx-auto">
                {latestResult ? (
                    <div className="mb-12">
                        <h2 className="text-4xl font-bold text-green-400 text-center mb-4">Routine Complete!</h2> {/*RENAMED*/}
                        <RoutineResult result={latestResult} isSummary={true} /> {/*RENAMED*/}
                        <div className="text-center mt-6 flex justify-center gap-4">
                            <button 
                                onClick={handleRetryRoutine} // RENAMED
                                className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-lg"
                            >
                                Retry Routine
                            </button> {/*RENAMED*/}
                            <button 
                                onClick={() => setLastRoutineResultId(null)} // RENAMED
                                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg"
                            >
                                View Full Scoreboard
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-2">
                                <SectionHeader title="Routine Scoreboard" /> {/*RENAMED*/}
                                <InfoButton onClick={() => setIsInfoModalOpen(true)} />
                            </div>
                            <button 
                                onClick={clearScoreboard} 
                                className="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm flex-shrink-0"
                            >
                                Clear All History
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6 p-4 bg-slate-700/50 rounded-lg">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-1">Filter by Name</label>
                                <input 
                                    type="text"
                                    placeholder="Enter routine name..." // RENAMED
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
                                filteredScores.map(score => <RoutineResult key={score.id} result={score} onDelete={() => deleteScore(score.id)} />) // RENAMED
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
        </>
    );
};

export default ScoreboardPage;