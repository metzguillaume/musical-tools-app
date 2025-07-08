import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useTools } from '../context/ToolsContext';

const IntervalGenerator = () => {
    // UPDATED: Get metronome state and scheduling function from ToolsContext
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

    // UPDATED: Default number of intervals is now 1
    const [numIntervals, setNumIntervals] = useState(1);
    const [generatedIntervals, setGeneratedIntervals] = useState([]);
    const [fontSize, setFontSize] = useState(4); // Increased default size for single interval display
    const [showBarlines, setShowBarlines] = useState(false); // Default to false for single intervals
    
    const [selectedQualities, setSelectedQualities] = useState({
        'Perfect': true,
        'Major': true,
        'Minor': true,
        'Augmented': false,
        'Diminished': false,
    });
    
    // UPDATED: Add state for the new auto-generate feature
    const [isAutoGenerateOn, setIsAutoGenerateOn] = useState(false);
    const [autoGenerateInterval, setAutoGenerateInterval] = useState(1);


    const generateIntervals = useCallback(() => {
        const activeIntervals = allIntervals.filter(interval => selectedQualities[interval.quality]);

        if (activeIntervals.length === 0) {
            setGeneratedIntervals(["Please select an interval quality."]);
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

    useEffect(() => {
        generateIntervals();
    }, [generateIntervals]);

    // UPDATED: This effect keeps the auto-generate interval in sync with the number of intervals
    useEffect(() => {
        setAutoGenerateInterval(numIntervals);
    }, [numIntervals]);

    // UPDATED: This effect tells the metronome what to do when auto-generate is active
    useEffect(() => {
        if (isAutoGenerateOn && isMetronomePlaying) {
            setMetronomeSchedule({
                callback: generateIntervals,
                interval: autoGenerateInterval,
            });
        } else {
            setMetronomeSchedule(null);
        }
        return () => setMetronomeSchedule(null);
    }, [isAutoGenerateOn, isMetronomePlaying, autoGenerateInterval, generateIntervals, setMetronomeSchedule]);


    const handleLogProgress = () => {
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
        <div className="flex flex-col items-center w-full">
            <h2 className="text-3xl font-extrabold mb-6 text-indigo-300">Random Interval Generator</h2>

            <div className="w-full bg-slate-800 p-6 rounded-lg text-center min-h-[150px] flex justify-center items-center flex-wrap gap-x-6 gap-y-4 mb-6">
                {generatedIntervals.map((interval, index) => (
                    <React.Fragment key={index}>
                        <span
                            className="font-bold text-teal-300"
                            style={{ fontSize: `${fontSize}rem`, lineHeight: '1.2' }}
                        >
                            {interval}
                        </span>
                        {showBarlines && (index + 1) % 4 === 0 && index < generatedIntervals.length - 1 && (
                            <div className="h-16 w-1 bg-slate-600 rounded-full mx-2" style={{height: `${fontSize*1.2}rem`}}></div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            <div className="w-full max-w-lg flex gap-4 mb-6">
                <button onClick={generateIntervals} className="flex-grow bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg text-xl">
                    Generate
                </button>
                <button onClick={handleLogProgress} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg text-xl">
                    Log Progress
                </button>
            </div>
            
            <div className="w-full max-w-lg bg-slate-700 p-4 rounded-lg flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <label htmlFor="num-intervals" className="font-semibold text-lg">Number of Intervals:</label>
                    <input type="number" id="num-intervals" value={numIntervals} onChange={(e) => setNumIntervals(Math.max(1, parseInt(e.target.value, 10) || 1))} className="w-24 p-2 rounded-md bg-slate-600 text-white text-center" min="1" />
                </div>
                 <div className="flex items-center justify-between">
                    <label htmlFor="font-size" className="font-semibold text-lg">Font Size:</label>
                    <input type="range" id="font-size" min="1.5" max="8" step="0.1" value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="w-1/2" />
                </div>
                <div className="flex items-center justify-between">
                    <label htmlFor="show-barlines" className="font-semibold text-lg">Show Barlines:</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="show-barlines" checked={showBarlines} onChange={() => setShowBarlines(p => !p)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                 <div className="pt-4 border-t border-slate-600">
                    <span className="font-semibold text-lg">Include Qualities:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                        {Object.keys(selectedQualities).map(quality => (
                             <label key={quality} className="flex items-center gap-2 cursor-pointer p-2 bg-slate-600 rounded-md">
                                <input type="checkbox" checked={selectedQualities[quality]} onChange={() => handleQualitySelection(quality)} className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                <span>{quality}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* UPDATED: Add new controls for the auto-generate feature */}
                <div className="pt-4 border-t border-slate-600 space-y-4">
                    <div className="flex items-center justify-between">
                        <label htmlFor="auto-generate-int" className="font-semibold text-lg text-teal-300">Auto-Generate with Metronome:</label>
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
    );
};

export default IntervalGenerator;