import { useState, useRef, useCallback, useEffect, useMemo } from 'react';

export const useStopwatchLogic = () => {
    const [stopwatchTime, setStopwatchTime] = useState(0);
    const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
    const [laps, setLaps] = useState([]);

    const requestRef = useRef();
    const previousTimeRef = useRef();

    // useEffect now handles the animation frame loop based on the isStopwatchRunning state.
    useEffect(() => {
        // This function will be called whenever isStopwatchRunning changes.
        
        if (isStopwatchRunning) {
            // If it's running, we start the animation loop.
            const animate = (currentTime) => {
                if (previousTimeRef.current != null) {
                    const deltaTime = currentTime - previousTimeRef.current;
                    setStopwatchTime(prevTime => prevTime + deltaTime);
                }
                previousTimeRef.current = currentTime;
                requestRef.current = requestAnimationFrame(animate);
            };

            // Set the start time for the current running interval.
            previousTimeRef.current = performance.now();
            requestRef.current = requestAnimationFrame(animate);
        } else {
            // If it's not running (i.e., paused), we cancel the animation frame.
            cancelAnimationFrame(requestRef.current);
        }

        // The cleanup function is crucial. It runs before the effect runs again,
        // or when the component unmounts. This ensures no stray timers are left running.
        return () => cancelAnimationFrame(requestRef.current);
    }, [isStopwatchRunning]); // The effect is dependent on this state variable.

    // This function is now much simpler. It just flips the state.
    const toggleStopwatch = useCallback(() => {
        setIsStopwatchRunning(prev => !prev);
    }, []);

    // Reset now also just needs to set the state. The useEffect will handle stopping the timer.
    const resetStopwatch = useCallback(() => {
        setIsStopwatchRunning(false);
        setStopwatchTime(0);
        setLaps([]);
    }, []);

    const addLap = useCallback(() => {
        if (isStopwatchRunning) {
            setLaps(prevLaps => [...prevLaps, stopwatchTime]);
        }
    }, [isStopwatchRunning, stopwatchTime]);
    
    return useMemo(() => ({
        stopwatchTime, 
        isStopwatchRunning, 
        laps, 
        toggleStopwatch, 
        resetStopwatch, 
        addLap
    }), [stopwatchTime, isStopwatchRunning, laps, toggleStopwatch, resetStopwatch, addLap]);
};