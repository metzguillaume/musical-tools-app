import { useState, useRef, useCallback, useEffect } from 'react';
// REMOVED: import * as Tone from 'tone';

export const useTimerLogic = (unlockAudio) => {
    const [timerDuration, setTimerDuration] = useState(10 * 60);
    const [timeLeft, setTimeLeft] = useState(timerDuration);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const timerIntervalRef = useRef(null);
    
    // NEW: Initialize with the standard browser Audio object
    const timerAlarm = useRef(new Audio(`${process.env.PUBLIC_URL}/sounds/ding.wav`));

    // REMOVED: The useEffect that created a Tone.Player is no longer needed.

    useEffect(() => {
        if (isTimerRunning) {
            timerIntervalRef.current = setInterval(() => {
                setTimeLeft(t => {
                    if (t <= 1) {
                        clearInterval(timerIntervalRef.current);
                        setIsTimerRunning(false);
                        
                        // NEW: Use the simple .play() method to trigger the sound
                        timerAlarm.current.play();

                        return 0;
                    }
                    return t - 1;
                });
            }, 1000);
        } else { clearInterval(timerIntervalRef.current); }
        return () => clearInterval(timerIntervalRef.current);
    }, [isTimerRunning]);

    const toggleTimer = useCallback(async () => {
        await unlockAudio();
        if (timeLeft > 0) setIsTimerRunning(p => !p);
    }, [timeLeft, unlockAudio]);
    
    const resetTimer = useCallback((newDuration) => { 
        const newDurationInSeconds = (newDuration || (timerDuration / 60)) * 60;
        setIsTimerRunning(false); 
        setTimerDuration(newDurationInSeconds); 
        setTimeLeft(newDurationInSeconds); 
    }, [timerDuration]);

    return { timeLeft, isTimerRunning, toggleTimer, resetTimer, timerDuration, setTimerDuration };
};