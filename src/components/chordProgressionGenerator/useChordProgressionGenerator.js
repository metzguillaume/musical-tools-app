import { useState, useEffect, useCallback } from 'react';
import { useTools } from '../../context/ToolsContext';
import { getDiatonicChords, ROMAN_NUMERALS } from '../../utils/musicTheory';

const COMMON_PATTERNS = {
    'Major': [['I', 'V', 'vi', 'IV'], ['I', 'IV', 'V', 'I'], ['vi', 'IV', 'I', 'V'], ['I', 'vi', 'ii', 'V']],
    'Minor': [['i', 'VI', 'III', 'VII'], ['i', 'iv', 'v', 'i'], ['i', 'iv', 'VII', 'III'], ['ii°', 'v', 'i', 'i']]
};

export const useChordProgressionGenerator = () => {
    const { setMetronomeSchedule, addLogEntry, bpm, countdownClicks, setCountdownClicks } = useTools();

    const [rootNote, setRootNote] = useState('C');
    const [keyType, setKeyType] = useState('Major');
    const [numChords, setNumChords] = useState(4);
    const [numProgressions, setNumProgressions] = useState(1);
    const [chordComplexity, setChordComplexity] = useState('Triads');
    const [useCommonPatterns, setUseCommonPatterns] = useState(true);
    const [includeDiminished, setIncludeDiminished] = useState(false);
    const [qualityFilter, setQualityFilter] = useState('all');
    const [isAutoGenerateOn, setIsAutoGenerateOn] = useState(false);
    const [autoGenerateInterval, setAutoGenerateInterval] = useState(numChords);
    const [displayMode, setDisplayMode] = useState('both');
    const [isControlsOpen, setIsControlsOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [fontSize, setFontSize] = useState(3);
    const [progressions, setProgressions] = useState([]);
    const [openSections, setOpenSections] = useState({
        general: true, options: false, display: false, automation: false
    });

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleGenerate = useCallback(() => {
        const apiComplexity = chordComplexity === 'Tetrads' ? '7ths' : 'Triads';
        let diatonicChords = getDiatonicChords(rootNote, keyType, apiComplexity);
        
        let availableChords = [...diatonicChords];
        if (!includeDiminished) {
            availableChords = availableChords.filter(c => !c.quality.includes('Diminished'));
        }
        
        if (qualityFilter === 'major') {
            availableChords = availableChords.filter(c => {
                const q = c.quality;
                return q.includes('Major') || q.includes('Dominant') || q.includes('Augmented');
            });
        } else if (qualityFilter === 'minor') {
            availableChords = availableChords.filter(c => {
                const q = c.quality;
                return q.includes('Minor') || q.includes('Half-Diminished');
            });
        }
        
        const canUseCommonPatterns = useCommonPatterns && qualityFilter === 'all';
        const newProgressions = [];
        for (let i = 0; i < numProgressions; i++) {
            const singleProgression = [];
            if (canUseCommonPatterns && availableChords.length > 0) {
                const basePatterns = COMMON_PATTERNS[keyType === 'Major' ? 'Major' : 'Minor'] || COMMON_PATTERNS['Major'];
                const basePattern = basePatterns[Math.floor(Math.random() * basePatterns.length)];
                
                const finalPattern = [];
                for (let j = 0; j < numChords; j++) {
                    finalPattern.push(basePattern[j % basePattern.length]);
                }

                for (const roman of finalPattern) {
                    const numeralIndex = ROMAN_NUMERALS.indexOf(roman.toUpperCase());
                    let chord = diatonicChords[numeralIndex];
                    if (chord) {
                         if (keyType !== 'Major' && !['i', 'ii°', 'v', 'vii°'].includes(roman)) {
                            chord.roman = roman.toUpperCase();
                        } else {
                            chord.roman = roman;
                        }
                        singleProgression.push(chord);
                    }
                }
            } else if (availableChords.length > 0) { 
                let lastChord = null;
                for (let j = 0; j < numChords; j++) {
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
    }, [rootNote, keyType, chordComplexity, numChords, numProgressions, useCommonPatterns, includeDiminished, qualityFilter]);
    
    const scheduledGenerate = useCallback(() => {
        setTimeout(handleGenerate, 0);
    }, [handleGenerate]);

    useEffect(() => { handleGenerate(); }, [handleGenerate]);
    useEffect(() => { setAutoGenerateInterval(numChords); }, [numChords]);
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
        const remarks = prompt("Enter any remarks for this session:", `Practiced chord progressions in ${rootNote} ${keyType}.`);
        if (remarks !== null) {
            addLogEntry({
                game: 'Chord Progression Generator', bpm: bpm || 'N/A',
                date: new Date().toLocaleDateString(), remarks: remarks || "No remarks."
            });
            alert("Session logged!");
        }
    };
    
    const handleQualityFilterChange = (filter) => {
        setQualityFilter(filter);
        if (filter !== 'all') {
            setUseCommonPatterns(false);
        }
    };

    return {
        rootNote, setRootNote,
        keyType, setKeyType,
        numChords, setNumChords,
        numProgressions, setNumProgressions,
        chordComplexity, setChordComplexity,
        useCommonPatterns, setUseCommonPatterns,
        includeDiminished, setIncludeDiminished,
        qualityFilter, handleQualityFilterChange,
        isAutoGenerateOn, setIsAutoGenerateOn,
        autoGenerateInterval, setAutoGenerateInterval,
        displayMode, setDisplayMode,
        isControlsOpen, setIsControlsOpen,
        isInfoModalOpen, setIsInfoModalOpen,
        fontSize, setFontSize,
        progressions,
        openSections, toggleSection,
        countdownClicks, setCountdownClicks,
        handleGenerate,
        handleLogSession,
    };
};