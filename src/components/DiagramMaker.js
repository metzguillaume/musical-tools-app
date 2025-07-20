import React, { useState, useEffect, useRef } from 'react';
import FretboardDiagram from './FretboardDiagram';
import { SCALES, CHORDS, getNotesFor, NOTE_TO_MIDI, SEMITONE_TO_DEGREE } from '../utils/musicTheory.js';
import { fretboardModel } from '../utils/fretboardUtils.js';
import InfoModal from './InfoModal';
import InfoButton from './InfoButton';

const DiagramMaker = () => {
    const [selectedRoot, setSelectedRoot] = useState('C');
    const [selectedType, setSelectedType] = useState('Scale');
    const [selectedName, setSelectedName] = useState('Major');
    const [displayedNotes, setDisplayedNotes] = useState([]);
    const [startFret, setStartFret] = useState(0);
    const [fretCount, setFretCount] = useState(15);
    const [labelType, setLabelType] = useState('degree');
    const [colorMap, setColorMap] = useState({
        '1':    { color: '#ef4444', active: true },   'b2':   { color: '#f97316', active: false },
        '2':    { color: '#a3e635', active: false },  'b3':   { color: '##ec4899', active: false },
        '3':    { color: '#22c55e', active: false },  '4':    { color: '#14b8a6', active: false },
        '#4/b5':{ color: '#6b7280', active: false },  '5':    { color: '#eab308', active: false },
        'b6':   { color: '#8b5cf6', active: false },  '6':    { color: '#a855f7', active: false },
        'b7':   { color: '#3b82f6', active: false },  '7':    { color: '#7dd3fc', active: false },
    });
    const [isManualMode, setIsManualMode] = useState(true);
    const [editingNote, setEditingNote] = useState(null);
    const [editLabel, setEditLabel] = useState('');
    const [editColor, setEditColor] = useState('#ffffff');
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [useWhiteBackground, setUseWhiteBackground] = useState(false);
    const clickManager = useRef({ clickTimeout: null, lastClickTimestamp: 0, clickedNote: null });
    const [draggingNote, setDraggingNote] = useState(null);
    const isModalInteraction = useRef(false);

    const handleExportAsPng = () => {
        const svgElement = document.getElementById('fretboard-diagram-svg');
        if (!svgElement) {
            console.error('Fretboard SVG element not found!');
            return;
        }

        const serializer = new XMLSerializer();
        let svgString = serializer.serializeToString(svgElement);

        if (useWhiteBackground) {
            svgString = svgString.replace(/fill="white"/g, 'fill="#111827"');
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const scale = 2;
        const width = svgElement.viewBox.baseVal.width;
        const height = svgElement.viewBox.baseVal.height;
        canvas.width = width * scale;
        canvas.height = height * scale;

        ctx.fillStyle = useWhiteBackground ? '#ffffff' : '#1e293b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const img = new Image();
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        img.onload = () => {
            ctx.scale(scale, scale);
            ctx.drawImage(img, 0, 0, width, height);

            const pngUrl = canvas.toDataURL('image/png');

            const downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = 'fretboard-diagram.png';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            URL.revokeObjectURL(url);
        };
        
        img.src = url;
    };

    const handleColorToggle = (degree) => { setColorMap(prevMap => ({ ...prevMap, [degree]: { ...prevMap[degree], active: !prevMap[degree].active } })); };
    const handleColorChange = (degree, newColor) => { setColorMap(prevMap => ({ ...prevMap, [degree]: { ...prevMap[degree], color: newColor } })); };
    const handleHighlightAll = (shouldHighlight) => { const newColorMap = { ...colorMap }; Object.keys(newColorMap).forEach(degree => { newColorMap[degree].active = shouldHighlight; }); setColorMap(newColorMap); };
    
    const deleteNote = (noteToDelete) => { setDisplayedNotes(prevNotes => prevNotes.filter(note => !(note.string === noteToDelete.string && note.fret === noteToDelete.fret))); };
    const openEditModal = (noteToEdit) => { setEditingNote(noteToEdit); setEditLabel(noteToEdit.overrideLabel || (labelType === 'degree' ? noteToEdit.degree : noteToEdit.label)); const colorMapEntry = colorMap[noteToEdit.degree]; const defaultColor = noteToEdit.isRoot ? '#ef4444' : '#3b82f6'; const activeColor = (colorMapEntry && colorMapEntry.active) ? colorMapEntry.color : defaultColor; setEditColor(noteToEdit.overrideColor || activeColor); };
    
    const handleNoteMouseDown = (note, event) => {
        if (!isManualMode || editingNote) return;
        event.preventDefault();
        const now = Date.now();
    
        if (now - clickManager.current.lastClickTimestamp < 300 && note.string === clickManager.current.clickedNote?.string && note.fret === clickManager.current.clickedNote?.fret) {
            clearTimeout(clickManager.current.clickTimeout);
            clickManager.current.lastClickTimestamp = 0;
            clickManager.current.clickedNote = null;
            openEditModal(note);
            return;
        }
    
        clickManager.current.lastClickTimestamp = now;
        clickManager.current.clickedNote = note;
        setDraggingNote({ note, initialX: event.clientX, initialY: event.clientY, moved: false });
    };

    const handleBoardMouseMove = (event) => {
        if (!draggingNote) return;
        event.preventDefault();
    
        const deltaX = event.clientX - draggingNote.initialX;
        const deltaY = event.clientY - draggingNote.initialY;
    
        if (!draggingNote.moved && (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)) {
            setDraggingNote(prev => ({ ...prev, moved: true }));
        }
    
        if (draggingNote.moved) {
            const nutWidth = startFret === 0 ? 10 : 0;
            const viewWidth = 800;
            const fretWidth = (viewWidth - nutWidth) / fretCount;
            const fretChange = Math.round(deltaX / fretWidth);
            let newFret = draggingNote.note.fret + fretChange;
            if (newFret < 0) newFret = 0;
            if (newFret > 24) newFret = 24;

            const stringSpacing = 240 / 6;
            const stringChange = Math.round(deltaY / stringSpacing);
            let newString = draggingNote.note.string + stringChange;
            if (newString < 1) newString = 1;
            if (newString > 6) newString = 6;
    
            setDisplayedNotes(prevNotes => prevNotes.map(n => {
                if (n.string === draggingNote.note.string && n.fret === draggingNote.note.fret) {
                    return { ...n, movedFret: newFret, movedString: newString };
                }
                return n;
            }));
        }
    };
    
    const handleBoardMouseUp = () => {
        if (!draggingNote) return;
    
        if (!draggingNote.moved) {
            clickManager.current.clickTimeout = setTimeout(() => {
                deleteNote(draggingNote.note);
            }, 250);
        } else {
            const movedNote = displayedNotes.find(n => n.string === draggingNote.note.string && n.fret === draggingNote.note.fret);
            if (movedNote && movedNote.movedFret !== undefined && movedNote.movedString !== undefined) {
                const newFret = movedNote.movedFret;
                const newString = movedNote.movedString;

                const targetOccupied = displayedNotes.some(n => 
                    n.string === newString && 
                    n.fret === newFret && 
                    !(n.string === draggingNote.note.string && n.fret === draggingNote.note.fret)
                );

                if (!targetOccupied && newFret >= 0 && newFret <= 24) {
                    const newNoteData = fretboardModel[6 - newString][newFret];
                    setDisplayedNotes(prevNotes => prevNotes.map(n => {
                        if (n.string === movedNote.string && n.fret === movedNote.fret) {
                            const { movedFret, movedString, ...rest } = n;
                            return { ...rest, ...newNoteData, string: newString, fret: newFret };
                        }
                        return n;
                    }));
                } else {
                    setDisplayedNotes(prevNotes => prevNotes.map(n => { 
                        const { movedFret, movedString, ...rest } = n; 
                        return rest; 
                    }));
                }
            }
        }
        setDraggingNote(null);
    };

    const handleSaveNoteEdit = () => { if (!editingNote) return; setDisplayedNotes(prevNotes => prevNotes.map(note => { if (note.string === editingNote.string && note.fret === editingNote.fret) { return { ...note, overrideLabel: editLabel, overrideColor: editColor }; } return note; })); setEditingNote(null); };
    const handleBoardClick = (string, fret) => { if (!isManualMode) return; const noteExists = displayedNotes.some(note => note.string === string && note.fret === fret); if (noteExists) { return; } const stringIndex = 6 - string; const noteData = fretboardModel[stringIndex]?.[fret]; if (noteData) { const rootMidi = NOTE_TO_MIDI[selectedRoot]; const interval = (noteData.midi - rootMidi) % 12; const positiveInterval = interval < 0 ? interval + 12 : interval; const degree = SEMITONE_TO_DEGREE[positiveInterval] || '?'; const newNote = { string, fret, label: noteData.note, midi: noteData.midi, isRoot: noteData.midi % 12 === rootMidi % 12, degree: degree, overrideColor: null, overrideLabel: null, }; setDisplayedNotes(prevNotes => [...prevNotes, newNote]); } };
    const handleClearBoard = () => { setDisplayedNotes([]); setIsManualMode(true); };
    
    useEffect(() => { if (selectedType === 'Scale') { setSelectedName(Object.keys(SCALES)[0]); } else { setSelectedName(Object.keys(CHORDS)[0]); } }, [selectedType]);
    
    // This effect now handles BOTH generating scales/chords AND updating degrees when the root changes.
    useEffect(() => {
        const rootMidi = NOTE_TO_MIDI[selectedRoot];
        if (rootMidi === undefined) return;
        
        // If in customize mode, just update the degrees of existing notes.
        if (isManualMode) {
            setDisplayedNotes(prevNotes => 
                prevNotes.map(note => {
                    const interval = (note.midi - rootMidi) % 12;
                    const positiveInterval = interval < 0 ? interval + 12 : interval;
                    const newDegree = SEMITONE_TO_DEGREE[positiveInterval] || '?';
                    const newIsRoot = note.midi % 12 === rootMidi % 12;
                    return { ...note, degree: newDegree, isRoot: newIsRoot };
                })
            );
        } else {
            // If in generator mode, generate the full scale/chord diagram.
            const theoryData = selectedType === 'Scale' ? SCALES : CHORDS;
            const intervals = theoryData[selectedName]?.intervals;
            if (intervals) {
                const notes = getNotesFor(selectedRoot, intervals, fretboardModel);
                const notesWithOverrides = notes.map(n => ({ ...n, overrideColor: null, overrideLabel: null }));
                setDisplayedNotes(notesWithOverrides);
            }
        }
    }, [selectedRoot, selectedType, selectedName, isManualMode]);
    
    useEffect(() => {
        const handleGlobalMouseUp = () => {
            isModalInteraction.current = false;
        };
        
        window.addEventListener('mouseup', handleGlobalMouseUp);
        const clickTimer = clickManager.current;

        return () => {
            window.removeEventListener('mouseup', handleGlobalMouseUp);
            clearTimeout(clickTimer.clickTimeout);
        };
    }, []);

    const nameOptions = selectedType === 'Scale' ? Object.keys(SCALES) : Object.keys(CHORDS);
    const rootNoteOptions = [
        { name: 'C', value: 'C' }, { name: 'F', value: 'F' }, { name: 'Bb', value: 'Bb' }, { name: 'Eb', value: 'Eb' }, { name: 'Ab', value: 'Ab' },
        { name: 'Db', value: 'Db' }, { name: 'F#', value: 'F#' }, { name: 'B', value: 'B' }, { name: 'E', value: 'E' }, { name: 'A', value: 'A' },
        { name: 'D', value: 'D' }, { name: 'G', value: 'G' },
    ];
    
    return (
        <div className="flex flex-col items-center w-full">
            {/* --- FIX 2: Updated the help text with more comprehensive information --- */}
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Fretboard Diagram Maker Guide">
                <div className="space-y-4 text-sm">
                    <div>
                        <h4 className="font-bold text-indigo-300 mb-1">Generator Mode</h4>
                        <p>Use the dropdowns to automatically generate a diagram for any scale or chord. The diagram will update as you change the root note, type, or name.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-indigo-300 mb-1">Customize Mode</h4>
                        <p>Click the "Customize Diagram" button to start with a blank canvas or lock the current diagram for editing. In this mode:</p>
                        <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                            <li><strong className="text-teal-300">Add Note:</strong> Click any empty spot on the fretboard. The new note's degree will be automatically calculated relative to the selected root note.</li>
                            <li><strong className="text-teal-300">Delete Note:</strong> Single-click an existing note.</li>
                            <li><strong className="text-teal-300">Edit Note:</strong> Double-click an existing note to change its color or label.</li>
                            <li><strong className="text-teal-300">Move Note:</strong> Click and drag a note to any other fret or string. Note that this won't change the name or scale degree written inside that note!</li>
                            <li><strong className="text-teal-300">Change Root Note:</strong> The Root Note dropdown is always active! Change it at any time to see the scale degrees update instantly for your custom diagram.</li>
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-bold text-indigo-300 mb-1">Display & Export</h4>
                        <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                            <li><strong className="text-teal-300">Sliders:</strong> Use the "Start Fret" and "Fret Count" sliders to focus on a specific area of the fretboard.</li>
                             <li><strong className="text-teal-300">Advanced Options:</strong> Expand this section to toggle between "Name" and "Degree" labels, highlight specific degrees, or choose a white background for your PNG export (great for printing).</li>
                            <li><strong className="text-teal-300">Export/Print:</strong> Use the buttons in the header to export your diagram as a high-resolution PNG image or to print it directly.</li>
                        </ul>
                    </div>
                </div>
            </InfoModal>
            
            {editingNote && ( 
                <InfoModal
                    isOpen={!!editingNote}
                    onClose={() => {
                        if (isModalInteraction.current) {
                            return;
                        }
                        setEditingNote(null);
                    }}
                    title={`Edit Note (${editingNote.label})`}
                >
                    <div onMouseDown={() => isModalInteraction.current = true}>
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
                    </div>
                </InfoModal> 
            )}
            
            <div className="w-full flex justify-between items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <h2 className="text-3xl font-extrabold text-indigo-300">Fretboard Diagram Maker</h2>
                    <InfoButton onClick={() => setIsInfoModalOpen(true)} />
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleExportAsPng} className="bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm">Export as PNG</button>
                    <button onClick={() => window.print()} className="bg-gray-500 hover:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg text-sm">Print Diagram</button>
                </div>
            </div>
            
            <div className="w-full mb-8" id="printable-diagram">
                <FretboardDiagram
                    notesToDisplay={displayedNotes}
                    startFret={startFret} fretCount={fretCount}
                    showLabels={true} labelType={labelType} colorMap={colorMap}
                    onNoteMouseDown={isManualMode ? handleNoteMouseDown : null}
                    onBoardMouseMove={draggingNote && !editingNote ? handleBoardMouseMove : null}
                    onBoardMouseUp={draggingNote && !editingNote ? handleBoardMouseUp : null}
                    onBoardClick={isManualMode ? handleBoardClick : null}
                    draggingNote={draggingNote?.note}
                />
            </div>
            
            <div id="controls-panel" className="w-full max-w-2xl bg-slate-700 p-4 rounded-lg flex flex-col items-center gap-4">
                <div className="w-full flex flex-col md:flex-row items-center gap-4">
                    {/* --- FIX 1: Removed 'disabled' prop to allow changing root note anytime --- */}
                    <div className="flex-1 w-full"><label htmlFor="root-note" className="block text-sm font-medium text-gray-300 mb-1">Root Note</label><select id="root-note" value={selectedRoot} onChange={e => setSelectedRoot(e.target.value)} className="w-full p-2 rounded-md bg-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed">{rootNoteOptions.map(note => <option key={note.value} value={note.value}>{note.name}</option>)}</select></div>
                    <div className="flex-1 w-full"><label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-1">Type</label><select id="type" value={selectedType} onChange={e => setSelectedType(e.target.value)} disabled={isManualMode} className="w-full p-2 rounded-md bg-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"><option value="Scale">Scale</option><option value="Chord">Chord</option></select></div>
                    <div className="flex-1 w-full"><label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">{selectedType} Name</label><select id="name" value={selectedName} onChange={e => setSelectedName(e.target.value)} disabled={isManualMode} className="w-full p-2 rounded-md bg-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed">{nameOptions.map(name => <option key={name} value={name}>{name}</option>)}</select></div>
                </div>
                
                <div className="w-full pt-4 border-t border-slate-600 mt-4 flex gap-2">
                    <button onClick={handleClearBoard} className="flex-1 bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg">Clear Board</button>
                    {isManualMode ? ( <button onClick={() => setIsManualMode(false)} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg">Generate Scale / Chord</button> ) : ( <button onClick={() => setIsManualMode(true)} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg">Customize Diagram</button> )}
                </div>
                {isManualMode && <p className="text-xs text-center text-gray-400">In Customize Mode: Click an empty spot to add, single-click to delete, double-click to edit, or drag to move.</p>}

                <div className="flex justify-between items-center gap-4 w-full pt-4 border-t border-slate-600 mt-4">
                    <div className="flex-1"><label htmlFor="start-fret" className="block text-sm font-medium text-gray-300 mb-1">Start Fret: <span className="font-bold text-teal-300">{startFret}</span></label><input id="start-fret" type="range" min="0" max="12" value={startFret} onChange={e => setStartFret(Number(e.target.value))} className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer" /></div>
                    <div className="flex-1"><label htmlFor="fret-count" className="block text-sm font-medium text-gray-300 mb-1">Fret Count: <span className="font-bold text-teal-300">{fretCount}</span></label><input id="fret-count" type="range" min="3" max="22" value={fretCount} onChange={e => setFretCount(Number(e.target.value))} className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer" /></div>
                </div>
                
                <details className="w-full" open={false}>
                    <summary className="text-lg font-semibold text-teal-300 cursor-pointer hover:text-teal-200 transition-colors py-2 border-t border-slate-600 mt-4">Advanced Display Options</summary>
                    <div className="w-full pt-4">
                        <div className="flex justify-between items-center gap-4 mb-2">
                            <div className="flex-1"><label className="block text-sm font-medium text-gray-300 mb-1">Label Display</label><div className="flex bg-slate-600 rounded-md p-1"><button onClick={() => setLabelType('name')} className={`flex-1 rounded-md text-sm py-1 ${labelType === 'name' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Name</button><button onClick={() => setLabelType('degree')} className={`flex-1 rounded-md text-sm py-1 ${labelType === 'degree' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Degree</button></div></div>
                            <div className="flex-1 flex justify-end gap-2"><button onClick={() => handleHighlightAll(true)} className="text-sm bg-slate-600 hover:bg-slate-500 py-1 px-3 rounded-md">All</button><button onClick={() => handleHighlightAll(false)} className="text-sm bg-slate-600 hover:bg-slate-500 py-1 px-3 rounded-md">None</button></div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 bg-slate-800/50 p-2 rounded-md">
                            {Object.entries(colorMap).map(([degree, { color, active }]) => (
                                <div key={degree} className="flex items-center gap-2"><input type="checkbox" id={`toggle-${degree}`} checked={active} onChange={() => handleColorToggle(degree)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /><input type="color" value={color} onChange={(e) => handleColorChange(degree, e.target.value)} className="w-6 h-6 p-0 border-none rounded-md cursor-pointer bg-transparent" /><label htmlFor={`toggle-${degree}`} className="text-sm font-bold text-gray-300 w-12 text-left">{degree}</label></div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-700">
                             <label htmlFor="png-bg" className="flex items-center gap-2 cursor-pointer">
                                <input id="png-bg" type="checkbox" checked={useWhiteBackground} onChange={e => setUseWhiteBackground(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                <span className="text-sm font-medium text-gray-300">Use white background for PNG export</span>
                            </label>
                        </div>
                    </div>
                </details>
            </div>
        </div>
    );
};

export default DiagramMaker;