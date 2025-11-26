// src/components/pentatonic/pentatonicConstants.js

export const PENTATONIC_INTERVALS = {
    major: [0, 2, 4, 7, 9], 
    minor: [0, 3, 5, 7, 10] 
};

// Exact Shape definitions based on your input/images
export const PENTATONIC_SHAPES = {
    major: {
        E: { 
            // Anchor: String 6 (Low E).
            // Pattern 1 Major
            notes: [
                {s:6, f:0, degree:'1', d:'R'}, {s:6, f:2, degree:'2'},
                {s:5, f:-1, degree:'3'}, {s:5, f:2, degree:'5'},
                {s:4, f:-1, degree:'6'}, {s:4, f:2, degree:'1', d:'R'},
                {s:3, f:-1, degree:'2'}, {s:3, f:1, degree:'3'},
                {s:2, f:0, degree:'5'}, {s:2, f:2, degree:'6'},
                {s:1, f:0, degree:'1', d:'R'}, {s:1, f:2, degree:'2'}
            ]
        },
        G: {
            // Anchor: String 6 (Low E).
            // Pattern 5 Major (The shape sits "behind" the root)
            notes: [
                {s:6, f:-3, degree:'6'}, {s:6, f:0, degree:'1', d:'R'},
                {s:5, f:-3, degree:'2'}, {s:5, f:-1, degree:'3'},
                {s:4, f:-3, degree:'5'}, {s:4, f:-1, degree:'6'},
                {s:3, f:-3, degree:'1', d:'R'}, {s:3, f:-1, degree:'2'},
                {s:2, f:-3, degree:'3'}, {s:2, f:0, degree:'5'}, // Root often played here
                {s:1, f:-3, degree:'6'}, {s:1, f:0, degree:'1', d:'R'}
            ]
        },
        A: {
            // Anchor: String 5 (A String).
            // Pattern 4 Major
            notes: [
                {s:6, f:0, degree:'5'}, {s:6, f:2, degree:'6'},
                {s:5, f:0, degree:'1', d:'R'}, {s:5, f:2, degree:'2'},
                {s:4, f:-1, degree:'3'}, {s:4, f:2, degree:'5'},
                {s:3, f:-1, degree:'6'}, {s:3, f:2, degree:'1', d:'R'},
                {s:2, f:0, degree:'2'}, {s:2, f:2, degree:'3'},
                {s:1, f:0, degree:'5'}, {s:1, f:2, degree:'6'} // High string extension
            ]
        },
        C: {
            // Anchor: String 5 (A String).
            // Pattern 3 Major
            notes: [
                {s:6, f:-3, degree:'3'}, {s:6, f:0, degree:'5'},
                {s:5, f:-3, degree:'6'}, {s:5, f:0, degree:'1', d:'R'},
                {s:4, f:-3, degree:'2'}, {s:4, f:-1, degree:'3'},
                {s:3, f:-3, degree:'5'}, {s:3, f:-1, degree:'6'},
                {s:2, f:-2, degree:'1', d:'R'}, {s:2, f:0, degree:'2'},
                {s:1, f:-3, degree:'3'}, {s:1, f:0, degree:'5'}
            ]
        },
        D: {
            // Anchor: String 4 (D String).
            // Pattern 2 Major
            notes: [
                {s:6, f:0, degree:'2'}, {s:6, f:2, degree:'3'},
                {s:5, f:0, degree:'5'}, {s:5, f:2, degree:'6'},
                {s:4, f:0, degree:'1', d:'R'}, {s:4, f:2, degree:'2'},
                {s:3, f:-1, degree:'3'}, {s:3, f:2, degree:'5'},
                {s:2, f:0, degree:'6'}, {s:2, f:3, degree:'1', d:'R'},
                {s:1, f:0, degree:'2'}, {s:1, f:2, degree:'3'}
            ]
        }
    },
    minor: {
        E: {
            // Anchor: String 6. (Minor Pattern 1)
            notes: [
                {s:6, f:0, degree:'1', d:'R'}, {s:6, f:3, degree:'b3'},
                {s:5, f:0, degree:'4'}, {s:5, f:2, degree:'5'},
                {s:4, f:0, degree:'b7'}, {s:4, f:2, degree:'1', d:'R'},
                {s:3, f:0, degree:'b3'}, {s:3, f:2, degree:'4'},
                {s:2, f:0, degree:'5'}, {s:2, f:3, degree:'b7'},
                {s:1, f:0, degree:'1', d:'R'}, {s:1, f:3, degree:'b3'}
            ]
        },
        G: {
            // Anchor: String 6. (Minor Pattern 5 - behind root)
            notes: [
                {s:6, f:-2, degree:'b7'}, {s:6, f:0, degree:'1', d:'R'},
                {s:5, f:-2, degree:'b3'}, {s:5, f:0, degree:'4'},
                {s:4, f:-3, degree:'5'}, {s:4, f:0, degree:'b7'},
                {s:3, f:-3, degree:'1', d:'R'}, {s:3, f:0, degree:'b3'},
                {s:2, f:-2, degree:'4'}, {s:2, f:0, degree:'5'}, // Note shift
                {s:1, f:-2, degree:'b7'}, {s:1, f:0, degree:'1', d:'R'}
            ]
        },
        A: {
            // Anchor: String 5. (Minor Pattern 4)
            notes: [
                {s:6, f:0, degree:'5'}, {s:6, f:3, degree:'b7'},
                {s:5, f:0, degree:'1', d:'R'}, {s:5, f:3, degree:'b3'},
                {s:4, f:0, degree:'4'}, {s:4, f:2, degree:'5'},
                {s:3, f:0, degree:'b7'}, {s:3, f:2, degree:'1', d:'R'},
                {s:2, f:1, degree:'b3'}, {s:2, f:3, degree:'4'},
                {s:1, f:0, degree:'5'}, {s:1, f:3, degree:'b7'} // High extension
            ]
        },
        C: {
            // Anchor: String 5. (Minor Pattern 3)
            notes: [
                {s:6, f:-2, degree:'4'}, {s:6, f:0, degree:'5'},
                {s:5, f:-2, degree:'b7'}, {s:5, f:0, degree:'1', d:'R'},
                {s:4, f:-2, degree:'b3'}, {s:4, f:0, degree:'4'},
                {s:3, f:-3, degree:'5'}, {s:3, f:0, degree:'b7'},
                {s:2, f:-2, degree:'1', d:'R'}, {s:2, f:1, degree:'b3'}, // Shifted
                {s:1, f:-2, degree:'4'}, {s:1, f:0, degree:'5'}
            ]
        },
        D: {
            // Anchor: String 4. (Minor Pattern 2)
            notes: [
                {s:6, f:1, degree:'b3'}, {s:6, f:3, degree:'4'},
                {s:5, f:0, degree:'5'}, {s:5, f:3, degree:'b7'},
                {s:4, f:0, degree:'1', d:'R'}, {s:4, f:3, degree:'b3'},
                {s:3, f:0, degree:'4'}, {s:3, f:2, degree:'5'},
                {s:2, f:1, degree:'b7'}, {s:2, f:3, degree:'1', d:'R'}, // Shifted
                {s:1, f:1, degree:'b3'}, {s:1, f:3, degree:'4'}
            ]
        }
    }
};

// Defines which specific notes from the shapes above should be highlighted 
// in Turquoise when the answer is revealed.
// Matches your provided formulas exactly.
export const HIGHLIGHT_MASKS = {
    major: {
        E: [
            {s:6, f:0}, {s:5, f:2}, {s:4, f:2}, {s:3, f:1}, {s:2, f:0}, {s:1, f:0}
        ],
        G: [
            {s:6, f:0}, {s:5, f:-1}, {s:4, f:-3}, {s:3, f:-3}, {s:2, f:-3}, {s:1, f:0}
        ],
        A: [
            {s:5, f:0}, {s:4, f:2}, {s:3, f:2}, {s:2, f:2}, {s:1, f:0}
        ],
        C: [
            {s:5, f:0}, {s:4, f:-1}, {s:3, f:-3}, {s:2, f:-2}, {s:1, f:-3}
        ],
        D: [
            {s:4, f:0}, {s:3, f:2}, {s:2, f:3}, {s:1, f:2}
        ]
    },
    minor: {
        E: [
            {s:6, f:0}, {s:5, f:2}, {s:4, f:2}, {s:3, f:0}, {s:2, f:0}, {s:1, f:0}
        ],
        G: [
            {s:6, f:0}, {s:5, f:-2}, {s:4, f:-3}, {s:3, f:-3}, {s:1, f:0}
        ],
        A: [
            {s:5, f:0}, {s:4, f:2}, {s:3, f:2}, {s:2, f:1}, {s:1, f:0}
        ],
        C: [
            {s:5, f:0}, {s:4, f:-2}, {s:3, f:-3}, {s:2, f:-2}
        ],
        D: [
            {s:4, f:0}, {s:3, f:2}, {s:2, f:3}, {s:1, f:1}
        ]
    }
};

export const SHAPE_ORDER = ['E', 'G', 'A', 'C', 'D'];
export const STANDARD_CAGED_ORDER = ['C', 'A', 'G', 'E', 'D'];