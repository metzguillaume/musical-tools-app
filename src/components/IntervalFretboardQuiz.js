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
    const [history, setHistory] = useState([]);
    const [reviewIndex, setReviewIndex] = useState(null);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    const quizData = useMemo(() => ({
        qualities: ['Diminished', 'Minor', 'Perfect', 'Major', 'Augmented'],
        numericButtons: ['Unison / Octave', '2nd', '3rd', '4th', 'Tritone', '5th', '6th', '7th'],
        intervalsToTest: [
            { name: { quality: 'Perfect', number: 'Unison' }, semitones: 0 },
            { name: { quality: 'Minor', number: '2nd' }, semitones: 1 },
            { name: { quality: 'Major', number: '2nd' }, semitones: 2 },
            { name: { quality: 'Minor', number: '3rd' }, semitones: 3 },
            { name: { quality: 'Major', number: '3rd' }, semitones: 4 },
            { name: { quality: 'Perfect', number: '4th' }, semitones: 5 },
            { name: { quality: 'Tritone', number: 'Tritone' }, semitones: 6 },
            { name: { quality: 'Perfect', number: '5th' }, semitones: 7 },
            { name: { quality: 'Minor', number: '6th' }, semitones: 8 },
            { name: { quality: 'Major', number: '6th' }, semitones: 9 },
            { name: { quality: 'Minor', number: '7th' }, semitones: 10 },
            { name: { quality: 'Major', number: '7th' }, semitones: 11 },
            { name: { quality: 'Perfect', number: 'Octave' }, semitones: 12 },
        ]
    }), []);

    // ... (startNewRound, checkAnswer, and other handler functions remain the same) ...
    const startNewRound = useCallback(() => {
        clearTimeout(timeoutRef.current);
        setReviewIndex(null);

        setCurrentQuestion(prevQuestion => {
            if (prevQuestion) {
                setHistory(prevHistory => [...prevHistory, prevQuestion]);
            }

            let newQuestion = null;
            let attempts = 0;
            while (newQuestion === null && attempts < 50) {
                attempts++;
                const rootStringIndex = Math.floor(Math.random() * 6);
                const rootFret = Math.floor(Math.random() * 8);
                const rootNote = fretboardModel[rootStringIndex][rootFret];
                const interval = quizData.intervalsToTest[Math.floor(Math.random() * quizData.intervalsToTest.length)];

                if (prevQuestion && JSON.stringify(interval.name) === JSON.stringify(prevQuestion.answer)) {
                    continue;
                }
                const targetMidi = rootNote.midi + interval.semitones;
                const possibleTargets = [];
                [-2, -1, 0, 1, 2].forEach(stringOffset => {
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
            return newQuestion || prevQuestion;
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

    const checkAnswer = useCallback(() => {
        if (isAnswered || !currentQuestion) return;
        const correct = currentQuestion.answer;
        let isCorrect = false;

        if (selected.number === 'Tritone') {
            isCorrect = correct.number === 'Tritone';
        } else if (selected.number === 'Unison / Octave') {
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
            const correctAnswerText = correct.number === 'Tritone' ? 'a Tritone' : `a ${correct.quality} ${correct.number}`;
            setFeedback({ message: `Incorrect! It was ${correctAnswerText}.`, type: 'incorrect' });
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
        if (value === 'Tritone') {
            setSelected({ quality: 'Tritone', number: 'Tritone' });
        } else {
            setSelected(prev => ({ ...prev, [type]: value }));
        }
    };

    const handleEnterReview = () => {
        if (history.length > 0) {
            setReviewIndex(history.length - 1);
        }
    };

    const handleReviewNav = (direction) => {
        setReviewIndex(prevIndex => {
            const newIndex = prevIndex + direction;
            if (newIndex >= 0 && newIndex < history.length) {
                return newIndex;
            }
            return prevIndex;
        });
    };

    const isReviewing = reviewIndex !== null;
    const questionToDisplay = isReviewing ? history[reviewIndex] : currentQuestion;
    const buttonsDisabled = isAnswered || isReviewing;
    
    // UPDATED: Create a formatted list of intervals to display in the help modal
    const intervalList = quizData.intervalsToTest
        .map(i => i.name.number === 'Tritone' ? 'Tritone' : `${i.name.quality} ${i.name.number}`)
        .join(', ');

    if (!questionToDisplay) { return <div>Loading...</div>; }

    return (
        <div className="bg-slate-800 p-4 md:p-8 rounded-lg w-full max-w-2xl mx-auto text-center">
            {isInfoModalOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 flex justify-center items-center z-50"
                    onClick={() => setIsInfoModalOpen(false)}
                >
                    <div 
                        className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-lg w-11/12 shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className="text-2xl font-bold text-indigo-300 mb-4">How to Play</h3>
                        <div className="text-left text-gray-300 space-y-3">
                            <p>A diagram of a guitar fretboard will be displayed with two notes.</p>
                            <p>The green note marked 'R' is the **root note**.</p>
                            <p>Your goal is to identify the interval between the root note and the second note by its shape on the fretboard.</p>
                            <div className="p-3 bg-slate-800 rounded-lg border border-slate-600">
                                <h4 className="font-bold text-indigo-300">Special Note on Tritones:</h4>
                                {/* UPDATED: The explanation for the Tritone button is now clearer. */}
                                <p className="text-sm mt-1">The 'Tritone' button represents the augmented 4th/ diminished 5th. Since it's a unique interval, selecting 'Tritone' counts as a complete answer without needing to select a quality.</p>
                            </div>
                             {/* ADDED: A list of all intervals tested in the game. */}
                            <div className="p-3 bg-slate-800 rounded-lg border border-slate-600">
                                <h4 className="font-bold text-indigo-300">Intervals Tested:</h4>
                                <p className="text-sm mt-1">{intervalList}.</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsInfoModalOpen(false)}
                            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-indigo-300">
                        {isReviewing ? `Reviewing Question ${reviewIndex + 1}` : 'Intervals on Fretboard'}
                    </h1>
                    <button onClick={() => setIsInfoModalOpen(true)} className="p-1 rounded-full text-gray-400 hover:bg-slate-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                </div>
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
                    ? `The correct answer was ${questionToDisplay.answer.number === 'Tritone' ? 'a Tritone' : `a ${questionToDisplay.answer.quality} ${questionToDisplay.answer.number}`}.`
                    : (feedback.message || <>&nbsp;</>)
                }
            </div>

            <div className="grid grid-cols-2 gap-6 mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-400 mb-3">Quality</h3>
                    <div className="flex flex-col gap-2">
                        {quizData.qualities.map(q => {
                            const isDisabled = buttonsDisabled || q === 'Augmented' || q === 'Diminished';
                            return (
                                <button key={q} onClick={() => handleSelection('quality', q)} disabled={isDisabled} className={`p-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${selected.quality === q && !isReviewing ? 'bg-indigo-600 text-white ring-2 ring-white' : 'bg-teal-600 hover:bg-teal-500'}`}>{q}</button>
                            );
                        })}
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-400 mb-3">Number</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {quizData.numericButtons.map(n => {
                            // UPDATED: Removed the special color logic for the Tritone button.
                            const normalColor = 'bg-teal-600 hover:bg-teal-500';
                            const selectedColor = 'bg-indigo-600 text-white ring-2 ring-white';
                            const colorClasses = selected.number === n && !isReviewing ? selectedColor : normalColor;

                            return (
                                <button key={n} onClick={() => handleSelection('number', n)} disabled={buttonsDisabled} className={`p-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${colorClasses}`}>{n}</button>
                            )
                        })}
                    </div>
                </div>
            </div>

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