import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTools } from '../../context/ToolsContext';
import FretboardDiagram from '../FretboardDiagram';
import InfoModal from '../InfoModal';
import InfoButton from '../InfoButton';
import { fretboardModel } from '../../utils/fretboardUtils.js';
import { CAGED_SHAPES, ROOT_NOTE_OPTIONS, SHAPE_ORDER } from './cagedConstants.js';
import { NOTE_TO_MIDI, SEMITONE_TO_DEGREE } from '../../utils/musicTheory.js';

// --- Re-usable UI Components ---
const ShowDegreesToggle = ({ isChecked, onChange }) => (
    <label className="flex items-center justify-center gap-2 cursor-pointer p-2 bg-slate-700 rounded-md">
        <span className="font-semibold text-gray-300 text-sm">Show Degrees</span>
        <div className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={isChecked} onChange={onChange} className="sr-only peer" />
            <div className="w-9 h-5 bg-gray-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
        </div>
    </label>
);

const ControlsContent = ({ quizMode, setQuizMode, settings, handleSettingToggle }) => (
    <div className="space-y-4">
        <div>
            <h3 className="font-semibold text-lg text-teal-300 mb-2">Game Mode</h3>
            <div className="flex bg-slate-600 rounded-md p-1">
                <button onClick={() => setQuizMode('identify')} className={`flex-1 rounded-md text-sm py-1 ${quizMode === 'identify' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Identify</button>
                <button onClick={() => setQuizMode('construct')} className={`flex-1 rounded-md text-sm py-1 ${quizMode === 'construct' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Construct</button>
                <button onClick={() => setQuizMode('mixed')} className={`flex-1 rounded-md text-sm py-1 ${quizMode === 'mixed' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Mixed</button>
            </div>
        </div>
        <div>
             <h3 className="font-semibold text-lg text-teal-300 mb-2">Chord Qualities</h3>
             <div className="space-y-2">
                <label className="flex items-center justify-between gap-2 cursor-pointer p-2 bg-slate-600 rounded-md">
                    <span className="font-semibold">Major</span>
                     <div className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={settings.includeMajor} onChange={() => handleSettingToggle('quality', 'includeMajor')} className="sr-only peer" /><div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></div>
                </label>
                <label className="flex items-center justify-between gap-2 cursor-pointer p-2 bg-slate-600 rounded-md">
                    <span className="font-semibold">Minor</span>
                     <div className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={settings.includeMinor} onChange={() => handleSettingToggle('quality', 'includeMinor')} className="sr-only peer" /><div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></div>
                </label>
             </div>
        </div>
        <div>
            <h3 className="font-semibold text-lg text-teal-300 mb-2">Shapes to Practice</h3>
             <div className="grid grid-cols-3 gap-2">
                {SHAPE_ORDER.map(shape => (
                    <label key={shape} className="flex items-center justify-center gap-2 cursor-pointer p-2 bg-slate-600 rounded-md">
                        <span className="font-semibold">{shape}</span>
                        <div className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={settings.shapes[shape]} onChange={() => handleSettingToggle('shapes', shape)} className="sr-only peer" /><div className="w-9 h-5 bg-gray-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div></div>
                    </label>
                ))}
             </div>
        </div>
    </div>
);

// --- Main Component ---
const CAGEDSystemQuiz = () => {
    const { addLogEntry } = useTools();
    const [score, setScore] = useState(0);
    const [totalAsked, setTotalAsked] = useState(0);
    const [feedback, setFeedback] = useState({ message: '', type: '' });
    const [isAnswered, setIsAnswered] = useState(false);
    const [autoAdvance, setAutoAdvance] = useState(true);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isControlsOpen, setIsControlsOpen] = useState(false);
    const timeoutRef = useRef(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [userAnswer, setUserAnswer] = useState({});
    const [history, setHistory] = useState([]);
    const [reviewIndex, setReviewIndex] = useState(null);
    const isReviewing = reviewIndex !== null;
    
    const [quizMode, setQuizMode] = useState('mixed');
    const [settings, setSettings] = useState({
        includeMajor: true,
        includeMinor: true,
        shapes: { E: true, A: true, G: true, C: true, D: true },
        showDegrees: false,
    });

    const activeShapes = useMemo(() => {
        const active = [];
        if (settings.includeMajor) Object.keys(settings.shapes).forEach(shape => { if(settings.shapes[shape]) active.push({ quality: 'major', shape: shape }); });
        if (settings.includeMinor) Object.keys(settings.shapes).forEach(shape => { if(settings.shapes[shape]) active.push({ quality: 'minor', shape: shape }); });
        return active;
    }, [settings.includeMajor, settings.includeMinor, settings.shapes]);

    const handleSettingToggle = useCallback((type, key) => {
        setSettings(prev => {
            const newSettings = { ...prev };
            if (type === 'shapes') newSettings.shapes = { ...prev.shapes, [key]: !prev.shapes[key] };
            else newSettings[key] = !prev[key];
            return newSettings;
        });
    }, []);

    const generateNewQuestion = useCallback(() => {
        clearTimeout(timeoutRef.current);
        setReviewIndex(null);

        if (activeShapes.length === 0) {
            setCurrentQuestion({ notes: [], answer: null, prompt: 'Please select shapes/qualities in Controls to begin.', mode: quizMode });
            return;
        }

        const currentModeForQuestion = quizMode === 'mixed' ? (Math.random() < 0.5 ? 'identify' : 'construct') : quizMode;
        let question = null;
        let attempts = 0;
        
        while (!question && attempts < 50) {
            attempts++;
            const { quality, shape } = activeShapes[Math.floor(Math.random() * activeShapes.length)];
            const shapeData = CAGED_SHAPES[quality][shape];
            const rootNoteInShape = shapeData.notes.find(n => n.d === 'R');
            const randomFret = Math.floor(Math.random() * 10);
            const root = fretboardModel[6 - rootNoteInShape.s][randomFret].note;
            const fretOffset = randomFret - rootNoteInShape.f;

            const answerNotes = shapeData.notes.map(note => {
                const fret = note.f + fretOffset;
                if (fret < 0 || fret > 15) return null;
                const finalNoteInfo = fretboardModel[6 - note.s][fret];
                return { ...note, string: note.s, fret, isRoot: note.d === 'R', label: finalNoteInfo.note, midi: finalNoteInfo.midi };
            }).filter(Boolean);

            if (answerNotes.length !== shapeData.notes.length) continue;
            const mutedMarkers = shapeData.muted.map(s => ({ string: s, fret: -1, label: 'X' }));
            question = { notes: [...answerNotes, ...mutedMarkers], answer: { root, quality, shape, notes: answerNotes }, prompt: `Construct ${root} ${quality} (${shape} shape)`, mode: currentModeForQuestion };
        }

        setCurrentQuestion(question);
        if(!isReviewing) setTotalAsked(prev => prev + 1);
        setIsAnswered(false);
        setFeedback({ message: '', type: '' });
        setUserAnswer(currentModeForQuestion === 'identify' ? { root: null, quality: null, shape: null } : { notes: [] });

    }, [activeShapes, quizMode, isReviewing]);

     useEffect(() => {
        setScore(0);
        setTotalAsked(0);
        setHistory([]);
        generateNewQuestion();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quizMode, activeShapes]);

    const checkAnswer = useCallback(() => {
        if (isAnswered || !currentQuestion) return;
        const correct = currentQuestion.answer;
        let isCorrect = false;
        const correctEnharmonicRoot = ROOT_NOTE_OPTIONS.find(opt => opt.value === correct.root || opt.altValue === correct.root);
        const correctAnswerText = `${correctEnharmonicRoot.display} ${correct.quality} (${correct.shape} shape)`;

        if (currentQuestion.mode === 'identify') {
            const userRoot = userAnswer.root || '';
            const correctGroup = ROOT_NOTE_OPTIONS.find(opt => opt.value === correct.root || opt.altValue === correct.root);
            const isRootCorrect = correctGroup && (userRoot === correctGroup.value || userRoot === correctGroup.altValue);
            isCorrect = isRootCorrect && userAnswer.quality === correct.quality && userAnswer.shape === correct.shape;
        } else {
            const correctSet = new Set(correct.notes.map(n => `${n.string}-${n.fret}`));
            const userSet = new Set(userAnswer.notes.map(n => `${n.string}-${n.fret}`));
            isCorrect = correctSet.size === userSet.size && [...correctSet].every(note => userSet.has(note));
        }
        
        if (isCorrect) {
            setScore(s => s + 1);
            setFeedback({ message: 'Correct!', type: 'correct' });
        } else {
            setFeedback({ message: `Incorrect! It was ${correctAnswerText}.`, type: 'incorrect' });
        }
        
        setHistory(prev => [...prev, { question: currentQuestion, userAnswer, wasCorrect: isCorrect }]);
        setIsAnswered(true);
        if (autoAdvance) timeoutRef.current = setTimeout(generateNewQuestion, 2000);
    }, [isAnswered, userAnswer, currentQuestion, autoAdvance, generateNewQuestion]);
    
    const handleAnswerSelect = (type, value) => {
        if (isAnswered || isReviewing) return;
        setUserAnswer(prev => ({ ...prev, [type]: value }));
    };

    const handleFretClick = (string, fret) => {
        if (isAnswered || isReviewing || currentQuestion?.mode !== 'construct') return;
        const noteId = `${string}-${fret}`;
        const currentNotes = userAnswer.notes || [];
        const isAlreadyClicked = currentNotes.some(n => `${n.string}-${n.fret}` === noteId);
        let newNotes;
        if (isAlreadyClicked) {
            newNotes = currentNotes.filter(n => `${n.string}-${n.fret}` !== noteId);
        } else {
            const noteInfo = fretboardModel[6-string][fret];
            const rootMidi = NOTE_TO_MIDI[currentQuestion.answer.root];
            const interval = (noteInfo.midi - rootMidi) % 12;
            const degree = SEMITONE_TO_DEGREE[interval < 0 ? interval + 12 : interval];
            const enrichedNote = { string, fret, label: noteInfo.note, midi: noteInfo.midi, isRoot: noteInfo.midi % 12 === rootMidi % 12, degree: degree };
            newNotes = [...currentNotes, enrichedNote];
        }
        setUserAnswer({ notes: newNotes });
    };
    
    useEffect(() => {
        if (autoAdvance && currentQuestion?.mode === 'identify' && userAnswer.root && userAnswer.quality && userAnswer.shape) checkAnswer();
    }, [userAnswer, autoAdvance, checkAnswer, currentQuestion]);

    const itemToDisplay = useMemo(() => isReviewing ? history[reviewIndex] : { question: currentQuestion, userAnswer }, [isReviewing, history, reviewIndex, currentQuestion, userAnswer]);

    const notesForDiagram = useMemo(() => {
        if (!itemToDisplay?.question) return [];
        const { question, userAnswer: itemUserAnswer } = itemToDisplay;

        // FIX: This function now correctly handles the display toggle for all notes, including roots.
        const getNoteLabel = (note) => {
            if (!note) return '';
            if (settings.showDegrees) {
                return note.degree; // e.g., '1', 'b3', '5'
            }
            return note.label; // e.g., 'C', 'Eb', 'G'
        };

        // This block handles the display logic for an active, unanswered question.
        if (!isAnswered && !isReviewing) {
            if (question.mode === 'identify') {
                // For 'identify', we show the notes but only label the root with 'R'.
                return question.notes.map(note => ({ ...note, label: note.isRoot ? 'R' : '' }));
            }
            if (question.mode === 'construct') {
                return [ 
                    ...question.notes.filter(n => n.fret === -1), 
                    // FIX: We pass `isRoot: false` to the diagram to prevent it from showing 'R' as a clue.
                    ...(userAnswer.notes || []).map(n => ({...n, isRoot: false, overrideColor: '#3b82f6'})) 
                ];
            }
        }

        // This block handles the display logic for feedback (after answering) and for the history review.
        if (isAnswered || isReviewing) {
            const correctNotes = question.answer.notes;
            const userNotes = itemUserAnswer.notes || [];
            const correctSet = new Set(correctNotes.map(n => `${n.string}-${n.fret}`));

            const correctNotesStyled = correctNotes.map(note => ({
                ...note,
                overrideLabel: getNoteLabel(note),
                overrideColor: note.isRoot ? '#166534' : '#22c55e',
            }));
            
            const incorrectClicksStyled = userNotes
                .filter(n => !correctSet.has(`${n.string}-${n.fret}`))
                .map(note => ({ ...note, overrideLabel: getNoteLabel(note), overrideColor: '#ef4444' }));

            const mutedStrings = question.notes.filter(n => n.fret === -1);
            return [...correctNotesStyled, ...incorrectClicksStyled, ...mutedStrings];
        }
        return [];
    }, [itemToDisplay, isAnswered, isReviewing, settings.showDegrees, userAnswer.notes]);

    const handleLogProgress = () => {
        const remarks = prompt("Enter any remarks for this session:", `Score: ${score} / ${totalAsked}`);
        if (remarks !== null) addLogEntry({ game: 'CAGED Fretboard Quiz', date: new Date().toLocaleDateString(), remarks }); alert("Session logged!");
    };
    
    const handleReviewNav = (direction) => setReviewIndex(prev => { const newIndex = prev + direction; if (newIndex >= 0 && newIndex < history.length) return newIndex; return prev; });
    const handleEnterReview = () => { if (history.length > 0) { clearTimeout(timeoutRef.current); setReviewIndex(history.length - 1); } };
    
    const selectedClass = 'bg-indigo-600 text-white';
    const buttonClass = 'bg-teal-600 hover:bg-teal-500';
    
    const renderReviewFeedback = () => {
        if (!isReviewing) return null;
        const { question, userAnswer, wasCorrect } = itemToDisplay;
        const correctEnharmonicRoot = ROOT_NOTE_OPTIONS.find(opt => opt.value === question.answer.root || opt.altValue === question.answer.root);
        const correctAnswerText = `${correctEnharmonicRoot.display} ${question.answer.quality} (${question.answer.shape} shape)`;
        let userAnswerText;
        if (question.mode === 'identify') userAnswerText = `${userAnswer.root || '?'} ${userAnswer.quality || '?'} (${userAnswer.shape || '?'})`;
        else userAnswerText = (userAnswer.notes && userAnswer.notes.length > 0) ? userAnswer.notes.map(n => n.label).join(', ') : "No answer";

        return (
            <div className={`text-center p-3 rounded-lg ${wasCorrect ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                <p className="font-bold text-gray-200">Correct Answer: <span className="text-teal-300 font-semibold">{correctAnswerText}</span></p>
                {!wasCorrect && <p className="mt-1"><span className="font-bold text-gray-300">Your Answer:</span> <span className="text-red-400 font-semibold">{userAnswerText}</span></p>}
            </div>
        );
    };

    return (
        <div className="flex flex-col md:flex-row items-start w-full gap-4">
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="CAGED System Quiz Guide">
                <div className="space-y-4 text-sm">
                    {/* Modal Content */}
                </div>
            </InfoModal>

            <div className="w-full flex-1 bg-slate-800 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3"><h1 className="text-2xl font-bold text-indigo-300">CAGED System Quiz</h1><InfoButton onClick={() => setIsInfoModalOpen(true)} /></div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleLogProgress} className="bg-green-600 hover:bg-green-500 text-white font-bold py-1 px-3 rounded-lg text-sm">Log Session</button>
                        <button onClick={() => setIsControlsOpen(p => !p)} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-sm font-semibold">Controls</button>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4 text-lg">
                    <span className="font-semibold text-gray-300">Score: {score} / {totalAsked}</span>
                    <div className="flex items-center gap-2">
                        {history.length > 0 && <button onClick={handleEnterReview} disabled={isReviewing} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded-lg text-sm disabled:opacity-50">Review History</button>}
                        <label className="flex items-center gap-2 cursor-pointer font-semibold"><span className="text-gray-300">Auto-Advance</span><div className="relative"><input type="checkbox" checked={autoAdvance} onChange={() => setAutoAdvance(p => !p)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></div></label>
                    </div>
                </div>
                
                {currentQuestion?.mode === 'construct' && !isReviewing && <div className="text-center text-2xl font-semibold text-gray-400 my-4">{currentQuestion?.prompt}</div>}
                
                <div className="my-4">
                    <FretboardDiagram 
                        notesToDisplay={notesForDiagram} 
                        onBoardClick={handleFretClick}
                        showLabels={isAnswered || isReviewing} 
                    />
                </div>

                 <div className={`my-4 min-h-[60px] flex flex-col justify-center`}>
                    {isReviewing ? renderReviewFeedback() : <p className={`text-lg font-bold text-center ${feedback.type === 'correct' ? 'text-green-400' : 'text-red-400'}`}>{feedback.message || <>&nbsp;</>}</p>}
                </div>
                
                {!isReviewing && currentQuestion?.mode === 'identify' && (
                    <div className="space-y-4 max-w-2xl mx-auto">
                        <div><h3 className="text-base font-semibold text-gray-400 mb-2">Root Note</h3><div className="grid grid-cols-6 md:grid-cols-12 gap-1">{ROOT_NOTE_OPTIONS.map(note => <button key={note.value} onClick={() => handleAnswerSelect('root', note.value)} disabled={isAnswered} className={`py-3 px-1 rounded font-semibold text-xs md:text-sm ${userAnswer.root === note.value || userAnswer.root === note.altValue ? selectedClass : buttonClass}`}>{note.display}</button>)}</div></div>
                        <div><h3 className="text-base font-semibold text-gray-400 mb-2">Quality</h3><div className="grid grid-cols-2 gap-2">{['major', 'minor'].map(q => <button key={q} onClick={() => handleAnswerSelect('quality', q)} disabled={isAnswered} className={`py-3 font-semibold capitalize text-base ${userAnswer.quality === q ? selectedClass : buttonClass}`}>{q}</button>)}</div></div>
                        <div><h3 className="text-base font-semibold text-gray-400 mb-2">Shape</h3><div className="grid grid-cols-5 gap-2">{SHAPE_ORDER.map(shape => <button key={shape} onClick={() => handleAnswerSelect('shape', shape)} disabled={isAnswered} className={`py-3 font-semibold text-base ${userAnswer.shape === shape ? selectedClass : buttonClass}`}>{shape}</button>)}</div></div>
                    </div>
                )}
                
                {!isReviewing && currentQuestion?.mode === 'construct' && !isAnswered && (
                    <div className="flex justify-center gap-4 max-w-lg mx-auto">
                        <button onClick={() => setUserAnswer({ notes: [] })} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg">Clear</button>
                        <button onClick={checkAnswer} disabled={!userAnswer.notes || userAnswer.notes.length === 0} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg disabled:bg-gray-500">Submit</button>
                    </div>
                )}

                <div className="h-20 mt-4 flex justify-center items-center">
                    {isReviewing ? (
                        <div className="flex items-center justify-center gap-4 w-full">
                            <button onClick={() => handleReviewNav(-1)} disabled={reviewIndex === 0} className="bg-slate-600 hover:bg-slate-500 font-bold p-3 rounded-lg disabled:opacity-50">Prev</button>
                            <div className="flex-grow max-w-xs flex flex-col items-center gap-2">
                                <button onClick={() => setReviewIndex(null)} className="bg-purple-600 hover:bg-purple-500 font-bold p-3 rounded-lg text-xl w-full">Return to Quiz</button>
                                <ShowDegreesToggle isChecked={settings.showDegrees} onChange={() => handleSettingToggle('display', 'showDegrees')} />
                            </div>
                            <button onClick={() => handleReviewNav(1)} disabled={reviewIndex === history.length - 1} className="bg-slate-600 hover:bg-slate-500 font-bold p-3 rounded-lg disabled:opacity-50">Next</button>
                        </div>
                    ) : !autoAdvance && isAnswered && (
                         <button onClick={generateNewQuestion} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg animate-pulse">Next Question</button>
                    )}
                </div>
            </div>
            
            <div className={`hidden md:block bg-slate-700 rounded-lg transition-all duration-300 ease-in-out ${isControlsOpen ? 'w-80 p-4' : 'w-0 p-0 overflow-hidden'}`}>
                <div className={`${!isControlsOpen && 'hidden'}`}>
                     <h3 className="text-xl font-bold text-teal-300 mb-4">Settings & Controls</h3>
                    <ControlsContent quizMode={quizMode} setQuizMode={setQuizMode} settings={settings} handleSettingToggle={handleSettingToggle} />
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
                            <ControlsContent quizMode={quizMode} setQuizMode={setQuizMode} settings={settings} handleSettingToggle={handleSettingToggle} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CAGEDSystemQuiz;