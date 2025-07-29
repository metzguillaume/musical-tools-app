import React from 'react';

export const NoteGeneratorControls = ({
    settings,
    onSettingChange,
    isAutoGenerateOn,
    onAutoGenerateToggle,
    autoGenerateInterval,
    onIntervalChange,
    countdownClicks,
    onCountdownChange,
    countdownMode,
    onCountdownModeChange,
    onSavePreset
}) => (
    <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <label htmlFor="num-notes" className="font-semibold text-lg">Number of Notes:</label>
            <input 
                type="number" 
                id="num-notes" 
                value={settings.numNotes} 
                onChange={(e) => onSettingChange('numNotes', Math.max(1, parseInt(e.target.value, 10) || 1))} 
                className="w-24 p-2 rounded-md bg-slate-600 text-white text-center" 
                min="1" 
            />
        </div>

        {/* --- FIXED SECTION --- */}
        <div>
            <h4 className="font-semibold text-lg">Note Type:</h4>
            <div className="flex bg-slate-600 rounded-md p-1 mt-1">
                <label className={`flex-1 rounded-md py-1 text-center cursor-pointer ${settings.noteType === 'natural' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>
                    <input 
                        type="radio" 
                        name="noteType" 
                        value="natural" 
                        checked={settings.noteType === 'natural'} 
                        onChange={() => onSettingChange('noteType', 'natural')} 
                        className="sr-only"
                    />
                    Natural
                </label>
                <label className={`flex-1 rounded-md py-1 text-center cursor-pointer ${settings.noteType === 'chromatic' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>
                    <input 
                        type="radio" 
                        name="noteType" 
                        value="chromatic" 
                        checked={settings.noteType === 'chromatic'} 
                        onChange={() => onSettingChange('noteType', 'chromatic')} 
                        className="sr-only"
                    />
                    Chromatic
                </label>
            </div>
        </div>
        {/* --- END FIXED SECTION --- */}

        <div className="flex items-center justify-between">
            <label htmlFor="show-barlines" className="font-semibold text-lg">Show Barlines:</label>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="show-barlines" checked={settings.showBarlines} onChange={() => onSettingChange('showBarlines', !settings.showBarlines)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
        </div>
        
        <div className="pt-4 border-t border-slate-600 space-y-4">
            <div className="flex items-center justify-between">
                <label htmlFor="auto-generate" className="font-semibold text-lg text-teal-300">Auto-Generate:</label>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="auto-generate" checked={isAutoGenerateOn} onChange={onAutoGenerateToggle} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
            </div>
            <div className="flex items-center justify-between">
                <label htmlFor="auto-generate-interval" className={`font-semibold text-lg ${!isAutoGenerateOn && 'opacity-50'}`}>Every:</label>
                <div className="flex items-center gap-2">
                    <input type="number" id="auto-generate-interval" value={autoGenerateInterval} onChange={(e) => onIntervalChange(Math.max(1, parseInt(e.target.value, 10) || 1))} className={`w-24 p-2 rounded-md bg-slate-600 text-white text-center ${!isAutoGenerateOn && 'opacity-50'}`} min="1" disabled={!isAutoGenerateOn} />
                    <span className={`font-semibold text-lg ${!isAutoGenerateOn && 'opacity-50'}`}>clicks</span>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <label htmlFor="countdown-clicks" className={`font-semibold text-lg ${!isAutoGenerateOn && 'opacity-50'}`}>Countdown:</label>
                <div className="flex items-center gap-2">
                    <input type="number" id="countdown-clicks" value={countdownClicks} onChange={(e) => onCountdownChange(Math.max(0, parseInt(e.target.value, 10) || 0))} className={`w-24 p-2 rounded-md bg-slate-600 text-white text-center ${!isAutoGenerateOn && 'opacity-50'}`} min="0" max="7" disabled={!isAutoGenerateOn} />
                     <span className={`font-semibold text-lg ${!isAutoGenerateOn && 'opacity-50'}`}>clicks</span>
                </div>
            </div>
             <div>
                <label className={`font-semibold block mb-2 text-lg ${!isAutoGenerateOn && 'opacity-50'}`}>Countdown Mode:</label>
                <div className="flex bg-slate-600 rounded-md p-1">
                    <button disabled={!isAutoGenerateOn} onClick={() => onCountdownModeChange('every')} className={`flex-1 rounded-md text-sm py-1 disabled:cursor-not-allowed ${countdownMode === 'every' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Every Time</button>
                    <button disabled={!isAutoGenerateOn} onClick={() => onCountdownModeChange('first')} className={`flex-1 rounded-md text-sm py-1 disabled.cursor-not-allowed ${countdownMode === 'first' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>First Time Only</button>
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