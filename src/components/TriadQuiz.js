import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTools } from '../context/ToolsContext';
import InfoModal from './InfoModal';
import InfoButton from './InfoButton';

// --- Data & Helpers ---
const NOTES_CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTES_ENHARMONIC = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];
const NOTE_LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
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
        let naturalMidi = NOTE_TO_MIDI_BASE[noteLetter];
        if (naturalMidi < rootMidi % 12) {
            naturalMidi += 12;
        }
        const requiredMidi = rootMidi + interval;
        const accidentalValue = requiredMidi - naturalMidi;
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

    // --- State ---
    // UPDATED: Default states changed and 'screen' state removed.
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
    // ADDED: State to manage the collapsible controls panel.
    const [isControlsOpen, setIsControlsOpen] = useState(false);

    const questionTypes = useMemo(() => {
        return include7ths ? { ...CHORD_TYPES, ...SEVENTH_CHORD_TYPES } : CHORD_TYPES;
    }, [include7ths]);

    const generateNewQuestion = useCallback(() => {
        setReviewIndex(null);
        
        const rootNote = NOTES_CHROMATIC[Math.floor(Math.random() * NOTES_CHROMATIC.length)];
        const qualityOptions = Object.keys(questionTypes);
        const quality = qualityOptions[Math.floor(Math.random() * qualityOptions.length)];
        const intervals = questionTypes[quality];
        
        let noteNames = getCorrectEnharmonicNotes(rootNote, intervals);

        if (includeInversions && Math.random() > 0.3) {
            const inversion = Math.floor(Math.random() * noteNames.length);
            if (inversion > 0) {
                noteNames = [...noteNames.slice(inversion), ...noteNames.slice(0, inversion)];
            }
        }

        const question = {
            root: rootNote,
            quality: quality,
            notes: noteNames,
            sortedNotes: [...noteNames].sort(),
        };

        const mode = (quizMode === 'mixed') 
            ? (Math.random() < 0.5 ? 'nameTheTriad' : 'nameTheNotes') 
            : quizMode;

        setCurrentQuestion({ ...question, mode });
        setTotalAsked(prev => prev + 1);
        setIsAnswered(false);
        setFeedback({ message: '', type: '' });
        setUserAnswer({});
    }, [quizMode, questionTypes, includeInversions]);

    // UPDATED: This effect now runs when settings change to reset the quiz.
    useEffect(() => {
        setScore(0);
        setTotalAsked(0);
        setHistory([]);
        setReviewIndex(null);
        if (questionTypes && Object.keys(questionTypes).length > 0) {
            generateNewQuestion();
        }
    }, [generateNewQuestion, questionTypes]);

    const checkAnswer = useCallback(() => {
        if (isAnswered) return;
        
        let isCorrect = false;
        let correctAnswerText = '';

        if (currentQuestion.mode === 'nameTheTriad') {
            isCorrect = userAnswer.root === currentQuestion.root && userAnswer.quality === currentQuestion.quality;
            correctAnswerText = `${currentQuestion.root} ${currentQuestion.quality}`;
        } else {
            const sortedUserNotes = userAnswer.notes?.sort() || [];
            correctAnswerText = currentQuestion.sortedNotes.join(', ');
            if (sortedUserNotes.length === currentQuestion.sortedNotes.length) {
                isCorrect = sortedUserNotes.every((note, index) => note === currentQuestion.sortedNotes[index]);
            }
        }

        if (isCorrect) {
            setScore(s => s + 1);
            setFeedback({ message: 'Correct!', type: 'correct' });
        } else {
            setFeedback({ message: `Incorrect! The answer was ${correctAnswerText}.`, type: 'incorrect' });
        }
        
        setHistory(prev => [...prev, { question: currentQuestion, userAnswer, wasCorrect: isCorrect }]);
        setIsAnswered(true);

        if (autoAdvance) {
            setTimeout(generateNewQuestion, 2000);
        }
    }, [isAnswered, userAnswer, currentQuestion, autoAdvance, generateNewQuestion]);

    const handleLogProgress = () => {
        const remarks = prompt("Enter any remarks for this session:", `Score: ${score} / ${totalAsked}`);
        if (remarks !== null) {
            addLogEntry({ game: 'Triad & 7th Quiz', date: new Date().toLocaleDateString(), remarks });
            alert("Session logged!");
        }
    };
    
    const handleReviewNav = (direction) => {
        setReviewIndex(prev => {
            const newIndex = prev + direction;
            if (newIndex >= 0 && newIndex < history.length) {
                return newIndex;
            }
            return prev;
        });
    };
    
    // --- Render Logic ---
    if (!currentQuestion && reviewIndex === null) {
        return <div>Loading...</div>;
    }

    const isReviewing = reviewIndex !== null;
    const item = isReviewing ? history[reviewIndex] : { question: currentQuestion, userAnswer: userAnswer };
    const questionToDisplay = item.question;
    const answerToDisplay = item.userAnswer;

    const qualityOptions = Object.keys(questionTypes);
    const requiredNotes = questionToDisplay.notes.length;
    const buttonClass = 'bg-teal-600 hover:bg-teal-500';
    const selectedClass = 'bg-indigo-600 text-white';
    const correctClass = 'bg-green-500 text-white';
    const incorrectClass = 'bg-red-700 text-white';

    const handleNoteSelect = (note) => {
        if(isAnswered || isReviewing) return;
        const currentNotes = userAnswer.notes || [];
        const newNotes = currentNotes.includes(note) 
            ? currentNotes.filter(n => n !== note)
            : [...currentNotes, note].slice(0, requiredNotes);
        setUserAnswer({ notes: newNotes });
    };
    
    const handleNameSelect = (type, value) => {
        if(isAnswered || isReviewing) return;
        setUserAnswer(prev => ({ ...prev, [type]: value }));
    };

    const renderQuestion = () => {
        if (questionToDisplay.mode === 'nameTheTriad') {
            return <p className="text-4xl font-bold text-teal-300 tracking-widest">{questionToDisplay.notes.join(' - ')}</p>;
        }
        return <p className="text-4xl font-bold text-teal-300">{questionToDisplay.root} {questionToDisplay.quality}</p>;
    };

    const renderAnswerArea = () => {
        if (questionToDisplay.mode === 'nameTheTriad') {
            return (<>
                <div><h3 className="text-lg font-semibold text-gray-400 mb-2">Root Note</h3><div className="grid grid-cols-6 gap-1">{NOTES_CHROMATIC.map(note => <button key={note} onClick={() => handleNameSelect('root', note)} disabled={isAnswered || isReviewing} className={`py-2 rounded font-semibold ${answerToDisplay.root === note ? selectedClass : buttonClass}`}>{note}</button>)}</div></div>
                <div><h3 className="text-lg font-semibold text-gray-400 mb-2">Quality</h3><div className="grid grid-cols-2 lg:grid-cols-3 gap-1">{qualityOptions.map(q => <button key={q} onClick={() => handleNameSelect('quality', q)} disabled={isAnswered || isReviewing} className={`p-2 rounded font-semibold ${answerToDisplay.quality === q ? selectedClass : buttonClass}`}>{q}</button>)}</div></div>
            </>);
        }
        return (<div><h3 className="text-lg font-semibold text-gray-400 mb-2">Select {requiredNotes} Notes</h3><div className="grid grid-cols-6 gap-1">{NOTES_ENHARMONIC.map(note => {
            let noteClass = buttonClass;
            if (isReviewing) {
                const isCorrectNote = questionToDisplay.sortedNotes.includes(note);
                const wasSelected = answerToDisplay.notes?.includes(note);
                if (wasSelected && isCorrectNote) noteClass = correctClass;
                else if (wasSelected && !isCorrectNote) noteClass = incorrectClass;
                else if (answerToDisplay.notes?.includes(note)) noteClass = selectedClass;
            } else {
                if (answerToDisplay.notes?.includes(note)) noteClass = selectedClass;
            }
            return (<button key={note} onClick={() => handleNoteSelect(note)} disabled={isAnswered || isReviewing} className={`py-2 rounded font-semibold text-sm ${noteClass}`}>{note}</button>);
        })}</div></div>);
    };
    
    // UPDATED: The entire return statement is refactored into a single layout.
    return (
        <div className="flex flex-col md:flex-row items-start w-full gap-4">
             <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Triad & 7th Chord Quiz Guide">
                <p>This quiz tests your knowledge of triads and 7th chords.</p>
                <div className="p-2 bg-slate-800 rounded-lg border border-slate-600 my-2"><h4 className="font-bold text-indigo-300">Game Modes</h4><ul className="list-disc list-inside text-sm"><li><strong>Name the Chord:</strong> You are given several musical notes. Your task is to identify the root and quality of the chord they form.</li><li><strong>Name the Notes:</strong> You are given the name of a chord. Your task is to select the correct notes that make up that chord.</li></ul></div>
                <div className="p-2 bg-slate-800 rounded-lg border border-slate-600 my-2"><h4 className="font-bold text-indigo-300">Options</h4><ul className="list-disc list-inside text-sm"><li><strong>Include 7th Chords:</strong> Adds 7th chords (tetrads) to the quiz in addition to basic triads.</li><li><strong>Include Inversions:</strong> When enabled, the notes in "Name the Chord" mode may be shuffled out of root position.</li></ul></div>
            </InfoModal>

            {/* Main Quiz Area */}
            <div className="w-full flex-1 bg-slate-800 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2"><h1 className="text-2xl font-bold text-indigo-300">Triad & 7th Quiz</h1><InfoButton onClick={() => setIsInfoModalOpen(true)} /></div>
                    <button onClick={() => setIsControlsOpen(p => !p)} className="ml-2 p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-sm font-semibold">Controls</button>
                </div>
                <div className="flex justify-between items-center mb-4"><span className="text-xl">Score: {score}/{totalAsked}</span> <label className="flex items-center gap-2 cursor-pointer font-semibold"><input type="checkbox" checked={autoAdvance} onChange={() => setAutoAdvance(p => !p)} className="h-5 w-5" />Auto-Advance</label></div>

                <div className="min-h-[6rem] p-4 bg-slate-900/50 rounded-lg flex justify-center items-center mb-4">{renderQuestion()}</div>
                <div className={`text-lg font-bold my-4 min-h-[28px] ${feedback.type === 'correct' ? 'text-green-400' : 'text-red-400'}`}>{isReviewing ? ' ' : (feedback.message || <>&nbsp;</>)}</div>
                <div className="space-y-4">{renderAnswerArea()}</div>

                <div className="h-20 mt-4 flex justify-center items-center">
                    {isReviewing ? (
                        <div className="flex items-center justify-center gap-4 w-full"><button onClick={() => handleReviewNav(-1)} disabled={reviewIndex === 0} className="bg-slate-600 hover:bg-slate-500 font-bold p-3 rounded-lg disabled:opacity-50">Prev</button><button onClick={() => setReviewIndex(null)} className="flex-grow max-w-xs bg-purple-600 hover:bg-purple-500 font-bold p-3 rounded-lg text-xl">Return to Quiz</button><button onClick={() => handleReviewNav(1)} disabled={reviewIndex === history.length - 1} className="bg-slate-600 hover:bg-slate-500 font-bold p-3 rounded-lg disabled:opacity-50">Next</button></div>
                    ) : !isAnswered ? (
                        <button onClick={checkAnswer} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg">Submit</button>
                    ) : !autoAdvance && (
                        <button onClick={generateNewQuestion} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg animate-pulse">Next Question</button>
                    )}
                </div>
            </div>

            {/* Collapsible Controls Panel */}
            <div className={`bg-slate-700 rounded-lg transition-all duration-300 ease-in-out overflow-hidden ${isControlsOpen ? 'w-full md:w-80 p-4 mt-4 md:mt-0' : 'w-full md:w-0 p-0 opacity-0 md:opacity-100'}`}>
                <div className={`${!isControlsOpen && 'hidden md:block'}`}>
                    <h3 className="text-xl font-bold text-teal-300 mb-4">Settings & Controls</h3>
                    <div className="bg-slate-700 rounded-lg space-y-4">
                        <div>
                            <h3 className="font-semibold text-lg text-teal-300 mb-2">Quiz Mode</h3>
                            <div className="space-y-2"><label className={`block p-3 rounded-md cursor-pointer ${quizMode === 'nameTheTriad' ? 'bg-blue-600 text-white' : 'bg-slate-600 hover:bg-slate-500'}`}><input type="radio" name="quizMode" value="nameTheTriad" checked={quizMode === 'nameTheTriad'} onChange={(e) => setQuizMode(e.target.value)} className="mr-3" />Name the Chord</label><label className={`block p-3 rounded-md cursor-pointer ${quizMode === 'nameTheNotes' ? 'bg-blue-600 text-white' : 'bg-slate-600 hover:bg-slate-500'}`}><input type="radio" name="quizMode" value="nameTheNotes" checked={quizMode === 'nameTheNotes'} onChange={(e) => setQuizMode(e.target.value)} className="mr-3" />Name the Notes</label><label className={`block p-3 rounded-md cursor-pointer ${quizMode === 'mixed' ? 'bg-blue-600 text-white' : 'bg-slate-600 hover:bg-slate-500'}`}><input type="radio" name="quizMode" value="mixed" checked={quizMode === 'mixed'} onChange={(e) => setQuizMode(e.target.value)} className="mr-3" />Mixed Quiz</label></div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-teal-300 mb-2">Options</h3>
                            <label className="flex items-center gap-2 cursor-pointer p-2"><input type="checkbox" checked={include7ths} onChange={() => setInclude7ths(p => !p)} className="h-5 w-5" />Include 7th Chords</label>
                            <label className="flex items-center gap-2 cursor-pointer p-2"><input type="checkbox" checked={includeInversions} onChange={() => setIncludeInversions(p => !p)} className="h-5 w-5" />Include Inversions</label>
                        </div>
                        <div className="pt-4 border-t border-slate-600 flex flex-col gap-2">
                             {history.length > 0 && <button onClick={() => setReviewIndex(history.length - 1)} disabled={isReviewing} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">Review History</button>}
                             <button onClick={handleLogProgress} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg">Log Session</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TriadQuiz;