// src/components/rhythmTool/RhythmToolControls.js

import React from 'react';
import { TIME_SIGNATURES, RHYTHM_CHOICES } from './rhythmConstants'; 

export const RhythmToolControls = ({ settings, bpm, onBpmChange, onSettingChange, onSavePreset }) => {
    
    const handleSliderChange = (e) => {
        onSettingChange(e.target.name, Number(e.target.value));
    };
    
    const handleBpmChange = (e) => {
        onBpmChange(Number(e.target.value));
    };

    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        if (name === 'timeSignature') {
            onSettingChange(name, TIME_SIGNATURES.find(ts => ts.label === value));
        } else {
            onSettingChange(name, value);
        }
    };

    const handleRhythmToggle = (key) => {
        const currentSelection = settings.allowedRhythms || [];
        const isAlreadySelected = currentSelection.includes(key);
        let newSelection;

        if (isAlreadySelected) {
            newSelection = currentSelection.filter(itemKey => itemKey !== key);
        } else {
            newSelection = [...currentSelection, key];
        }
        onSettingChange('allowedRhythms', newSelection);
    };
    
    // +++ NEW: Updated labels to reflect pattern logic +++
    const complexityLabels = {
        1: "Level 1: Basic Patterns",
        2: "Level 2: Common 16th Patterns",
        3: "Level 3: Dotted 8th Patterns",
        4: "Level 4: Syncopated 16ths",
        5: "Level 5: All Patterns (Triplets)"
    };

    // Filter out 6/8 time signature temporarily
    const availableTimeSignatures = TIME_SIGNATURES.filter(ts => ts.label !== '6/8');

    return (
        <div className="space-y-4">
            <div>
                <h3 className="font-semibold text-lg text-teal-300 mb-2">Game Mode</h3>
                <div className="flex bg-slate-600 rounded-md p-1">
                    <button onClick={() => onSettingChange('mode', 'write')} className={`flex-1 rounded-md text-sm py-1 ${settings.mode === 'write' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Write</button>
                    <button onClick={() => onSettingChange('mode', 'read')} className={`flex-1 rounded-md text-sm py-1 ${settings.mode === 'read' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Read Quiz</button>
                </div>
            </div>

            {settings.mode === 'read' && (
                <div>
                    <h3 className="font-semibold text-lg text-teal-300 mb-2">Quiz Settings</h3>
                     <div className="space-y-4">
                        
                        <div>
                            <label htmlFor="quizMeasureCount" className="block text-sm font-medium text-gray-300 mb-1">Measures per Question: <span className="font-bold text-teal-300">{settings.quizMeasureCount}</span></label>
                            <input type="range" id="quizMeasureCount" name="quizMeasureCount" min="1" max="4" step="1" value={settings.quizMeasureCount} onChange={handleSliderChange} className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer" />
                        </div>

                        {/* +++ Complexity Slider (labels are updated) +++ */}
                        <div>
                            <label htmlFor="quizComplexity" className="block text-sm font-medium text-gray-300 mb-1">
                                Complexity Level: <span className="font-bold text-teal-300">{complexityLabels[settings.quizComplexity]}</span>
                            </label>
                            <input type="range" id="quizComplexity" name="quizComplexity" min="1" max="5" step="1" value={settings.quizComplexity} onChange={handleSliderChange} className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Include Rhythms</label>
                            <div className="space-y-3">
                                {RHYTHM_CHOICES.map(group => (
                                    <div key={group.label}>
                                        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-1">{group.label}</h4>
                                        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                            {group.items.map(item => (
                                                <label key={item.key} className="flex items-center space-x-2 cursor-pointer p-1 rounded-md hover:bg-slate-700">
                                                    <input 
                                                        type="checkbox"
                                                        checked={settings.allowedRhythms.includes(item.key)}
                                                        onChange={() => handleRhythmToggle(item.key)}
                                                        className="h-4 w-4 rounded bg-slate-800 border-gray-500 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-gray-200">{item.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                     </div>
                </div>
            )}

            <div>
                <h3 className="font-semibold text-lg text-teal-300 mb-2">Playback</h3>
                <div className="space-y-2">
                    <div>
                        <label htmlFor="bpm" className="block text-sm font-medium text-gray-300 mb-1">Playback BPM: <span className="font-bold text-teal-300">{bpm}</span></label>
                        <input type="range" id="bpm" name="bpm" min="40" max="240" step="1" value={bpm} onChange={handleBpmChange} className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer" />
                    </div>
                    <div>
                        <label htmlFor="countdownClicks" className="block text-sm font-medium text-gray-300 mb-1">Countdown: <span className="font-bold text-teal-300">{settings.countdownClicks}</span></label>
                        <input type="range" id="countdownClicks" name="countdownClicks" min="0" max="8" step="1" value={settings.countdownClicks} onChange={handleSliderChange} className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer" />
                    </div>
                </div>
            </div>

            <div>
                <h3 className="font-semibold text-lg text-teal-300 mb-2">Notation</h3>
                <div className="space-y-2">
                     <div>
                        <label htmlFor="timeSignature" className="block text-sm font-medium text-gray-300 mb-1">Time Signature</label>
                        <select id="timeSignature" name="timeSignature" value={settings.timeSignature.label} onChange={handleSelectChange} className="w-full p-2 rounded-md bg-slate-600 text-white">
                            {availableTimeSignatures.map(ts => <option key={ts.label} value={ts.label}>{ts.label}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-600 pt-4 mt-4">
                <button onClick={onSavePreset} className="w-full py-2 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white">
                    Save Preset
                </button>
            </div>
        </div>
    );
};