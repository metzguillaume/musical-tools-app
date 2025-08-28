import React, { useState } from 'react';

const TRIAD_QUALITIES = ['Major', 'Minor', 'Diminished', 'Augmented', 'Sus2', 'Sus4'];
const SEVENTH_QUALITIES = ['Major 7th', 'Minor 7th', 'Dominant 7th', 'Half-Diminished 7th', 'Diminished 7th'];
const KEY_OPTIONS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F', 'Bb', 'Eb', 'Ab', 'Db'];

// --- Reusable UI Components ---

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

export const ChordEarTrainerControls = ({ settings, onSettingChange, onRandomKey, onSavePreset }) => {
    const [openSections, setOpenSections] = useState({
        playback: true,
        chords: true,
        key: false,
    });

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleQualityToggle = (quality) => {
        onSettingChange('qualities', {
            ...settings.qualities,
            [quality]: !settings.qualities[quality]
        });
    };

    return (
        <div className="space-y-4 text-sm">

            <CollapsibleSection title="Playback Options" isOpen={openSections.playback} onToggle={() => toggleSection('playback')}>
                <SegmentedControl
                    label="Playback Style"
                    settingKey="playbackStyle"
                    settings={settings}
                    onSettingChange={onSettingChange}
                    options={[{ value: 'Melodic', label: 'Arpeggio' }, { value: 'Harmonic', label: 'Chord' }]}
                />
            </CollapsibleSection>

            <CollapsibleSection title="Chord Selection" isOpen={openSections.chords} onToggle={() => toggleSection('chords')}>
                <div>
                    <h4 className="font-semibold text-gray-300 mb-2">Triads</h4>
                    <div className="grid grid-cols-3 gap-2">
                        {TRIAD_QUALITIES.map(q => (
                            <button key={q} onClick={() => handleQualityToggle(q)} className={`p-2 rounded-md font-semibold text-xs ${settings.qualities[q] ? 'bg-blue-600 text-white' : 'bg-slate-600'}`}>
                                {q}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-300 mb-2 mt-3">7th Chords</h4>
                    <div className="grid grid-cols-3 gap-2">
                        {SEVENTH_QUALITIES.map(q => (
                            <button key={q} onClick={() => handleQualityToggle(q)} className={`p-2 rounded-md font-semibold text-xs ${settings.qualities[q] ? 'bg-blue-600 text-white' : 'bg-slate-600'}`}>
                                {q}
                            </button>
                        ))}
                    </div>
                </div>
            </CollapsibleSection>
            
            <CollapsibleSection title="Key Options" isOpen={openSections.key} onToggle={() => toggleSection('key')}>
                <SegmentedControl
                    label="Key Mode"
                    settingKey="keyMode"
                    settings={settings}
                    onSettingChange={onSettingChange}
                    options={[{ value: 'Fixed', label: 'Fixed Key' }, { value: 'Roving', label: 'Roving Key' }]}
                />
                {settings.keyMode === 'Fixed' && (
                    <div className="flex gap-2 items-center mt-2">
                        <select value={settings.fixedKey} onChange={(e) => onSettingChange('fixedKey', e.target.value)} className="w-full p-2 bg-slate-700 rounded-md text-white border border-slate-500">
                            {KEY_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <button onClick={onRandomKey} className="p-2 bg-blue-600 hover:bg-blue-500 rounded-md font-semibold">Random</button>
                    </div>
                )}
                {settings.keyMode === 'Roving' && (
                    <div className="flex items-center justify-between p-2 bg-slate-700 rounded-md mt-2">
                        <label htmlFor="qpk" className="font-semibold">Questions per Key:</label>
                        <input 
                            type="number" id="qpk" min="1" max="20" 
                            value={settings.questionsPerKey} 
                            onChange={e => onSettingChange('questionsPerKey', Number(e.target.value))} 
                            className="w-16 p-1 bg-slate-600 rounded-md text-center"
                        />
                    </div>
                )}
            </CollapsibleSection>

            <div className="border-t border-slate-600 pt-4 mt-4">
                 <button onClick={onSavePreset} className="w-full py-2 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white">
                    Save Preset
                </button>
            </div>
        </div>
    );
};