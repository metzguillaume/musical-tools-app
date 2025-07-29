import { useState, useEffect, useCallback } from 'react';
import { useTools } from '../../context/ToolsContext';
import { getDiatonicChords, ROMAN_NUMERALS } from '../../utils/musicTheory';

const COMMON_PATTERNS = {
    'Major': [['I', 'V', 'vi', 'IV'], ['I', 'IV', 'V', 'I'], ['vi', 'IV', 'I', 'V'], ['I', 'vi', 'ii', 'V']],
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
    });
    
    useEffect(() => {
        if (presetToLoad && presetToLoad.gameId === 'chord-progression-generator') {
            setSettings(presetToLoad.settings);
            clearPresetToLoad();
        }
    }, [presetToLoad, clearPresetToLoad]);

    const [isAutoGenerateOn, setIsAutoGenerateOn] = useState(false);
    const [autoGenerateInterval, setAutoGenerateInterval] = useState(settings.numChords);
    const [isControlsOpen, setIsControlsOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [progressions, setProgressions] = useState([]);
    const [openSections, setOpenSections] = useState({
        general: true, options: false, display: false, automation: false
    });

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleGenerate = useCallback(() => {
        const apiComplexity = settings.chordComplexity === 'Tetrads' ? '7ths' : 'Triads';
        let diatonicChords = getDiatonicChords(settings.rootNote, settings.keyType, apiComplexity);
        
        let availableChords = [...diatonicChords];
        if (!settings.includeDiminished) {
            availableChords = availableChords.filter(c => !c.quality.includes('Diminished'));
        }
        
        if (settings.qualityFilter === 'major') {
            availableChords = availableChords.filter(c => c.quality.includes('Major') || c.quality.includes('Dominant') || c.quality.includes('Augmented'));
        } else if (settings.qualityFilter === 'minor') {
            availableChords = availableChords.filter(c => c.quality.includes('Minor') || c.quality.includes('Half-Diminished'));
        }
        
        const canUseCommonPatterns = settings.useCommonPatterns && settings.qualityFilter === 'all';
        const newProgressions = [];
        for (let i = 0; i < settings.numProgressions; i++) {
            const singleProgression = [];
            if (canUseCommonPatterns && availableChords.length > 0) {
                const basePatterns = COMMON_PATTERNS[settings.keyType.includes('Major') ? 'Major' : 'Minor'] || COMMON_PATTERNS['Major'];
                const basePattern = basePatterns[Math.floor(Math.random() * basePatterns.length)];
                
                const finalPattern = Array.from({ length: settings.numChords }, (_, j) => basePattern[j % basePattern.length]);

                for (const roman of finalPattern) {
                    const numeralIndex = ROMAN_NUMERALS.indexOf(roman.toUpperCase());
                    let chord = diatonicChords[numeralIndex];
                    if (chord) { singleProgression.push({ ...chord, roman }); }
                }
            } else if (availableChords.length > 0) { 
                let lastChord = null;
                for (let j = 0; j < settings.numChords; j++) {
                    if (availableChords.length === 0) continue;
                    let nextChord;
                    do {
                        nextChord = availableChords[Math.floor(Math.random() * availableChords.length)];
                    } while (nextChord === lastChord && availableChords.length > 1);
                    singleProgression.push(nextChord);
                    lastChord = nextChord;
                }
            }
            newProgressions.push(singleProgression);
        }
        
        if (newProgressions.every(prog => prog.length === 0)) return;
        setProgressions(newProgressions);
    }, [settings]);
    
    const scheduledGenerate = useCallback(() => {
        setTimeout(handleGenerate, 0);
    }, [handleGenerate]);

    useEffect(() => { handleGenerate(); }, [handleGenerate]);
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