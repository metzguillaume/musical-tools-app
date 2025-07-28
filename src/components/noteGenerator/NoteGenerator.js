import React, { useState, useEffect, useCallback } from 'react';
import { useTools } from '../../context/ToolsContext';
// UPDATED PATHS
import InfoModal from '../common/InfoModal';
import InfoButton from '../common/InfoButton';

const NoteGenerator = () => {
    // UPDATED: Removed unused 'isMetronomePlaying' variable
    const { bpm, addLogEntry, setMetronomeSchedule, countdownClicks, setCountdownClicks, countdownMode, setCountdownMode } = useTools();
    const [numNotes, setNumNotes] = useState(12);
    const [noteType, setNoteType] = useState('chromatic');
    const [fontSize, setFontSize] = useState(4);
    const [generatedNotes, setGeneratedNotes] = useState([]);
    const [showBarlines, setShowBarlines] = useState(true);
    const [isAutoGenerateOn, setIsAutoGenerateOn] = useState(false);
    const [autoGenerateInterval, setAutoGenerateInterval] = useState(numNotes);
    const [isControlsOpen, setIsControlsOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    const generateNotes = useCallback(() => {
        const naturalNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const chromaticNotes = ['C', { sharp: 'C#', flat: 'Db' }, 'D', { sharp: 'D#', flat: 'Eb' }, 'E', 'F', { sharp: 'F#', flat: 'Gb' }, 'G', { sharp: 'G#', flat: 'Ab' }, 'A', { sharp: 'A#', flat: 'Bb' }, 'B'];
        const sourceArray = noteType === 'natural' ? naturalNotes : chromaticNotes;
        
        const newNotes = [];
        let currentSectionNotes = [];

        for (let i = 0; i < numNotes; i++) {
            if (i > 0 && i % 4 === 0) {
                currentSectionNotes = [];
            }

            let note;
            let attempts = 0;
            do {
                let potentialNote = sourceArray[Math.floor(Math.random() * sourceArray.length)];
                if (typeof potentialNote === 'object') {
                    potentialNote = Math.random() < 0.5 ? potentialNote.sharp : potentialNote.flat;
                }
                note = potentialNote;
                attempts++;
            } while (currentSectionNotes.includes(note) && sourceArray.length > currentSectionNotes.length && attempts < 20);
            
            newNotes.push(note);
            currentSectionNotes.push(note);
        }
        setGeneratedNotes(newNotes);
    }, [numNotes, noteType]);

    const scheduledGenerate = useCallback(() => {
        setTimeout(generateNotes, 0);
    }, [generateNotes]);

    useEffect(() => {
        generateNotes();
    }, [generateNotes]);

    useEffect(() => {
        setAutoGenerateInterval(numNotes);
    }, [numNotes]);

    useEffect(() => {
        if (isAutoGenerateOn) {
            setMetronomeSchedule({
                callback: scheduledGenerate,
                interval: autoGenerateInterval,
            });
        } else {
            setMetronomeSchedule(null);
        }
    }, [isAutoGenerateOn, autoGenerateInterval, scheduledGenerate, setMetronomeSchedule]);


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

    const ControlsContent = (
        <div className="flex flex-col gap-4">
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
                <label htmlFor="show-barlines" className="font-semibold text-lg">Show Barlines:</label>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="show-barlines" checked={showBarlines} onChange={() => setShowBarlines(p => !p)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>
            
            <div className="pt-4 border-t border-slate-600 space-y-4">
                <div className="flex items-center justify-between">
                    <label htmlFor="auto-generate" className="font-semibold text-lg text-teal-300">Auto-Generate:</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="auto-generate" checked={isAutoGenerateOn} onChange={() => setIsAutoGenerateOn(p => !p)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                </div>
                <div className="flex items-center justify-between">
                    <label htmlFor="auto-generate-interval" className={`font-semibold text-lg ${!isAutoGenerateOn && 'opacity-50'}`}>Every:</label>
                    <div className="flex items-center gap-2">
                        <input type="number" id="auto-generate-interval" value={autoGenerateInterval} onChange={(e) => setAutoGenerateInterval(Math.max(1, parseInt(e.target.value, 10) || 1))} className={`w-24 p-2 rounded-md bg-slate-600 text-white text-center ${!isAutoGenerateOn && 'opacity-50'}`} min="1" disabled={!isAutoGenerateOn} />
                        <span className={`font-semibold text-lg ${!isAutoGenerateOn && 'opacity-50'}`}>clicks</span>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <label htmlFor="countdown-clicks" className={`font-semibold text-lg ${!isAutoGenerateOn && 'opacity-50'}`}>Countdown:</label>
                    <div className="flex items-center gap-2">
                        <input type="number" id="countdown-clicks" value={countdownClicks} onChange={(e) => setCountdownClicks(Math.max(0, parseInt(e.target.value, 10) || 0))} className={`w-24 p-2 rounded-md bg-slate-600 text-white text-center ${!isAutoGenerateOn && 'opacity-50'}`} min="0" max="7" disabled={!isAutoGenerateOn} />
                         <span className={`font-semibold text-lg ${!isAutoGenerateOn && 'opacity-50'}`}>clicks</span>
                    </div>
                </div>
                 <div>
                    <label className={`font-semibold block mb-2 text-lg ${!isAutoGenerateOn && 'opacity-50'}`}>Countdown Mode:</label>
                    <div className="flex bg-slate-600 rounded-md p-1">
                        <button disabled={!isAutoGenerateOn} onClick={() => setCountdownMode('every')} className={`flex-1 rounded-md text-sm py-1 disabled:cursor-not-allowed ${countdownMode === 'every' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Every Time</button>
                        <button disabled={!isAutoGenerateOn} onClick={() => setCountdownMode('first')} className={`flex-1 rounded-md text-sm py-1 disabled:cursor-not-allowed ${countdownMode === 'first' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>First Time Only</button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col md:flex-row items-start w-full gap-4">
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Random Note Generator Guide">
                <div className="space-y-4 text-sm">
                    <p>This tool generates a random sequence of musical notes to help you practice note recognition and sight-reading.</p>
                    <div><h4 className="font-bold text-indigo-300 mb-1">How It Works</h4><p>Use the "Generate" button or press the Enter/Space key to get a new set of notes. The controls panel on the right allows you to customize the generator.</p></div>
                    <div><h4 className="font-bold text-indigo-300 mb-1">Features</h4>
                        <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                            <li><strong className="text-teal-300">Number of Notes:</strong> Choose how many notes to generate at a time.</li>
                            <li><strong className="text-teal-300">Note Type:</strong> Select "Natural" for notes without sharps or flats (A, B, C...) or "Chromatic" to include all 12 notes.</li>
                            <li><strong className="text-teal-300">Auto-Generate:</strong> Turn on this feature to get a new set of notes automatically in time with the metronome. Use the "Countdown" to get a few clicks to prepare.</li>
                        </ul>
                    </div>
                </div>
            </InfoModal>

            <div className="w-full flex-1 bg-slate-800 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex-1"></div>
                    <div className="flex-1 flex justify-center items-center gap-2">
                         <h1 className="text-xl md:text-2xl text-center font-bold text-indigo-300">Random Note Generator</h1>
                        <InfoButton onClick={() => setIsInfoModalOpen(true)} />
                    </div>
                    <div className="flex-1 flex justify-end items-center gap-2">
                        <button onClick={handleLogProgress} className="bg-green-600 hover:bg-green-500 text-white font-bold py-1 px-3 rounded-lg text-sm">Log Session</button>
                        <button onClick={() => setIsControlsOpen(p => !p)} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-sm font-semibold">Controls</button>
                    </div>
                </div>
                
                <div className="w-full p-6 rounded-lg text-center min-h-[160px] flex justify-center items-center flex-wrap gap-x-4 gap-y-2">
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

                <div className="flex items-center justify-center gap-4 mt-6 mb-8">
                    <label htmlFor="font-size-main" className="font-semibold text-lg">Font Size:</label>
                    <input type="range" id="font-size-main" min="2" max="8" step="0.5" value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="w-1/2 max-w-xs" />
                </div>

                <div className="w-full flex justify-center">
                    <button onClick={generateNotes} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg text-xl">
                        Generate (Enter/Space)
                    </button>
                </div>
            </div>
            
            <div className={`hidden md:block bg-slate-700 rounded-lg transition-all duration-300 ease-in-out ${isControlsOpen ? 'w-80 p-4' : 'w-0 p-0 overflow-hidden'}`}>
                <div className={`${!isControlsOpen && 'hidden'}`}>
                     <h3 className="text-xl font-bold text-teal-300 mb-4">Settings & Controls</h3>
                    {ControlsContent}
                </div>
            </div>

            {isControlsOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex justify-center items-center bg-black/60" onClick={() => setIsControlsOpen(false)}>
                    <div className="w-11/12 max-w-sm bg-slate-800 rounded-2xl p-4 max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex-shrink-0 flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-teal-300">Settings & Controls</h3>
                            <button onClick={() => setIsControlsOpen(false)} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
                        </div>
                        <div className="flex-grow overflow-y-auto pr-2">
                            {ControlsContent}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NoteGenerator;