import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTools } from '../../context/ToolsContext';
import InfoModal from '../common/InfoModal';
import QuizLayout from '../common/QuizLayout';
import FretboardDiagram from '../common/FretboardDiagram';
import { useCagedQuiz } from './useCagedQuiz';
import { CagedQuizControls } from './CagedQuizControls';
import { ROOT_NOTE_OPTIONS, SHAPE_ORDER } from './cagedConstants.js';

// A small, local component for the review section's toggle
const ShowDegreesToggle = ({ isChecked, onChange }) => (
    <label className="flex items-center justify-center gap-2 cursor-pointer p-2 bg-slate-700 rounded-md">
        <span className="font-semibold text-gray-300 text-sm">Show Scale Degrees</span>
        <div className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={isChecked} onChange={onChange} className="sr-only peer" />
            <div className="w-9 h-5 bg-gray-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
        </div>
    </label>
);


const CAGEDSystemQuiz = ({ onProgressUpdate }) => {
    const { addLogEntry, savePreset, presetToLoad, clearPresetToLoad } = useTools();
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isControlsOpen, setIsControlsOpen] = useState(false);
    
    const [quizMode, setQuizMode] = useState('mixed');
    const [settings, setSettings] = useState({
        includeMajor: true,
        includeMinor: true,
        shapes: { E: true, A: true, G: true, C: true, D: true },
        showDegrees: false,
    });
    const [autoAdvance, setAutoAdvance] = useState(true);

    useEffect(() => {
        if (presetToLoad && presetToLoad.gameId === 'caged-system-quiz') {
            const { quizMode: presetQuizMode, ...presetSettings } = presetToLoad.settings;
            setSettings(presetSettings);
            if(presetQuizMode) setQuizMode(presetQuizMode);
            clearPresetToLoad();
        }
    }, [presetToLoad, clearPresetToLoad]);

    const handleSavePreset = () => {
        const shapeNames = Object.keys(settings.shapes).filter(s => settings.shapes[s]).join(',');
        const name = prompt("Enter a name for your preset:", `CAGED - ${shapeNames}`);
        if (name && name.trim() !== "") {
            savePreset({
                id: Date.now().toString(), name: name.trim(),
                gameId: 'caged-system-quiz', gameName: 'CAGED System Quiz',
                settings: { ...settings, quizMode },
            });
            alert(`Preset "${name.trim()}" saved!`);
        }
    };
    
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
    
    const quizProps = useCagedQuiz(quizMode, activeShapes, onProgressUpdate);
    const { score, totalAsked, feedback, isAnswered, history, reviewIndex, setReviewIndex, isReviewing, itemToDisplay, handleAnswerSelect, handleFretClick, checkAnswer, generateNewQuestion, userAnswer, setUserAnswer } = quizProps;

    useEffect(() => {
        if (autoAdvance && itemToDisplay.question?.mode === 'identify' && userAnswer.root && userAnswer.quality && userAnswer.shape) {
            checkAnswer(autoAdvance);
        }
    }, [userAnswer, autoAdvance, checkAnswer, itemToDisplay.question]);

    // This useEffect is for the new "Enter to continue" feature
    useEffect(() => {
        const handleKeyDown = (event) => {
    const targetTagName = event.target.tagName.toLowerCase();
    if (targetTagName === 'input' || targetTagName === 'textarea' || targetTagName === 'select') {
        return;
    }

    const wasCorrect = history.length > 0 ? history[history.length - 1].wasCorrect : true;
    if (event.key === 'Enter' && isAnswered && (!autoAdvance || !wasCorrect)) {
        event.preventDefault();
        generateNewQuestion();
    }
};
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isAnswered, autoAdvance, history, generateNewQuestion]);

    const notesForDiagram = useMemo(() => {
        if (!itemToDisplay?.question) return [];
        const { question, userAnswer: itemUserAnswer } = itemToDisplay;
        const getNoteLabel = (note) => {
            if (!note) return '';
            if (settings.showDegrees) return note.degree;
            return note.label;
        };

        // Logic for before the answer is submitted
        if (!isAnswered && !isReviewing) {
            if (question.mode === 'identify') return question.notes.map(note => ({ ...note, label: note.isRoot ? 'R' : '' }));
            if (question.mode === 'construct') return [ ...question.notes.filter(n => n.fret === -1), ...(userAnswer.notes || []).map(n => ({...n, isRoot: false, overrideColor: '#3b82f6'})) ];
        }

        // Logic for AFTER the answer is submitted or when reviewing
        if (isAnswered || isReviewing) {
            const wasCorrect = isReviewing ? itemToDisplay.wasCorrect : (history.length > 0 ? history[history.length - 1].wasCorrect : false);
            const userNotes = itemUserAnswer.notes || [];
            const correctNotes = question.answer.notes;
            const mutedStrings = question.notes.filter(n => n.fret === -1);

            if (wasCorrect) {
                // If the answer was correct, simply display the user's notes in green.
                // This works for both the original position and the correct octave-up position.
                const userNotesStyled = userNotes.map(note => ({
                    ...note,
                    overrideLabel: getNoteLabel(note),
                    overrideColor: note.isRoot ? '#166534' : '#22c55e', // Dark green for root, light green for others
                }));
                return [...userNotesStyled, ...mutedStrings];
            } else {
                // If incorrect, show the correct answer in green and wrong clicks in red.
                const correctSet = new Set(correctNotes.map(n => `${n.string}-${n.fret}`));
                const correctNotesStyled = correctNotes.map(note => ({
                    ...note,
                    overrideLabel: getNoteLabel(note),
                    overrideColor: note.isRoot ? '#166534' : '#22c55e',
                }));
                const incorrectClicksStyled = userNotes
                    .filter(n => !correctSet.has(`${n.string}-${n.fret}`))
                    .map(note => ({ ...note, overrideLabel: getNoteLabel(note), overrideColor: '#ef4444' }));
                return [...correctNotesStyled, ...incorrectClicksStyled, ...mutedStrings];
            }
        }
        return [];
    }, [itemToDisplay, isAnswered, isReviewing, settings.showDegrees, userAnswer.notes, history]);

    const renderReviewFeedback = () => {
        if (!isReviewing) return null;
        const { question, userAnswer: itemUserAnswer, wasCorrect } = itemToDisplay;
        const correctEnharmonicRoot = ROOT_NOTE_OPTIONS.find(opt => opt.value === question.answer.root || opt.altValue === question.answer.root);
        const correctAnswerText = `${correctEnharmonicRoot.display} ${question.answer.quality} (${question.answer.shape} shape)`;
        let userAnswerText;
        if (question.mode === 'identify') userAnswerText = `${itemUserAnswer.root || '?'} ${itemUserAnswer.quality || '?'} (${itemUserAnswer.shape || '?'})`;
        else userAnswerText = (itemUserAnswer.notes && itemUserAnswer.notes.length > 0) ? itemUserAnswer.notes.map(n => n.label).join(', ') : "No answer";

        return (
            <div className={`text-center p-3 rounded-lg ${wasCorrect ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                <p className="font-bold text-gray-200">Correct Answer: <span className="text-teal-300 font-semibold">{correctAnswerText}</span></p>
                {!wasCorrect && <p className="mt-1"><span className="font-bold text-gray-300">Your Answer:</span> <span className="text-red-400 font-semibold">{userAnswerText}</span></p>}
            </div>
        );
    };

    const handleLogProgress = () => {
        const remarks = prompt("Enter any remarks for this session:", `Score: ${score} / ${totalAsked}`);
        if (remarks !== null) { addLogEntry({ game: 'CAGED Fretboard Quiz', date: new Date().toLocaleDateString(), remarks }); alert("Session logged!"); }
    };

    const topControlsContent = (
      <label className="flex items-center gap-2 cursor-pointer font-semibold">
          <span>Auto-Advance</span>
          <div className="relative">
              <input type="checkbox" checked={autoAdvance} onChange={() => setAutoAdvance(p => !p)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </div>
      </label>
    );

    const wasCorrect = history.length > 0 ? history[history.length - 1].wasCorrect : true;
    const footerContent = isReviewing ? (
        <div className="flex items-center justify-center gap-4 w-full">
            <button onClick={() => quizProps.handleReviewNav(-1)} disabled={reviewIndex === 0} className="bg-slate-600 hover:bg-slate-500 font-bold p-3 rounded-lg disabled:opacity-50">Prev</button>
            <div className="flex-grow max-w-xs flex flex-col items-center gap-2">
                <button onClick={() => setReviewIndex(null)} className="bg-purple-600 hover:bg-purple-500 font-bold p-3 rounded-lg text-xl w-full">Return to Quiz</button>
                <ShowDegreesToggle isChecked={settings.showDegrees} onChange={() => handleSettingToggle('display', 'showDegrees')} />
            </div>
            <button onClick={() => quizProps.handleReviewNav(1)} disabled={reviewIndex === history.length - 1} className="bg-slate-600 hover:bg-slate-500 font-bold p-3 rounded-lg disabled:opacity-50">Next</button>
        </div>
    ) : isAnswered && (!autoAdvance || !wasCorrect) ? (
         <button onClick={generateNewQuestion} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg animate-pulse">Next Question</button>
    ) : null;

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

            <QuizLayout
                title="CAGED System Quiz"
                score={score}
                totalAsked={totalAsked}
                history={history}
                isReviewing={isReviewing}
                onStartReview={quizProps.handleEnterReview}
                topControls={topControlsContent}
                footerContent={footerContent}
                onLogProgress={handleLogProgress}
                onToggleControls={() => setIsControlsOpen(p => !p)}
                onShowInfo={() => setIsInfoModalOpen(true)}
            >
                {itemToDisplay.question?.mode === 'construct' && !isReviewing && <div className="text-center text-2xl font-semibold text-gray-400 my-4">{itemToDisplay.question?.prompt}</div>}
                <div className="my-4"><FretboardDiagram notesToDisplay={notesForDiagram} onBoardClick={handleFretClick} showLabels={settings.showDegrees || isAnswered || isReviewing} /></div>
                <div className={`my-4 min-h-[60px] flex flex-col justify-center`}>
                    {isReviewing ? renderReviewFeedback() : <p className={`text-lg font-bold text-center ${feedback.type === 'correct' ? 'text-green-400' : 'text-red-400'}`}>{feedback.message || <>&nbsp;</>}</p>}
                </div>

                {!isReviewing && itemToDisplay.question?.mode === 'identify' && (
                    <div className="space-y-4 max-w-2xl mx-auto">
                        <div><h3 className="text-base font-semibold text-gray-400 mb-2">Root Note</h3><div className="grid grid-cols-6 md:grid-cols-12 gap-1">{ROOT_NOTE_OPTIONS.map(note => <button key={note.value} onClick={() => handleAnswerSelect('root', note.value)} disabled={isAnswered} className={`py-3 px-1 rounded font-semibold text-xs md:text-sm ${userAnswer.root === note.value || userAnswer.root === note.altValue ? 'bg-indigo-600 text-white' : 'bg-teal-600 hover:bg-teal-500'}`}>{note.display}</button>)}</div></div>
                        <div><h3 className="text-base font-semibold text-gray-400 mb-2">Quality</h3><div className="grid grid-cols-2 gap-2">{['major', 'minor'].map(q => <button key={q} onClick={() => handleAnswerSelect('quality', q)} disabled={isAnswered} className={`py-3 font-semibold capitalize text-base ${userAnswer.quality === q ? 'bg-indigo-600 text-white' : 'bg-teal-600 hover:bg-teal-500'}`}>{q}</button>)}</div></div>
                        <div><h3 className="text-base font-semibold text-gray-400 mb-2">Shape</h3><div className="grid grid-cols-5 gap-2">{SHAPE_ORDER.map(shape => <button key={shape} onClick={() => handleAnswerSelect('shape', shape)} disabled={isAnswered} className={`py-3 font-semibold text-base ${userAnswer.shape === shape ? 'bg-indigo-600 text-white' : 'bg-teal-600 hover:bg-teal-500'}`}>{shape}</button>)}</div></div>
                    </div>
                )}
                {!isReviewing && itemToDisplay.question?.mode === 'construct' && !isAnswered && (
                    <div className="flex justify-center gap-4 max-w-lg mx-auto">
                        <button onClick={() => setUserAnswer({ notes: [] })} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg">Clear</button>
                        <button onClick={() => checkAnswer(autoAdvance)} disabled={!userAnswer.notes || userAnswer.notes.length === 0} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg disabled:bg-gray-500">Submit</button>
                    </div>
                )}
            </QuizLayout>
            
            <div className={`hidden md:block bg-slate-700 rounded-lg transition-all duration-300 ease-in-out ${isControlsOpen ? 'w-80 p-4' : 'w-0 p-0 overflow-hidden'}`}>
                <div className={`${!isControlsOpen && 'hidden'}`}>
                     <h3 className="text-xl font-bold text-teal-300 mb-4">Settings & Controls</h3>
                    <CagedQuizControls 
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
                        <div className="flex-shrink-0 flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-teal-300">Settings & Controls</h3>
                            <button onClick={() => setIsControlsOpen(false)} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
                        </div>
                        <div className="flex-grow overflow-y-auto pr-2">
                           <CagedQuizControls 
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

export default CAGEDSystemQuiz;