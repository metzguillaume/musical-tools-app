import React from 'react';
import { intervalData } from './useIntervalsQuiz';

// Reusable UI components from the original file
const CollapsibleSection = ({ title, isOpen, onToggle, children }) => (
    <div className="border-t border-slate-600/80 pt-3 mt-3">
        <button onClick={onToggle} className="w-full flex justify-between items-center text-left text-lg font-bold text-teal-300 hover:text-teal-200">
            <span>{title}</span><span className="text-xl">{isOpen ? '−' : '+'}</span>
        </button>
        {isOpen && <div className="pt-4 space-y-4">{children}</div>}
    </div>
);

// The new Controls Component
export const IntervalsQuizControls = ({
    settings,
    onSettingChange,
    audioDirection,
    onAudioDirectionChange,
    localVolume,
    onLocalVolumeChange,
    onVolumeSet,
    onIntervalSelectionChange,
    onQuickSelect,
    onSelectAll,
    onSavePreset,
    openControlSections,
    onToggleSection
}) => {

    const intervalGroups = React.useMemo(() => intervalData.reduce((acc, i) => {
        const group = i.number.includes('Unison') || i.number.includes('Octave') ? 'Unison/Octave' : `${i.number}s`;
        if (!acc[group]) acc[group] = [];
        acc[group].push(i);
        return acc;
    }, {}), []);

    return (
        <div className="space-y-6">
            <CollapsibleSection title="Quiz Options" isOpen={openControlSections.quiz} onToggle={() => onToggleSection('quiz')}>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-lg text-teal-300 mb-2">Quiz Mode</h4>
                        <div className="flex bg-slate-600 rounded-md p-1">
                            <button onClick={() => onSettingChange('quizMode', 'nameTheInterval')} className={`flex-1 rounded-md text-sm py-1 ${settings.quizMode === 'nameTheInterval' ? 'bg-blue-600 text-white' : ''}`}>Name Interval</button>
                            <button onClick={() => onSettingChange('quizMode', 'nameTheNote')} className={`flex-1 rounded-md text-sm py-1 ${settings.quizMode === 'nameTheNote' ? 'bg-blue-600 text-white' : ''}`}>Name Note</button>
                            <button onClick={() => onSettingChange('quizMode', 'mixed')} className={`flex-1 rounded-md text-sm py-1 ${settings.quizMode === 'mixed' ? 'bg-blue-600 text-white' : ''}`}>Mixed</button>
                        </div>
                    </div>

                    {(settings.quizMode === 'nameTheNote' || settings.quizMode === 'mixed') && (
                        <div className="p-3 bg-slate-900/50 rounded-lg space-y-3">
                             <h5 className="font-bold text-base text-teal-300 border-b border-slate-600 pb-1">"Name the Note" Settings</h5>
                             <div>
                                 <h4 className="font-semibold">Root Notes</h4>
                                 {/* --- FIX 1: The radio buttons are now styled labels, which will fix the double-click issue --- */}
                                 <div className="flex bg-slate-600 rounded-md p-1 mt-1">
                                    <label className={`flex-1 rounded-md text-sm py-1 text-center cursor-pointer ${settings.rootNoteType === 'natural' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>
                                         <input type="radio" name="rootType" value="natural" checked={settings.rootNoteType === 'natural'} onChange={() => onSettingChange('rootNoteType', 'natural')} className="sr-only" />
                                         Natural
                                    </label>
                                    <label className={`flex-1 rounded-md text-sm py-1 text-center cursor-pointer ${settings.rootNoteType === 'chromatic' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>
                                         <input type="radio" name="rootType" value="chromatic" checked={settings.rootNoteType === 'chromatic'} onChange={() => onSettingChange('rootNoteType', 'chromatic')} className="sr-only" />
                                         Chromatic
                                    </label>
                                 </div>
                             </div>
                             <div>
                                 <h4 className="font-semibold">Question Direction</h4>
                                 <div className="flex bg-slate-600 rounded-md p-1 mt-1">
                                     <button onClick={() => onSettingChange('direction', 'above')} className={`flex-1 rounded-md text-sm py-1 ${settings.direction === 'above' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Ascending</button>
                                     <button onClick={() => onSettingChange('direction', 'below')} className={`flex-1 rounded-md text-sm py-1 ${settings.direction === 'below' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Descending</button>
                                     <button onClick={() => onSettingChange('direction', 'both')} className={`flex-1 rounded-md text-sm py-1 ${settings.direction === 'both' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Both</button>
                                 </div>
                             </div>
                        </div>
                    )}

                    <div>
                        <label htmlFor="interval-audio-volume" className="font-semibold text-lg text-teal-300 mb-2 block">Audio Volume</label>
                        <input
                            type="range" id="interval-audio-volume" min="-30" max="0"
                            value={localVolume}
                            onChange={(e) => onLocalVolumeChange(Number(e.target.value))}
                            onMouseUp={() => onVolumeSet()}
                            onKeyUp={() => onVolumeSet()}
                            className="w-full h-3 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                 </div>
            </CollapsibleSection>
            <CollapsibleSection title="Interval Selection" isOpen={openControlSections.selection} onToggle={() => onToggleSection('selection')}>
                <div className="flex flex-wrap justify-start gap-2 mb-4">
                    <h4 className="text-lg font-semibold text-blue-200 w-full">Quick Select</h4>
                    <button onClick={() => onQuickSelect('Major')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1 px-3 text-sm rounded-lg">Toggle Major</button>
                    <button onClick={() => onQuickSelect('Minor')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1 px-3 text-sm rounded-lg">Toggle Minor</button>
                    <button onClick={() => onQuickSelect('Perfect')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1 px-3 text-sm rounded-lg">Toggle Perfect</button>
                    <button onClick={() => onSelectAll(true)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 text-sm rounded-lg">Select All</button>
                    <button onClick={() => onSelectAll(false)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 text-sm rounded-lg">Deselect All</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {Object.entries(intervalGroups).map(([groupName, intervals]) => (
                        <div key={groupName} className="break-inside-avoid">
                            <h5 className="font-bold text-base text-teal-300 mb-2 border-b border-slate-600 pb-1">{groupName}</h5>
                            <div className="flex flex-col gap-3">
                                {intervals.map(interval => (
                                    <label key={interval.name} className="flex items-center justify-between text-gray-200 cursor-pointer">
                                        <span className="text-sm">{interval.name}</span>
                                        <div className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={!!settings.selectedIntervals[interval.name]} onChange={() => onIntervalSelectionChange(interval.name)} className="sr-only peer" />
                                            {/* --- FIX 2: The full, correct list of classes for the toggle switch UI --- */}
                                            <div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </CollapsibleSection>
            <div className="border-t border-slate-600 pt-4 mt-4">
                <button onClick={onSavePreset} className="w-full py-2 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white">
                    Save Preset
                </button>
            </div>
        </div>
    );
};