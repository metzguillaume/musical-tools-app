// src/components/scaleDegreeQuiz/scaleDegreeConstants.js

// ─── PENTATONIC SHAPES (reused from pentatonicConstants) ───────────────────

export const SCALE_SHAPES = {

    // ── MAJOR PENTATONIC ──────────────────────────────────────────────────
    majorPentatonic: {
        E: { notes: [
            {s:6, f:0, degree:'1', d:'R'}, {s:6, f:2, degree:'2'},
            {s:5, f:-1, degree:'3'}, {s:5, f:2, degree:'5'},
            {s:4, f:-1, degree:'6'}, {s:4, f:2, degree:'1', d:'R'},
            {s:3, f:-1, degree:'2'}, {s:3, f:1, degree:'3'},
            {s:2, f:0, degree:'5'}, {s:2, f:2, degree:'6'},
            {s:1, f:0, degree:'1', d:'R'}, {s:1, f:2, degree:'2'},
        ]},
        G: { notes: [
            {s:6, f:-3, degree:'6'}, {s:6, f:0, degree:'1', d:'R'},
            {s:5, f:-3, degree:'2'}, {s:5, f:-1, degree:'3'},
            {s:4, f:-3, degree:'5'}, {s:4, f:-1, degree:'6'},
            {s:3, f:-3, degree:'1', d:'R'}, {s:3, f:-1, degree:'2'},
            {s:2, f:-3, degree:'3'}, {s:2, f:0, degree:'5'},
            {s:1, f:-3, degree:'6'}, {s:1, f:0, degree:'1', d:'R'},
        ]},
        A: { notes: [
            {s:6, f:0, degree:'5'}, {s:6, f:2, degree:'6'},
            {s:5, f:0, degree:'1', d:'R'}, {s:5, f:2, degree:'2'},
            {s:4, f:-1, degree:'3'}, {s:4, f:2, degree:'5'},
            {s:3, f:-1, degree:'6'}, {s:3, f:2, degree:'1', d:'R'},
            {s:2, f:0, degree:'2'}, {s:2, f:2, degree:'3'},
            {s:1, f:0, degree:'5'}, {s:1, f:2, degree:'6'},
        ]},
        C: { notes: [
            {s:6, f:-3, degree:'3'}, {s:6, f:0, degree:'5'},
            {s:5, f:-3, degree:'6'}, {s:5, f:0, degree:'1', d:'R'},
            {s:4, f:-3, degree:'2'}, {s:4, f:-1, degree:'3'},
            {s:3, f:-3, degree:'5'}, {s:3, f:-1, degree:'6'},
            {s:2, f:-2, degree:'1', d:'R'}, {s:2, f:0, degree:'2'},
            {s:1, f:-3, degree:'3'}, {s:1, f:0, degree:'5'},
        ]},
        D: { notes: [
            {s:6, f:0, degree:'2'}, {s:6, f:2, degree:'3'},
            {s:5, f:0, degree:'5'}, {s:5, f:2, degree:'6'},
            {s:4, f:0, degree:'1', d:'R'}, {s:4, f:2, degree:'2'},
            {s:3, f:-1, degree:'3'}, {s:3, f:2, degree:'5'},
            {s:2, f:0, degree:'6'}, {s:2, f:3, degree:'1', d:'R'},
            {s:1, f:0, degree:'2'}, {s:1, f:2, degree:'3'},
        ]},
    },

    // ── MINOR PENTATONIC ──────────────────────────────────────────────────
    minorPentatonic: {
        E: { notes: [
            {s:6, f:0, degree:'1', d:'R'}, {s:6, f:3, degree:'b3'},
            {s:5, f:0, degree:'4'}, {s:5, f:2, degree:'5'},
            {s:4, f:0, degree:'b7'}, {s:4, f:2, degree:'1', d:'R'},
            {s:3, f:0, degree:'b3'}, {s:3, f:2, degree:'4'},
            {s:2, f:0, degree:'5'}, {s:2, f:3, degree:'b7'},
            {s:1, f:0, degree:'1', d:'R'}, {s:1, f:3, degree:'b3'},
        ]},
        G: { notes: [
            {s:6, f:-2, degree:'b7'}, {s:6, f:0, degree:'1', d:'R'},
            {s:5, f:-2, degree:'b3'}, {s:5, f:0, degree:'4'},
            {s:4, f:-3, degree:'5'}, {s:4, f:0, degree:'b7'},
            {s:3, f:-3, degree:'1', d:'R'}, {s:3, f:0, degree:'b3'},
            {s:2, f:-2, degree:'4'}, {s:2, f:0, degree:'5'},
            {s:1, f:-2, degree:'b7'}, {s:1, f:0, degree:'1', d:'R'},
        ]},
        A: { notes: [
            {s:6, f:0, degree:'5'}, {s:6, f:3, degree:'b7'},
            {s:5, f:0, degree:'1', d:'R'}, {s:5, f:3, degree:'b3'},
            {s:4, f:0, degree:'4'}, {s:4, f:2, degree:'5'},
            {s:3, f:0, degree:'b7'}, {s:3, f:2, degree:'1', d:'R'},
            {s:2, f:1, degree:'b3'}, {s:2, f:3, degree:'4'},
            {s:1, f:0, degree:'5'}, {s:1, f:3, degree:'b7'},
        ]},
        C: { notes: [
            {s:6, f:-2, degree:'4'}, {s:6, f:0, degree:'5'},
            {s:5, f:-2, degree:'b7'}, {s:5, f:0, degree:'1', d:'R'},
            {s:4, f:-2, degree:'b3'}, {s:4, f:0, degree:'4'},
            {s:3, f:-3, degree:'5'}, {s:3, f:0, degree:'b7'},
            {s:2, f:-2, degree:'1', d:'R'}, {s:2, f:1, degree:'b3'},
            {s:1, f:-2, degree:'4'}, {s:1, f:0, degree:'5'},
        ]},
        D: { notes: [
            {s:6, f:1, degree:'b3'}, {s:6, f:3, degree:'4'},
            {s:5, f:0, degree:'5'}, {s:5, f:3, degree:'b7'},
            {s:4, f:0, degree:'1', d:'R'}, {s:4, f:3, degree:'b3'},
            {s:3, f:0, degree:'4'}, {s:3, f:2, degree:'5'},
            {s:2, f:1, degree:'b7'}, {s:2, f:3, degree:'1', d:'R'},
            {s:1, f:1, degree:'b3'}, {s:1, f:3, degree:'4'},
        ]},
    },

    // ── MAJOR SCALE (pentatonic + 4 after every 3, + 7 before every root) ─
    majorScale: {
        E: { notes: [
            {s:6, f:-1, degree:'7'},
            {s:6, f:0,  degree:'1', d:'R'}, {s:6, f:2, degree:'2'},
            {s:5, f:-1, degree:'3'}, {s:5, f:0, degree:'4'}, {s:5, f:2, degree:'5'},
            {s:4, f:-1, degree:'6'}, {s:4, f:1, degree:'7'},
            {s:4, f:2,  degree:'1', d:'R'},
            {s:3, f:-1, degree:'2'}, {s:3, f:1, degree:'3'}, {s:3, f:2, degree:'4'},
            {s:2, f:0,  degree:'5'}, {s:2, f:2, degree:'6'},
            {s:1, f:-1, degree:'7'},
            {s:1, f:0,  degree:'1', d:'R'}, {s:1, f:2, degree:'2'},
        ]},
        G: { notes: [
            {s:6, f:-3, degree:'6'}, {s:6, f:-1, degree:'7'},
            {s:6, f:0,  degree:'1', d:'R'},
            {s:5, f:-3, degree:'2'}, {s:5, f:-1, degree:'3'}, {s:5, f:0, degree:'4'},
            {s:4, f:-3, degree:'5'}, {s:4, f:-1, degree:'6'},
            {s:3, f:-4, degree:'7'},
            {s:3, f:-3, degree:'1', d:'R'}, {s:3, f:-1, degree:'2'},
            {s:2, f:-3, degree:'3'}, {s:2, f:-2, degree:'4'}, {s:2, f:0, degree:'5'},
            {s:1, f:-3, degree:'6'}, {s:1, f:-1, degree:'7'},
            {s:1, f:0,  degree:'1', d:'R'},
        ]},
        A: { notes: [
            {s:6, f:0,  degree:'5'}, {s:6, f:2, degree:'6'},
            {s:5, f:-1, degree:'7'},
            {s:5, f:0,  degree:'1', d:'R'}, {s:5, f:2, degree:'2'},
            {s:4, f:-1, degree:'3'}, {s:4, f:0, degree:'4'}, {s:4, f:2, degree:'5'},
            {s:3, f:-1, degree:'6'}, {s:3, f:1, degree:'7'},
            {s:3, f:2,  degree:'1', d:'R'},
            {s:2, f:0,  degree:'2'}, {s:2, f:2, degree:'3'}, {s:2, f:3, degree:'4'},
            {s:1, f:0,  degree:'5'}, {s:1, f:2, degree:'6'},
        ]},
        C: { notes: [
            {s:6, f:-3, degree:'3'}, {s:6, f:-2, degree:'4'}, {s:6, f:0, degree:'5'},
            {s:5, f:-3, degree:'6'}, {s:5, f:-1, degree:'7'},
            {s:5, f:0,  degree:'1', d:'R'},
            {s:4, f:-3, degree:'2'}, {s:4, f:-1, degree:'3'}, {s:4, f:0, degree:'4'},
            {s:3, f:-3, degree:'5'}, {s:3, f:-1, degree:'6'},
            {s:2, f:-3, degree:'7'},
            {s:2, f:-2, degree:'1', d:'R'}, {s:2, f:0, degree:'2'},
            {s:1, f:-3, degree:'3'}, {s:1, f:-2, degree:'4'}, {s:1, f:0, degree:'5'},
        ]},
        D: { notes: [
            {s:6, f:0,  degree:'2'}, {s:6, f:2, degree:'3'}, {s:6, f:3, degree:'4'},
            {s:5, f:0,  degree:'5'}, {s:5, f:2, degree:'6'},
            {s:4, f:-1, degree:'7'},
            {s:4, f:0,  degree:'1', d:'R'}, {s:4, f:2, degree:'2'},
            {s:3, f:-1, degree:'3'}, {s:3, f:0, degree:'4'}, {s:3, f:2, degree:'5'},
            {s:2, f:0,  degree:'6'}, {s:2, f:2, degree:'7'},
            {s:2, f:3,  degree:'1', d:'R'},
            {s:1, f:0,  degree:'2'}, {s:1, f:2, degree:'3'}, {s:1, f:3, degree:'4'},
        ]},
    },

    // ── NATURAL MINOR SCALE (pentatonic + 2 before every b3, + b6 after every 5) ─
    naturalMinor: {
        E: { notes: [
            {s:6, f:0,  degree:'1', d:'R'}, {s:6, f:2, degree:'2'}, {s:6, f:3, degree:'b3'},
            {s:5, f:0,  degree:'4'}, {s:5, f:2, degree:'5'}, {s:5, f:3, degree:'b6'},
            {s:4, f:0,  degree:'b7'},
            {s:4, f:2,  degree:'1', d:'R'},
            {s:3, f:-1, degree:'2'}, {s:3, f:0, degree:'b3'}, {s:3, f:2, degree:'4'},
            {s:2, f:0,  degree:'5'}, {s:2, f:1, degree:'b6'}, {s:2, f:3, degree:'b7'},
            {s:1, f:0,  degree:'1', d:'R'}, {s:1, f:2, degree:'2'}, {s:1, f:3, degree:'b3'},
        ]},
        G: { notes: [
            {s:6, f:-2, degree:'b7'}, {s:6, f:0, degree:'1', d:'R'},
            {s:5, f:-3, degree:'2'}, {s:5, f:-2, degree:'b3'}, {s:5, f:0, degree:'4'},
            {s:4, f:-3, degree:'5'}, {s:4, f:-2, degree:'b6'}, {s:4, f:0, degree:'b7'},
            {s:3, f:-3, degree:'1', d:'R'}, {s:3, f:-1, degree:'2'}, {s:3, f:0, degree:'b3'},
            {s:2, f:-2, degree:'4'}, {s:2, f:0, degree:'5'}, {s:2, f:1, degree:'b6'},
            {s:1, f:-2, degree:'b7'}, {s:1, f:0, degree:'1', d:'R'},
        ]},
        A: { notes: [
            {s:6, f:0,  degree:'5'}, {s:6, f:1, degree:'b6'}, {s:6, f:3, degree:'b7'},
            {s:5, f:0,  degree:'1', d:'R'}, {s:5, f:2, degree:'2'}, {s:5, f:3, degree:'b3'},
            {s:4, f:0,  degree:'4'}, {s:4, f:2, degree:'5'}, {s:4, f:3, degree:'b6'},
            {s:3, f:0,  degree:'b7'},
            {s:3, f:2,  degree:'1', d:'R'},
            {s:2, f:0,  degree:'2'}, {s:2, f:1, degree:'b3'}, {s:2, f:3, degree:'4'},
            {s:1, f:0,  degree:'5'}, {s:1, f:1, degree:'b6'}, {s:1, f:3, degree:'b7'},
        ]},
        C: { notes: [
            {s:6, f:-2, degree:'4'}, {s:6, f:0, degree:'5'}, {s:6, f:1, degree:'b6'},
            {s:5, f:-2, degree:'b7'},
            {s:5, f:0,  degree:'1', d:'R'},
            {s:4, f:-3, degree:'2'}, {s:4, f:-2, degree:'b3'}, {s:4, f:0, degree:'4'},
            {s:3, f:-3, degree:'5'}, {s:3, f:-2, degree:'b6'}, {s:3, f:0, degree:'b7'},
            {s:2, f:-2, degree:'1', d:'R'}, {s:2, f:0, degree:'2'}, {s:2, f:1, degree:'b3'},
            {s:1, f:-2, degree:'4'}, {s:1, f:0, degree:'5'}, {s:1, f:1, degree:'b6'},
        ]},
        D: { notes: [
            {s:6, f:0,  degree:'2'}, {s:6, f:1, degree:'b3'}, {s:6, f:3, degree:'4'},
            {s:5, f:0,  degree:'5'}, {s:5, f:1, degree:'b6'}, {s:5, f:3, degree:'b7'},
            {s:4, f:0,  degree:'1', d:'R'}, {s:4, f:2, degree:'2'}, {s:4, f:3, degree:'b3'},
            {s:3, f:0,  degree:'4'}, {s:3, f:2, degree:'5'}, {s:3, f:3, degree:'b6'},
            {s:2, f:1,  degree:'b7'},
            {s:2, f:3,  degree:'1', d:'R'},
            {s:1, f:0,  degree:'2'}, {s:1, f:1, degree:'b3'}, {s:1, f:3, degree:'4'},
        ]},
    },
};

// ── SCALE TYPE METADATA ────────────────────────────────────────────────────
// Used for display labels and quality classification
export const SCALE_TYPE_INFO = {
    majorPentatonic: { label: 'Major Pentatonic', quality: 'major', shortLabel: 'Maj Penta' },
    minorPentatonic: { label: 'Minor Pentatonic', quality: 'minor', shortLabel: 'Min Penta' },
    majorScale:      { label: 'Major Scale',      quality: 'major', shortLabel: 'Major' },
    naturalMinor:    { label: 'Natural Minor',    quality: 'minor', shortLabel: 'Nat. Minor' },
};

// ── CAGED SHAPE ORDER ──────────────────────────────────────────────────────
export const SHAPE_ORDER = ['E', 'A', 'G', 'C', 'D'];

// ── ALL POSSIBLE ANSWER DEGREES ───────────────────────────────────────────
export const DEGREE_BUTTONS = [
    '1', 'b2', '2', 'b3', '3', '4', '#4/b5', '5', 'b6', '6', 'b7', '7'
];

// Normalize a degree from shape data to match a DEGREE_BUTTON value
// e.g. '#4' or 'b5' both map to '#4/b5'
export const normalizeDegree = (degree) => {
    if (degree === '#4' || degree === 'b5' || degree === '#4/b5') return '#4/b5';
    return degree;
};