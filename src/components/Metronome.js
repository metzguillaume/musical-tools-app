import React from 'react';
import { useTools } from '../context/ToolsContext';

// This is the Metronome tool panel.
const Metronome = () => {
    const { bpm, setBpm, isMetronomePlaying, toggleMetronome, metronomeVolume, setMetronomeVolume } = useTools();

    const handleBpmInputChange = (e) => {
        const value = e.target.value;
        // Allow empty input for typing, but set a valid number on blur or if invalid
        if (value === '' || (value >= 40 && value <= 240)) {
            setBpm(value);
        }
    };

    const handleBpmInputBlur = (e) => {
        let value = parseInt(e.target.value, 10);
        if (isNaN(value) || value < 40) {
            setBpm(40);
        } else if (value > 240) {
            setBpm(240);
        }
    };

    return (
        <div className="bg-slate-700 p-4 rounded-b-lg w-full">
            {/* BPM Controls */}
            <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <label htmlFor="bpm-input" className="text-gray-200 text-lg font-semibold">
                        BPM:
                    </label>
                    <input
                        type="number"
                        id="bpm-input"
                        value={bpm}
                        onChange={handleBpmInputChange}
                        onBlur={handleBpmInputBlur}
                        className="w-20 p-1 rounded-md bg-slate-600 text-white text-center"
                        min="40"
                        max="240"
                    />
                </div>
                <input
                    type="range"
                    id="bpm-slider"
                    min="40"
                    max="240"
                    value={bpm}
                    onChange={(e) => setBpm(Number(e.target.value))}
                    className="w-full h-3 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
            </div>

            {/* Volume Controls */}
            <div className="mb-4">
                 <label htmlFor="volume-slider" className="block text-gray-200 text-lg font-semibold mb-2">
                    Volume
                </label>
                <input
                    type="range"
                    id="volume-slider"
                    min="-40"
                    max="0"
                    step="1"
                    value={metronomeVolume}
                    onChange={(e) => setMetronomeVolume(Number(e.target.value))}
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
