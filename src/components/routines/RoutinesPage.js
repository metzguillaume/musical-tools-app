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

// NEW: A reusable component to render a single folder accordion. This cleans up the main return statement.
const FolderItem = ({ folder, isSelectionMode, selectedRoutineIds, handleSelectAllInFolder, onExport, onRename, onDelete, ...routineListProps }) => {
    const isDefault = folder.id.startsWith('folder_default_');

    const routineIdsInFolder = folder.routines.map(r => r.id);
    const selectedInFolderCount = routineIdsInFolder.filter(id => selectedRoutineIds.has(id)).length;
    const isAllSelected = routineIdsInFolder.length > 0 && selectedInFolderCount === routineIdsInFolder.length;
    const isPartiallySelected = selectedInFolderCount > 0 && !isAllSelected;

    if (folder.routines.length === 0) {
        return null; // Don't render empty folders
    }

    return (
        <details className="group">
            <summary className="list-none">
                <div className="flex justify-between items-center p-3 bg-slate-800 rounded-t-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center gap-3">
                        {isSelectionMode && (
                            <input
                                type="checkbox"
                                ref={el => el && (el.indeterminate = isPartiallySelected)}
                                checked={isAllSelected}
                                onChange={() => handleSelectAllInFolder(routineIdsInFolder, isAllSelected)}
                                onClick={e => e.stopPropagation()}
                                className="h-5 w-5 rounded border-gray-400 text-indigo-600 bg-slate-700 focus:ring-indigo-500"
                            />
                        )}
                        <span className="transform transition-transform duration-200 group-open:rotate-90">▶</span>
                        <h3 className="text-xl font-bold text-indigo-300">{folder.name} ({folder.routines.length})</h3>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={(e) => { e.preventDefault(); onExport(folder.id);}} disabled={isDefault} className="text-xs py-1 px-3 bg-gray-600 hover:bg-gray-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">Export</button>
                        <button onClick={(e) => { e.preventDefault(); onRename(folder);}} disabled={isDefault} className="text-xs py-1 px-3 bg-gray-600 hover:bg-gray-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">Rename</button>
                        <button onClick={(e) => { e.preventDefault(); onDelete(folder.id);}} disabled={isDefault} className="text-xs py-1 px-3 bg-red-700 hover:bg-red-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">Delete</button>
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

    const handleDeleteSelected = () => {
        if (selectedRoutineIds.size === 0) {
            alert("No routines selected.");
            return;
        }
        if (window.confirm(`Are you sure you want to delete ${selectedRoutineIds.size} selected routine(s)? This action cannot be undone.`)) {
            for (const id of selectedRoutineIds) {
                deleteRoutine(id);
            }
            setIsSelectionMode(false);
            setSelectedRoutineIds(new Set());
        }
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

    // UPDATED: This logic now separates default and custom folders.
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
        folders, onStart: startRoutine, onEdit: handleEdit, onDelete: deleteRoutine,
        onExport: exportRoutine, onToggleManageFolders: handleToggleManageFolders, onToggleFolder: toggleRoutineInFolder,
        managingFoldersForId, selectedRoutineIds, onToggleSelection: handleToggleSelection
    };

    return (
        <>
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Routine Hub Guide" verticalAlign="top">
                {/* Content unchanged */}
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
                        <div className="flex gap-2">
                            <button onClick={() => { setIsSelectionMode(!isSelectionMode); setSelectedRoutineIds(new Set()); }} className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg">
                                {isSelectionMode ? 'Cancel' : 'Batch Edit'}
                            </button>
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
                                onDelete={handleDeleteSelected}
                            />
                        )}

                        <div className="flex justify-between items-center gap-4">
                           <SectionHeader title="My Routines" />
                           <div className="flex gap-2">
                                <button onClick={() => fileInputRef.current.click()} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">Import</button>
                                <button onClick={handleCreateFolder} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg">Create Custom Folder</button>
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
                        
                        {/* UPDATED: Rendering logic now splits default and custom folders */}
                        <div className="space-y-8">
                            <div>
                                <SectionHeader title="Default Folders" />
                                <div className="space-y-6 mt-4">
                                    {defaultCategorized.map(folder => (
                                        <FolderItem 
                                            key={folder.id}
                                            folder={folder}
                                            isSelectionMode={isSelectionMode}
                                            handleSelectAllInFolder={handleSelectAllInFolder}
                                            {...routineListProps}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <SectionHeader title="My Custom Folders" />
                                <div className="space-y-6 mt-4">
                                    {customCategorized.length > 0 ? customCategorized.map(folder => (
                                        <FolderItem 
                                            key={folder.id}
                                            folder={folder}
                                            isSelectionMode={isSelectionMode}
                                            handleSelectAllInFolder={handleSelectAllInFolder}
                                            onRename={handleRenameFolder}
                                            onDelete={deleteFolder}
                                            onExport={exportFolder}
                                            {...routineListProps}
                                        />
                                    )) : <p className="text-gray-400 text-center mt-4">No custom folders created yet.</p>}
                                </div>
                            </div>
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