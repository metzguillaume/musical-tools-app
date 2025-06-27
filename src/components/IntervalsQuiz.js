import React, { useState, useEffect, useCallback, useRef } from 'react';

const IntervalsQuiz = () => {
    const [screen, setScreen] = useState('menu'); // 'menu' or 'quiz'
    const [feedback, setFeedback] = useState({ message: '', type: '' });
    const [score, setScore] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [answerChecked, setAnswerChecked] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const answerInputRef = useRef(null);
    const lastQuestionRef = useRef(null);

    const intervalData = React.useMemo(() => ({
        "2nd": [
            { name: 'Minor 2nd', quality: 'Minor', semitones: 1 },
            { name: 'Major 2nd', quality: 'Major', semitones: 2 },
        ],
        "3rd": [
            { name: 'Minor 3rd', quality: 'Minor', semitones: 3 },
            { name: 'Major 3rd', quality: 'Major', semitones: 4 },
        ],
        "4th": [
            { name: 'Perfect 4th', quality: 'Perfect', semitones: 5 },
            { name: 'Augmented 4th (Tritone)', quality: 'Augmented', semitones: 6 },
        ],
        "5th": [
            { name: 'Diminished 5th (Tritone)', quality: 'Diminished', semitones: 6 },
            { name: 'Perfect 5th', quality: 'Perfect', semitones: 7 },
        ],
        "6th": [
            { name: 'Minor 6th', quality: 'Minor', semitones: 8 },
            { name: 'Major 6th', quality: 'Major', semitones: 9 },
        ],
        "7th": [
            { name: 'Minor 7th', quality: 'Minor', semitones: 10 },
            { name: 'Major 7th', quality: 'Major', semitones: 11 },
        ],
        "Unison/Octave": [
            { name: 'Perfect Unison', quality: 'Perfect', semitones: 0 },
            { name: 'Perfect Octave', quality: 'Perfect', semitones: 12 },
        ]
    }), []);

    const allIntervalNames = React.useMemo(() => Object.values(intervalData).flat().map(i => i.name), [intervalData]);

    const [selectedIntervals, setSelectedIntervals] = useState(() => {
        const initialState = {};
        allIntervalNames.forEach(name => {
            initialState[name] = false;
        });
        initialState['Major 3rd'] = true; // Default selection
        return initialState;
    });

    const generateNewQuestion = useCallback(() => {
        const naturalNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const naturalNoteData = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 };
        const notesByNumber = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

        const allIntervalsFlat = Object.values(intervalData).flat();
        const activeIntervals = allIntervalsFlat.filter(i => selectedIntervals[i.name]);

        if (activeIntervals.length === 0) return;

        let question;
        do {
            const rootNote = naturalNotes[Math.floor(Math.random() * naturalNotes.length)];
            const chosenInterval = activeIntervals[Math.floor(Math.random() * activeIntervals.length)];
            
            const intervalNumber = parseInt(chosenInterval.name.match(/\d+/)?.[0] || (chosenInterval.name.includes('Unison') ? 1 : 8), 10);
            
            const rootIndex = notesByNumber.indexOf(rootNote);
            const targetIndex = (rootIndex + intervalNumber - 1) % 7;
            const targetLetter = notesByNumber[targetIndex];

            const rootMidi = naturalNoteData[rootNote];
            let targetNaturalMidi = naturalNoteData[targetLetter];
            if (targetIndex < rootIndex || intervalNumber === 8) {
                targetNaturalMidi += 12;
            }

            const requiredMidi = rootMidi + chosenInterval.semitones;
            const accidentalValue = requiredMidi - targetNaturalMidi;

            let accidental = '';
            if (accidentalValue === 1) accidental = '#';
            else if (accidentalValue === 2) accidental = '##';
            else if (accidentalValue === -1) accidental = 'b';
            else if (accidentalValue === -2) accidental = 'bb';
            
            const targetNote = targetLetter + accidental;

            question = {
                rootNote,
                intervalName: chosenInterval.name,
                correctAnswer: targetNote
            };
        } while (lastQuestionRef.current && JSON.stringify(question) === JSON.stringify(lastQuestionRef.current));
        
        lastQuestionRef.current = question;
        setCurrentQuestion(question);
        setFeedback({ message: '', type: '' });
        setUserAnswer('');
        setAnswerChecked(false);
        setTotalQuestions(prev => prev + 1);

    }, [selectedIntervals, intervalData]);

    const startQuiz = () => {
        setScore(0);
        setTotalQuestions(-1);
        setScreen('quiz');
    };

    useEffect(() => {
        if (screen === 'quiz' && totalQuestions === -1) {
            generateNewQuestion();
        }
    }, [screen, totalQuestions, generateNewQuestion]);

    // Effect to focus the input field when a new question is ready
    useEffect(() => {
        if (screen === 'quiz' && !answerChecked && answerInputRef.current) {
            answerInputRef.current.focus();
        }
    }, [currentQuestion, screen, answerChecked]); // Reruns when the question changes

    const checkAnswer = useCallback(() => {
        if (answerChecked || !currentQuestion) return;

        const normalize = (note) => {
            let n = note.trim().toUpperCase();
            n = n.replace(/SHARP/g, '#').replace(/FLAT/g, 'B');
            return n;
        };

        const isCorrect = normalize(userAnswer) === normalize(currentQuestion.correctAnswer);

        if (isCorrect) {
            setFeedback({ message: 'Correct!', type: 'correct' });
            setScore(prev => prev + 1);
        } else {
            setFeedback({ message: `Incorrect. The answer was ${currentQuestion.correctAnswer}.`, type: 'incorrect' });
        }
        setAnswerChecked(true);
    }, [answerChecked, userAnswer, currentQuestion]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Enter') {
                if (answerChecked) {
                    generateNewQuestion();
                } else {
                    checkAnswer();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [answerChecked, checkAnswer, generateNewQuestion]);

    const handleSelectionChange = (name) => {
        setSelectedIntervals(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const handleQuickSelect = (quality) => {
        const newState = { ...selectedIntervals };
        const allIntervals = Object.values(intervalData).flat();
        allIntervals.forEach(interval => {
            if (interval.quality === quality) {
                newState[interval.name] = true;
            }
        });
        setSelectedIntervals(newState);
    };

    const handleSelectAll = (select) => {
        const newState = {};
        allIntervalNames.forEach(name => {
            newState[name] = select;
        });
        setSelectedIntervals(newState);
    };

    if (screen === 'menu') {
        return (
            <div className="flex flex-col items-center bg-slate-800 p-8 rounded-lg w-full max-w-2xl mx-auto">
                <h1 className="text-3xl font-extrabold mb-6 text-indigo-300">Interval Practice</h1>
                <h2 className="text-2xl font-bold mb-6 text-blue-200">Select Intervals to Practice</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full mb-6">
                    {Object.entries(intervalData).map(([groupName, intervals]) => (
                        <div key={groupName}>
                            <h3 className="font-bold text-lg text-teal-300 mb-2 border-b border-slate-600 pb-1">{groupName}s</h3>
                            <div className="flex flex-col gap-2">
                                {intervals.map(interval => (
                                    <label key={interval.name} className="flex items-center text-gray-200 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={!!selectedIntervals[interval.name]}
                                            onChange={() => handleSelectionChange(interval.name)}
                                            className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-3"
                                        />
                                        {interval.name.replace(' (Tritone)', '')}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                 <div className="flex flex-wrap justify-center gap-4 mb-6">
                    <button onClick={() => handleQuickSelect('Major')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg">Select Major</button>
                    <button onClick={() => handleQuickSelect('Minor')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg">Select Minor</button>
                    <button onClick={() => handleQuickSelect('Perfect')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg">Select Perfect</button>
                    <button onClick={() => handleSelectAll(true)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">Select All</button>
                    <button onClick={() => handleSelectAll(false)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">Deselect All</button>
                </div>
                <button onClick={startQuiz} disabled={!Object.values(selectedIntervals).some(v => v)} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg text-xl disabled:bg-gray-500 disabled:cursor-not-allowed">
                    Start Quiz
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center bg-slate-800 p-8 rounded-lg w-full max-w-md mx-auto">
            <h1 className="text-3xl font-extrabold mb-6 text-indigo-300">Interval Practice</h1>
            <div className="w-full text-right text-xl mb-4 text-gray-300">Score: {score} / {totalQuestions}</div>
            {currentQuestion && (
                <>
                    <div className="text-5xl font-bold text-teal-300 mb-4">{currentQuestion.rootNote}</div>
                    <div className="text-2xl font-semibold text-gray-400 mb-6">What is the {currentQuestion.intervalName} above?</div>
                </>
            )}
            <input
                ref={answerInputRef}
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="w-full text-center text-2xl p-3 rounded-lg bg-slate-700 text-white border-2 border-slate-600 focus:border-blue-500 focus:outline-none mb-4"
                placeholder="e.g., E, Bb"
                disabled={answerChecked}
            />
            <div className={`text-lg font-bold my-4 min-h-[28px] ${feedback.type === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                {feedback.message || <>&nbsp;</>}
            </div>
            <div className="text-center text-gray-400 mb-4 min-h-[24px] animate-pulse">
                {!answerChecked ? "Press Enter to Submit" : "Press Enter for Next Question"}
            </div>
            <div className="w-full flex gap-4">
                <button onClick={checkAnswer} disabled={answerChecked} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500">
                    Submit
                </button>
            </div>
            <button onClick={() => setScreen('menu')} className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
                Back to Menu
            </button>
        </div>
    );
};

export default IntervalsQuiz;
