import { useState, useRef, useCallback, useEffect } from 'react';
import * as Tone from 'tone';

export const useTimerLogic = (unlockAudio) => {
    const [timerDuration, setTimerDuration] = useState(10 * 60);
    const [timeLeft, setTimeLeft] = useState(timerDuration);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const timerIntervalRef = useRef(null);
    const timerAlarm = useRef(null);

    useEffect(() => {
        timerAlarm.current = new Tone.Player({ url: `${process.env.PUBLIC_URL}/sounds/ding.wav`, fadeOut: 0.1 }).toDestination();
        return () => { timerAlarm.current?.dispose(); };
    }, []);

    useEffect(() => {
        if (isTimerRunning) {
            timerIntervalRef.current = setInterval(() => {
                setTimeLeft(t => {
                    if (t <= 1) {
                        clearInterval(timerIntervalRef.current);
                        setIsTimerRunning(false);
                        if (timerAlarm.current.loaded) timerAlarm.current.start();
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
    
    const resetTimer = (newDuration) => { 
        const s = (newDuration || timerDuration / 60) * 60; 
        setIsTimerRunning(false); 
        setTimerDuration(s); 
        setTimeLeft(s); 
    };

    return { timeLeft, isTimerRunning, toggleTimer, resetTimer, timerDuration };
};