import { useState, useEffect, useCallback } from 'react';
import { useTools } from '../../context/ToolsContext';

export const useNoteGenerator = () => {
    const { bpm, addLogEntry, setMetronomeSchedule, countdownClicks, setCountdownClicks, countdownMode, setCountdownMode, presetToLoad, clearPresetToLoad } = useTools();
    
    // Core settings are now grouped for presets
    const [settings, setSettings] = useState({
    numNotes: 12,
    noteType: 'chromatic',
    showBarlines: true,
    fontSize: 4, // fontSize is now part of settings
});

    // Effect to listen for a preset to be loaded
    useEffect(() => {
        if (presetToLoad && presetToLoad.gameId === 'note-generator') {
            setSettings(presetToLoad.settings);
            clearPresetToLoad();
        }
    }, [presetToLoad, clearPresetToLoad]);

    // Non-preset state

    const [generatedNotes, setGeneratedNotes] = useState([]);
    const [isAutoGenerateOn, setIsAutoGenerateOn] = useState(false);
    const [autoGenerateInterval, setAutoGenerateInterval] = useState(settings.numNotes);
    const [isControlsOpen, setIsControlsOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    const generateNotes = useCallback(() => {
        const naturalNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const chromaticNotes = ['C', { sharp: 'C#', flat: 'Db' }, 'D', { sharp: 'D#', flat: 'Eb' }, 'E', 'F', { sharp: 'F#', flat: 'Gb' }, 'G', { sharp: 'G#', flat: 'Ab' }, 'A', { sharp: 'A#', flat: 'Bb' }, 'B'];
        const sourceArray = settings.noteType === 'natural' ? naturalNotes : chromaticNotes;
        
        const newNotes = [];
        let currentSectionNotes = [];

        for (let i = 0; i < settings.numNotes; i++) {
            if (i > 0 && i % 4 === 0) {
                currentSectionNotes = [];
            }
            let note;
            let attempts = 0;
            do {
                let potentialNote = sourceArray[Math.floor(Math.random() * sourceArray.length)];
                if (typeof potentialNote === 'object') {
                    potentialNote = Math.random() < 0.5 ? potentialNote.sharp : potentialNote.flat;
                }
                note = potentialNote;
                attempts++;
            } while (currentSectionNotes.includes(note) && sourceArray.length > currentSectionNotes.length && attempts < 20);
            
            newNotes.push(note);
            currentSectionNotes.push(note);
        }
        setGeneratedNotes(newNotes);
    }, [settings.numNotes, settings.noteType]);

    const scheduledGenerate = useCallback(() => {
        setTimeout(generateNotes, 0);
    }, [generateNotes]);

    useEffect(() => {
        generateNotes();
    }, [generateNotes]);

    useEffect(() => {
        setAutoGenerateInterval(settings.numNotes);
    }, [settings.numNotes]);

    useEffect(() => {
        if (isAutoGenerateOn) {
            setMetronomeSchedule({ callback: scheduledGenerate, interval: autoGenerateInterval });
        } else {
            setMetronomeSchedule(null);
        }
    }, [isAutoGenerateOn, autoGenerateInterval, scheduledGenerate, setMetronomeSchedule]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                generateNotes();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [generateNotes]);

    const handleLogProgress = () => {
        const remarks = prompt("Enter any remarks for this session:", `Practiced ${settings.noteType} notes.`);
        if (remarks !== null) {
            const newEntry = { game: 'Note Generator', bpm: bpm, date: new Date().toLocaleDateString(), remarks: remarks || "No remarks." };
            addLogEntry(newEntry);
            alert("Session logged!");
        }
    };

    return {
    settings, setSettings,
    // fontSize and setFontSize are now accessed via the settings object
    generatedNotes,
    isAutoGenerateOn, setIsAutoGenerateOn,
    autoGenerateInterval, setAutoGenerateInterval,
    isControlsOpen, setIsControlsOpen,
    isInfoModalOpen, setIsInfoModalOpen,
    countdownClicks, setCountdownClicks,
    countdownMode, setCountdownMode,
    handleLogProgress,
    generateNotes
    };
};