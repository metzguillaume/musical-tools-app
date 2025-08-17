import React, { useState, useMemo, useRef } from 'react';
import { useTools } from '../../context/ToolsContext';
import InfoModal from '../common/InfoModal';
import InfoButton from '../common/InfoButton';
import SectionHeader from '../common/SectionHeader';
import ChallengeList from './ChallengeList';
import ChallengeEditor from './ChallengeEditor';

const ChallengesPage = () => {
    const [view, setView] = useState('list');
    const [challengeToEdit, setChallengeToEdit] = useState(null);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [managingFoldersForId, setManagingFoldersForId] = useState(null);
    const fileInputRef = useRef(null);

    const { 
        challenges, saveChallenge, deleteChallenge, exportChallenge, startChallenge, 
        folders, addFolder, renameFolder, deleteFolder, toggleChallengeInFolder, exportFolder, importChallenges
    } = useTools();

    const [nameFilter, setNameFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [sortOrder, setSortOrder] = useState('newest');

    const handleCreateNew = () => { setChallengeToEdit(null); setView('editor'); };
    const handleEdit = (challenge) => { setChallengeToEdit(challenge); setView('editor'); };
    const handleSave = (challengeData) => { saveChallenge(challengeData); setView('list'); };

    const handleToggleManageFolders = (challengeId) => {
        setManagingFoldersForId(prevId => (prevId === challengeId ? null : challengeId));
    };

    const handleCreateFolder = () => {
        const name = prompt("Enter a name for the new folder:");
        if (name) addFolder(name);
    };

    const handleRenameFolder = (folder) => {
        const newName = prompt(`Enter a new name for the "${folder.name}" folder:`, folder.name);
        if (newName) renameFolder(folder.id, newName);
    };

    const handleFileSelected = (event) => {
        const file = event.target.files[0];
        if (file) importChallenges(file);
        event.target.value = null;
    };
    
    const { categorized, uncategorized } = useMemo(() => {
        const filtered = challenges.filter(challenge => {
            const nameMatch = challenge.name.toLowerCase().includes(nameFilter.toLowerCase());
            const typeMatch = typeFilter === 'All' || challenge.type === typeFilter;
            return nameMatch && typeMatch;
        });

        // Apply sorting based on the selected order
        switch (sortOrder) {
            case 'oldest':
                filtered.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
                break;
            case 'lastPlayed':
                filtered.sort((a, b) => {
                    const dateA = a.lastPlayed ? new Date(a.lastPlayed).getTime() : 0;
                    const dateB = b.lastPlayed ? new Date(b.lastPlayed).getTime() : 0;
                    return dateB - dateA;
                });
                break;
            case 'newest':
            default:
                filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                break;
        }

        const categorized = folders.map(folder => ({
            ...folder,
            challenges: filtered.filter(c => c.folderIds && c.folderIds.includes(folder.id))
        })).sort((a,b) => a.name.localeCompare(b.name));

        const uncategorized = filtered.filter(c => !c.folderIds || c.folderIds.length === 0);

        return { categorized, uncategorized };
    }, [challenges, folders, nameFilter, typeFilter, sortOrder]);

    return (
        <>
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Challenge Hub Guide" verticalAlign="top">
                <p>Welcome to the Challenge Hub! This is your command center for creating, organizing, and launching structured practice routines.</p>
                
                <h4 className="font-bold text-indigo-300 mt-4">Core Concepts</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                    <li>A <strong>Preset</strong> is a saved configuration for a single exercise, like "Major 7th Chords."</li>
                    <li>A <strong>Challenge</strong> is a sequence of presets that you assemble into a complete workout.</li>
                    <li>A <strong>Folder</strong> is used to organize your challenges, for example by week or by skill type.</li>
                </ul>

                <h4 className="font-bold text-indigo-300 mt-4">Challenge Types</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                    <li><strong>Practice Routine (blue):</strong> A standard workout. Set a goal for each step (either time or number of questions).</li>
                    <li><strong>The Gauntlet (yellow):</strong> A race against the clock. Your goal is to correctly answer a set number of questions as fast as possible.</li>
                    <li><strong>The Streak (green):</strong> A test of consistency. Answer questions from a random pool of presets—one wrong answer ends the challenge.</li>
                </ul>

                <h4 className="font-bold text-indigo-300 mt-4">Organizing Your Hub</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Use the <strong>"Create Folder"</strong> button to make new categories.</li>
                    <li>Click <strong>"Manage Folders"</strong> on any challenge to assign it to one or more folders, like using tags.</li>
                    <li>Use the <strong>Export/Import</strong> buttons to share single challenges or entire folders with others. The exported file includes all the necessary presets!</li>
                </ul>
            </InfoModal>

            <div className="w-full max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-extrabold text-indigo-300">Challenge Hub</h1>
                        <InfoButton onClick={() => setIsInfoModalOpen(true)} />
                    </div>
                    {view === 'list' && (
                        <button onClick={handleCreateNew} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg">
                            Create Challenge
                        </button>
                    )}
                </div>

                {view === 'list' ? (
                    <>
                        <div className="flex justify-between items-center gap-4">
                           <SectionHeader title="My Challenges" />
                           <div className="flex gap-2">
                                <button onClick={() => fileInputRef.current.click()} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">Import</button>
                                <button onClick={handleCreateFolder} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg">Create Folder</button>
                           </div>
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
                                <label className="block text-sm font-semibold text-gray-300 mb-1">Sort by</label>
                                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="w-full p-2 rounded-md bg-slate-600 text-white">
                                    <option value="newest">Date Created (Newest)</option>
                                    <option value="oldest">Date Created (Oldest)</option>
                                    <option value="lastPlayed">Last Played</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {categorized.map(folder => (
                                <details key={folder.id} open className="group">
                                    <summary className="list-none">
                                        <div className="flex justify-between items-center p-3 bg-slate-800 rounded-t-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span className="transform transition-transform duration-200 group-open:rotate-90">▶</span>
                                                <h3 className="text-xl font-bold text-indigo-300">{folder.name} ({folder.challenges.length})</h3>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={(e) => { e.preventDefault(); exportFolder(folder.id);}} className="text-xs py-1 px-3 bg-gray-600 hover:bg-gray-500 rounded-md">Export</button>
                                                <button onClick={(e) => { e.preventDefault(); handleRenameFolder(folder);}} className="text-xs py-1 px-3 bg-gray-600 hover:bg-gray-500 rounded-md">Rename</button>
                                                <button onClick={(e) => { e.preventDefault(); deleteFolder(folder.id);}} className="text-xs py-1 px-3 bg-red-700 hover:bg-red-600 rounded-md">Delete</button>
                                            </div>
                                        </div>
                                    </summary>
                                    <div className="p-4 border border-t-0 border-slate-700 rounded-b-lg">
                                        <ChallengeList 
                                            challenges={folder.challenges}
                                            folders={folders}
                                            onStart={startChallenge} onEdit={handleEdit} onDelete={deleteChallenge}
                                            onExport={exportChallenge} 
                                            onToggleManageFolders={handleToggleManageFolders}
                                            onToggleFolder={toggleChallengeInFolder}
                                            managingFoldersForId={managingFoldersForId}
                                        />
                                    </div>
                                </details>
                            ))}
                            
                            <div>
                                <SectionHeader title={`Uncategorized (${uncategorized.length})`} />
                                <div className="mt-6">
                                    <ChallengeList 
                                        challenges={uncategorized}
                                        folders={folders}
                                        onStart={startChallenge} onEdit={handleEdit} onDelete={deleteChallenge}
                                        onExport={exportChallenge} onShowCreator={handleCreateNew}
                                        onToggleManageFolders={handleToggleManageFolders}
                                        onToggleFolder={toggleChallengeInFolder}
                                        managingFoldersForId={managingFoldersForId}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <SectionHeader title={challengeToEdit ? "Edit Challenge" : "Create New Challenge"} />
                         <div className="mt-6">
                            <ChallengeEditor 
                                challengeToEdit={challengeToEdit}
                                onSave={handleSave}
                                onCancel={() => setView('list')}
                            />
                        </div>
                    </>
                )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileSelected} accept=".json" className="hidden" />
        </>
    );
};

export default ChallengesPage;