import React from 'react';
import { useTools } from '../../context/ToolsContext';
import { useChordProgressionGenerator } from './useChordProgressionGenerator';
import InfoModal from '../common/InfoModal';
import InfoButton from '../common/InfoButton';
import { ChordProgressionGeneratorControls } from './ChordProgressionGeneratorControls';

const rootNoteOptions = ['C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'F#', 'B', 'E', 'A', 'D', 'G'];

const ALTERNATE_SYMBOLS = {
    'm': '-',
    'maj7': '△7',
    'm7': '-7',
    'dim': '°',
    'm7b5': 'ø7',
    '7': '7'
};

/**
 * FINAL VERSION: Uses precise relative/absolute positioning for perfect, consistent alignment.
 */
const ChordDisplay = ({ name, fontSize, useAlternateNotation }) => {
    const match = name.match(/^([A-G])([#b]?)(.*)/);
    if (!match) {
        return <div style={{ fontSize: `${fontSize}rem` }} className="font-bold text-teal-300 whitespace-nowrap">{name}</div>;
    }
    
    let [, root, accidental, quality] = match;

    if (accidental === '#') accidental = '♯';
    if (accidental === 'b') accidental = '♭';

    if (useAlternateNotation && ALTERNATE_SYMBOLS[quality]) {
        quality = ALTERNATE_SYMBOLS[quality];
    }
    
    return (
        <span 
            style={{ fontSize: `${fontSize}rem` }} 
            className="font-bold text-teal-300 whitespace-nowrap inline-flex items-baseline"
        >
            <span>{root}</span>
            <span 
                className="relative"
                style={{ marginLeft: '0.1em', display: 'inline-block' }}
            >
                {/* The quality provides the baseline. It now has a small margin to prevent overlap. */}
                <span 
                    style={{ 
                        fontSize: `${fontSize * 0.7}rem`, 
                        marginLeft: accidental ? `${fontSize * 0.25}rem` : '0' 
                    }}
                >
                    {/* Render an invisible placeholder if quality is empty to maintain alignment */}
                    {quality || <span className="opacity-0">&nbsp;</span>}
                </span>

                {/* The accidental is positioned absolutely within the container */}
                <span 
                    className="absolute left-0"
                    style={{
                        fontSize: `${fontSize * 0.6}rem`,
                        // This position is now stable regardless of whether 'quality' exists
                        bottom: `${fontSize * 0.45}rem`,
                    }}
                >
                    {accidental}
                </span>
            </span>
        </span>
    );
};


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
            const newPreset = { id: Date.now().toString(), name: name.trim(), gameId: 'chord-progression-generator', gameName: 'Chord Progression Generator', settings: settings, };
            savePreset(newPreset);
            alert(`Preset "${name.trim()}" saved!`);
        }
    };

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({...prev, [key]: value}));
    };

    const handleQualityFilterChange = (filter) => {
        setSettings(s => ({ ...s, qualityFilter: filter, useCommonPatterns: filter !== 'all' ? false : s.useCommonPatterns, }));
    };

    const handleRandomRootNote = () => {
        let newRootNote;
        do {
            newRootNote = rootNoteOptions[Math.floor(Math.random() * rootNoteOptions.length)];
        } while (newRootNote === settings.rootNote && rootNoteOptions.length > 1);
        handleSettingChange('rootNote', newRootNote);
    };

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
                        </ul>
                    </div>
                </div>
            </InfoModal>

            <div className="w-full flex-1 flex flex-col">
                <div className="bg-slate-800 p-4 rounded-lg">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                        <div className="flex-1"></div>
                        <div className="flex-1 flex justify-center items-center gap-2"><h2 className="text-2xl text-center font-bold text-indigo-300">Chord Progression Generator</h2><InfoButton onClick={() => setIsInfoModalOpen(true)} /></div>
                        <div className="flex-1 flex justify-end items-center gap-2"><button onClick={handleLogSession} className="bg-green-600 hover:bg-green-500 text-white font-bold py-1 px-3 rounded-lg text-sm">Log Session</button><button onClick={() => setIsControlsOpen(p => !p)} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-sm font-semibold" title="Toggle Controls">Controls</button></div>
                    </div>

                    <div className="w-full flex flex-col items-center space-y-4 p-4 rounded-lg min-h-[10rem]">
                        {progressions.map((prog, progIndex) => (
                            <div key={progIndex} className="w-full flex flex-wrap justify-center items-center gap-x-8 gap-y-6">
                                {prog.map((chord, chordIndex) => {
                                    // THIS IS THE FIX: Choose which name to display
                                    const chordName = settings.chordComplexity === 'Tetrads' ? chord.tetradName : chord.name;
                                    
                                    return (
                                        <div key={chordIndex} className="text-center flex-shrink-0 p-2 min-w-[6rem]">
                                            {(settings.displayMode === 'chords' || settings.displayMode === 'both') && (
                                                <ChordDisplay name={chordName} fontSize={settings.fontSize} useAlternateNotation={settings.useAlternateNotation} />
                                            )}
                                            {(settings.displayMode === 'degrees' || settings.displayMode === 'both') && (
                                                <div style={{ fontSize: `${settings.displayMode === 'both' ? settings.fontSize * 0.6 : settings.fontSize}rem` }} className={`whitespace-nowrap ${settings.displayMode === 'both' ? 'text-gray-200 mt-2' : 'font-bold text-teal-300'}`}>
                                                    {chord.roman}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="flex items-center justify-center gap-4 my-6">
                    <label htmlFor="font-size" className="font-semibold text-lg">Font Size:</label>
                    <input type="range" id="font-size" min="1.5" max="5" step="0.1" value={settings.fontSize} onChange={(e) => handleSettingChange('fontSize', parseFloat(e.target.value))} className="w-1/2 max-w-xs" />
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
                    <ChordProgressionGeneratorControls
                        settings={settings}
                        onSettingChange={handleSettingChange}
                        onQualityFilterChange={handleQualityFilterChange}
                        onRandomRootNote={handleRandomRootNote}
                        isAutoGenerateOn={isAutoGenerateOn}
                        onAutoGenerateToggle={() => setIsAutoGenerateOn(p => !p)}
                        autoGenerateInterval={autoGenerateInterval}
                        onIntervalChange={setAutoGenerateInterval}
                        countdownClicks={countdownClicks}
                        onCountdownChange={setCountdownClicks}
                        openSections={openSections}
                        onToggleSection={toggleSection}
                        onSavePreset={handleSavePreset}
                    />
                </div>
            </div>

            {isControlsOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex justify-center items-center bg-black/60" onClick={() => setIsControlsOpen(false)}>
                    <div className="w-11/12 max-w-sm bg-slate-800 rounded-2xl p-4 max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex-shrink-0 flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-teal-300">Settings & Controls</h3><button onClick={() => setIsControlsOpen(false)} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button></div>
                        <div className="flex-grow overflow-y-auto pr-2">
                           <ChordProgressionGeneratorControls
                                settings={settings}
                                onSettingChange={handleSettingChange}
                                onQualityFilterChange={handleQualityFilterChange}
                                onRandomRootNote={handleRandomRootNote}
                                isAutoGenerateOn={isAutoGenerateOn}
                                onAutoGenerateToggle={() => setIsAutoGenerateOn(p => !p)}
                                autoGenerateInterval={autoGenerateInterval}
                                onIntervalChange={setAutoGenerateInterval}
                                countdownClicks={countdownClicks}
                                onCountdownChange={setCountdownClicks}
                                openSections={openSections}
                                onToggleSection={toggleSection}
                                onSavePreset={handleSavePreset}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChordProgressionGenerator;