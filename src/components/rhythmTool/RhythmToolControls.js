// src/components/rhythmTool/RhythmToolControls.js

import React from 'react';
import { TIME_SIGNATURES, QUIZ_LEVELS } from './rhythmConstants';

const ToggleSwitch = ({ label, isChecked, onChange }) => (
    <label className="flex items-center justify-between gap-2 cursor-pointer p-2 bg-slate-600 rounded-md">
        <span className="font-semibold">{label}</span>
        <div className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={isChecked} onChange={onChange} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </div>
    </label>
);

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
    
    const handleToggleChange = (key) => {
        onSettingChange(key, !settings[key]);
    };

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
                     <div>
                        <label htmlFor="quizDifficulty" className="block text-sm font-medium text-gray-300 mb-1">Difficulty Level</label>
                        <select id="quizDifficulty" name="quizDifficulty" value={settings.quizDifficulty} onChange={handleSelectChange} className="w-full p-2 rounded-md bg-slate-600 text-white">
                            {QUIZ_LEVELS.map(level => <option key={level.id} value={level.id}>{level.label}</option>)}
                        </select>
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
                            {TIME_SIGNATURES.map(ts => <option key={ts.label} value={ts.label}>{ts.label}</option>)}
                        </select>
                    </div>
                    
                    {settings.mode === 'write' && (
                        <ToggleSwitch
                            label="Show Beat Subdivisions"
                            isChecked={settings.showBeatDisplay}
                            onChange={() => handleToggleChange('showBeatDisplay')}
                        />
                    )}
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