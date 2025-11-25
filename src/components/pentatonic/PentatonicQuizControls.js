import React from 'react';
import { STANDARD_CAGED_ORDER } from './pentatonicConstants.js';

export const PentatonicQuizControls = ({
  quizMode, // Now an object { identify: true, construct: false, ... }
  onQuizModeChange,
  settings,
  onSettingToggle,
  onSavePreset
}) => {
    
    const handleModeToggle = (mode) => {
        const newModes = { ...quizMode, [mode]: !quizMode[mode] };
        // Prevent turning off all modes? (Optional, but good UX)
        onQuizModeChange(newModes);
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="font-semibold text-lg text-teal-300 mb-2">Game Modes</h3>
                <p className="text-xs text-gray-400 mb-2">Select multiple to mix them.</p>
                <div className="grid grid-cols-2 gap-2">
                    {['identify', 'construct', 'complete', 'connect'].map(mode => (
                        <button 
                            key={mode} 
                            onClick={() => handleModeToggle(mode)} 
                            className={`rounded-lg text-sm font-bold py-3 capitalize transition-all ${
                                quizMode[mode]
                                ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400' 
                                : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                            }`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Scale Qualities */}
            <div>
                 <h3 className="font-semibold text-lg text-teal-300 mb-2">Scale Qualities</h3>
                 <div className="grid grid-cols-2 gap-2">
                    {['Major', 'Minor'].map(quality => {
                        const key = `include${quality}`;
                        const isActive = settings[key];
                        return (
                            <button
                                key={quality}
                                onClick={() => onSettingToggle('quality', key)}
                                className={`flex items-center justify-center p-3 rounded-lg font-bold transition-all ${
                                    isActive 
                                    ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-400' 
                                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                }`}
                            >
                                {quality}
                            </button>
                        );
                    })}
                 </div>
            </div>

            {/* Shapes */}
            <div>
                <h3 className="font-semibold text-lg text-teal-300 mb-2">CAGED Shapes</h3>
                 <div className="grid grid-cols-5 gap-2">
                    {STANDARD_CAGED_ORDER.map(shape => {
                        const isActive = settings.shapes[shape];
                        return (
                            <button
                                key={shape}
                                onClick={() => onSettingToggle('shapes', shape)}
                                className={`flex items-center justify-center p-3 rounded-lg font-bold text-xl transition-all ${
                                    isActive
                                    ? 'bg-teal-600 text-white shadow-lg ring-2 ring-teal-400' 
                                    : 'bg-slate-700 text-gray-500 hover:bg-slate-600'
                                }`}
                            >
                                {shape}
                            </button>
                        );
                    })}
                 </div>
            </div>
            
            {/* Specific Settings for Complete Mode */}
            {(quizMode.complete) && (
                 <div className="border-t border-slate-600 pt-4">
                     <h3 className="font-semibold text-sm text-gray-400 mb-2">"Complete" Mode Options</h3>
                     <label className="flex items-center justify-between gap-2 cursor-pointer p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                        <span className="font-semibold text-sm text-gray-200">Always Include Root</span>
                        <div className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={settings.completeModeStartWithRoots} onChange={() => onSettingToggle('misc', 'completeModeStartWithRoots')} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </div>
                    </label>
                </div>
            )}

            <div className="border-t border-slate-600 pt-4 mt-2">
                <button onClick={onSavePreset} className="w-full py-3 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-transform active:scale-95">
                    Save Preset
                </button>
            </div>
        </div>
    );
};