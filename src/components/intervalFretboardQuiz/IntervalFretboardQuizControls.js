import React from 'react';

// This is the new Presentational Component for the controls.
export const IntervalFretboardQuizControls = ({
  settings,
  onSettingChange,
  volume,
  onVolumeChange,
  onSavePreset
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-lg text-teal-300 mb-2">Note Display</h3>
        <div className="flex bg-slate-600 rounded-md p-1">
          <button onClick={() => onSettingChange('labelType', 'name')} className={`flex-1 rounded-md text-sm py-1 ${settings.labelType === 'name' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Note Name</button>
          <button onClick={() => onSettingChange('labelType', 'degree')} className={`flex-1 rounded-md text-sm py-1 ${settings.labelType === 'degree' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Scale Degree</button>
        </div>
      </div>
      <div>
        <label htmlFor="fretboard-audio-volume" className="font-semibold text-lg text-teal-300 mb-2 block">Audio Volume</label>
        <input
          type="range" id="fretboard-audio-volume"
          min="-30" max="0" step="1"
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          className="w-full h-3 bg-gray-600 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      <div className="border-t border-slate-600 pt-4 mt-4">
        <button onClick={onSavePreset} className="w-full py-2 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white">
          Save Preset
        </button>
      </div>
    </div>
  );
};