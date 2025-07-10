import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useTools } from '../context/ToolsContext';
import InfoModal from './InfoModal';
import InfoButton from './InfoButton';

const IntervalGenerator = () => {
    const { addLogEntry, isMetronomePlaying, setMetronomeSchedule } = useTools();

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

    const [numIntervals, setNumIntervals] = useState(1);
    const [generatedIntervals, setGeneratedIntervals] = useState([]);
    const [fontSize, setFontSize] = useState(4); 
    
    const [selectedQualities, setSelectedQualities] = useState({
        'Perfect': true,
        'Major': true,
        'Minor': true,
        'Augmented': false,
        'Diminished': false,
    });
    
    const [isAutoGenerateOn, setIsAutoGenerateOn] = useState(false);
    const [autoGenerateInterval, setAutoGenerateInterval] = useState(1);
    const [isControlsOpen, setIsControlsOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);


    const generateIntervals = useCallback(() => {
        const activeIntervals = allIntervals.filter(interval => selectedQualities[interval.quality]);

        if (activeIntervals.length === 0) {
            setGeneratedIntervals(["Select a quality"]);
            return;
        }

        let newIntervals = [];
        let lastInterval = null;
        for (let i = 0; i < numIntervals; i++) {
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
    }, [numIntervals, selectedQualities, allIntervals]);
    
    const scheduledGenerate = useCallback(() => {
        setTimeout(generateIntervals, 0);
    }, [generateIntervals]);

    useEffect(() => {
        generateIntervals();
    }, [generateIntervals]);

    useEffect(() => {
        setAutoGenerateInterval(numIntervals);
    }, [numIntervals]);

    useEffect(() => {
        if (isAutoGenerateOn && isMetronomePlaying) {
            setMetronomeSchedule({
                callback: scheduledGenerate,
                interval: autoGenerateInterval,
            });
        } else {
            setMetronomeSchedule(null);
        }
        return () => setMetronomeSchedule(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAutoGenerateOn, isMetronomePlaying, autoGenerateInterval, scheduledGenerate]);


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
        setSelectedQualities(prev => ({...prev, [quality]: !prev[quality]}));
    };

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

            <div className={`bg-slate-700 rounded-lg transition-all duration-300 ease-in-out overflow-hidden ${isControlsOpen ? 'w-full md:w-80 p-4 mt-4 md:mt-0' : 'w-full md:w-0 p-0 opacity-0 md:opacity-100'}`}>
                <div className={`${!isControlsOpen && 'hidden md:block'}`}>
                    <h3 className="text-xl font-bold text-teal-300 mb-4">Settings & Controls</h3>
                     <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <label htmlFor="num-intervals" className="font-semibold text-lg">Number of Intervals:</label>
                            <input type="number" id="num-intervals" value={numIntervals} onChange={(e) => setNumIntervals(Math.max(1, parseInt(e.target.value, 10) || 1))} className="w-24 p-2 rounded-md bg-slate-600 text-white text-center" min="1" />
                        </div>
                        
                        <div className="pt-4 border-t border-slate-600">
                            <span className="font-semibold text-lg">Include Qualities:</span>
                            <div className="flex flex-col gap-3 mt-2">
                                {Object.keys(selectedQualities).map(quality => (
                                    <label key={quality} className="flex items-center justify-between gap-2 cursor-pointer p-2 bg-slate-600 rounded-md">
                                        <span className="font-semibold">{quality}</span>
                                        <div className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={selectedQualities[quality]} onChange={() => handleQualitySelection(quality)} className="sr-only peer" />
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IntervalGenerator;