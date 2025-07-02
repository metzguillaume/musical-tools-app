import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTools } from '../context/ToolsContext';
import FretboardDiagram from './FretboardDiagram';
import { fretboardModel } from '../utils/fretboardUtils.js';

const IntervalFretboardQuiz = () => {
    const { addLogEntry } = useTools();
    const [score, setScore] = useState(0);
    const [totalAsked, setTotalAsked] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [feedback, setFeedback] = useState({ message: '', type: '' });
    const [isAnswered, setIsAnswered] = useState(false);
    const [selected, setSelected] = useState({ quality: null, number: null });
    const [autoAdvance, setAutoAdvance] = useState(true);
    const timeoutRef = useRef(null);
    
    // --- STATE FOR HISTORY ---
    // REPLACED `lastQuestion` and `isReviewing` with a more robust history system
    const [history, setHistory] = useState([]);
    const [reviewIndex, setReviewIndex] = useState(null); // null = live quiz, number = index of history array

    const quizData = useMemo(() => ({
        qualities: ['Diminished', 'Minor', 'Perfect', 'Major', 'Augmented'],
        numericButtons: ['Unison / Octave', '2nd', '3rd', '4th', '5th', '6th', '7th'],
        intervalsToTest: [
            { name: { quality: 'Minor', number: '3rd' }, semitones: 3 },
            { name: { quality: 'Major', number: '3rd' }, semitones: 4 },
            { name: { quality: 'Perfect', number: '4th' }, semitones: 5 },
            { name: { quality: 'Perfect', number: '5th' }, semitones: 7 },
            { name: { quality: 'Major', number: '6th' }, semitones: 9 },
            { name: { quality: 'Perfect', number: 'Octave' }, semitones: 12 },
        ]
    }), []);

    const startNewRound = useCallback(() => {
        clearTimeout(timeoutRef.current);
        setReviewIndex(null); // Always exit review mode when a new round starts

        setCurrentQuestion(prevQuestion => {
            // Add the just-completed question to the history array
            if (prevQuestion) {
                setHistory(prevHistory => [...prevHistory, prevQuestion]);
            }

            let newQuestion = null;
            while (newQuestion === null) {
                const rootStringIndex = Math.floor(Math.random() * 6);
                const rootFret = Math.floor(Math.random() * 8);
                const rootNote = fretboardModel[rootStringIndex][rootFret];

                const interval = quizData.intervalsToTest[Math.floor(Math.random() * quizData.intervalsToTest.length)];
                const targetMidi = rootNote.midi + interval.semitones;

                const possibleTargets = [];
                [-2, -1, 1, 2].forEach(stringOffset => {
                    const targetStringIndex = rootStringIndex + stringOffset;
                    if (targetStringIndex >= 0 && targetStringIndex < 6) {
                        fretboardModel[targetStringIndex].forEach((noteOnString, fret) => {
                            const isInRange = Math.abs(fret - rootFret) <= 4;
                            if (noteOnString.midi === targetMidi && fret < 12 && isInRange && (targetStringIndex !== rootStringIndex || fret !== rootFret)) {
                                possibleTargets.push({ string: 6 - targetStringIndex, fret: fret, label: noteOnString.note });
                            }
                        });
                    }
                });

                if (possibleTargets.length > 0) {
                    const targetNote = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
                    newQuestion = {
                        notes: [{ string: 6 - rootStringIndex, fret: rootFret, label: rootNote.note, isRoot: true }, targetNote],
                        answer: interval.name
                    };
                }
            }
            return newQuestion;
        });

        setTotalAsked(prev => prev + 1);
        setFeedback({ message: '', type: '' });
        setSelected({ quality: null, number: null });
        setIsAnswered(false);
    }, [quizData.intervalsToTest]);

    useEffect(() => {
        setScore(0);
        setTotalAsked(0);
        setHistory([]);
        startNewRound();
        return () => clearTimeout(timeoutRef.current);
    }, [startNewRound]);
    
    // --- HANDLERS FOR HISTORY REVIEW ---
    const handleEnterReview = () => {
        if (history.length > 0) {
            setReviewIndex(history.length - 1); // Start review at the most recent question
        }
    };

    const handleReviewNav = (direction) => {
        setReviewIndex(prevIndex => {
            const newIndex = prevIndex + direction;
            if (newIndex >= 0 && newIndex < history.length) {
                return newIndex;
            }
            return prevIndex; // Stay at the current index if out of bounds
        });
    };


    const checkAnswer = useCallback(() => {
        if (isAnswered || !currentQuestion) return;
        const correct = currentQuestion.answer;
        let isCorrect = false;
        if (selected.number === 'Unison / Octave') {
            if (selected.quality === 'Perfect' && (correct.number === 'Unison' || correct.number === 'Octave')) {
                isCorrect = true;
            }
        } else {
            if (selected.quality === correct.quality && selected.number === correct.number) {
                isCorrect = true;
            }
        }
        if (isCorrect) {
            setScore(s => s + 1);
            setFeedback({ message: 'Correct!', type: 'correct' });
        } else {
            setFeedback({ message: `Incorrect! It was a ${correct.quality} ${correct.number}.`, type: 'incorrect' });
        }
        setIsAnswered(true);
        if (autoAdvance) {
            timeoutRef.current = setTimeout(startNewRound, 2000);
        }
    }, [isAnswered, selected, currentQuestion, autoAdvance, startNewRound]);

    useEffect(() => {
        if (selected.quality && selected.number && !isAnswered) {
            checkAnswer();
        }
    }, [selected, checkAnswer, isAnswered]);
    
    const handleLogProgress = () => {
        const remarks = prompt("Enter any remarks for this session:", `Score: ${score} / ${totalAsked}`);
        if (remarks !== null) { addLogEntry({ game: 'Interval Fretboard Quiz', date: new Date().toLocaleDateString(), remarks: remarks || "No remarks." }); alert("Session logged!"); }
    };

    const handleSelection = (type, value) => {
        const isReviewing = reviewIndex !== null;
        if (isAnswered || isReviewing) return;
        setSelected(prev => ({ ...prev, [type]: value }));
    };

    const isReviewing = reviewIndex !== null;
    const questionToDisplay = isReviewing ? history[reviewIndex] : currentQuestion;
    const buttonsDisabled = isAnswered || isReviewing;
    
    if (!questionToDisplay) { return <div>Loading...</div>; }

    return (
        <div className="bg-slate-800 p-4 md:p-8 rounded-lg w-full max-w-2xl mx-auto text-center">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl md:text-3xl font-extrabold text-indigo-300">
                    {isReviewing ? `Reviewing Question ${reviewIndex + 1}` : 'Intervals on Fretboard'}
                </h1>
                <button onClick={handleLogProgress} className="bg-green-600 hover:bg-green-500 text-white font-bold py-1 px-3 rounded-lg text-sm">Log Session</button>
            </div>
            <div className="text-xl mb-4 text-gray-300">Score: {score} / {totalAsked > 0 ? totalAsked - 1 : 0}</div>
            
            <FretboardDiagram 
                notesToDisplay={questionToDisplay.notes} 
                showLabels={isReviewing || isAnswered} 
                startFret={0} 
                fretCount={12} 
            />

            <div className={`text-lg font-bold my-4 min-h-[28px] ${feedback.type === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                {isReviewing 
                    ? `The correct answer was ${questionToDisplay.answer.quality} ${questionToDisplay.answer.number}.` 
                    : (feedback.message || <>&nbsp;</>)
                }
            </div>

            <div className="grid grid-cols-2 gap-6 mb-4">
                {/* Answer buttons are disabled in review mode */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-400 mb-3">Quality</h3>
                    <div className="flex flex-col gap-2">{quizData.qualities.map(q => (<button key={q} onClick={() => handleSelection('quality', q)} disabled={buttonsDisabled} className={`p-3 rounded-lg font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${selected.quality === q && !isReviewing ? 'bg-indigo-600 text-white ring-2 ring-white' : 'bg-teal-600 hover:bg-teal-500'}`}>{q}</button>))}</div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-400 mb-3">Number</h3>
                    <div className="grid grid-cols-2 gap-2">{quizData.numericButtons.map(n => (<button key={n} onClick={() => handleSelection('number', n)} disabled={buttonsDisabled} className={`p-3 rounded-lg font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${selected.number === n && !isReviewing ? 'bg-indigo-600 text-white ring-2 ring-white' : 'bg-teal-600 hover:bg-teal-500'}`}>{n}</button>))}</div>
                </div>
            </div>

            {/* --- ACTION BUTTONS & HISTORY REVIEW UI --- */}
            <div className="mt-4 min-h-[52px] flex justify-center items-center gap-4">
                {isReviewing ? (
                    <div className='flex items-center justify-center gap-4 w-full'>
                        <button onClick={() => handleReviewNav(-1)} disabled={reviewIndex === 0} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-4 rounded-lg text-lg disabled:opacity-50">Prev</button>
                        <button onClick={() => setReviewIndex(null)} className="flex-grow max-w-xs bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-lg text-xl">Return to Quiz</button>
                        <button onClick={() => handleReviewNav(1)} disabled={reviewIndex === history.length - 1} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-4 rounded-lg text-lg disabled:opacity-50">Next</button>
                    </div>
                ) : (
                    <>
                        {isAnswered && history.length > 0 && (
                             <button onClick={handleEnterReview} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg text-md">
                                Review History
                            </button>
                        )}
                        {isAnswered && !autoAdvance && (
                            <button onClick={startNewRound} className="flex-grow max-w-xs bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg text-xl animate-pulse">
                                Next Question
                            </button>
                        )}
                    </>
                )}
            </div>

            <div className="w-full border-t border-slate-600 pt-4 mt-6">
                <div className="flex justify-center items-center gap-4">
                    <label htmlFor="auto-advance" className="font-semibold text-lg text-gray-300">Auto-Advance:</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="auto-advance" checked={autoAdvance} onChange={() => setAutoAdvance(p => !p)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default IntervalFretboardQuiz;