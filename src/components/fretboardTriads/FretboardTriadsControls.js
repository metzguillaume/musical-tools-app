import React from 'react';

const CollapsibleSection = ({ title, children }) => (
    <details className="border-t border-slate-600/80 pt-3 mt-3" open>
        <summary className="w-full flex justify-between items-center text-left text-lg font-bold text-teal-300 hover:text-teal-200 cursor-pointer list-none">
            <span>{title}</span>
            <span className="text-xl transition-transform transform duration-200 group-open:rotate-90">▶</span>
        </summary>
        <div className="pt-3 space-y-3">{children}</div>
    </details>
);

const ToggleCard = ({ label, isChecked, onChange }) => (
    <label className="flex items-center justify-between gap-2 cursor-pointer p-2 bg-slate-600 rounded-md">
        <span className="capitalize font-medium text-sm">{label.replace('construct', 'Construct ').replace(/([A-Z])/g, ' $1')}</span>
        <div className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={isChecked} onChange={onChange} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-500 rounded-full peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </div>
    </label>
);

export const FretboardTriadsControls = ({ settings, onSettingChange, onSavePreset }) => {
    
    const handleSettingToggle = (category, key) => {
        onSettingChange(category, {
            ...settings[category],
            [key]: !settings[category][key]
        });
    };
    
    const isConstructVertically = settings.modes.constructVertically;

    return (
        <div className="space-y-4">
            <CollapsibleSection title="Game Settings">
                <div>
                    <h3 className="font-semibold text-lg text-teal-300 mb-2">Modes</h3>
                    <div className="flex flex-col gap-2">
                        {Object.keys(settings.modes).map(key => (
                           <ToggleCard key={key} label={key} isChecked={settings.modes[key]} onChange={() => handleSettingToggle('modes', key)} />
                        ))}
                    </div>
                </div>
                
                <div className={isConstructVertically ? 'opacity-50' : ''}>
                    <h3 className="font-semibold text-lg text-teal-300 mb-2">String Sets</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.keys(settings.stringSets).map(key => (
                            <button key={key} onClick={() => !isConstructVertically && handleSettingToggle('stringSets', key)} className={`p-2 rounded-md font-semibold text-sm ${settings.stringSets[key] ? 'bg-blue-600 text-white' : 'bg-slate-600'}`}>
                                {key}
                            </button>
                        ))}
                    </div>
                    {isConstructVertically && <p className="text-xs text-amber-300 mt-1">String sets are not applicable for this mode.</p>}
                </div>
            </CollapsibleSection>

            <CollapsibleSection title="Triad Options">
                <div>
                    <h3 className="font-semibold text-lg text-teal-300 mb-2">Qualities</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {Object.keys(settings.qualities).map(key => (
                            <button key={key} onClick={() => handleSettingToggle('qualities', key)} className={`p-2 rounded-md font-semibold text-xs ${settings.qualities[key] ? 'bg-blue-600 text-white' : 'bg-slate-600'}`}>
                                {key}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold text-lg text-teal-300 mb-2">Inversions</h3>
                    <div className="grid grid-cols-3 gap-2">
                         {Object.keys(settings.inversions).map(key => (
                            <button key={key} onClick={() => handleSettingToggle('inversions', key)} className={`p-2 rounded-md font-semibold text-xs ${settings.inversions[key] ? 'bg-blue-600 text-white' : 'bg-slate-600'}`}>
                                {key}
                            </button>
                        ))}
                    </div>
                </div>
            </CollapsibleSection>

             <CollapsibleSection title="Display Options">
                <div>
                    <h3 className="font-semibold text-lg text-teal-300 mb-2">Post-Answer Display</h3>
                    <div className="flex bg-slate-600 rounded-md p-1">
                        <button onClick={() => onSettingChange('postAnswerDisplay', 'degrees')} className={`flex-1 rounded-md text-sm py-1 ${settings.postAnswerDisplay === 'degrees' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Degrees</button>
                        <button onClick={() => onSettingChange('postAnswerDisplay', 'names')} className={`flex-1 rounded-md text-sm py-1 ${settings.postAnswerDisplay === 'names' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Note Names</button>
                    </div>
                </div>
                <div className="pt-2">
                     <ToggleCard 
                        label="Show Root Hint (Identify Mode)" 
                        isChecked={settings.showRootHint} 
                        onChange={() => onSettingChange('showRootHint', !settings.showRootHint)} 
                    />
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