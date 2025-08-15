import { useState, useCallback, useEffect } from 'react';

export const useChallengesLogic = (presets, savePreset) => {
    // State to hold all created challenges
    const [challenges, setChallenges] = useState(() => {
        try {
            const saved = localStorage.getItem('challenges');
            const parsed = saved ? JSON.parse(saved) : [];
            // One-time migration for old data structure
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
            const saved = localStorage.getItem('challengeFolders');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('challenges', JSON.stringify(challenges));
    }, [challenges]);

    useEffect(() => {
        localStorage.setItem('challengeFolders', JSON.stringify(folders));
    }, [folders]);

    const saveChallenge = useCallback((challenge) => {
        setChallenges(prevChallenges => {
            const existingIndex = prevChallenges.findIndex(c => c.id === challenge.id);
            if (existingIndex > -1) {
                const updatedChallenges = [...prevChallenges];
                updatedChallenges[existingIndex] = {
                    ...challenge,
                    createdAt: prevChallenges[existingIndex].createdAt,
                    folderIds: prevChallenges[existingIndex].folderIds || [],
                    lastPlayed: prevChallenges[existingIndex].lastPlayed // Preserve last played date on edit
                };
                return updatedChallenges;
            } else {
                const newChallenge = { ...challenge, createdAt: new Date().toISOString(), folderIds: [] };
                return [...prevChallenges, newChallenge];
            }
        });
    }, []);

    const deleteChallenge = useCallback((challengeId) => {
        if (window.confirm("Are you sure you want to delete this challenge?")) {
            setChallenges(prevChallenges => prevChallenges.filter(c => c.id !== challengeId));
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
        if (window.confirm("Are you sure you want to delete this folder? This will not delete the challenges inside it.")) {
            setFolders(prev => prev.filter(f => f.id !== folderId));
            // Remove the folderId from any challenges that have it
            setChallenges(prev => prev.map(c => ({
                ...c,
                folderIds: c.folderIds.filter(id => id !== folderId)
            })));
        }
    }, []);

    const toggleChallengeInFolder = useCallback((challengeId, folderId) => {
        setChallenges(prev => prev.map(c => {
            if (c.id === challengeId) {
                const newFolderIds = c.folderIds.includes(folderId)
                    ? c.folderIds.filter(id => id !== folderId) // Remove it
                    : [...c.folderIds, folderId]; // Add it
                return { ...c, folderIds: newFolderIds };
            }
            return c;
        }));
    }, []);
    
    // Function to update the lastPlayed timestamp
    const updateChallengeLastPlayed = useCallback((challengeId) => {
        setChallenges(prev => prev.map(c => 
            c.id === challengeId 
                ? { ...c, lastPlayed: new Date().toISOString() } 
                : c
        ));
    }, []);

    const exportChallenge = useCallback((challengeToExport) => {
        if (!challengeToExport) {
            alert("Could not find the challenge to export.");
            return;
        }
        const requiredPresetIds = new Set(challengeToExport.steps.map(step => step.presetId));
        const requiredPresets = presets.filter(p => requiredPresetIds.has(p.id));
        const challengeBundle = {
            type: 'MusicToolsChallengeBundle',
            challenge: challengeToExport,
            requiredPresets: requiredPresets,
        };
        const jsonString = JSON.stringify(challengeBundle, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const safeName = challengeToExport.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `challenge_${safeName}.json`;
        link.href = href;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
    }, [presets]);

    const exportFolder = useCallback((folderId) => {
        const folder = folders.find(f => f.id === folderId);
        if (!folder) return alert("Folder not found.");
        const challengesInFolder = challenges.filter(c => c.folderIds.includes(folderId));
        if (challengesInFolder.length === 0) return alert("This folder is empty. Nothing to export.");
        const requiredPresetIds = new Set();
        challengesInFolder.forEach(c => {
            c.steps.forEach(s => requiredPresetIds.add(s.presetId));
        });
        const requiredPresets = presets.filter(p => requiredPresetIds.has(p.id));
        const folderBundle = {
            type: 'MusicToolsChallengeFolderBundle',
            folderName: folder.name,
            challenges: challengesInFolder,
            requiredPresets: requiredPresets,
        };
        const jsonString = JSON.stringify(folderBundle, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const safeName = folder.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `challenge_folder_${safeName}.json`;
        link.href = href;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
    }, [challenges, folders, presets]);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const importChallenges = useCallback((file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.type === 'MusicToolsChallengeFolderBundle') {
                    if (!data.folderName || !data.challenges || !data.requiredPresets) {
                        return alert("Import failed: Invalid folder bundle file.");
                    }
                    if (!window.confirm(`Import the "${data.folderName}" folder and its ${data.challenges.length} challenges?`)) return;
                    data.requiredPresets.forEach(savePreset);
                    let folder = folders.find(f => f.name.toLowerCase() === data.folderName.toLowerCase());
                    if (!folder) {
                        folder = { id: `folder_${Date.now()}`, name: data.folderName };
                        setFolders(prev => [...prev, folder]);
                    }
                    data.challenges.forEach(c => saveChallenge({ ...c, folderIds: [folder.id] }));
                    alert(`Folder "${data.folderName}" imported successfully!`);
                } else if (data.type === 'MusicToolsChallengeBundle') {
                    data.requiredPresets.forEach(savePreset);
                    saveChallenge(data.challenge);
                    alert(`Challenge "${data.challenge.name}" imported successfully!`);
                } else {
                    alert("Import failed: This does not appear to be a valid Challenge file.");
                }
            } catch (error) {
                alert("Import failed: The selected file is not a valid JSON file.");
            }
        };
        reader.readAsText(file);
    }, [savePreset, saveChallenge, folders]);

    return { 
        challenges, saveChallenge, deleteChallenge, exportChallenge, importChallenges, 
        folders, addFolder, renameFolder, deleteFolder, toggleChallengeInFolder, exportFolder,
        updateChallengeLastPlayed
    };
};