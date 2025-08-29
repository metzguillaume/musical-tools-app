import React, { useState, useCallback } from 'react';
import { useTools } from '../../context/ToolsContext';
import InfoModal from '../common/InfoModal';
import InfoButton from '../common/InfoButton';
import SectionHeader from '../common/SectionHeader';
import { MusicCirclesControls } from './MusicCirclesControls';
import { useMusicCircles } from './useMusicCircles'; // Import the hook
import CircleDiagram from './CircleDiagram'; // Import the diagram

const MusicCircles = () => {
    const { savePreset, playChord } = useTools();

    const [settings, setSettings] = useState({
        mode: 'Chromatic',
        circleInterval: 7,
        rootNote: 'C',
        scaleType: 'Major',
        showLabels: true,
    });

    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isControlsOpen, setIsControlsOpen] = useState(false);

    // Use the logic hook
    const { circleData, rotateCircle, setRotationOffset } = useMusicCircles(settings);

    const handleSettingChange = useCallback((key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleNodeClick = (node) => {
        if (settings.mode === 'Chord' && node.chordName) {
            // For chords, we need to find the notes to play
            const quality = node.chordName.replace(node.name, '');
            const qualityMap = { '': [0,4,7], 'm': [0,3,7], 'dim': [0,3,6] }; // Simplified for this context
            const intervals = qualityMap[quality] || [0,4,7];
            const notes = intervals.map(i => MIDI_CLASS_TO_NOTE[(node.midiClass + i) % 12]);
            playChord(notes, 'Harmonic');
        } else {
            // For notes, we can just play the single note (as a major chord for now)
            playChord([node.name], 'Harmonic');
        }
    };
    
    // New handler for double-click rotation
    const handleNodeDoubleClick = (nodeIndex) => {
        // The rotation is based on the node's original position in the generated circle
        const currentPosition = circleData.findIndex(d => d.name === circleData[nodeIndex].name);
        setRotationOffset(currentPosition);
    };
    
    const handleSavePreset = () => {
        const name = prompt("Enter a name for your preset:", "My Music Circle");
        if (name && name.trim() !== "") {
            savePreset({
                id: `mc-${Date.now()}`,
                name: name.trim(),
                gameId: 'music-circles',
                gameName: 'Music Circles',
                settings: settings,
            });
            alert(`Preset "${name.trim()}" saved!`);
        }
    };

    // Helper constant for the new hook
    const MIDI_CLASS_TO_NOTE = { 0: 'C', 1: 'C#', 2: 'D', 3: 'D#', 4: 'E', 5: 'F', 6: 'F#', 7: 'G', 8: 'G#', 9: 'A', 10: 'A#', 11: 'B' };

    return (
        <div className="flex flex-col md:flex-row items-start w-full gap-4">
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Music Circles Guide">
                <p>This is a placeholder for the guide.</p>
            </InfoModal>

            <div className="w-full flex-1 bg-slate-800 p-4 rounded-lg flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <SectionHeader title="Music Circles" />
                        <InfoButton onClick={() => setIsInfoModalOpen(true)} />
                    </div>
                    <button
                        onClick={() => setIsControlsOpen(p => !p)}
                        className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-sm font-semibold"
                    >
                        Controls
                    </button>
                </div>

                <div className="w-full aspect-square">
                    {/* Render the actual diagram */}
                    <CircleDiagram 
                        circleData={circleData}
                        rotateCircle={rotateCircle}
                        onNodeClick={handleNodeClick}
                        onNodeDoubleClick={handleNodeDoubleClick}
                    />
                </div>
            </div>

            {/* Controls panel remains unchanged */}
            <div className={`hidden md:block bg-slate-700 rounded-lg transition-all duration-300 ease-in-out sticky top-6 max-h-[calc(100vh-3rem)] ${isControlsOpen ? 'w-80 p-4 overflow-y-auto' : 'w-0 p-0 overflow-hidden'}`}>
                <div className={`${!isControlsOpen && 'hidden'}`}>
                    <h3 className="text-xl font-bold text-teal-300 mb-4">Settings & Controls</h3>
                    <MusicCirclesControls 
                        settings={settings}
                        onSettingChange={handleSettingChange}
                        onSavePreset={handleSavePreset}
                    />
                </div>
            </div>
            {isControlsOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex justify-center items-center bg-black/60" onClick={() => setIsControlsOpen(false)}>
                    <div className="w-11/12 max-w-sm bg-slate-800 rounded-2xl p-4 max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex-shrink-0 flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-teal-300">Settings & Controls</h3>
                            <button onClick={() => setIsControlsOpen(false)} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
                        </div>
                        <div className="flex-grow overflow-y-auto pr-2">
                            <MusicCirclesControls 
                                settings={settings}
                                onSettingChange={handleSettingChange}
                                onSavePreset={handleSavePreset}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MusicCircles;