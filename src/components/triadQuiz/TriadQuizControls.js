import React from 'react';

// This is the new presentational component for the controls
export const TriadQuizControls = ({ settings, onSettingChange, onSavePreset }) => (
    <div className="space-y-4">
        <div>
            <h3 className="font-semibold text-lg text-teal-300 mb-2">Quiz Mode</h3>
            <div className="space-y-2">
                <label className={`block p-3 rounded-md cursor-pointer ${settings.quizMode === 'nameTheTriad' ? 'bg-blue-600 text-white' : 'bg-slate-600 hover:bg-slate-500'}`}>
                    <input type="radio" name="quizMode" value="nameTheTriad" checked={settings.quizMode === 'nameTheTriad'} onChange={(e) => onSettingChange('quizMode', e.target.value)} className="sr-only" />
                    Name the Chord
                </label>
                <label className={`block p-3 rounded-md cursor-pointer ${settings.quizMode === 'nameTheNotes' ? 'bg-blue-600 text-white' : 'bg-slate-600 hover:bg-slate-500'}`}>
                    <input type="radio" name="quizMode" value="nameTheNotes" checked={settings.quizMode === 'nameTheNotes'} onChange={(e) => onSettingChange('quizMode', e.target.value)} className="sr-only" />
                    Name the Notes
                </label>
                <label className={`block p-3 rounded-md cursor-pointer ${settings.quizMode === 'mixed' ? 'bg-blue-600 text-white' : 'bg-slate-600 hover:bg-slate-500'}`}>
                    <input type="radio" name="quizMode" value="mixed" checked={settings.quizMode === 'mixed'} onChange={(e) => onSettingChange('quizMode', e.target.value)} className="sr-only" />
                    Mixed Quiz
                </label>
            </div>
        </div>
        <div>
            <h3 className="font-semibold text-lg text-teal-300 mb-2">Options</h3>
            <label className="flex items-center justify-between gap-2 cursor-pointer p-2 bg-slate-600 rounded-md">
                <span className="font-semibold">Include 7th Chords</span>
                <div className="relative inline-flex items-center">
                    <input type="checkbox" checked={settings.include7ths} onChange={() => onSettingChange('include7ths', !settings.include7ths)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-500 rounded-full peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 peer-checked:bg-blue-600"></div>
                </div>
            </label>
             <label className="flex items-center justify-between gap-2 cursor-pointer p-2 bg-slate-600 rounded-md mt-2">
                <span className="font-semibold">Include Inversions</span>
                <div className="relative inline-flex items-center">
                    <input type="checkbox" checked={settings.includeInversions} onChange={() => onSettingChange('includeInversions', !settings.includeInversions)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-500 rounded-full peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 peer-checked:bg-blue-600"></div>
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