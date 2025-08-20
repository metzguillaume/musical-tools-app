// src/context/defaultPresets.js

/**
 * Defines the default, non-deletable presets that are available to the user from the start.
 * Each preset has a unique 'id' starting with 'default-', a 'gameId' matching its component,
 * a 'gameName' for display, and a 'settings' object reflecting the tool's initial state.
 * The 'isDefault: true' property is used to prevent deletion and to filter them out when saving
 * user-created presets to localStorage.
 */
export const defaultPresets = [
    // Note Generator Default
    {
        id: 'default-01',
        name: 'Default Notes',
        gameId: 'note-generator',
        gameName: 'Note Generator',
        isDefault: true,
        settings: {
            numNotes: 12,
            noteType: 'chromatic',
            showBarlines: true,
            fontSize: 2.7,
            barlineFrequency: 4,
            avoidRepeats: true,
        },
    },
    // Interval Generator Default
    {
        id: 'default-02',
        name: 'Default Intervals',
        gameId: 'interval-generator',
        gameName: 'Interval Generator',
        isDefault: true,
        settings: {
            numIntervals: 1,
            selectedQualities: { 'Perfect': true, 'Major': true, 'Minor': true, 'Augmented': false, 'Diminished': false },
            useShorthand: false,
            displayMode: 'stacked',
        },
    },
    // Chord Progression Generator Default
    {
        id: 'default-03',
        name: 'Default Chord Progressions',
        gameId: 'chord-progression-generator',
        gameName: 'Chord Progression Generator',
        isDefault: true,
        settings: {
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
            generationMode: 'diatonic',
            allowedQualities: { major: true, minor: true, diminished: false, augmented: false },
            includeSusChords: false,
            showBarLines: true,
            chordsPerBar: 4,
        },
    },
    // Interval Practice Quiz Default
    {
        id: 'default-04',
        name: 'Default Interval Quiz',
        gameId: 'intervals-quiz',
        gameName: 'Interval Practice',
        isDefault: true,
        settings: {
            quizMode: 'mixed',
            rootNoteType: 'chromatic',
            direction: 'both',
            autoAdvance: true,
            playAudio: true,
            selectedIntervals: { 'Perfect Unison': true, 'Minor 2nd': true, 'Major 2nd': true, 'Minor 3rd': true, 'Major 3rd': true, 'Perfect 4th': true, 'Augmented 4th': true, 'Diminished 5th': true, 'Perfect 5th': true, 'Minor 6th': true, 'Major 6th': true, 'Minor 7th': true, 'Major 7th': true, 'Perfect Octave': true },
            audioDirection: 'above',
            fretboardVolume: -6
        },
    },
    // Triad & Tetrads Quiz Default
    {
        id: 'default-05',
        name: 'Default Triads Quiz',
        gameId: 'triad-quiz',
        gameName: 'Triad & Tetrads Quiz',
        isDefault: true,
        settings: {
            quizMode: 'mixed',
            include7ths: false,
            includeInversions: false,
            autoAdvance: true,
            playAudio: true,
        },
    },
    // Chord Trainer Default
    {
        id: 'default-06',
        name: 'Default Chord Trainer',
        gameId: 'chord-trainer',
        gameName: 'Chord Trainer',
        isDefault: true,
        settings: {
            selectedKeys: ['C', 'G', 'F'],
            selectedModes: [1, 4],
            use7thChords: false,
            generationMethod: 'weighted',
            majorWeights: [10, 6, 4, 8, 10, 8, 2],
            degreeToggles: { 'I': true, 'ii': true, 'iii': true, 'IV': true, 'V': true, 'vi': true, 'vii°': true },
            useAlternateNotation: false,
            autoAdvance: true,
            hideQuality: false,
        },
    },
    // Fretboard Intervals Default
    {
        id: 'default-07',
        name: 'Default Fretboard Intervals',
        gameId: 'interval-fretboard-quiz',
        gameName: 'Fretboard Intervals',
        isDefault: true,
        settings: {
            autoAdvance: true,
            playAudio: true,
            labelType: 'name',
            fretboardVolume: -6
        },
    },
    // CAGED System Quiz Default
    {
        id: 'default-08',
        name: 'Default CAGED Quiz',
        gameId: 'caged-system-quiz',
        gameName: 'CAGED System Quiz',
        isDefault: true,
        settings: {
            includeMajor: true,
            includeMinor: true,
            shapes: { E: true, A: true, G: true, C: true, D: true },
            showDegrees: false,
            quizMode: 'mixed',
        },
    },
    // Interval Recognition (Ear Training) Default
    {
        id: 'default-09',
        name: 'Default Interval Recognition',
        gameId: 'interval-ear-trainer',
        gameName: 'Interval Recognition',
        isDefault: true,
        settings: {
            autoAdvance: true,
            isTrainingMode: false,
            playbackStyle: 'Melodic',
            direction: 'Ascending',
            notePool: 'Diatonic',
            diatonicMode: 'Major',
            answerMode: 'Interval Name',
            rootNoteMode: 'Fixed',
            fixedKey: 'C',
            questionsPerRoot: 5,
            octaveRange: 2,
            useDrone: true,
            playRootNote: true,
            showKeyChange: false,
            replayOnAnswer: false,
        },
    },
    // Melodic Recognition (Ear Training) Default
    {
        id: 'default-10',
        name: 'Default Melodic Recognition',
        gameId: 'melodic-ear-trainer',
        gameName: 'Melodic Recognition',
        isDefault: true,
        settings: {
            autoAdvance: true,
            answerMode: 'Scale Degrees',
            octaveRange: 1,
            melodyLength: 4,
            startOnRoot: true,
            playRootFirst: false,
            useDrone: true,
            notePool: 'Diatonic',
            diatonicMode: 'Major',
            rootNoteMode: 'Roving',
            fixedKey: 'C',
            questionsPerRoot: 5,
            replayOnAnswer: false,
        },
    },
];