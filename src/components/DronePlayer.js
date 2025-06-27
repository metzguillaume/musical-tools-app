import React from 'react';
import { useTools } from '../context/ToolsContext';
import SilentSwitchNotification from './SilentSwitchNotification';

// This is the Drone Player tool panel.
const DronePlayer = () => {
    const { droneNote, setDroneNote, isDronePlaying, toggleDrone, droneVolume, setDroneVolume, areDronesReady } = useTools();
    
    // New data structure for display purposes
    const droneNoteOptions = [
        { value: 'C', display: 'C' },
        { value: 'C#', display: 'C# / Db' },
        { value: 'D', display: 'D' },
        { value: 'D#', display: 'D# / Eb' },
        { value: 'E', display: 'E' },
        { value: 'F', display: 'F' },
        { value: 'F#', display: 'F# / Gb' },
        { value: 'G', display: 'G' },
        { value: 'G#', display: 'G# / Ab' },
        { value: 'A', display: 'A' },
        { value: 'A#', display: 'A# / Bb' },
        { value: 'B', display: 'B' },
    ];

    const currentNoteDisplay = droneNoteOptions.find(opt => opt.value === droneNote)?.display || droneNote;

    return (
        <div className="bg-slate-700 p-4 rounded-b-lg w-full">
            <SilentSwitchNotification />
            <div className="mb-4">
                 <label htmlFor="drone-note" className="block text-gray-200 text-lg font-semibold mb-2">
                    Note: {currentNoteDisplay}
                </label>
                <select id="drone-note" value={droneNote} onChange={(e) => setDroneNote(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-600 text-white"
                >
                    {droneNoteOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.display}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-4">
                 <label htmlFor="drone-volume-slider" className="block text-gray-200 text-lg font-semibold mb-2">
                    Volume
                </label>
                <input
                    type="range"
                    id="drone-volume-slider"
                    min="-40"
                    max="0"
                    step="1"
                    value={droneVolume}
                    onChange={(e) => setDroneVolume(Number(e.target.value))}
                    className="w-full h-3 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
            </div>

            <button
                onClick={toggleDrone}
                disabled={!areDronesReady}
                className={`w-full py-3 rounded-lg text-lg font-bold text-white disabled:bg-gray-500 disabled:cursor-not-allowed ${isDronePlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
                {!areDronesReady ? 'Loading...' : (isDronePlaying ? 'Stop Drone' : 'Play Drone')}
            </button>
        </div>
    );
};

export default DronePlayer;
