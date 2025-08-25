// src/context/useRoutinesLogic.js

import { useState, useCallback, useEffect } from 'react';

// The hook no longer needs arguments for initialization
export const useRoutinesLogic = () => {
    // State to hold all created routines
    const [routines, setRoutines] = useState(() => {
        try {
            const saved = localStorage.getItem('routines');
            const parsed = saved ? JSON.parse(saved) : [];
            return parsed.map(c => {
                if (c.folderId && !c.folderIds) {
                    c.folderIds = [c.folderId];
                    delete c.folderId;
                } else if (!c.folderIds) {
                    c.folderIds = [];
                }
                return c;
            });
        } catch (error) {
            return [];
        }
    });

    // State to hold all created folders
    const [folders, setFolders] = useState(() => {
        try {
            const saved = localStorage.getItem('routineFolders');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('routines', JSON.stringify(routines));
    }, [routines]);

    useEffect(() => {
        localStorage.setItem('routineFolders', JSON.stringify(folders));
    }, [folders]);

    const saveRoutine = useCallback((routine) => {
        setRoutines(prevRoutines => {
            const existingIndex = prevRoutines.findIndex(r => r.id === routine.id);
            if (existingIndex > -1) {
                const updatedRoutines = [...prevRoutines];
                updatedRoutines[existingIndex] = {
                    ...routine,
                    createdAt: prevRoutines[existingIndex].createdAt,
                    folderIds: prevRoutines[existingIndex].folderIds || [],
                    lastPlayed: prevRoutines[existingIndex].lastPlayed
                };
                return updatedRoutines;
            } else {
                const newRoutine = { ...routine, createdAt: new Date().toISOString(), folderIds: [] };
                return [...prevRoutines, newRoutine];
            }
        });
    }, []);

    const deleteRoutine = useCallback((routineId) => {
        if (window.confirm("Are you sure you want to delete this routine?")) {
            setRoutines(prevRoutines => prevRoutines.filter(r => r.id !== routineId));
        }
    }, []);

    // --- Folder Management Functions ---

    const addFolder = useCallback((name) => {
        if (!name || name.trim() === '') return;
        const newFolder = { id: `folder_${Date.now()}`, name: name.trim() };
        setFolders(prev => [...prev, newFolder]);
    }, []);

    const renameFolder = useCallback((folderId, newName) => {
        if (!newName || newName.trim() === '') return;
        setFolders(prev => prev.map(f => f.id === folderId ? { ...f, name: newName.trim() } : f));
    }, []);
    
    const deleteFolder = useCallback((folderId) => {
        if (window.confirm("Are you sure you want to delete this folder? This will not delete the routines inside it.")) {
            setFolders(prev => prev.filter(f => f.id !== folderId));
            setRoutines(prev => prev.map(r => ({
                ...r,
                folderIds: r.folderIds.filter(id => id !== folderId)
            })));
        }
    }, []);

    const toggleRoutineInFolder = useCallback((routineId, folderId) => {
        setRoutines(prev => prev.map(r => {
            if (r.id === routineId) {
                const newFolderIds = r.folderIds.includes(folderId)
                    ? r.folderIds.filter(id => id !== folderId)
                    : [...r.folderIds, folderId];
                return { ...r, folderIds: newFolderIds };
            }
            return r;
        }));
    }, []);
    
    const updateRoutineLastPlayed = useCallback((routineId) => {
        setRoutines(prev => prev.map(r => 
            r.id === routineId 
                ? { ...r, lastPlayed: new Date().toISOString() } 
                : r
        ));
    }, []);

    // MODIFIED: Functions now accept dependencies as arguments
    const exportRoutine = useCallback((routineToExport, allPresets) => {
        if (!routineToExport) return alert("Could not find the routine to export.");
        
        const requiredPresetIds = new Set(routineToExport.steps.map(step => step.presetId));
        const requiredPresets = allPresets.filter(p => requiredPresetIds.has(p.id));
        const routineBundle = {
            type: 'MusicToolsRoutineBundle',
            routine: routineToExport,
            requiredPresets: requiredPresets,
        };
        const jsonString = JSON.stringify(routineBundle, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const safeName = routineToExport.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `routine_${safeName}.routine.json`;
        link.href = href;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
    }, []);

    const exportFolder = useCallback((idOrIds, allPresets, fileName) => {
        let routinesToExport;
        let bundleName;
    
        if (Array.isArray(idOrIds)) {
            // Case 1: Batch selection of routines from an array of IDs
            routinesToExport = routines.filter(r => idOrIds.includes(r.id));
            bundleName = fileName || 'custom_selection';
        } else {
            // Case 2: Exporting a pre-existing folder by its ID
            const folder = folders.find(f => f.id === idOrIds);
            if (!folder) return alert("Folder not found.");
            routinesToExport = routines.filter(r => r.folderIds && r.folderIds.includes(idOrIds));
            bundleName = folder.name;
        }
    
        if (routinesToExport.length === 0) return alert("There are no routines to export in this selection.");
    
        const requiredPresetIds = new Set(routinesToExport.flatMap(r => r.steps.map(s => s.presetId)));
        const requiredPresets = allPresets.filter(p => requiredPresetIds.has(p.id));
        
        const folderBundle = {
            type: 'MusicToolsRoutineFolderBundle',
            folderName: bundleName,
            routines: routinesToExport,
            requiredPresets: requiredPresets,
        };
        const jsonString = JSON.stringify(folderBundle, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const safeName = (fileName || bundleName).replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `routine_folder_${safeName}.routine.json`;
        link.href = href;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
    }, [routines, folders]);
    
    const importRoutines = useCallback((file, savePresetFn) => {
        if (!file || !savePresetFn) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.type === 'MusicToolsRoutineFolderBundle') {
                    if (!data.folderName || !data.routines || !data.requiredPresets) return alert("Import failed: Invalid folder bundle file.");
                    if (!window.confirm(`Import the "${data.folderName}" folder and its ${data.routines.length} routines?`)) return;
                    
                    data.requiredPresets.forEach(savePresetFn);
                    let folder = folders.find(f => f.name.toLowerCase() === data.folderName.toLowerCase());
                    if (!folder) {
                        folder = { id: `folder_${Date.now()}`, name: data.folderName };
                        setFolders(prev => [...prev, folder]);
                    }
                    const routinesWithFolderId = data.routines.map(r => ({...r, folderIds: [folder.id]}));
                    routinesWithFolderId.forEach(saveRoutine);

                    alert(`Folder "${data.folderName}" imported successfully!`);

                } else if (data.type === 'MusicToolsRoutineBundle') {
                    data.requiredPresets.forEach(savePresetFn);
                    saveRoutine(data.routine);
                    alert(`Routine "${data.routine.name}" imported successfully!`);
                } else {
                    alert("Import failed: This does not appear to be a valid Routine file.");
                }
            } catch (error) {
                alert("Import failed: The selected file is not a valid JSON file.");
            }
        };
        reader.readAsText(file);
    }, [saveRoutine, folders]);

    return { 
        routines, saveRoutine, deleteRoutine, exportRoutine, importRoutines, 
        folders, addFolder, renameFolder, deleteFolder, toggleRoutineInFolder, exportFolder,
        updateRoutineLastPlayed
    };
};