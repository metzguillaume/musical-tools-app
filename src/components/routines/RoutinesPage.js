import React, { useState, useMemo, useRef } from 'react';
import { useTools } from '../../context/ToolsContext';
import InfoModal from '../common/InfoModal';
import InfoButton from '../common/InfoButton';
import SectionHeader from '../common/SectionHeader';
import RoutineList from './RoutineList'; // UPDATED
import RoutineEditor from './editor/RoutineEditor'; // UPDATED

const RoutinesPage = () => { // RENAMED
    const [view, setView] = useState('list');
    const [routineToEdit, setRoutineToEdit] = useState(null); // RENAMED
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [managingFoldersForId, setManagingFoldersForId] = useState(null);
    const fileInputRef = useRef(null);

    const { 
        routines, saveRoutine, deleteRoutine, exportRoutine, startRoutine, // RENAMED
        folders, addFolder, renameFolder, deleteFolder, toggleRoutineInFolder, exportFolder, importRoutines // RENAMED
    } = useTools();

    const [nameFilter, setNameFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [sortOrder, setSortOrder] = useState('newest');

    const handleCreateNew = () => { setRoutineToEdit(null); setView('editor'); }; // RENAMED
    const handleEdit = (routine) => { setRoutineToEdit(routine); setView('editor'); }; // RENAMED
    const handleSave = (routineData) => { saveRoutine(routineData); setView('list'); }; // RENAMED

    const handleToggleManageFolders = (routineId) => { // RENAMED
        setManagingFoldersForId(prevId => (prevId === routineId ? null : routineId));
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
        if (file) importRoutines(file); // RENAMED
        event.target.value = null;
    };
    
    const { categorized, uncategorized } = useMemo(() => {
        const filtered = routines.filter(routine => { // RENAMED
            const nameMatch = routine.name.toLowerCase().includes(nameFilter.toLowerCase()); // RENAMED
            const typeMatch = typeFilter === 'All' || routine.type === typeFilter; // RENAMED
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
            routines: filtered.filter(r => r.folderIds && r.folderIds.includes(folder.id)) // RENAMED
        })).sort((a,b) => a.name.localeCompare(b.name));

        const uncategorized = filtered.filter(r => !r.folderIds || r.folderIds.length === 0); // RENAMED

        return { categorized, uncategorized };
    }, [routines, folders, nameFilter, typeFilter, sortOrder]); // RENAMED

    return (
        <>
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Routine Hub Guide" verticalAlign="top"> {/*RENAMED*/}
                <p>Welcome to the Routine Hub! This is your command center for creating, organizing, and launching structured practice routines.</p> {/*RENAMED*/}
                
                <h4 className="font-bold text-indigo-300 mt-4">Core Concepts</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                    <li>A <strong>Preset</strong> is a saved configuration for a single exercise, like "Major 7th Chords."</li>
                    <li>A <strong>Routine</strong> is a sequence of presets that you assemble into a complete workout.</li> {/*RENAMED*/}
                    <li>A <strong>Folder</strong> is used to organize your routines, for example by week or by skill type.</li> {/*RENAMED*/}
                </ul>

                <h4 className="font-bold text-indigo-300 mt-4">Routine Types</h4> {/*RENAMED*/}
                <ul className="list-disc list-inside text-sm space-y-1">
                    <li><strong>Practice Routine (blue):</strong> A standard workout. Set a goal for each step (either time or number of questions).</li>
                    <li><strong>The Gauntlet (yellow):</strong> A race against the clock. Your goal is to correctly answer a set number of questions as fast as possible.</li>
                    <li><strong>The Streak (green):</strong> A test of consistency. Answer questions from a random pool of presets—one wrong answer ends the routine.</li> {/*RENAMED*/}
                </ul>

                <h4 className="font-bold text-indigo-300 mt-4">Organizing Your Hub</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Use the <strong>"Create Folder"</strong> button to make new categories.</li>
                    <li>Click <strong>"Manage Folders"</strong> on any routine to assign it to one or more folders, like using tags.</li> {/*RENAMED*/}
                    <li>Use the <strong>Export/Import</strong> buttons to share single routines or entire folders with others. The exported file includes all the necessary presets!</li> {/*RENAMED*/}
                </ul>
            </InfoModal>

            <div className="w-full max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-extrabold text-indigo-300">Routine Hub</h1> {/*RENAMED*/}
                        <InfoButton onClick={() => setIsInfoModalOpen(true)} />
                    </div>
                    {view === 'list' && (
                        <button onClick={handleCreateNew} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg">
                            Create Routine
                        </button> /*RENAMED*/
                    )}
                </div>

                {view === 'list' ? (
                    <>
                        <div className="flex justify-between items-center gap-4">
                           <SectionHeader title="My Routines" /> {/*RENAMED*/}
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
                                    placeholder="Enter routine name..." /*RENAMED*/
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
                                                <h3 className="text-xl font-bold text-indigo-300">{folder.name} ({folder.routines.length})</h3> {/*RENAMED*/}
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={(e) => { e.preventDefault(); exportFolder(folder.id);}} className="text-xs py-1 px-3 bg-gray-600 hover:bg-gray-500 rounded-md">Export</button>
                                                <button onClick={(e) => { e.preventDefault(); handleRenameFolder(folder);}} className="text-xs py-1 px-3 bg-gray-600 hover:bg-gray-500 rounded-md">Rename</button>
                                                <button onClick={(e) => { e.preventDefault(); deleteFolder(folder.id);}} className="text-xs py-1 px-3 bg-red-700 hover:bg-red-600 rounded-md">Delete</button>
                                            </div>
                                        </div>
                                    </summary>
                                    <div className="p-4 border border-t-0 border-slate-700 rounded-b-lg">
                                        <RoutineList 
                                            routines={folder.routines} //RENAMED
                                            folders={folders}
                                            onStart={startRoutine} onEdit={handleEdit} onDelete={deleteRoutine} //RENAMED
                                            onExport={exportRoutine} //RENAMED
                                            onToggleManageFolders={handleToggleManageFolders}
                                            onToggleFolder={toggleRoutineInFolder} //RENAMED
                                            managingFoldersForId={managingFoldersForId}
                                        />
                                    </div>
                                </details>
                            ))}
                            
                            <div>
                                <SectionHeader title={`Uncategorized (${uncategorized.length})`} />
                                <div className="mt-6">
                                    <RoutineList 
                                        routines={uncategorized} //RENAMED
                                        folders={folders}
                                        onStart={startRoutine} onEdit={handleEdit} onDelete={deleteRoutine} //RENAMED
                                        onExport={exportRoutine} onShowCreator={handleCreateNew} //RENAMED
                                        onToggleManageFolders={handleToggleManageFolders}
                                        onToggleFolder={toggleRoutineInFolder} //RENAMED
                                        managingFoldersForId={managingFoldersForId}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <SectionHeader title={routineToEdit ? "Edit Routine" : "Create New Routine"} /> {/*RENAMED*/}
                         <div className="mt-6">
                            <RoutineEditor 
                                routineToEdit={routineToEdit} //RENAMED
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

export default RoutinesPage; //RENAMED