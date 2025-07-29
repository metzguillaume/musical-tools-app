import React, { useState, useMemo, useRef } from 'react';
import { useTools } from '../../context/ToolsContext';

const Presets = () => {
    const { presets, deletePreset, importPresets, exportPresets, loadPreset } = useTools();
    const [filter, setFilter] = useState('All');
    const fileInputRef = useRef(null);

    const gameNames = useMemo(() => {
        const names = new Set(presets.map(p => p.gameName));
        return ['All', ...Array.from(names)];
    }, [presets]);

    const filteredPresets = useMemo(() => {
        if (filter === 'All') return presets;
        return presets.filter(p => p.gameName === filter);
    }, [presets, filter]);

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
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-lg text-white">Saved Presets</h4>
                    <select 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-slate-600 text-white text-sm rounded-md p-1 border border-slate-500"
                    >
                        {gameNames.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                </div>
            </div>
            
            <div className="flex-grow overflow-y-auto pr-2">
                {filteredPresets.length > 0 ? (
                    <ul className="space-y-3">
                        {filteredPresets.map((preset) => (
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
                    <p className="text-center text-gray-400 py-4">No presets saved.</p>
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