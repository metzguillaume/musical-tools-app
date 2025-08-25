import { useState, useCallback, useMemo, useEffect } from 'react';
import { useTools } from '../../context/ToolsContext';

export const useIntervalGenerator = () => {
    const { 
        addLogEntry, 
        setMetronomeSchedule, 
        countdownClicks, 
        setCountdownClicks, 
        presetToLoad,
        clearPresetToLoad
    } = useTools();
    
    const [settings, setSettings] = useState({
        numIntervals: 1,
        selectedQualities: {
            'Perfect': true, 'Major': true, 'Minor': true,
            'Augmented': false, 'Diminished': false,
        },
        useShorthand: false,
        displayMode: 'stacked',
    });

    const [generatedIntervals, setGeneratedIntervals] = useState([]);
    const [isAutoGenerateOn, setIsAutoGenerateOn] = useState(false);
    const [autoGenerateInterval, setAutoGenerateInterval] = useState(1);
    const [isControlsOpen, setIsControlsOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [fontSize, setFontSize] = useState(4); 

    useEffect(() => {
        if (presetToLoad && presetToLoad.gameId === 'interval-generator') {
            setSettings(presetToLoad.settings);
            if (presetToLoad.automation) {
                setIsAutoGenerateOn(presetToLoad.automation.isAutoGenerateOn);
                setAutoGenerateInterval(presetToLoad.automation.autoGenerateInterval);
                setCountdownClicks(presetToLoad.automation.countdownClicks);
                // The non-functional countdownMode setting is safely ignored here
            }
            if (presetToLoad.display) {
                setFontSize(presetToLoad.display.fontSize);
            }
            clearPresetToLoad();
        }
    }, [presetToLoad, clearPresetToLoad, setCountdownClicks]);

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
        if (isAutoGenerateOn) {
            setMetronomeSchedule({ callback: scheduledGenerate, interval: autoGenerateInterval });
        } else {
            setMetronomeSchedule(null);
        }

        // This cleanup function will run when you navigate away
        return () => setMetronomeSchedule(null);
    }, [isAutoGenerateOn, autoGenerateInterval, scheduledGenerate, setMetronomeSchedule]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            const targetTagName = event.target.tagName.toLowerCase();
            if (targetTagName === 'input' || targetTagName === 'textarea' || targetTagName === 'select') {
                return;
            }

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

    return {
        settings, setSettings,
        generatedIntervals,
        fontSize, setFontSize,
        isAutoGenerateOn, setIsAutoGenerateOn,
        autoGenerateInterval, setAutoGenerateInterval,
        isControlsOpen, setIsControlsOpen,
        isInfoModalOpen, setIsInfoModalOpen,
        countdownClicks, setCountdownClicks,
        generateIntervals,
        handleLogSession,
    };
};