import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useTools } from '../../context/ToolsContext';
import InfoModal from '../common/InfoModal';
import InfoButton from '../common/InfoButton';

const IntervalGenerator = () => {
    const { addLogEntry, setMetronomeSchedule, countdownClicks, setCountdownClicks, countdownMode, setCountdownMode, savePreset, presetToLoad, clearPresetToLoad } = useTools();
    
    const [settings, setSettings] = useState({
        numIntervals: 1,
        selectedQualities: {
            'Perfect': true,
            'Major': true,
            'Minor': true,
            'Augmented': false,
            'Diminished': false,
        },
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
    
    const handleQualitySelection = (quality) => {
        setSettings(prev => ({
            ...prev,
            selectedQualities: {
                ...prev.selectedQualities,
                [quality]: !prev.selectedQualities[quality]
            }
        }));
    };

    const ControlsContent = (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <label htmlFor="num-intervals" className="font-semibold text-lg">Number of Intervals:</label>
                <input type="number" id="num-intervals" value={settings.numIntervals} onChange={(e) => setSettings(s => ({ ...s, numIntervals: Math.max(1, parseInt(e.target.value, 10) || 1) }))} className="w-24 p-2 rounded-md bg-slate-600 text-white text-center" min="1" />
            </div>
            
            <div className="pt-4 border-t border-slate-600">
                <span className="font-semibold text-lg">Include Qualities:</span>
                <div className="flex flex-col gap-3 mt-2">
                    {Object.keys(settings.selectedQualities).map(quality => (
                        <label key={quality} className="flex items-center justify-between gap-2 cursor-pointer p-2 bg-slate-600 rounded-md">
                            <span className="font-semibold">{quality}</span>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={settings.selectedQualities[quality]} onChange={() => handleQualitySelection(quality)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            <div className="pt-4 border-t border-slate-600 space-y-4">
                <div className="flex items-center justify-between">
                    <label htmlFor="auto-generate-int" className="font-semibold text-lg text-teal-300">Auto-Generate:</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="auto-generate-int" checked={isAutoGenerateOn} onChange={() => setIsAutoGenerateOn(p => !p)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                </div>
                <div className="flex items-center justify-between">
                    <label htmlFor="auto-generate-interval-int" className={`font-semibold text-lg ${!isAutoGenerateOn && 'opacity-50'}`}>Generate every:</label>
                    <div className="flex items-center gap-2">
                        <input type="number" id="auto-generate-interval-int" value={autoGenerateInterval} onChange={(e) => setAutoGenerateInterval(Math.max(1, parseInt(e.target.value, 10) || 1))} className={`w-24 p-2 rounded-md bg-slate-600 text-white text-center ${!isAutoGenerateOn && 'opacity-50'}`} min="1" disabled={!isAutoGenerateOn} />
                        <span className={`font-semibold text-lg ${!isAutoGenerateOn && 'opacity-50'}`}>clicks</span>
                    </div>
                </div>
                 <div className="flex items-center justify-between">
                    <label htmlFor="countdown-clicks-int" className={`font-semibold text-lg ${!isAutoGenerateOn && 'opacity-50'}`}>Countdown:</label>
                    <div className="flex items-center gap-2">
                        <input type="number" id="countdown-clicks-int" value={countdownClicks} onChange={(e) => setCountdownClicks(Math.max(0, parseInt(e.target.value, 10) || 0))} className={`w-24 p-2 rounded-md bg-slate-600 text-white text-center ${!isAutoGenerateOn && 'opacity-50'}`} min="0" max="7" disabled={!isAutoGenerateOn} />
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
            <div className="border-t border-slate-600 pt-4 mt-4">
                <button onClick={handleSavePreset} className="w-full py-2 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white">
                    Save Preset
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col md:flex-row items-start w-full gap-4">
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Random Interval Generator Guide">
                <div className="space-y-4 text-sm">
                    <p>This tool generates random musical intervals to help train your ear and theoretical knowledge.</p>
                    <div><h4 className="font-bold text-indigo-300 mb-1">How It Works</h4><p>Use the "Generate" button or press the Enter/Space key to get a new interval. You can select which interval qualities (Major, Minor, etc.) you want to include in the randomization from the controls panel.</p></div>
                    <div><h4 className="font-bold text-indigo-300 mb-1">Features</h4>
                        <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                            <li><strong className="text-teal-300">Multiple Intervals:</strong> Choose to generate more than one interval at a time for a longer practice sequence. They will appear stacked vertically.</li>
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

                <div className="w-full p-6 rounded-lg text-center min-h-[150px] flex flex-col justify-center items-center gap-y-4">
                    {generatedIntervals.map((interval, index) => (
                        <span
                            key={index}
                            className="font-bold text-teal-300"
                            style={{ fontSize: `${fontSize}rem`, lineHeight: '1.2' }}
                        >
                            {interval}
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

export default IntervalGenerator;