import React, { useState, useEffect, useCallback, useRef } from 'react';

// This is the React version of the "Intervals Quiz"
const IntervalsQuiz = () => {
    const [screen, setScreen] = useState('menu'); // 'menu' or 'quiz'
    const [selectedIntervals, setSelectedIntervals] = useState({ thirds: true, fourths: false, fifths: false });
    const [rootNote, setRootNote] = useState('C');
    const [intervalName, setIntervalName] = useState('3rd');
    const [correctTargetNote, setCorrectTargetNote] = useState('E');
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState({ message: '', type: '' }); // type: 'correct' or 'incorrect'
    const [score, setScore] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [answerChecked, setAnswerChecked] = useState(false);
    const [lastQuestion, setLastQuestion] = useState(null); // State to store the last question

    const answerInputRef = useRef(null);

    const intervalMaps = React.useMemo(() => ({
        thirds: { name: '3rd', map: { 'C': 'E', 'D': 'F#', 'E': 'G#', 'F': 'A', 'G': 'B', 'A': 'C#', 'B': 'D#' } },
        fourths: { name: '4th', map: { 'C': 'F', 'D': 'G', 'E': 'A', 'F': 'Bb', 'G': 'C', 'A': 'D', 'B': 'E' } },
        fifths: { name: '5th', map: { 'C': 'G', 'D': 'A', 'E': 'B', 'F': 'C', 'G': 'D', 'A': 'E', 'B': 'F#' } },
    }), []);

    const generateNewQuestion = useCallback(() => {
        setFeedback({ message: '', type: '' });
        setUserAnswer('');
        setAnswerChecked(false);
        if(answerInputRef.current) {
            answerInputRef.current.focus();
        }

        const activeIntervalKeys = Object.keys(selectedIntervals).filter(key => selectedIntervals[key]);
        if (activeIntervalKeys.length === 0) return;

        let randomRootNote, selectedMapData, randomTypeKey;

        // Loop until a unique question is generated
        do {
            randomTypeKey = activeIntervalKeys[Math.floor(Math.random() * activeIntervalKeys.length)];
            selectedMapData = intervalMaps[randomTypeKey];
            const notes = Object.keys(selectedMapData.map);
            randomRootNote = notes[Math.floor(Math.random() * notes.length)];
        } while (lastQuestion && randomRootNote === lastQuestion.rootNote && selectedMapData.name === lastQuestion.intervalName);

        setRootNote(randomRootNote);
        setIntervalName(selectedMapData.name);
        setCorrectTargetNote(selectedMapData.map[randomRootNote]);
        setLastQuestion({ rootNote: randomRootNote, intervalName: selectedMapData.name });
        
        if(screen === 'quiz') {
            setTotalQuestions(prev => prev + 1);
        }
    }, [selectedIntervals, intervalMaps, lastQuestion, screen]);

    const startQuiz = () => {
        setScore(0);
        setTotalQuestions(0);
        setScreen('quiz');
    }

    // Effect to generate the first question when the quiz screen loads
    useEffect(() => {
        if (screen === 'quiz') {
            generateNewQuestion();
        }
    }, [screen, generateNewQuestion]); // Dependency on screen change

    const checkAnswer = () => {
        if(answerChecked) return;

        const normalize = (note) => note.replace(/#/g, 's').replace(/b/g, 'f').toLowerCase();
        const isCorrect = normalize(userAnswer) === normalize(correctTargetNote);

        if (isCorrect) {
            setFeedback({ message: 'Correct!', type: 'correct' });
            setScore(prev => prev + 1);
        } else {
            setFeedback({ message: `Incorrect. The answer was ${correctTargetNote}.`, type: 'incorrect' });
        }
        setAnswerChecked(true);
    };

    const handleEnterPress = (e) => {
        if (e.key === 'Enter' && !answerChecked) {
            checkAnswer();
        }
    };
    
    // Keyboard listener for the 'n' key to go to the next question
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key.toLowerCase() === 'n' && answerChecked) {
                generateNewQuestion();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [answerChecked, generateNewQuestion]);

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setSelectedIntervals(prev => ({ ...prev, [name]: checked }));
    };

    const isStartDisabled = !Object.values(selectedIntervals).some(v => v);

    if (screen === 'menu') {
        return (
            <div className="flex flex-col items-center bg-slate-800 p-8 rounded-lg w-full max-w-md mx-auto">
                <h1 className="text-3xl font-extrabold mb-6 text-indigo-300">Intervals Quiz</h1>
                <h2 className="text-2xl font-bold mb-6 text-blue-200">Select Intervals</h2>
                <div className="flex flex-col items-start gap-4 mb-6">
                    {Object.keys(intervalMaps).map(key => (
                        <label key={key} className="flex items-center text-lg text-gray-200 cursor-pointer">
                            <input 
                                type="checkbox" 
                                name={key}
                                checked={selectedIntervals[key]}
                                onChange={handleCheckboxChange}
                                className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-3"
                            />
                            {`Major ${intervalMaps[key].name}s`}
                        </label>
                    ))}
                </div>
                <button onClick={startQuiz} disabled={isStartDisabled} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg text-xl disabled:bg-gray-500 disabled:cursor-not-allowed">
                    Start Quiz
                </button>
            </div>
        );
    }

    return (
         <div className="flex flex-col items-center bg-slate-800 p-8 rounded-lg w-full max-w-md mx-auto">
            <h1 className="text-3xl font-extrabold mb-6 text-indigo-300">Intervals Quiz</h1>
            <div className="w-full text-right text-xl mb-4 text-gray-300">Score: {score} / {totalQuestions}</div>
            <div className="text-5xl font-bold text-teal-300 mb-4">{rootNote}</div>
            <div className="text-2xl font-semibold text-gray-400 mb-6">What is the Major {intervalName} above?</div>
            <input
                ref={answerInputRef}
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={handleEnterPress}
                className="w-full text-center text-2xl p-3 rounded-lg bg-slate-700 text-white border-2 border-slate-600 focus:border-blue-500 focus:outline-none mb-4"
                placeholder="e.g., E, Bb"
                disabled={answerChecked}
            />
            <div className={`text-lg font-bold my-4 min-h-[28px] ${feedback.type === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                {feedback.message || <>&nbsp;</>}
            </div>
            
            {answerChecked && (
                 <div className="text-center text-gray-400 mb-4 animate-pulse">Press 'n' for the next question</div>
            )}

            <div className="w-full flex gap-4">
                <button onClick={checkAnswer} disabled={answerChecked} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed">
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
