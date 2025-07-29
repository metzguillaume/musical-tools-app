import React from 'react';
import { SHAPE_ORDER } from './cagedConstants.js';

export const CagedQuizControls = ({
  quizMode,
  onQuizModeChange,
  settings,
  onSettingToggle,
  onSavePreset
}) => (
    <div className="space-y-4">
        <div>
            <h3 className="font-semibold text-lg text-teal-300 mb-2">Game Mode</h3>
            <div className="flex bg-slate-600 rounded-md p-1">
                <button onClick={() => onQuizModeChange('identify')} className={`flex-1 rounded-md text-sm py-1 ${quizMode === 'identify' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Identify</button>
                <button onClick={() => onQuizModeChange('construct')} className={`flex-1 rounded-md text-sm py-1 ${quizMode === 'construct' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Construct</button>
                <button onClick={() => onQuizModeChange('mixed')} className={`flex-1 rounded-md text-sm py-1 ${quizMode === 'mixed' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Mixed</button>
            </div>
        </div>
        <div>
             <h3 className="font-semibold text-lg text-teal-300 mb-2">Chord Qualities</h3>
             <div className="space-y-2">
                <label className="flex items-center justify-between gap-2 cursor-pointer p-2 bg-slate-600 rounded-md">
                    <span className="font-semibold">Major</span>
                     <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={settings.includeMajor} onChange={() => onSettingToggle('quality', 'includeMajor')} className="sr-only peer" />
                        {/* FIXED: Full class string for the toggle */}
                        <div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </div>
                </label>
                <label className="flex items-center justify-between gap-2 cursor-pointer p-2 bg-slate-600 rounded-md">
                    <span className="font-semibold">Minor</span>
                     <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={settings.includeMinor} onChange={() => onSettingToggle('quality', 'includeMinor')} className="sr-only peer" />
                        {/* FIXED: Full class string for the toggle */}
                        <div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </div>
                </label>
             </div>
        </div>
        <div>
            <h3 className="font-semibold text-lg text-teal-300 mb-2">Shapes to Practice</h3>
             <div className="grid grid-cols-3 gap-2">
                {SHAPE_ORDER.map(shape => (
                    <label key={shape} className="flex items-center justify-center gap-2 cursor-pointer p-2 bg-slate-600 rounded-md">
                        <span className="font-semibold">{shape}</span>
                        <div className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={settings.shapes[shape]} onChange={() => onSettingToggle('shapes', shape)} className="sr-only peer" />
                            {/* FIXED: Full class string for the smaller toggle */}
                            <div className="w-9 h-5 bg-gray-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </div>
                    </label>
                ))}
             </div>
        </div>
        <div>
             <h3 className="font-semibold text-lg text-teal-300 mb-2">Display Options</h3>
            <label className="flex items-center justify-between gap-2 cursor-pointer p-2 bg-slate-600 rounded-md">
                <span className="font-semibold">Show Scale Degrees</span>
                <div className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={settings.showDegrees} onChange={() => onSettingToggle('display', 'showDegrees')} className="sr-only peer" />
                    {/* FIXED: Full class string for the toggle */}
                    <div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </div>
            </label>
        </div>
        <div className="border-t border-slate-600 pt-4 mt-4">
            <button onClick={onSavePreset} className="w-full py-2 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white">
                Save Preset
            </button>
        </div>
    </div>
);