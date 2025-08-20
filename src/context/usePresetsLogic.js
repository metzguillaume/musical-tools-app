import { useState, useCallback, useEffect } from 'react';
import { defaultPresets } from './defaultPresets';

// Helper for deep object comparison, needed for finding duplicates
const isEqual = (obj1, obj2) => {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) return false;
    for (const key of keys1) {
        const val1 = obj1[key];
        const val2 = obj2[key];
        const areObjects = typeof val1 === 'object' && val1 !== null && typeof val2 === 'object' && val2 !== null;
        if ((areObjects && !isEqual(val1, val2)) || (!areObjects && val1 !== val2)) {
            return false;
        }
    }
    return true;
};

export const usePresetsLogic = (challenges) => {
    const [presets, setPresets] = useState(() => {
        try {
            const savedPresets = localStorage.getItem('toolPresets');
            const userPresets = savedPresets ? JSON.parse(savedPresets) : [];
            return [...defaultPresets, ...userPresets];
        } catch (error) {
            console.error("Error reading presets from localStorage", error);
            return [...defaultPresets];
        }
    });

    useEffect(() => {
        const userPresets = presets.filter(p => !p.isDefault);
        localStorage.setItem('toolPresets', JSON.stringify(userPresets));
    }, [presets]);

    const savePreset = useCallback((preset) => {
        const newPreset = { ...preset, isDefault: false };
        setPresets(prevPresets => [...prevPresets, newPreset]);
    }, []);
    
    // NEW: A function to save multiple presets at once (for import)
    const saveMultiplePresets = useCallback((presetsToSave) => {
        const newCustomPresets = presetsToSave.map(p => ({ ...p, isDefault: false }));
        setPresets(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const uniqueNewPresets = newCustomPresets.filter(p => !existingIds.has(p.id));
            if (uniqueNewPresets.length < newCustomPresets.length) {
                alert(`Note: ${newCustomPresets.length - uniqueNewPresets.length} preset(s) were ignored because their IDs already exist.`);
            }
            return [...prev, ...uniqueNewPresets];
        });
        return newCustomPresets.length;
    }, []);

    // MODIFIED: This function now handles full preset object updates for the editor
    const updatePreset = useCallback((presetId, updatedPresetData) => {
        setPresets(prevPresets => 
            prevPresets.map(p => p.id === presetId ? { ...p, ...updatedPresetData } : p)
        );
    }, []);

    const deletePreset = useCallback((presetId) => {
        const presetToDelete = presets.find(p => p.id === presetId);
        if (presetToDelete && presetToDelete.isDefault) {
            alert("Default presets cannot be deleted.");
            return;
        }
        if (window.confirm("Are you sure you want to delete this preset?")) {
            setPresets(prevPresets => prevPresets.filter(p => p.id !== presetId));
        }
    }, [presets]);
    
    // NEW: A dedicated function for deleting multiple presets by their IDs
    const deleteSelectedPresets = useCallback((idsToDelete) => {
        if (!idsToDelete || idsToDelete.length === 0) {
            return alert("No presets selected to delete.");
        }
        
        const presetsToDelete = presets.filter(p => idsToDelete.includes(p.id));
        const customPresetsToDelete = presetsToDelete.filter(p => !p.isDefault);

        if (customPresetsToDelete.length === 0) {
            return alert("No custom presets were selected. Default presets cannot be deleted.");
        }
        
        if (window.confirm(`Are you sure you want to delete ${customPresetsToDelete.length} selected preset(s)? This action cannot be undone.`)) {
            setPresets(prev => prev.filter(p => !customPresetsToDelete.some(dp => dp.id === p.id)));
            alert(`${customPresetsToDelete.length} presets have been deleted.`);
        }
    }, [presets]);

    const removePresets = useCallback((criteria) => {
        const userPresets = presets.filter(p => !p.isDefault);
        let presetsToRemove = new Set();
        let message = '';

        switch (criteria.type) {
            case 'byGame':
                message = `Are you sure you want to remove all custom presets for "${criteria.value}"?`;
                userPresets.forEach(p => {
                    if (p.gameName === criteria.value) presetsToRemove.add(p.id);
                });
                break;
            
            case 'unusedSince':
                const now = new Date();
                const timeAgo = new Date(now.setDate(now.getDate() - criteria.value));
                message = `Are you sure you want to remove all presets not used in the last ${criteria.value} days?`;
                userPresets.forEach(p => {
                    if (!p.lastUsed || new Date(p.lastUsed) < timeAgo) {
                        presetsToRemove.add(p.id);
                    }
                });
                break;

            case 'notInChallenge':
                message = "Are you sure you want to remove all presets that aren't used in any challenge?";
                const usedInChallengeIds = new Set(challenges.flatMap(c => c.steps.map(s => s.presetId)));
                userPresets.forEach(p => {
                    if (!usedInChallengeIds.has(p.id)) presetsToRemove.add(p.id);
                });
                break;

            case 'duplicates':
                message = "Are you sure you want to remove all duplicate presets? (Keeps the most recent)";
                const seen = [];
                // Iterate backwards to keep the newest ones
                for (let i = userPresets.length - 1; i >= 0; i--) {
                    const p1 = userPresets[i];
                    const isDuplicate = seen.some(p2 => p1.gameName === p2.gameName && isEqual(p1.settings, p2.settings));
                    if (isDuplicate) {
                        presetsToRemove.add(p1.id);
                    } else {
                        seen.push(p1);
                    }
                }
                break;

            default: return;
        }

        if (presetsToRemove.size === 0) return alert("No presets matched the criteria to be removed.");

        if (window.confirm(`${message} This will remove ${presetsToRemove.size} preset(s). This action cannot be undone.`)) {
            setPresets(prev => prev.filter(p => !presetsToRemove.has(p.id)));
            alert(`${presetsToRemove.size} presets have been removed.`);
        }
    }, [presets, challenges]);
    
    const exportSelectedPresets = useCallback((selectedIds) => {
        if (!selectedIds || selectedIds.length === 0) {
            return alert("No presets selected to export. Please check the boxes next to the presets you want to export.");
        }
        
        const presetsToExport = presets.filter(p => selectedIds.includes(p.id) && !p.isDefault);

        if (presetsToExport.length === 0) {
            return alert("Only custom presets can be exported. None of the selected presets are eligible.");
        }

        const jsonString = JSON.stringify(presetsToExport, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = `musical_tools_presets_${new Date().toISOString().split('T')[0]}.preset.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
    }, [presets]);

    // Expose the new functions
    return { presets, savePreset, saveMultiplePresets, deletePreset, deleteSelectedPresets, exportSelectedPresets, updatePreset, removePresets };
};