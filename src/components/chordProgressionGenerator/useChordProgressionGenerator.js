import { useState, useEffect, useCallback } from 'react';
import { useTools } from '../../context/ToolsContext';
import { getDiatonicChords, ROMAN_NUMERALS } from '../../utils/musicTheory';

const COMMON_PATTERNS = {
    'Major': [['I', 'V', 'vi', 'IV'], ['I', 'IV', 'V', 'I'], ['vi', 'IV', 'I', 'V'], ['I', 'vi', 'ii', 'V']],
    // Use lowercase for minor patterns to ensure correct matching
    'Minor': [['i', 'VI', 'III', 'VII'], ['i', 'iv', 'v', 'i'], ['i', 'iv', 'VII', 'III'], ['ii°', 'v', 'i', 'i']]
};

export const useChordProgressionGenerator = () => {
    const { setMetronomeSchedule, addLogEntry, bpm, countdownClicks, setCountdownClicks, presetToLoad, clearPresetToLoad } = useTools();

    const [settings, setSettings] = useState({
        rootNote: 'C',
        keyType: 'Major',
        numChords: 4,
        numProgressions: 1,
        chordComplexity: 'Triads',
        useCommonPatterns: true,
        includeDiminished: false,
        qualityFilter: 'all',
        displayMode: 'both',
        fontSize: 3,
        useAlternateNotation: false,
    });
    
    useEffect(() => {
        if (presetToLoad && presetToLoad.gameId === 'chord-progression-generator') {
            // Merge with default settings to ensure backward compatibility
            setSettings(currentSettings => ({ ...currentSettings, ...presetToLoad.settings }));
            clearPresetToLoad();
        }
    }, [presetToLoad, clearPresetToLoad]);

    const [isAutoGenerateOn, setIsAutoGenerateOn] = useState(false);
    const [autoGenerateInterval, setAutoGenerateInterval] = useState(settings.numChords);
    const [isControlsOpen, setIsControlsOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [progressions, setProgressions] = useState([]);
    const [openSections, setOpenSections] = useState({ general: true, options: false, display: false, automation: false });

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleGenerate = useCallback(() => {
        // Generate both triad and tetrad master lists
        const diatonicTriads = getDiatonicChords(settings.rootNote, settings.keyType, 'Triads');
        const diatonicTetrads = getDiatonicChords(settings.rootNote, settings.keyType, '7ths');

        let availableChords = [...diatonicTriads]; // Use triads as the base for filtering
        if (!settings.includeDiminished) {
            availableChords = availableChords.filter(c => !c.quality.includes('Diminished'));
        }
        if (settings.qualityFilter === 'major') {
            availableChords = availableChords.filter(c => c.quality.includes('Major') || c.quality.includes('Dominant') || c.quality.includes('Augmented'));
        } else if (settings.qualityFilter === 'minor') {
            availableChords = availableChords.filter(c => c.quality.includes('Minor'));
        }
        
        const canUseCommonPatterns = settings.useCommonPatterns && settings.qualityFilter === 'all';
        const newProgressions = [];

        for (let i = 0; i < settings.numProgressions; i++) {
            const singleProgression = [];
            if (canUseCommonPatterns && availableChords.length > 0) {
                const isMinorKey = settings.keyType.includes('Minor');
                const basePatterns = COMMON_PATTERNS[isMinorKey ? 'Minor' : 'Major'];
                const basePattern = basePatterns[Math.floor(Math.random() * basePatterns.length)];
                const finalPattern = Array.from({ length: settings.numChords }, (_, j) => basePattern[j % basePattern.length]);

                for (const roman of finalPattern) {
                    // Find the index by matching the uppercase version of the numeral
                    const numeralIndex = ROMAN_NUMERALS.indexOf(roman.replace(/°/g, '').toUpperCase());
                    if (numeralIndex !== -1) {
                        const triad = diatonicTriads[numeralIndex];
                        const tetrad = diatonicTetrads[numeralIndex];
                        singleProgression.push({ roman: triad.roman, name: triad.name, tetradName: tetrad.name });
                    }
                }
            } else if (availableChords.length > 0) { 
                let lastChord = null;
                for (let j = 0; j < settings.numChords; j++) {
                    let nextChord;
                    do {
                        nextChord = availableChords[Math.floor(Math.random() * availableChords.length)];
                    } while (nextChord === lastChord && availableChords.length > 1);
                    
                    const numeralIndex = ROMAN_NUMERALS.indexOf(nextChord.roman.replace(/°/g, '').toUpperCase());
                    const tetrad = diatonicTetrads[numeralIndex];
                    singleProgression.push({ ...nextChord, tetradName: tetrad.name });
                    lastChord = nextChord;
                }
            }
            newProgressions.push(singleProgression);
        }
        
        if (newProgressions.every(prog => prog.length === 0)) return;
        setProgressions(newProgressions);
    }, [settings.rootNote, settings.keyType, settings.numChords, settings.numProgressions, settings.useCommonPatterns, settings.includeDiminished, settings.qualityFilter]);
    
    const scheduledGenerate = useCallback(() => {
        setTimeout(handleGenerate, 0);
    }, [handleGenerate]);

    // THIS IS THE FIX: This useEffect now only depends on the musical settings.
    useEffect(() => {
        handleGenerate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        settings.rootNote,
        settings.keyType,
        settings.numChords,
        settings.numProgressions,
        settings.useCommonPatterns,
        settings.includeDiminished,
        settings.qualityFilter
    ]);

    useEffect(() => { setAutoGenerateInterval(settings.numChords); }, [settings.numChords]);

    useEffect(() => {
        if (isAutoGenerateOn) {
            setMetronomeSchedule({ callback: scheduledGenerate, interval: autoGenerateInterval });
        } else {
            setMetronomeSchedule(null);
        }
    }, [isAutoGenerateOn, autoGenerateInterval, scheduledGenerate, setMetronomeSchedule]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleGenerate();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleGenerate]);

    const handleLogSession = () => {
        const remarks = prompt("Enter any remarks for this session:", `Practiced chord progressions in ${settings.rootNote} ${settings.keyType}.`);
        if (remarks !== null) {
            addLogEntry({
                game: 'Chord Progression Generator', bpm: bpm || 'N/A',
                date: new Date().toLocaleDateString(), remarks: remarks || "No remarks."
            });
            alert("Session logged!");
        }
    };
    
    return {
        settings, setSettings,
        isAutoGenerateOn, setIsAutoGenerateOn,
        autoGenerateInterval, setAutoGenerateInterval,
        isControlsOpen, setIsControlsOpen,
        isInfoModalOpen, setIsInfoModalOpen,
        progressions,
        openSections, toggleSection,
        countdownClicks, setCountdownClicks,
        handleGenerate,
        handleLogSession,
    };
};