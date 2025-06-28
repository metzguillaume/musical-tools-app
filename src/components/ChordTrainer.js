import React, { useState } from 'react';
import { useTools } from '../context/ToolsContext';

// --- Core Data and Logic ---
const chordData = {
    'C': { chords: ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'], type: 'major' },
    'G': { chords: ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'], type: 'major' },
    'D': { chords: ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'], type: 'major' },
    'A': { chords: ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#dim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'], type: 'major' },
    'E': { chords: ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#dim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'], type: 'major' },
    'B': { chords: ['B', 'C#m', 'D#m', 'E', 'F#', 'G#m', 'A#dim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'], type: 'major' },
    'F#': { chords: ['F#', 'G#m', 'A#m', 'B', 'C#', 'D#m', 'E#dim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'], type: 'major' },
    'Gb': { chords: ['Gb', 'Abm', 'Bbm', 'Cb', 'Db', 'Ebm', 'Fdim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'], type: 'major' },
    'Db': { chords: ['Db', 'Ebm', 'Fm', 'Gb', 'Ab', 'Bbm', 'Cdim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'], type: 'major' },
    'Ab': { chords: ['Ab', 'Bbm', 'Cm', 'Db', 'Eb', 'Fm', 'Gdim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'], type: 'major' },
    'Eb': { chords: ['Eb', 'Fm', 'Gm', 'Ab', 'Bb', 'Cm', 'Ddim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'], type: 'major' },
    'Bb': { chords: ['Bb', 'Cm', 'Dm', 'Eb', 'F', 'Gm', 'Adim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'], type: 'major' },
    'F': { chords: ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'Edim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'], type: 'major' },
    'Am': { chords: ['Am', 'Bdim', 'C', 'Dm', 'Em', 'F', 'G'], numerals: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'], type: 'minor' },
    'Em': { chords: ['Em', 'F#dim', 'G', 'Am', 'Bm', 'C', 'D'], numerals: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'], type: 'minor' },
    'Bm': { chords: ['Bm', 'C#dim', 'D', 'Em', 'F#m', 'G', 'A'], numerals: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'], type: 'minor' },
    'F#m': { chords: ['F#m', 'G#dim', 'A', 'Bm', 'C#m', 'D', 'E'], numerals: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'], type: 'minor' },
    'C#m': { chords: ['C#m', 'D#dim', 'E', 'F#m', 'G#m', 'A', 'B'], numerals: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'], type: 'minor' },
    'G#m': { chords: ['G#m', 'A#dim', 'B', 'C#m', 'D#m', 'E', 'F#'], numerals: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'], type: 'minor' },
    'D#m': { chords: ['D#m', 'E#dim', 'F#', 'G#m', 'A#m', 'B', 'C#'], numerals: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'], type: 'minor' },
    'Bbm': { chords: ['Bbm', 'Cdim', 'Db', 'Ebm', 'Fm', 'Gb', 'Ab'], numerals: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'], type: 'minor' },
    'Fm': { chords: ['Fm', 'Gdim', 'Ab', 'Bbm', 'Cm', 'Db', 'Eb'], numerals: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'], type: 'minor' },
    'Cm': { chords: ['Cm', 'Ddim', 'Eb', 'Fm', 'Gm', 'Ab', 'Bb'], numerals: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'], type: 'minor' },
    'Gm': { chords: ['Gm', 'Adim', 'Bb', 'Cm', 'Dm', 'Eb', 'F'], numerals: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'], type: 'minor' },
    'Dm': { chords: ['Dm', 'Edim', 'F', 'Gm', 'Am', 'Bb', 'C'], numerals: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'], type: 'minor' },
};
const keysInFifthsOrder = [
    ['C', 'Am'], ['G', 'Em'], ['D', 'Bm'], ['A', 'F#m'], ['E', 'C#m'], ['B', 'G#m'],
    ['F#', 'D#m'], ['Db', 'Bbm'], ['Ab', 'Fm'], ['Eb', 'Cm'], ['Bb', 'Gm'], ['F', 'Dm']
];
const extraEnharmonicKeys = ['Gb', 'Ebm'];
const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

function generateQuestions(selectedKeys, modes, numQuestions) {
    let allQuestions = [];
    const modesToGen = modes.includes(5) ? [1, 2, 3, 4] : modes;

    for (const key of selectedKeys) {
        const keyData = chordData[key];
        if (!keyData) continue;
        
        // --- THIS IS THE FIX for the question prompt formatting ---
        if (modesToGen.includes(1) || modesToGen.includes(4)) {
            for (let i = 0; i < keyData.chords.length; i++) {
                if (modesToGen.includes(1)) allQuestions.push({ mode: 1, key: key, prompt: `In **${key}**, what is the **${keyData.numerals[i]}** chord?`, answer: keyData.chords[i] });
                if (modesToGen.includes(4)) allQuestions.push({ mode: 4, key: key, prompt: `In **${key}**, what is the numeral for **${keyData.chords[i]}**?`, answer: keyData.numerals[i] });
            }
        }
        
        if (modesToGen.includes(2)) {
            for (let i = 0; i < 5; i++) {
                const p = shuffle([0, 1, 2, 3, 4, 5, 6]).slice(0, 4);
                const numeralProg = p.map(idx => keyData.numerals[idx]).join(' ');
                const chordProg = p.map(idx => keyData.chords[idx]).join(' ');
                allQuestions.push({ mode: 2, key: key, prompt: `In **${key}**, what are the chords for **${numeralProg}**?`, answer: chordProg });
            }
        }

        if (modesToGen.includes(3) && selectedKeys.length > 1) {
            const otherKeys = selectedKeys.filter(k => k !== key);
            if (otherKeys.length > 0) {
                for (let i = 0; i < 3; i++) {
                    const keyFrom = key;
                    const keyTo = otherKeys[Math.floor(Math.random() * otherKeys.length)];
                    const keyFromData = chordData[keyFrom];
                    const keyToData = chordData[keyTo];
                    const p = shuffle([0, 1, 2, 3, 4, 5, 6]).slice(0, 4);
                    const chordProgFrom = p.map(idx => keyFromData.chords[idx]).join(' ');
                    const chordProgTo = p.map(idx => keyToData.chords[idx]).join(' ');
                    allQuestions.push({ mode: 3, key: keyTo, prompt: `The progression **'${chordProgFrom}'** in **${keyFrom}** is what in **${keyTo}**?`, answer: chordProgTo });
                }
            }
        }
    }
    
    return shuffle(allQuestions).slice(0, numQuestions);
}

const reminders = {
    1: { 
        major: "e.g., G, Am, Bdim",
        minor: "e.g., C, Dm, Bdim"
    },
    2: {
        major: "e.g., C G Am Edim",
        minor: "e.g., Am F G Bdim"
    },
    3: {
        major: "e.g., G D Em Bdim",
        minor: "e.g., Em C D F#dim"
    },
    4: {
        major: "e.g., I V vi vii°",
        minor: "e.g., i v VI ii°"
    }
};

const KeyCheckbox = ({ angle, radius, keyName, selected, onChange }) => {
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) rotate(${angle}deg) translate(${radius}px) rotate(${-angle}deg)`,
    };
    return (
        <div style={style}>
            <label className={`block p-2 rounded-md text-center cursor-pointer min-w-[50px] ${selected ? 'bg-blue-600 text-white' : 'bg-slate-600 hover:bg-slate-500'}`}>
                <input type="checkbox" checked={selected} onChange={() => onChange(keyName)} className="sr-only" />
                {keyName}
            </label>
        </div>
    );
};

const ChordTrainer = () => {
    const { addLogEntry } = useTools();
    const [screen, setScreen] = useState('setup');
    const [selectedKeys, setSelectedKeys] = useState({});
    const [selectedModes, setSelectedModes] = useState({ 1: true });
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState('');
    const [score, setScore] = useState(0);
    const [autoAdvance, setAutoAdvance] = useState(true);

    const handleKeySelection = (key) => setSelectedKeys(prev => ({ ...prev, [key]: !prev[key] }));
    const handleModeSelection = (mode) => setSelectedModes(prev => ({ ...prev, [mode]: !prev[mode] }));

    const handleStartQuiz = () => {
        const keys = Object.keys(selectedKeys).filter(k => selectedKeys[k]);
        const modes = Object.keys(selectedModes).filter(m => selectedModes[m]).map(Number);
        
        if (keys.length === 0) { alert("Please select at least one key."); return; }
        if (modes.length === 0) { alert("Please select at least one game mode."); return; }
        
        if ((modes.includes(3) || modes.includes(5)) && keys.length < 2) {
            alert("Transpose Progression and Mixed Mode require at least two keys to be selected.");
            return;
        }

        const generatedQuestions = generateQuestions(keys, modes, 20);
        if (generatedQuestions.length === 0) { alert("Could not generate questions with the current settings."); return; }

        setQuestions(generatedQuestions);
        setCurrentQuestionIndex(0);
        setScore(0);
        setFeedback('');
        setUserAnswer('');
        setScreen('quiz');
    };
    
    const nextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setUserAnswer('');
            setFeedback('');
        } else {
            setScreen('results');
        }
    };
    
    const handleAnswerSubmit = (e) => {
        e.preventDefault();
        if (feedback) return;
        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = userAnswer.trim().replace(/\s+/g, ' ').toLowerCase() === currentQuestion.answer.toLowerCase();

        if (isCorrect) {
            setScore(prev => prev + 1);
            setFeedback('Correct!');
        } else {
            setFeedback(`Incorrect. The answer was: ${currentQuestion.answer}`);
        }

        if (autoAdvance) {
            setTimeout(() => {
                nextQuestion();
            }, 1500);
        }
    };

    const handleGoToSetup = () => {
        if (window.confirm("Are you sure you want to go back to the menu? Your current progress will be lost.")) {
            setScreen('setup');
            setQuestions([]);
            setCurrentQuestionIndex(0);
            setScore(0);
        }
    };

    const handleLogSession = () => {
        const remarks = prompt("Enter any remarks for this session:", `Score: ${score}/${questions.length}`);
        if (remarks !== null) {
            addLogEntry({
                game: 'Chord Trainer',
                date: new Date().toLocaleDateString(),
                remarks: remarks || "No remarks."
            });
            alert("Session logged!");
        }
    };

    const QuizScreen = () => {
        const question = questions[currentQuestionIndex];
        const promptParts = question.prompt.split('**');
        
        let reminderText = "";
        const keyType = chordData[question.key]?.type || 'major';
        const modeReminders = reminders[question.mode];

        if (modeReminders) {
            if (typeof modeReminders === 'object') {
                reminderText = modeReminders[keyType];
            } else {
                reminderText = modeReminders;
            }
        } else {
            reminderText = "Enter your answer below."
        }
        

        return (
            <div className="flex flex-col items-center w-full">
                <div className="w-full flex justify-between items-center mb-4 text-lg">
                    <button onClick={handleGoToSetup} className="text-sm bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded-lg">
                        &larr; Back to Menu
                    </button>
                    <span>Score: {score}</span>
                </div>

                <div className="w-full bg-slate-800 p-4 rounded-lg text-center min-h-[80px] flex justify-center items-center flex-wrap gap-x-2 mb-2">
                    {promptParts.map((part, index) => (
                        <span key={index} className={index % 2 === 1 ? 'text-2xl md:text-3xl font-bold text-teal-300' : 'text-xl md:text-2xl text-gray-200'}>
                            {part}
                        </span>
                    ))}
                </div>

                <div className={`text-md my-1 min-h-[40px] flex items-center text-center italic ${feedback ? 'text-transparent' : 'text-gray-400'}`}>{reminderText}</div>

                {feedback && (
                     <div className={`text-xl mb-2 min-h-[28px] flex items-center justify-center ${feedback.startsWith('Correct') ? 'text-green-400' : 'text-red-400'}`}>{feedback}</div>
                )}

                <form onSubmit={handleAnswerSubmit} className="w-full max-w-sm flex flex-col items-center">
                    <input type="text" value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)}
                        className="w-full text-center text-xl p-2 md:text-2xl md:p-3 rounded-lg bg-slate-700 text-white border-2 border-slate-600 focus:border-blue-500 focus:outline-none"
                        disabled={!!feedback} autoFocus />
                    
                    <div className="h-16 mt-3 flex items-center">
                        {!feedback ? (
                             <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg">
                                Submit
                            </button>
                        ) : !autoAdvance && (
                            <button type="button" onClick={nextQuestion} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg animate-pulse">
                                Next Question
                            </button>
                        )}
                    </div>
                </form>

                <div className="mt-4 flex items-center gap-2 p-2 rounded-lg">
                    <label htmlFor="auto-advance" className="font-semibold text-sm text-gray-300">Auto-Advance:</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="auto-advance" checked={autoAdvance} onChange={() => setAutoAdvance(p => !p)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>
        );
    };

    const SetupScreen = () => (
        <div className="w-full">
            <h2 className="text-3xl font-extrabold mb-6 text-indigo-300 text-center">Chord Trainer Setup</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-700 p-4 rounded-lg flex flex-col items-center">
                     <h3 className="text-xl font-bold text-teal-300 mb-4 text-center">Select Keys</h3>
                     <div className="relative w-[300px] h-[300px] sm:w-[320px] sm:h-[320px] mx-auto mb-4">
                        {keysInFifthsOrder.map(([majorKey, minorKey], index) => {
                            const angle = index * (360 / 12) - 90;
                            const radiusMajor = window.innerWidth < 400 ? 125 : 135;
                            const radiusMinor = window.innerWidth < 400 ? 85 : 95;
                            return (
                                <React.Fragment key={majorKey}>
                                    <KeyCheckbox angle={angle} radius={radiusMajor} keyName={majorKey} selected={!!selectedKeys[majorKey]} onChange={handleKeySelection} />
                                    <KeyCheckbox angle={angle} radius={radiusMinor} keyName={minorKey} selected={!!selectedKeys[minorKey]} onChange={handleKeySelection} />
                                </React.Fragment>
                            )
                        })}
                     </div>
                     <div className="border-t border-slate-600 pt-3 text-center mt-2">
                         <h4 className="font-semibold text-lg text-gray-400 mb-2">Enharmonic Keys</h4>
                         <div className="flex justify-center gap-4">
                            {extraEnharmonicKeys.map(keyName => (
                                 <label key={keyName} className={`block p-2 rounded-md text-center cursor-pointer min-w-[50px] ${selectedKeys[keyName] ? 'bg-blue-600 text-white' : 'bg-slate-600 hover:bg-slate-500'}`}>
                                    <input type="checkbox" checked={!!selectedKeys[keyName]} onChange={() => handleKeySelection(keyName)} className="sr-only" />
                                    {keyName}
                                </label>
                            ))}
                         </div>
                     </div>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg flex flex-col">
                     <h3 className="text-xl font-bold text-teal-300 mb-4">Game Modes</h3>
                     <div className="space-y-2">
                        {[
                            {id: 1, label: "Name the Chord (from numeral)"},
                            {id: 4, label: "Name the Numeral (from chord)"},
                            {id: 2, label: "Name Chord Progression"},
                            {id: 3, label: "Transpose Progression"},
                            {id: 5, label: "Mixed Mode (All selected)"}
                        ].map(mode => (
                             <label key={mode.id} className={`block p-3 rounded-md cursor-pointer ${selectedModes[mode.id] ? 'bg-blue-600 text-white' : 'bg-slate-600 hover:bg-slate-500'}`}>
                                <input type="checkbox" checked={!!selectedModes[mode.id]} onChange={() => handleModeSelection(mode.id)} className="mr-3" />
                                {mode.label}
                            </label>
                        ))}
                     </div>
                     <div className="mt-auto pt-4">
                        <button onClick={handleStartQuiz} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-lg text-xl">
                            Start Quiz
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const ResultsScreen = () => (
        <div className="text-center">
            <h2 className="text-3xl font-extrabold mb-4 text-indigo-300">Quiz Complete!</h2>
            <p className="text-2xl text-teal-300 mb-8">Your final score is: {score} / {questions.length}</p>
            <div className="flex justify-center gap-4">
                <button onClick={() => setScreen('setup')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg text-xl">
                    Play Again
                </button>
                <button onClick={handleLogSession} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg text-xl">
                    Log Session
                </button>
            </div>
        </div>
    );
    
    if (screen === 'setup') return <SetupScreen />;
    if (screen === 'quiz') return <QuizScreen />;
    if (screen === 'results') return <ResultsScreen />;
};

export default ChordTrainer;