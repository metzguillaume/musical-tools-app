import React, { useState, useMemo, useRef } from 'react';
import { useTools } from '../../context/ToolsContext';
import InfoModal from '../common/InfoModal';
import InfoButton from '../common/InfoButton';
import SectionHeader from '../common/SectionHeader';
import ChallengeList from './ChallengeList';
import ChallengeEditor from './ChallengeEditor';

// A modal component for assigning challenges to folders
const ManageFoldersModal = ({ challenge, folders, onClose, onToggleFolder }) => {
    if (!challenge) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-sm w-11/12" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-indigo-300 mb-1">Manage Folders for:</h3>
                <p className="text-lg text-gray-200 mb-4 truncate">{challenge.name}</p>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {folders.map(folder => (
                        <label key={folder.id} className="flex items-center gap-3 p-2 bg-slate-800 rounded-md cursor-pointer">
                            <input
                                type="checkbox"
                                className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                checked={challenge.folderIds.includes(folder.id)}
                                onChange={() => onToggleFolder(challenge.id, folder.id)}
                            />
                            <span className="font-semibold">{folder.name}</span>
                        </label>
                    ))}
                </div>
                <button onClick={onClose} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                    Done
                </button>
            </div>
        </div>
    );
};


const ChallengesPage = () => {
    const [view, setView] = useState('list');
    const [challengeToEdit, setChallengeToEdit] = useState(null);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [managingFoldersFor, setManagingFoldersFor] = useState(null);
    const fileInputRef = useRef(null);

    const { 
        challenges, saveChallenge, deleteChallenge, exportChallenge, startChallenge, 
        folders, addFolder, renameFolder, deleteFolder, toggleChallengeInFolder, exportFolder, importChallenges
    } = useTools();

    const [nameFilter, setNameFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');

    const handleCreateNew = () => { setChallengeToEdit(null); setView('editor'); };
    const handleEdit = (challenge) => { setChallengeToEdit(challenge); setView('editor'); };
    const handleSave = (challengeData) => { saveChallenge(challengeData); setView('list'); };

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
        }).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        const categorized = folders.map(folder => ({
            ...folder,
            challenges: filtered.filter(c => c.folderIds && c.folderIds.includes(folder.id))
        })).sort((a,b) => a.name.localeCompare(b.name));

        const uncategorized = filtered.filter(c => !c.folderIds || c.folderIds.length === 0);

        return { categorized, uncategorized };
    }, [challenges, folders, nameFilter, typeFilter]);

    return (
        <>
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Challenge Hub Guide">
                {/* ... your info text ... */}
            </InfoModal>

            <ManageFoldersModal
                challenge={managingFoldersFor}
                folders={folders}
                onClose={() => setManagingFoldersFor(null)}
                onToggleFolder={toggleChallengeInFolder}
            />

            <div className="w-full max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
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
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 p-4 bg-slate-700/50 rounded-lg">
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
                                            onStart={startChallenge} onEdit={handleEdit} onDelete={deleteChallenge}
                                            onExport={exportChallenge} onManageFolders={setManagingFoldersFor}
                                        />
                                    </div>
                                </details>
                            ))}
                            
                            <div>
                                <SectionHeader title={`Uncategorized (${uncategorized.length})`} />
                                <div className="mt-6">
                                    <ChallengeList 
                                        challenges={uncategorized}
                                        onStart={startChallenge} onEdit={handleEdit} onDelete={deleteChallenge}
                                        onExport={exportChallenge} onShowCreator={handleCreateNew}
                                        onManageFolders={setManagingFoldersFor}
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