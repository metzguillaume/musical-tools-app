import React, { useState, useMemo, useRef } from 'react';
import { useTools } from '../../context/ToolsContext';

const PracticeLog = () => {
    const { practiceLog, clearLog, addLogEntry, importLog } = useTools();
    const [filter, setFilter] = useState('All');
    const [sortOrder, setSortOrder] = useState('date-desc'); // Add this state for sorting
    const [customRemarks, setCustomRemarks] = useState("");
    const [isCustomLogOpen, setIsCustomLogOpen] = useState(false);
    const fileInputRef = useRef(null);

    const gameNames = useMemo(() => {
        const names = new Set(practiceLog.map(entry => entry.game));
        return ['All', ...Array.from(names)];
    }, [practiceLog]);

    const sortedAndFilteredLog = useMemo(() => {
        let filtered = filter === 'All'
            ? [...practiceLog]
            : practiceLog.filter(entry => entry.game === filter);

        // Add sorting logic here
        switch (sortOrder) {
            case 'name-asc':
                filtered.sort((a, b) => a.game.localeCompare(b.game));
                break;
            case 'name-desc':
                filtered.sort((a, b) => b.game.localeCompare(a.game));
                break;
            case 'date-asc':
                // The log is already in date-asc order, so we just return it
                return filtered;
            case 'date-desc':
            default:
                // Reverse the array to get newest first
                return filtered.slice().reverse();
        }

        // For name sorting, we return the mutated array
        return filtered;
    }, [practiceLog, filter, sortOrder]); // Add sortOrder to dependencies

    const handleSaveCustomLog = () => {
        if (customRemarks.trim() === "") {
            alert("Please enter some remarks for your custom log.");
            return;
        }
        const newEntry = {
            game: 'Custom Log',
            bpm: 'N/A',
            date: new Date().toLocaleDateString(),
            remarks: customRemarks.trim(),
        };
        addLogEntry(newEntry);
        setCustomRemarks("");
        setIsCustomLogOpen(false);
    };

    const handleExport = () => {
        if (practiceLog.length === 0) {
            alert("Your practice log is empty. Nothing to export.");
            return;
        }
        const jsonString = JSON.stringify(practiceLog, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = `practice_log_${new Date().toISOString().split('T')[0]}.log.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
    };

    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    const handleFileSelected = (event) => {
        const file = event.target.files[0];
        if (file) {
            importLog(file);
        }
        event.target.value = null;
    };

    return (
        <div className="bg-slate-700 p-4 rounded-b-lg w-full flex flex-col h-full">
            <div className="flex-shrink-0">
                <div className="mb-4">
                    <button
                        onClick={() => setIsCustomLogOpen(prev => !prev)}
                        className="w-full flex justify-between items-center p-3 bg-slate-800/50 rounded-lg text-left font-bold text-lg text-white hover:bg-slate-800 transition-colors"
                    >
                        <span>Add a Custom Log</span>
                        <span className={`transform transition-transform duration-200 ${isCustomLogOpen ? 'rotate-90' : ''}`}>
                            ▶
                        </span>
                    </button>

                    {isCustomLogOpen && (
                         <div className="mt-2 p-3 bg-slate-800/50 rounded-lg animate-fade-in-down">
                            <textarea
                                value={customRemarks}
                                onChange={(e) => setCustomRemarks(e.target.value)}
                                placeholder="Practiced scales for 20 minutes..."
                                className="w-full p-2 rounded-md bg-slate-600 text-white text-sm h-20 resize-none"
                                autoFocus
                            />
                            <button onClick={handleSaveCustomLog} className="w-full mt-2 py-2 rounded-lg text-md font-bold bg-indigo-600 hover:bg-indigo-500 text-white">
                                Save Custom Log
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mb-3 pt-4 border-t border-slate-600 gap-2">
                    <h4 className="font-bold text-lg text-white">History</h4>
                    {/* Filter by Game */}
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-slate-600 text-white rounded-md p-1 border border-slate-500 w-full"
                        title="Filter by tool"
                    >
                        {gameNames.map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>

                    {/* Sort by Name/Date */}
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="bg-slate-600 text-white rounded-md p-1 border border-slate-500 w-full"
                        title="Sort logs"
                    >
                        <option value="date-desc">Newest First</option>
                        <option value="date-asc">Oldest First</option>
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                    </select>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto pr-2">
                {sortedAndFilteredLog.length > 0 ? (
                    <ul className="space-y-3">
                        {sortedAndFilteredLog.map((entry, index) => (
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
                ) : (
                    <p className="text-center text-gray-400 py-4">No practice sessions logged.</p>
                )}
            </div>

            <div className="flex-shrink-0 mt-4 pt-4 border-t border-slate-600">
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <button onClick={handleImportClick} className="w-full py-2 rounded-lg font-bold bg-blue-700 hover:bg-blue-600 text-white">
                        Import
                    </button>
                    <button onClick={handleExport} className="w-full py-2 rounded-lg font-bold bg-blue-700 hover:bg-blue-600 text-white">
                        Export
                    </button>
                    <button onClick={clearLog} className="w-full py-2 rounded-lg font-bold bg-red-700 hover:bg-red-600 text-white col-span-2">
                        Clear All Logs
                    </button>
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelected}
                accept=".json"
                style={{ display: 'none' }}
            />
        </div>
    );
};

export default PracticeLog;