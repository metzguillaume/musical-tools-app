import React from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableStepItem = ({ step, index, onRemove, getPresetInfo }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: step.id });
    const style = { transform: CSS.Transform.toString(transform), transition };
    const presetInfo = getPresetInfo(step.presetId);
    return (
         <div ref={setNodeRef} style={style} {...attributes} className="bg-slate-800 p-3 rounded-md flex items-center justify-between touch-none">
            <div className="flex items-center gap-4 flex-grow min-w-0">
                <button {...listeners} className="cursor-grab text-gray-400 p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
                <div className="flex-grow min-w-0">
                    <span className="font-semibold text-gray-200 truncate block">{index + 1}. {presetInfo.name}</span>
                    <p className="text-xs text-gray-400">{presetInfo.gameName}</p>
                    {/* NEW: Display instruction if it exists */}
                    {step.instruction && <p className="text-sm text-amber-300 mt-1 italic truncate">"{step.instruction}"</p>}
                </div>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
                {step.goalType && (<span className="text-sm text-gray-400">{step.goalType === 'time' ? `${step.goalValue / 60} min` : `${step.goalValue} questions`}</span>)}
                <button onClick={() => onRemove(index)} className="text-red-500 hover:text-red-400 font-bold text-2xl px-2">&times;</button>
            </div>
        </div>
    );
};

const StepList = ({ steps, onRemoveStep, onReorderSteps, getPresetInfo }) => {
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = steps.findIndex(item => item.id === active.id);
            const newIndex = steps.findIndex(item => item.id === over.id);
            onReorderSteps(oldIndex, newIndex);
        }
    };
    return (
        <div className="space-y-2 mb-4">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={steps} strategy={verticalListSortingStrategy}>
                    {steps.map((step, index) => (
                        <SortableStepItem
                            key={step.id}
                            id={step.id}
                            step={step}
                            index={index}
                            onRemove={onRemoveStep}
                            getPresetInfo={getPresetInfo}
                        />
                    ))}
                </SortableContext>
            </DndContext>
            {steps.length === 0 && <p className="text-center text-gray-400">No steps added yet.</p>}
        </div>
    );
};

export default StepList;