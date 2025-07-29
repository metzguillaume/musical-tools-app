import React from 'react';
import { useTools } from '../../context/ToolsContext';
import { useChordProgressionGenerator } from './useChordProgressionGenerator';
import InfoModal from '../common/InfoModal';
import InfoButton from '../common/InfoButton';

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
    const { savePreset } = useTools();
    const {
        settings, setSettings,
        isAutoGenerateOn, setIsAutoGenerateOn,
        autoGenerateInterval, setAutoGenerateInterval,
        isControlsOpen, setIsControlsOpen,
        isInfoModalOpen, setIsInfoModalOpen,
        progressions,
        openSections, toggleSection,
        countdownClicks, setCountdownClicks,
        handleGenerate,
        handleLogSession,
    } = useChordProgressionGenerator();

    const handleSavePreset = () => {
        const name = prompt("Enter a name for your preset:", `CPG - ${settings.rootNote} ${settings.keyType}`);
        if (name && name.trim() !== "") {
            const newPreset = {
                id: Date.now().toString(),
                name: name.trim(),
                gameId: 'chord-progression-generator',
                gameName: 'Chord Progression Generator',
                settings: settings,
            };
            savePreset(newPreset);
            alert(`Preset "${name.trim()}" saved!`);
        }
    };

    const handleQualityFilterChange = (filter) => {
        setSettings(s => ({
            ...s,
            qualityFilter: filter,
            useCommonPatterns: filter !== 'all' ? false : s.useCommonPatterns,
        }));
    };

    const rootNoteOptions = ['C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'F#', 'B', 'E', 'A', 'D', 'G'];
    const keyTypeOptions = ['Major', 'Natural Minor', 'Harmonic Minor', 'Melodic Minor'];

    const ControlsContent = () => (
        <>
            <CollapsibleSection title="General Settings" isOpen={openSections.general} onToggle={() => toggleSection('general')}>
                <div>
                    <label className="font-semibold block mb-1">Root Note</label>
                    <select value={settings.rootNote} onChange={e => setSettings(s => ({...s, rootNote: e.target.value}))} className="w-full p-2 rounded-md bg-slate-600 text-white">{rootNoteOptions.map(n => <option key={n} value={n}>{n}</option>)}</select>
                </div>
                <div>
                    <label className="font-semibold block mb-1">Key / Scale</label>
                    <select value={settings.keyType} onChange={e => setSettings(s => ({...s, keyType: e.target.value}))} className="w-full p-2 rounded-md bg-slate-600 text-white">{keyTypeOptions.map(k => <option key={k} value={k}>{k}</option>)}</select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="font-semibold block mb-1">Chords/Line</label>
                        <input type="number" value={settings.numChords} onChange={e => setSettings(s => ({...s, numChords: Math.max(1, parseInt(e.target.value, 10) || 1)}))} className="w-full p-2 rounded-md bg-slate-600 text-white"/>
                    </div>
                    <div>
                        <label className="font-semibold block mb-1">Lines</label>
                        <input type="number" value={settings.numProgressions} onChange={e => setSettings(s => ({...s, numProgressions: Math.max(1, parseInt(e.target.value, 10) || 1)}))} className="w-full p-2 rounded-md bg-slate-600 text-white"/>
                    </div>
                </div>
                <div>
                    <label className="font-semibold block mb-1">Generation Method</label>
                    <div className="flex bg-slate-600 rounded-md p-1">
                        <button onClick={() => setSettings(s => ({...s, useCommonPatterns: true}))} className={`flex-1 rounded-md text-sm py-1 ${settings.useCommonPatterns ? 'bg-blue-600' : 'text-gray-300'} disabled:bg-slate-800 disabled:text-gray-500 disabled:cursor-not-allowed`} disabled={settings.qualityFilter !== 'all'} title={settings.qualityFilter !== 'all' ? "Not available with quality filters" : ""}>Common</button>
                        <button onClick={() => setSettings(s => ({...s, useCommonPatterns: false}))} className={`flex-1 rounded-md text-sm py-1 ${!settings.useCommonPatterns ? 'bg-blue-600' : 'text-gray-300'}`}>Random</button>
                    </div>
                </div>
            </CollapsibleSection>

            <CollapsibleSection title="Chord Options" isOpen={openSections.options} onToggle={() => toggleSection('options')}>
                <div>
                    <label className="font-semibold block mb-1">Chord Complexity</label>
                    <div className="flex bg-slate-600 rounded-md p-1"><button onClick={() => setSettings(s => ({...s, chordComplexity: 'Triads'}))} className={`flex-1 rounded-md text-sm py-1 ${settings.chordComplexity === 'Triads' ? 'bg-blue-600' : 'text-gray-300'}`}>Triads</button><button onClick={() => setSettings(s => ({...s, chordComplexity: 'Tetrads'}))} className={`flex-1 rounded-md text-sm py-1 ${settings.chordComplexity === 'Tetrads' ? 'bg-blue-600' : 'text-gray-300'}`}>Tetrads</button></div>
                </div>
                <div>
                    <label className="font-semibold block mb-1">Chord Quality</label>
                    <div className="flex bg-slate-600 rounded-md p-1">
                        <button onClick={() => handleQualityFilterChange('all')} className={`flex-1 rounded-md text-sm py-1 ${settings.qualityFilter === 'all' ? 'bg-blue-600' : 'text-gray-300'}`}>All</button>
                        <button onClick={() => handleQualityFilterChange('major')} className={`flex-1 rounded-md text-sm py-1 ${settings.qualityFilter === 'major' ? 'bg-blue-600' : 'text-gray-300'}`}>Major</button>
                        <button onClick={() => handleQualityFilterChange('minor')} className={`flex-1 rounded-md text-sm py-1 ${settings.qualityFilter === 'minor' ? 'bg-blue-600' : 'text-gray-300'}`}>Minor</button>
                    </div>
                </div>
                 <label className="flex items-center justify-between gap-2 cursor-pointer pt-1">
                    <span className="font-semibold">Include Diminished</span>
                    <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={settings.includeDiminished} onChange={() => setSettings(s => ({...s, includeDiminished: !s.includeDiminished}))} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </div>
                </label>
            </CollapsibleSection>
            
            <CollapsibleSection title="Display Settings" isOpen={openSections.display} onToggle={() => toggleSection('display')}>
                <div>
                    <label className="font-semibold block mb-1">Display Mode</label>
                    <div className="flex bg-slate-600 rounded-md p-1">
                        <button onClick={() => setSettings(s => ({...s, displayMode: 'chords'}))} className={`flex-1 rounded-md text-sm py-1 ${settings.displayMode === 'chords' ? 'bg-blue-600' : 'text-gray-300'}`}>Chords</button>
                        <button onClick={() => setSettings(s => ({...s, displayMode: 'degrees'}))} className={`flex-1 rounded-md text-sm py-1 ${settings.displayMode === 'degrees' ? 'bg-blue-600' : 'text-gray-300'}`}>Degrees</button>
                        <button onClick={() => setSettings(s => ({...s, displayMode: 'both'}))} className={`flex-1 rounded-md text-sm py-1 ${settings.displayMode === 'both' ? 'bg-blue-600' : 'text-gray-300'}`}>Both</button>
                    </div>
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
                 <div className="flex items-center justify-between">
                    <label htmlFor="countdown-clicks-prog" className={`font-semibold ${!isAutoGenerateOn && 'opacity-50'}`}>Countdown:</label>
                    <div className="flex items-center gap-2">
                        <input type="number" id="countdown-clicks-prog" value={countdownClicks} onChange={(e) => setCountdownClicks(Math.max(0, parseInt(e.target.value, 10) || 0))} className={`w-20 p-2 rounded-md bg-slate-600 text-white text-center ${!isAutoGenerateOn && 'opacity-50'}`} min="0" max="7" disabled={!isAutoGenerateOn} />
                         <span className={`font-semibold ${!isAutoGenerateOn && 'opacity-50'}`}>clicks</span>
                    </div>
                </div>
            </CollapsibleSection>
            <div className="border-t border-slate-600 pt-4 mt-4">
                <button onClick={handleSavePreset} className="w-full py-2 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white">
                    Save Preset
                </button>
            </div>
        </>
    );

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
                            <button onClick={() => setIsControlsOpen(p => !p)} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-sm font-semibold" title="Toggle Controls">Controls</button>
                        </div>
                    </div>
                    {/* UPDATED: Chord Display Container */}
                    <div className="w-full flex flex-col items-center space-y-4 p-4 rounded-lg min-h-[10rem]">
                        {progressions.map((prog, progIndex) => (
                            <div key={progIndex} className="w-full flex flex-wrap justify-center items-center gap-x-4 gap-y-6">
                                {prog.map((chord, chordIndex) => (
                                    <div key={chordIndex} className="text-center flex-shrink-0 p-2 min-w-[6rem]">
                                        {settings.displayMode === 'chords' && (<div style={{ fontSize: `${settings.fontSize}rem` }} className="font-bold text-teal-300 whitespace-nowrap">{chord.name}</div>)}
                                        {settings.displayMode === 'degrees' && (<div style={{ fontSize: `${settings.fontSize}rem` }} className="font-bold text-teal-300 whitespace-nowrap">{chord.roman}</div>)}
                                        {settings.displayMode === 'both' && (
                                            <>
                                                <div style={{ fontSize: `${settings.fontSize}rem`, lineHeight: '1.1' }} className="font-bold text-teal-300 whitespace-nowrap">{chord.name}</div>
                                                <div style={{ fontSize: `${settings.fontSize * 0.6}rem` }} className="text-gray-200 mt-2 whitespace-nowrap">{chord.roman}</div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="flex items-center justify-center gap-4 my-6">
                    <label htmlFor="font-size" className="font-semibold text-lg">Font Size:</label>
                    <input type="range" id="font-size" min="1.5" max="5" step="0.1" value={settings.fontSize} onChange={(e) => setSettings(s => ({...s, fontSize: parseFloat(e.target.value)}))} className="w-1/2 max-w-xs" />
                </div>

                <div className="w-full flex justify-center my-6">
                     <button onClick={handleGenerate} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg text-xl">
                        Generate New Progression (Enter)
                    </button>
                </div>
            </div>
            
            <div className={`hidden md:block bg-slate-700 rounded-lg transition-all duration-300 ease-in-out ${isControlsOpen ? 'w-80 p-4' : 'w-0 p-0 overflow-hidden'}`}>
                <div className={`${!isControlsOpen && 'hidden'}`}>
                    <h3 className="text-xl font-bold text-teal-300 mb-4">Settings & Controls</h3>
                    <ControlsContent />
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
                            <ControlsContent />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChordProgressionGenerator;