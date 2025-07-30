import React from 'react';

const keyOptions = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F', 'Bb', 'Eb', 'Ab', 'Db'];

export const MelodicEarTrainerControls = ({ settings, onSettingChange, onRandomKey, onSavePreset, volume, onVolumeChange, onApplySettings }) => (
    <div className="space-y-4 text-sm">
        <div>
            <h4 className="font-semibold text-lg text-teal-300 mb-2">Answer Mode</h4>
            <div className="flex bg-slate-600 rounded-md p-1">
                <button onClick={() => onSettingChange('answerMode', 'Scale Degrees')} className={`flex-1 rounded-md text-sm py-1 ${settings.answerMode === 'Scale Degrees' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Scale Degrees</button>
                <button onClick={() => onSettingChange('answerMode', 'Note Names')} className={`flex-1 rounded-md text-sm py-1 ${settings.answerMode === 'Note Names' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Note Names</button>
            </div>
        </div>

        <div className="border-t border-slate-600 pt-4">
             <label htmlFor="melody-volume" className="font-semibold text-lg text-teal-300 mb-2 block">Melody Volume</label>
             <input type="range" id="melody-volume" min="-30" max="0" step="1" value={volume} onChange={(e) => onVolumeChange(Number(e.target.value))} className="w-full h-3 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
        </div>

        <div className="border-t border-slate-600 pt-4 space-y-3">
            <h4 className="font-semibold text-lg text-teal-300">Melody Options</h4>
            <div className="flex items-center justify-between"><label htmlFor="melodyLength">Notes in Melody: <span className="font-bold">{settings.melodyLength}</span></label><input type="range" id="melodyLength" min="3" max="8" value={settings.melodyLength} onChange={e => onSettingChange('melodyLength', Number(e.target.value))} className="w-1/2" /></div>
            <div className="flex items-center justify-between"><label htmlFor="octaveRange">Octave Range: <span className="font-bold">{settings.octaveRange}</span></label><input type="range" id="octaveRange" min="1" max="3" value={settings.octaveRange} onChange={e => onSettingChange('octaveRange', Number(e.target.value))} className="w-1/2" /></div>
            <label className="flex items-center justify-between p-2 bg-slate-700 rounded-md cursor-pointer">
                <span className="font-semibold">Always Start on Root</span>
                <div className="relative inline-flex items-center">
                    <input type="checkbox" checked={settings.startOnRoot} onChange={(e) => onSettingChange('startOnRoot', e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </div>
            </label>
        </div>

        <div className="border-t border-slate-600 pt-4 space-y-3">
            <h4 className="font-semibold text-lg text-teal-300">Reference Note Options</h4>
            {!settings.startOnRoot && (
                <label className="flex items-center justify-between p-2 bg-slate-700 rounded-md cursor-pointer">
                    <span className="font-semibold">Play Root Note First</span>
                    <div className="relative inline-flex items-center">
                        <input type="checkbox" checked={settings.playRootFirst} onChange={(e) => onSettingChange('playRootFirst', e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </div>
                </label>
            )}
            <label className="flex items-center justify-between p-2 bg-slate-700 rounded-md cursor-pointer">

                <span className="font-semibold">Use Drone</span>
                <div className="relative inline-flex items-center">
                    <input type="checkbox" checked={settings.useDrone} onChange={(e) => onSettingChange('useDrone', e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </div>
            </label>
        </div>

        <div className="border-t border-slate-600 pt-4 space-y-3">
            <h4 className="font-semibold text-lg text-teal-300">Key & Scale Options</h4>
            <div className="flex bg-slate-600 rounded-md p-1"><button onClick={() => onSettingChange('notePool', 'Diatonic')} className={`flex-1 rounded-md text-sm py-1 ${settings.notePool === 'Diatonic' ? 'bg-blue-600' : ''}`}>Diatonic</button><button onClick={() => onSettingChange('notePool', 'Chromatic')} className={`flex-1 rounded-md text-sm py-1 ${settings.notePool === 'Chromatic' ? 'bg-blue-600' : ''}`}>Chromatic</button></div>
            {settings.notePool === 'Diatonic' && <div className="flex bg-slate-600 rounded-md p-1"><button onClick={() => onSettingChange('diatonicMode', 'Major')} className={`flex-1 rounded-md text-sm py-1 ${settings.diatonicMode === 'Major' ? 'bg-blue-600' : ''}`}>Major</button><button onClick={() => onSettingChange('diatonicMode', 'Minor')} className={`flex-1 rounded-md text-sm py-1 ${settings.diatonicMode === 'Minor' ? 'bg-blue-600' : ''}`}>Minor</button></div>}
            
            <div className="flex bg-slate-600 rounded-md p-1">
                <button onClick={() => onSettingChange('rootNoteMode', 'Fixed')} className={`flex-1 rounded-md text-sm py-1 ${settings.rootNoteMode === 'Fixed' ? 'bg-blue-600' : ''}`}>Fixed Key</button>
                <button onClick={() => onSettingChange('rootNoteMode', 'Roving')} className={`flex-1 rounded-md text-sm py-1 ${settings.rootNoteMode === 'Roving' ? 'bg-blue-600' : ''}`}>Roving Key</button>
            </div>

            {settings.rootNoteMode === 'Fixed' && <div className="flex gap-2 items-center"><select value={settings.fixedKey} onChange={(e) => onSettingChange('fixedKey', e.target.value)} className="w-full p-2 bg-slate-700 rounded-md text-white border border-slate-500">{keyOptions.map(n => <option key={n} value={n}>{n}</option>)} </select><button onClick={onRandomKey} className="p-2 bg-blue-600 hover:bg-blue-500 rounded-md font-semibold">Random</button></div>}
            {settings.rootNoteMode === 'Roving' && <div className="flex items-center justify-between p-2 bg-slate-700 rounded-md"><label htmlFor="qpr">Questions per Key:</label><input type="number" id="qpr" min="1" max="20" value={settings.questionsPerRoot} onChange={e => onSettingChange('questionsPerRoot', Number(e.target.value))} className="w-16 p-1 bg-slate-600 rounded-md text-center"/></div>}
        </div>

        <div className="border-t border-slate-600 pt-4 mt-4 space-y-2">
             <button onClick={onApplySettings} className="w-full py-2 rounded-lg font-bold bg-green-600 hover:bg-green-500 text-white">
                Apply & Start New
            </button>
             <button onClick={onSavePreset} className="w-full py-2 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white">
                Save Preset
            </button>
        </div>
    </div>
);