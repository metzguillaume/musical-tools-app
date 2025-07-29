import React from 'react';

// UI Constants needed for the controls
const keyOptions = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F', 'Bb', 'Eb', 'Ab', 'Db'];

export const IntervalEarTrainerControls = ({ settings, onSettingChange, onSavePreset }) => (
    <div className="space-y-4 text-sm">
        <label className="flex items-center justify-between gap-2 cursor-pointer p-2 bg-slate-600 rounded-md">
            <span className="font-semibold text-green-300">Training Mode</span>
            <div className="relative inline-flex items-center"><input type="checkbox" checked={settings.isTrainingMode} onChange={(e) => onSettingChange('isTrainingMode', e.target.checked)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-500 rounded-full peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div></div>
        </label>
        <div className="border-t border-slate-600 pt-4">
            <h4 className="font-semibold text-lg text-teal-300 mb-2">Playback Options</h4>
            <div className="flex bg-slate-600 rounded-md p-1"><button onClick={() => onSettingChange('playbackStyle', 'Melodic')} className={`flex-1 rounded-md py-1 ${settings.playbackStyle === 'Melodic' ? 'bg-blue-600' : ''}`}>Melodic</button><button onClick={() => onSettingChange('playbackStyle', 'Harmonic')} className={`flex-1 rounded-md py-1 ${settings.playbackStyle === 'Harmonic' ? 'bg-blue-600' : ''}`}>Harmonic</button></div>
            <div className="flex bg-slate-600 rounded-md p-1 mt-2"><button onClick={() => onSettingChange('direction', 'Ascending')} className={`flex-1 rounded-md py-1 ${settings.direction === 'Ascending' ? 'bg-blue-600' : ''}`}>Ascending</button><button onClick={() => onSettingChange('direction', 'Descending')} className={`flex-1 rounded-md py-1 ${settings.direction === 'Descending' ? 'bg-blue-600' : ''}`}>Descending</button><button onClick={() => onSettingChange('direction', 'Both')} className={`flex-1 rounded-md py-1 ${settings.direction === 'Both' ? 'bg-blue-600' : ''}`}>Both</button></div>
            <label className="flex items-center justify-between gap-2 cursor-pointer p-2 mt-2 bg-slate-700 rounded-md"><span className="font-semibold">Use Drone</span><div className="relative inline-flex items-center"><input type="checkbox" checked={settings.useDrone} onChange={(e) => onSettingChange('useDrone', e.target.checked)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-500 rounded-full peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></div></label>
            {settings.playbackStyle === 'Melodic' && settings.useDrone && <label className="flex items-center justify-between gap-2 cursor-pointer p-2 mt-2 bg-slate-700 rounded-md"><span className="font-semibold">Play First Note</span><div className="relative inline-flex items-center"><input type="checkbox" checked={settings.playRootNote} onChange={(e) => onSettingChange('playRootNote', e.target.checked)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-500 rounded-full peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></div></label>}
        </div>
        <div className="border-t border-slate-600 pt-4">
            <h4 className="font-semibold text-lg text-teal-300 mb-2">Question Options</h4>
            <div className="flex bg-slate-600 rounded-md p-1"><button onClick={() => onSettingChange('notePool', 'Chromatic')} className={`flex-1 rounded-md py-1 ${settings.notePool === 'Chromatic' ? 'bg-blue-600' : ''}`}>Chromatic</button><button onClick={() => onSettingChange('notePool', 'Diatonic')} className={`flex-1 rounded-md py-1 ${settings.notePool === 'Diatonic' ? 'bg-blue-600' : ''}`}>Diatonic</button></div>
            {settings.notePool === 'Diatonic' && <div className="flex bg-slate-600 rounded-md p-1 mt-2"><button onClick={() => onSettingChange('diatonicMode', 'Major')} className={`flex-1 rounded-md py-1 ${settings.diatonicMode === 'Major' ? 'bg-blue-600' : ''}`}>Major</button><button onClick={() => onSettingChange('diatonicMode', 'Minor')} className={`flex-1 rounded-md py-1 ${settings.diatonicMode === 'Minor' ? 'bg-blue-600' : ''}`}>Minor</button></div>}
            <div className="flex items-center justify-between mt-2"><span className="font-semibold">Key/Root:</span><div className="flex bg-slate-600 rounded-md p-1"><button onClick={() => onSettingChange('rootNoteMode', 'Fixed')} className={`px-2 rounded-md py-1 ${settings.rootNoteMode === 'Fixed' ? 'bg-blue-600' : ''}`}>Fixed</button><button onClick={() => onSettingChange('rootNoteMode', 'Roving')} className={`px-2 rounded-md py-1 ${settings.rootNoteMode === 'Roving' ? 'bg-blue-600' : ''}`}>Roving</button></div></div>
            {settings.rootNoteMode === 'Fixed' && <select value={settings.fixedKey} onChange={(e) => onSettingChange('fixedKey', e.target.value)} className="w-full p-2 mt-2 bg-slate-600 rounded-md"> {keyOptions.map(n => <option key={n} value={n}>{n}</option>)} </select>}
            {settings.rootNoteMode === 'Roving' && 
                <>
                    <div className="flex items-center gap-2 mt-2"><label htmlFor="qpr">Questions per Key:</label><input type="number" id="qpr" min="1" max="20" value={settings.questionsPerRoot} onChange={e => onSettingChange('questionsPerRoot', Number(e.target.value))} className="w-16 p-1 bg-slate-600 rounded-md text-center"/></div>
                    <label className="flex items-center justify-between gap-2 cursor-pointer p-2 mt-2 bg-slate-700 rounded-md"><span className="font-semibold">Show Key Change Alert</span><div className="relative inline-flex items-center"><input type="checkbox" checked={settings.showKeyChange} onChange={(e) => onSettingChange('showKeyChange', e.target.checked)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-500 rounded-full peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></div></label>
                </>
            }
            <div className="mt-2"><label htmlFor="octave-range" className="font-semibold">Octave Range: {settings.octaveRange}</label><input type="range" id="octave-range" min="1" max="3" step="1" value={settings.octaveRange} onChange={e => onSettingChange('octaveRange', Number(e.target.value))} className="w-full h-2 mt-1 bg-slate-600 rounded-lg appearance-none cursor-pointer" /></div>
        </div>
        <div className="border-t border-slate-600 pt-4">
            <h4 className="font-semibold text-lg text-teal-300 mb-2">Answer Mode</h4>
            <div className="flex bg-slate-600 rounded-md p-1"><button onClick={() => onSettingChange('answerMode', 'Interval Name')} className={`flex-1 rounded-md py-1 ${settings.answerMode === 'Interval Name' ? 'bg-blue-600' : ''}`}>Interval Name</button><button onClick={() => onSettingChange('answerMode', 'Scale Degree')} className={`flex-1 rounded-md py-1 ${settings.answerMode === 'Scale Degree' ? 'bg-blue-600' : ''}`}>Scale Degree</button><button onClick={() => onSettingChange('answerMode', 'Note Names')} className={`flex-1 rounded-md py-1 ${settings.answerMode === 'Note Names' ? 'bg-blue-600' : ''}`}>Note Names</button></div>
        </div>
        <div className="border-t border-slate-600 pt-4 mt-4">
             <button onClick={onSavePreset} className="w-full py-2 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white">
                Save Current Settings as Preset
            </button>
        </div>
    </div>
);