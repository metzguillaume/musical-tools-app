import React, { useState, useEffect, useCallback } from 'react';
import { useTools } from '../context/ToolsContext';
import { getDiatonicChords, ROMAN_NUMERALS } from '../utils/musicTheory';
import InfoModal from './InfoModal';
import InfoButton from './InfoButton';

const COMMON_PATTERNS = {
    'Major': [['I', 'V', 'vi', 'IV'], ['I', 'IV', 'V', 'I'], ['vi', 'IV', 'I', 'V'], ['I', 'vi', 'ii', 'V']],
    'Minor': [['i', 'VI', 'III', 'VII'], ['i', 'iv', 'v', 'i'], ['i', 'iv', 'VII', 'III'], ['ii°', 'v', 'i', 'i']]
};

const CollapsibleSection = ({ title, isOpen, onToggle, children }) => (
    <div className="border-t border-slate-600/80 pt-3 mt-3">
        <button
            onClick={onToggle}
            className="w-full flex justify-between items-center text-left text-lg font-bold text-teal-300 hover:text-teal-200"
        >
            <span>{title}</span>
            <span className="text-xl">{isOpen ? '−' : '+'}</span>
        </button>
        {isOpen && <div className="pt-3 space-y-4">{children}</div>}
    </div>
);


const ChordProgressionGenerator = () => {
    const { isMetronomePlaying, setMetronomeSchedule, addLogEntry, bpm } = useTools();

    const [rootNote, setRootNote] = useState('C');
    const [keyType, setKeyType] = useState('Major');
    const [numChords, setNumChords] = useState(4);
    const [numProgressions, setNumProgressions] = useState(1);
    const [chordComplexity, setChordComplexity] = useState('Triads');
    const [useCommonPatterns, setUseCommonPatterns] = useState(true);
    const [includeDiminished, setIncludeDiminished] = useState(false);
    const [qualityFilter, setQualityFilter] = useState('all');

    const [isAutoGenerateOn, setIsAutoGenerateOn] = useState(false);
    const [autoGenerateInterval, setAutoGenerateInterval] = useState(numChords);

    const [displayMode, setDisplayMode] = useState('both');
    const [isControlsOpen, setIsControlsOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [fontSize, setFontSize] = useState(3);

    const [progressions, setProgressions] = useState([]);
    
    const [openSections, setOpenSections] = useState({
        general: true,
        options: false,
        display: false,
        automation: false
    });

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleGenerate = useCallback(() => {
        const apiComplexity = chordComplexity === 'Tetrads' ? '7ths' : 'Triads';
        let diatonicChords = getDiatonicChords(rootNote, keyType, apiComplexity);
        
        let availableChords = [...diatonicChords];
        if (!includeDiminished) {
            availableChords = availableChords.filter(c => !c.quality.includes('Diminished'));
        }
        
        if (qualityFilter === 'major') {
            availableChords = availableChords.filter(c => {
                const q = c.quality;
                return q.includes('Major') || q.includes('Dominant') || q.includes('Augmented');
            });
        } else if (qualityFilter === 'minor') {
            availableChords = availableChords.filter(c => {
                const q = c.quality;
                return q.includes('Minor') || q.includes('Half-Diminished');
            });
        }
        
        const canUseCommonPatterns = useCommonPatterns && qualityFilter === 'all';

        const newProgressions = [];
        for (let i = 0; i < numProgressions; i++) {
            const singleProgression = [];
            if (canUseCommonPatterns && availableChords.length > 0) {
                const basePatterns = COMMON_PATTERNS[keyType === 'Major' ? 'Major' : 'Minor'] || COMMON_PATTERNS['Major'];
                const basePattern = basePatterns[Math.floor(Math.random() * basePatterns.length)];
                
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
                    if (availableChords.length === 0) continue;
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
        
        if (newProgressions.every(prog => prog.length === 0)) {
            return;
        }
        setProgressions(newProgressions);
    }, [rootNote, keyType, chordComplexity, numChords, numProgressions, useCommonPatterns, includeDiminished, qualityFilter]);
    
    const scheduledGenerate = useCallback(() => {
        setTimeout(handleGenerate, 0);
    }, [handleGenerate]);

    useEffect(() => {
        handleGenerate();
    }, [handleGenerate]);

    useEffect(() => {
        setAutoGenerateInterval(numChords);
    }, [numChords]);

    useEffect(() => {
        if (isAutoGenerateOn && isMetronomePlaying) {
            setMetronomeSchedule({ callback: scheduledGenerate, interval: autoGenerateInterval });
        } else {
            setMetronomeSchedule(null);
        }
        return () => setMetronomeSchedule(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAutoGenerateOn, isMetronomePlaying, autoGenerateInterval, scheduledGenerate]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleGenerate();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleGenerate]);

    const handleLogSession = () => {
        const remarks = prompt("Enter any remarks for this session:", `Practiced chord progressions in ${rootNote} ${keyType}.`);
        if (remarks !== null) {
            const newEntry = {
                game: 'Chord Progression Generator',
                bpm: bpm || 'N/A',
                date: new Date().toLocaleDateString(),
                remarks: remarks || "No remarks."
            };
            addLogEntry(newEntry);
            alert("Session logged!");
        }
    };
    
    const handleQualityFilterChange = (filter) => {
        setQualityFilter(filter);
        if (filter !== 'all') {
            setUseCommonPatterns(false);
        }
    };

    const rootNoteOptions = ['C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'F#', 'B', 'E', 'A', 'D', 'G'];
    const keyTypeOptions = ['Major', 'Natural Minor', 'Harmonic Minor', 'Melodic Minor'];

    return (
        <div className="flex flex-col md:flex-row items-start w-full gap-4">
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Chord Progression Generator Guide">
                <div className="space-y-4 text-sm">
                    <p>This tool generates chord progressions based on your selected key, scale, and other options.</p>
                    <div><h4 className="font-bold text-indigo-300 mb-1">How It Works</h4><p>Use the collapsible "Settings & Controls" panel to customize your progression. You can choose a root note and key, how many chords to generate, and filter the types of chords used.</p></div>
                    <div><h4 className="font-bold text-indigo-300 mb-1">Features</h4>
                        <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                            <li><strong className="text-teal-300">Complexity:</strong> Switch between basic 3-note triads and richer 4-note tetrads.</li>
                            <li><strong className="text-teal-300">Filtering:</strong> You can choose to include or exclude diminished chords, or even limit the generator to only use major or minor chords. Note: Filtering by quality will disable "Common" patterns.</li>
                            <li><strong className="text-teal-300">Display:</strong> Change the font size with the slider and switch the display to show chord names, Roman numeral degrees, or both.</li>
                            <li><strong className="text-teal-300">Auto-Generate:</strong> Turn on this feature to get a new set of progressions automatically in time with the metronome, perfect for continuous practice.</li>
                        </ul>
                    </div>
                </div>
            </InfoModal>

            <div className="w-full flex-1 flex flex-col">
                <div className="bg-slate-800 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex-1"></div>
                        <div className="flex-1 flex justify-center items-center gap-2">
                            <h2 className="text-2xl text-center font-bold text-indigo-300">Chord Progression Generator</h2>
                            <InfoButton onClick={() => setIsInfoModalOpen(true)} />
                        </div>
                        <div className="flex-1 flex justify-end items-center gap-2">
                            <button onClick={handleLogSession} className="bg-green-600 hover:bg-green-500 text-white font-bold py-1 px-3 rounded-lg text-sm">Log Session</button>
                            <button 
                                onClick={() => setIsControlsOpen(p => !p)} 
                                className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-sm font-semibold"
                                title="Toggle Controls"
                            >
                                Controls
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-col items-center space-y-6 p-4 rounded-lg min-h-[10rem]">
                        {progressions.map((prog, progIndex) => (
                            <div key={progIndex} className="flex flex-wrap justify-center gap-x-8 gap-y-6 items-center">
                                {prog.map((chord, chordIndex) => (
                                    <div key={chordIndex} className="text-center shrink-0 flex flex-col items-center justify-center h-24 w-24">
                                        {displayMode === 'chords' && (
                                            <div style={{ fontSize: `${fontSize}rem` }} className="font-bold text-teal-300">{chord.name}</div>
                                        )}
                                        {displayMode === 'degrees' && (
                                            <div style={{ fontSize: `${fontSize}rem` }} className="font-bold text-teal-300">{chord.roman}</div>
                                        )}
                                        {displayMode === 'both' && (
                                            <>
                                                <div style={{ fontSize: `${fontSize}rem`, lineHeight: '1.1' }} className="font-bold text-teal-300">{chord.name}</div>
                                                <div style={{ fontSize: `${fontSize * 0.6}rem` }} className="text-gray-200 mt-2">{chord.roman}</div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="w-full flex justify-center my-6">
                     <button onClick={handleGenerate} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg text-xl">
                        Generate New Progression (Enter)
                    </button>
                </div>
            </div>
            
            <div className={`bg-slate-700 rounded-lg transition-all duration-300 ease-in-out overflow-hidden ${isControlsOpen ? 'w-full md:w-80 p-4' : 'w-full md:w-0 p-0 opacity-0 md:opacity-100'}`}>
                <div className={`${!isControlsOpen && 'hidden md:block'}`}>
                    <h3 className="text-xl font-bold text-teal-300 mb-4">Settings & Controls</h3>
                    
                    <CollapsibleSection title="General Settings" isOpen={openSections.general} onToggle={() => toggleSection('general')}>
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
                                <label className="font-semibold block mb-1">Chords/Line</label>
                                <input type="number" value={numChords} onChange={e => setNumChords(Math.max(1, parseInt(e.target.value, 10) || 1))} className="w-full p-2 rounded-md bg-slate-600 text-white"/>
                            </div>
                            <div>
                                <label className="font-semibold block mb-1">Lines</label>
                                <input type="number" value={numProgressions} onChange={e => setNumProgressions(Math.max(1, parseInt(e.target.value, 10) || 1))} className="w-full p-2 rounded-md bg-slate-600 text-white"/>
                            </div>
                        </div>
                        <div>
                            <label className="font-semibold block mb-1">Generation Method</label>
                            <div className="flex bg-slate-600 rounded-md p-1">
                                <button onClick={() => setUseCommonPatterns(true)} className={`flex-1 rounded-md text-sm py-1 ${useCommonPatterns ? 'bg-blue-600 text-white' : 'text-gray-300'} disabled:bg-slate-800 disabled:text-gray-500 disabled:cursor-not-allowed`} disabled={qualityFilter !== 'all'} title={qualityFilter !== 'all' ? "Not available with quality filters" : ""}>Common</button>
                                <button onClick={() => setUseCommonPatterns(false)} className={`flex-1 rounded-md text-sm py-1 ${!useCommonPatterns ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Random</button>
                            </div>
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Chord Options" isOpen={openSections.options} onToggle={() => toggleSection('options')}>
                        <div>
                            <label className="font-semibold block mb-1">Chord Complexity</label>
                            <div className="flex bg-slate-600 rounded-md p-1"><button onClick={() => setChordComplexity('Triads')} className={`flex-1 rounded-md text-sm py-1 ${chordComplexity === 'Triads' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Triads</button><button onClick={() => setChordComplexity('Tetrads')} className={`flex-1 rounded-md text-sm py-1 ${chordComplexity === 'Tetrads' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Tetrads</button></div>
                        </div>
                        <div>
                            <label className="font-semibold block mb-1">Chord Quality</label>
                            <div className="flex bg-slate-600 rounded-md p-1">
                                <button onClick={() => handleQualityFilterChange('all')} className={`flex-1 rounded-md text-sm py-1 ${qualityFilter === 'all' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>All</button>
                                <button onClick={() => handleQualityFilterChange('major')} className={`flex-1 rounded-md text-sm py-1 ${qualityFilter === 'major' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Major</button>
                                <button onClick={() => handleQualityFilterChange('minor')} className={`flex-1 rounded-md text-sm py-1 ${qualityFilter === 'minor' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Minor</button>
                            </div>
                        </div>
                         <label className="flex items-center justify-between gap-2 cursor-pointer pt-1">
                            <span className="font-semibold">Include Diminished</span>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={includeDiminished} onChange={() => setIncludeDiminished(p => !p)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </div>
                        </label>
                    </CollapsibleSection>
                    
                    <CollapsibleSection title="Display Settings" isOpen={openSections.display} onToggle={() => toggleSection('display')}>
                        <div>
                            <label className="font-semibold block mb-1">Display Mode</label>
                            <div className="flex bg-slate-600 rounded-md p-1">
                                <button onClick={() => setDisplayMode('chords')} className={`flex-1 rounded-md text-sm py-1 ${displayMode === 'chords' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Chords</button>
                                <button onClick={() => setDisplayMode('degrees')} className={`flex-1 rounded-md text-sm py-1 ${displayMode === 'degrees' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Degrees</button>
                                <button onClick={() => setDisplayMode('both')} className={`flex-1 rounded-md text-sm py-1 ${displayMode === 'both' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Both</button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="font-size" className="font-semibold block mb-1">Font Size</label>
                            <input type="range" id="font-size" min="1.5" max="5" step="0.1" value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="w-full" />
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Automation" isOpen={openSections.automation} onToggle={() => toggleSection('automation')}>
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
                    </CollapsibleSection>
                </div>
            </div>
        </div>
    );
};

export default ChordProgressionGenerator;