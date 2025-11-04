// src/components/rhythmTool/RhythmTool.js

import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, useDraggable } from '@dnd-kit/core';
import { useTools } from '../../context/ToolsContext';
import { useRhythmEngine } from './useRhythmEngine';
import InfoModal from '../common/InfoModal';
import QuizLayout from '../common/QuizLayout';
import { RhythmToolControls } from './RhythmToolControls';
import { Measure } from './Measure';
import { PALETTE_ITEMS, TIME_SIGNATURES } from './rhythmConstants';

// --- Draggable Item (for the palette) ---
const DraggableNote = ({ id, item }) => {
    // ... (no changes in this component)
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: id,
        data: item,
    });
    const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
    
    return (
        <button ref={setNodeRef} style={style} {...listeners} {...attributes} className="p-2 bg-slate-600 rounded-md text-teal-200 font-mono text-4xl cursor-grab active:cursor-grabbing">
            {item.symbol}
        </button>
    );
};

// --- Main Tool Component ---
const RhythmTool = (props) => {
    const { 
        addLogEntry, 
        savePreset, 
        presetToLoad, 
        clearPresetToLoad,
        // +++ FIX: REMOVED isMetronomePlaying, toggleMetronome +++
    } = useTools();
    
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isControlsOpen, setIsControlsOpen] = useState(false);
    const [activeDragItem, setActiveDragItem] = useState(null);

    const { 
        settings, 
        setSettings,
        bpm,
        setBpm,
        measures, 
        measureDurations, 
        beatsPerMeasure, 
        isPlaying, 
        currentlyPlayingId,
        isQuizMode,
        actions 
    } = useRhythmEngine();

    // ... (useEffect for preset loading - no changes) ...
    useEffect(() => {
        if (presetToLoad && presetToLoad.gameId === 'rhythm-trainer') {
            const presetSettings = { ...presetToLoad.settings };
            if (presetToLoad.settings.timeSignature?.label) {
                presetSettings.timeSignature = TIME_SIGNATURES.find(
                    ts => ts.label === presetToLoad.settings.timeSignature.label
                ) || TIME_SIGNATURES[0];
            }
            if (presetSettings.bpm) {
                setBpm(presetSettings.bpm);
            }
            delete presetSettings.bpm; 
            setSettings(prev => ({...prev, ...presetSettings})); // Merge with defaults
            clearPresetToLoad();
        }
    }, [presetToLoad, clearPresetToLoad, setSettings, setBpm]);

    // ... (handleSavePreset - no changes) ...
    const handleSavePreset = () => {
        const name = prompt("Enter a name for your preset:", "My Rhythm Setting");
        if (name && name.trim() !== "") {
            const settingsToSave = { ...settings, bpm: bpm };
            savePreset({
                id: `rhythm-${Date.now()}`,
                name: name.trim(),
                gameId: 'rhythm-trainer',
                gameName: 'Rhythm Trainer',
                settings: settingsToSave,
            });
            alert(`Preset "${name.trim()}" saved!`);
        }
    };
    
    // ... (Drag handlers - no changes) ...
    const handleDragStart = (event) => {
        setActiveDragItem(event.active.data.current);
    };

    const handleDragEnd = (event) => {
        setActiveDragItem(null);
        const { over, active } = event;
        if (over && over.data.current?.measureIndex !== undefined) {
            const measureIndex = over.data.current.measureIndex;
            const newItem = active.data.current;
            actions.addRhythmItem(measureIndex, newItem);
        }
    };

    // +++ FIX: This toggle now controls the LOCAL useMetronome setting +++
    const topControlsContent = (
      <label className="flex items-center gap-2 cursor-pointer font-semibold">
          <span>Metronome</span>
          <div className="relative">
              <input 
                  type="checkbox" 
                  checked={settings.useMetronome} 
                  onChange={() => actions.handleSettingChange('useMetronome', !settings.useMetronome)} 
                  className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </div>
      </label>
    );
    // +++ END FIX +++

    const footerContent = (
        // ... (no changes)
        <div className="flex items-center gap-4">
            <button 
                onClick={isPlaying ? actions.stopRhythm : actions.playRhythm}
                className={`font-bold py-3 px-8 rounded-lg ${
                    isPlaying 
                        ? 'bg-red-600 hover:bg-red-500 text-white' 
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
            >
                {isPlaying ? 'Stop' : (isQuizMode ? 'Check Answer' : 'Play')}
            </button>
            <button onClick={actions.clearBoard} disabled={isQuizMode || isPlaying} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg disabled:opacity-50">
                Clear
            </button>
        </div>
    );

    const mainContent = (
        // ... (no changes)
        <div className="flex flex-col xl:flex-row gap-4">
            {!isQuizMode && (
                <div className="xl:w-1/5 p-2 bg-slate-900 rounded-lg flex flex-col gap-2 self-start">
                    <h3 className="text-sm font-semibold text-gray-400 text-center">Drag Notes</h3>
                    <div className="grid grid-cols-5 xl:grid-cols-2 gap-2">
                        {PALETTE_ITEMS.map(([key, item]) => (
                            <DraggableNote key={key} id={key} item={item} />
                        ))}
                    </div>
                </div>
            )}
            
            <div className={`flex-1 flex flex-wrap gap-x-4 gap-y-8 p-2 bg-slate-800 rounded-lg ${isQuizMode ? 'w-full' : 'xl:w-4/5'}`}>
                {measures.map((measure, index) => (
                    <Measure 
                        key={index}
                        measureIndex={index}
                        measure={measure}
                        duration={measureDurations[index]}
                        beatsPerMeasure={beatsPerMeasure}
                        timeSignature={settings.timeSignature}
                        isQuizMode={isQuizMode}
                        showBeatDisplay={settings.showBeatDisplay}
                        onRemoveItem={actions.removeRhythmItem}
                        onRemoveMeasure={() => actions.removeMeasure(index)}
                        currentlyPlayingId={currentlyPlayingId}
                    />
                ))}
                {!isQuizMode && settings.measureCount < 8 && (
                    <button 
                        onClick={() => actions.handleSettingChange('measureCount', settings.measureCount + 1)}
                        className="flex-shrink-0 w-24 h-40 flex items-center justify-center bg-slate-700/50 hover:bg-slate-700 border-2 border-dashed border-gray-500 rounded-md text-gray-400 text-5xl"
                        title="Add Measure"
                    >
                        +
                    </button>
                )}
            </div>
        </div>
    );

    if (props.onProgressUpdate) {
        return mainContent;
    }

    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex flex-col md:flex-row items-start w-full gap-4">
                {/* ... (InfoModal - no changes) ... */}
                <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Rhythm Trainer Guide">
                    <p>Welcome to the Rhythm Trainer! This tool has two modes:</p>
                    <h4 className="font-bold text-indigo-300 mt-4">Write Mode</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Drag notes and rests from the palette onto a measure.</li>
                        <li>Click a note in a measure to remove it. Click the (X) on a measure to remove it.</li>
                        <li>Use the "Play" button to hear your creation. It will sync to the next measure if the metronome is on.</li>
                        <li>Toggle the global "Metronome" at the top to practice along.</li>
                    </ul>
                    <h4 className="font-bold text-indigo-300 mt-4">Read Quiz Mode</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                        <li>The tool will show you a rhythm.</li>
                        <li>Press "Check Answer" to hear the correct rhythm.</li>
                    </ul>
                </InfoModal>

                <QuizLayout
                    title="Rhythm Trainer"
                    score={0} totalAsked={0} history={[]} 
                    topControls={topControlsContent} 
                    onLogProgress={() => addLogEntry({ game: 'Rhythm Trainer', date: new Date().toLocaleDateString(), remarks: 'Rhythm practice session' })}
                    onToggleControls={() => setIsControlsOpen(p => !p)}
                    onShowInfo={() => setIsInfoModalOpen(true)}
                    footerContent={footerContent}
                >
                    {mainContent}
                </QuizLayout>
                
                {/* ... (DragOverlay - no changes) ... */}
                <DragOverlay>
                    {activeDragItem ? (
                        <div className="p-2 bg-blue-500 rounded-md text-white font-mono text-4xl cursor-grabbing shadow-xl">
                            {activeDragItem.symbol}
                        </div>
                    ) : null}
                </DragOverlay>

                {/* ... (Controls panels - no changes) ... */}
                <div className={`hidden md:block bg-slate-700 rounded-lg transition-all duration-300 ease-in-out ${isControlsOpen ? 'w-80 p-4' : 'w-0 p-0 overflow-hidden'}`}>
                    <div className={`${!isControlsOpen && 'hidden'}`}>
                        <h3 className="text-xl font-bold text-teal-300 mb-4">Settings & Controls</h3>
                        <RhythmToolControls 
                            settings={settings} 
                            bpm={bpm}
                            onBpmChange={setBpm}
                            onSettingChange={actions.handleSettingChange} 
                            onSavePreset={handleSavePreset} 
                        />
                    </div>
                </div>

                {isControlsOpen && (
                    <div className="md:hidden fixed inset-0 z-50 flex justify-center items-center bg-black/60" onClick={() => setIsControlsOpen(false)}>
                        <div className="w-11/12 max-w-sm bg-slate-800 rounded-2xl p-4 max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                            <div className="flex-shrink-0 flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-teal-300">Settings & Controls</h3><button onClick={() => setIsControlsOpen(false)} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button></div>
                            <div className="flex-grow overflow-y-auto pr-2">
                                <RhythmToolControls 
                                    settings={settings} 
                                    bpm={bpm}
                                    onBpmChange={setBpm}
                                    onSettingChange={actions.handleSettingChange} 
                                    onSavePreset={handleSavePreset} 
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DndContext>
    );
};

export default RhythmTool;