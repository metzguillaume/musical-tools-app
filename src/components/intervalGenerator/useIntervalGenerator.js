import { useState, useCallback, useMemo, useEffect } from 'react';
import { useTools } from '../../context/ToolsContext';

export const useIntervalGenerator = () => {
    const { addLogEntry, setMetronomeSchedule, countdownClicks, setCountdownClicks, countdownMode, setCountdownMode } = useTools();
    
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
        'Perfect': true, 'Major': true, 'Minor': true, 'Augmented': false, 'Diminished': false,
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
        if (isAutoGenerateOn) {
            setMetronomeSchedule({ callback: scheduledGenerate, interval: autoGenerateInterval });
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
                game: 'Interval Generator', bpm: 'N/A',
                date: new Date().toLocaleDateString(), remarks: remarks || "No remarks."
            });
            alert("Session logged!");
        }
    };
    
    const handleQualitySelection = (quality) => {
        setSelectedQualities(prev => ({...prev, [quality]: !prev[quality]}));
    };

    return {
        numIntervals, setNumIntervals,
        generatedIntervals,
        fontSize, setFontSize,
        selectedQualities, handleQualitySelection,
        isAutoGenerateOn, setIsAutoGenerateOn,
        autoGenerateInterval, setAutoGenerateInterval,
        isControlsOpen, setIsControlsOpen,
        isInfoModalOpen, setIsInfoModalOpen,
        countdownClicks, setCountdownClicks,
        countdownMode, setCountdownMode,
        generateIntervals,
        handleLogSession,
    };
};