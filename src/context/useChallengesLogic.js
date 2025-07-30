import { useState, useCallback, useEffect } from 'react';

/**
 * A custom hook to manage the creation, storage, and import/export of Challenges.
 * @param {Array} presets - The user's complete list of presets, needed for bundling on export.
 * @param {Function} savePreset - The function to save a single preset, needed for un-bundling on import.
 */
export const useChallengesLogic = (presets, savePreset) => {
    // State to hold all created challenges, initialized from localStorage
    const [challenges, setChallenges] = useState(() => {
        try {
            const savedChallenges = localStorage.getItem('challenges');
            return savedChallenges ? JSON.parse(savedChallenges) : [];
        } catch (error) {
            console.error("Error reading challenges from localStorage", error);
            return [];
        }
    });

    // Effect to save challenges to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('challenges', JSON.stringify(challenges));
    }, [challenges]);

    const saveChallenge = useCallback((challenge) => {
        // Here you could add logic to either create a new one or update an existing one by ID
        setChallenges(prevChallenges => {
            const existingIndex = prevChallenges.findIndex(c => c.id === challenge.id);
            if (existingIndex > -1) {
                // Update existing challenge
                const updatedChallenges = [...prevChallenges];
                updatedChallenges[existingIndex] = challenge;
                return updatedChallenges;
            } else {
                // Add new challenge
                return [...prevChallenges, challenge];
            }
        });
    }, []);

    const deleteChallenge = useCallback((challengeId) => {
        if (window.confirm("Are you sure you want to delete this challenge?")) {
            setChallenges(prevChallenges => prevChallenges.filter(c => c.id !== challengeId));
        }
    }, []);

    const exportChallenge = useCallback((challengeToExport) => {
        if (!challengeToExport) {
            alert("Could not find the challenge to export.");
            return;
        }

        // Find all presets required by this single challenge
        const requiredPresetIds = new Set(challengeToExport.steps.map(step => step.presetId));
        const requiredPresets = presets.filter(p => requiredPresetIds.has(p.id));

        // Create a bundle containing the challenge and its required presets
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
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(href);

    }, [presets]);

    const importChallenges = useCallback((file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                // Validate the bundle
                if (data.type !== 'MusicToolsChallengeBundle' || !data.challenge || !data.requiredPresets) {
                    alert("Import failed: This does not appear to be a valid Challenge file.");
                    return;
                }

                // Add the presets to the user's library first
                data.requiredPresets.forEach(preset => {
                    // You might want to add a check here to not overwrite existing presets with the same ID
                    savePreset(preset);
                });

                // Add the challenge to the user's library
                saveChallenge(data.challenge);
                
                alert(`Challenge "${data.challenge.name}" and its presets were imported successfully!`);

            } catch (error) {
                console.error("Failed to parse challenge file:", error);
                alert("Import failed: The selected file is not a valid JSON file.");
            }
        };
        reader.readAsText(file);
    }, [savePreset, saveChallenge]);


    return { challenges, saveChallenge, deleteChallenge, exportChallenge, importChallenges };
};