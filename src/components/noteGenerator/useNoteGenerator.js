import { useState, useEffect, useCallback } from 'react';
import { useTools } from '../../context/ToolsContext';

export const useNoteGenerator = () => {
    const { bpm, addLogEntry, setMetronomeSchedule, countdownClicks, setCountdownClicks, countdownMode, setCountdownMode } = useTools();
    const [numNotes, setNumNotes] = useState(12);
    const [noteType, setNoteType] = useState('chromatic');
    const [fontSize, setFontSize] = useState(4);
    const [generatedNotes, setGeneratedNotes] = useState([]);
    const [showBarlines, setShowBarlines] = useState(true);
    const [isAutoGenerateOn, setIsAutoGenerateOn] = useState(false);
    const [autoGenerateInterval, setAutoGenerateInterval] = useState(numNotes);
    const [isControlsOpen, setIsControlsOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    const generateNotes = useCallback(() => {
        const naturalNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const chromaticNotes = ['C', { sharp: 'C#', flat: 'Db' }, 'D', { sharp: 'D#', flat: 'Eb' }, 'E', 'F', { sharp: 'F#', flat: 'Gb' }, 'G', { sharp: 'G#', flat: 'Ab' }, 'A', { sharp: 'A#', flat: 'Bb' }, 'B'];
        const sourceArray = noteType === 'natural' ? naturalNotes : chromaticNotes;
        
        const newNotes = [];
        let currentSectionNotes = [];

        for (let i = 0; i < numNotes; i++) {
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
    }, [numNotes, noteType]);

    const scheduledGenerate = useCallback(() => {
        setTimeout(generateNotes, 0);
    }, [generateNotes]);

    useEffect(() => {
        generateNotes();
    }, [generateNotes]);

    useEffect(() => {
        setAutoGenerateInterval(numNotes);
    }, [numNotes]);

    useEffect(() => {
        if (isAutoGenerateOn) {
            setMetronomeSchedule({
                callback: scheduledGenerate,
                interval: autoGenerateInterval,
            });
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
        const remarks = prompt("Enter any remarks for this session:", `Practiced ${noteType} notes.`);
        if (remarks !== null) {
            const newEntry = {
                game: 'Note Generator',
                bpm: bpm,
                date: new Date().toLocaleDateString(),
                remarks: remarks || "No remarks."
            };
            addLogEntry(newEntry);
            alert("Session logged!");
        }
    };

    return {
        numNotes, setNumNotes,
        noteType, setNoteType,
        fontSize, setFontSize,
        generatedNotes,
        showBarlines, setShowBarlines,
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