import { useState, useEffect, useRef } from 'react';
import { 
    SCALES, 
    CHORDS, 
    getNotesFor, 
    NOTE_TO_MIDI, 
    SEMITONE_TO_DEGREE,
    getScaleNotes,      // Added for diatonic spelling
    getChordNoteNames   // Added for diatonic spelling
} from '../../utils/musicTheory.js';
import { fretboardModel } from '../../utils/fretboardUtils.js';

export const useDiagramMaker = () => {
    const [selectedRoot, setSelectedRoot] = useState('C');
    const [selectedType, setSelectedType] = useState('Scale');
    const [selectedName, setSelectedName] = useState('Major');
    const [displayedNotes, setDisplayedNotes] = useState([]);
    const [startFret, setStartFret] = useState(0);
    const [fretCount, setFretCount] = useState(15);
    const [labelType, setLabelType] = useState('degree');
    const [colorMap, setColorMap] = useState({
        '1': { color: '#ef4444', active: true }, 'b2': { color: '#f97316', active: false },
        '2': { color: '#a3e635', active: false }, 'b3': { color: '#ec4899', active: false },
        '3': { color: '#22c55e', active: false }, '4': { color: '#14b8a6', active: false },
        '#4/b5': { color: '#6b7280', active: false }, '5': { color: '#eab308', active: false },
        'b6': { color: '#8b5cf6', active: false }, '6': { color: '#a855f7', active: false },
        'b7': { color: '#3b82f6', active: false }, '7': { color: '#7dd3fc', active: false },
    });
    const [isManualMode, setIsManualMode] = useState(true);
    const [editingNote, setEditingNote] = useState(null);
    const [editLabel, setEditLabel] = useState('');
    const [editColor, setEditColor] = useState('#ffffff');
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [useWhiteBackground, setUseWhiteBackground] = useState(false);
    const [draggingNote, setDraggingNote] = useState(null);
    
    const clickManager = useRef({ clickTimeout: null, lastClickTimestamp: 0, clickedNote: null });
    const isModalInteraction = useRef(false);

    const handleExportAsPng = () => {
        const svgElement = document.getElementById('fretboard-diagram-svg');
        if (!svgElement) return;
        const serializer = new XMLSerializer();
        let svgString = serializer.serializeToString(svgElement);
        if (useWhiteBackground) {
            svgString = svgString.replace(/fill="white"/g, 'fill="#111827"');
        }
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const scale = 2;
        const { width, height } = svgElement.viewBox.baseVal;
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

    const handleColorToggle = (degree) => setColorMap(prev => ({ ...prev, [degree]: { ...prev[degree], active: !prev[degree].active } }));
    const handleColorChange = (degree, newColor) => setColorMap(prev => ({ ...prev, [degree]: { ...prev[degree], color: newColor } }));
    const handleHighlightAll = (shouldHighlight) => {
        const newColorMap = { ...colorMap };
        Object.keys(newColorMap).forEach(degree => { newColorMap[degree].active = shouldHighlight; });
        setColorMap(newColorMap);
    };

    const deleteNote = (noteToDelete) => setDisplayedNotes(prev => prev.filter(note => !(note.string === noteToDelete.string && note.fret === noteToDelete.fret)));
    const openEditModal = (noteToEdit) => {
        setEditingNote(noteToEdit);
        setEditLabel(noteToEdit.overrideLabel || (labelType === 'name' ? noteToEdit.label : noteToEdit.degree));
        const colorMapEntry = colorMap[noteToEdit.degree];
        const defaultColor = noteToEdit.isRoot ? '#ef4444' : '#3b82f6';
        const activeColor = (colorMapEntry && colorMapEntry.active) ? colorMapEntry.color : defaultColor;
        setEditColor(noteToEdit.overrideColor || activeColor);
    };

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
            const fretWidth = (800 - nutWidth) / fretCount;
            const fretChange = Math.round(deltaX / fretWidth);
            const newFret = Math.max(0, Math.min(24, draggingNote.note.fret + fretChange));
            const stringSpacing = 240 / 6;
            const stringChange = Math.round(deltaY / stringSpacing);
            const newString = Math.max(1, Math.min(6, draggingNote.note.string + stringChange));
            setDisplayedNotes(prev => prev.map(n => n.string === draggingNote.note.string && n.fret === draggingNote.note.fret ? { ...n, movedFret: newFret, movedString: newString } : n));
        }
    };

    const handleBoardMouseUp = () => {
        if (!draggingNote) return;
        if (!draggingNote.moved) {
            clickManager.current.clickTimeout = setTimeout(() => deleteNote(draggingNote.note), 250);
        } else {
            const movedNote = displayedNotes.find(n => n.string === draggingNote.note.string && n.fret === draggingNote.note.fret);
            if (movedNote && movedNote.movedFret !== undefined && movedNote.movedString !== undefined) {
                const { movedFret: newFret, movedString: newString } = movedNote;
                const targetOccupied = displayedNotes.some(n => n.string === newString && n.fret === newFret && !(n.string === draggingNote.note.string && n.fret === draggingNote.note.fret));
                if (!targetOccupied) {
                    const newNoteData = fretboardModel[6 - newString][newFret];
                    setDisplayedNotes(prev => prev.map(n => n.string === movedNote.string && n.fret === movedNote.fret ? { ...n, ...newNoteData, string: newString, fret: newFret, movedFret: undefined, movedString: undefined } : n));
                } else {
                    setDisplayedNotes(prev => prev.map(n => ({ ...n, movedFret: undefined, movedString: undefined })));
                }
            }
        }
        setDraggingNote(null);
    };

    const handleSaveNoteEdit = () => {
        if (!editingNote) return;
        setDisplayedNotes(prev => prev.map(note => note.string === editingNote.string && note.fret === editingNote.fret ? { ...note, overrideLabel: editLabel, overrideColor: editColor } : note));
        setEditingNote(null);
    };

    const handleBoardClick = (string, fret) => {
        if (!isManualMode || displayedNotes.some(note => note.string === string && note.fret === fret)) return;
        const noteData = fretboardModel[6 - string]?.[fret];
        if (noteData) {
            const rootMidi = NOTE_TO_MIDI[selectedRoot];
            const interval = (noteData.midi - rootMidi) % 12;
            const positiveInterval = interval < 0 ? interval + 12 : interval;
            const degree = SEMITONE_TO_DEGREE[positiveInterval] || '?';
            const newNote = { 
                string, 
                fret, 
                label: noteData.note,
                midi: noteData.midi,
                isRoot: noteData.midi % 12 === rootMidi % 12, 
                degree, 
                overrideColor: null, 
                overrideLabel: null 
            };
            setDisplayedNotes(prev => [...prev, newNote]);
        }
    };
    
    const handleClearBoard = () => { setDisplayedNotes([]); setIsManualMode(true); };

    useEffect(() => {
        if (selectedType === 'Scale') setSelectedName(Object.keys(SCALES)[0]);
        else setSelectedName(Object.keys(CHORDS)[0]);
    }, [selectedType]);

    // ================================================================================= //
    // ===== THIS IS THE CORRECTED useEffect HOOK FOR NOTE GENERATION & SPELLING ===== //
    // ================================================================================= //
    useEffect(() => {
        const rootMidi = NOTE_TO_MIDI[selectedRoot];
        if (rootMidi === undefined) return;
        
        if (isManualMode) {
            // Update degrees and root status for existing notes when root changes in manual mode
            setDisplayedNotes(prev => prev.map(note => {
                const interval = (note.midi - rootMidi) % 12;
                const positiveInterval = interval < 0 ? interval + 12 : interval;
                return { 
                    ...note, 
                    degree: SEMITONE_TO_DEGREE[positiveInterval] || '?', 
                    isRoot: note.midi % 12 === rootMidi % 12,
                    // Note name from model doesn't change, just its relation to the root
                    label: fretboardModel[6 - note.string][note.fret].note 
                };
            }));
        } else {
            // Logic for generating scales/chords automatically with correct note names
            const sourceData = selectedType === 'Scale' ? SCALES : CHORDS;
            const intervals = sourceData[selectedName]?.intervals;

            if (intervals) {
                // 1. Get the diatonically correct note names for the current context.
                const correctNoteNames = selectedType === 'Scale'
                    ? getScaleNotes(selectedRoot, selectedName)
                    : getChordNoteNames(selectedRoot, selectedName);

                // 2. Create a map from MIDI class (0-11) to the correct note name string.
                const midiToCorrectNameMap = {};
                if (correctNoteNames && correctNoteNames.length > 0) {
                    correctNoteNames.forEach((name, index) => {
                        const midiClass = (rootMidi + intervals[index]) % 12;
                        midiToCorrectNameMap[midiClass] = name;
                    });
                }
                
                // 3. Find all positions for the required notes on the fretboard.
                const notesOnFretboard = getNotesFor(selectedRoot, intervals, fretboardModel);
                
                // 4. Map over the found notes and apply the correct label from our map.
                const correctlyLabelledNotes = notesOnFretboard.map(note => ({
                    ...note,
                    label: midiToCorrectNameMap[note.midi % 12] || note.label, // Use map, fallback to original if needed
                    overrideColor: null,
                    overrideLabel: null,
                }));

                setDisplayedNotes(correctlyLabelledNotes);
            }
        }
    }, [selectedRoot, selectedType, selectedName, isManualMode]);

    useEffect(() => {
        const handleGlobalMouseUp = () => { isModalInteraction.current = false; };
        window.addEventListener('mouseup', handleGlobalMouseUp);
        const clickTimer = clickManager.current;
        return () => {
            window.removeEventListener('mouseup', handleGlobalMouseUp);
            clearTimeout(clickTimer.clickTimeout);
        };
    }, []);

    return {
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
    };
};