import React, { useState, useEffect } from 'react';
import { useTools } from '../context/ToolsContext';

// This is the new Countdown Timer tool panel.
const Timer = () => {
    const { timeLeft, isTimerRunning, toggleTimer, resetTimer, timerDuration } = useTools();
    const [inputMinutes, setInputMinutes] = useState(timerDuration / 60);

    // Update local input when global duration changes
    useEffect(() => {
        setInputMinutes(timerDuration / 60);
    }, [timerDuration]);

    // Format time from seconds to MM:SS
    const formatTime = (sec) => {
        const minutes = Math.floor(sec / 60);
        const seconds = sec % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const handleSetTime = () => {
        const newMinutes = parseInt(inputMinutes, 10);
        if (!isNaN(newMinutes) && newMinutes > 0) {
            resetTimer(newMinutes);
        }
    };

    const isFinished = timeLeft === 0 && !isTimerRunning;

    return (
        <div className="bg-slate-700 p-4 rounded-b-lg w-full">
            <div className={`text-5xl font-mono text-center mb-4 ${isFinished ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                {isFinished ? "Time's Up!" : formatTime(timeLeft)}
            </div>
            
            <div className="flex items-center gap-2 mb-4">
                <input 
                    type="number"
                    value={inputMinutes}
                    onChange={(e) => setInputMinutes(e.target.value)}
                    className="w-full p-2 rounded-md bg-slate-600 text-white text-center"
                    min="1"
                    disabled={isTimerRunning}
                />
                <button onClick={handleSetTime} disabled={isTimerRunning} className="px-4 py-2 rounded-lg font-semibold bg-blue-600 hover:bg-blue-500 text-white disabled:bg-gray-500">Set</button>
            </div>

            <div className="flex gap-4">
                 <button
                    onClick={toggleTimer}
                    disabled={timeLeft === 0}
                    className={`w-full py-3 rounded-lg text-lg font-bold text-white disabled:bg-gray-500 ${isTimerRunning ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}
                >
                    {isTimerRunning ? 'Pause' : 'Start'}
                </button>
                <button onClick={() => resetTimer(inputMinutes)} className="w-full py-3 rounded-lg text-lg font-bold bg-gray-600 hover:bg-gray-500 text-white">
                    Reset
                </button>
            </div>
        </div>
    );
};

export default Timer;
