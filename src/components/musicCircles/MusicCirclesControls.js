import React from 'react';

const MODE_OPTIONS = [
    { value: 'Notes', label: 'Notes' },
    { value: 'Scale', label: 'Scales' },
    { value: 'Chord', label: 'Chords' }
];

const SCALE_TYPE_OPTIONS = ['Major', 'Natural Minor', 'Harmonic Minor', 'Melodic Minor', 'Major Pentatonic', 'Minor Pentatonic', 'Blues', 'Whole Tone', 'Chromatic'];

const INTERVAL_OPTIONS = [
    { value: 7, label: 'Circle of 5ths' }, { value: 5, label: 'Circle of 4ths' },
    { value: 4, label: 'Major 3rds' }, { value: 3, label: 'Minor 3rds' },
    { value: 2, label: 'Major 2nds (Whole Steps)' }, { value: 1, label: 'Minor 2nds (Half-Steps)' }
];

const ROOT_NOTE_OPTIONS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

// --- Reusable UI Components ---

const CollapsibleSection = ({ title, children }) => (
    <details className="border-t border-slate-600/80 pt-3 mt-3" open>
        <summary className="w-full flex justify-between items-center text-left text-lg font-bold text-teal-300 hover:text-teal-200 cursor-pointer list-none">
            <span>{title}</span>
            <span className="text-xl transition-transform transform duration-200 group-open:rotate-90">▶</span>
        </summary>
        <div className="pt-3 space-y-3">{children}</div>
    </details>
);

const SegmentedControl = ({ label, settingKey, options, settings, onSettingChange }) => (
    <div>
        {label && <h4 className="font-semibold text-gray-300 mb-1">{label}</h4>}
        <div className="flex bg-slate-600 rounded-md p-1">
            {options.map(option => (
                <button
                    key={option.value}
                    onClick={() => onSettingChange(settingKey, option.value)}
                    className={`flex-1 rounded-md py-1 text-sm font-semibold ${settings[settingKey] === option.value ? 'bg-blue-600 text-white' : 'text-gray-300'}`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    </div>
);

const SettingToggle = ({ label, settingKey, settings, onSettingChange, disabled = false }) => (
    <label className={`flex items-center justify-between gap-2 p-2 rounded-md ${disabled ? 'cursor-not-allowed bg-slate-800' : 'cursor-pointer bg-slate-700'}`}>
        <span className={`font-semibold ${disabled ? 'text-gray-500' : ''}`}>{label}</span>
        <div className="relative inline-flex items-center">
            <input 
                type="checkbox" 
                checked={settings[settingKey]} 
                onChange={(e) => onSettingChange(settingKey, e.target.checked)} 
                className="sr-only peer"
                disabled={disabled}
            />
            <div className="w-11 h-6 bg-gray-500 rounded-full peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </div>
    </label>
);

// --- Main Controls Component ---

export const MusicCirclesControls = ({ settings, onSettingChange, onSavePreset }) => {

    const isKeySelectionDisabled = settings.mode === 'Notes';
    const labelToggleText = settings.mode === 'Chord' ? 'Show Roman Numerals' : 'Show Scale Degrees';

    return (
        <div className="space-y-4 text-sm">
            <CollapsibleSection title="Circle Mode">
                <SegmentedControl
                    settingKey="mode"
                    options={MODE_OPTIONS}
                    settings={settings}
                    onSettingChange={onSettingChange}
                />
            </CollapsibleSection>

            <CollapsibleSection title="Configuration">
                {settings.mode === 'Notes' && (
                    <div>
                        <label htmlFor="circle-interval" className="font-semibold text-gray-300 mb-1 block">Note Interval</label>
                        <select
                            id="circle-interval"
                            value={settings.circleInterval}
                            onChange={(e) => onSettingChange('circleInterval', Number(e.target.value))}
                            className="w-full p-2 bg-slate-700 rounded-md text-white border border-slate-500"
                        >
                            {INTERVAL_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                )}
                
                <div className={isKeySelectionDisabled ? 'opacity-50 pointer-events-none' : 'space-y-3'}>
                    <div>
                        <label htmlFor="root-note" className="font-semibold text-gray-300 mb-1 block">Root Note</label>
                        <select id="root-note" value={settings.rootNote} onChange={(e) => onSettingChange('rootNote', e.target.value)} className="w-full p-2 bg-slate-700 rounded-md text-white border border-slate-500" disabled={isKeySelectionDisabled} >
                            {ROOT_NOTE_OPTIONS.map(n => <option key={n} value={n}>{n.replace('b', '♭')}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="scale-type" className="font-semibold text-gray-300 mb-1 block">Scale Type</label>
                        <select id="scale-type" value={settings.scaleType} onChange={(e) => onSettingChange('scaleType', e.target.value)} className="w-full p-2 bg-slate-700 rounded-md text-white border border-slate-500" disabled={isKeySelectionDisabled}>
                            {SCALE_TYPE_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </div>
                </div>
            </CollapsibleSection>

            <CollapsibleSection title="Display Options">
                 <SettingToggle label={labelToggleText} settingKey="showLabels" settings={settings} onSettingChange={onSettingChange} disabled={isKeySelectionDisabled} />
            </CollapsibleSection>

            <div className="border-t border-slate-600 pt-4 mt-4">
                 <button onClick={onSavePreset} className="w-full py-2 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white"> Save Preset </button>
            </div>
        </div>
    );
};