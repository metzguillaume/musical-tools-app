// src/hooks/useChordProgressionGenerator.js

import { useState, useEffect, useCallback } from 'react';
import { useTools } from '../../context/ToolsContext';
import { getDiatonicChords, ROMAN_NUMERALS } from '../../utils/musicTheory';

const rootNoteOptions = ['C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'F#', 'B', 'E', 'A', 'D', 'G'];

const COMMON_PATTERNS = {
    'Major': [
        ['I', 'V', 'vi', 'IV'],           // Pop classic (Axis of Awesome)
        ['I', 'IV', 'V', 'IV'],           // Folk/rock
        ['vi', 'IV', 'I', 'V'],           // 90s pop
        ['I', 'vi', 'ii', 'V'],           // Standard jazz turnaround
        ['I', 'iii', 'vi', 'IV'],         // Ballad-style
        ['ii', 'V', 'I', 'vi'],           // Circle of fifths
        ['I', 'V', 'ii', 'IV'],           // Folk/pop
        ['vi', 'ii', 'V', 'I'],           // Jazz-pop turnaround
        ['I', 'IV', 'vi', 'V'],           // 50s progression variant
        ['iii', 'vi', 'IV', 'V'],         // 80s pop
        // New additions
        ['I', 'V', 'IV', 'I'],            // Hymn/Gospel cadence
        ['IV', 'I', 'V', 'I'],            // Classical plagal/half cadence
        ['I', 'vi', 'IV', 'V'],           // Doo-wop progression
        ['ii', 'V', 'I', 'IV'],           // Standard jazz/pop
        ['I', 'IV', 'V', 'I'],            // Classical/rock
        ['iii', 'vi', 'ii', 'V'],         // Jazz/extended cycle
        ['vi', 'I', 'V', 'IV']            // Pop-folk ballad
    ],
    'Minor': [
        ['i', 'VI', 'III', 'VII'],        // Natural minor
        ['i', 'iv', 'v', 'iv'],           // Aeolian feel
        ['i', 'iv', 'VII', 'III'],        // Folk/cinematic
        ['ii°', 'v', 'i', 'VI'],          // Functional cadence
        ['i', 'VII', 'VI', 'V'],          // Andalusian cadence
        ['i', 'iv', 'V', 'i'],            // Minor w/ harmonic V
        ['iv', 'i', 'VII', 'III'],        // Dark folk
        ['i', 'VI', 'iv', 'V'],           // Minor pop/rock
        ['v', 'VI', 'III', 'VII'],        // Modal color
        ['i', 'III', 'VII', 'iv'],        // Melancholic folk
        // New additions
        ['i', 'iv', 'i', 'V'],            // Classical minor cadence
        ['i', 'VI', 'III', 'iv'],         // Film score feel
        ['iv', 'VII', 'i', 'V'],          // Rock/metal minor
        ['i', 'VII', 'i', 'iv'],          // Aeolian loop
        ['ii°', 'V', 'i', 'VII'],         // Functional minor turnaround
        ['i', 'iv', 'VI', 'VII'],         // Dramatic/suspense
        ['i', 'v', 'VI', 'III']           // Common in Baroque minor
    ]
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
        fontSize: 3,
        useAlternateNotation: false,
        generationMode: 'diatonic',
        allowedQualities: { major: true, minor: true, diminished: false, augmented: false },
        includeSusChords: false,
        // Updated display settings
        displayMode: 'measure',      // 'flow' or 'measure'
        chordDegreeView: 'both',   // New setting: 'chords', 'degrees', or 'both'
        chordsPerBar: 1,           // For 'measure' mode
        barsPerLine: 4,            // For 'measure' mode
        flowBarlineFrequency: 4    // For 'flow' mode
    });
    
    const [isAutoGenerateOn, setIsAutoGenerateOn] = useState(false);
    const [autoGenerateInterval, setAutoGenerateInterval] = useState(settings.numChords);
    const [isControlsOpen, setIsControlsOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [progressions, setProgressions] = useState([]);
    const [openSections, setOpenSections] = useState({ general: true, options: false, display: false, automation: false });

    useEffect(() => {
        if (presetToLoad && presetToLoad.gameId === 'chord-progression-generator') {
            const presetSettings = { ...presetToLoad.settings };
            // Handle migration for older presets
            if (!presetSettings.chordDegreeView) {
                presetSettings.chordDegreeView = presetSettings.displayMode || 'both';
            }
            if (presetSettings.showBarLines === true && !presetSettings.displayMode) {
                presetSettings.displayMode = 'measure';
            } else if (presetSettings.showBarLines === false && !presetSettings.displayMode) {
                presetSettings.displayMode = 'flow';
            }
            delete presetSettings.showBarLines;

            setSettings(s => ({...s, ...presetSettings}));
            
            if (presetToLoad.automation) {
                setIsAutoGenerateOn(presetToLoad.automation.isAutoGenerateOn);
                setAutoGenerateInterval(presetToLoad.automation.autoGenerateInterval);
                setCountdownClicks(presetToLoad.automation.countdownClicks);
            }
            clearPresetToLoad();
        }
    }, [presetToLoad, clearPresetToLoad, setCountdownClicks]);

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleGenerate = useCallback(() => {
        const newProgressions = [];

        if (settings.generationMode === 'random') {
            let qualities = Object.entries(settings.allowedQualities)
                .filter(([, isAllowed]) => isAllowed)
                .map(([quality]) => quality);

            if (settings.includeSusChords) {
                qualities.push('sus2', 'sus4');
            }

            if (qualities.length === 0) {
                setProgressions([]);
                return;
            }

            for (let i = 0; i < settings.numProgressions; i++) {
                const singleProgression = [];
                for (let j = 0; j < settings.numChords; j++) {
                    const root = rootNoteOptions[Math.floor(Math.random() * rootNoteOptions.length)];
                    const quality = qualities[Math.floor(Math.random() * qualities.length)];
                    
                    let suffix = '';
                    if (quality === 'major') suffix = '';
                    else if (quality === 'minor') suffix = 'm';
                    else if (quality === 'diminished') suffix = 'dim';
                    else if (quality === 'augmented') suffix = 'aug';
                    else if (quality === 'sus2') suffix = 'sus2';
                    else if (quality === 'sus4') suffix = 'sus4';

                    const chordName = `${root}${suffix}`;
                    singleProgression.push({ name: chordName, tetradName: chordName, roman: 'N/A' });
                }
                newProgressions.push(singleProgression);
            }
        } else {
            const diatonicTriads = getDiatonicChords(settings.rootNote, settings.keyType, 'Triads');
            const diatonicTetrads = getDiatonicChords(settings.rootNote, settings.keyType, '7ths');

            let availableChords = [...diatonicTriads];
            if (!settings.includeDiminished) {
                availableChords = availableChords.filter(c => !c.quality.includes('Diminished'));
            }
            if (settings.qualityFilter === 'major') {
                availableChords = availableChords.filter(c => c.quality.includes('Major') || c.quality.includes('Dominant') || c.quality.includes('Augmented'));
            } else if (settings.qualityFilter === 'minor') {
                availableChords = availableChords.filter(c => c.quality.includes('Minor'));
            }
            
            const canUseCommonPatterns = settings.useCommonPatterns && settings.qualityFilter === 'all';
            
            for (let i = 0; i < settings.numProgressions; i++) {
                const singleProgression = [];
                if (canUseCommonPatterns && availableChords.length > 0) {
                    const isMinorKey = settings.keyType.includes('Minor');
                    const basePatterns = COMMON_PATTERNS[isMinorKey ? 'Minor' : 'Major'];
                    const basePattern = basePatterns[Math.floor(Math.random() * basePatterns.length)];
                    const finalPattern = Array.from({ length: settings.numChords }, (_, j) => basePattern[j % basePattern.length]);

                    for (const roman of finalPattern) {
                        const numeralIndex = ROMAN_NUMERALS.indexOf(roman.replace(/°|\+/g, '').toUpperCase());
                        if (numeralIndex !== -1) {
                            let triad = { ...diatonicTriads[numeralIndex] };
                            let tetrad = { ...diatonicTetrads[numeralIndex] };
                            
                            if (settings.includeSusChords && (triad.quality === 'Major' || triad.quality === 'Minor')) {
                                if (Math.random() < 0.2) {
                                    const susType = Math.random() < 0.5 ? 'sus2' : 'sus4';
                                    triad.name = `${triad.root}${susType}`;
                                    tetrad.name = `${tetrad.root}${susType}`;
                                    triad.roman = `${triad.roman} ${susType}`;
                                }
                            }
                            singleProgression.push({ roman: triad.roman, name: triad.name, tetradName: tetrad.name });
                        }
                    }
                } else if (availableChords.length > 0) {
                    let lastChord = null;
                    for (let j = 0; j < settings.numChords; j++) {
                        let nextChord;
                        do {
                            nextChord = { ...availableChords[Math.floor(Math.random() * availableChords.length)] };
                        } while (nextChord.name === lastChord?.name && availableChords.length > 1);
                        
                        if (settings.includeSusChords && (nextChord.quality === 'Major' || nextChord.quality === 'Minor')) {
                           if (Math.random() < 0.2) {
                                const susType = Math.random() < 0.5 ? 'sus2' : 'sus4';
                                nextChord.name = `${nextChord.root}${susType}`;
                                nextChord.roman = `${nextChord.roman} ${susType}`;
                           }
                        }

                        const numeralIndex = ROMAN_NUMERALS.indexOf(nextChord.roman.replace(/°|\+|sus[24]/g, '').toUpperCase());
                        const tetrad = diatonicTetrads[numeralIndex];
                        singleProgression.push({ ...nextChord, tetradName: tetrad ? tetrad.name : nextChord.name });
                        lastChord = nextChord;
                    }
                }
                newProgressions.push(singleProgression);
            }
        }
        
        if (newProgressions.every(prog => prog.length === 0)) return;
        setProgressions(newProgressions);
    }, [
        settings.rootNote, settings.keyType, settings.numChords, settings.numProgressions,
        settings.useCommonPatterns, settings.includeDiminished, settings.qualityFilter,
        settings.generationMode, settings.allowedQualities, settings.includeSusChords,
    ]);
    
    const scheduledGenerate = useCallback(() => {
        setTimeout(handleGenerate, 0);
    }, [handleGenerate]);

    useEffect(() => {
        handleGenerate();
    }, [handleGenerate]);

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