import React, { useState, useEffect, useMemo } from 'react';
import PresetSelector from './PresetSelector';

const gameToCategoryMap = {
    'Note Generator': 'Generators', 'Interval Generator': 'Generators', 'Chord Progression Generator': 'Generators', 'Diagram Maker': 'Generators',
    'Interval Practice': 'Theory', 'Triad & Tetrads Quiz': 'Theory', 'Chord Trainer': 'Theory',
    'Fretboard Intervals': 'Fretboard', 'CAGED System Quiz': 'Fretboard',
    'Interval Recognition': 'Ear Training', 'Melodic Recognition': 'Ear Training',
};

const StepAdderForm = ({ routineType, presets, onAddStep }) => {
    const [presetId, setPresetId] = useState('');
    const [goalType, setGoalType] = useState('time');
    const [goalValue, setGoalValue] = useState(5);
    const [instruction, setInstruction] = useState(''); // NEW state for the instruction

    useEffect(() => {
        const allPresets = [...presets].sort((a,b) => a.name.localeCompare(b.name));
        if(!presetId && allPresets.length > 0) {
            setPresetId(allPresets[0].id);
        }
    }, [presets, presetId]);

    useEffect(() => {
        if (!presetId) return;
        const selectedPreset = presets.find(p => p.id === presetId);
        if (!selectedPreset) return;
        const category = gameToCategoryMap[selectedPreset.gameName];
        if (category === 'Generators' || routineType !== 'PracticeRoutine') {
            setGoalType('time');
        }
    }, [presetId, presets, routineType]);
    
    const isGenerator = useMemo(() => {
        const selectedPreset = presets.find(p => p.id === presetId);
        return selectedPreset && gameToCategoryMap[selectedPreset.gameName] === 'Generators';
    }, [presetId, presets]);

    const handleAddClick = () => {
        let finalGoalType = null;
        let finalGoalValue = null;

        if (routineType === 'PracticeRoutine') {
            finalGoalType = goalType;
            finalGoalValue = goalType === 'time' ? goalValue * 60 : goalValue;
        } else if (routineType === 'Gauntlet') {
            finalGoalType = 'questions';
            finalGoalValue = goalValue;
        }
        
        // MODIFIED: Pass instruction data up
        onAddStep({ presetId, goalType: finalGoalType, goalValue: finalGoalValue, instruction: instruction.trim() });
        setInstruction(''); // Clear the input after adding
    };

    return (
        <div className="bg-slate-800/50 p-4 rounded-lg space-y-4">
            <PresetSelector presets={presets} selectedPresetId={presetId} onSelectPreset={setPresetId} />
            
            {/* NEW: Instruction Text Input */}
            <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">Custom Note (Optional)</label>
                <input 
                    type="text"
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder="e.g., Use a pick, focus on rhythm..."
                    className="w-full p-2 rounded-md bg-slate-600 text-white"
                />
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-end">
                {routineType === 'PracticeRoutine' && (
                    <><div className="flex-grow w-full"><label className="block text-sm font-semibold text-gray-300 mb-1">Goal</label><select value={goalType} onChange={e => setGoalType(e.target.value)} disabled={isGenerator} className="w-full p-2 rounded-md bg-slate-600 text-white disabled:bg-slate-700 disabled:cursor-not-allowed"><option value="time">Time</option><option value="questions">Questions</option></select>{isGenerator && <p className="text-xs text-amber-300 mt-1">Generators can only use a time-based goal.</p>}</div><div className="w-full md:w-40"><label className="block text-sm font-semibold text-gray-300 mb-1">{goalType === 'time' ? 'Minutes' : 'Count'}</label><input type="number" value={goalValue} onChange={e => setGoalValue(Number(e.target.value))} min="1" className="w-full p-2 rounded-md bg-slate-600 text-white" /></div></>
                )}
                {routineType === 'Gauntlet' && (
                    <div className="w-full md:w-40 flex-grow"><label className="block text-sm font-semibold text-gray-300 mb-1">Questions</label><input type="number" value={goalValue} onChange={e => setGoalValue(Number(e.target.value))} min="1" className="w-full p-2 rounded-md bg-slate-600 text-white" /></div>
                )}
                <button onClick={handleAddClick} className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg flex-shrink-0">
                    {routineType === 'Streak' ? 'Add to Pool' : 'Add Step'}
                </button>
            </div>
        </div>
    );
};

export default StepAdderForm;