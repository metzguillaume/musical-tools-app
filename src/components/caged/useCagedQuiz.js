import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { fretboardModel } from '../../utils/fretboardUtils.js';
import { CAGED_SHAPES, ROOT_NOTE_OPTIONS } from './cagedConstants.js';
import { NOTE_TO_MIDI, SEMITONE_TO_DEGREE } from '../../utils/musicTheory.js';

export const useCagedQuiz = ({ activeShapes, quizMode }) => {
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
        setIsAnswered(false);
        setFeedback({ message: '', type: '' });

        if (activeShapes.length === 0) {
            setCurrentQuestion({ notes: [], answer: null, prompt: 'Please select shapes/qualities in Controls to begin.', mode: quizMode });
            return;
        }

        const currentModeForQuestion = quizMode === 'mixed' ? (Math.random() < 0.5 ? 'identify' : 'construct') : quizMode;
        let question = null;
        let attempts = 0;
        
        while (!question && attempts < 100) {
            attempts++;
            const { quality, shape } = activeShapes[Math.floor(Math.random() * activeShapes.length)];
            const shapeData = CAGED_SHAPES[quality][shape];
            const rootNoteInShape = shapeData.notes.find(n => n.d === 'R');
            
            const randomStringIndex = 6 - rootNoteInShape.s;
            const randomFret = Math.floor(Math.random() * 10);
            const rootNoteInfo = fretboardModel[randomStringIndex][randomFret];
            const root = rootNoteInfo.note;
            
            const fretOffset = randomFret - rootNoteInShape.f;

            const answerNotes = shapeData.notes.map(note => {
                const fret = note.f + fretOffset;
                if (fret < 0 || fret > 15) return null;
                const finalNoteInfo = fretboardModel[6-note.s][fret];
                return { ...note, string: note.s, fret, isRoot: note.d === 'R', label: finalNoteInfo.note, midi: finalNoteInfo.midi };
            }).filter(Boolean);

            if (answerNotes.length !== shapeData.notes.length) continue;

            const mutedMarkers = shapeData.muted.map(s => ({ string: s, fret: -1, label: 'X' }));

            question = {
                notes: [...answerNotes, ...mutedMarkers],
                answer: { root, quality, shape, notes: answerNotes },
                prompt: `Construct ${root} ${quality} (${shape} shape)`,
                mode: currentModeForQuestion
            };
        }

        setCurrentQuestion(question);
        setTotalAsked(prev => prev + 1);
        if (currentModeForQuestion === 'identify') {
            setUserAnswer({ root: null, quality: null, shape: null });
        } else {
            setUserAnswer({ notes: [] });
        }
    }, [activeShapes, quizMode]);

    useEffect(() => {
        setScore(0);
        setTotalAsked(0);
        setHistory([]);
        generateNewQuestion();
    }, [generateNewQuestion]);

    const checkAnswer = useCallback((autoAdvance) => {
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
        } else { // 'construct' mode
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

        if (autoAdvance) {
            timeoutRef.current = setTimeout(generateNewQuestion, 2000);
        }
    }, [isAnswered, userAnswer, currentQuestion, generateNewQuestion]);
    
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
            const noteInfo = fretboardModel[6 - string][fret];
            const rootMidi = NOTE_TO_MIDI[currentQuestion.answer.root];
            const interval = (noteInfo.midi - rootMidi) % 12;
            const degree = SEMITONE_TO_DEGREE[interval < 0 ? interval + 12 : interval];

            const enrichedNote = {
                string,
                fret,
                label: noteInfo.note,
                midi: noteInfo.midi,
                isRoot: noteInfo.midi % 12 === rootMidi % 12,
                degree: degree
            };
            newNotes = [...currentNotes, enrichedNote];
        }
        setUserAnswer({ notes: newNotes });
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
    
    const handleEnterReview = () => { 
        if (history.length > 0) { 
            clearTimeout(timeoutRef.current); 
            setReviewIndex(history.length - 1); 
        } 
    };
    
    const itemToDisplay = useMemo(() => {
        return isReviewing ? history[reviewIndex] : { question: currentQuestion, userAnswer };
    }, [isReviewing, history, reviewIndex, currentQuestion, userAnswer]);

    return {
        score, totalAsked, feedback, isAnswered, autoAdvance: true,
        currentQuestion, userAnswer, setUserAnswer, history, reviewIndex, setReviewIndex,
        isReviewing, itemToDisplay, timeoutRef,
        generateNewQuestion, checkAnswer, handleAnswerSelect, handleFretClick,
        handleReviewNav, handleEnterReview
    };
};