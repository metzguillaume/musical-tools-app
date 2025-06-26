import React from 'react';
import { useTools } from '../context/ToolsContext';

// This is the Drone Player tool panel.
const DronePlayer = () => {
    const { droneNote, setDroneNote, isDronePlaying, toggleDrone } = useTools();
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    return (
        <div className="bg-slate-700 p-4 rounded-b-lg w-full">
            <div className="mb-4">
                 <label htmlFor="drone-note" className="block text-gray-200 text-lg font-semibold mb-2">
                    Note: {droneNote.slice(0,-1)}
                </label>
                <select id="drone-note" value={droneNote} onChange={(e) => setDroneNote(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-600 text-white"
                >
                    {notes.map(note => <option key={note} value={`${note}4`}>{note}</option>)}
                </select>
            </div>
            <button
                onClick={toggleDrone}
                className={`w-full py-3 rounded-lg text-lg font-bold text-white ${isDronePlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
                {isDronePlaying ? 'Stop Drone' : 'Play Drone'}
            </button>
        </div>
    );
};

export default DronePlayer;
