// Durations are relative to a quarter note (which is 1)
export const NOTE_TYPES = {
    'whole': { duration: 4, type: 'note', label: 'Whole', symbol: '𝅝' },
    'half': { duration: 2, type: 'note', label: 'Half', symbol: '𝅗𝅥' },
    'quarter': { duration: 1, type: 'note', label: 'Quarter', symbol: '♩' },
    'eighth': { duration: 0.5, type: 'note', label: 'Eighth', symbol: '♪' },
    'sixteenth': { duration: 0.25, type: 'note', label: 'Sixteenth', symbol: '𝅘𝅥𝅯' }, // Corrected symbol
};

export const REST_TYPES = {
    'wholeRest': { duration: 4, type: 'rest', label: 'Whole Rest', symbol: '𝄻' },
    'halfRest': { duration: 2, type: 'rest', label: 'Half Rest', symbol: '𝄼' },
    'quarterRest': { duration: 1, type: 'rest', label: 'Quarter Rest', symbol: '𝄽' },
    'eighthRest': { duration: 0.5, type: 'rest', label: 'Eighth Rest', symbol: '𝄾' },
    'sixteenthRest': { duration: 0.25, type: 'rest', label: 'Sixteenth Rest', symbol: '𝆺𝅥𝅯' }, // Corrected symbol
};

export const ALL_RHYTHM_TYPES = { ...NOTE_TYPES, ...REST_TYPES };
export const PALETTE_ITEMS = [ ...Object.entries(NOTE_TYPES), ...Object.entries(REST_TYPES) ];

export const TIME_SIGNATURES = [
    { beats: 4, beatType: 4, label: '4/4' },
    { beats: 3, beatType: 4, label: '3/4' },
    { beats: 2, beatType: 4, label: '2/4' },
    { beats: 6, beatType: 8, label: '6/8' },
];

// This is no longer needed as we only use the guitar sound.
// export const PLAYBACK_SOUNDS = [ ... ];