import React, { useState, useMemo } from 'react';
import { useTools } from '../context/ToolsContext';

// This is the new, improved Practice Log tool panel.
const PracticeLog = () => {
    const { practiceLog, clearLog } = useTools();
    const [filter, setFilter] = useState('All');

    // Get a unique list of game names for the filter dropdown
    const gameNames = useMemo(() => {
        const names = new Set(practiceLog.map(entry => entry.game));
        return ['All', ...Array.from(names)];
    }, [practiceLog]);

    const filteredLog = useMemo(() => {
        if (filter === 'All') {
            return practiceLog;
        }
        return practiceLog.filter(entry => entry.game === filter);
    }, [practiceLog, filter]);

    return (
        <div className="bg-slate-700 p-4 rounded-b-lg w-full">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-lg text-white">History</h4>
                <select 
                    value={filter} 
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-slate-600 text-white rounded-md p-1 border border-slate-500"
                >
                    {gameNames.map(name => (
                        <option key={name} value={name}>{name}</option>
                    ))}
                </select>
            </div>
            
            {filteredLog.length > 0 ? (
                <>
                    <div className="max-h-80 overflow-y-auto pr-2">
                        <ul className="space-y-3">
                            {filteredLog.slice().reverse().map((entry, index) => (
                                <li key={index} className="bg-slate-600 p-3 rounded-lg text-sm">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-teal-300">{entry.game}</span>
                                            <span className="text-gray-300">{entry.bpm} BPM</span>
                                        </div>
                                        <span className="text-gray-400 font-mono flex-shrink-0 ml-4">{entry.date}</span>
                                    </div>
                                    <p className="text-gray-200 break-words pt-1 border-t border-slate-500/50 mt-2">{entry.remarks}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <button onClick={clearLog} className="w-full mt-4 py-2 rounded-lg text-md font-bold bg-red-700 hover:bg-red-600 text-white">
                        Clear All Logs
                    </button>
                </>
            ) : (
                <p className="text-center text-gray-400 py-4">No practice sessions logged for this filter.</p>
            )}
        </div>
    );
};

export default PracticeLog;
