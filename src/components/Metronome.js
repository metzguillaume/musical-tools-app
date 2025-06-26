import React from 'react';
import { useTools } from '../context/ToolsContext';

// This is the Metronome tool panel. It no longer controls its own visibility.
const Metronome = () => {
    const { bpm, setBpm, isMetronomePlaying, toggleMetronome } = useTools();

    return (
        <div className="bg-slate-700 p-4 rounded-b-lg w-full">
            <div className="mb-4">
                <label htmlFor="bpm" className="block text-gray-200 text-lg font-semibold mb-2">
                    BPM: {bpm}
                </label>
                <input
                    type="range"
                    id="bpm"
                    min="40"
                    max="240"
                    value={bpm}
                    onChange={(e) => setBpm(Number(e.target.value))}
                    className="w-full h-3 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
            </div>
            <button
                onClick={toggleMetronome}
                className={`w-full py-3 rounded-lg text-lg font-bold text-white ${isMetronomePlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
                {isMetronomePlaying ? 'Stop' : 'Start'}
            </button>
        </div>
    );
};

export default Metronome;
