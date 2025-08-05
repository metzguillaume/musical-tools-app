import React, { useState, useEffect } from 'react';
import { useTools } from '../../context/ToolsContext';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// New component for a single sortable step
const SortableStepItem = ({ step, index, onRemove, getPresetName }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: step.id }); // Use a unique ID for each step

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} className="bg-slate-800 p-3 rounded-md flex items-center justify-between touch-none">
            <div className="flex items-center gap-4">
                <button {...listeners} className="cursor-grab text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v2h2a1 1 0 110 2h-2v2a1 1 0 11-2 0V8H7a1 1 0 110-2h2V4a1 1 0 011-1zM3 10a1 1 0 011-1h2V7a1 1 0 112 0v2h2a1 1 0 110 2H8v2a1 1 0 11-2 0v-2H4a1 1 0 01-1-1zm14 0a1 1 0 011-1h2V7a1 1 0 112 0v2h2a1 1 0 110 2h-2v2a1 1 0 11-2 0v-2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                </button>
                <span className="font-semibold text-gray-200">{index + 1}. {getPresetName(step.presetId)}</span>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">
                    {step.goalType === 'time' ? `${step.goalValue / 60} min` : `${step.goalValue} questions`}
                </span>
                <button onClick={() => onRemove(index)} className="text-red-500 font-bold text-xl">&times;</button>
            </div>
        </div>
    );
};

const ChallengeEditor = ({ challengeToEdit, onSave, onCancel }) => {
    const { presets } = useTools();
    const [name, setName] = useState('');
    const [type, setType] = useState('PracticeRoutine');
    const [steps, setSteps] = useState([]);
    
    // State for the "Add Step" form
    const [newStepPresetId, setNewStepPresetId] = useState(presets.length > 0 ? presets[0].id : '');
    const [newStepGoalType, setNewStepGoalType] = useState('time');
    const [newStepGoalValue, setNewStepGoalValue] = useState(5);

    // Dnd-kit sensors and handler
    const sensors = useSensors(useSensor(PointerSensor));

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setSteps((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    useEffect(() => {
        if (challengeToEdit) {
            setName(challengeToEdit.name);
            setType(challengeToEdit.type);
            setSteps(challengeToEdit.steps);
        }
    }, [challengeToEdit]);

    const handleAddStep = () => {
        if (!newStepPresetId) {
            alert("Please select a preset.");
            return;
        }
        // Add a unique ID for dnd-kit
        const newStep = {
            id: `step_${Date.now()}`, 
            presetId: newStepPresetId,
            goalType: newStepGoalType,
            goalValue: newStepGoalType === 'time' ? newStepGoalValue * 60 : newStepGoalValue,
        };
        setSteps([...steps, newStep]);
    };

    const handleRemoveStep = (index) => {
        const updatedSteps = steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, stepOrder: i + 1 }));
        setSteps(updatedSteps);
    };

    const handleSave = () => {
        if (name.trim() === '' || steps.length === 0) {
            alert("Please provide a name and add at least one step to the challenge.");
            return;
        }
        const challengeData = {
            id: challengeToEdit ? challengeToEdit.id : `challenge_${Date.now()}`,
            name: name.trim(),
            type,
            steps,
        };
        onSave(challengeData);
    };

    const getPresetName = (presetId) => presets.find(p => p.id === presetId)?.name || 'Unknown Preset';

    return (
        <div className="bg-slate-700/50 p-6 rounded-lg space-y-6">
            <div>
                <label className="block text-lg font-semibold text-gray-300 mb-2" htmlFor="challenge-name">Challenge Name</label>
                <input id="challenge-name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 rounded-md bg-slate-600 text-white" placeholder="e.g., Daily Fretboard Workout" />
            </div>
            <div>
                <label className="block text-lg font-semibold text-gray-300 mb-2" htmlFor="challenge-type">Challenge Type</label>
                <select id="challenge-type" value={type} onChange={e => setType(e.target.value)} className="w-full p-2 rounded-md bg-slate-600 text-white">
                    <option value="PracticeRoutine">Practice Routine (Time-Based)</option>
                    <option value="Gauntlet">The Gauntlet (Question Race)</option>
                    <option value="Streak">The Streak (Consistency)</option>
                </select>
            </div>
            
            <div className="border-t border-slate-600 pt-4">
                <h3 className="text-xl font-bold text-teal-300 mb-4">Challenge Steps</h3>
                <div className="space-y-2 mb-4">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={steps} strategy={verticalListSortingStrategy}>
                            {steps.map((step, index) => (
                                <SortableStepItem
                                    key={step.id}
                                    id={step.id}
                                    step={step}
                                    index={index}
                                    onRemove={handleRemoveStep}
                                    getPresetName={getPresetName}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                    {steps.length === 0 && <p className="text-center text-gray-400">No steps added yet.</p>}
                </div>

                <div className="bg-slate-800/50 p-4 rounded-lg flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-grow w-full"><label className="block text-sm font-semibold text-gray-300 mb-1">Preset</label><select value={newStepPresetId} onChange={e => setNewStepPresetId(e.target.value)} className="w-full p-2 rounded-md bg-slate-600 text-white">{presets.map(p => <option key={p.id} value={p.id}>{p.gameName}: {p.name}</option>)}</select></div>
                    <div className="flex-grow w-full"><label className="block text-sm font-semibold text-gray-300 mb-1">Goal</label><select value={newStepGoalType} onChange={e => setNewStepGoalType(e.target.value)} className="w-full p-2 rounded-md bg-slate-600 text-white"><option value="time">Time</option><option value="questions">Questions</option></select></div>
                    <div className="w-full md:w-40"><label className="block text-sm font-semibold text-gray-300 mb-1">{newStepGoalType === 'time' ? 'Minutes' : 'Count'}</label><input type="number" value={newStepGoalValue} onChange={e => setNewStepGoalValue(Number(e.target.value))} min="1" className="w-full p-2 rounded-md bg-slate-600 text-white" /></div>
                    <button onClick={handleAddStep} className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg flex-shrink-0">Add Step</button>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-slate-600">
                <button onClick={onCancel} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg">Cancel</button>
                <button onClick={handleSave} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg">Save Challenge</button>
            </div>
        </div>
    );
};

export default ChallengeEditor;