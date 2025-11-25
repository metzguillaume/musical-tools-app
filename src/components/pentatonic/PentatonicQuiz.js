import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTools } from '../../context/ToolsContext';
import InfoModal from '../common/InfoModal';
import QuizLayout from '../common/QuizLayout';
import FretboardDiagram from '../common/FretboardDiagram';
import { usePentatonicQuiz } from './usePentatonicQuiz';
import { PentatonicQuizControls } from './PentatonicQuizControls';
import { STANDARD_CAGED_ORDER, HIGHLIGHT_MASKS } from './pentatonicConstants';
import { ROOT_NOTE_OPTIONS } from '../caged/cagedConstants';

const PentatonicQuiz = ({ onProgressUpdate }) => {
    const { addLogEntry, savePreset, presetToLoad, clearPresetToLoad } = useTools();
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isControlsOpen, setIsControlsOpen] = useState(false);
    
    // State: Object for multi-select modes
    const [quizMode, setQuizMode] = useState({ identify: true, construct: false, complete: false, connect: false });
    
    const [settings, setSettings] = useState({
        includeMajor: true,
        includeMinor: true,
        shapes: { C: true, A: true, G: true, E: true, D: true },
        completeModeStartWithRoots: false,
        completeModeNumNotes: 2,
        autoAdvance: true
    });

    useEffect(() => {
        if (presetToLoad && presetToLoad.gameId === 'pentatonic-shapes-quiz') {
            const { quizMode: presetQuizMode, ...presetSettings } = presetToLoad.settings;
            setSettings(prev => ({ ...prev, ...presetSettings }));
            
            // Handle loading legacy presets (string) vs new presets (object)
            if (typeof presetQuizMode === 'string') {
                if (presetQuizMode === 'mixed') {
                    setQuizMode({ identify: true, construct: true, complete: true, connect: true });
                } else {
                    setQuizMode({ identify: false, construct: false, complete: false, connect: false, [presetQuizMode]: true });
                }
            } else if (typeof presetQuizMode === 'object') {
                setQuizMode(presetQuizMode);
            }
            
            clearPresetToLoad();
        }
    }, [presetToLoad, clearPresetToLoad]);

    const activeShapes = useMemo(() => {
        const active = [];
        if (settings.includeMajor) Object.keys(settings.shapes).forEach(shape => { if(settings.shapes[shape]) active.push({ quality: 'major', shape: shape }); });
        if (settings.includeMinor) Object.keys(settings.shapes).forEach(shape => { if(settings.shapes[shape]) active.push({ quality: 'minor', shape: shape }); });
        return active;
    }, [settings]);

    const quizProps = usePentatonicQuiz(quizMode, activeShapes, settings, onProgressUpdate);
    const { 
        score, totalAsked, feedback, isAnswered, history, reviewIndex, isReviewing, itemToDisplay, 
        handleAnswerSelect, handleFretClick, checkAnswer, generateNewQuestion, userAnswer, setUserAnswer 
    } = quizProps;

    // ENTER KEY LISTENER
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.key === 'Enter') {
                if (!isAnswered && !isReviewing) {
                    if (itemToDisplay.question?.mode === 'identify') {
                        if (userAnswer.root && userAnswer.quality && userAnswer.shape) checkAnswer(settings.autoAdvance);
                    } else {
                        if (userAnswer.notes && userAnswer.notes.length > 0) checkAnswer(settings.autoAdvance);
                    }
                } else if (isAnswered && !isReviewing) {
                    const wasCorrect = history.length > 0 ? history[history.length - 1].wasCorrect : true;
                    if (!settings.autoAdvance || !wasCorrect) generateNewQuestion();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isAnswered, isReviewing, itemToDisplay, userAnswer, checkAnswer, settings.autoAdvance, generateNewQuestion, history]);

    const handleSettingToggle = useCallback((type, key) => {
        setSettings(prev => {
            const newSettings = { ...prev };
            if (type === 'shapes') newSettings.shapes = { ...prev.shapes, [key]: !prev.shapes[key] };
            else newSettings[key] = !prev[key];
            return newSettings;
        });
    }, []);

    const handleSavePreset = () => {
        const name = prompt("Enter a name for your preset:", `Pentatonic Custom`);
        if (name) {
            savePreset({
                id: Date.now().toString(), name: name.trim(),
                gameId: 'pentatonic-shapes-quiz', gameName: 'Pentatonic Shapes',
                settings: { ...settings, quizMode },
            });
            alert(`Preset "${name.trim()}" saved!`);
        }
    };

    const renderPrompt = () => {
        const data = itemToDisplay.question?.promptData;
        if (!data) return null;

        if (data.type === 'error') {
            return <div className="text-red-400">{data.text}</div>;
        }
        if (data.type === 'identify') {
            return <div className="text-center text-xl font-semibold text-gray-300 my-4">Identify the <span className="text-teal-300">Pentatonic Shape</span></div>;
        }
        if (data.type === 'construct') {
            return (
                <div className="text-center text-xl font-semibold text-gray-300 my-4">
                    Construct <span className="text-teal-300">{data.root} {data.quality}</span> Pentatonic (<span className="text-teal-300">{data.shape} Shape</span>)
                </div>
            );
        }
        if (data.type === 'complete') {
            return (
                <div className="text-center text-xl font-semibold text-gray-300 my-4">
                    Complete this <span className="text-teal-300">{data.quality}</span> Pentatonic Scale
                </div>
            );
        }
        if (data.type === 'connect') {
            return (
                <div className="text-center text-xl font-semibold text-gray-300 my-4">
                    Build the <span className="text-teal-300">{data.quality}</span> Pentatonic scale around this <span className="text-teal-300">{data.shape}-shape</span> chord
                </div>
            );
        }
    };

    const notesForDiagram = useMemo(() => {
        if (!itemToDisplay?.question) return [];
        const { question, userAnswer: itemUserAnswer } = itemToDisplay;
        const mode = question.mode;

        if (isAnswered || isReviewing) {
            const wasCorrect = isReviewing ? itemToDisplay.wasCorrect : (history.length > 0 ? history[history.length - 1].wasCorrect : false);
            const correctPentatonicNotes = question.answer.notes;
            const quality = question.answer.quality; 
            const shape = question.answer.shape;     
            const mask = HIGHLIGHT_MASKS[quality][shape] || [];

            const isInMask = (note) => mask.some(m => m.s === note.string && m.f === (note.f !== undefined ? note.f : 999));
            
            const getAnswerColor = (note) => {
                if (isInMask(note)) return '#14b8a6'; 
                if (note.isRoot) return '#ef4444'; 
                return '#3b82f6'; 
            };

            let displayNotes = correctPentatonicNotes.map(n => ({
                ...n,
                overrideColor: getAnswerColor(n), 
                overrideLabel: n.isRoot ? 'R' : n.degree 
            }));
            
            if (!wasCorrect) {
                const correctSet = new Set(correctPentatonicNotes.map(n => `${n.string}-${n.fret}`));
                const userClicks = itemUserAnswer.notes || [];
                const incorrectClicks = userClicks
                    .filter(n => !correctSet.has(`${n.string}-${n.fret}`))
                    .map(n => ({ ...n, overrideColor: '#b91c1c', overrideLabel: 'X' }));
                
                displayNotes = [...displayNotes, ...incorrectClicks];
            }
            return displayNotes;
        }

        if (mode === 'identify') {
            return question.notes.map(n => ({ ...n, overrideColor: n.isRoot ? '#ef4444' : '#3b82f6', overrideLabel: n.isRoot ? 'R' : '' }));
        }
        if (mode === 'construct') {
             return (userAnswer.notes || []).map(n => ({ ...n, overrideColor: '#3b82f6', overrideLabel: '' }));
        }
        if (mode === 'complete') {
            const startNotes = question.notes.map(n => ({ ...n, overrideColor: n.isRoot ? '#ef4444' : '#10b981', overrideLabel: n.isRoot ? 'R' : n.degree }));
            const userAdded = (userAnswer.notes || []).map(n => ({ ...n, overrideColor: '#3b82f6' }));
            return [...startNotes, ...userAdded];
        }
        if (mode === 'connect') {
            const ghosts = question.notes.map(n => ({ ...n, overrideColor: '#475569', overrideLabel: n.label || '' }));
            const userAdded = (userAnswer.notes || []).map(n => ({ ...n, overrideColor: '#3b82f6' }));
            return [...ghosts, ...userAdded];
        }

        return [];
    }, [itemToDisplay, isAnswered, isReviewing, history, userAnswer]);

    const renderAnswerControls = () => {
         const isDisabled = isAnswered || isReviewing;
         const mode = itemToDisplay.question?.mode;

         if (mode === 'identify') {
             return (
                <div className={`space-y-4 max-w-2xl mx-auto transition-opacity ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div>
                        <h3 className="text-base font-semibold text-gray-400 mb-2">Root Note</h3>
                        <div className="grid grid-cols-6 md:grid-cols-12 gap-1">{ROOT_NOTE_OPTIONS.map(note => <button key={note.value} onClick={() => handleAnswerSelect('root', note.value)} className={`py-3 px-1 rounded font-semibold text-xs md:text-sm ${userAnswer.root === note.value || userAnswer.root === note.altValue ? 'bg-indigo-600 text-white' : 'bg-teal-600 hover:bg-teal-500'}`}>{note.display}</button>)}</div>
                    </div>
                    <div><h3 className="text-base font-semibold text-gray-400 mb-2">Quality</h3><div className="grid grid-cols-2 gap-2">{['major', 'minor'].map(q => <button key={q} onClick={() => handleAnswerSelect('quality', q)} className={`py-3 font-semibold capitalize text-base ${userAnswer.quality === q ? 'bg-indigo-600 text-white' : 'bg-teal-600 hover:bg-teal-500'}`}>{q}</button>)}</div></div>
                    <div><h3 className="text-base font-semibold text-gray-400 mb-2">CAGED Shape</h3><div className="grid grid-cols-5 gap-2">{STANDARD_CAGED_ORDER.map(shape => <button key={shape} onClick={() => handleAnswerSelect('shape', shape)} className={`py-3 font-semibold text-base ${userAnswer.shape === shape ? 'bg-indigo-600 text-white' : 'bg-teal-600 hover:bg-teal-500'}`}>{shape}</button>)}</div></div>
                    <button onClick={() => checkAnswer(settings.autoAdvance)} disabled={!userAnswer.root || !userAnswer.quality || !userAnswer.shape} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg disabled:opacity-50 disabled:bg-gray-600 mt-4">Submit Answer</button>
                </div>
             )
         }

         return (
            <div className={`flex justify-center gap-4 max-w-lg mx-auto transition-opacity ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <button onClick={() => setUserAnswer({ notes: [] })} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg">Clear</button>
                <button onClick={() => checkAnswer(settings.autoAdvance)} disabled={!userAnswer.notes || userAnswer.notes.length === 0} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg disabled:bg-gray-600 disabled:opacity-50">Submit</button>
            </div>
         );
    }
    
    const topControlsContent = (
      <label className="flex items-center gap-2 cursor-pointer font-semibold">
          <span>Auto-Advance</span>
          <div className="relative">
              <input type="checkbox" checked={settings.autoAdvance} onChange={() => handleSettingToggle('misc', 'autoAdvance')} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </div>
      </label>
    );

    const footerContent = isReviewing ? (
        <div className="flex items-center justify-center gap-4 w-full">
            <button onClick={() => quizProps.handleReviewNav(-1)} disabled={reviewIndex === 0} className="bg-slate-600 hover:bg-slate-500 font-bold p-3 rounded-lg disabled:opacity-50">Prev</button>
            <button onClick={quizProps.returnToQuiz} className="bg-purple-600 hover:bg-purple-500 font-bold p-3 rounded-lg text-xl">Return to Quiz</button>
            <button onClick={() => quizProps.handleReviewNav(1)} disabled={reviewIndex === history.length - 1} className="bg-slate-600 hover:bg-slate-500 font-bold p-3 rounded-lg disabled:opacity-50">Next</button>
        </div>
    ) : isAnswered ? (
        <button onClick={generateNewQuestion} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg animate-pulse">Next Question</button>
    ) : null;

    return (
        <div className="flex flex-col md:flex-row items-start w-full gap-4">
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Pentatonic Shapes Guide">
                <div className="space-y-4 text-sm text-gray-300">
                    <p>This tool is designed to help you master the 5 positions of the Pentatonic scale and their relationship to the CAGED system chord shapes.</p>

                    <h4 className="font-bold text-indigo-300 mt-4 text-lg">Game Modes</h4>
                    <ul className="list-disc list-inside space-y-2">
                        <li>
                            <strong className="text-teal-300">Identify:</strong> Identify the <strong>Root Note</strong>, <strong>Quality</strong> (Major/Minor), and <strong>CAGED Shape</strong> of the displayed pentatonic scale.
                        </li>
                        <li>
                            <strong className="text-teal-300">Construct:</strong> Build the requested Pentatonic shape from scratch on a blank fretboard.
                        </li>
                        <li>
                            <strong className="text-teal-300">Complete:</strong> You are given 2 starting notes. Figure out which Pentatonic pattern they belong to and complete the rest of the shape.
                        </li>
                        <li>
                            <strong className="text-teal-300">Connect:</strong> Visualize the "Chord-Scale" relationship. You will see a "Ghost Chord" (the CAGED chord shape). Build the corresponding Pentatonic scale around it.
                        </li>
                    </ul>

                    <h4 className="font-bold text-indigo-300 mt-4 text-lg">Controls & Settings</h4>
                    <ul className="list-disc list-inside space-y-2">
                        <li><strong>Mixing Modes:</strong> Click multiple Game Modes to create a mixed practice session (e.g., Identify + Construct).</li>
                        <li><strong>Qualities & Shapes:</strong> Toggle specific scale qualities or CAGED shapes to focus your practice.</li>
                        <li><strong>Complete Mode:</strong> Configure the Root note is always included as a hint.</li>
                    </ul>
                    
                    <div className="bg-slate-800 p-3 rounded-lg mt-4 border border-slate-600">
                        <p className="text-xs italic"><strong>Tip:</strong> Use the <span className="font-bold text-white">Save Preset</span> button to save your custom configuration for quick recall in presets on the left side!</p>
                    </div>
                </div>
            </InfoModal>

            <QuizLayout
                title="Pentatonic Shapes"
                score={score}
                totalAsked={totalAsked}
                history={history}
                isReviewing={isReviewing}
                onStartReview={quizProps.handleEnterReview}
                topControls={topControlsContent}
                footerContent={footerContent}
                onLogProgress={() => addLogEntry({ game: 'Pentatonic Shapes', date: new Date().toLocaleDateString(), remarks: `Score: ${score}/${totalAsked}` })}
                onToggleControls={() => setIsControlsOpen(p => !p)}
                onShowInfo={() => setIsInfoModalOpen(true)}
            >
                {renderPrompt()}
                
                <div className="my-4">
                    <FretboardDiagram notesToDisplay={notesForDiagram} onBoardClick={handleFretClick} showLabels={isAnswered || isReviewing || itemToDisplay.question?.mode === 'complete'} />
                </div>
                
                <div className={`my-4 min-h-[40px] flex flex-col justify-center`}>
                     <p className={`text-lg font-bold text-center ${feedback.type === 'correct' ? 'text-green-400' : 'text-red-400'}`}>{feedback.message || <>&nbsp;</>}</p>
                </div>
                
                {renderAnswerControls()}
            </QuizLayout>

             <div className={`hidden md:block bg-slate-700 rounded-lg transition-all duration-300 ease-in-out ${isControlsOpen ? 'w-80 p-4' : 'w-0 p-0 overflow-hidden'}`}>
                <div className={`${!isControlsOpen && 'hidden'}`}>
                     <h3 className="text-xl font-bold text-teal-300 mb-4">Settings</h3>
                    <PentatonicQuizControls
                        quizMode={quizMode}
                        onQuizModeChange={setQuizMode}
                        settings={settings}
                        onSettingToggle={handleSettingToggle}
                        onSavePreset={handleSavePreset}
                    />
                </div>
            </div>
            {isControlsOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex justify-center items-center bg-black/60" onClick={() => setIsControlsOpen(false)}>
                    <div className="w-11/12 max-w-sm bg-slate-800 rounded-2xl p-4 max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex-shrink-0 flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-teal-300">Settings</h3><button onClick={() => setIsControlsOpen(false)} className="text-gray-400 text-2xl">&times;</button></div>
                        <div className="flex-grow overflow-y-auto pr-2">
                             <PentatonicQuizControls
                                quizMode={quizMode}
                                onQuizModeChange={setQuizMode}
                                settings={settings}
                                onSettingToggle={handleSettingToggle}
                                onSavePreset={handleSavePreset}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PentatonicQuiz;