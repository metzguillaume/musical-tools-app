import React from 'react';

const CollapsibleSection = ({ title, isOpen, onToggle, children }) => (
    <div className="border-t border-slate-600/80 pt-3 mt-3">
        <button
            onClick={onToggle}
            className="w-full flex justify-between items-center text-left text-lg font-bold text-teal-300 hover:text-teal-200"
        >
            <span>{title}</span>
            <span className="text-xl">{isOpen ? '−' : '+'}</span>
        </button>
        {isOpen && <div className="pt-3 space-y-4">{children}</div>}
    </div>
);

const rootNoteOptions = ['C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'F#', 'B', 'E', 'A', 'D', 'G'];
const keyTypeOptions = ['Major', 'Natural Minor', 'Harmonic Minor', 'Melodic Minor'];

export const ChordProgressionGeneratorControls = ({
    settings,
    onSettingChange,
    onQualityFilterChange,
    isAutoGenerateOn,
    onAutoGenerateToggle,
    autoGenerateInterval,
    onIntervalChange,
    countdownClicks,
    onCountdownChange,
    openSections,
    onToggleSection,
    onSavePreset
}) => (
    <>
        <CollapsibleSection title="General Settings" isOpen={openSections.general} onToggle={() => onToggleSection('general')}>
            <div>
                <label className="font-semibold block mb-1">Root Note</label>
                <select value={settings.rootNote} onChange={e => onSettingChange('rootNote', e.target.value)} className="w-full p-2 rounded-md bg-slate-600 text-white">{rootNoteOptions.map(n => <option key={n} value={n}>{n}</option>)}</select>
            </div>
            <div>
                <label className="font-semibold block mb-1">Key / Scale</label>
                <select value={settings.keyType} onChange={e => onSettingChange('keyType', e.target.value)} className="w-full p-2 rounded-md bg-slate-600 text-white">{keyTypeOptions.map(k => <option key={k} value={k}>{k}</option>)}</select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="font-semibold block mb-1">Chords/Line</label>
                    <input type="number" value={settings.numChords} onChange={e => onSettingChange('numChords', Math.max(1, parseInt(e.target.value, 10) || 1))} className="w-full p-2 rounded-md bg-slate-600 text-white"/>
                </div>
                <div>
                    <label className="font-semibold block mb-1">Lines</label>
                    <input type="number" value={settings.numProgressions} onChange={e => onSettingChange('numProgressions', Math.max(1, parseInt(e.target.value, 10) || 1))} className="w-full p-2 rounded-md bg-slate-600 text-white"/>
                </div>
            </div>
            <div>
                <label className="font-semibold block mb-1">Generation Method</label>
                <div className="flex bg-slate-600 rounded-md p-1">
                    <button onClick={() => onSettingChange('useCommonPatterns', true)} className={`flex-1 rounded-md text-sm py-1 ${settings.useCommonPatterns ? 'bg-blue-600' : 'text-gray-300'} disabled:bg-slate-800 disabled:text-gray-500 disabled:cursor-not-allowed`} disabled={settings.qualityFilter !== 'all'} title={settings.qualityFilter !== 'all' ? "Not available with quality filters" : ""}>Common</button>
                    <button onClick={() => onSettingChange('useCommonPatterns', false)} className={`flex-1 rounded-md text-sm py-1 ${!settings.useCommonPatterns ? 'bg-blue-600' : 'text-gray-300'}`}>Random</button>
                </div>
            </div>
        </CollapsibleSection>

        <CollapsibleSection title="Chord Options" isOpen={openSections.options} onToggle={() => onToggleSection('options')}>
            <div>
                <label className="font-semibold block mb-1">Chord Complexity</label>
                <div className="flex bg-slate-600 rounded-md p-1">
                    <button onClick={() => onSettingChange('chordComplexity', 'Triads')} className={`flex-1 rounded-md text-sm py-1 ${settings.chordComplexity === 'Triads' ? 'bg-blue-600' : 'text-gray-300'}`}>Triads</button>
                    <button onClick={() => onSettingChange('chordComplexity', 'Tetrads')} className={`flex-1 rounded-md text-sm py-1 ${settings.chordComplexity === 'Tetrads' ? 'bg-blue-600' : 'text-gray-300'}`}>Tetrads</button>
                </div>
            </div>
            <div>
                <label className="font-semibold block mb-1">Chord Quality</label>
                <div className="flex bg-slate-600 rounded-md p-1">
                    <button onClick={() => onQualityFilterChange('all')} className={`flex-1 rounded-md text-sm py-1 ${settings.qualityFilter === 'all' ? 'bg-blue-600' : 'text-gray-300'}`}>All</button>
                    <button onClick={() => onQualityFilterChange('major')} className={`flex-1 rounded-md text-sm py-1 ${settings.qualityFilter === 'major' ? 'bg-blue-600' : 'text-gray-300'}`}>Major</button>
                    <button onClick={() => onQualityFilterChange('minor')} className={`flex-1 rounded-md text-sm py-1 ${settings.qualityFilter === 'minor' ? 'bg-blue-600' : 'text-gray-300'}`}>Minor</button>
                </div>
            </div>
             <label className="flex items-center justify-between gap-2 cursor-pointer pt-1">
                <span className="font-semibold">Include Diminished</span>
                <div className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={settings.includeDiminished} onChange={() => onSettingChange('includeDiminished', !settings.includeDiminished)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </div>
            </label>
        </CollapsibleSection>
        
        <CollapsibleSection title="Display Settings" isOpen={openSections.display} onToggle={() => onToggleSection('display')}>
            <div>
                <label className="font-semibold block mb-1">Display Mode</label>
                <div className="flex bg-slate-600 rounded-md p-1">
                    <button onClick={() => onSettingChange('displayMode', 'chords')} className={`flex-1 rounded-md text-sm py-1 ${settings.displayMode === 'chords' ? 'bg-blue-600' : 'text-gray-300'}`}>Chords</button>
                    <button onClick={() => onSettingChange('displayMode', 'degrees')} className={`flex-1 rounded-md text-sm py-1 ${settings.displayMode === 'degrees' ? 'bg-blue-600' : 'text-gray-300'}`}>Degrees</button>
                    <button onClick={() => onSettingChange('displayMode', 'both')} className={`flex-1 rounded-md text-sm py-1 ${settings.displayMode === 'both' ? 'bg-blue-600' : 'text-gray-300'}`}>Both</button>
                </div>
            </div>
        </CollapsibleSection>

        <CollapsibleSection title="Automation" isOpen={openSections.automation} onToggle={() => onToggleSection('automation')}>
             <div className="flex items-center justify-between">
                <label htmlFor="auto-generate-prog" className="font-semibold text-lg text-teal-300">Auto-Generate:</label>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="auto-generate-prog" checked={isAutoGenerateOn} onChange={onAutoGenerateToggle} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
            </div>
            <div className="flex items-center justify-between">
                <label htmlFor="auto-generate-interval-prog" className={`font-semibold ${!isAutoGenerateOn && 'opacity-50'}`}>Every:</label>
                <div className="flex items-center gap-2">
                    {/* FIXED: Added full class string */}
                    <input type="number" id="auto-generate-interval-prog" value={autoGenerateInterval} onChange={(e) => onIntervalChange(Math.max(1, parseInt(e.target.value, 10) || 1))} className={`w-20 p-2 rounded-md bg-slate-600 text-white text-center ${!isAutoGenerateOn && 'opacity-50'}`} min="1" disabled={!isAutoGenerateOn} />
                    <span className={`font-semibold ${!isAutoGenerateOn && 'opacity-50'}`}>clicks</span>
                </div>
            </div>
             <div className="flex items-center justify-between">
                <label htmlFor="countdown-clicks-prog" className={`font-semibold ${!isAutoGenerateOn && 'opacity-50'}`}>Countdown:</label>
                <div className="flex items-center gap-2">
                    {/* FIXED: Added full class string */}
                    <input type="number" id="countdown-clicks-prog" value={countdownClicks} onChange={(e) => onCountdownChange(Math.max(0, parseInt(e.target.value, 10) || 0))} className={`w-20 p-2 rounded-md bg-slate-600 text-white text-center ${!isAutoGenerateOn && 'opacity-50'}`} min="0" max="7" disabled={!isAutoGenerateOn} />
                     <span className={`font-semibold ${!isAutoGenerateOn && 'opacity-50'}`}>clicks</span>
                </div>
            </div>
        </CollapsibleSection>
        <div className="border-t border-slate-600 pt-4 mt-4">
            <button onClick={onSavePreset} className="w-full py-2 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white">
                Save Preset
            </button>
        </div>
    </>
);