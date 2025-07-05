import React, { useState, useEffect, useCallback } from 'react';
import { useTools } from '../context/ToolsContext';
import { getDiatonicChords, ROMAN_NUMERALS } from '../utils/musicTheory';
import InfoModal from './InfoModal';
import InfoButton from './InfoButton';

const COMMON_PATTERNS = {
    'Major': [['I', 'V', 'vi', 'IV'], ['I', 'IV', 'V', 'I'], ['vi', 'IV', 'I', 'V'], ['I', 'vi', 'ii', 'V']],
    'Minor': [['i', 'VI', 'III', 'VII'], ['i', 'iv', 'v', 'i'], ['i', 'iv', 'VII', 'III'], ['ii°', 'v', 'i', 'i']]
};

const ChordProgressionGenerator = () => {
    const { isMetronomePlaying, setMetronomeSchedule } = useTools();

    const [rootNote, setRootNote] = useState('C');
    const [keyType, setKeyType] = useState('Major');
    const [numChords, setNumChords] = useState(4);
    const [numProgressions, setNumProgressions] = useState(2);
    const [chordComplexity, setChordComplexity] = useState('7ths');
    const [useCommonPatterns, setUseCommonPatterns] = useState(true);
    const [includeDiminished, setIncludeDiminished] = useState(false);
    
    const [isAutoGenerateOn, setIsAutoGenerateOn] = useState(false);
    const [autoGenerateInterval, setAutoGenerateInterval] = useState(numChords);

    const [showDegrees, setShowDegrees] = useState(false);
    const [isControlsOpen, setIsControlsOpen] = useState(true);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    const [progressions, setProgressions] = useState([]);
    
    const handleGenerate = useCallback(() => {
        let diatonicChords = getDiatonicChords(rootNote, keyType, chordComplexity);
        
        let availableChords = [...diatonicChords];
        if (!includeDiminished) {
            availableChords = availableChords.filter(c => !c.quality.includes('Diminished'));
        }
        
        const newProgressions = [];
        for (let i = 0; i < numProgressions; i++) {
            const singleProgression = [];
            if (useCommonPatterns && availableChords.length > 0) {
                const basePatterns = COMMON_PATTERNS[keyType === 'Major' ? 'Major' : 'Minor'] || COMMON_PATTERNS['Major'];
                const basePattern = basePatterns[Math.floor(Math.random() * basePatterns.length)];
                
                // --- FIX: Logic to correctly handle numChords > 4 for common patterns ---
                const finalPattern = [];
                for (let j = 0; j < numChords; j++) {
                    finalPattern.push(basePattern[j % basePattern.length]);
                }

                for (const roman of finalPattern) {
                    const numeralIndex = ROMAN_NUMERALS.indexOf(roman.toUpperCase());
                    let chord = diatonicChords[numeralIndex];
                    if (chord) {
                         if (keyType !== 'Major' && !['i', 'ii°', 'v', 'vii°'].includes(roman)) {
                            chord.roman = roman.toUpperCase();
                        } else {
                            chord.roman = roman;
                        }
                        singleProgression.push(chord);
                    }
                }
            } else if (availableChords.length > 0) { 
                let lastChord = null;
                for (let j = 0; j < numChords; j++) {
                    let nextChord;
                    do {
                        nextChord = availableChords[Math.floor(Math.random() * availableChords.length)];
                    } while (nextChord === lastChord && availableChords.length > 1);
                    singleProgression.push(nextChord);
                    lastChord = nextChord;
                }
            }
            newProgressions.push(singleProgression);
        }
        setProgressions(newProgressions);
    }, [rootNote, keyType, chordComplexity, numChords, numProgressions, useCommonPatterns, includeDiminished]);
    
    useEffect(() => {
        handleGenerate();
    }, [handleGenerate]);

    useEffect(() => {
        setAutoGenerateInterval(numChords);
    }, [numChords]);

    useEffect(() => {
        if (isAutoGenerateOn && isMetronomePlaying) {
            setMetronomeSchedule({ callback: handleGenerate, interval: autoGenerateInterval });
        } else {
            setMetronomeSchedule(null);
        }
        return () => setMetronomeSchedule(null);
    }, [isAutoGenerateOn, isMetronomePlaying, autoGenerateInterval, handleGenerate, setMetronomeSchedule]);
    
    const rootNoteOptions = ['C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'F#', 'B', 'E', 'A', 'D', 'G'];
    const keyTypeOptions = ['Major', 'Natural Minor', 'Harmonic Minor', 'Melodic Minor'];

    return (
        <div className="flex flex-col md:flex-row items-start w-full gap-4">
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Chord Progression Generator Guide">
                <div className="space-y-4 text-sm">
                    <p>This tool generates chord progressions based on your selected key, scale, and complexity rules.</p>
                    <div><h4 className="font-bold text-indigo-300 mb-1">How It Works</h4><p>Use the collapsible "Settings & Controls" panel to customize your progression. You can choose a root note and key, how many chords to generate, and whether to use common patterns or create fully random progressions.</p></div>
                    <div><h4 className="font-bold text-indigo-300 mb-1">Features</h4>
                        <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                            <li><strong className="text-teal-300">Complexity:</strong> Switch between basic 3-note triads and richer 4-note 7th chords.</li>
                            <li><strong className="text-teal-300">Toggle Degrees:</strong> Use the switch in the controls to show or hide the Roman numeral analysis for a cleaner look.</li>
                            <li><strong className="text-teal-300">Auto-Generate:</strong> Turn on this feature to get a new set of progressions automatically in time with the metronome, perfect for continuous practice.</li>
                        </ul>
                    </div>
                </div>
            </InfoModal>

            <div className="w-full flex-1 bg-slate-800 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-3xl font-extrabold text-indigo-300">Generated Progressions</h2>
                    <div>
                        <InfoButton onClick={() => setIsInfoModalOpen(true)} />
                        <button 
                            onClick={() => setIsControlsOpen(p => !p)} 
                            className="ml-2 p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-sm font-semibold"
                            title="Toggle Controls"
                        >
                            Controls
                        </button>
                    </div>
                </div>
                <div className="space-y-4 bg-slate-900/50 p-4 rounded-lg min-h-[10rem]">
                    {progressions.map((prog, progIndex) => (
                        <div key={progIndex} className="flex flex-wrap gap-x-8 gap-y-6 items-center">
                            {prog.map((chord, chordIndex) => (
                                // --- FIX: Restyled the chord display ---
                                <div key={chordIndex} className="text-center shrink-0 flex flex-col-reverse h-24 justify-end">
                                    <div className="text-3xl font-bold text-teal-300">{chord.name}</div>
                                    {showDegrees && <div className="text-xl text-gray-200 mb-1">{chord.roman}</div>}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className={`bg-slate-700 rounded-lg transition-all duration-300 ease-in-out overflow-hidden ${isControlsOpen ? 'w-full md:w-80 p-4' : 'w-full md:w-0 p-0 opacity-0 md:opacity-100'}`}>
                <div className={`${!isControlsOpen && 'hidden md:block'}`}>
                    <h3 className="text-xl font-bold text-teal-300 mb-4">Settings & Controls</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="font-semibold block mb-1">Root Note</label>
                            <select value={rootNote} onChange={e => setRootNote(e.target.value)} className="w-full p-2 rounded-md bg-slate-600 text-white">{rootNoteOptions.map(n => <option key={n} value={n}>{n}</option>)}</select>
                        </div>
                        <div>
                            <label className="font-semibold block mb-1">Key / Scale</label>
                            <select value={keyType} onChange={e => setKeyType(e.target.value)} className="w-full p-2 rounded-md bg-slate-600 text-white">{keyTypeOptions.map(k => <option key={k} value={k}>{k}</option>)}</select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="font-semibold block mb-1">Chords / Line</label>
                                <input type="number" value={numChords} onChange={e => setNumChords(Math.max(1, parseInt(e.target.value, 10) || 1))} className="w-full p-2 rounded-md bg-slate-600 text-white"/>
                            </div>
                            <div>
                                <label className="font-semibold block mb-1">Lines</label>
                                <input type="number" value={numProgressions} onChange={e => setNumProgressions(Math.max(1, parseInt(e.target.value, 10) || 1))} className="w-full p-2 rounded-md bg-slate-600 text-white"/>
                            </div>
                        </div>
                        <div className="pt-2">
                            <label className="font-semibold block mb-1">Chord Complexity</label>
                            <div className="flex bg-slate-600 rounded-md p-1"><button onClick={() => setChordComplexity('Triads')} className={`flex-1 rounded-md text-sm py-1 ${chordComplexity === 'Triads' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Triads</button><button onClick={() => setChordComplexity('7ths')} className={`flex-1 rounded-md text-sm py-1 ${chordComplexity === '7ths' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>7th Chords</button></div>
                        </div>
                        <div className="pt-2">
                            <label className="font-semibold block mb-1">Generation Method</label>
                            <div className="flex bg-slate-600 rounded-md p-1"><button onClick={() => setUseCommonPatterns(true)} className={`flex-1 rounded-md text-sm py-1 ${useCommonPatterns ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Common</button><button onClick={() => setUseCommonPatterns(false)} className={`flex-1 rounded-md text-sm py-1 ${!useCommonPatterns ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Random</button></div>
                        </div>
                        <div className="pt-2 space-y-2">
                            <label className="font-semibold block">Display Options</label>
                            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={showDegrees} onChange={() => setShowDegrees(p => !p)} />Show Scale Degrees (Roman)</label>
                            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={includeDiminished} onChange={() => setIncludeDiminished(p => !p)} />Include Diminished Chords</label>
                        </div>
                        <div className="pt-4 border-t border-slate-600 space-y-4">
                            <div className="flex items-center justify-between">
                                <label htmlFor="auto-generate-prog" className="font-semibold text-lg text-teal-300">Auto-Generate:</label>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="auto-generate-prog" checked={isAutoGenerateOn} onChange={() => setIsAutoGenerateOn(p => !p)} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="auto-generate-interval-prog" className={`font-semibold ${!isAutoGenerateOn && 'opacity-50'}`}>Every:</label>
                                <div className="flex items-center gap-2">
                                    <input type="number" id="auto-generate-interval-prog" value={autoGenerateInterval} onChange={(e) => setAutoGenerateInterval(Math.max(1, parseInt(e.target.value, 10) || 1))} className={`w-20 p-2 rounded-md bg-slate-600 text-white text-center ${!isAutoGenerateOn && 'opacity-50'}`} min="1" disabled={!isAutoGenerateOn} />
                                    <span className={`font-semibold ${!isAutoGenerateOn && 'opacity-50'}`}>clicks</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={handleGenerate} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg text-xl mt-2">Generate</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChordProgressionGenerator;