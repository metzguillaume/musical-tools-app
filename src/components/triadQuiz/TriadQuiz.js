import React, { useState, useEffect } from 'react';
import { useTools } from '../../context/ToolsContext';
import InfoModal from '../common/InfoModal';
import QuizLayout from '../common/QuizLayout';
// The NOTE_LETTERS constant is no longer needed here, so it can be removed from the import
import { useTriadQuiz, ACCIDENTALS } from './useTriadQuiz';
import { TriadQuizControls } from './TriadQuizControls';

const TriadQuiz = ({ onProgressUpdate }) => {
    const { addLogEntry, savePreset, presetToLoad, clearPresetToLoad } = useTools();

    const [settings, setSettings] = useState({
        quizMode: 'mixed',
        include7ths: false,
        includeInversions: false,
        autoAdvance: true,
    });
    
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isControlsOpen, setIsControlsOpen] = useState(false);

    useEffect(() => {
        if (presetToLoad && presetToLoad.gameId === 'triad-quiz') {
            setSettings(presetToLoad.settings);
            clearPresetToLoad();
        }
    }, [presetToLoad, clearPresetToLoad]);
    
    const {
        score, totalAsked, feedback, isAnswered, currentQuestion, userAnswer, setUserAnswer,
        history, reviewIndex, setReviewIndex, questionTypes,
        checkAnswer, generateNewQuestion, handleReviewNav, startReview
    } = useTriadQuiz(settings.quizMode, settings.include7ths, settings.includeInversions, settings.autoAdvance, onProgressUpdate);

    const isReviewing = reviewIndex !== null;

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({...prev, [key]: value}));
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key !== 'Enter' || isReviewing) return;
            event.preventDefault();
            const wasCorrect = history.length > 0 ? history[history.length - 1].wasCorrect : true;
            if (isAnswered && (!settings.autoAdvance || !wasCorrect)) {
                generateNewQuestion();
            } else if (!isAnswered) {
                checkAnswer();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isAnswered, settings.autoAdvance, history, isReviewing, checkAnswer, generateNewQuestion]);

    useEffect(() => {
        if (
            settings.autoAdvance &&
            currentQuestion?.mode === 'nameTheNotes' &&
            userAnswer.notes?.length === currentQuestion.notes.length &&
            !isAnswered
        ) {
            checkAnswer();
        }
    }, [userAnswer, currentQuestion, settings.autoAdvance, isAnswered, checkAnswer]);

    useEffect(() => {
        if (
            settings.autoAdvance &&
            currentQuestion?.mode === 'nameTheTriad' &&
            userAnswer.noteLetter &&
            userAnswer.accidental !== undefined &&
            userAnswer.quality &&
            !isAnswered
        ) {
            checkAnswer();
        }
    }, [userAnswer, currentQuestion, settings.autoAdvance, isAnswered, checkAnswer]);
    
    const handleLogProgress = () => {
        const remarks = prompt("Enter any remarks for this session:", `Score: ${score} / ${totalAsked}`);
        if (remarks !== null) { addLogEntry({ game: 'Triad & Tetrads Quiz', date: new Date().toLocaleDateString(), remarks }); alert("Session logged!"); }
    };
    
    const handleSavePreset = () => {
        const name = prompt("Enter a name for your preset:", "Triads Quiz Setting");
        if (name && name.trim() !== "") {
            const newPreset = {
                id: Date.now().toString(),
                name: name.trim(),
                gameId: 'triad-quiz',
                gameName: 'Triad & Tetrads Quiz',
                settings: settings,
            };
            savePreset(newPreset);
            alert(`Preset "${name.trim()}" saved!`);
        }
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
            // THIS IS THE FIX: A new constant is defined here in the correct order.
            const NOTE_LETTERS_ALPHABETICAL = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
            return (<>
                <div>
                    <h3 className="text-lg font-semibold text-gray-400 mb-2">Root Note</h3>
                    <div className="grid grid-cols-7 gap-1">
                        {/* The buttons are now created by mapping over the new alphabetical array */}
                        {NOTE_LETTERS_ALPHABETICAL.map(note => (
                            <button 
                                key={note} 
                                onClick={() => handleNameSelect('noteLetter', note)} 
                                disabled={isAnswered} 
                                className={`py-3 rounded font-semibold text-lg ${answerToDisplay.noteLetter === note ? selectedClass : buttonClass}`}
                            >
                                {note}
                            </button>
                        ))}
                    </div>
                </div>
                <div><h3 className="text-lg font-semibold text-gray-400 mb-2">Accidental</h3><div className="grid grid-cols-3 gap-1">{ACCIDENTALS.map(acc => <button key={acc.id} onClick={() => handleNameSelect('accidental', acc.id === 'natural' ? '' : acc.id)} disabled={isAnswered} className={`py-3 rounded font-semibold text-2xl ${answerToDisplay.accidental === (acc.id === 'natural' ? '' : acc.id) ? selectedClass : buttonClass}`}>{acc.display || '♮'}</button>)}</div></div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-400 mb-2">Quality</h3>
                    <div className="grid grid-cols-4 gap-1">{qualityOptions.map(q => <button key={q} onClick={() => handleNameSelect('quality', q)} disabled={isAnswered} className={`py-3 px-1 rounded font-semibold ${answerToDisplay.quality === q ? selectedClass : buttonClass}`}>{q}</button>)}</div>
                </div>
            </>);
        }
        
        const noteColumns = [
            { letter: 'A', notes: ['A#', 'A', 'Ab'] }, { letter: 'B', notes: [null, 'B', 'Bb'] }, { letter: 'C', notes: ['C#', 'C', null] },
            { letter: 'D', notes: ['D#', 'D', 'Db'] }, { letter: 'E', notes: [null, 'E', 'Eb'] }, { letter: 'F', notes: ['F#', 'F', null] },
            { letter: 'G', notes: ['G#', 'G', 'Gb'] },
        ];

        return (
            <div>
                <h3 className="text-lg font-semibold text-gray-400 mb-2">Select {requiredNotes} Notes</h3>
                <div className="flex gap-x-1 md:gap-x-2">
                    {noteColumns.map(column => (
                        <div key={column.letter} className="flex flex-1 flex-col gap-y-1">
                            {column.notes.map((note, index) => {
                                if (note === null) return <div key={index} className="h-14 w-full" />;
                                return ( <button key={note} onClick={() => handleNoteSelect(note)} disabled={isAnswered} className={`h-14 w-full flex items-center justify-center rounded font-semibold text-lg transition-colors ${answerToDisplay.notes?.includes(note) ? selectedClass : buttonClass}`}>{note}</button> );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        );
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
        return ( <div className={`text-center p-3 rounded-lg ${wasCorrect ? 'bg-green-900/50' : 'bg-red-900/50'}`}><p className="font-bold text-gray-200">Correct Answer: <span className="text-teal-300 font-semibold">{correctAnswerText}</span></p>{!wasCorrect && <p className="mt-1"><span className="font-bold text-gray-300">Your Answer:</span> <span className="text-red-400 font-semibold">{userAnswerText}</span></p>}</div> )
    };

    const topControlsContent = ( <label className="flex items-center gap-2 cursor-pointer font-semibold"><span>Auto-Advance</span><div className="relative"><input type="checkbox" checked={settings.autoAdvance} onChange={() => handleSettingChange('autoAdvance', !settings.autoAdvance)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></div></label> );

    const wasCorrect = history.length > 0 ? history[history.length - 1].wasCorrect : true;
    const footerContent = isReviewing ? (
        <div className="flex items-center justify-center gap-4 w-full">
            <button onClick={() => handleReviewNav(-1)} disabled={reviewIndex === 0} className="bg-slate-600 hover:bg-slate-500 font-bold p-3 rounded-lg disabled:opacity-50">Prev</button>
            <button onClick={() => setReviewIndex(null)} className="flex-grow max-w-xs bg-purple-600 hover:bg-purple-500 font-bold p-3 rounded-lg text-xl">Return to Quiz</button>
            <button onClick={() => handleReviewNav(1)} disabled={reviewIndex === history.length - 1} className="bg-slate-600 hover:bg-slate-500 font-bold p-3 rounded-lg disabled:opacity-50">Next</button>
        </div>
    ) : !isAnswered ? (
        <button onClick={checkAnswer} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg">Submit</button>
    ) : isAnswered && (!settings.autoAdvance || !wasCorrect) ? (
        <button onClick={generateNewQuestion} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg animate-pulse">Next Question</button>
    ) : null;

    return (
        <div className="flex flex-col md:flex-row items-start w-full gap-4">
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="How to Play: Triad & Tetrads Quiz">
                <div className="space-y-3">
                    <p>This quiz tests your ability to identify chords by their notes, and vice-versa.</p>
                    <div><h4 className="font-bold text-indigo-300">How It Works</h4><p className="text-sm">A question will appear in the main display. Use the green buttons below to construct your answer, then press "Submit" or the Enter key.</p></div>
                    <div><h4 className="font-bold text-indigo-300">Game Modes & Options</h4><p className="text-sm">Click the "Controls" button to change game settings at any time. You can choose between different quiz modes, and add 7th chords or inversions to make the quiz more challenging. Changing a setting will restart the quiz with a new question.</p></div>
                </div>
            </InfoModal>

            <QuizLayout
                title="Triad & Tetrads Quiz"
                score={score} totalAsked={totalAsked} history={history} isReviewing={isReviewing}
                onStartReview={startReview} topControls={topControlsContent} footerContent={footerContent}
                onLogProgress={handleLogProgress} onToggleControls={() => setIsControlsOpen(p => !p)} onShowInfo={() => setIsInfoModalOpen(true)}
            >
                <div className="min-h-[6rem] p-4 bg-slate-900/50 rounded-lg flex justify-center items-center mb-2 md:mb-4">{currentQuestion && renderQuestion()}</div>
                <div className={`my-2 md:my-4 min-h-[52px] flex flex-col justify-center ${isReviewing ? '' : (feedback.type === 'correct' ? 'text-green-400' : 'text-red-400')}`}>{isReviewing ? renderReviewFeedback() : <p className="text-lg font-bold text-center">{feedback.message || <>&nbsp;</>}</p>}</div>
                <div className="space-y-4">{currentQuestion && renderAnswerArea()}</div>
            </QuizLayout>

            <div className={`hidden md:block bg-slate-700 rounded-lg transition-all duration-300 ease-in-out ${isControlsOpen ? 'w-80 p-4' : 'w-0 p-0 overflow-hidden'}`}>
                <div className={`${!isControlsOpen && 'hidden'}`}>
                    <h3 className="text-xl font-bold text-teal-300 mb-4">Settings & Controls</h3>
                    <TriadQuizControls settings={settings} onSettingChange={handleSettingChange} onSavePreset={handleSavePreset} />
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
                            <TriadQuizControls settings={settings} onSettingChange={handleSettingChange} onSavePreset={handleSavePreset} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TriadQuiz;