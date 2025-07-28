import React, { useEffect, useMemo } from 'react';
import FretboardDiagram from '../common/FretboardDiagram'; // UPDATED PATH
import InfoButton from '../common/InfoButton'; // UPDATED PATH
import { ROOT_NOTE_OPTIONS, SHAPE_ORDER } from './cagedConstants.js';

const ShowDegreesToggle = ({ isChecked, onChange }) => (
    <label className="flex items-center justify-center gap-2 cursor-pointer p-2 bg-slate-700 rounded-md">
        <span className="font-semibold text-gray-300 text-sm">Show Degrees</span>
        <div className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={isChecked} onChange={onChange} className="sr-only peer" />
            <div className="w-9 h-5 bg-gray-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
        </div>
    </label>
);

export const ControlsContent = ({ quizMode, setQuizMode, settings, handleSettingToggle }) => (
    <div className="space-y-4">
        <div>
            <h3 className="font-semibold text-lg text-teal-300 mb-2">Game Mode</h3>
            <div className="flex bg-slate-600 rounded-md p-1">
                <button onClick={() => setQuizMode('identify')} className={`flex-1 rounded-md text-sm py-1 ${quizMode === 'identify' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Identify</button>
                <button onClick={() => setQuizMode('construct')} className={`flex-1 rounded-md text-sm py-1 ${quizMode === 'construct' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Construct</button>
                <button onClick={() => setQuizMode('mixed')} className={`flex-1 rounded-md text-sm py-1 ${quizMode === 'mixed' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Mixed</button>
            </div>
        </div>
        <div>
             <h3 className="font-semibold text-lg text-teal-300 mb-2">Chord Qualities</h3>
             <div className="space-y-2">
                <label className="flex items-center justify-between gap-2 cursor-pointer p-2 bg-slate-600 rounded-md">
                    <span className="font-semibold">Major</span>
                     <div className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={settings.includeMajor} onChange={() => handleSettingToggle('quality', 'includeMajor')} className="sr-only peer" /><div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></div>
                </label>
                <label className="flex items-center justify-between gap-2 cursor-pointer p-2 bg-slate-600 rounded-md">
                    <span className="font-semibold">Minor</span>
                     <div className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={settings.includeMinor} onChange={() => handleSettingToggle('quality', 'includeMinor')} className="sr-only peer" /><div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></div>
                </label>
             </div>
        </div>
        <div>
            <h3 className="font-semibold text-lg text-teal-300 mb-2">Shapes to Practice</h3>
             <div className="grid grid-cols-3 gap-2">
                {SHAPE_ORDER.map(shape => (
                    <label key={shape} className="flex items-center justify-center gap-2 cursor-pointer p-2 bg-slate-600 rounded-md">
                        <span className="font-semibold">{shape}</span>
                        <div className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={settings.shapes[shape]} onChange={() => handleSettingToggle('shapes', shape)} className="sr-only peer" /><div className="w-9 h-5 bg-gray-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div></div>
                    </label>
                ))}
             </div>
        </div>
    </div>
);

export const CagedQuizUI = ({
    quizProps,
    settings,
    autoAdvance,
    setAutoAdvance,
    onLogProgress,
    onShowInfo,
    onToggleControls,
    handleSettingToggle
}) => {
    const {
        score, totalAsked, feedback, isAnswered,
        currentQuestion, userAnswer, setUserAnswer,
        history, reviewIndex, setReviewIndex, isReviewing,
        itemToDisplay, generateNewQuestion, checkAnswer,
        handleAnswerSelect, handleFretClick, handleReviewNav, handleEnterReview
    } = quizProps;

    useEffect(() => {
        if (autoAdvance && currentQuestion?.mode === 'identify' && userAnswer.root && userAnswer.quality && userAnswer.shape) {
            checkAnswer(autoAdvance);
        }
    }, [userAnswer, autoAdvance, checkAnswer, currentQuestion]);

    const notesForDiagram = useMemo(() => {
        if (!itemToDisplay?.question) return [];
        const { question, userAnswer: itemUserAnswer } = itemToDisplay;
        const getNoteLabel = (note) => {
            if (!note) return '';
            if (settings.showDegrees) return note.degree;
            return note.label;
        };

        if (!isAnswered && !isReviewing) {
            if (question.mode === 'identify') return question.notes.map(note => ({ ...note, label: note.isRoot ? 'R' : '' }));
            if (question.mode === 'construct') return [ ...question.notes.filter(n => n.fret === -1), ...(userAnswer.notes || []).map(n => ({...n, isRoot: false, overrideColor: '#3b82f6'})) ];
        }

        if (isAnswered || isReviewing) {
            const correctNotes = question.answer.notes;
            const userNotes = itemUserAnswer.notes || [];
            const correctSet = new Set(correctNotes.map(n => `${n.string}-${n.fret}`));
            const correctNotesStyled = correctNotes.map(note => ({
                ...note,
                overrideLabel: getNoteLabel(note),
                overrideColor: note.isRoot ? '#166534' : '#22c55e',
            }));
            const incorrectClicksStyled = userNotes
                .filter(n => !correctSet.has(`${n.string}-${n.fret}`))
                .map(note => ({ ...note, overrideLabel: getNoteLabel(note), overrideColor: '#ef4444' }));
            const mutedStrings = question.notes.filter(n => n.fret === -1);
            return [...correctNotesStyled, ...incorrectClicksStyled, ...mutedStrings];
        }
        return [];
    }, [itemToDisplay, isAnswered, isReviewing, settings.showDegrees, userAnswer.notes]);
    
    const renderReviewFeedback = () => {
        if (!isReviewing) return null;
        const { question, userAnswer, wasCorrect } = itemToDisplay;
        const correctEnharmonicRoot = ROOT_NOTE_OPTIONS.find(opt => opt.value === question.answer.root || opt.altValue === question.answer.root);
        const correctAnswerText = `${correctEnharmonicRoot.display} ${question.answer.quality} (${question.answer.shape} shape)`;
        let userAnswerText;
        if (question.mode === 'identify') userAnswerText = `${userAnswer.root || '?'} ${userAnswer.quality || '?'} (${userAnswer.shape || '?'})`;
        else userAnswerText = (userAnswer.notes && userAnswer.notes.length > 0) ? userAnswer.notes.map(n => n.label).join(', ') : "No answer";

        return (
            <div className={`text-center p-3 rounded-lg ${wasCorrect ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                <p className="font-bold text-gray-200">Correct Answer: <span className="text-teal-300 font-semibold">{correctAnswerText}</span></p>
                {!wasCorrect && <p className="mt-1"><span className="font-bold text-gray-300">Your Answer:</span> <span className="text-red-400 font-semibold">{userAnswerText}</span></p>}
            </div>
        );
    };

    const selectedClass = 'bg-indigo-600 text-white';
    const buttonClass = 'bg-teal-600 hover:bg-teal-500';

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3"><h1 className="text-2xl font-bold text-indigo-300">CAGED System Quiz</h1><InfoButton onClick={onShowInfo} /></div>
                <div className="flex items-center gap-2">
                    <button onClick={() => onLogProgress(score, totalAsked)} className="bg-green-600 hover:bg-green-500 text-white font-bold py-1 px-3 rounded-lg text-sm">Log Session</button>
                    <button onClick={onToggleControls} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-sm font-semibold">Controls</button>
                </div>
            </div>
            <div className="flex justify-between items-center mb-4 text-lg">
                <span className="font-semibold text-gray-300">Score: {score} / {totalAsked}</span>
                <div className="flex items-center gap-2">
                    {history.length > 0 && <button onClick={handleEnterReview} disabled={isReviewing} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded-lg text-sm disabled:opacity-50">Review History</button>}
                    <label className="flex items-center gap-2 cursor-pointer font-semibold"><span className="text-gray-300">Auto-Advance</span><div className="relative"><input type="checkbox" checked={autoAdvance} onChange={() => setAutoAdvance(p => !p)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></div></label>
                </div>
            </div>
            {currentQuestion?.mode === 'construct' && !isReviewing && <div className="text-center text-2xl font-semibold text-gray-400 my-4">{currentQuestion?.prompt}</div>}
            <div className="my-4">
                <FretboardDiagram 
                    notesToDisplay={notesForDiagram} 
                    onBoardClick={handleFretClick}
                    showLabels={isAnswered || isReviewing} 
                />
            </div>
             <div className={`my-4 min-h-[60px] flex flex-col justify-center`}>
                {isReviewing ? renderReviewFeedback() : <p className={`text-lg font-bold text-center ${feedback.type === 'correct' ? 'text-green-400' : 'text-red-400'}`}>{feedback.message || <>&nbsp;</>}</p>}
            </div>
            {!isReviewing && currentQuestion?.mode === 'identify' && (
                <div className="space-y-4 max-w-2xl mx-auto">
                    <div><h3 className="text-base font-semibold text-gray-400 mb-2">Root Note</h3><div className="grid grid-cols-6 md:grid-cols-12 gap-1">{ROOT_NOTE_OPTIONS.map(note => <button key={note.value} onClick={() => handleAnswerSelect('root', note.value)} disabled={isAnswered} className={`py-3 px-1 rounded font-semibold text-xs md:text-sm ${userAnswer.root === note.value || userAnswer.root === note.altValue ? selectedClass : buttonClass}`}>{note.display}</button>)}</div></div>
                    <div><h3 className="text-base font-semibold text-gray-400 mb-2">Quality</h3><div className="grid grid-cols-2 gap-2">{['major', 'minor'].map(q => <button key={q} onClick={() => handleAnswerSelect('quality', q)} disabled={isAnswered} className={`py-3 font-semibold capitalize text-base ${userAnswer.quality === q ? selectedClass : buttonClass}`}>{q}</button>)}</div></div>
                    <div><h3 className="text-base font-semibold text-gray-400 mb-2">Shape</h3><div className="grid grid-cols-5 gap-2">{SHAPE_ORDER.map(shape => <button key={shape} onClick={() => handleAnswerSelect('shape', shape)} disabled={isAnswered} className={`py-3 font-semibold text-base ${userAnswer.shape === shape ? selectedClass : buttonClass}`}>{shape}</button>)}</div></div>
                </div>
            )}
            {!isReviewing && currentQuestion?.mode === 'construct' && !isAnswered && (
                <div className="flex justify-center gap-4 max-w-lg mx-auto">
                    <button onClick={() => setUserAnswer({ notes: [] })} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg">Clear</button>
                    <button onClick={() => checkAnswer(autoAdvance)} disabled={!userAnswer.notes || userAnswer.notes.length === 0} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg disabled:bg-gray-500">Submit</button>
                </div>
            )}
            <div className="h-20 mt-4 flex justify-center items-center">
                {isReviewing ? (
                    <div className="flex items-center justify-center gap-4 w-full">
                        <button onClick={() => handleReviewNav(-1)} disabled={reviewIndex === 0} className="bg-slate-600 hover:bg-slate-500 font-bold p-3 rounded-lg disabled:opacity-50">Prev</button>
                        <div className="flex-grow max-w-xs flex flex-col items-center gap-2">
                            <button onClick={() => setReviewIndex(null)} className="bg-purple-600 hover:bg-purple-500 font-bold p-3 rounded-lg text-xl w-full">Return to Quiz</button>
                            <ShowDegreesToggle isChecked={settings.showDegrees} onChange={() => handleSettingToggle('display', 'showDegrees')} />
                        </div>
                        <button onClick={() => handleReviewNav(1)} disabled={reviewIndex === history.length - 1} className="bg-slate-600 hover:bg-slate-500 font-bold p-3 rounded-lg disabled:opacity-50">Next</button>
                    </div>
                ) : !autoAdvance && isAnswered && (
                     <button onClick={generateNewQuestion} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg animate-pulse">Next Question</button>
                )}
            </div>
        </>
    );
};