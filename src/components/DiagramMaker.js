import React, { useState, useEffect } from 'react';
import FretboardDiagram from './FretboardDiagram';
import { SCALES, CHORDS, getNotesFor } from '../utils/musicTheory.js';
import { fretboardModel } from '../utils/fretboardUtils.js';

const DiagramMaker = () => {
    // --- STATE MANAGEMENT ---
    const [selectedRoot, setSelectedRoot] = useState('C');
    const [selectedType, setSelectedType] = useState('Scale');
    const [selectedName, setSelectedName] = useState('Major');
    const [displayedNotes, setDisplayedNotes] = useState([]);

    // ADDED: State for fretboard view control
    const [startFret, setStartFret] = useState(0);
    const [fretCount, setFretCount] = useState(15);


    // --- LOGIC ---
    useEffect(() => {
        if (selectedType === 'Scale') {
            setSelectedName(Object.keys(SCALES)[0]);
        } else {
            setSelectedName(Object.keys(CHORDS)[0]);
        }
    }, [selectedType]);

    useEffect(() => {
        const theoryData = selectedType === 'Scale' ? SCALES : CHORDS;
        const intervals = theoryData[selectedName]?.intervals;

        if (intervals) {
            const notes = getNotesFor(selectedRoot, intervals, fretboardModel);
            setDisplayedNotes(notes);
        }
    }, [selectedRoot, selectedType, selectedName]);


    const nameOptions = selectedType === 'Scale' ? Object.keys(SCALES) : Object.keys(CHORDS);
    const rootNoteOptions = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    return (
        <div className="flex flex-col items-center w-full">
            <h2 className="text-3xl font-extrabold mb-6 text-indigo-300">Fretboard Diagram Maker</h2>

            {/* --- CONTROLS --- */}
            <div className="w-full max-w-2xl bg-slate-700 p-4 rounded-lg flex flex-col items-center gap-4 mb-8">
                <div className="w-full flex flex-col md:flex-row items-center gap-4">
                    {/* Root Note Selector */}
                    <div className="flex-1 w-full">
                        <label htmlFor="root-note" className="block text-sm font-medium text-gray-300 mb-1">Root Note</label>
                        <select id="root-note" value={selectedRoot} onChange={e => setSelectedRoot(e.target.value)} className="w-full p-2 rounded-md bg-slate-600 text-white">
                            {rootNoteOptions.map(note => <option key={note} value={note}>{note}</option>)}
                        </select>
                    </div>

                    {/* Type Selector (Scale/Chord) */}
                    <div className="flex-1 w-full">
                        <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                        <select id="type" value={selectedType} onChange={e => setSelectedType(e.target.value)} className="w-full p-2 rounded-md bg-slate-600 text-white">
                            <option value="Scale">Scale</option>
                            <option value="Chord">Chord</option>
                        </select>
                    </div>
                    
                    {/* Name Selector (Major, Minor Blues, etc.) */}
                    <div className="flex-1 w-full">
                         <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">{selectedType} Name</label>
                        <select id="name" value={selectedName} onChange={e => setSelectedName(e.target.value)} className="w-full p-2 rounded-md bg-slate-600 text-white">
                           {nameOptions.map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                    </div>
                </div>

                {/* ADDED: UI Controls for Start Fret and Fret Count */}
                <div className="flex justify-between items-center gap-4 w-full pt-4 border-t border-slate-600 mt-4">
                    <div className="flex-1">
                        <label htmlFor="start-fret" className="block text-sm font-medium text-gray-300 mb-1">Start Fret: <span className="font-bold text-teal-300">{startFret}</span></label>
                        <input id="start-fret" type="range" min="0" max="12" value={startFret} onChange={e => setStartFret(Number(e.target.value))} className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer" />
                    </div>
                     <div className="flex-1">
                        <label htmlFor="fret-count" className="block text-sm font-medium text-gray-300 mb-1">Fret Count: <span className="font-bold text-teal-300">{fretCount}</span></label>
                        <input id="fret-count" type="range" min="3" max="22" value={fretCount} onChange={e => setFretCount(Number(e.target.value))} className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer" />
                    </div>
                </div>
            </div>

            {/* --- FRETBOARD DISPLAY --- */}
            <div className="w-full">
                {/* UPDATED: Passing the new state variables as props to the diagram component */}
                <FretboardDiagram
                    notesToDisplay={displayedNotes}
                    startFret={startFret}
                    fretCount={fretCount}
                    showLabels={true} 
                />
            </div>
        </div>
    );
};

export default DiagramMaker;