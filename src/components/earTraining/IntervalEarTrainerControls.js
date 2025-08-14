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
const SettingToggle = ({ label, settingKey, settings, onSettingChange, highlight = false, disabled = false }) => (
    <label className={`flex items-center justify-between gap-2 cursor-pointer p-2 rounded-md ${disabled ? 'bg-slate-800' : 'bg-slate-700'}`}>
        <span className={`font-semibold ${highlight ? 'text-green-300' : ''} ${disabled ? 'text-gray-500' : ''}`}>
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
            <div className={`w-11 h-6 bg-gray-500 rounded-full peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${disabled ? 'cursor-not-allowed' : 'peer-focus:ring-4 peer-focus:ring-blue-300'} ${highlight ? 'peer-checked:bg-green-600' : 'peer-checked:bg-blue-600'}`}></div>
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

export const IntervalEarTrainerControls = ({ settings, onSettingChange, onSavePreset }) => {
    // State to manage which sections are open
    const [openSections, setOpenSections] = useState({
        general: true,
        playback: false,
        question: false,
    });

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    return (
        <div className="space-y-4 text-sm">

            <CollapsibleSection title="General Settings" isOpen={openSections.general} onToggle={() => toggleSection('general')}>
                <SettingToggle label="Training Mode" settingKey="isTrainingMode" settings={settings} onSettingChange={onSettingChange} highlight={true} />
                <SettingToggle label="Replay on Answer" settingKey="replayOnAnswer" settings={settings} onSettingChange={onSettingChange} />
                <SegmentedControl
                    label="Answer Mode"
                    settingKey="answerMode"
                    settings={settings}
                    onSettingChange={onSettingChange}
                    options={[
                        { value: 'Interval Name', label: 'Interval Name' },
                        { value: 'Scale Degree', label: 'Scale Degree' },
                        { value: 'Note Names', label: 'Note Names' },
                    ]}
                />
            </CollapsibleSection>

            <CollapsibleSection title="Playback Options" isOpen={openSections.playback} onToggle={() => toggleSection('playback')}>
                <SegmentedControl
                    label="Playback Style"
                    settingKey="playbackStyle"
                    settings={settings}
                    onSettingChange={onSettingChange}
                    options={[ { value: 'Melodic', label: 'Melodic' }, { value: 'Harmonic', label: 'Harmonic' } ]}
                />
                <SegmentedControl
                    label="Direction"
                    settingKey="direction"
                    settings={settings}
                    onSettingChange={onSettingChange}
                    options={[ { value: 'Ascending', label: 'Ascending' }, { value: 'Descending', label: 'Descending' }, { value: 'Both', label: 'Both' } ]}
                />
                <SettingToggle label="Use Drone" settingKey="useDrone" settings={settings} onSettingChange={onSettingChange} />
                <SettingToggle 
                    label="Play First Note" 
                    settingKey="playRootNote" 
                    settings={settings} 
                    onSettingChange={onSettingChange} 
                    disabled={settings.playbackStyle !== 'Melodic' || !settings.useDrone}
                />
            </CollapsibleSection>

            <CollapsibleSection title="Question Options" isOpen={openSections.question} onToggle={() => toggleSection('question')}>
                 <SegmentedControl
                    label="Note Pool"
                    settingKey="notePool"
                    settings={settings}
                    onSettingChange={onSettingChange}
                    options={[ { value: 'Chromatic', label: 'Chromatic' }, { value: 'Diatonic', label: 'Diatonic' } ]}
                />
                {settings.notePool === 'Diatonic' && (
                    <SegmentedControl
                        label="Diatonic Mode"
                        settingKey="diatonicMode"
                        settings={settings}
                        onSettingChange={onSettingChange}
                        options={[ { value: 'Major', label: 'Major' }, { value: 'Minor', label: 'Minor' } ]}
                    />
                )}
                <SegmentedControl
                    label="Key/Root Mode"
                    settingKey="rootNoteMode"
                    settings={settings}
                    onSettingChange={onSettingChange}
                    options={[ { value: 'Fixed', label: 'Fixed' }, { value: 'Roving', label: 'Roving' } ]}
                />

                {settings.rootNoteMode === 'Fixed' && (
                    <select value={settings.fixedKey} onChange={(e) => onSettingChange('fixedKey', e.target.value)} className="w-full p-2 mt-2 bg-slate-600 rounded-md">
                        {keyOptions.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                )}
                {settings.rootNoteMode === 'Roving' && (
                    <>
                        <div className="flex items-center justify-between p-2 bg-slate-700 rounded-md">
                            <label htmlFor="qpr" className="font-semibold">Questions per Key:</label>
                            <input type="number" id="qpr" min="1" max="20" value={settings.questionsPerRoot} onChange={e => onSettingChange('questionsPerRoot', Number(e.target.value))} className="w-16 p-1 bg-slate-600 rounded-md text-center"/>
                        </div>
                        <SettingToggle label="Show Key Change Alert" settingKey="showKeyChange" settings={settings} onSettingChange={onSettingChange} />
                    </>
                )}
                <div className="mt-2">
                    <label htmlFor="octave-range" className="font-semibold">Octave Range: {settings.octaveRange}</label>
                    <input type="range" id="octave-range" min="1" max="3" step="1" value={settings.octaveRange} onChange={e => onSettingChange('octaveRange', Number(e.target.value))} className="w-full h-2 mt-1 bg-slate-600 rounded-lg appearance-none cursor-pointer" />
                </div>
            </CollapsibleSection>

            <div className="border-t border-slate-600 pt-4 mt-4">
                 <button onClick={onSavePreset} className="w-full py-2 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white">
                    Save Current Settings as Preset
                </button>
            </div>
        </div>
    );
};