// src/components/rhythmTool/rhythmConstants.js

// +++ UPDATED: Simplified palette, removed pre-beamed groups +++
export const NOTE_TYPES = {
    'whole': { duration: 4, type: 'note', label: 'Whole', symbol: '𝅝' },
    'dottedHalf': { duration: 3, type: 'note', label: 'Dotted Half', symbol: '𝅗𝅥.' },
    'half': { duration: 2, type: 'note', label: 'Half', symbol: '𝅗𝅥' },
    'dottedQuarter': { duration: 1.5, type: 'note', label: 'Dotted Quarter', symbol: '♩.' },
    'quarter': { duration: 1, type: 'note', label: 'Quarter', symbol: '♩' },
    'dottedEighth': { duration: 0.75, type: 'note', label: 'Dotted Eighth', symbol: '♪.' },
    'eighth': { duration: 0.5, type: 'note', label: 'Eighth', symbol: '♪' },
    'sixteenth': { duration: 0.25, type: 'note', label: 'Sixteenth', symbol: '𝅘𝅥𝅯' },
    
    // +++ NEW: Added Triplet group +++
    'tripletEighth': { 
        duration: 1, // Takes the space of 1 quarter note
        type: 'triplet', // Special type
        playback: [1/3, 1/3, 1/3], // Plays 3 notes
        label: 'Eighth Triplet', 
        symbol: '³♪' // Placeholder symbol
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
export const PALETTE_ITEMS = [ ...Object.entries(NOTE_TYPES), ...Object.entries(REST_TYPES) ];

export const TIME_SIGNATURES = [
    { beats: 4, beatType: 4, label: '4/4' },
    { beats: 3, beatType: 4, label: '3/4' },
    { beats: 2, beatType: 4, label: '2/4' },
    { beats: 6, beatType: 8, label: '6/8' },
];

export const RHYTHM_BANK = {
    'level1': {
        label: 'Level 1: Basic',
        items: ['quarter', 'half', 'whole', 'quarterRest', 'halfRest']
    },
    'level2': {
        label: 'Level 2: Eighths',
        items: ['quarter', 'half', 'eighth', 'quarterRest', 'eighthRest']
    },
    'level3': {
        label: 'Level 3: Sixteenths',
        items: ['quarter', 'eighth', 'sixteenth', 'quarterRest', 'eighthRest']
    },
    'level4': {
        label: 'Level 4: Dotted',
        items: ['dottedQuarter', 'dottedEighth', 'quarter', 'eighth', 'sixteenth', 'quarterRest', 'eighthRest']
    },
    'level5': {
        label: 'Level 5: Triplets',
        items: ['quarter', 'eighth', 'tripletEighth', 'quarterRest', 'eighthRest']
    },
    'level6': {
        label: 'Level 6: All',
        items: Object.keys(ALL_RHYTHM_TYPES) // All available items
    }
};

export const QUIZ_LEVELS = Object.entries(RHYTHM_BANK).map(([key, value]) => ({
    id: key,
    label: value.label,
}));