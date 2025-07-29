import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useTools } from '../../context/ToolsContext';
import InfoModal from '../common/InfoModal';
import InfoButton from '../common/InfoButton';
import { IntervalGeneratorControls } from './IntervalGeneratorControls';

// A mapping for the new shorthand feature
const INTERVAL_SHORTHAND = {
    'Perfect Unison': 'P1', 'Minor 2nd': 'm2', 'Major 2nd': 'M2',
    'Minor 3rd': 'm3', 'Major 3rd': 'M3', 'Perfect 4th': 'P4',
    'Augmented 4th': 'A4', 'Diminished 5th': 'd5', 'Perfect 5th': 'P5',
    'Minor 6th': 'm6', 'Major 6th': 'M6', 'Minor 7th': 'm7',
    'Major 7th': 'M7', 'Perfect Octave': 'P8'
};

const IntervalGenerator = () => {
    const { addLogEntry, setMetronomeSchedule, countdownClicks, setCountdownClicks, countdownMode, setCountdownMode, savePreset, presetToLoad, clearPresetToLoad } = useTools();
    
    // Add new display options to the settings state
    const [settings, setSettings] = useState({
        numIntervals: 1,
        selectedQualities: {
            'Perfect': true,
            'Major': true,
            'Minor': true,
            'Augmented': false,
            'Diminished': false,
        },
        useShorthand: false,
        displayMode: 'stacked',
    });

    // Non-preset state
    const [generatedIntervals, setGeneratedIntervals] = useState([]);
    const [fontSize, setFontSize] = useState(4); 
    const [isAutoGenerateOn, setIsAutoGenerateOn] = useState(false);
    const [autoGenerateInterval, setAutoGenerateInterval] = useState(1);
    const [isControlsOpen, setIsControlsOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    
    useEffect(() => {
        if (presetToLoad && presetToLoad.gameId === 'interval-generator') {
            setSettings(presetToLoad.settings);
            clearPresetToLoad();
        }
    }, [presetToLoad, clearPresetToLoad]);

    const handleSavePreset = () => {
        const qualities = Object.keys(settings.selectedQualities).filter(q => settings.selectedQualities[q]).join('/');
        const name = prompt("Enter a name for your preset:", `Intervals - ${qualities}`);
        if (name && name.trim() !== "") {
            const newPreset = {
                id: Date.now().toString(),
                name: name.trim(),
                gameId: 'interval-generator',
                gameName: 'Interval Generator',
                settings: settings,
            };
            savePreset(newPreset);
            alert(`Preset "${name.trim()}" saved!`);
        }
    };

    const intervalData = useMemo(() => ({
        "Unison/Octave": [{ name: 'Perfect Unison', quality: 'Perfect'}, { name: 'Perfect Octave', quality: 'Perfect'}],
        "2nd": [{ name: 'Minor 2nd', quality: 'Minor' }, { name: 'Major 2nd', quality: 'Major' }],
        "3rd": [{ name: 'Minor 3rd', quality: 'Minor' }, { name: 'Major 3rd', quality: 'Major' }],
        "4th": [{ name: 'Perfect 4th', quality: 'Perfect' }, { name: 'Augmented 4th', quality: 'Augmented' }],
        "5th": [{ name: 'Diminished 5th', quality: 'Diminished' }, { name: 'Perfect 5th', quality: 'Perfect' }],
        "6th": [{ name: 'Minor 6th', quality: 'Minor' }, { name: 'Major 6th', quality: 'Major' }],
        "7th": [{ name: 'Minor 7th', quality: 'Minor' }, { name: 'Major 7th', quality: 'Major' }],
    }), []);

    const allIntervals = useMemo(() => Object.values(intervalData).flat(), [intervalData]);

    const generateIntervals = useCallback(() => {
        const activeIntervals = allIntervals.filter(interval => settings.selectedQualities[interval.quality]);
        if (activeIntervals.length === 0) {
            setGeneratedIntervals(["Select a quality"]);
            return;
        }
        let newIntervals = [];
        let lastInterval = null;
        for (let i = 0; i < settings.numIntervals; i++) {
            let interval;
            let attempts = 0;
            do {
                interval = activeIntervals[Math.floor(Math.random() * activeIntervals.length)];
                attempts++;
            } while (interval.name === lastInterval && activeIntervals.length > 1 && attempts < 20);
            
            newIntervals.push(interval.name);
            lastInterval = interval.name;
        }
        setGeneratedIntervals(newIntervals);
    }, [settings.numIntervals, settings.selectedQualities, allIntervals]);
    
    const scheduledGenerate = useCallback(() => {
        setTimeout(generateIntervals, 0);
    }, [generateIntervals]);

    useEffect(() => {
        generateIntervals();
    }, [generateIntervals]);

    useEffect(() => {
        setAutoGenerateInterval(settings.numIntervals);
    }, [settings.numIntervals]);

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
                generateIntervals();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [generateIntervals]);

    const handleLogSession = () => {
        const remarks = prompt("Enter any remarks for this session:", "Practiced random intervals.");
        if (remarks !== null) {
            addLogEntry({
                game: 'Interval Generator',
                bpm: 'N/A',
                date: new Date().toLocaleDateString(),
                remarks: remarks || "No remarks."
            });
            alert("Session logged!");
        }
    };
    
    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="flex flex-col md:flex-row items-start w-full gap-4">
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Random Interval Generator Guide">
                <div className="space-y-4 text-sm">
                    <p>This tool generates random musical intervals to help train your ear and theoretical knowledge.</p>
                    <div><h4 className="font-bold text-indigo-300 mb-1">How It Works</h4><p>Use the "Generate" button or press the Enter/Space key to get a new interval. You can select which interval qualities (Major, Minor, etc.) you want to include in the randomization from the controls panel.</p></div>
                    <div><h4 className="font-bold text-indigo-300 mb-1">Features</h4>
                        <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                            <li><strong className="text-teal-300">Multiple Intervals:</strong> Choose to generate more than one interval at a time for a longer practice sequence.</li>
                            <li><strong className="text-teal-300">Display Options:</strong> Use the controls to switch between full names and shorthand (e.g., P4, M3), and display them stacked or in a single line.</li>
                            <li><strong className="text-teal-300">Auto-Generate:</strong> For continuous practice, enable this feature to get a new interval automatically in time with the metronome.</li>
                        </ul>
                    </div>
                </div>
            </InfoModal>

            <div className="w-full flex-1 bg-slate-800 p-4 rounded-lg">
                 <div className="flex justify-between items-center mb-4">
                    <div className="flex-1"></div>
                    <div className="flex-1 flex justify-center items-center gap-2">
                         <h1 className="text-xl md:text-2xl text-center font-bold text-indigo-300">Random Interval Generator</h1>
                        <InfoButton onClick={() => setIsInfoModalOpen(true)} />
                    </div>
                    <div className="flex-1 flex justify-end items-center gap-2">
                        <button onClick={handleLogSession} className="bg-green-600 hover:bg-green-500 text-white font-bold py-1 px-3 rounded-lg text-sm">Log Session</button>
                        <button onClick={() => setIsControlsOpen(p => !p)} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-sm font-semibold">Controls</button>
                    </div>
                </div>

                <div className={`w-full p-6 rounded-lg text-center min-h-[150px] flex justify-center items-center gap-y-4 ${
                    settings.useShorthand && settings.displayMode === 'single-line' 
                    ? 'flex-row flex-wrap gap-x-8' 
                    : 'flex-col'
                }`}>
                    {generatedIntervals.map((interval, index) => (
                        <span
                            key={index}
                            className="font-bold text-teal-300"
                            style={{ fontSize: `${fontSize}rem`, lineHeight: '1.2' }}
                        >
                            {settings.useShorthand ? INTERVAL_SHORTHAND[interval] || interval : interval}
                        </span>
                    ))}
                </div>

                <div className="flex items-center justify-center gap-4 mt-6 mb-8">
                    <label htmlFor="font-size" className="font-semibold text-lg">Font Size:</label>
                    <input type="range" id="font-size" min="1.5" max="8" step="0.1" value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="w-1/2 max-w-xs" />
                </div>

                <div className="w-full flex justify-center">
                    <button onClick={generateIntervals} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg text-xl">
                        Generate (Enter/Space)
                    </button>
                </div>
            </div>

            <div className={`hidden md:block bg-slate-700 rounded-lg transition-all duration-300 ease-in-out ${isControlsOpen ? 'w-80 p-4' : 'w-0 p-0 overflow-hidden'}`}>
                <div className={`${!isControlsOpen && 'hidden'}`}>
                    <h3 className="text-xl font-bold text-teal-300 mb-4">Settings & Controls</h3>
                     <IntervalGeneratorControls
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
                           <IntervalGeneratorControls
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

export default IntervalGenerator;