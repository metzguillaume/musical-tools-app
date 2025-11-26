import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { fretboardModel } from '../../utils/fretboardUtils.js';
import { PENTATONIC_SHAPES, HIGHLIGHT_MASKS } from './pentatonicConstants.js';
import { ROOT_NOTE_OPTIONS } from '../caged/cagedConstants.js';
import { getWeightedEnharmonicName, normalizeNoteName } from '../../utils/musicTheory.js';

export const usePentatonicQuiz = (quizMode, activeShapes, settings, onProgressUpdate, sessionId) => {
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

    // Destructure specific settings that affect QUESTION GENERATION only.
    // excluding 'autoAdvance' so toggling it doesn't regenerate the question.
    const { completeModeStartWithRoots } = settings;

    const generateNewQuestion = useCallback(() => {
        clearTimeout(timeoutRef.current);
        setReviewIndex(null);

        // 1. Filter Active Modes
        const activeModeKeys = Object.keys(quizMode).filter(k => quizMode[k]);

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
                    
                    if (completeModeStartWithRoots) {
                        const roots = potentialStartNotes.filter(n => n.isRoot);
                        if (roots.length >= 2) potentialStartNotes = roots;
                        else potentialStartNotes = potentialStartNotes.filter(n => n.isRoot); 
                    }

                    potentialStartNotes.sort(() => 0.5 - Math.random());

                    const startNotes = [];
                    const countNeeded = 2; 

                    if (potentialStartNotes.length > 0) {
                        const firstNote = potentialStartNotes[0];
                        startNotes.push(firstNote);
                        const distinctNote = potentialStartNotes.slice(1).find(n => Math.abs(n.fret - firstNote.fret) >= 2);
                        
                        if (distinctNote) {
                            startNotes.push(distinctNote);
                        } else if (potentialStartNotes.length > 1) {
                            startNotes.push(potentialStartNotes[1]);
                        }
                    }

                    if (startNotes.length < countNeeded && !completeModeStartWithRoots) continue;

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

    }, [activeShapes, quizMode, completeModeStartWithRoots]); // Removed full 'settings' to prevent autoAdvance trigger

    // RESET EFFECT: Only runs when sessionId changes (New Preset / Manual Reset)
    useEffect(() => {
        setScore(0);
        setTotalAsked(0);
        setHistory([]);
        setFeedback({ message: '', type: '' });
        setIsAnswered(false);
        // We invoke generation here to ensure a fresh start
        generateNewQuestion();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId]); 

    // UPDATE EFFECT: Runs when settings change (Controls), but DOES NOT RESET SCORE
    useEffect(() => {
        // Only regenerate if not the initial mount (which is handled by the Reset Effect)
        // Actually, duplicate call is fine/safe, but this ensures we update if user toggles a shape mid-game.
        generateNewQuestion();
    }, [generateNewQuestion]);

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

        const normalizedRoot = normalizeNoteName(correct.root);
        const rootDisplay = ROOT_NOTE_OPTIONS.find(opt => opt.value === normalizedRoot || opt.altValue === normalizedRoot)?.display || correct.root;
        const qualityDisplay = correct.quality.charAt(0).toUpperCase() + correct.quality.slice(1);
        const answerText = `${rootDisplay} ${qualityDisplay} (${correct.shape} Shape)`;

        if (isCorrect) {
            setScore(newScore);
            setFeedback({ message: `Correct! ${answerText}`, type: 'correct' });
        } else {
            setFeedback({ message: `Incorrect. It was ${answerText}.`, type: 'incorrect' });
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