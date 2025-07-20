// src/components/caged/CAGEDSystemQuiz.js

import React, { useState, useMemo, useCallback } from 'react';
import { useTools } from '../../context/ToolsContext';
import InfoModal from '../InfoModal';
import { CagedQuizUI, ControlsContent } from './CagedQuizUI';
import { useCagedQuiz } from './useCagedQuiz';

const CAGEDSystemQuiz = () => {
    const { addLogEntry } = useTools();
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isControlsOpen, setIsControlsOpen] = useState(false);
    
    const [quizMode, setQuizMode] = useState('mixed');
    const [settings, setSettings] = useState({
        includeMajor: true,
        includeMinor: true,
        shapes: { E: true, A: true, G: true, C: true, D: true },
        showDegrees: false,
    });
    
    const handleSettingToggle = useCallback((type, key) => {
        setSettings(prev => {
            const newSettings = { ...prev };
            if (type === 'shapes') newSettings.shapes = { ...prev.shapes, [key]: !prev.shapes[key] };
            else newSettings[key] = !prev[key];
            return newSettings;
        });
    }, []);

    const activeShapes = useMemo(() => {
        const active = [];
        if (settings.includeMajor) Object.keys(settings.shapes).forEach(shape => { if(settings.shapes[shape]) active.push({ quality: 'major', shape: shape }); });
        if (settings.includeMinor) Object.keys(settings.shapes).forEach(shape => { if(settings.shapes[shape]) active.push({ quality: 'minor', shape: shape }); });
        return active;
    }, [settings.includeMajor, settings.includeMinor, settings.shapes]);
    
    const quizProps = useCagedQuiz(quizMode, activeShapes);
    const [autoAdvance, setAutoAdvance] = useState(true);

    const handleLogProgress = (score, totalAsked) => {
        const remarks = prompt("Enter any remarks for this session:", `Score: ${score} / ${totalAsked}`);
        if (remarks !== null) { addLogEntry({ game: 'CAGED Fretboard Quiz', date: new Date().toLocaleDateString(), remarks }); alert("Session logged!"); }
    };

    const controls = (
        <ControlsContent 
            quizMode={quizMode}
            setQuizMode={setQuizMode}
            settings={settings}
            handleSettingToggle={handleSettingToggle}
        />
    );

    return (
        <div className="flex flex-col md:flex-row items-start w-full gap-4">
             <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="CAGED System Quiz Guide">
                <div className="space-y-4 text-sm">
                    <p>This quiz tests your knowledge of the CAGED system on the guitar fretboard.</p>
                    <div><h4 className="font-bold text-indigo-300 mb-1">Identify Mode</h4><p>A chord shape will be shown on the fretboard with blank notes. Identify its Root Note, Quality, and base CAGED Shape.</p></div>
                     <div><h4 className="font-bold text-indigo-300 mb-1">Construct Mode</h4><p>You will be given a chord and a shape name (e.g., "G Major - E Shape"). Click the correct frets on the empty fretboard to build the shape.</p></div>
                    <p>Use the **Controls** panel to select which shapes and qualities to include in the quiz.</p>
                </div>
            </InfoModal>

            <div className="w-full flex-1 bg-slate-800 p-4 rounded-lg">
                <CagedQuizUI 
                    quizProps={quizProps}
                    settings={settings}
                    autoAdvance={autoAdvance}
                    setAutoAdvance={setAutoAdvance}
                    onLogProgress={handleLogProgress}
                    onShowInfo={() => setIsInfoModalOpen(true)}
                    onToggleControls={() => setIsControlsOpen(p => !p)}
                    handleSettingToggle={handleSettingToggle}
                />
            </div>
            
            <div className={`hidden md:block bg-slate-700 rounded-lg transition-all duration-300 ease-in-out ${isControlsOpen ? 'w-80 p-4' : 'w-0 p-0 overflow-hidden'}`}>
                <div className={`${!isControlsOpen && 'hidden'}`}>
                     <h3 className="text-xl font-bold text-teal-300 mb-4">Settings & Controls</h3>
                    {controls}
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
                            {controls}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CAGEDSystemQuiz;