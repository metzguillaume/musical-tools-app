import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import FretboardDiagram from './FretboardDiagram';
import { SCALES, CHORDS, getNotesFor } from '../utils/musicTheory.js';
import { fretboardModel } from '../utils/fretboardUtils.js';
import InfoModal from './InfoModal';
import InfoButton from './InfoButton';

const DiagramMaker = () => {
    // ... (most state variables remain the same) ...
    const [selectedRoot, setSelectedRoot] = useState('C');
    const [selectedType, setSelectedType] = useState('Scale');
    const [selectedName, setSelectedName] = useState('Major');
    const [displayedNotes, setDisplayedNotes] = useState([]);
    const [startFret, setStartFret] = useState(0);
    const [fretCount, setFretCount] = useState(15);
    const [labelType, setLabelType] = useState('degree');
    const [colorMap, setColorMap] = useState({
        '1':    { color: '#ef4444', active: true },   'b2':   { color: '#f97316', active: false },
        '2':    { color: '#a3e635', active: false },  'b3':   { color: '#ec4899', active: false },
        '3':    { color: '#22c55e', active: false },  '4':    { color: '#14b8a6', active: false },
        '#4/b5':{ color: '#6b7280', active: false },  '5':    { color: '#eab308', active: false },
        'b6':   { color: '#8b5cf6', active: false },  '6':    { color: '#a855f7', active: false },
        'b7':   { color: '#3b82f6', active: false },  '7':    { color: '#7dd3fc', active: false },
    });
    const [isManualMode, setIsManualMode] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [editLabel, setEditLabel] = useState('');
    const [editColor, setEditColor] = useState('#ffffff');
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    // ADDED: A ref to manage the timer for differentiating single vs. double clicks
    const clickTimer = useRef(null);

    const handleColorToggle = (degree) => { setColorMap(prevMap => ({ ...prevMap, [degree]: { ...prevMap[degree], active: !prevMap[degree].active } })); };
    const handleColorChange = (degree, newColor) => { setColorMap(prevMap => ({ ...prevMap, [degree]: { ...prevMap[degree], color: newColor } })); };
    const handleHighlightAll = (shouldHighlight) => { const newColorMap = { ...colorMap }; Object.keys(newColorMap).forEach(degree => { newColorMap[degree].active = shouldHighlight; }); setColorMap(newColorMap); };
    
    // UPDATED: handleNoteClick now uses a timer to delay deletion
    const handleNoteClick = (noteToDelete) => {
        if (!isManualMode) return;

        // Clear any previous timer to prevent multiple deletions
        clearTimeout(clickTimer.current);

        // Set a timer. If it finishes without being cleared by a double-click, delete the note.
        clickTimer.current = setTimeout(() => {
            setDisplayedNotes(prevNotes => 
                prevNotes.filter(note => 
                    !(note.string === noteToDelete.string && note.fret === noteToDelete.fret)
                )
            );
        }, 250); // 250ms is a standard double-click window
    };

    // UPDATED: handleNoteDoubleClick now clears the deletion timer before opening the modal
    const handleNoteDoubleClick = (noteToEdit) => {
        if (!isManualMode) return;

        // Clear the pending single-click deletion timer
        clearTimeout(clickTimer.current);

        setEditingNote(noteToEdit);
        setEditLabel(noteToEdit.overrideLabel || (labelType === 'degree' ? noteToEdit.degree : noteToEdit.label));
        const colorMapEntry = colorMap[noteToEdit.degree];
        const defaultColor = noteToEdit.isRoot ? '#ef4444' : '#3b82f6';
        const activeColor = (colorMapEntry && colorMapEntry.active) ? colorMapEntry.color : defaultColor;
        setEditColor(noteToEdit.overrideColor || activeColor);
    };

    const handleSaveNoteEdit = () => {
        if (!editingNote) return;
        setDisplayedNotes(prevNotes => prevNotes.map(note => {
            if (note.string === editingNote.string && note.fret === editingNote.fret) {
                return { ...note, overrideLabel: editLabel, overrideColor: editColor };
            }
            return note;
        }));
        setEditingNote(null);
    };

    useEffect(() => {
        if (selectedType === 'Scale') { setSelectedName(Object.keys(SCALES)[0]); } 
        else { setSelectedName(Object.keys(CHORDS)[0]); }
    }, [selectedType]);

    useEffect(() => {
        if (isManualMode) return;
        const theoryData = selectedType === 'Scale' ? SCALES : CHORDS;
        const intervals = theoryData[selectedName]?.intervals;
        if (intervals) {
            const notes = getNotesFor(selectedRoot, intervals, fretboardModel);
            const notesWithOverrides = notes.map(n => ({ ...n, overrideColor: null, overrideLabel: null }));
            setDisplayedNotes(notesWithOverrides);
        }
    }, [selectedRoot, selectedType, selectedName, isManualMode]);
    
    // Cleanup timer on component unmount
    useEffect(() => {
        return () => clearTimeout(clickTimer.current);
    }, []);

    const nameOptions = selectedType === 'Scale' ? Object.keys(SCALES) : Object.keys(CHORDS);
    const rootNoteOptions = [
        { name: 'C', value: 'C' }, { name: 'F', value: 'F' }, { name: 'Bb', value: 'Bb' }, { name: 'Eb', value: 'Eb' },
        { name: 'Ab', value: 'Ab' }, { name: 'Db', value: 'Db' }, { name: 'F#', value: 'F#' }, { name: 'B', value: 'B' },
        { name: 'E', value: 'E' }, { name: 'A', value: 'A' }, { name: 'D', value: 'D' }, { name: 'G', value: 'G' },
    ];
    
    return (
        <div className="flex flex-col items-center w-full">
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Fretboard Diagram Maker Guide">
                <div className="space-y-4 text-sm">
                    <div>
                        <h4 className="font-bold text-indigo-300 mb-1">Generator Mode</h4>
                        <p>Use the dropdowns to select a root note, type (scale or chord), and a name. The fretboard will update automatically to show all corresponding notes.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-indigo-300 mb-1">Customize Mode</h4>
                        <p>Click the "Customize Diagram" button to lock the current notes and enable editing. In this mode:</p>
                        <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                            <li><strong className="text-teal-300">Single-Click</strong> a note on the diagram to delete it.</li>
                            <li><strong className="text-teal-300">Double-Click</strong> a note to open an editor, allowing you to set a custom color and label for that specific note.</li>
                        </ul>
                        <p className="mt-1">Click "Return to Generator Mode" to unlock the controls and generate new diagrams.</p>
                    </div>
                     <div>
                        <h4 className="font-bold text-indigo-300 mb-1">Advanced Display Options</h4>
                        <p>Click the "Advanced Display Options" dropdown to customize the look of the diagram. You can toggle between note names and degrees, and activate/deactivate or change the color for each scale/chord degree.</p>
                    </div>
                </div>
            </InfoModal>

            {editingNote && (
                <InfoModal isOpen={!!editingNote} onClose={() => setEditingNote(null)} title={`Edit Note (${editingNote.label})`}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="note-label" className="block text-sm font-medium text-gray-300">Custom Label</label>
                            <input type="text" id="note-label" value={editLabel} onChange={e => setEditLabel(e.target.value)} className="mt-1 w-full p-2 rounded-md bg-slate-600 text-white" />
                        </div>
                        <div>
                            <label htmlFor="note-color" className="block text-sm font-medium text-gray-300">Custom Color</label>
                            <input type="color" id="note-color" value={editColor} onChange={e => setEditColor(e.target.value)} className="mt-1 w-full h-10 p-1 border-none rounded-md cursor-pointer" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <button onClick={() => setEditingNote(null)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                        <button onClick={handleSaveNoteEdit} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg">Save Changes</button>
                    </div>
                </InfoModal>
            )}

            <div className="flex justify-center items-center gap-2 mb-6">
                <h2 className="text-3xl font-extrabold text-indigo-300">Fretboard Diagram Maker</h2>
                <InfoButton onClick={() => setIsInfoModalOpen(true)} />
            </div>

            <div className="w-full mb-8">
                <FretboardDiagram
                    notesToDisplay={displayedNotes}
                    startFret={startFret}
                    fretCount={fretCount}
                    showLabels={true} 
                    labelType={labelType}
                    colorMap={colorMap}
                    onNoteClick={isManualMode ? handleNoteClick : null}
                    onNoteDoubleClick={isManualMode ? handleNoteDoubleClick : null}
                />
            </div>

            <div className="w-full max-w-2xl bg-slate-700 p-4 rounded-lg flex flex-col items-center gap-4">
                <div className="w-full flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-1 w-full">
                        <label htmlFor="root-note" className="block text-sm font-medium text-gray-300 mb-1">Root Note</label>
                        <select id="root-note" value={selectedRoot} onChange={e => setSelectedRoot(e.target.value)} disabled={isManualMode} className="w-full p-2 rounded-md bg-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed">
                            {rootNoteOptions.map(note => <option key={note.value} value={note.value}>{note.name}</option>)}
                        </select>
                    </div>
                    <div className="flex-1 w-full">
                         <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                        <select id="type" value={selectedType} onChange={e => setSelectedType(e.target.value)} disabled={isManualMode} className="w-full p-2 rounded-md bg-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed">
                            <option value="Scale">Scale</option>
                            <option value="Chord">Chord</option>
                        </select>
                    </div>
                     <div className="flex-1 w-full">
                         <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">{selectedType} Name</label>
                        <select id="name" value={selectedName} onChange={e => setSelectedName(e.target.value)} disabled={isManualMode} className="w-full p-2 rounded-md bg-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed">
                           {nameOptions.map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="w-full pt-4 border-t border-slate-600 mt-4">
                    {isManualMode ? (
                        <button onClick={() => setIsManualMode(false)} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg">
                            Return to Generator Mode
                        </button>
                    ) : (
                         <button onClick={() => setIsManualMode(true)} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg">
                            Customize Diagram
                        </button>
                    )}
                    {isManualMode && <p className="text-xs text-center mt-2 text-gray-400">In Customize Mode: Single-click a note to delete it, or double-click to edit.</p>}
                </div>

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
                
                <details className="w-full" open={false}>
                    <summary className="text-lg font-semibold text-teal-300 cursor-pointer hover:text-teal-200 transition-colors py-2 border-t border-slate-600 mt-4">
                        Advanced Display Options
                    </summary>
                    <div className="w-full pt-4">
                        <div className="flex justify-between items-center gap-4 mb-2">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-300 mb-1">Label Display</label>
                                <div className="flex bg-slate-600 rounded-md p-1">
                                    <button onClick={() => setLabelType('name')} className={`flex-1 rounded-md text-sm py-1 ${labelType === 'name' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Name</button>
                                    <button onClick={() => setLabelType('degree')} className={`flex-1 rounded-md text-sm py-1 ${labelType === 'degree' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Degree</button>
                                </div>
                            </div>
                            <div className="flex-1 flex justify-end gap-2">
                                <button onClick={() => handleHighlightAll(true)} className="text-sm bg-slate-600 hover:bg-slate-500 py-1 px-3 rounded-md">All</button>
                                <button onClick={() => handleHighlightAll(false)} className="text-sm bg-slate-600 hover:bg-slate-500 py-1 px-3 rounded-md">None</button>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 bg-slate-800/50 p-2 rounded-md">
                            {Object.entries(colorMap).map(([degree, { color, active }]) => (
                                <div key={degree} className="flex items-center gap-2">
                                    <input type="checkbox" id={`toggle-${degree}`} checked={active} onChange={() => handleColorToggle(degree)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                    <input type="color" value={color} onChange={(e) => handleColorChange(degree, e.target.value)} className="w-6 h-6 p-0 border-none rounded-md cursor-pointer bg-transparent" />
                                    <label htmlFor={`toggle-${degree}`} className="text-sm font-bold text-gray-300 w-12 text-left">{degree}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                </details>
            </div>
        </div>
    );
};

export default DiagramMaker;