import React, { useState, useMemo, useRef } from 'react';
import { useTools } from '../../context/ToolsContext';

const Presets = () => {
    const { presets, deletePreset, importPresets, exportPresets, loadPreset } = useTools();
    const [filter, setFilter] = useState('All');
    const [sortOrder, setSortOrder] = useState('date-desc');
    const [searchQuery, setSearchQuery] = useState(''); // State for the search query
    const fileInputRef = useRef(null);

    const gameNames = useMemo(() => {
        const names = new Set(presets.map(p => p.gameName));
        return ['All', ...Array.from(names)];
    }, [presets]);

    const sortedAndFilteredPresets = useMemo(() => {
        // Start with the full presets list
        let processedPresets = [...presets];

        // 1. Apply search query filter
        if (searchQuery.trim() !== '') {
            processedPresets = processedPresets.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // 2. Apply tool filter
        if (filter !== 'All') {
            processedPresets = processedPresets.filter(p => p.gameName === filter);
        }

        // 3. Apply sorting
        switch (sortOrder) {
            case 'name-asc':
                processedPresets.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                processedPresets.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'date-asc':
                processedPresets.sort((a, b) => a.id - b.id);
                break;
            case 'date-desc':
            default:
                processedPresets.sort((a, b) => b.id - a.id);
                break;
        }

        return processedPresets;
    }, [presets, filter, sortOrder, searchQuery]); // Add searchQuery to dependencies

    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    const handleFileSelected = (event) => {
        const file = event.target.files[0];
        if (file) importPresets(file);
        event.target.value = null;
    };

    return (
        <div className="bg-slate-700 p-4 rounded-b-lg w-full flex flex-col h-full">
            <div className="flex-shrink-0">
                {/* Search Input */}
                <div className="mb-3">
                    <input
                        type="text"
                        placeholder="Search by preset name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-2 bg-slate-800 text-white rounded-md border border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>

                <div className="flex justify-between items-center mb-3 gap-2">
                    {/* Filter by Game */}
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-slate-600 text-white text-sm rounded-md p-1 border border-slate-500 w-full"
                        title="Filter by tool"
                    >
                        {gameNames.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>

                    {/* Sort by Name/Date */}
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="bg-slate-600 text-white text-sm rounded-md p-1 border border-slate-500 w-full"
                        title="Sort presets"
                    >
                        <option value="date-desc">Newest First</option>
                        <option value="date-asc">Oldest First</option>
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                    </select>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto pr-2">
                {sortedAndFilteredPresets.length > 0 ? (
                    <ul className="space-y-3">
                        {sortedAndFilteredPresets.map((preset) => (
                            <li key={preset.id} className="bg-slate-600 p-3 rounded-lg text-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-teal-300">{preset.name}</span>
                                        <span className="text-gray-400 text-xs">{preset.gameName}</span>
                                    </div>
                                    <button onClick={() => deletePreset(preset.id)} className="text-red-400 hover:text-red-300 font-bold text-lg flex-shrink-0 ml-2">&times;</button>
                                </div>
                                <button onClick={() => loadPreset(preset)} className="w-full py-2 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 text-white">
                                    Load Preset
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-400 py-4">No presets found.</p>
                )}
            </div>

            <div className="flex-shrink-0 mt-4 pt-4 border-t border-slate-600">
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <button onClick={handleImportClick} className="w-full py-2 rounded-lg font-bold bg-gray-600 hover:bg-gray-500 text-white">Import</button>
                    <button onClick={exportPresets} className="w-full py-2 rounded-lg font-bold bg-gray-600 hover:bg-gray-500 text-white">Export</button>
                </div>
            </div>

            <input type="file" ref={fileInputRef} onChange={handleFileSelected} accept=".json" className="hidden" />
        </div>
    );
};

export default Presets;