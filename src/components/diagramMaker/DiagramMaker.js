import React from 'react';
import { useDiagramMaker } from './useDiagramMaker';
import FretboardDiagram from '../common/FretboardDiagram';
import { SCALES, CHORDS } from '../../utils/musicTheory.js';
import InfoModal from '../common/InfoModal';
import InfoButton from '../common/InfoButton';

const DiagramMaker = () => {
    const {
        selectedRoot, setSelectedRoot,
        selectedType, setSelectedType,
        selectedName, setSelectedName,
        displayedNotes,
        startFret, setStartFret,
        fretCount, setFretCount,
        labelType, setLabelType,
        colorMap, handleColorToggle, handleColorChange, handleHighlightAll,
        isManualMode, setIsManualMode,
        editingNote, setEditingNote, handleSaveNoteEdit,
        editLabel, setEditLabel,
        editColor, setEditColor,
        isInfoModalOpen, setIsInfoModalOpen,
        useWhiteBackground, setUseWhiteBackground,
        draggingNote,
        handleExportAsPng,
        handleNoteMouseDown, handleBoardMouseMove, handleBoardMouseUp,
        handleBoardClick, handleClearBoard,
        isModalInteraction,
    } = useDiagramMaker();

    const nameOptions = selectedType === 'Scale' ? Object.keys(SCALES) : Object.keys(CHORDS);
    const rootNoteOptions = [
        { name: 'C', value: 'C' }, { name: 'F', value: 'F' }, { name: 'Bb', value: 'Bb' }, { name: 'Eb', value: 'Eb' }, { name: 'Ab', value: 'Ab' },
        { name: 'Db', value: 'Db' }, { name: 'F#', value: 'F#' }, { name: 'B', value: 'B' }, { name: 'E', value: 'E' }, { name: 'A', value: 'A' },
        { name: 'D', value: 'D' }, { name: 'G', value: 'G' },
    ];
    
    return (
        <div className="flex flex-col items-center w-full">
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Fretboard Diagram Maker Guide">
                <div className="space-y-4 text-sm">
                    <div><h4 className="font-bold text-indigo-300 mb-1">Generator Mode</h4><p>Use the dropdowns to automatically generate a diagram for any scale or chord. The diagram will update as you change the root note, type, or name.</p></div>
                    <div><h4 className="font-bold text-indigo-300 mb-1">Customize Mode</h4><p>Click the "Customize Diagram" button to start with a blank canvas or lock the current diagram for editing. In this mode:</p>
                        <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                            <li><strong className="text-teal-300">Add Note:</strong> Click any empty spot on the fretboard. The new note's degree will be automatically calculated relative to the selected root note.</li>
                            <li><strong className="text-teal-300">Delete Note:</strong> Single-click an existing note.</li>
                            <li><strong className="text-teal-300">Edit Note:</strong> Double-click an existing note to change its color or label.</li>
                            <li><strong className="text-teal-300">Move Note:</strong> Click and drag a note to any other fret or string. Note that this won't change the name or scale degree written inside that note!</li>
                            <li><strong className="text-teal-300">Change Root Note:</strong> The Root Note dropdown is always active! Change it at any time to see the scale degrees update instantly for your custom diagram.</li>
                        </ul>
                    </div>
                     <div><h4 className="font-bold text-indigo-300 mb-1">Display & Export</h4>
                        <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                            <li><strong className="text-teal-300">Sliders:</strong> Use the "Start Fret" and "Fret Count" sliders to focus on a specific area of the fretboard.</li>
                             <li><strong className="text-teal-300">Advanced Options:</strong> Expand this section to toggle between "Name" and "Degree" labels, highlight specific degrees, or choose a white background for your PNG export (great for printing).</li>
                            <li><strong className="text-teal-300">Export/Print:</strong> Use the buttons in the header to export your diagram as a high-resolution PNG image or to print it directly.</li>
                        </ul>
                    </div>
                </div>
            </InfoModal>
            
            {editingNote && ( 
                <InfoModal isOpen={!!editingNote} onClose={() => { if (!isModalInteraction.current) setEditingNote(null); }} title={`Edit Note (${editingNote.label})`}>
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
                    notesToDisplay={displayedNotes} startFret={startFret} fretCount={fretCount}
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
                    <div className="flex-1 w-full"><label htmlFor="root-note" className="block text-sm font-medium text-gray-300 mb-1">Root Note</label><select id="root-note" value={selectedRoot} onChange={e => setSelectedRoot(e.target.value)} className="w-full p-2 rounded-md bg-slate-600 text-white">{rootNoteOptions.map(note => <option key={note.value} value={note.value}>{note.name}</option>)}</select></div>
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