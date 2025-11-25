import React, { useState } from 'react';
import InfoModal from '../common/InfoModal';

// Import all possible controls components
import { NoteGeneratorControls } from '../noteGenerator/NoteGeneratorControls';
import { IntervalGeneratorControls } from '../intervalGenerator/IntervalGeneratorControls';
import { ChordProgressionGeneratorControls } from '../chordProgressionGenerator/ChordProgressionGeneratorControls';
import { IntervalsQuizControls } from '../intervalsQuiz/IntervalsQuizControls';
import { intervalData } from '../intervalsQuiz/useIntervalsQuiz';
import { TriadQuizControls } from '../triadQuiz/TriadQuizControls';
import { IntervalFretboardQuizControls } from '../intervalFretboardQuiz/IntervalFretboardQuizControls';
import { CagedQuizControls } from '../caged/CagedQuizControls';
import { IntervalEarTrainerControls } from '../earTraining/IntervalEarTrainerControls';
import { MelodicEarTrainerControls } from '../earTraining/MelodicEarTrainerControls';
import { ChordTrainerControls } from '../chordTrainer/ChordTrainerControls';
import { FretboardTriadsControls } from '../fretboardTriads/FretboardTriadsControls';
import { ChordEarTrainerControls } from '../earTraining/chordRecognition/ChordEarTrainerControls';
import { ProgressionEarTrainerControls } from '../earTraining/progressionRecognition/ProgressionEarTrainerControls';
// +++ ADD THIS IMPORT (you may need to correct the path) +++
import { RhythmToolControls } from '../rhythmTool/RhythmToolControls';
import { PentatonicQuizControls } from '../pentatonic/PentatonicQuizControls';


// Map game IDs to their corresponding controls component
const controlsMap = {
    'note-generator': NoteGeneratorControls,
    'interval-generator': IntervalGeneratorControls,
    'chord-progression-generator': ChordProgressionGeneratorControls,
    'intervals-quiz': IntervalsQuizControls,
    'triad-quiz': TriadQuizControls,
    'interval-fretboard-quiz': IntervalFretboardQuizControls,
    'caged-system-quiz': CagedQuizControls,
    'interval-ear-trainer': IntervalEarTrainerControls,
    'melodic-ear-trainer': MelodicEarTrainerControls,
    'chord-trainer': ChordTrainerControls,
    'fretboard-triads': FretboardTriadsControls,
    'chord-ear-trainer': ChordEarTrainerControls,
    'progression-ear-trainer': ProgressionEarTrainerControls,
    // +++ ADD THIS ENTRY +++
    'rhythm-trainer': RhythmToolControls,
    'pentatonic-shapes-quiz': PentatonicQuizControls,
};

const PresetEditorModal = ({ preset, onSave, onCancel }) => {
    const [editedPreset, setEditedPreset] = useState({ ...preset });
    const [openSections, setOpenSections] = useState({ general: true, quiz: true, selection: true, playback: true, question: true, options: true, display: true, automation: true });

    const ControlsComponent = controlsMap[preset.gameId];

    const handleSettingChange = (key, value) => {
        setEditedPreset(p => ({ ...p, settings: { ...p.settings, [key]: value } }));
    };

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleSaveChanges = () => {
        onSave(editedPreset);
    };

    const getControlsProps = () => {
        const baseProps = {
            settings: editedPreset.settings,
            onSettingChange: handleSettingChange,
            onSavePreset: () => {}, // Dummy function as it's not used here
        };

        switch (preset.gameId) {
            case 'intervals-quiz':
                const allIntervalNames = intervalData.map(i => i.name);
                return {
                    ...baseProps,
                    audioDirection: editedPreset.settings.audioDirection,
                    onAudioDirectionChange: (val) => handleSettingChange('audioDirection', val),
                    localVolume: editedPreset.settings.fretboardVolume,
                    onLocalVolumeChange: (val) => handleSettingChange('fretboardVolume', val),
                    onVolumeSet: () => {}, 
                    onIntervalSelectionChange: (name) => handleSettingChange('selectedIntervals', { ...editedPreset.settings.selectedIntervals, [name]: !editedPreset.settings.selectedIntervals[name] }),
                    onQuickSelect: (quality) => {
                        const newSelection = { ...editedPreset.settings.selectedIntervals };
                        intervalData.forEach(i => { if (i.quality === quality) newSelection[i.name] = !newSelection[i.name]; });
                        handleSettingChange('selectedIntervals', newSelection);
                    },
                    onSelectAll: (select) => {
                        const newSelection = {};
                        allIntervalNames.forEach(name => { newSelection[name] = select; });
                        handleSettingChange('selectedIntervals', newSelection);
                    },
                    openControlSections: openSections,
                    onToggleSection: toggleSection,
                };
            
            case 'interval-fretboard-quiz':
                return {
                    ...baseProps,
                    volume: editedPreset.settings.fretboardVolume,
                    onVolumeChange: (val) => handleSettingChange('fretboardVolume', val),
                };

            case 'pentatonic-shapes-quiz':
                return {
                    ...baseProps,
                    quizMode: editedPreset.settings.quizMode,
                    onQuizModeChange: (val) => handleSettingChange('quizMode', val),
                    onSettingToggle: (type, key) => {
                        if (type === 'shapes') handleSettingChange('shapes', { ...editedPreset.settings.shapes, [key]: !editedPreset.settings.shapes[key] });
                        else handleSettingChange(key, !editedPreset.settings[key]);
                    }
                };    

            case 'melodic-ear-trainer':
            case 'chord-ear-trainer':
            case 'progression-ear-trainer':
                return {
                    ...baseProps,
                    onRandomKey: () => {}, 
                    onApplySettings: () => {}, 
                };

            case 'caged-system-quiz':
                 return {
                    ...baseProps,
                    quizMode: editedPreset.settings.quizMode,
                    onQuizModeChange: (val) => handleSettingChange('quizMode', val),
                    onSettingToggle: (type, key) => {
                        if (type === 'shapes') {
                            handleSettingChange('shapes', { ...editedPreset.settings.shapes, [key]: !editedPreset.settings.shapes[key] });
                        } else {
                            handleSettingChange(key, !editedPreset.settings[key]);
                        }
                    },
                 };
            
            case 'chord-progression-generator':
                return {
                    ...baseProps,
                    openSections: openSections,
                    onToggleSection: toggleSection,
                    onSettingChange: (key, value) => setEditedPreset(p => ({...p, settings: {...p.settings, [key]: value}})),
                    onQualityFilterChange: (filter) => setEditedPreset(p => ({ ...p, settings: { ...p.settings, qualityFilter: filter, useCommonPatterns: filter !== 'all' ? false : p.settings.useCommonPatterns }})),
                    onRandomRootNote: () => {},
                    isAutoGenerateOn: editedPreset.automation?.isAutoGenerateOn || false,
                    onAutoGenerateToggle: () => setEditedPreset(p => ({...p, automation: {...p.automation, isAutoGenerateOn: !p.automation?.isAutoGenerateOn }})),
                    autoGenerateInterval: editedPreset.automation?.autoGenerateInterval || 1,
                    onIntervalChange: (val) => setEditedPreset(p => ({...p, automation: {...p.automation, autoGenerateInterval: val }})),
                    countdownClicks: editedPreset.automation?.countdownClicks || 0,
                    onCountdownChange: (val) => setEditedPreset(p => ({...p, automation: {...p.automation, countdownClicks: val }})),
                };
            
            case 'fretboard-triads':
                return {
                    ...baseProps,
                    onSettingChange: (key, value) => {
                        setEditedPreset(p => ({
                            ...p,
                            settings: { ...p.settings, [key]: value }
                        }));
                    },
                };
            
            // +++ ADD THIS NEW CASE FOR THE RHYTHM TRAINER +++
            case 'rhythm-trainer':
                return {
                    ...baseProps,
                    // Extract bpm from settings for the slider
                    bpm: editedPreset.settings.bpm || 60, 
                    // Handle bpm changes by updating the settings object
                    onBpmChange: (newBpm) => {
                        setEditedPreset(p => ({
                            ...p,
                            settings: { ...p.settings, bpm: newBpm }
                        }));
                    },
                    // onSettingChange is already handled by baseProps
                };
            
            default:
                const hasAutomation = preset.gameId === 'note-generator' || preset.gameId === 'interval-generator';
                if (hasAutomation) {
                    return {
                        ...baseProps,
                        isAutoGenerateOn: editedPreset.automation?.isAutoGenerateOn || false,
                        onAutoGenerateToggle: () => setEditedPreset(p => ({...p, automation: {...p.automation, isAutoGenerateOn: !p.automation?.isAutoGenerateOn }})),
                        autoGenerateInterval: editedPreset.automation?.autoGenerateInterval || 1,
                        onIntervalChange: (val) => setEditedPreset(p => ({...p, automation: {...p.automation, autoGenerateInterval: val }})),
                        countdownClicks: editedPreset.automation?.countdownClicks || 0,
                        onCountdownChange: (val) => setEditedPreset(p => ({...p, automation: {...p.automation, countdownClicks: val }})),
                    };
                }
                return baseProps;
        }
    };

    return (
        <InfoModal isOpen={true} onClose={onCancel} title={`Editing Preset: ${preset.name}`}>
            <div className="space-y-4">
                <div>
                    <label className="block text-lg font-semibold text-gray-300 mb-2">Preset Name</label>
                    <input type="text" value={editedPreset.name} onChange={e => setEditedPreset(p => ({ ...p, name: e.target.value }))} className="w-full p-2 rounded-md bg-slate-600 text-white" />
                </div>

                <div className="max-h-80 overflow-y-auto p-3 bg-slate-800 rounded-lg">
                    {ControlsComponent ? React.createElement(ControlsComponent, getControlsProps()) : <p>No editor available for this preset type.</p>}
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
                    <button onClick={onCancel} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg">Cancel</button>
                    <button onClick={handleSaveChanges} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg">Save Changes</button>
                </div>
            </div>
        </InfoModal>
    );
};

export default PresetEditorModal;