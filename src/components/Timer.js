import React from 'react';
import { useTools } from '../context/ToolsContext';

// This is the Timer tool panel.
const Timer = () => {
    const { time, isTimerRunning, toggleTimer, resetTimer } = useTools();

    // Format time from seconds to MM:SS
    const formatTime = (sec) => {
        const minutes = Math.floor(sec / 60);
        const seconds = sec % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    return (
        <div className="bg-slate-700 p-4 rounded-b-lg w-full">
            <div className="text-5xl font-mono text-center text-white mb-4">
                {formatTime(time)}
            </div>
            <div className="flex gap-4">
                 <button
                    onClick={toggleTimer}
                    className={`w-full py-3 rounded-lg text-lg font-bold text-white ${isTimerRunning ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}
                >
                    {isTimerRunning ? 'Pause' : 'Start'}
                </button>
                <button onClick={resetTimer} className="w-full py-3 rounded-lg text-lg font-bold bg-gray-600 hover:bg-gray-500 text-white">
                    Reset
                </button>
            </div>
        </div>
    );
};

export default Timer;
