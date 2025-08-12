import React from 'react';
import { useTools } from '../../context/ToolsContext';
import SilentSwitchNotification from '../common/SilentSwitchNotification';

const Metronome = () => {
    // 1. Get the isMetronomeReady state from the context
    const { bpm, setBpm, isMetronomePlaying, toggleMetronome, metronomeVolume, setMetronomeVolume, isMetronomeReady } = useTools();

    const handleBpmInputChange = (e) => {
        setBpm(e.target.value);
    };

    const handleBpmInputBlur = () => {
        let value = parseInt(bpm, 10);
        if (isNaN(value) || value < 40) {
            setBpm(40);
        } else if (value > 240) {
            setBpm(240);
        } else {
            setBpm(value);
        }
    };

    return (
        <div className="bg-slate-700 p-4 rounded-b-lg w-full">
            <SilentSwitchNotification />
            
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

            {/* 2. Update the button to be disabled and show a loading state */}
            <button
                onClick={toggleMetronome}
                disabled={!isMetronomeReady}
                className={`w-full py-3 rounded-lg text-lg font-bold text-white transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed ${isMetronomePlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
                {!isMetronomeReady ? 'Loading...' : (isMetronomePlaying ? 'Stop' : 'Start')}
            </button>
        </div>
    );
};

export default Metronome;