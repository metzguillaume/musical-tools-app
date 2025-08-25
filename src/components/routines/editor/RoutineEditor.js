import React, { useState, useEffect } from 'react';
import { useTools } from '../../../context/ToolsContext';
import { arrayMove } from '@dnd-kit/sortable';
import StepList from './StepList';
import StepAdderForm from './StepAdderForm';

const RoutineEditor = ({ routineToEdit, onSave, onCancel }) => {
    const { presets } = useTools();
    const [name, setName] = useState('');
    const [type, setType] = useState('PracticeRoutine');
    const [steps, setSteps] = useState([]);
    const [executionOrder, setExecutionOrder] = useState('sequential');
    
    useEffect(() => {
        if (routineToEdit) {
            setName(routineToEdit.name);
            setType(routineToEdit.type);
            setSteps(routineToEdit.steps.map(s => ({ ...s, id: s.id || `step_${Math.random()}` })));
            setExecutionOrder(routineToEdit.executionOrder || 'sequential');
        } else {
            // Reset state when creating a new one
            setName('');
            setType('PracticeRoutine');
            setSteps([]);
            setExecutionOrder('sequential');
        }
    }, [routineToEdit]);

    const handleAddStep = (newStepData) => {
        const newStep = {
            id: `step_${Date.now()}`,
            ...newStepData,
        };
        setSteps(currentSteps => [...currentSteps, newStep]);
    };

    const handleRemoveStep = (indexToRemove) => {
        setSteps(currentSteps => currentSteps.filter((_, i) => i !== indexToRemove));
    };

    const handleReorderSteps = (oldIndex, newIndex) => {
        setSteps(currentSteps => arrayMove(currentSteps, oldIndex, newIndex));
    };

    const handleSave = () => {
        if (name.trim() === '' || steps.length === 0) {
            alert("Please provide a name and add at least one step to the routine.");
            return;
        }
        const finalSteps = steps.map((step, index) => ({ ...step, stepOrder: index + 1 }));
        const routineData = {
            id: routineToEdit ? routineToEdit.id : `routine_${Date.now()}`,
            name: name.trim(),
            type,
            executionOrder: (type === 'PracticeRoutine' || type === 'Gauntlet') ? executionOrder : 'sequential',
            steps: finalSteps,
        };
        onSave(routineData);
    };

    const getPresetInfo = (presetId) => {
        return presets.find(p => p.id === presetId) || { name: 'Unknown Preset', gameName: 'N/A' };
    };

    return (
        <div className="bg-slate-700/50 p-6 rounded-lg space-y-6">
            <div>
                <label className="block text-lg font-semibold text-gray-300 mb-2" htmlFor="routine-name">Routine Name</label>
                <input id="routine-name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 rounded-md bg-slate-600 text-white" placeholder="e.g., Daily Fretboard Workout" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-lg font-semibold text-gray-300 mb-2" htmlFor="routine-type">Routine Type</label>
                    <select id="routine-type" value={type} onChange={e => setType(e.target.value)} className="w-full p-2 rounded-md bg-slate-600 text-white">
                        <option value="PracticeRoutine">Practice Routine</option>
                        <option value="Gauntlet">The Gauntlet (Race)</option>
                        <option value="Streak">The Streak (Consistency)</option>
                    </select>
                </div>
                {(type === 'PracticeRoutine' || type === 'Gauntlet') && (
                    <div>
                        <label className="block text-lg font-semibold text-gray-300 mb-2" htmlFor="execution-order">Execution Order</label>
                        <select id="execution-order" value={executionOrder} onChange={e => setExecutionOrder(e.target.value)} className="w-full p-2 rounded-md bg-slate-600 text-white">
                            <option value="sequential">Sequential</option>
                            <option value="random">Random</option>
                        </select>
                    </div>
                )}
            </div>
            
            <div className="border-t border-slate-600 pt-4">
                <h3 className="text-xl font-bold text-teal-300 mb-4">{type === 'Streak' ? 'Preset Pool' : 'Routine Steps'}</h3>
                <StepList 
                    steps={steps}
                    onRemoveStep={handleRemoveStep}
                    onReorderSteps={handleReorderSteps}
                    getPresetInfo={getPresetInfo}
                />
                <StepAdderForm
                    routineType={type}
                    presets={presets}
                    onAddStep={handleAddStep}
                />
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-slate-600">
                <button onClick={onCancel} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg">Cancel</button>
                <button onClick={handleSave} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg">Save Routine</button>
            </div>
        </div>
    );
};

export default RoutineEditor;