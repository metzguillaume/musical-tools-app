// src/components/noteGenerator/NoteGenerator.js

import React, { useCallback } from 'react';
import { useTools } from '../../context/ToolsContext';
import { useNoteGenerator } from './useNoteGenerator';
import InfoModal from '../common/InfoModal';
import InfoButton from '../common/InfoButton';
import { NoteGeneratorControls } from './NoteGeneratorControls';

const chunkArray = (arr, size) => {
    const chunkedArr = [];
    if (size <= 0) return [arr];
    for (let i = 0; i < arr.length; i += size) {
        chunkedArr.push(arr.slice(i, i + size));
    }
    return chunkedArr;
};

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
        handleLogProgress,
        generateNotes
    } = useNoteGenerator();

    const handleSettingChange = useCallback((key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    }, [setSettings]);

    const handleSliderChange = (e) => {
        handleSettingChange('fontSize', e.target.value);
    };

    const handleSavePreset = () => {
        const name = prompt("Enter a name for your preset:", `Notes - ${settings.numNotes} ${settings.noteType}`);
        if (name && name.trim() !== "") {
            const newPreset = {
                id: Date.now().toString(), name: name.trim(),
                gameId: 'note-generator', gameName: 'Note Generator',
                settings: settings,
                automation: { isAutoGenerateOn,  autoGenerateInterval, countdownClicks }
            };
            savePreset(newPreset);
            alert(`Preset "${name.trim()}" saved!`);
        }
    };

    const renderNote = (note, index) => {
        const noteName = note.charAt(0);
        const accidental = note.substring(1).replace(/#/g, '♯').replace(/b/g, '♭');
        return (
            <span key={index} className="font-bold text-teal-300 whitespace-nowrap transition-all duration-150">
                {noteName}
                <sup style={{ fontSize: '0.6em', verticalAlign: 'super', marginLeft: '0.1em' }}>
                    {accidental}
                </sup>
            </span>
        );
    };
    
    return (
        <div className="flex flex-col md:flex-row items-start w-full gap-4">
            {/* --- REPLACE THE CURRENT InfoModal WITH THIS ONE --- */}
             <InfoModal
                isOpen={isInfoModalOpen}
                onClose={() => setIsInfoModalOpen(false)}
                title="Random Note Generator Guide"
            >
                <div className="space-y-4 text-sm">
                    <p>
                        The Note Generator lets you generate a sequence of random notes. Use the controls to customize the output for your practice needs.
                    </p>
                    <div>
                        <h4 className="font-bold text-indigo-300 mb-2">Controls Explained</h4>
                        <ul className="list-disc list-inside space-y-2">
                            <li>
                                <strong>Number of Notes</strong>: Sets the total number of notes in the generated sequence.
                            </li>
                            <li>
                                <strong>Note Type</strong>: Choose "Natural" to only generate notes from A to G, or "Chromatic" to include all sharp and flat notes.
                            </li>
                             <li>
                                <strong>Avoid Repeats</strong>: When enabled, this prevents the same note from appearing twice in a row, which is useful for creating more varied sequences.
                            </li>
                            <li>
                                <strong>Display Mode</strong>:
                                <ul className="list-['-_'] list-inside pl-4 mt-1">
                                    <li><strong>Flow</strong>: Displays notes in a simple, wrapping line. You can set a bar line to appear every "X" notes.</li>
                                    <li><strong>Measures</strong>: Arranges notes in a grid that mimics sheet music. You can set both the "Notes per Bar" and "Bars per Line".</li>
                                </ul>
                            </li>
                            <li>
                                <strong>Auto-Generate</strong>: Links the generator to the global Metronome. A new sequence will be generated automatically based on the "Every X clicks" and "Countdown" settings.
                            </li>
                        </ul>
                    </div>
                </div>
            </InfoModal>

            <div className="w-full flex-1 bg-slate-800 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex-1"></div>
                    <div className="flex-1 flex justify-center items-center gap-2">
                        <h1 className="text-xl md:text-2xl text-center font-bold text-indigo-300">
                            Random Note Generator
                        </h1>
                        <InfoButton onClick={() => setIsInfoModalOpen(true)} />
                    </div>
                    <div className="flex-1 flex justify-end items-center gap-2">
                        <button
                            onClick={handleLogProgress}
                            className="bg-green-600 hover:bg-green-500 text-white font-bold py-1 px-3 rounded-lg text-sm"
                        >
                            Log Session
                        </button>
                        <button
                            onClick={() => setIsControlsOpen(p => !p)}
                            className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-sm font-semibold"
                        >
                            Controls
                        </button>
                    </div>
                </div>

                <div
                    className="w-full rounded-lg text-center min-h-[160px] flex justify-center items-center"
                    style={{
                        padding: '1.5rem',
                        fontSize: `${settings.fontSize}rem`,
                        lineHeight: 1
                    }}
                >
                    {settings.displayMode === 'measure' ? (
                        <div className="w-full flex flex-col items-center gap-y-6">
                            {chunkArray(chunkArray(generatedNotes, settings.notesPerBar), settings.barsPerLine).map((line, lineIndex) => (
                                <div key={lineIndex} className="w-full flex justify-center items-center">
                                    {line.map((bar, barIndex) => (
                                        <React.Fragment key={barIndex}>
                                            {barIndex > 0 && <div className="w-px h-16 bg-slate-500 self-center" />}
                                            <div className="flex-1 flex justify-around items-center p-2">
                                                {bar.map(renderNote)}
                                            </div>
                                        </React.Fragment>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex justify-center items-center flex-wrap" style={{ columnGap: '0.6em', rowGap: '0.3em' }}>
                            {generatedNotes.map((note, index) => (
                                <React.Fragment key={index}>
                                    {renderNote(note, index)}
                                    {settings.barlineFrequency > 0 && (index + 1) % settings.barlineFrequency === 0 && index < generatedNotes.length - 1 && (
                                         <div
                                            style={{
                                                width: '0.10em',
                                                height: '1.2em',
                                                backgroundColor: 'rgb(71 85 105)',
                                                borderRadius: '9999px',
                                                marginLeft: '0.4em',
                                                marginRight: '0.4em'
                                            }}
                                        />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                </div>


                <div className="flex items-center justify-center gap-2 md:gap-4 mt-6 mb-8">
                    <label htmlFor="font-size-main" className="font-semibold text-lg">Font Size:</label>
                    <input
                        type="range"
                        id="font-size-main"
                        min="2" max="8" step="0.1"
                        value={settings.fontSize}
                        onChange={handleSliderChange}
                        className="w-1/2 max-w-xs"
                    />
                </div>

                <div className="w-full flex justify-center">
                    <button
                        onClick={generateNotes}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg text-xl"
                    >
                        Generate (Enter/Space)
                    </button>
                </div>
            </div>

            <div className={`hidden md:block bg-slate-700 rounded-lg transition-all duration-300 ease-in-out sticky top-6 max-h-[calc(100vh-3rem)] ${
                isControlsOpen ? 'w-80 p-4 overflow-y-auto' : 'w-0 p-0 overflow-hidden'
            }`}>
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
                        onSavePreset={handleSavePreset}
                    />
                </div>
            </div>

            {isControlsOpen && (
                <div
                    className="md:hidden fixed inset-0 z-50 flex justify-center items-center bg-black/60"
                    onClick={() => setIsControlsOpen(false)}
                >
                    <div
                        className="w-11/12 max-w-sm bg-slate-800 rounded-2xl p-4 max-h-[85vh] flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex-shrink-0 flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-teal-300">Settings & Controls</h3>
                            <button
                                onClick={() => setIsControlsOpen(false)}
                                className="text-gray-400 hover:text-white text-2xl font-bold"
                            >
                                &times;
                            </button>
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