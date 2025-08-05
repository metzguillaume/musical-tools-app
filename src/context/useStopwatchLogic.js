import { useState, useRef, useEffect, useCallback } from 'react';

export const useStopwatchLogic = () => {
    const [stopwatchTime, setStopwatchTime] = useState(0);
    const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
    const [laps, setLaps] = useState([]);
    const stopwatchIntervalRef = useRef(null);

    useEffect(() => {
        if (isStopwatchRunning) {
            stopwatchIntervalRef.current = setInterval(() => {
                setStopwatchTime(prevTime => prevTime + 10);
            }, 10);
        } else {
            clearInterval(stopwatchIntervalRef.current);
        }
        return () => clearInterval(stopwatchIntervalRef.current);
    }, [isStopwatchRunning]);

    // FIX: Wrap all returned functions in useCallback to make them stable
    const toggleStopwatch = useCallback(() => {
        setIsStopwatchRunning(p => !p);
    }, []);

    const resetStopwatch = useCallback(() => {
        setIsStopwatchRunning(false);
        setStopwatchTime(0);
        setLaps([]);
    }, []);

    const addLap = useCallback(() => {
        // Use a function update to avoid depending on stopwatchTime directly
        setLaps(prevLaps => [...prevLaps, stopwatchTime]);
    }, [stopwatchTime]); // stopwatchTime is needed here as it's the value we are capturing

    return { stopwatchTime, isStopwatchRunning, laps, toggleStopwatch, resetStopwatch, addLap };
};