import React, { useCallback } from 'react';
import { useTools } from '../../context/ToolsContext';
import { useNoteGenerator } from './useNoteGenerator';
import InfoModal from '../common/InfoModal';
import InfoButton from '../common/InfoButton';
import { NoteGeneratorControls } from './NoteGeneratorControls';

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
                settings: settings, // The entire settings object, including fontSize, is saved
                automation: { isAutoGenerateOn, autoGenerateInterval, countdownClicks, countdownMode }
            };
            savePreset(newPreset);
            alert(`Preset "${name.trim()}" saved!`);
        }
    };

    return (
        <div className="flex flex-col md:flex-row items-start w-full gap-4">
            <InfoModal
                isOpen={isInfoModalOpen}
                onClose={() => setIsInfoModalOpen(false)}
                title="Random Note Generator Guide"
            >
                <p className="mb-3">
                    The <strong>Random Note Generator</strong> helps you practice note recognition by generating a sequence of random notes.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>
                        <strong>Generate</strong>: Click the blue button or press <kbd>Enter</kbd>/<kbd>Space</kbd> to create a new sequence of notes.
                    </li>
                    <li>
                        <strong>Font Size</strong>: Adjust the note size manually with the slider. This setting is saved with your presets.
                    </li>
                    <li>
                        <strong>Controls Panel</strong>: Use this panel to configure all other settings for the generator.
                    </li>
                    <li>
                        <strong>Log Session</strong>: Records your practice session for later review.
                    </li>
                    <li>
                        <strong>Save Preset</strong>: Store your preferred configuration and quickly load it later.
                    </li>
                </ul>
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
                    className="w-full rounded-lg text-center min-h-[160px] flex justify-center items-center flex-wrap"
                    style={{
                        columnGap: '0.6em',
                        rowGap: '0.3em',
                        padding: '1.5rem',
                        fontSize: `${settings.fontSize}rem`,
                        lineHeight: 1
                    }}
                >
                    {generatedNotes.map((note, index) => {
                        const noteName = note.charAt(0);
                        const accidental = note.substring(1).replace(/#/g, '♯').replace(/b/g, '♭');
                        const showBar =
                            settings.showBarlines &&
                            settings.barlineFrequency > 0 &&
                            (index + 1) % settings.barlineFrequency === 0 &&
                            index < generatedNotes.length - 1;

                        return (
                            <React.Fragment key={index}>
                                <span className="font-bold text-teal-300 whitespace-nowrap transition-all duration-150">
                                    {noteName}
                                    <sup style={{ fontSize: '0.6em', verticalAlign: 'super', marginLeft: '0.1em' }}>
                                        {accidental}
                                    </sup>
                                </span>

                                {showBar && (
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
                        );
                    })}
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

            {/* Side controls */}
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
                        countdownMode={countdownMode}
                        onCountdownModeChange={setCountdownMode}
                        onSavePreset={handleSavePreset}
                    />
                </div>
            </div>

            {/* Mobile controls modal */}
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