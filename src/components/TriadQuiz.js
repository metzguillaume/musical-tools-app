import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTools } from '../context/ToolsContext';
import InfoModal from './InfoModal';
import InfoButton from './InfoButton';

// --- Data & Helpers ---
// UPDATED: Restored sharps and kept flats for a full range of questions.
const QUIZ_ROOT_NOTES = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];
const NOTES_ENHARMONIC = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];
const NOTE_LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const ACCIDENTALS = [ { id: 'b', display: '♭' }, { id: 'natural', display: '' }, { id: '#', display: '♯' }];
const NOTE_TO_MIDI_BASE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

const CHORD_TYPES = { 'Major': [0, 4, 7], 'Minor': [0, 3, 7], 'Diminished': [0, 3, 6], 'Augmented': [0, 4, 8] };
const SEVENTH_CHORD_TYPES = { 'Major 7th': [0, 4, 7, 11], 'Minor 7th': [0, 3, 7, 10], 'Dominant 7th': [0, 4, 7, 10], 'Half-Diminished 7th': [0, 3, 6, 10], 'Diminished 7th': [0, 3, 6, 9] };

const getMidiFromNote = (note) => {
    const letter = note.charAt(0).toUpperCase();
    const accidental = note.substring(1);
    let midi = NOTE_TO_MIDI_BASE[letter];
    if (accidental.includes('#')) midi += accidental.length;
    if (accidental.includes('b')) midi -= accidental.length;
    return midi;
};

const getCorrectEnharmonicNotes = (rootNote, intervals) => {
    const rootMidi = getMidiFromNote(rootNote);
    const rootLetter = rootNote.charAt(0);
    const rootLetterIndex = NOTE_LETTERS.indexOf(rootLetter);
    const noteDegrees = [0, 2, 4, 6]; 
    
    const finalNotes = intervals.map((interval, index) => {
        const degree = noteDegrees[index];
        const noteLetter = NOTE_LETTERS[(rootLetterIndex + degree) % 7];
        const requiredMidi = rootMidi + interval;
        const naturalMidi = NOTE_TO_MIDI_BASE[noteLetter];
        let accidentalValue = (requiredMidi % 12) - (naturalMidi % 12);
        if (accidentalValue > 6) accidentalValue -= 12;
        if (accidentalValue < -6) accidentalValue += 12;

        let accidental = '';
        if (accidentalValue === 1) accidental = '#';
        else if (accidentalValue === 2) accidental = '##';
        else if (accidentalValue === -1) accidental = 'b';
        else if (accidentalValue === -2) accidental = 'bb';
        return `${noteLetter}${accidental}`;
    });
    return finalNotes;
};

// --- Main Component ---
const TriadQuiz = () => {
    const { addLogEntry } = useTools();
    const [quizMode, setQuizMode] = useState('mixed');
    const [include7ths, setInclude7ths] = useState(false);
    const [includeInversions, setIncludeInversions] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [userAnswer, setUserAnswer] = useState({});
    const [feedback, setFeedback] = useState({ message: '', type: '' });
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [totalAsked, setTotalAsked] = useState(0);
    const [autoAdvance, setAutoAdvance] = useState(true);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [history, setHistory] = useState([]);
    const [reviewIndex, setReviewIndex] = useState(null);
    const [isControlsOpen, setIsControlsOpen] = useState(false);

    const questionTypes = useMemo(() => {
        return include7ths ? { ...CHORD_TYPES, ...SEVENTH_CHORD_TYPES } : CHORD_TYPES;
    }, [include7ths]);

    const generateNewQuestion = useCallback(() => {
        setReviewIndex(null);
        let question = null;
        let attempts = 0;
        do {
            const rootNote = QUIZ_ROOT_NOTES[Math.floor(Math.random() * QUIZ_ROOT_NOTES.length)];
            const qualityOptions = Object.keys(questionTypes);
            const quality = qualityOptions[Math.floor(Math.random() * qualityOptions.length)];
            const intervals = questionTypes[quality];
            const canonicalNotes = getCorrectEnharmonicNotes(rootNote, intervals);
            const isAnswerable = canonicalNotes.every(note => NOTES_ENHARMONIC.includes(note));
            if (isAnswerable) {
                let displayNotes = [...canonicalNotes];
                if (includeInversions && Math.random() > 0.3) {
                    const inversion = Math.floor(Math.random() * displayNotes.length);
                    if (inversion > 0) { displayNotes = [...displayNotes.slice(inversion), ...displayNotes.slice(0, inversion)]; }
                }
                const mode = (quizMode === 'mixed') ? (Math.random() < 0.5 ? 'nameTheTriad' : 'nameTheNotes') : quizMode;
                question = { 
                    root: rootNote, 
                    quality: quality, 
                    notes: displayNotes, 
                    rootPositionNotes: canonicalNotes,
                    sortedNotes: [...canonicalNotes].sort(), 
                    mode: mode 
                };
            }
            attempts++;
        } while (!question && attempts < 100);

        if (!question) { console.error("Could not generate an answerable question."); return; }
        setCurrentQuestion(question);
        setTotalAsked(prev => prev + 1);
        setIsAnswered(false);
        setFeedback({ message: '', type: '' });
        setUserAnswer({accidental: ''});
    }, [quizMode, questionTypes, includeInversions]);

    const checkAnswer = useCallback(() => {
        if (isAnswered || !currentQuestion) return;
        let isCorrect = false;
        let correctAnswerText = '';
        if (currentQuestion.mode === 'nameTheTriad') {
            const userAnswerRoot = `${userAnswer.noteLetter || ''}${userAnswer.accidental || ''}`;
            isCorrect = userAnswerRoot === currentQuestion.root && userAnswer.quality === currentQuestion.quality;
            correctAnswerText = `${currentQuestion.root} ${currentQuestion.quality}`;
        } else {
            const sortedUserNotes = userAnswer.notes?.sort() || [];
            correctAnswerText = currentQuestion.rootPositionNotes.join(', ');
            if (sortedUserNotes.length === currentQuestion.sortedNotes.length) {
                isCorrect = sortedUserNotes.every((note, index) => note === currentQuestion.sortedNotes[index]);
            }
        }
        if (isCorrect) { setScore(s => s + 1); setFeedback({ message: 'Correct!', type: 'correct' });
        } else { setFeedback({ message: `Incorrect! The answer was ${correctAnswerText}.`, type: 'incorrect' }); }
        setHistory(prev => [...prev, { question: currentQuestion, userAnswer, wasCorrect: isCorrect }]);
        setIsAnswered(true);
        if (autoAdvance) { setTimeout(generateNewQuestion, 2000); }
    }, [isAnswered, userAnswer, currentQuestion, autoAdvance, generateNewQuestion]);

    useEffect(() => {
        setScore(0);
        setTotalAsked(0);
        setHistory([]);
        setReviewIndex(null);
        if (questionTypes && Object.keys(questionTypes).length > 0) { generateNewQuestion(); }
    }, [generateNewQuestion, questionTypes]);

    const isReviewing = reviewIndex !== null;

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Enter') {
                if (isReviewing) return;
                if (isAnswered && !autoAdvance) { generateNewQuestion();
                } else if (!isAnswered) { checkAnswer(); }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isAnswered, autoAdvance, isReviewing, checkAnswer, generateNewQuestion]);


    const handleLogProgress = () => {
        const remarks = prompt("Enter any remarks for this session:", `Score: ${score} / ${totalAsked}`);
        if (remarks !== null) { addLogEntry({ game: 'Triad & Tetrads Quiz', date: new Date().toLocaleDateString(), remarks }); alert("Session logged!"); }
    };
    
    const handleReviewNav = (direction) => { setReviewIndex(prev => { const newIndex = prev + direction; if (newIndex >= 0 && newIndex < history.length) { return newIndex; } return prev; }); };
    
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
                <div><h3 className="text-lg font-semibold text-gray-400 mb-2">Quality</h3><div className="grid grid-cols-2 lg:grid-cols-3 gap-1">{qualityOptions.map(q => <button key={q} onClick={() => handleNameSelect('quality', q)} disabled={isAnswered} className={`p-2 rounded font-semibold ${answerToDisplay.quality === q ? selectedClass : buttonClass}`}>{q}</button>)}</div></div>
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
    
    return (
        <div className="flex flex-col md:flex-row items-start w-full gap-4">
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="How to Play: Triad & Tetrads Quiz"><div className="space-y-3"><p>This quiz tests your ability to identify chords by their notes, and vice-versa.</p><div><h4 className="font-bold text-indigo-300">How It Works</h4><p className="text-sm">A question will appear in the main display. Use the green buttons below to construct your answer, then press "Submit" or the Enter key.</p></div><div><h4 className="font-bold text-indigo-300">Game Modes & Options</h4><p className="text-sm">Click the "Controls" button to change game settings at any time. You can choose between different quiz modes, and add 7th chords or inversions to make the quiz more challenging. Changing a setting will restart the quiz with a new question.</p></div></div></InfoModal>
            <div className="w-full flex-1 bg-slate-800 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4"><div className="flex-1"></div><div className="flex-1 flex justify-center items-center gap-2"><h1 className="text-2xl text-center font-bold text-indigo-300">Triad & Tetrads Quiz</h1><InfoButton onClick={() => setIsInfoModalOpen(true)} /></div><div className="flex-1 flex justify-end items-center gap-2"><button onClick={() => setIsControlsOpen(p => !p)} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-sm font-semibold">Controls</button><button onClick={handleLogProgress} className="bg-green-600 hover:bg-green-500 text-white font-bold py-1 px-3 rounded-lg text-sm">Log Session</button></div></div>
                <div className="grid grid-cols-3 items-center mb-4"><span className="text-xl justify-self-start">Score: {score}/{totalAsked}</span><div className="justify-self-center">{history.length > 0 && <button onClick={() => setReviewIndex(history.length - 1)} disabled={isReviewing} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded-lg text-sm disabled:opacity-50">Review History</button>}</div><label className="flex items-center gap-2 cursor-pointer font-semibold justify-self-end"><span>Auto-Advance</span><div className="relative"><input type="checkbox" checked={autoAdvance} onChange={() => setAutoAdvance(p => !p)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></div></label></div>
                <div className="min-h-[6rem] p-4 bg-slate-900/50 rounded-lg flex justify-center items-center mb-4">{renderQuestion()}</div>
                <div className={`my-4 min-h-[60px] flex flex-col justify-center ${isReviewing ? '' : (feedback.type === 'correct' ? 'text-green-400' : 'text-red-400')}`}>{isReviewing ? renderReviewFeedback() : <p className="text-lg font-bold text-center">{feedback.message || <>&nbsp;</>}</p>}</div>
                <div className="space-y-4">{renderAnswerArea()}</div>
                <div className="h-20 mt-4 flex justify-center items-center">{isReviewing ? (<div className="flex items-center justify-center gap-4 w-full"><button onClick={() => handleReviewNav(-1)} disabled={reviewIndex === 0} className="bg-slate-600 hover:bg-slate-500 font-bold p-3 rounded-lg disabled:opacity-50">Prev</button><button onClick={() => setReviewIndex(null)} className="flex-grow max-w-xs bg-purple-600 hover:bg-purple-500 font-bold p-3 rounded-lg text-xl">Return to Quiz</button><button onClick={() => handleReviewNav(1)} disabled={reviewIndex === history.length - 1} className="bg-slate-600 hover:bg-slate-500 font-bold p-3 rounded-lg disabled:opacity-50">Next</button></div>) : !isAnswered ? (<button onClick={checkAnswer} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg">Submit</button>) : !autoAdvance && (<button onClick={generateNewQuestion} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg animate-pulse">Next Question</button>)}</div>
            </div>
            <div className={`bg-slate-700 rounded-lg transition-all duration-300 ease-in-out overflow-hidden ${isControlsOpen ? 'w-full md:w-80 p-4 mt-4 md:mt-0' : 'w-full md:w-0 p-0 opacity-0 md:opacity-100'}`}><div className={`${!isControlsOpen && 'hidden md:block'}`}><h3 className="text-xl font-bold text-teal-300 mb-4">Settings & Controls</h3><div className="space-y-4"><div><h3 className="font-semibold text-lg text-teal-300 mb-2">Quiz Mode</h3><div className="space-y-2"><label className={`block p-3 rounded-md cursor-pointer ${quizMode === 'nameTheTriad' ? 'bg-blue-600 text-white' : 'bg-slate-600 hover:bg-slate-500'}`}><input type="radio" name="quizMode" value="nameTheTriad" checked={quizMode === 'nameTheTriad'} onChange={(e) => setQuizMode(e.target.value)} className="mr-3" />Name the Chord</label><label className={`block p-3 rounded-md cursor-pointer ${quizMode === 'nameTheNotes' ? 'bg-blue-600 text-white' : 'bg-slate-600 hover:bg-slate-500'}`}><input type="radio" name="quizMode" value="nameTheNotes" checked={quizMode === 'nameTheNotes'} onChange={(e) => setQuizMode(e.target.value)} className="mr-3" />Name the Notes</label><label className={`block p-3 rounded-md cursor-pointer ${quizMode === 'mixed' ? 'bg-blue-600 text-white' : 'bg-slate-600 hover:bg-slate-500'}`}><input type="radio" name="quizMode" value="mixed" checked={quizMode === 'mixed'} onChange={(e) => setQuizMode(e.target.value)} className="mr-3" />Mixed Quiz</label></div></div><div><h3 className="font-semibold text-lg text-teal-300 mb-2">Options</h3><label className="flex items-center gap-2 cursor-pointer p-2"><input type="checkbox" checked={include7ths} onChange={() => setInclude7ths(p => !p)} className="h-5 w-5" />Include 7th Chords</label><label className="flex items-center gap-2 cursor-pointer p-2"><input type="checkbox" checked={includeInversions} onChange={() => setIncludeInversions(p => !p)} className="h-5 w-5" />Include Inversions</label></div></div></div></div>
        </div>
    );
};

export default TriadQuiz;