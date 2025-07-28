import React, { useState, useEffect } from 'react';
import { useTools } from '../../context/ToolsContext';
// UPDATED PATHS
import InfoModal from '../common/InfoModal';
import InfoButton from '../common/InfoButton';
import { useTriadQuiz, NOTES_ENHARMONIC, NOTE_LETTERS, ACCIDENTALS } from './useTriadQuiz';


const TriadQuiz = () => {
    const { addLogEntry } = useTools();
    const [quizMode, setQuizMode] = useState('mixed');
    const [include7ths, setInclude7ths] = useState(false);
    const [includeInversions, setIncludeInversions] = useState(false);
    const [autoAdvance, setAutoAdvance] = useState(true);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isControlsOpen, setIsControlsOpen] = useState(false);

    const {
        score, totalAsked, feedback, isAnswered, currentQuestion, userAnswer, setUserAnswer,
        history, reviewIndex, setReviewIndex, questionTypes,
        checkAnswer, generateNewQuestion, handleReviewNav, startReview
    } = useTriadQuiz(quizMode, include7ths, includeInversions, autoAdvance);

    const isReviewing = reviewIndex !== null;

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Enter') {
                if (isReviewing) return;
                if (isAnswered && !autoAdvance) { generateNewQuestion(); } 
                else if (!isAnswered) { checkAnswer(); }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isAnswered, autoAdvance, isReviewing, checkAnswer, generateNewQuestion]);

    const handleLogProgress = () => {
        const remarks = prompt("Enter any remarks for this session:", `Score: ${score} / ${totalAsked}`);
        if (remarks !== null) { addLogEntry({ game: 'Triad & Tetrads Quiz', date: new Date().toLocaleDateString(), remarks }); alert("Session logged!"); }
    };
    
    if (!currentQuestion && reviewIndex === null) { return <div>Loading...</div>; }

    const item = isReviewing ? history[reviewIndex] : { question: currentQuestion, userAnswer: userAnswer };
    const questionToDisplay = item.question;
    const answerToDisplay = item.userAnswer;
    const qualityOptions = Object.keys(questionTypes);
    const requiredNotes = questionToDisplay.notes.length;
    const buttonClass = 'bg-teal-600 hover:bg-teal-500';
    const selectedClass = 'bg-indigo-600 text-white';
    
    const handleNoteSelect = (note) => {
        if(isAnswered || isReviewing) return;
        const currentNotes = userAnswer.notes || [];
        const newNotes = currentNotes.includes(note) ? currentNotes.filter(n => n !== note) : [...currentNotes, note].slice(0, requiredNotes);
        setUserAnswer({ notes: newNotes });
    };
    
    const handleNameSelect = (type, value) => {
        if(isAnswered || isReviewing) return;
        setUserAnswer(prev => ({ ...prev, [type]: value }));
    };

    const renderQuestion = () => {
        if (questionToDisplay.mode === 'nameTheTriad') { return <p className="text-4xl font-bold text-teal-300 tracking-widest">{questionToDisplay.notes.join(' - ')}</p>; }
        return <p className="text-4xl font-bold text-teal-300">{questionToDisplay.root} {questionToDisplay.quality}</p>;
    };

    const renderAnswerArea = () => {
        if (isReviewing) return null;
        if (questionToDisplay.mode === 'nameTheTriad') {
            return (<>
                <div><h3 className="text-lg font-semibold text-gray-400 mb-2">Root Note</h3><div className="grid grid-cols-7 gap-1">{NOTE_LETTERS.map(note => <button key={note} onClick={() => handleNameSelect('noteLetter', note)} disabled={isAnswered} className={`py-2 rounded font-semibold ${answerToDisplay.noteLetter === note ? selectedClass : buttonClass}`}>{note}</button>)}</div></div>
                <div><h3 className="text-lg font-semibold text-gray-400 mb-2">Accidental</h3><div className="grid grid-cols-3 gap-1">{ACCIDENTALS.map(acc => <button key={acc.id} onClick={() => handleNameSelect('accidental', acc.id === 'natural' ? '' : acc.id)} disabled={isAnswered} className={`py-2 rounded font-semibold text-xl ${answerToDisplay.accidental === (acc.id === 'natural' ? '' : acc.id) ? selectedClass : buttonClass}`}>{acc.display}</button>)}</div></div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-400 mb-2">Quality</h3>
                    <div className="grid grid-cols-4 gap-1">{qualityOptions.map(q => <button key={q} onClick={() => handleNameSelect('quality', q)} disabled={isAnswered} className={`py-2 px-1 rounded font-semibold text-sm ${answerToDisplay.quality === q ? selectedClass : buttonClass}`}>{q}</button>)}</div>
                </div>
            </>);
        }
        return (<div><h3 className="text-lg font-semibold text-gray-400 mb-2">Select {requiredNotes} Notes</h3><div className="grid grid-cols-6 gap-1">{NOTES_ENHARMONIC.map(note => <button key={note} onClick={() => handleNoteSelect(note)} disabled={isAnswered} className={`py-2 rounded font-semibold text-sm ${answerToDisplay.notes?.includes(note) ? selectedClass : buttonClass}`}>{note}</button>)}</div></div>);
    };

    const renderReviewFeedback = () => {
        const { question, userAnswer, wasCorrect } = item;
        let userAnswerText, correctAnswerText;

        if (question.mode === 'nameTheTriad') {
            userAnswerText = `${userAnswer.noteLetter || '?'}${userAnswer.accidental || ''} ${userAnswer.quality || '?'}`.trim();
            correctAnswerText = `${question.root} ${question.quality}`;
        } else {
            userAnswerText = (userAnswer.notes && userAnswer.notes.length > 0) ? userAnswer.notes.sort().join(', ') : "No answer";
            correctAnswerText = question.rootPositionNotes.join(', ');
        }
        
        return (
            <div className={`text-center p-3 rounded-lg ${wasCorrect ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                <p className="font-bold text-gray-200">Correct Answer: <span className="text-teal-300 font-semibold">{correctAnswerText}</span></p>
                {!wasCorrect && <p className="mt-1"><span className="font-bold text-gray-300">Your Answer:</span> <span className="text-red-400 font-semibold">{userAnswerText}</span></p>}
            </div>
        )
    };
    
    const ControlsContent = (
        <div className="space-y-4">
            <div>
                <h3 className="font-semibold text-lg text-teal-300 mb-2">Quiz Mode</h3>
                <div className="space-y-2">
                    <label className={`block p-3 rounded-md cursor-pointer ${quizMode === 'nameTheTriad' ? 'bg-blue-600 text-white' : 'bg-slate-600 hover:bg-slate-500'}`}><input type="radio" name="quizMode" value="nameTheTriad" checked={quizMode === 'nameTheTriad'} onChange={(e) => setQuizMode(e.target.value)} className="mr-3" />Name the Chord</label>
                    <label className={`block p-3 rounded-md cursor-pointer ${quizMode === 'nameTheNotes' ? 'bg-blue-600 text-white' : 'bg-slate-600 hover:bg-slate-500'}`}><input type="radio" name="quizMode" value="nameTheNotes" checked={quizMode === 'nameTheNotes'} onChange={(e) => setQuizMode(e.target.value)} className="mr-3" />Name the Notes</label>
                    <label className={`block p-3 rounded-md cursor-pointer ${quizMode === 'mixed' ? 'bg-blue-600 text-white' : 'bg-slate-600 hover:bg-slate-500'}`}><input type="radio" name="quizMode" value="mixed" checked={quizMode === 'mixed'} onChange={(e) => setQuizMode(e.target.value)} className="mr-3" />Mixed Quiz</label>
                </div>
            </div>
            <div>
                <h3 className="font-semibold text-lg text-teal-300 mb-2">Options</h3>
                <label className="flex items-center gap-2 cursor-pointer p-2"><input type="checkbox" checked={include7ths} onChange={() => setInclude7ths(p => !p)} className="h-5 w-5" />Include 7th Chords</label>
                <label className="flex items-center gap-2 cursor-pointer p-2"><input type="checkbox" checked={includeInversions} onChange={() => setIncludeInversions(p => !p)} className="h-5 w-5" />Include Inversions</label>
            </div>
        </div>
    );
    
    return (
        <div className="flex flex-col md:flex-row items-start w-full gap-4">
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="How to Play: Triad & Tetrads Quiz"><div className="space-y-3"><p>This quiz tests your ability to identify chords by their notes, and vice-versa.</p><div><h4 className="font-bold text-indigo-300">How It Works</h4><p className="text-sm">A question will appear in the main display. Use the green buttons below to construct your answer, then press "Submit" or the Enter key.</p></div><div><h4 className="font-bold text-indigo-300">Game Modes & Options</h4><p className="text-sm">Click the "Controls" button to change game settings at any time. You can choose between different quiz modes, and add 7th chords or inversions to make the quiz more challenging. Changing a setting will restart the quiz with a new question.</p></div></div></InfoModal>
            
            <div className="w-full flex-1 bg-slate-800 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex-1"></div>
                    <div className="flex-1 flex justify-center items-center gap-2">
                        <h1 className="text-2xl text-center font-bold text-indigo-300">Triad & Tetrads Quiz</h1>
                        <InfoButton onClick={() => setIsInfoModalOpen(true)} />
                    </div>
                    <div className="flex-1 flex justify-end items-center gap-2">
                        <button onClick={handleLogProgress} className="bg-green-600 hover:bg-green-500 text-white font-bold py-1 px-3 rounded-lg text-sm">Log Session</button>
                        <button onClick={() => setIsControlsOpen(p => !p)} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-sm font-semibold">Controls</button>
                    </div>
                </div>
                <div className="grid grid-cols-3 items-center mb-4"><span className="text-xl justify-self-start">Score: {score}/{totalAsked}</span><div className="justify-self-center">{history.length > 0 && <button onClick={startReview} disabled={isReviewing} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded-lg text-sm disabled:opacity-50">Review History</button>}</div><label className="flex items-center gap-2 cursor-pointer font-semibold justify-self-end"><span>Auto-Advance</span><div className="relative"><input type="checkbox" checked={autoAdvance} onChange={() => setAutoAdvance(p => !p)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></div></label></div>
                <div className="min-h-[6rem] p-4 bg-slate-900/50 rounded-lg flex justify-center items-center mb-4">{currentQuestion && renderQuestion()}</div>
                <div className={`my-4 min-h-[60px] flex flex-col justify-center ${isReviewing ? '' : (feedback.type === 'correct' ? 'text-green-400' : 'text-red-400')}`}>{isReviewing ? renderReviewFeedback() : <p className="text-lg font-bold text-center">{feedback.message || <>&nbsp;</>}</p>}</div>
                <div className="space-y-4">{currentQuestion && renderAnswerArea()}</div>
                <div className="h-20 mt-4 flex justify-center items-center">{isReviewing ? (<div className="flex items-center justify-center gap-4 w-full"><button onClick={() => handleReviewNav(-1)} disabled={reviewIndex === 0} className="bg-slate-600 hover:bg-slate-500 font-bold p-3 rounded-lg disabled:opacity-50">Prev</button><button onClick={() => setReviewIndex(null)} className="flex-grow max-w-xs bg-purple-600 hover:bg-purple-500 font-bold p-3 rounded-lg text-xl">Return to Quiz</button><button onClick={() => handleReviewNav(1)} disabled={reviewIndex === history.length - 1} className="bg-slate-600 hover:bg-slate-500 font-bold p-3 rounded-lg disabled:opacity-50">Next</button></div>) : !isAnswered ? (<button onClick={checkAnswer} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg">Submit</button>) : !autoAdvance && (<button onClick={generateNewQuestion} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg animate-pulse">Next Question</button>)}</div>
            </div>
            
            <div className={`hidden md:block bg-slate-700 rounded-lg transition-all duration-300 ease-in-out ${isControlsOpen ? 'w-80 p-4' : 'w-0 p-0 overflow-hidden'}`}>
                <div className={`${!isControlsOpen && 'hidden'}`}>
                    <h3 className="text-xl font-bold text-teal-300 mb-4">Settings & Controls</h3>
                    {ControlsContent}
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
                            {ControlsContent}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TriadQuiz;