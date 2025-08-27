import React, { useState, useEffect, useMemo, useRef } from 'react';

// Defines the desired rendering order for categories and modules
const categoryOrder = [
    { name: 'Generators', modules: ['Note Generator', 'Interval Generator', 'Chord Progression Generator'] },
    { name: 'Theory', modules: ['Interval Practice', 'Triad & Tetrads Quiz', 'Chord Trainer'] },
    { name: 'Fretboard', modules: ['Fretboard Intervals', 'CAGED System Quiz', 'Fretboard Triads'] },
    { name: 'Ear Training', modules: ['Interval Recognition', 'Melodic Recognition'] }
];

const PresetSelector = ({ presets, selectedPresetId, onSelectPreset }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectorRef = useRef(null);

    const getPresetInfo = (presetId) => presets.find(p => p.id === presetId) || { name: 'Loading...', gameName: '' };
    
    const categorizedPresets = useMemo(() => {
        // MODIFIED: Use a copy of the full presets array, not just custom ones
        const allPresets = [...presets].sort((a, b) => a.name.localeCompare(b.name));
        return allPresets.reduce((acc, preset) => {
            if (!acc[preset.gameName]) acc[preset.gameName] = [];
            acc[preset.gameName].push(preset);
            return acc;
        }, {});
    }, [presets]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectorRef.current && !selectorRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (presetId) => {
        onSelectPreset(presetId);
        setIsOpen(false);
    };

    const selectedPresetInfo = getPresetInfo(selectedPresetId);

    return (
        <div className="relative" ref={selectorRef}>
            <label className="block text-sm font-semibold text-gray-300 mb-1">Preset</label>
            <button onClick={() => setIsOpen(prev => !prev)} className="w-full p-2 rounded-md bg-slate-600 text-white text-left flex justify-between items-center">
                <span>{selectedPresetInfo.name} <span className="text-gray-400 text-xs">({selectedPresetInfo.gameName})</span></span>
                <span>▼</span>
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 right-0 z-10 bg-slate-700 border border-slate-600 rounded-md mt-1 max-h-64 overflow-y-auto">
                    {categoryOrder.map(category => (
                        <details key={category.name} className="group" open>
                            <summary className="list-none cursor-pointer p-2 bg-slate-800 font-bold text-indigo-300 text-sm sticky top-0">{category.name}</summary>
                            {category.modules.map(moduleName => {
                                const modulePresets = categorizedPresets[moduleName];
                                if (!modulePresets || modulePresets.length === 0) return null;
                                return (
                                    <details key={moduleName} className="group/module">
                                        <summary className="list-none cursor-pointer pl-4 py-1 font-semibold text-teal-300 hover:bg-slate-600">{moduleName}</summary>
                                        <div className="pl-6">
                                            {modulePresets.map(preset => (
                                                <button key={preset.id} onClick={() => handleSelect(preset.id)} className="block w-full text-left p-1 text-gray-200 hover:bg-slate-600 rounded">
                                                    {preset.name}
                                                </button>
                                            ))}
                                        </div>
                                    </details>
                                );
                            })}
                        </details>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PresetSelector;