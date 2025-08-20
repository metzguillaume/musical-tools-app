// src/components/globalTools/Presets.js

import React, { useState, useMemo } from 'react';
import { useTools } from '../../context/ToolsContext';

const Presets = () => {
    // +++ ADDED `Maps` from useTools +++
    const { presets, deletePreset, loadPreset, navigate } = useTools();
    const [gameFilter, setGameFilter] = useState('All');
    const [sortOrder, setSortOrder] = useState('date-desc');
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('Custom');

    const gameNames = useMemo(() => {
        const names = new Set(presets.map(p => p.gameName));
        return ['All', ...Array.from(names).sort()];
    }, [presets]);

    const sortedAndFilteredPresets = useMemo(() => {
        let processedPresets = [...presets];
        if (searchQuery.trim() !== '') processedPresets = processedPresets.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
        if (gameFilter !== 'All') processedPresets = processedPresets.filter(p => p.gameName === gameFilter);
        if (typeFilter === 'Default') processedPresets = processedPresets.filter(p => p.isDefault);
        else if (typeFilter === 'Custom') processedPresets = processedPresets.filter(p => !p.isDefault);

        processedPresets.sort((a, b) => {
            switch (sortOrder) {
                case 'name-asc': return a.name.localeCompare(b.name);
                case 'name-desc': return b.name.localeCompare(a.name);
                case 'date-asc': return (a.id.toString()).localeCompare(b.id.toString());
                case 'date-desc': default: return (b.id.toString()).localeCompare(a.id.toString());
            }
        });

        return processedPresets;
    }, [presets, gameFilter, sortOrder, searchQuery, typeFilter]);

    const handleManagePresets = () => {
        if (navigate) {
            navigate('presets-manager');
        }
    };

    return (
        <div className="bg-slate-700 p-4 rounded-b-lg w-full flex flex-col h-full">
            <div className="flex-shrink-0">
                <div className="mb-3">
                    <input type="text" placeholder="Search by name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full p-2 bg-slate-800 text-white rounded-md border border-slate-600" />
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <select value={gameFilter} onChange={(e) => setGameFilter(e.target.value)} className="bg-slate-600 text-white text-sm rounded-md p-1 border border-slate-500 w-full">
                        {gameNames.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-slate-600 text-white text-sm rounded-md p-1 border border-slate-500 w-full">
                        <option value="All">All Presets</option>
                        <option value="Custom">My Presets</option>
                        <option value="Default">Defaults</option>
                    </select>
                    <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="bg-slate-600 text-white text-sm rounded-md p-1 border border-slate-500 w-full col-span-2">
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
                            <li key={preset.id} className={`p-3 rounded-lg text-sm ${preset.isDefault ? 'bg-slate-800' : 'bg-slate-600'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-teal-300">{preset.name}</span>
                                            {preset.isDefault && (<span className="text-xs bg-indigo-500 text-white font-semibold px-2 py-0.5 rounded-full">Default</span>)}
                                        </div>
                                        <span className="text-gray-400 text-xs">{preset.gameName}</span>
                                    </div>
                                    {!preset.isDefault && (<button onClick={() => deletePreset(preset.id)} className="text-red-400 hover:text-red-300 font-bold text-lg flex-shrink-0 ml-2">&times;</button>)}
                                </div>
                                <button onClick={() => loadPreset(preset)} className="w-full py-2 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 text-white">Load Preset</button>
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-center text-gray-400 py-4">No presets match your filters.</p>}
            </div>

            {/* +++ MODIFIED FOOTER +++ */}
            <div className="flex-shrink-0 mt-4 pt-4 border-t border-slate-600">
                <button onClick={handleManagePresets} className="w-full py-2 rounded-lg font-bold bg-indigo-700 hover:bg-indigo-600 text-white">
                    Go to Preset Manager
                </button>
            </div>
        </div>
    );
};

export default Presets;