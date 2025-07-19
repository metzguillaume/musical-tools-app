import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTools } from '../context/ToolsContext';
import InfoModal from './InfoModal';
import InfoButton from './InfoButton';

// --- Helpers for Button Input ---
const NOTE_LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const ACCIDENTALS = [
    { id: 'bb', display: '♭♭' },
    { id: 'b', display: '♭' },
    { id: 'natural', display: '' },
    { id: '#', display: '♯' },
    { id: '##', display: '♯♯' },
];

const CollapsibleSection = ({ title, isOpen, onToggle, children }) => (
    <div className="border-t border-slate-600/80 pt-3 mt-3">
        <button
            onClick={onToggle}
            className="w-full flex justify-between items-center text-left text-lg font-bold text-teal-300 hover:text-teal-200"
        >
            <span>{title}</span>
            <span className="text-xl">{isOpen ? '−' : '+'}</span>
        </button>
        {isOpen && <div className="pt-4 space-y-4">{children}</div>}
    </div>
);


const IntervalsQuiz = () => {
    const { bpm, addLogEntry } = useTools();
    const [feedback, setFeedback] = useState({ message: '', type: '' });
    const [score, setScore] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [answerChecked, setAnswerChecked] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [userAnswer, setUserAnswer] = useState({ noteLetter: '', accidental: null });
    const [rootNoteType, setRootNoteType] = useState('chromatic');
    const [autoAdvance, setAutoAdvance] = useState(true);
    const [isControlsOpen, setIsControlsOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [direction, setDirection] = useState('above'); // 'above', 'below', 'both'
    const lastQuestionRef = useRef(null);
    const timeoutRef = useRef(null);

    const intervalData = React.useMemo(() => ({
        "2nd": [{ name: 'Minor 2nd', quality: 'Minor', semitones: 1 }, { name: 'Major 2nd', quality: 'Major', semitones: 2 }],
        "3rd": [{ name: 'Minor 3rd', quality: 'Minor', semitones: 3 }, { name: 'Major 3rd', quality: 'Major', semitones: 4 }],
        "4th": [{ name: 'Perfect 4th', quality: 'Perfect', semitones: 5 }, { name: 'Augmented 4th (Tritone)', quality: 'Augmented', semitones: 6 }],
        "5th": [{ name: 'Diminished 5th (Tritone)', quality: 'Diminished', semitones: 6 }, { name: 'Perfect 5th', quality: 'Perfect', semitones: 7 }],
        "6th": [{ name: 'Minor 6th', quality: 'Minor', semitones: 8 }, { name: 'Major 6th', quality: 'Major', semitones: 9 }],
        "7th": [{ name: 'Minor 7th', quality: 'Minor', semitones: 10 }, { name: 'Major 7th', quality: 'Major', semitones: 11 }],
        "Unison/Octave": [{ name: 'Perfect Unison', quality: 'Perfect', semitones: 0 }, { name: 'Perfect Octave', quality: 'Perfect', semitones: 12 }]
    }), []);

    const allIntervalNames = React.useMemo(() => Object.values(intervalData).flat().map(i => i.name), [intervalData]);
    const [selectedIntervals, setSelectedIntervals] = useState(() => {
        const initialState = {};
        allIntervalNames.forEach(name => { initialState[name] = true; });
        return initialState;
    });

    const generateNewQuestion = useCallback(() => {
        clearTimeout(timeoutRef.current);
        const naturalNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const chromaticKeys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'];
        const naturalNoteData = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 };
        const notesByNumber = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const allIntervalsFlat = Object.values(intervalData).flat();
        const activeIntervals = allIntervalsFlat.filter(i => selectedIntervals[i.name]);
        if (activeIntervals.length === 0) {
            setCurrentQuestion({ rootNote: 'N/A', intervalName: 'No intervals selected', correctAnswer: '', direction: 'above' });
            return;
        };
        let question;
        do {
            const rootNotePool = rootNoteType === 'natural' ? naturalNotes : chromaticKeys;
            const rootNote = rootNotePool[Math.floor(Math.random() * rootNotePool.length)];
            const chosenInterval = activeIntervals[Math.floor(Math.random() * activeIntervals.length)];
            const questionDirection = direction === 'both' ? (Math.random() < 0.5 ? 'above' : 'below') : direction;
            
            const rootNoteLetter = rootNote.charAt(0);
            const rootAccidentalStr = rootNote.substring(1);
            let rootAccidentalVal = 0;
            if (rootAccidentalStr.includes('#')) rootAccidentalVal = rootAccidentalStr.length;
            if (rootAccidentalStr.includes('b')) rootAccidentalVal = -rootAccidentalStr.length;
            
            const intervalNumber = parseInt(chosenInterval.name.match(/\d+/)?.[0] || (chosenInterval.name.includes('Unison') ? 1 : 8), 10);
            const rootIndex = notesByNumber.indexOf(rootNoteLetter);
            const rootMidi = naturalNoteData[rootNoteLetter] + rootAccidentalVal;
            
            let targetIndex, requiredMidi;
            if (questionDirection === 'above') {
                targetIndex = (rootIndex + intervalNumber - 1) % 7;
                requiredMidi = rootMidi + chosenInterval.semitones;
            } else { // 'below'
                targetIndex = (rootIndex - (intervalNumber - 1) + 7) % 7;
                requiredMidi = rootMidi - chosenInterval.semitones;
            }
            
            const targetLetter = notesByNumber[targetIndex];
            let targetNaturalMidi = naturalNoteData[targetLetter];
            
            if (questionDirection === 'above' && (targetIndex < rootIndex || intervalNumber === 8)) {
                targetNaturalMidi += 12;
            } else if (questionDirection === 'below' && (targetIndex > rootIndex || intervalNumber === 8)) {
                targetNaturalMidi -= 12;
            }

            const accidentalValue = requiredMidi - targetNaturalMidi;
            let accidental = '';
            if (accidentalValue === 1) accidental = '#'; else if (accidentalValue === 2) accidental = '##'; else if (accidentalValue === -1) accidental = 'b'; else if (accidentalValue === -2) accidental = 'bb';
            const targetNote = targetLetter + accidental;
            question = { rootNote, intervalName: chosenInterval.name, correctAnswer: targetNote, direction: questionDirection };
        } while (lastQuestionRef.current && JSON.stringify(question) === JSON.stringify(lastQuestionRef.current));
        
        lastQuestionRef.current = question;
        setCurrentQuestion(question);
        setFeedback({ message: '', type: '' });
        setUserAnswer({ noteLetter: '', accidental: null });
        setAnswerChecked(false);
        setTotalQuestions(prev => prev + 1);
    }, [selectedIntervals, intervalData, rootNoteType, direction]);
    
    useEffect(() => {
        setScore(0);
        setTotalQuestions(0);
        generateNewQuestion();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        generateNewQuestion();
    }, [generateNewQuestion]);

    const checkAnswer = useCallback(() => {
        if (answerChecked || !currentQuestion) return;
        const userAnswerString = `${userAnswer.noteLetter}${userAnswer.accidental}`;
        const normalize = (note) => note.trim().toUpperCase().replace(/SHARP/g, '#').replace(/FLAT/g, 'B');
        const isCorrect = normalize(userAnswerString) === normalize(currentQuestion.correctAnswer);
        if (isCorrect) {
            setFeedback({ message: 'Correct!', type: 'correct' });
            setScore(prev => prev + 1);
        } else {
            setFeedback({ message: `Incorrect. The answer was ${currentQuestion.correctAnswer}.`, type: 'incorrect' });
        }
        setAnswerChecked(true);
        if (autoAdvance) {
            timeoutRef.current = setTimeout(generateNewQuestion, 1500);
        }
    }, [answerChecked, userAnswer, currentQuestion, autoAdvance, generateNewQuestion]);

    const handleAnswerSelect = (type, value) => {
        if (answerChecked) return;
        setUserAnswer(prev => ({ ...prev, [type]: value }));
    };

    useEffect(() => {
        if (autoAdvance && userAnswer.noteLetter && userAnswer.accidental !== null) {
            checkAnswer();
        }
    }, [userAnswer, autoAdvance, checkAnswer]);

    useEffect(() => {
        const handleKeyDown = (event) => { 
            if (event.key === 'Enter') { 
                if (answerChecked && !autoAdvance) {
                    generateNewQuestion();
                } else if (!answerChecked && userAnswer.noteLetter && userAnswer.accidental !== null) {
                    checkAnswer();
                }
            } 
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [answerChecked, checkAnswer, generateNewQuestion, autoAdvance, userAnswer]);

    const handleLogProgress = () => {
        const remarks = prompt("Enter any remarks for this session:", `Score: ${score}/${totalQuestions}`);
        if (remarks !== null) { addLogEntry({ game: 'Interval Practice', bpm, date: new Date().toLocaleDateString(), remarks: remarks || "No remarks." }); alert("Session logged!"); }
    };

    const handleSelectionChange = (name) => setSelectedIntervals(prev => ({ ...prev, [name]: !prev[name] }));
    const handleQuickSelect = (quality) => { const newState = { ...selectedIntervals }; Object.values(intervalData).flat().forEach(i => { if (i.quality === quality) newState[i.name] = !newState[i.name]; }); setSelectedIntervals(newState); };
    const handleSelectAll = (select) => { const newState = {}; allIntervalNames.forEach(name => { newState[name] = select; }); setSelectedIntervals(newState); };

    const selectedClass = 'bg-indigo-600 text-white';
    const buttonClass = 'bg-teal-600 hover:bg-teal-500';
    
    const ControlsContent = (
        <div className="space-y-6">
            <CollapsibleSection title="Quiz Options" isOpen={true}>
                 <div className="flex flex-col gap-y-4">
                    <div className="flex items-center gap-4">
                        <span className="font-semibold text-lg">Root Notes:</span>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer text-lg"><input type="radio" name="rootType" value="natural" checked={rootNoteType === 'natural'} onChange={() => setRootNoteType('natural')} />Natural</label>
                            <label className="flex items-center gap-2 cursor-pointer text-lg"><input type="radio" name="rootType" value="chromatic" checked={rootNoteType === 'chromatic'} onChange={() => setRootNoteType('chromatic')} />Chromatic</label>
                        </div>
                    </div>
                    <div>
                        <span className="font-semibold text-lg">Direction:</span>
                        <div className="flex bg-slate-600 rounded-md p-1 mt-2">
                            <button onClick={() => setDirection('above')} className={`flex-1 rounded-md text-sm py-1 ${direction === 'above' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Above</button>
                            <button onClick={() => setDirection('below')} className={`flex-1 rounded-md text-sm py-1 ${direction === 'below' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Below</button>
                            <button onClick={() => setDirection('both')} className={`flex-1 rounded-md text-sm py-1 ${direction === 'both' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Both</button>
                        </div>
                    </div>
                </div>
            </CollapsibleSection>
            <CollapsibleSection title="Interval Selection" isOpen={true}>
                <div className="flex flex-wrap justify-start gap-2 mb-4">
                    <h4 className="text-lg font-semibold text-blue-200 w-full">Quick Select</h4>
                    <button onClick={() => handleQuickSelect('Major')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1 px-3 text-sm rounded-lg">Toggle Major</button>
                    <button onClick={() => handleQuickSelect('Minor')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1 px-3 text-sm rounded-lg">Toggle Minor</button>
                    <button onClick={() => handleQuickSelect('Perfect')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1 px-3 text-sm rounded-lg">Toggle Perfect</button>
                    <button onClick={() => handleSelectAll(true)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 text-sm rounded-lg">Select All</button>
                    <button onClick={() => handleSelectAll(false)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 text-sm rounded-lg">Deselect All</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {Object.entries(intervalData).map(([groupName, intervals]) => (
                        <div key={groupName} className="break-inside-avoid">
                            <h5 className="font-bold text-base text-teal-300 mb-2 border-b border-slate-600 pb-1">{groupName}s</h5>
                            <div className="flex flex-col gap-3">{intervals.map(interval => (
                                <label key={interval.name} className="flex items-center justify-between text-gray-200 cursor-pointer">
                                    <span className="text-sm">{interval.name.replace(' (Tritone)', '')}</span>
                                    <div className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={!!selectedIntervals[interval.name]} onChange={() => handleSelectionChange(interval.name)} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </div>
                                </label>
                            ))}</div>
                        </div>
                    ))}
                </div>
            </CollapsibleSection>
        </div>
    );

    return (
        <div className="flex flex-col md:flex-row items-start w-full gap-4">
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Interval Practice Quiz Guide">
                <div className="space-y-4 text-sm">
                    <p>This quiz helps you practice calculating intervals from a given root note.</p>
                    <div><h4 className="font-bold text-indigo-300 mb-1">How To Play</h4><p>A root note and an interval will be displayed (e.g., "C" and "Major 3rd above"). Use the buttons to select the note letter and its accidental, then press Enter to check your answer. The empty button in the accidental section represents a natural note.</p></div>
                    <div><h4 className="font-bold text-indigo-300 mb-1">Settings</h4><p>Click the "Controls" button to open the settings panel. Here you can choose which intervals to include, whether to use natural-only or all chromatic root notes, and the direction of the interval (above or below the root note).</p></div>
                </div>
            </InfoModal>

            <div className="w-full flex-1 bg-slate-800 p-4 md:p-8 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                         <h1 className="text-2xl md:text-3xl font-extrabold text-indigo-300">Interval Practice</h1>
                        <InfoButton onClick={() => setIsInfoModalOpen(true)} />
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleLogProgress} className="bg-green-600 hover:bg-green-500 text-white font-bold py-1 px-3 rounded-lg text-sm">Log Session</button>
                        <button onClick={() => setIsControlsOpen(p => !p)} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-sm font-semibold">Controls</button>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4 text-lg">
                    <span className="font-semibold text-gray-300">Score: {score} / {totalQuestions}</span>
                     <label className="flex items-center gap-2 cursor-pointer font-semibold">
                        <span className="text-gray-300">Auto-Advance</span>
                        <div className="relative">
                            <input type="checkbox" id="auto-advance-quiz" checked={autoAdvance} onChange={() => setAutoAdvance(p => !p)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </div>
                    </label>
                </div>
                
                <div className="text-center w-full max-w-md mx-auto mt-6">
                    {currentQuestion && (<>
                        <div className="text-5xl font-bold text-teal-300 mb-4">{currentQuestion.rootNote}</div>
                        <div className="text-2xl font-semibold text-gray-400 mb-6">What is the {currentQuestion.intervalName} {currentQuestion.direction}?</div>
                    </>)}
                    
                    <div className="space-y-4">
                         <div>
                            <h3 className="text-lg font-semibold text-gray-400 mb-2">Note</h3>
                            <div className="grid grid-cols-7 gap-1">
                                {NOTE_LETTERS.map(note => <button key={note} onClick={() => handleAnswerSelect('noteLetter', note)} disabled={answerChecked} className={`py-3 rounded font-semibold ${userAnswer.noteLetter === note ? selectedClass : buttonClass}`}>{note}</button>)}
                            </div>
                        </div>
                         <div>
                            <h3 className="text-lg font-semibold text-gray-400 mb-2">Accidental</h3>
                            <div className="grid grid-cols-5 gap-1">
                                {ACCIDENTALS.map(acc => <button key={acc.id} onClick={() => handleAnswerSelect('accidental', acc.id === 'natural' ? '' : acc.id)} disabled={answerChecked} className={`py-3 rounded font-semibold text-xl ${userAnswer.accidental === (acc.id === 'natural' ? '' : acc.id) ? selectedClass : buttonClass}`}>{acc.display}</button>)}
                            </div>
                        </div>
                    </div>

                    <div className={`text-lg font-bold my-4 min-h-[28px] ${feedback.type === 'correct' ? 'text-green-400' : 'text-red-400'}`}>{feedback.message || <>&nbsp;</>}</div>
                    
                    <div className="h-14 mt-4 flex justify-center items-center">
                        {!autoAdvance ? (
                            !answerChecked ? (
                                <button onClick={checkAnswer} disabled={userAnswer.noteLetter === '' || userAnswer.accidental === null} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg disabled:bg-gray-500">Submit</button>
                            ) : (
                                 <button onClick={generateNewQuestion} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg animate-pulse">Next Question</button>
                            )
                        ) : null}
                     </div>
                </div>
            </div>
            
            {/* Desktop Panel */}
            <div className={`hidden md:block bg-slate-700 rounded-lg transition-all duration-300 ease-in-out ${isControlsOpen ? 'w-96 p-4' : 'w-0 p-0 overflow-hidden'}`}>
                <div className={`${!isControlsOpen && 'hidden'}`}>
                    <h3 className="text-xl font-bold text-teal-300 mb-4">Settings & Controls</h3>
                    {ControlsContent}
                </div>
            </div>

            {/* Mobile Overlay */}
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

export default IntervalsQuiz;