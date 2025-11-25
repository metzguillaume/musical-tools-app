import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { fretboardModel } from '../../utils/fretboardUtils.js';
import { PENTATONIC_SHAPES, HIGHLIGHT_MASKS } from './pentatonicConstants.js';
import { ROOT_NOTE_OPTIONS } from '../caged/cagedConstants.js';
import { getWeightedEnharmonicName, normalizeNoteName } from '../../utils/musicTheory.js';

export const usePentatonicQuiz = (quizModes, activeShapes, settings, onProgressUpdate) => {
    const [score, setScore] = useState(0);
    const [totalAsked, setTotalAsked] = useState(0);
    const [feedback, setFeedback] = useState({ message: '', type: '' });
    const [isAnswered, setIsAnswered] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [userAnswer, setUserAnswer] = useState({});
    const [history, setHistory] = useState([]);
    const [reviewIndex, setReviewIndex] = useState(null);
    const timeoutRef = useRef(null);
    const isReviewing = reviewIndex !== null;

    const generateNewQuestion = useCallback(() => {
        clearTimeout(timeoutRef.current);
        setReviewIndex(null);

        // 1. Filter Active Modes
        const activeModeKeys = Object.keys(quizModes).filter(k => quizModes[k]);

        if (activeShapes.length === 0 || activeModeKeys.length === 0) {
            setCurrentQuestion({ 
                notes: [], 
                answer: null, 
                promptData: { type: 'error', text: 'Please select at least one Mode and Shape.' }, 
                mode: 'error' 
            });
            return;
        }

        // 2. Pick a Random Mode from the active selection
        const modeToUse = activeModeKeys[Math.floor(Math.random() * activeModeKeys.length)];

        let question = null;
        let attempts = 0;
        
        while (!question && attempts < 100) {
            attempts++;
            const { quality, shape } = activeShapes[Math.floor(Math.random() * activeShapes.length)];
            const shapeData = PENTATONIC_SHAPES[quality][shape];
            
            const rootDef = shapeData.notes.find(n => n.d === 'R');
            const randomFret = Math.floor(Math.random() * 12) + 1; 
            
            const baseRootName = fretboardModel[6 - rootDef.s][randomFret].note;
            const finalRootName = getWeightedEnharmonicName(baseRootName);
            const fretOffset = randomFret - rootDef.f;

            const answerNotes = [];
            let outOfBounds = false;

            for (let note of shapeData.notes) {
                const f = note.f + fretOffset;
                if (f < 0 || f > 15) {
                    outOfBounds = true;
                    break;
                }
                const finalNoteInfo = fretboardModel[6 - note.s][f];
                answerNotes.push({ 
                    ...note, 
                    string: note.s, 
                    fret: f, 
                    isRoot: note.d === 'R', 
                    label: finalNoteInfo.note, 
                    midi: finalNoteInfo.midi 
                });
            }

            if (outOfBounds || answerNotes.length < 5) continue;

            const commonProps = {
                root: finalRootName,
                quality,
                shape,
                notes: answerNotes,
            };

            // Generate Prompt Data Object (for colorful rendering)
            let promptData = {};

            switch (modeToUse) {
                case 'identify':
                    promptData = { type: 'identify' };
                    question = {
                        notes: answerNotes, 
                        answer: commonProps,
                        promptData,
                        mode: 'identify'
                    };
                    break;
                case 'construct':
                    promptData = { type: 'construct', root: finalRootName, quality, shape };
                    question = {
                        notes: [], 
                        answer: commonProps,
                        promptData,
                        mode: 'construct'
                    };
                    break;
                case 'complete':
                    let potentialStartNotes = [...answerNotes];
                    
                    if (settings.completeModeStartWithRoots) {
                        potentialStartNotes = potentialStartNotes.filter(n => n.isRoot);
                    }

                    potentialStartNotes.sort(() => 0.5 - Math.random());

                    const startNotes = [];
                    const usedFrets = new Set();
                    // HARDCODED: User requested 2 notes.
                    const countNeeded = 2; 

                    for (let note of potentialStartNotes) {
                        if (startNotes.length >= countNeeded) break;
                        if (!usedFrets.has(note.fret)) {
                            startNotes.push(note);
                            usedFrets.add(note.fret);
                        }
                    }

                    if (startNotes.length < countNeeded && !settings.completeModeStartWithRoots) continue;

                    promptData = { type: 'complete', quality };
                    question = {
                        notes: startNotes, 
                        answer: commonProps,
                        promptData,
                        mode: 'complete'
                    };
                    break;
                case 'connect':
                    const mask = HIGHLIGHT_MASKS[quality][shape];
                    if (!mask) continue;

                    const ghostNotes = mask.map(m => {
                        const f = m.f + fretOffset;
                        if (f < 0 || f > 15) return null;
                        return {
                            string: m.s,
                            fret: f,
                            isGhost: true,
                            label: 'Chord'
                        };
                    }).filter(Boolean);

                    promptData = { type: 'connect', quality, shape };
                    question = {
                        notes: ghostNotes,
                        answer: commonProps,
                        promptData,
                        mode: 'connect'
                    };
                    break;
                default: break;
            }
            break;
        }

        setCurrentQuestion(question);
        setIsAnswered(false);
        setFeedback({ message: '', type: '' });
        setUserAnswer(modeToUse === 'identify' ? { root: null, quality: null, shape: null } : { notes: [] });

    }, [activeShapes, quizModes, settings]);

    useEffect(() => {
        setScore(0);
        setTotalAsked(0);
        setHistory([]);
        generateNewQuestion();
    }, [quizModes, activeShapes, generateNewQuestion]);

    const checkAnswer = useCallback((autoAdvance) => {
        if (isAnswered || !currentQuestion) return;
        const correct = currentQuestion.answer;
        let isCorrect = false;
        
        if (currentQuestion.mode === 'identify') {
            const normalizedCorrectRoot = normalizeNoteName(correct.root);
            const correctGroup = ROOT_NOTE_OPTIONS.find(opt => opt.value === normalizedCorrectRoot || opt.altValue === normalizedCorrectRoot);
            const rootIsCorrect = correctGroup && (userAnswer.root === correctGroup.value || (correctGroup.altValue && userAnswer.root === correctGroup.altValue));
            isCorrect = rootIsCorrect && userAnswer.quality === correct.quality && userAnswer.shape === correct.shape;
        } else {
            let userNotesToCheck = userAnswer.notes || [];
            
            if (currentQuestion.mode === 'complete' || currentQuestion.mode === 'connect') {
                const existingIds = new Set(userNotesToCheck.map(n => `${n.string}-${n.fret}`));
                const startNotes = currentQuestion.notes.filter(n => !existingIds.has(`${n.string}-${n.fret}`));
                userNotesToCheck = [...userNotesToCheck, ...startNotes];
            }

            const targetNotes = correct.notes;

            if (userNotesToCheck.length === targetNotes.length) {
                const getSet = (notes, offset = 0) => {
                    const s = new Set();
                    notes.forEach(n => {
                        const f = n.fret + offset;
                        if (f >= 0 && f <= 24) s.add(`${n.string}-${f}`);
                    });
                    return s;
                };

                const userSet = getSet(userNotesToCheck);
                const targetSet = getSet(targetNotes);
                const targetSetUp = getSet(targetNotes, 12);
                const targetSetDown = getSet(targetNotes, -12);

                const setsMatch = (uSet, tSet) => {
                    if (uSet.size !== tSet.size) return false;
                    for (let item of uSet) if (!tSet.has(item)) return false;
                    return true;
                };

                if (setsMatch(userSet, targetSet) || setsMatch(userSet, targetSetUp) || setsMatch(userSet, targetSetDown)) {
                    isCorrect = true;
                }
            }
        }

        const newScore = isCorrect ? score + 1 : score;
        const newTotalAsked = totalAsked + 1;

        if (isCorrect) {
            setScore(newScore);
            setFeedback({ message: 'Correct!', type: 'correct' });
        } else {
            if (currentQuestion.mode === 'identify') {
                const correctRootDisplay = ROOT_NOTE_OPTIONS.find(opt => opt.value === normalizeNoteName(correct.root) || opt.altValue === normalizeNoteName(correct.root))?.display || correct.root;
                setFeedback({ message: `Incorrect. It was ${correctRootDisplay} ${correct.quality} (${correct.shape} Shape).`, type: 'incorrect' });
            } else {
                setFeedback({ message: `Incorrect. View the diagram for the solution.`, type: 'incorrect' });
            }
        }
        
        setTotalAsked(newTotalAsked);
        if (onProgressUpdate) onProgressUpdate({ wasCorrect: isCorrect, score: newScore, totalAsked: newTotalAsked });
        
        setHistory(prev => [...prev, { question: currentQuestion, userAnswer, wasCorrect: isCorrect }]);
        setIsAnswered(true);
        if (autoAdvance && isCorrect) timeoutRef.current = setTimeout(generateNewQuestion, 2000);
    }, [isAnswered, userAnswer, currentQuestion, generateNewQuestion, onProgressUpdate, score, totalAsked]);

    const handleAnswerSelect = (type, value) => {
        if (isAnswered || isReviewing) return;
        setUserAnswer(prev => ({ ...prev, [type]: value }));
    };

    const handleFretClick = (string, fret) => {
        if (isAnswered || isReviewing || currentQuestion?.mode === 'identify') return;
        
        if (currentQuestion.mode === 'complete') {
             const isFixedStartNote = currentQuestion.notes.some(n => n.string === string && n.fret === fret);
             if (isFixedStartNote) return;
        }

        const noteId = `${string}-${fret}`;
        const currentNotes = userAnswer.notes || [];
        const isAlreadyClicked = currentNotes.some(n => `${n.string}-${n.fret}` === noteId);
        
        let newNotes;
        if (isAlreadyClicked) {
            newNotes = currentNotes.filter(n => `${n.string}-${n.fret}` !== noteId);
        } else {
            newNotes = [...currentNotes, { string, fret }];
        }
        setUserAnswer({ notes: newNotes });
    };

    const itemToDisplay = useMemo(() => isReviewing ? history[reviewIndex] : { question: currentQuestion, userAnswer }, [isReviewing, history, reviewIndex, currentQuestion, userAnswer]);
    
    const handleReviewNav = (direction) => setReviewIndex(prev => { const newIndex = prev + direction; if (newIndex >= 0 && newIndex < history.length) return newIndex; return prev; });
    const handleEnterReview = () => { if (history.length > 0) { clearTimeout(timeoutRef.current); setReviewIndex(history.length - 1); } };
    const returnToQuiz = () => setReviewIndex(null);

    return {
        score, totalAsked, feedback, isAnswered,
        currentQuestion, userAnswer, setUserAnswer,
        history, reviewIndex, setReviewIndex, isReviewing,
        itemToDisplay, generateNewQuestion, checkAnswer,
        handleAnswerSelect, handleFretClick,
        handleReviewNav, handleEnterReview, returnToQuiz
    };
};