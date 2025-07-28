import React from 'react';
import { useTools } from '../../context/ToolsContext';

// This is the new Stopwatch tool panel.
const Stopwatch = () => {
    const { stopwatchTime, isStopwatchRunning, laps, toggleStopwatch, resetStopwatch, addLap } = useTools();

    // Format time from milliseconds to MM:SS.ss
    const formatTime = (ms) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const milliseconds = Math.floor((ms % 1000) / 10);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
    };

    return (
        <div className="bg-slate-700 p-4 rounded-b-lg w-full">
            <div className="text-4xl font-mono text-center text-white mb-4">
                {formatTime(stopwatchTime)}
            </div>
            <div className="flex gap-2 mb-2">
                 <button
                    onClick={toggleStopwatch}
                    className={`w-full py-2 rounded-lg text-lg font-bold text-white ${isStopwatchRunning ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}
                >
                    {isStopwatchRunning ? 'Pause' : 'Start'}
                </button>
                <button onClick={addLap} disabled={!isStopwatchRunning} className="w-full py-2 rounded-lg text-lg font-bold bg-blue-600 hover:bg-blue-500 text-white disabled:bg-gray-500 disabled:cursor-not-allowed">
                    Lap
                </button>
            </div>
             <button onClick={resetStopwatch} className="w-full py-2 rounded-lg text-lg font-bold bg-gray-600 hover:bg-gray-500 text-white">
                    Reset
            </button>
            {laps.length > 0 && (
                <div className="mt-4 border-t border-slate-600 pt-2 max-h-24 overflow-y-auto">
                    <ul className="text-gray-300 text-center">
                        {laps.map((lap, index) => (
                            <li key={index} className="flex justify-between px-2">
                                <span>Lap {index + 1}</span>
                                <span>{formatTime(lap)}</span>
                            </li>
                        )).reverse()}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Stopwatch;
