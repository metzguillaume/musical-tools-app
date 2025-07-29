import React from 'react';
import { useTools } from '../../context/ToolsContext';
import { useNoteGenerator } from './useNoteGenerator';
import InfoModal from '../common/InfoModal';
import InfoButton from '../common/InfoButton';
import { NoteGeneratorControls } from './NoteGeneratorControls'; // Import the new controls

const NoteGenerator = () => {
    const { savePreset } = useTools();
    const {
        settings, setSettings,
        generatedNotes,
        isAutoGenerateOn, setIsAutoGenerateOn,
        autoGenerateInterval, setAutoGenerateInterval,
        isControlsOpen, setIsControlsOpen,
        isInfoModalOpen, setIsInfoModalOpen,
        countdownClicks, setCountdownClicks,
        countdownMode, setCountdownMode,
        handleLogProgress,
        generateNotes
    } = useNoteGenerator();

    const handleSavePreset = () => {
        const name = prompt("Enter a name for your preset:", `Notes - ${settings.numNotes} ${settings.noteType}`);
        if (name && name.trim() !== "") {
            const newPreset = {
                id: Date.now().toString(),
                name: name.trim(),
                gameId: 'note-generator',
                gameName: 'Note Generator',
                settings: settings,
            };
            savePreset(newPreset);
            alert(`Preset "${name.trim()}" saved!`);
        }
    };

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({...prev, [key]: value}));
    };

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
                                    style={{ fontSize: `${settings.fontSize}rem`, lineHeight: '1' }}
                                >
                                    {noteName}
                                    <sup style={{ fontSize: `${settings.fontSize * 0.6}rem`, verticalAlign: 'super', marginLeft: '0.1em' }}>
                                        {accidental}
                                    </sup>
                                </span>
                                {settings.showBarlines && (index + 1) % 4 === 0 && index < generatedNotes.length - 1 && (
                                    <div className="h-16 w-1 bg-slate-600 rounded-full mx-2" style={{height: `${settings.fontSize*1.2}rem`}}></div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                <div className="flex items-center justify-center gap-4 mt-6 mb-8">
                    <label htmlFor="font-size-main" className="font-semibold text-lg">Font Size:</label>
                    <input type="range" id="font-size-main" min="2" max="8" step="0.5" value={settings.fontSize} onChange={(e) => handleSettingChange('fontSize', e.target.value)} className="w-1/2 max-w-xs" />
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
                    <NoteGeneratorControls
                        settings={settings}
                        onSettingChange={handleSettingChange}
                        isAutoGenerateOn={isAutoGenerateOn}
                        onAutoGenerateToggle={() => setIsAutoGenerateOn(p => !p)}
                        autoGenerateInterval={autoGenerateInterval}
                        onIntervalChange={setAutoGenerateInterval}
                        countdownClicks={countdownClicks}
                        onCountdownChange={setCountdownClicks}
                        countdownMode={countdownMode}
                        onCountdownModeChange={setCountdownMode}
                        onSavePreset={handleSavePreset}
                    />
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
                           <NoteGeneratorControls
                                settings={settings}
                                onSettingChange={handleSettingChange}
                                isAutoGenerateOn={isAutoGenerateOn}
                                onAutoGenerateToggle={() => setIsAutoGenerateOn(p => !p)}
                                autoGenerateInterval={autoGenerateInterval}
                                onIntervalChange={setAutoGenerateInterval}
                                countdownClicks={countdownClicks}
                                onCountdownChange={setCountdownClicks}
                                countdownMode={countdownMode}
                                onCountdownModeChange={setCountdownMode}
                                onSavePreset={handleSavePreset}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NoteGenerator;