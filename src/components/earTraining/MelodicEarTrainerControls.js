import React, { useState } from 'react';

const keyOptions = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F', 'Bb', 'Eb', 'Ab', 'Db'];

// --- Reusable UI Components ---

// A component for creating collapsible sections
const CollapsibleSection = ({ title, isOpen, onToggle, children }) => (
    <div className="border-t border-slate-600/80 pt-3 mt-3">
        <button
            onClick={onToggle}
            className="w-full flex justify-between items-center text-left text-lg font-bold text-teal-300 hover:text-teal-200"
        >
            <span>{title}</span>
            <span className="text-xl">{isOpen ? '−' : '+'}</span>
        </button>
        {isOpen && <div className="pt-3 space-y-3">{children}</div>}
    </div>
);

// A reusable component for all toggle switches
const SettingToggle = ({ label, settingKey, settings, onSettingChange, disabled = false }) => (
    <label className={`flex items-center justify-between gap-2 cursor-pointer p-2 rounded-md ${disabled ? 'bg-slate-800' : 'bg-slate-700'}`}>
        <span className={`font-semibold ${disabled ? 'text-gray-500' : ''}`}>
            {label}
        </span>
        <div className="relative inline-flex items-center">
            <input 
                type="checkbox" 
                checked={settings[settingKey]} 
                onChange={(e) => onSettingChange(settingKey, e.target.checked)} 
                className="sr-only peer"
                disabled={disabled}
            />
            <div className={`w-11 h-6 bg-gray-500 rounded-full peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${disabled ? 'cursor-not-allowed' : 'peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:bg-blue-600'}`}></div>
        </div>
    </label>
);

// A reusable component for segmented button controls
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


// --- Main Controls Component ---

export const MelodicEarTrainerControls = ({ settings, onSettingChange, onRandomKey, onSavePreset, volume, onVolumeChange, onApplySettings }) => {
    // State to manage which sections are open
    const [openSections, setOpenSections] = useState({
        general: true,
        melody: false,
        reference: false,
        key: false
    });

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    return (
        <div className="space-y-4 text-sm">

            <CollapsibleSection title="General Settings" isOpen={openSections.general} onToggle={() => toggleSection('general')}>
                <SegmentedControl
                    label="Answer Mode"
                    settingKey="answerMode"
                    settings={settings}
                    onSettingChange={onSettingChange}
                    options={[
                        { value: 'Scale Degrees', label: 'Scale Degrees' },
                        { value: 'Note Names', label: 'Note Names' },
                    ]}
                />
                 <SettingToggle label="Replay on Answer" settingKey="replayOnAnswer" settings={settings} onSettingChange={onSettingChange} />
            </CollapsibleSection>

            <CollapsibleSection title="Melody Options" isOpen={openSections.melody} onToggle={() => toggleSection('melody')}>
                <div>
                    <label htmlFor="melody-volume" className="font-semibold text-gray-300 mb-1 block">Melody Volume</label>
                    <input type="range" id="melody-volume" min="-30" max="0" step="1" value={volume} onChange={(e) => onVolumeChange(Number(e.target.value))} className="w-full h-3 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
                </div>
                <div className="flex items-center justify-between">
                    <label htmlFor="melodyLength">Notes in Melody: <span className="font-bold">{settings.melodyLength}</span></label>
                    <input type="range" id="melodyLength" min="3" max="8" value={settings.melodyLength} onChange={e => onSettingChange('melodyLength', Number(e.target.value))} className="w-1/2" />
                </div>
                <div className="flex items-center justify-between">
                    <label htmlFor="octaveRange">Octave Range: <span className="font-bold">{settings.octaveRange}</span></label>
                    <input type="range" id="octaveRange" min="1" max="3" value={settings.octaveRange} onChange={e => onSettingChange('octaveRange', Number(e.target.value))} className="w-1/2" />
                </div>
                <SettingToggle label="Always Start on Root" settingKey="startOnRoot" settings={settings} onSettingChange={onSettingChange} />
            </CollapsibleSection>

            <CollapsibleSection title="Reference Note Options" isOpen={openSections.reference} onToggle={() => toggleSection('reference')}>
                <SettingToggle 
                    label="Play Root Note First" 
                    settingKey="playRootFirst" 
                    settings={settings} 
                    onSettingChange={onSettingChange}
                    disabled={settings.startOnRoot} 
                />
                <SettingToggle label="Use Drone" settingKey="useDrone" settings={settings} onSettingChange={onSettingChange} />
            </CollapsibleSection>
            
            <CollapsibleSection title="Key & Scale Options" isOpen={openSections.key} onToggle={() => toggleSection('key')}>
                <SegmentedControl
                    settingKey="notePool"
                    settings={settings}
                    onSettingChange={onSettingChange}
                    options={[ { value: 'Diatonic', label: 'Diatonic' }, { value: 'Chromatic', label: 'Chromatic' } ]}
                />
                {settings.notePool === 'Diatonic' && (
                     <SegmentedControl
                        settingKey="diatonicMode"
                        settings={settings}
                        onSettingChange={onSettingChange}
                        options={[ { value: 'Major', label: 'Major' }, { value: 'Minor', label: 'Minor' } ]}
                    />
                )}
                <SegmentedControl
                    label="Key Mode"
                    settingKey="rootNoteMode"
                    settings={settings}
                    onSettingChange={onSettingChange}
                    options={[ { value: 'Fixed', label: 'Fixed Key' }, { value: 'Roving', label: 'Roving Key' } ]}
                />
                {settings.rootNoteMode === 'Fixed' && (
                    <div className="flex gap-2 items-center">
                        <select value={settings.fixedKey} onChange={(e) => onSettingChange('fixedKey', e.target.value)} className="w-full p-2 bg-slate-700 rounded-md text-white border border-slate-500">
                            {keyOptions.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <button onClick={onRandomKey} className="p-2 bg-blue-600 hover:bg-blue-500 rounded-md font-semibold">Random</button>
                    </div>
                )}
                {settings.rootNoteMode === 'Roving' && (
                    <div className="flex items-center justify-between p-2 bg-slate-700 rounded-md">
                        <label htmlFor="qpr">Questions per Key:</label>
                        <input type="number" id="qpr" min="1" max="20" value={settings.questionsPerRoot} onChange={e => onSettingChange('questionsPerRoot', Number(e.target.value))} className="w-16 p-1 bg-slate-600 rounded-md text-center"/>
                    </div>
                )}
            </CollapsibleSection>

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
};