import React, { useState } from 'react';

// --- UI Constants ---
const keysInFifthsOrder = [
    ['C', 'Am'], ['G', 'Em'], ['D', 'Bm'], ['A', 'F#m'], ['E', 'C#m'], ['B', 'G#m'],
    ['F#', 'D#m'], ['Db', 'Bbm'], ['Ab', 'Fm'], ['Eb', 'Cm'], ['Bb', 'Gm'], ['F', 'Dm']
];
const extraEnharmonicKeys = ['Gb'];
const majorDefaultWeights = [10, 6, 4, 8, 10, 8, 2];
const scaleDegreeNames = {
    triads: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
    sevenths: ['Imaj7', 'ii7', 'iii7', 'IVmaj7', 'V7', 'vi7', 'viim7b5']
};
const gameModes = [ {id: 1, label: "Name Chord"}, {id: 4, label: "Name Numeral"}, {id: 2, label: "Progression"}, {id: 3, label: "Transpose"} ];

const WeightSliders = ({ weights, onWeightChange, use7thChords }) => {
    const degreeNames = use7thChords ? scaleDegreeNames.sevenths : scaleDegreeNames.triads;
    return (
        <div>
            <h4 className="font-semibold text-lg text-teal-300 mb-2">Chord Weights</h4>
            {weights.map((weight, index) => (
                <div key={index} className="flex items-center gap-3 mt-1">
                    <label className="w-8 font-mono text-right text-sm">{degreeNames[index]}</label>
                    <input 
                        type="range" 
                        min="0" 
                        max="10" 
                        value={weight} 
                        onChange={(e) => {
                            const newWeights = weights.map((w, i) => i === index ? Number(e.target.value) : w);
                            onWeightChange(newWeights);
                        }} 
                        className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer" 
                    />
                    <span className="w-4 text-left text-sm">{weight}</span>
                </div>
            ))}
        </div>
    );
};

export const ChordTrainerSetup = ({ onStart }) => {
    const [localSettings, setLocalSettings] = useState({
        selectedKeys: ['C', 'G', 'F'],
        selectedModes: [1, 4],
        use7thChords: false,
        generationMethod: 'weighted',
        majorWeights: majorDefaultWeights,
    });
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleKeySelection = (key) => {
        const newKeys = localSettings.selectedKeys.includes(key) ? localSettings.selectedKeys.filter(k => k !== key) : [...localSettings.selectedKeys, key];
        setLocalSettings(p => ({...p, selectedKeys: newKeys}));
    };
    const handleModeSelection = (modeId) => {
        const newModes = localSettings.selectedModes.includes(modeId) ? localSettings.selectedModes.filter(m => m !== modeId) : [...localSettings.selectedModes, modeId];
        setLocalSettings(p => ({...p, selectedModes: newModes}));
    };
    const handleStart = () => {
        if (localSettings.selectedKeys.length === 0 || localSettings.selectedModes.length === 0) {
            alert("Please select at least one key and one game mode.");
            return;
        }
        onStart(localSettings);
    };

    return (
        <div className="w-full">
            <h2 className="text-3xl font-extrabold mb-6 text-indigo-300 text-center">Chord Trainer Setup</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-700 p-4 rounded-lg flex flex-col items-center">
                    <h3 className="text-xl font-bold text-teal-300 mb-4 text-center">Select Keys</h3>
                    <div className="relative w-[350px] h-[350px] mx-auto mb-4">
                        {keysInFifthsOrder.map(([majorKey], index) => {
                            const angle = index * (360 / 12) - 90;
                            const radius = 150;
                            const style = { transform: `translate(-50%, -50%) rotate(${angle}deg) translate(${radius}px) rotate(${-angle}deg)` };
                            return (
                                <div key={majorKey} style={style} className="absolute top-1/2 left-1/2">
                                    <button onClick={() => handleKeySelection(majorKey)} className={`p-2 rounded-md min-w-[50px] ${localSettings.selectedKeys.includes(majorKey) ? 'bg-blue-600 text-white' : 'bg-slate-600 hover:bg-slate-500'}`}>
                                        {majorKey}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    <div className="border-t border-slate-600 pt-3 text-center mt-2"><h4 className="font-semibold text-lg text-gray-400 mb-2">Enharmonic Keys</h4><div className="flex justify-center gap-4">{extraEnharmonicKeys.map(key => (<button key={key} onClick={() => handleKeySelection(key)} className={`p-2 rounded-md min-w-[50px] ${localSettings.selectedKeys.includes(key) ? 'bg-blue-600 text-white' : 'bg-slate-600 hover:bg-slate-500'}`}>{key}</button>))}</div></div>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg flex flex-col">
                    <h3 className="text-xl font-bold text-teal-300 mb-4">Game Modes</h3>
                    <div className="space-y-2">{gameModes.map(mode => (<button key={mode.id} onClick={() => handleModeSelection(mode.id)} className={`w-full text-left p-3 rounded-md ${localSettings.selectedModes.includes(mode.id) ? 'bg-blue-600 text-white':'bg-slate-600 hover:bg-slate-500'}`}>{mode.label}</button>))}</div>
                    <div className="border-t border-slate-600 my-4"></div>
                    <h3 className="text-xl font-bold text-teal-300 mb-2">Chord Type</h3>
                    <label className="flex items-center justify-between p-3 rounded-md bg-slate-600 cursor-pointer"><span className="font-semibold">Use 7th Chords</span><div className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={localSettings.use7thChords} onChange={(e) => setLocalSettings(p => ({...p, use7thChords: e.target.checked}))} className="sr-only peer" /><div className="w-11 h-6 bg-gray-500 rounded-full peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></div></label>
                    <div className="border-t border-slate-600 my-4"></div>
                    <button onClick={() => setShowAdvanced(p => !p)} className="text-left text-teal-300 font-bold text-lg hover:text-teal-200 w-full">{showAdvanced ? '▼' : '►'} Advanced Settings</button>
                    {showAdvanced && (
                        <div className="mt-2 p-3 bg-slate-800/50 rounded-lg space-y-4">
                            <div><h4 className="font-semibold">Generation Method</h4><div className="flex bg-slate-600 rounded-md p-1 mt-1"><button onClick={() => setLocalSettings(p=>({...p, generationMethod: 'weighted'}))} className={`flex-1 text-sm rounded-md py-1 ${localSettings.generationMethod === 'weighted' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Weighted</button><button onClick={() => setLocalSettings(p=>({...p, generationMethod: 'random'}))} className={`flex-1 text-sm rounded-md py-1 ${localSettings.generationMethod === 'random' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Random</button></div></div>
                            <WeightSliders 
                                weights={localSettings.majorWeights}
                                onWeightChange={(newWeights) => setLocalSettings(p => ({ ...p, majorWeights: newWeights }))}
                                use7thChords={localSettings.use7thChords}
                            />
                        </div>
                    )}
                    <div className="mt-auto pt-4"><button onClick={handleStart} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-lg text-xl">Start Practice</button></div>
                </div>
            </div>
        </div>
    );
};