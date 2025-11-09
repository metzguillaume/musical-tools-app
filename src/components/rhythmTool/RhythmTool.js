// src/components/rhythmTool/RhythmTool.js

import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, useDraggable } from '@dnd-kit/core';
import { useTools } from '../../context/ToolsContext';
import { useRhythmEngine } from './useRhythmEngine';
import InfoModal from '../common/InfoModal';
import QuizLayout from '../common/QuizLayout';
import { RhythmToolControls } from './RhythmToolControls';
import { VexFlowMeasure } from './VexFlowMeasure'; 
import { PALETTE_ITEMS, TIME_SIGNATURES } from './rhythmConstants';

// ... (DraggableNote component is unchanged) ...
const DraggableNote = ({ id, item }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: id,
        data: item,
    });
    const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
    
    return (
        <button 
            ref={setNodeRef} 
            style={style} 
            {...listeners} 
            {...attributes} 
            title={item.label}
            className="p-2 bg-slate-600 rounded-md text-teal-200 font-mono text-3xl cursor-grab active:cursor-grabbing h-16 w-16 flex items-center justify-center"
        >
            {item.image ? (
                <img src={item.image} alt={item.label} className="h-10 w-auto object-contain" />
            ) : (
                item.symbol
            )}
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
    } = useTools();
    
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isControlsOpen, setIsControlsOpen] = useState(false);
    const [activeDragItem, setActiveDragItem] = useState(null);
    const [lastPlayedId, setLastPlayedId] = useState(null);

    // +++ FIX: Pass preset props into the hook +++
    const { 
        settings, 
        // setSettings, // No longer used directly
        bpm,
        setBpm,
        measures, 
        beatsPerMeasure, 
        isPlaying, 
        currentlyPlayingId, 
        currentlyPlayingMeasureIndex, 
        isQuizMode,
        actions 
    } = useRhythmEngine({ presetToLoad, clearPresetToLoad });

    // +++ FIX: This useEffect is now GONE, as the logic is inside useRhythmEngine +++
    // (The old, buggy preset-loading useEffect has been removed)

    // ... (useEffect for highlighting NOTE - no changes) ...
    useEffect(() => {
        if (lastPlayedId) {
            const el = document.getElementById(lastPlayedId);
            if (el) {
                el.setAttribute('fill', 'black');
                el.querySelectorAll('path').forEach(path => {
                    path.setAttribute('fill', 'black');
                });
            }
        }
        if (currentlyPlayingId) {
            const el = document.getElementById(currentlyPlayingId);
            if (el) {
                el.setAttribute('fill', 'red');
                el.querySelectorAll('path').forEach(path => {
                    path.setAttribute('fill', 'red');
                });
                setLastPlayedId(currentlyPlayingId);
            }
        } else if (lastPlayedId) {
            const el = document.getElementById(lastPlayedId);
            if (el) {
                el.setAttribute('fill', 'black');
                el.querySelectorAll('path').forEach(path => {
                    path.setAttribute('fill', 'black');
                });
            }
            setLastPlayedId(null);
        }
    }, [currentlyPlayingId, lastPlayedId]);


    // ... (handleSavePreset... no changes) ...
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
    
    // ... (Drag Handlers - no changes) ...
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

    // ... (topControlsContent - no changes) ...
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

    // ... (footerContent - no changes) ...
    const footerContent = (
        <div className="flex items-center gap-4">
            <button 
                onClick={isPlaying ? actions.stopRhythm : actions.playRhythm}
                className={`font-bold py-3 px-8 rounded-lg ${
                    isPlaying 
                        ? 'bg-red-600 hover:bg-red-500 text-white' 
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
            >
                {isPlaying ? 'Stop' : (isQuizMode ? 'Check Answer' : 'Play All')}
            </button>

            {isQuizMode ? (
                <button onClick={actions.generateNewQuiz} disabled={isPlaying} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg disabled:opacity-50">
                    New Question
                </button>
            ) : (
                <button onClick={actions.clearBoard} disabled={isPlaying} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg disabled:opacity-50">
                    Clear
                </button>
            )}
        </div>
    );

    // ... (defaultMeasureWidth - no changes) ...
    const defaultMeasureWidth = 480; 
    
    const mainContent = (
        <div className="flex flex-col gap-4">
            
            {/* --- Measures Area --- */}
            <div className={`flex-1 flex flex-wrap gap-x-4 gap-y-8 p-2 bg-slate-800 rounded-lg w-full`}>
                
                <React.Fragment>
                    {measures.map((measure, index) => (
                        <div key={index} className="relative flex items-start gap-2 flex-shrink-0">
                            <VexFlowMeasure
                                measure={measure}
                                timeSignature={settings.timeSignature}
                                width={defaultMeasureWidth}
                                measureIndex={index}
                                isQuizMode={isQuizMode}
                                beatsPerMeasure={beatsPerMeasure}
                                isPlaying={index === currentlyPlayingMeasureIndex} 
                            />
                            {!isQuizMode && (
                                <div className="flex flex-col gap-2 w-20 flex-shrink-0">
                                    <button
                                        onClick={() => actions.playMeasure(index)}
                                        disabled={isPlaying}
                                        className="py-1 px-2 text-xs bg-green-600 hover:bg-green-500 text-white font-bold rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Play Measure"
                                    >
                                        Play
                                    </button>
                                    <button 
                                        onClick={() => actions.removeMeasure(index)} 
                                        className="py-1 px-2 text-xs bg-red-700 hover:bg-red-600 text-white font-bold rounded"
                                        title="Remove Measure"
                                    >
                                        Remove
                                    </button>
                                    <button
                                        onClick={() => actions.removeLastRhythmItem(index)}
                                        className="py-1 px-2 text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold rounded"
                                        title="Remove Last Note"
                                    >
                                        Undo
                                    </button>
                                    <button
                                        onClick={() => actions.clearMeasure(index)}
                                        className="py-1 px-2 text-xs bg-gray-600 hover:bg-gray-500 text-white font-bold rounded"
                                        title="Clear Measure"
                                    >
                                        Clear
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    {!isQuizMode && settings.measureCount < 8 && (
                        <button 
                            onClick={() => actions.handleSettingChange('measureCount', settings.measureCount + 1)}
                            className="flex-shrink-0 w-24 h-[120px] flex items-center justify-center bg-slate-700/50 hover:bg-slate-700 border-2 border-dashed border-gray-500 rounded-md text-gray-400 text-5xl"
                            title="Add Measure"
                        >
                            +
                        </button>
                    )}
                </React.Fragment>
            </div>

            {/* --- Palette Area (Unchanged) --- */}
            {!isQuizMode && (
                <div className="w-full mt-4 p-2 bg-slate-900 rounded-lg flex flex-col gap-2">
                    <h3 className="text-sm font-semibold text-gray-400 text-center">Drag and drop notes to measure</h3>
                    <div className="flex flex-row flex-wrap justify-center gap-2">
                        {PALETTE_ITEMS.map(([key, item]) => (
                            <DraggableNote 
                                key={key} 
                                id={key} 
                                item={item}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    if (props.onProgressUpdate) {
        return mainContent;
    }
    
    // ... (handleLog - no changes) ...
    const handleLog = () => {
        const defaultRemarks = `Rhythm practice (${settings.timeSignature.label}, ${bpm} bpm, ${settings.mode} mode)`;
        const remarks = prompt("Enter log remarks:", defaultRemarks);

        if (remarks && remarks.trim() !== "") {
            addLogEntry({ 
                game: 'Rhythm Trainer', 
                date: new Date().toLocaleDateString(), 
                remarks: remarks.trim() 
            });
            alert("Session logged!");
        }
    };

    // ... (Rest of component is unchanged) ...
    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex flex-col md:flex-row items-start w-full gap-4">
                <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Rhythm Trainer Guide">
                    <div className="space-y-4 text-gray-300">
                        <p>Welcome to the Rhythm Trainer! This tool has two modes:</p>
                        
                        <div>
                            <h4 className="font-semibold text-lg text-teal-300 mb-1">Write Mode</h4>
                            <p>
                                Compose your own rhythms. Drag notes from the palette at the bottom onto a measure. The measure will automatically fill with rests.
                            </p>
                            <ul className="list-disc list-inside ml-4 mt-2">
                                <li>Use the "Play" button on a measure to hear it.</li>
                                <li>Use "Play All" to hear all measures.</li>
                                <li>Click "Undo" to remove the last note added.</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg text-teal-300 mb-1">Read Quiz Mode</h4>
                            <p>
                                Test your rhythm reading skills. The tool will generate a rhythm based on your settings.
                            </p>
                            <ul className="list-disc list-inside ml-4 mt-2">
                                <li>Press "Check Answer" to hear the rhythm played back.</li>
                                <li>Use the settings panel to control the quiz parameters.</li>
                                <li>**Complexity:** Controls *how* rhythms are combined, from simple on-beats to complex syncopation.</li>
                                <li>**Include Rhythms:** Select which *ingredients* (notes/rests) are allowed in the quiz.</li>
                            </ul>
                        </div>

                    </div>
                </InfoModal>

                <QuizLayout
                    title="Rhythm Trainer"
                    score={null} totalAsked={null} history={[]} 
                    topControls={topControlsContent} 
                    onLogProgress={handleLog} 
                    onToggleControls={() => setIsControlsOpen(p => !p)}
                    onShowInfo={() => setIsInfoModalOpen(true)}
                >
                    <div className="relative">
                        {mainContent}
                        <div className="sticky bottom-0 bg-slate-800 p-4 mt-8 border-t border-slate-700 z-10">
                            {footerContent}
                        </div>
                    </div>
                </QuizLayout>
                
                <DragOverlay>
                    {activeDragItem ? (
                        <div className="p-2 bg-blue-500 rounded-md text-white font-mono text-3xl cursor-grabbing shadow-xl h-16 w-16 flex items-center justify-center">
                            {activeDragItem.image ? (
                                <img src={activeDragItem.image} alt={activeDragItem.label} className="h-10 w-auto object-contain" />
                            ) : (
                                activeDragItem.symbol
                            )}
                        </div>
                    ) : null}
                </DragOverlay>

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