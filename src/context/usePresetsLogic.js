import { useState, useCallback, useEffect } from 'react';

export const usePresetsLogic = () => {
    const [presets, setPresets] = useState(() => {
        try {
            const savedPresets = localStorage.getItem('toolPresets');
            return savedPresets ? JSON.parse(savedPresets) : [];
        } catch (error) {
            console.error("Error reading presets from localStorage", error);
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('toolPresets', JSON.stringify(presets));
    }, [presets]);

    const savePreset = useCallback((preset) => {
        setPresets(prevPresets => [...prevPresets, preset]);
    }, []);

    const deletePreset = useCallback((presetId) => {
        if (window.confirm("Are you sure you want to delete this preset?")) {
            setPresets(prevPresets => prevPresets.filter(p => p.id !== presetId));
        }
    }, []);

    const exportPresets = useCallback(() => {
        if (presets.length === 0) {
            alert("You have no saved presets to export.");
            return;
        }
        const jsonString = JSON.stringify(presets, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = `musical_tools_presets_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
    }, [presets]);

    const importPresets = useCallback((file) => {
        if (!file) return;
        if (!window.confirm("Are you sure you want to import presets? This will overwrite your current saved presets.")) {
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (Array.isArray(data)) {
                    // Optional: Add more robust validation here if needed
                    setPresets(data);
                    alert("Presets imported successfully!");
                } else {
                    alert("Import failed: The JSON file does not contain a valid presets array.");
                }
            } catch (error) {
                console.error("Failed to parse presets file:", error);
                alert("Import failed: The selected file is not a valid JSON file.");
            }
        };
        reader.readAsText(file);
    }, []);

    return { presets, savePreset, deletePreset, exportPresets, importPresets };
};