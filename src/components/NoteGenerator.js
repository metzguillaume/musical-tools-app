import React, { useState, useEffect, useCallback } from 'react';
import { useTools } from '../context/ToolsContext';

const NoteGenerator = () => {
    // --- FIX: Get the new tools we need from the context ---
    const { bpm, addLogEntry, isMetronomePlaying, setMetronomeSchedule } = useTools();
    const [numNotes, setNumNotes] = useState(12);
    const [noteType, setNoteType] = useState('chromatic');
    const [fontSize, setFontSize] = useState(4);
    const [generatedNotes, setGeneratedNotes] = useState([]);
    const [showBarlines, setShowBarlines] = useState(true);
    // --- FIX: Add state for the new auto-generate feature ---
    const [isAutoGenerateOn, setIsAutoGenerateOn] = useState(false);
    const [autoGenerateInterval, setAutoGenerateInterval] = useState(numNotes);

    const generateNotes = useCallback(() => {
        const naturalNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const chromaticNotes = ['C', { sharp: 'C#', flat: 'Db' }, 'D', { sharp: 'D#', flat: 'Eb' }, 'E', 'F', { sharp: 'F#', flat: 'Gb' }, 'G', { sharp: 'G#', flat: 'Ab' }, 'A', { sharp: 'A#', flat: 'Bb' }, 'B'];
        let sourceArray = noteType === 'natural' ? naturalNotes : chromaticNotes;
        let newNotes = [];
        let lastNote = null;
        for (let i = 0; i < numNotes; i++) {
            let note;
            let attempts = 0;
            do {
                let potentialNote = sourceArray[Math.floor(Math.random() * sourceArray.length)];
                if (typeof potentialNote === 'object') {
                    potentialNote = Math.random() < 0.5 ? potentialNote.sharp : potentialNote.flat;
                }
                note = potentialNote;
                attempts++;
            } while (note === lastNote && sourceArray.length > 1 && attempts < 20);
            newNotes.push(note);
            lastNote = note;
        }
        setGeneratedNotes(newNotes);
    }, [numNotes, noteType]);

    useEffect(() => {
        generateNotes();
    }, [generateNotes]);

    // --- FIX: This effect keeps the interval in sync with the number of notes ---
    useEffect(() => {
        setAutoGenerateInterval(numNotes);
    }, [numNotes]);

    // --- FIX: This effect tells the metronome what to do when auto-generate is active ---
    useEffect(() => {
        if (isAutoGenerateOn && isMetronomePlaying) {
            setMetronomeSchedule({
                callback: generateNotes,
                interval: autoGenerateInterval,
            });
        } else {
            // If auto-generate is off or metronome is stopped, clear the schedule
            setMetronomeSchedule(null);
        }
        // Ensure the schedule is cleared when the component unmounts
        return () => setMetronomeSchedule(null);
    }, [isAutoGenerateOn, isMetronomePlaying, autoGenerateInterval, generateNotes, setMetronomeSchedule]);


    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                generateNotes();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [generateNotes]);

    const handleLogProgress = () => {
        const remarks = prompt("Enter any remarks for this session:", `Practiced ${noteType} notes.`);
        if (remarks !== null) {
            const newEntry = {
                game: 'Note Generator',
                bpm: bpm,
                date: new Date().toLocaleDateString(),
                remarks: remarks || "No remarks."
            };
            addLogEntry(newEntry);
            alert("Session logged!");
        }
    };

    return (
        <div className="flex flex-col items-center w-full">
            <h2 className="text-3xl font-extrabold mb-6 text-indigo-300">Random Note Generator</h2>

            <div className="w-full bg-slate-800 p-6 rounded-lg text-center min-h-[100px] flex justify-center items-center flex-wrap gap-x-4 gap-y-2 mb-6">
                {generatedNotes.map((note, index) => {
                    const noteName = note.charAt(0);
                    const accidental = note.substring(1).replace(/#/g, '♯').replace(/b/g, '♭');
                    
                    return (
                        <React.Fragment key={index}>
                            <span
                                className="font-bold text-teal-300"
                                style={{ fontSize: `${fontSize}rem`, lineHeight: '1' }}
                            >
                                {noteName}
                                <sup style={{ fontSize: `${fontSize * 0.6}rem`, verticalAlign: 'super', marginLeft: '0.1em' }}>
                                    {accidental}
                                </sup>
                            </span>
                            {showBarlines && (index + 1) % 4 === 0 && index < generatedNotes.length - 1 && (
                                <div className="h-16 w-1 bg-slate-600 rounded-full mx-2" style={{height: `${fontSize*1.2}rem`}}></div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            <div className="w-full max-w-lg flex gap-4 mb-6">
                <button onClick={generateNotes} className="flex-grow bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg text-xl">
                    Generate (Enter/Space)
                </button>
                <button onClick={handleLogProgress} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg text-xl">
                    Log Progress
                </button>
            </div>
            
            <div className="w-full max-w-lg bg-slate-700 p-4 rounded-lg flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <label htmlFor="num-notes" className="font-semibold text-lg">Number of Notes:</label>
                    <input type="number" id="num-notes" value={numNotes} onChange={(e) => setNumNotes(Math.max(1, parseInt(e.target.value, 10) || 1))} className="w-24 p-2 rounded-md bg-slate-600 text-white text-center" min="1" />
                </div>
                <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg">Note Type:</span>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="noteType" value="natural" checked={noteType === 'natural'} onChange={() => setNoteType('natural')} />Natural</label>
                        <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="noteType" value="chromatic" checked={noteType === 'chromatic'} onChange={() => setNoteType('chromatic')} />Chromatic</label>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <label htmlFor="font-size" className="font-semibold text-lg">Font Size:</label>
                    <input type="range" id="font-size" min="2" max="8" step="0.5" value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="w-1/2" />
                </div>
                <div className="flex items-center justify-between">
                    <label htmlFor="show-barlines" className="font-semibold text-lg">Show Barlines:</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="show-barlines" checked={showBarlines} onChange={() => setShowBarlines(p => !p)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                
                {/* --- FIX: Add new controls for the auto-generate feature --- */}
                <div className="pt-4 border-t border-slate-600 space-y-4">
                    <div className="flex items-center justify-between">
                        <label htmlFor="auto-generate" className="font-semibold text-lg text-teal-300">Auto-Generate with Metronome:</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="auto-generate" checked={isAutoGenerateOn} onChange={() => setIsAutoGenerateOn(p => !p)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between">
                        <label htmlFor="auto-generate-interval" className={`font-semibold text-lg ${!isAutoGenerateOn && 'opacity-50'}`}>Generate new notes every:</label>
                        <div className="flex items-center gap-2">
                            <input type="number" id="auto-generate-interval" value={autoGenerateInterval} onChange={(e) => setAutoGenerateInterval(Math.max(1, parseInt(e.target.value, 10) || 1))} className={`w-24 p-2 rounded-md bg-slate-600 text-white text-center ${!isAutoGenerateOn && 'opacity-50'}`} min="1" disabled={!isAutoGenerateOn} />
                            <span className={`font-semibold text-lg ${!isAutoGenerateOn && 'opacity-50'}`}>clicks</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default NoteGenerator;