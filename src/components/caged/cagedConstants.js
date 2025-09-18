// src/components/caged/cagedConstants.js

export const CAGED_SHAPES = {
    major: {
        E: { muted: [], notes: [{s:6,f:0,d:'R',degree:'1'}, {s:5,f:2,degree:'5'}, {s:4,f:2,d:'R',degree:'1'}, {s:3,f:1,degree:'3'}, {s:2,f:0,degree:'5'}, {s:1,f:0,d:'R',degree:'1'}] },
        A: { muted: [6], notes: [{s:5,f:0,d:'R',degree:'1'}, {s:4,f:2,degree:'5'}, {s:3,f:2,d:'R',degree:'1'}, {s:2,f:2,degree:'3'}, {s:1,f:0,degree:'5'}] },
        G: { muted: [], notes: [{s:6,f:0,d:'R',degree:'1'}, {s:5,f:-1,degree:'3'}, {s:4,f:-3,degree:'5'}, {s:3,f:-3,d:'R',degree:'1'}, {s:2,f:-3,degree:'3'}, {s:1,f:0,d:'R',degree:'1'}] },
        C: { muted: [6], notes: [{s:5,f:0,d:'R',degree:'1'}, {s:4,f:-1,degree:'3'}, {s:3,f:-3,degree:'5'}, {s:2,f:-2,d:'R',degree:'1'}, {s:1,f:-3,degree:'3'}] },
        D: { muted: [6,5], notes: [{s:4,f:0,d:'R',degree:'1'}, {s:3,f:2,degree:'5'}, {s:2,f:3,d:'R',degree:'3'}, {s:1,f:2,degree:'5'}] },
    },
    minor: {
        E: { muted: [], notes: [{s:6,f:0,d:'R',degree:'1'}, {s:5,f:2,degree:'5'}, {s:4,f:2,d:'R',degree:'1'}, {s:3,f:0,degree:'b3'}, {s:2,f:0,degree:'5'}, {s:1,f:0,d:'R',degree:'1'}] },
        A: { muted: [6], notes: [{s:5,f:0,d:'R',degree:'1'}, {s:4,f:2,degree:'5'}, {s:3,f:2,d:'R',degree:'1'}, {s:2,f:1,degree:'b3'}, {s:1,f:0,degree:'5'}] },
        G: { muted: [], notes: [{s:6,f:0,d:'R',degree:'1'}, {s:5,f:-2,degree:'b3'}, {s:4,f:-3,degree:'5'}, {s:3,f:-3,d:'R',degree:'1'}, {s:2,f:-4,degree:'5'}, {s:1,f:0,d:'R',degree:'1'}] },
        C: { muted: [6], notes: [{s:5,f:0,d:'R',degree:'1'}, {s:4,f:-2,degree:'b3'}, {s:3,f:-3,degree:'5'}, {s:2,f:-2,d:'R',degree:'1'}, {s:1,f:-4,degree:'b3'}] },
        D: { muted: [6,5], notes: [{s:4,f:0,d:'R',degree:'1'}, {s:3,f:2,degree:'5'}, {s:2,f:3,d:'R',degree:'1'}, {s:1,f:1,degree:'b3'}] },
    }
};

// UPDATED: The 'display' property now shows sharps first.
export const ROOT_NOTE_OPTIONS = [
    { display: 'A', value: 'A' },
    { display: 'A#/Bb', value: 'Bb', altValue: 'A#' },
    { display: 'B', value: 'B' },
    { display: 'C', value: 'C' },
    { display: 'C#/Db', value: 'Db', altValue: 'C#' },
    { display: 'D', value: 'D' },
    { display: 'D#/Eb', value: 'Eb', altValue: 'D#' },
    { display: 'E', value: 'E' },
    { display: 'F', value: 'F' },
    { display: 'F#/Gb', value: 'F#', altValue: 'Gb' },
    { display: 'G', value: 'G' },
    { display: 'G#/Ab', value: 'Ab', altValue: 'G#' },
];

export const SHAPE_ORDER = ['C', 'A', 'G', 'E', 'D'];