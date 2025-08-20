import React, { useState, useMemo, useRef } from 'react';
import { useTools } from '../../context/ToolsContext';
import InfoModal from '../common/InfoModal';
import SectionHeader from '../common/SectionHeader';
import PresetEditorModal from './PresetEditorModal';
import InfoButton from '../common/InfoButton';

// A mapping to group each tool/game into a larger category
const gameToCategoryMap = {
    'Note Generator': 'Generators',
    'Interval Generator': 'Generators',
    'Chord Progression Generator': 'Generators',
    'Diagram Maker': 'Generators',
    'Interval Practice': 'Theory',
    'Triad & Tetrads Quiz': 'Theory',
    'Chord Trainer': 'Theory',
    'Fretboard Intervals': 'Fretboard',
    'CAGED System Quiz': 'Fretboard',
    'Interval Recognition': 'Ear Training',
    'Melodic Recognition': 'Ear Training',
};

// Defines the desired rendering order for categories and modules
const categoryOrder = [
    { name: 'Generators', modules: ['Note Generator', 'Interval Generator', 'Chord Progression Generator', 'Diagram Maker'] },
    { name: 'Theory', modules: ['Interval Practice', 'Triad & Tetrads Quiz', 'Chord Trainer'] },
    { name: 'Fretboard', modules: ['Fretboard Intervals', 'CAGED System Quiz'] },
    { name: 'Ear Training', modules: ['Interval Recognition', 'Melodic Recognition'] }
];

const ImportSelectionModal = ({ presetsFromFile, onImport, onCancel }) => {
    const [selectedIds, setSelectedIds] = useState(() => presetsFromFile.map(p => p.id));

    const handleToggle = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]);
    };

    const handleSelectAll = (select) => {
        setSelectedIds(select ? presetsFromFile.map(p => p.id) : []);
    };

    const handleImportClick = () => {
        const presetsToImport = presetsFromFile.filter(p => selectedIds.includes(p.id));
        onImport(presetsToImport);
    };

    return (
        <InfoModal isOpen={true} onClose={onCancel} title={`Import Presets (${presetsFromFile.length} found)`}>
            <div className="text-sm space-y-3">
                <p>Select the presets you want to import from the file.</p>
                <div className="flex gap-2">
                    <button onClick={() => handleSelectAll(true)} className="flex-1 bg-slate-600 hover:bg-slate-500 py-1 rounded">Select All</button>
                    <button onClick={() => handleSelectAll(false)} className="flex-1 bg-slate-600 hover:bg-slate-500 py-1 rounded">Deselect All</button>
                </div>
                <ul className="max-h-64 overflow-y-auto space-y-2 p-2 bg-slate-800 rounded">
                    {presetsFromFile.map(preset => (
                        <li key={preset.id}>
                            <label className="flex items-center gap-3 p-2 bg-slate-900/50 rounded cursor-pointer">
                                <input type="checkbox" checked={selectedIds.includes(preset.id)} onChange={() => handleToggle(preset.id)} className="h-5 w-5 rounded text-indigo-600 bg-slate-700" />
                                <div>
                                    <span className="font-semibold">{preset.name}</span>
                                    <span className="block text-xs text-gray-400">{preset.gameName}</span>
                                </div>
                            </label>
                        </li>
                    ))}
                </ul>
                <button onClick={handleImportClick} className="w-full bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 rounded-lg">Import {selectedIds.length} Selected</button>
            </div>
        </InfoModal>
    );
};


const PresetsManagerPage = () => {
    const { presets, loadPreset, updatePreset, deleteSelectedPresets, saveMultiplePresets, exportSelectedPresets, removePresets } = useTools();
    const [searchQuery, setSearchQuery] = useState('');
    const [gameFilter, setGameFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    
    const [selection, setSelection] = useState(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    const [editingPreset, setEditingPreset] = useState(null);
    const [presetsFromFile, setPresetsFromFile] = useState(null);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isCleanupModalOpen, setIsCleanupModalOpen] = useState(false);
    const [cleanupGame, setCleanupGame] = useState('');
    const fileInputRef = useRef(null);

    const gameNames = useMemo(() => {
        const names = Array.from(new Set(presets.filter(p => !p.isDefault).map(p => p.gameName))).sort();
        if (names.length > 0 && !cleanupGame) {
            setCleanupGame(names[0]);
        }
        return names;
    }, [presets, cleanupGame]);

    const categorizedPresets = useMemo(() => {
        let processed = [...presets];
        if (searchQuery) processed = processed.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
        if (gameFilter !== 'All') processed = processed.filter(p => p.gameName === gameFilter);
        if (typeFilter === 'Default') processed = processed.filter(p => p.isDefault);
        else if (typeFilter === 'Custom') processed = processed.filter(p => !p.isDefault);
        
        return processed.reduce((acc, preset) => {
            const category = gameToCategoryMap[preset.gameName] || 'Other';
            if (!acc[category]) acc[category] = {};
            if (!acc[category][preset.gameName]) acc[category][preset.gameName] = [];
            acc[category][preset.gameName].push(preset);
            return acc;
        }, {});
    }, [presets, searchQuery, gameFilter, typeFilter]);

    const toggleSelection = (id) => {
        setSelection(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(id)) newSelection.delete(id);
            else newSelection.add(id);
            return newSelection;
        });
    };

    const handleToggleFolder = (presetsInFolder) => {
        const folderIds = presetsInFolder.map(p => p.id);
        const allSelected = folderIds.every(id => selection.has(id));
        setSelection(prev => {
            const newSelection = new Set(prev);
            if (allSelected) {
                folderIds.forEach(id => newSelection.delete(id));
            } else {
                folderIds.forEach(id => newSelection.add(id));
            }
            return newSelection;
        });
    };

    const handleSaveEdit = (editedPreset) => {
        updatePreset(editedPreset.id, editedPreset);
        setEditingPreset(null);
        alert(`Preset "${editedPreset.name}" updated successfully!`);
    };

    const handleExitSelectionMode = () => {
        setIsSelectionMode(false);
        setSelection(new Set());
    };

    const handleFileSelected = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (Array.isArray(data)) setPresetsFromFile(data);
                else alert("Import failed: The JSON file does not contain a valid presets array.");
            } catch (error) {
                alert("Import failed: The selected file is not a valid JSON file.");
            }
        };
        reader.readAsText(file);
        event.target.value = null;
    };

    const handleImport = (presetsToImport) => {
        const importedCount = saveMultiplePresets(presetsToImport);
        alert(`${importedCount} presets imported successfully!`);
        setPresetsFromFile(null);
    };
    
    const handleCleanup = (criteria) => {
        removePresets(criteria);
        setIsCleanupModalOpen(false);
    };

    return (
        <div className="max-w-4xl mx-auto">
            {presetsFromFile && (
                <ImportSelectionModal presetsFromFile={presetsFromFile} onImport={handleImport} onCancel={() => setPresetsFromFile(null)} />
            )}
            {editingPreset && (
                <PresetEditorModal 
                    preset={editingPreset} 
                    onSave={handleSaveEdit}
                    onCancel={() => setEditingPreset(null)}
                />
            )}
            {isInfoModalOpen && (
                <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Preset Manager Guide">
                    <div className="space-y-4 text-sm">
                        <p>This is your hub for managing all saved presets for every tool.</p>
                        <div><h4 className="font-bold text-indigo-300 mb-1">Normal Mode</h4>
                            <p>By default, you can browse and load presets. Click the "Load" button to activate a preset, or "Edit" to modify a custom one.</p>
                        </div>
                        <div><h4 className="font-bold text-indigo-300 mb-1">Selection Mode</h4>
                            <p>Click the "Select Presets" button to enter selection mode. In this mode:</p>
                            <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                                <li>Clicking a preset card will select/deselect it.</li>
                                <li>A **"Select All"** button will appear in each folder header to quickly select an entire group.</li>
                                <li>The top action bar allows you to **Export** or **Delete** all selected custom presets at once.</li>
                                <li>Click "Done" to exit selection mode.</li>
                            </ul>
                        </div>
                        <div><h4 className="font-bold text-indigo-300 mb-1">Importing & Bulk Remove</h4>
                            <p>Use the "Import" button to load presets from a file. The "Bulk Remove" button provides powerful options to clean up presets that are old, duplicated, or not used in any challenges.</p>
                        </div>
                    </div>
                </InfoModal>
            )}
            {isCleanupModalOpen && (
                <InfoModal isOpen={isCleanupModalOpen} onClose={() => setIsCleanupModalOpen(false)} title="Bulk Preset Management">
                     <div className="space-y-4 text-sm">
                        <p className="text-gray-400">Use these actions to clean up your custom presets. Default presets will not be affected.</p>
                        <div className="p-2 bg-slate-800 rounded">
                            <label className="font-bold text-indigo-300 block mb-2">Remove by Tool</label>
                            <div className="flex gap-2">
                                <select value={cleanupGame} onChange={(e) => setCleanupGame(e.target.value)} className="flex-grow bg-slate-600 rounded p-1">
                                    {gameNames.map(name => <option key={name} value={name}>{name}</option>)}
                                </select>
                                <button onClick={() => handleCleanup({ type: 'byGame', value: cleanupGame })} className="bg-red-700 hover:bg-red-600 px-3 py-1 rounded font-semibold">Remove</button>
                            </div>
                        </div>
                        <div className="p-2 bg-slate-800 rounded">
                             <label className="font-bold text-indigo-300 block mb-2">Remove Unused Presets</label>
                             <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => handleCleanup({ type: 'unusedSince', value: 7 })} className="bg-red-700 hover:bg-red-600 p-2 rounded font-semibold">Not used in 7 days</button>
                                <button onClick={() => handleCleanup({ type: 'unusedSince', value: 30 })} className="bg-red-700 hover:bg-red-600 p-2 rounded font-semibold">Not used in 30 days</button>
                             </div>
                        </div>
                        <div className="p-2 bg-slate-800 rounded space-y-2">
                            <label className="font-bold text-indigo-300 block">Other Actions</label>
                            <button onClick={() => handleCleanup({ type: 'notInChallenge' })} className="w-full bg-red-700 hover:bg-red-600 p-2 rounded font-semibold">Remove presets not in any Challenge</button>
                            <button onClick={() => handleCleanup({ type: 'duplicates' })} className="w-full bg-red-700 hover:bg-red-600 p-2 rounded font-semibold">Remove all duplicate presets</button>
                        </div>
                    </div>
                </InfoModal>
            )}

            <div className="flex items-center gap-2">
                <SectionHeader title="Preset Manager" />
                <InfoButton onClick={() => setIsInfoModalOpen(true)} />
            </div>

            <div className="my-6 p-3 bg-slate-700/50 rounded-lg flex items-center justify-between gap-2">
                <div>
                    <button onClick={() => fileInputRef.current.click()} className="bg-blue-700 hover:bg-blue-600 font-bold py-2 px-4 rounded-lg">Import</button>
                    <button onClick={() => setIsCleanupModalOpen(true)} className="bg-yellow-700 hover:bg-yellow-600 font-bold py-2 px-4 rounded-lg ml-2">Bulk Remove...</button>
                </div>
                {isSelectionMode ? (
                    <div className="flex items-center gap-2 animate-fade-in">
                        <span className="font-semibold">{selection.size} selected</span>
                        <button onClick={() => exportSelectedPresets(Array.from(selection))} className="bg-green-600 hover:bg-green-500 font-bold py-2 px-4 rounded-lg">Export</button>
                        <button onClick={() => deleteSelectedPresets(Array.from(selection))} className="bg-red-700 hover:bg-red-600 font-bold py-2 px-4 rounded-lg">Delete</button>
                        <button onClick={handleExitSelectionMode} className="bg-gray-600 hover:bg-gray-500 font-bold py-2 px-4 rounded-lg">Done</button>
                    </div>
                ) : (
                    <button onClick={() => setIsSelectionMode(true)} className="bg-indigo-600 hover:bg-indigo-500 font-bold py-2 px-4 rounded-lg">Select Presets</button>
                )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6 p-4 bg-slate-700/50 rounded-lg">
                <input type="text" placeholder="Search by name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full p-2 rounded-md bg-slate-600 text-white" />
                <select value={gameFilter} onChange={e => setGameFilter(e.target.value)} className="w-full p-2 rounded-md bg-slate-600 text-white">
                    <option value="All">All Tools</option>
                    {gameNames.map(name => <option key={name} value={name}>{name}</option>)}
                </select>
                 <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-full p-2 rounded-md bg-slate-600 text-white">
                    <option value="All">All Presets</option>
                    <option value="Custom">My Presets</option>
                    <option value="Default">Defaults</option>
                </select>
            </div>
            
            <div className="space-y-4">
                {categoryOrder.map(category => {
                    const categoryName = category.name;
                    const modules = categorizedPresets[categoryName];

                    if (!modules) return null;

                    const allPresetsInCategory = Object.values(modules).flat();
                    const allInCategorySelected = allPresetsInCategory.length > 0 && allPresetsInCategory.every(p => selection.has(p.id));

                    return (
                        <details key={categoryName} className="bg-slate-800 rounded-lg">
                            <summary className="list-none">
                                <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-700/50 rounded-t-lg">
                                    <span className="transform transition-transform duration-200 group-open:rotate-90">▶</span>
                                    <h2 className="flex-grow text-2xl font-bold text-teal-300">{categoryName}</h2>
                                    {isSelectionMode && (
                                        <button
                                            onClick={(e) => { e.preventDefault(); handleToggleFolder(allPresetsInCategory); }}
                                            className="text-sm font-semibold bg-slate-600 hover:bg-slate-500 px-3 py-1 rounded-md flex-shrink-0"
                                        >
                                            {allInCategorySelected ? 'Deselect All' : 'Select All'}
                                        </button>
                                    )}
                                </div>
                            </summary>
                            <div className="p-2 md:p-4 border-t border-slate-700 space-y-3">
                                {category.modules.map(gameName => {
                                    const folderPresets = modules[gameName];
                                    
                                    if (!folderPresets) return null;

                                    const allInFolderSelected = folderPresets.length > 0 && folderPresets.every(p => selection.has(p.id));

                                    return (
                                        <details key={gameName} className="group bg-slate-900/50 rounded-lg">
                                            <summary className="list-none">
                                                <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-800/50 rounded-t-lg">
                                                    <span className="transform transition-transform duration-200 group-open:rotate-90 text-sm">▶</span>
                                                    <h3 className="flex-grow text-lg font-semibold text-indigo-300">{gameName} <span className="text-gray-400 font-normal text-sm">({folderPresets.length})</span></h3>
                                                    {isSelectionMode && (
                                                        <button
                                                            onClick={(e) => { e.preventDefault(); handleToggleFolder(folderPresets); }}
                                                            className="text-xs font-semibold bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded-md flex-shrink-0"
                                                        >
                                                            {allInFolderSelected ? 'Deselect All' : 'Select All'}
                                                        </button>
                                                    )}
                                                </div>
                                            </summary>
                                            <div className="p-2 space-y-2">
                                                {folderPresets.map(preset => {
                                                    const isSelected = selection.has(preset.id);
                                                    return (
                                                     <div 
                                                        key={preset.id} 
                                                        onClick={isSelectionMode ? () => toggleSelection(preset.id) : undefined}
                                                        className={`p-3 rounded-lg flex items-center gap-4 transition-all duration-150 
                                                            ${isSelectionMode ? 'cursor-pointer' : ''}
                                                            ${isSelected ? 'bg-indigo-800 ring-2 ring-indigo-400' : 'bg-slate-700'}
                                                        `}>
                                                        <div className="flex-grow">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-teal-300">{preset.name}</span>
                                                                {preset.isDefault && (<span className="text-xs bg-gray-600 text-gray-300 font-semibold px-2 py-0.5 rounded-full">Default</span>)}
                                                            </div>
                                                            {preset.lastUsed && !preset.isDefault && (<span className="text-xs text-gray-500 italic mt-1 block">Used: {new Date(preset.lastUsed).toLocaleDateString()}</span>)}
                                                        </div>
                                                        {!isSelectionMode && (
                                                            <div className="flex-shrink-0 flex gap-2">
                                                                <button onClick={() => loadPreset(preset)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-3 rounded text-sm">Load</button>
                                                                {!preset.isDefault && (
                                                                    <>
                                                                        <button onClick={() => setEditingPreset(preset)} className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-3 rounded text-sm">Edit</button>
                                                                        <button onClick={() => deleteSelectedPresets([preset.id])} className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-3 rounded text-sm">Delete</button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )})}
                                            </div>
                                        </details>
                                    );
                                })}
                            </div>
                        </details>
                    );
                })}
                 {Object.keys(categorizedPresets).length === 0 && <p className="text-center text-gray-400 py-4">No presets match your filters.</p>}
            </div>

            <input type="file" ref={fileInputRef} onChange={handleFileSelected} accept=".json" className="hidden" />
        </div>
    );
};

export default PresetsManagerPage;