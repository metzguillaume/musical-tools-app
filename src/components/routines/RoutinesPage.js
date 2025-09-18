import React, { useState, useMemo, useRef } from 'react';
import { useTools } from '../../context/ToolsContext';
import InfoModal from '../common/InfoModal';
import InfoButton from '../common/InfoButton';
import SectionHeader from '../common/SectionHeader';
import RoutineList from './RoutineList';
import RoutineEditor from './editor/RoutineEditor';
import MoveRoutinesModal from './MoveRoutinesModal';
import BatchEditBar from './BatchEditBar';

const defaultFolders = [
    { id: 'folder_default_practice', name: 'Practice Routines' },
    { id: 'folder_default_gauntlet', name: 'The Gauntlet' },
    { id: 'folder_default_streak', name: 'The Streak' }
];

// This is the component for an individual folder inside a category
const FolderItem = ({ folder, isSelectionMode, selectedRoutineIds, handleSelectAllInFolder, onExportFolder, onRename, onDelete, ...routineListProps }) => {
    const isDefault = folder.id.startsWith('folder_default_');

    const routineIdsInFolder = folder.routines.map(r => r.id);
    const allInFolderSelected = routineIdsInFolder.length > 0 && routineIdsInFolder.every(id => selectedRoutineIds.has(id));

    // Do not render the folder if it's empty
    if (folder.routines.length === 0) {
        return null;
    }

    return (
        <details className="group" open>
            <summary className="list-none">
                <div className="flex justify-between items-center p-3 bg-slate-800 rounded-t-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center gap-3">
                        <span className="transform transition-transform duration-200 group-open:rotate-90">▶</span>
                        <h3 className="flex-grow text-xl font-bold text-indigo-300">{folder.name} ({folder.routines.length})</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        {isSelectionMode && (
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSelectAllInFolder(routineIdsInFolder, allInFolderSelected); }}
                                className="text-xs font-semibold bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded-md flex-shrink-0"
                            >
                                {allInFolderSelected ? 'Deselect All' : 'Select All'}
                            </button>
                        )}
                        <div className={`flex gap-2 ${isSelectionMode ? 'hidden' : ''}`}>
                            <button onClick={(e) => { e.preventDefault(); onExportFolder(folder.id);}} disabled={isDefault} className="text-xs py-1 px-3 bg-gray-600 hover:bg-gray-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">Export</button>
                            <button onClick={(e) => { e.preventDefault(); onRename(folder);}} disabled={isDefault} className="text-xs py-1 px-3 bg-gray-600 hover:bg-gray-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">Rename</button>
                            <button onClick={(e) => { e.preventDefault(); onDelete(folder.id);}} disabled={isDefault} className="text-xs py-1 px-3 bg-red-700 hover:bg-red-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">Delete</button>
                        </div>
                    </div>
                </div>
            </summary>
            <div className="p-4 border border-t-0 border-slate-700 rounded-b-lg">
                <RoutineList 
                    routines={folder.routines}
                    isSelectionMode={isSelectionMode}
                    selectedRoutineIds={selectedRoutineIds}
                    {...routineListProps}
                />
            </div>
        </details>
    );
};

// NEW: A component to create a collapsible, visually distinct category section
const RoutineCategorySection = ({ title, children, hasContent }) => {
    if (!hasContent) {
        return null; // Don't render the section if there's nothing to show
    }

    return (
        <details className="bg-slate-800/50 rounded-lg border-2 border-slate-700 group" open>
            <summary className="list-none p-4 cursor-pointer hover:bg-slate-700/50 rounded-lg flex items-center gap-3">
                <span className="transform transition-transform duration-200 group-open:rotate-90">▶</span>
                <h2 className="text-2xl font-bold text-teal-300">{title}</h2>
            </summary>
            <div className="p-4 border-t border-slate-700">
                {children}
            </div>
        </details>
    );
};


const RoutinesPage = () => {
    const [view, setView] = useState('list');
    const [routineToEdit, setRoutineToEdit] = useState(null);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [managingFoldersForId, setManagingFoldersForId] = useState(null);
    const fileInputRef = useRef(null);
    
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedRoutineIds, setSelectedRoutineIds] = useState(new Set());
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);

    const {
        routines, saveRoutine, deleteRoutine, exportRoutine, startRoutine,
        folders, addFolder, renameFolder, deleteFolder, toggleRoutineInFolder, exportFolder, importRoutines
    } = useTools();

    const [nameFilter, setNameFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [sortOrder, setSortOrder] = useState('newest');

    const handleCreateNew = () => { setRoutineToEdit(null); setView('editor'); };
    const handleEdit = (routine) => { setRoutineToEdit(routine); setView('editor'); };
    const handleSave = (routineData) => { saveRoutine(routineData); setView('list'); };

    const handleToggleManageFolders = (routineId) => {
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
        if (file) importRoutines(file);
        event.target.value = null;
    };
    
    const handleToggleSelection = (routineId) => {
        const newSelection = new Set(selectedRoutineIds);
        if (newSelection.has(routineId)) {
            newSelection.delete(routineId);
        } else {
            newSelection.add(routineId);
        }
        setSelectedRoutineIds(newSelection);
    };
    
    const handleSelectAllInFolder = (routineIds, isCurrentlyAllSelected) => {
        const newSelection = new Set(selectedRoutineIds);
        if (isCurrentlyAllSelected) {
            routineIds.forEach(id => newSelection.delete(id));
        } else {
            routineIds.forEach(id => newSelection.add(id));
        }
        setSelectedRoutineIds(newSelection);
    };
    
    const handleMoveConfirm = (targetFolderIds) => {
        const routinesToMove = routines.filter(r => selectedRoutineIds.has(r.id));
        routinesToMove.forEach(routine => {
            targetFolderIds.forEach(folderId => {
                if (!routine.folderIds || !routine.folderIds.includes(folderId)) {
                    toggleRoutineInFolder(routine.id, folderId);
                }
            });
        });
        setIsMoveModalOpen(false);
        alert(`${selectedRoutineIds.size} routine(s) were added to the selected folders.`);
    };

    const handleDeleteSelected = () => {
        if (selectedRoutineIds.size === 0) return alert("No routines selected.");
        if (window.confirm(`Are you sure you want to delete ${selectedRoutineIds.size} selected routine(s)?`)) {
            for (const id of selectedRoutineIds) {
                deleteRoutine(id);
            }
            setIsSelectionMode(false);
            setSelectedRoutineIds(new Set());
        }
    };

    const handleExportSelected = () => {
        if (selectedRoutineIds.size === 0) return alert("No routines selected.");
        exportFolder(Array.from(selectedRoutineIds), `custom_routines_export_${new Date().toISOString().split('T')[0]}`);
    };

    const handleCancelSelection = () => {
        setIsSelectionMode(false);
        setSelectedRoutineIds(new Set());
    };

    const { defaultCategorized, customCategorized } = useMemo(() => {
        const augmentedRoutines = routines.map(routine => {
            const newFolderIds = new Set(routine.folderIds || []);
            switch (routine.type) {
                case 'PracticeRoutine': newFolderIds.add('folder_default_practice'); break;
                case 'Gauntlet': newFolderIds.add('folder_default_gauntlet'); break;
                case 'Streak': newFolderIds.add('folder_default_streak'); break;
                default: break;
            }
            return { ...routine, folderIds: Array.from(newFolderIds) };
        });
        
        const filtered = augmentedRoutines.filter(routine => {
            const nameMatch = routine.name.toLowerCase().includes(nameFilter.toLowerCase());
            const typeMatch = typeFilter === 'All' || routine.type === typeFilter;
            return nameMatch && typeMatch;
        });

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

        const defaultCategorized = defaultFolders.map(folder => ({
            ...folder,
            routines: filtered.filter(r => r.folderIds && r.folderIds.includes(folder.id))
        }));

        const customCategorized = folders.map(folder => ({
            ...folder,
            routines: filtered.filter(r => r.folderIds && r.folderIds.includes(folder.id))
        })).sort((a,b) => a.name.localeCompare(b.name));

        return { defaultCategorized, customCategorized };
    }, [routines, folders, nameFilter, typeFilter, sortOrder]);

    const routineListProps = {
        folders, onStart: startRoutine, onEdit: handleEdit, 
        onExport: exportRoutine, 
        onDelete: deleteRoutine, 
        onToggleManageFolders: handleToggleManageFolders, onToggleFolder: toggleRoutineInFolder,
        managingFoldersForId, selectedRoutineIds, onToggleSelection: handleToggleSelection
    };

    // Check if there are any routines to display in each category after filtering
    const hasDefaultRoutines = defaultCategorized.some(f => f.routines.length > 0);
    const hasCustomRoutines = customCategorized.some(f => f.routines.length > 0);

    return (
        <>
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Routine Hub Guide" verticalAlign="top">
                <div className="space-y-4 text-sm">
                    <p>The <strong>Routine Hub</strong> is where you can build, manage, and launch structured, multi-step practice sessions. Think of a routine as a custom workout playlist, combining your favorite presets into a single, repeatable exercise.</p>
                    
                    <h4 className="font-bold text-indigo-300 mt-4">The Three Types of Routines</h4>
                    <ul className="list-disc list-inside ml-2 space-y-2">
                        <li>
                            <strong>Practice Routine (Flexibility):</strong> The standard workout format. You can set goals for each step by either <strong>time</strong> (e.g., "practice for 5 minutes") or <strong>questions</strong> (e.g., "answer 10 correctly"). You can also choose to run the steps in sequential or random order.
                        </li>
                        <li>
                            <strong>The Gauntlet (Speed & Accuracy):</strong> A race against the clock. Your goal is to complete a set number of questions for all steps as quickly as you can. The stopwatch runs automatically, and your final time is saved to the Scoreboard.
                        </li>
                        <li>
                            <strong>The Streak (Perfection):</strong> A test of consistency. The routine randomly picks from your list of presets and continues as long as you answer correctly. One wrong answer ends the routine, and your score is your streak of correct answers.
                        </li>
                    </ul>

                    <h4 className="font-bold text-indigo-300 mt-4">Managing Your Routines</h4>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                        <li><strong>Folders:</strong> Organize your routines into default folders (based on type) or create your own custom folders.</li>
                        <li><strong>Selection Mode:</strong> Click the "Select Routines" button to enter batch-edit mode. This allows you to Export, Delete, or Move multiple routines at once.</li>
                        <li><strong>Import / Export:</strong> You can share any routine or folder with others by exporting it to a file. Likewise, you can import routines that others have shared with you.</li>
                        <li><strong>Scoreboard:</strong> Every completed routine is automatically saved to the Scoreboard, giving you a detailed history of your performance and progress over time.</li>
                    </ul>
                </div>
            </InfoModal>

            <MoveRoutinesModal 
                isOpen={isMoveModalOpen}
                onClose={() => setIsMoveModalOpen(false)}
                folders={folders}
                onConfirm={handleMoveConfirm}
            />

            <div className="w-full max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-extrabold text-indigo-300">Routine Hub</h1>
                        <InfoButton onClick={() => setIsInfoModalOpen(true)} />
                    </div>
                    {view === 'list' && (
                        <div className="flex items-center gap-2">
                            {!isSelectionMode && (
                                <button onClick={() => setIsSelectionMode(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg">
                                    Select Routines
                                </button>
                            )}
                            <button onClick={handleCreateNew} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg">
                                Create Routine
                            </button>
                        </div>
                    )}
                </div>

                {view === 'list' ? (
                    <>
                        {isSelectionMode && (
                            <BatchEditBar 
                                selectedCount={selectedRoutineIds.size}
                                onMove={() => setIsMoveModalOpen(true)}
                                onExport={handleExportSelected}
                                onDelete={handleDeleteSelected}
                                onCancel={handleCancelSelection}
                            />
                        )}

                        <div className="flex justify-between items-center gap-4">
                           <SectionHeader title="My Routines" />
                           <div className="flex gap-2">
                                <button onClick={() => fileInputRef.current.click()} className="bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Import</button>
                                <button onClick={handleCreateFolder} className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-lg">Create Custom Folder</button>
                           </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6 p-4 bg-slate-700/50 rounded-lg">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-1">Filter by Name</label>
                                <input 
                                    type="text"
                                    placeholder="Enter routine name..."
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
                        
                        <div className="space-y-8">
                            <RoutineCategorySection title="Default Folders" hasContent={hasDefaultRoutines}>
                                <div className="space-y-6">
                                    {defaultCategorized.map(folder => (
                                        <FolderItem 
                                            key={folder.id}
                                            folder={folder}
                                            isSelectionMode={isSelectionMode}
                                            handleSelectAllInFolder={handleSelectAllInFolder}
                                            onExportFolder={exportFolder}
                                            {...routineListProps}
                                        />
                                    ))}
                                </div>
                            </RoutineCategorySection>
                            
                            <RoutineCategorySection title="My Custom Folders" hasContent={hasCustomRoutines}>
                                <div className="space-y-6">
                                    {customCategorized.length > 0 ? customCategorized.map(folder => (
                                        <FolderItem 
                                            key={folder.id}
                                            folder={folder}
                                            isSelectionMode={isSelectionMode}
                                            handleSelectAllInFolder={handleSelectAllInFolder}
                                            onRename={handleRenameFolder}
                                            onDelete={deleteFolder}
                                            onExportFolder={exportFolder}
                                            {...routineListProps}
                                        />
                                    )) : <p className="text-gray-400 text-center mt-4">No custom folders created yet.</p>}
                                </div>
                            </RoutineCategorySection>
                        </div>
                    </>
                ) : (
                    <>
                        <SectionHeader title={routineToEdit ? "Edit Routine" : "Create New Routine"} />
                         <div className="mt-6">
                            <RoutineEditor 
                                routineToEdit={routineToEdit}
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

export default RoutinesPage;