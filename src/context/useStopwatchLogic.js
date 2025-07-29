import { useState, useRef, useEffect } from 'react';

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

    const toggleStopwatch = () => setIsStopwatchRunning(p => !p);
    const resetStopwatch = () => { setIsStopwatchRunning(false); setStopwatchTime(0); setLaps([]); };
    const addLap = () => setLaps(prevLaps => [...prevLaps, stopwatchTime]);

    return { stopwatchTime, isStopwatchRunning, laps, toggleStopwatch, resetStopwatch, addLap };
};