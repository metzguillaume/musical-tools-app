// src/components/rhythmTool/rhythmConstants.js

// +++ UPDATED: Added new 'group' types +++
export const NOTE_TYPES = {
    'whole': { duration: 4, type: 'note', label: 'Whole', symbol: '𝅝' },
    'dottedHalf': { duration: 3, type: 'note', label: 'Dotted Half', symbol: '𝅗𝅥.' },
    'half': { duration: 2, type: 'note', label: 'Half', symbol: '𝅗𝅥' },
    'dottedQuarter': { duration: 1.5, type: 'note', label: 'Dotted Quarter', symbol: '♩.' },
    'quarter': { duration: 1, type: 'note', label: 'Quarter', symbol: '♩' },
    'dottedEighth': { duration: 0.75, type: 'note', label: 'Dotted Eighth', symbol: '♪.' },
    'eighth': { duration: 0.5, type: 'note', label: 'Eighth', symbol: '♪' },
    'sixteenth': { duration: 0.25, type: 'note', label: 'Sixteenth', symbol: '𝅘𝅥𝅯' },
    
    // +++ NEW Beamed Groups +++
    'eighthBeamedPair': { 
        duration: 1, 
        type: 'group',
        playback: [0.5, 0.5], 
        label: 'Two 8ths', 
        symbol: '♫' // Using '♫' as a simple symbol
    },
    'sixteenthBeamedGroup': {
        duration: 1,
        type: 'group',
        playback: [0.25, 0.25, 0.25, 0.25],
        label: 'Four 16ths',
        symbol: '♬' // Using '♬' as a simple symbol
    },
    
    'tripletEighth': { 
        duration: 1, 
        type: 'triplet',
        playback: [1/3, 1/3, 1/3], 
        label: 'Eighth Triplet', 
        symbol: '³♪'
    },
};

export const REST_TYPES = {
    'wholeRest': { duration: 4, type: 'rest', label: 'Whole Rest', symbol: '—' },
    'halfRest': { duration: 2, type: 'rest', label: 'Half Rest', symbol: '–' },
    'quarterRest': { duration: 1, type: 'rest', label: 'Quarter Rest', symbol: '𝄽' },
    'eighthRest': { duration: 0.5, type: 'rest', label: 'Eighth Rest', symbol: '𝄾' },
    'sixteenthRest': { duration: 0.25, type: 'rest', label: 'Sixteenth Rest', symbol: '𝄿' },
};

export const ALL_RHYTHM_TYPES = { ...NOTE_TYPES, ...REST_TYPES };
// +++ UPDATED: Added new groups to the palette +++
export const PALETTE_ITEMS = [ 
    ...Object.entries(NOTE_TYPES), 
    ...Object.entries(REST_TYPES) 
];

export const TIME_SIGNATURES = [
    { beats: 4, beatType: 4, label: '4/4' },
    { beats: 3, beatType: 4, label: '3/4' },
    { beats: 2, beatType: 4, label: '2/4' },
    { beats: 6, beatType: 8, label: '6/8' },
];

export const RHYTHM_CHOICES = [
    {
        label: "Notes",
        items: Object.entries(NOTE_TYPES).map(([key, value]) => ({ key, ...value }))
    },
    {
        label: "Rests",
        items: Object.entries(REST_TYPES).map(([key, value]) => ({ key, ...value }))
    }
];

// +++ UPDATED: Simplified pattern bank to use new group types +++
export const RHYTHM_PATTERN_BANK = [
    // --- Complexity 1 (Basic On-Beat) ---
    { duration: 1, types: ['quarter'], notes: ['quarter'], complexity: 1 },
    { duration: 2, types: ['half'], notes: ['half'], complexity: 1 },
    { duration: 4, types: ['whole'], notes: ['whole'], complexity: 1 },
    { duration: 1, types: ['quarterRest'], notes: ['quarterRest'], complexity: 1 },
    { duration: 2, types: ['halfRest'], notes: ['halfRest'], complexity: 1 },
    { duration: 4, types: ['wholeRest'], notes: ['wholeRest'], complexity: 1 },
    { duration: 1, types: ['eighthBeamedPair'], notes: ['eighthBeamedPair'], complexity: 1 }, // <-- USE NEW TYPE
    { duration: 1, types: ['eighth', 'eighthRest'], notes: ['eighth', 'eighthRest'], complexity: 1 },
    { duration: 1, types: ['eighthRest', 'eighth'], notes: ['eighthRest', 'eighth'], complexity: 1 },

    // --- Complexity 2 (Basic 16th Patterns) ---
    { duration: 1, types: ['sixteenthBeamedGroup'], notes: ['sixteenthBeamedGroup'], complexity: 2 }, // <-- USE NEW TYPE
    { duration: 1, types: ['eighth', 'sixteenth', 'sixteenth'], notes: ['eighth', 'sixteenth', 'sixteenth'], complexity: 2 },
    { duration: 1, types: ['sixteenth', 'sixteenth', 'eighth'], notes: ['sixteenth', 'sixteenth', 'eighth'], complexity: 2 },
    { duration: 1, types: ['eighthRest', 'sixteenth', 'sixteenth'], notes: ['eighthRest', 'sixteenth', 'sixteenth'], complexity: 2 },
    { duration: 1, types: ['sixteenth', 'sixteenth', 'eighthRest'], notes: ['sixteenth', 'sixteenth', 'eighthRest'], complexity: 2 },

    // --- Complexity 3 (Dotted 8th Patterns) ---
    { duration: 1, types: ['dottedEighth', 'sixteenth'], notes: ['dottedEighth', 'sixteenth'], complexity: 3 },
    { duration: 1, types: ['sixteenth', 'dottedEighth'], notes: ['sixteenth', 'dottedEighth'], complexity: 3 },
    { duration: 1.5, types: ['dottedQuarter'], notes: ['dottedQuarter'], complexity: 3 },

    // --- Complexity 4 (Syncopated 16ths) ---
    { duration: 1, types: ['sixteenth', 'eighth', 'sixteenth'], notes: ['sixteenth', 'eighth', 'sixteenth'], complexity: 4 },
    { duration: 1, types: ['sixteenthRest', 'eighth', 'sixteenth'], notes: ['sixteenthRest', 'eighth', 'sixteenth'], complexity: 4 },
    { duration: 1, types: ['sixteenth', 'eighth', 'sixteenthRest'], notes: ['sixteenth', 'eighth', 'sixteenthRest'], complexity: 4 },

    // --- Complexity 5 (Triplets) ---
    { duration: 1, types: ['tripletEighth'], notes: ['tripletEighth'], complexity: 5 },
];