import { useState, useEffect, useCallback } from 'react';
import { useTools } from '../../context/ToolsContext';

// Helper function to shuffle an array
const shuffle = (array) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
};

export const useNoteGenerator = () => {
    const { bpm, addLogEntry, setMetronomeSchedule, countdownClicks, setCountdownClicks, countdownMode, setCountdownMode, presetToLoad, clearPresetToLoad, setDroneNote } = useTools();

    const [settings, setSettings] = useState({
        numNotes: 12,
        noteType: 'chromatic',
        showBarlines: true,
        fontSize: 2.7, // Changed to a safer default that should fit on one line
        barlineFrequency: 4,
        avoidRepeats: true,
    });

    const [generatedNotes, setGeneratedNotes] = useState([]);
    const [isAutoGenerateOn, setIsAutoGenerateOn] = useState(false);
    const [autoGenerateInterval, setAutoGenerateInterval] = useState(settings.numNotes);
    const [isControlsOpen, setIsControlsOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    useEffect(() => {
        if (presetToLoad && presetToLoad.gameId === 'note-generator') {
            setSettings(prevSettings => ({ ...prevSettings, ...presetToLoad.settings }));
            
            if (presetToLoad.automation) {
                setIsAutoGenerateOn(presetToLoad.automation.isAutoGenerateOn);
                setAutoGenerateInterval(presetToLoad.automation.autoGenerateInterval);
                setCountdownClicks(presetToLoad.automation.countdownClicks);
                setCountdownMode(presetToLoad.automation.countdownMode);
            }
            clearPresetToLoad();
        }
    }, [presetToLoad, clearPresetToLoad, setCountdownClicks, setCountdownMode]);

    const generateNotes = useCallback(() => {
        const naturalNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const chromaticSource = ['C', { sharp: 'C#', flat: 'Db' }, 'D', { sharp: 'D#', flat: 'Eb' }, 'E', 'F', { sharp: 'F#', flat: 'Gb' }, 'G', { sharp: 'G#', flat: 'Ab' }, 'A', { sharp: 'A#', flat: 'Bb' }, 'B'];
        
        let newNotes = [];

        if (settings.avoidRepeats && settings.noteType === 'chromatic') {
            let uniqueChromaticScale = chromaticSource.map(note => {
                if (typeof note === 'object') {
                    return Math.random() < 0.5 ? note.sharp : note.flat;
                }
                return note;
            });

            const shuffledChromatic = shuffle(uniqueChromaticScale);

            if (settings.numNotes <= 12) {
                newNotes = shuffledChromatic.slice(0, settings.numNotes);
            } else {
                newNotes = [...shuffledChromatic];
                for (let i = 12; i < settings.numNotes; i++) {
                    let randomNote;
                    do {
                        let potentialNote = chromaticSource[Math.floor(Math.random() * chromaticSource.length)];
                        if (typeof potentialNote === 'object') {
                            potentialNote = Math.random() < 0.5 ? potentialNote.sharp : potentialNote.flat;
                        }
                        randomNote = potentialNote;
                    } while (randomNote === newNotes[newNotes.length - 1]);
                    
                    newNotes.push(randomNote);
                }
            }
        } else {
            const sourceArray = settings.noteType === 'natural' ? naturalNotes : chromaticSource;
            let lastNote = null;
            for (let i = 0; i < settings.numNotes; i++) {
                let note;
                do {
                    let potentialNote = sourceArray[Math.floor(Math.random() * sourceArray.length)];
                    if (typeof potentialNote === 'object') {
                        potentialNote = Math.random() < 0.5 ? potentialNote.sharp : potentialNote.flat;
                    }
                    note = potentialNote;
                } while (settings.avoidRepeats && note === lastNote && sourceArray.length > 1);
                newNotes.push(note);
                lastNote = note;
            }
        }
        
        setGeneratedNotes(newNotes);

        if (newNotes.length > 0) {
            const firstNote = newNotes[0];
            const flatToSharpMap = {
                'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
            };
            const droneNote = flatToSharpMap[firstNote] || firstNote;
            setDroneNote(droneNote);
        }
    }, [settings.numNotes, settings.noteType, settings.avoidRepeats, setDroneNote]);

    const scheduledGenerate = useCallback(() => {
        setTimeout(generateNotes, 0);
    }, [generateNotes]);

    useEffect(() => {
        generateNotes();
    }, [generateNotes]);

    
    useEffect(() => {
        if (isAutoGenerateOn) {
            setMetronomeSchedule({ callback: scheduledGenerate, interval: autoGenerateInterval });
        } else {
            setMetronomeSchedule(null);
        }
    }, [isAutoGenerateOn, autoGenerateInterval, scheduledGenerate, setMetronomeSchedule]);

    useEffect(() => {
        const handleKeyDown = (event) => {
    // Check if the user is typing in an input field.
    const targetTagName = event.target.tagName.toLowerCase();
    if (targetTagName === 'input' || targetTagName === 'textarea' || targetTagName === 'select') {
        return; // If so, do nothing and let the browser handle the typing.
    }

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
            const newEntry = { game: 'Note Generator', bpm: bpm || 'N/A', date: new Date().toLocaleDateString(), remarks: remarks || "No remarks." };
            addLogEntry(newEntry);
            alert("Session logged!");
        }
    };

    return {
        settings, setSettings,
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