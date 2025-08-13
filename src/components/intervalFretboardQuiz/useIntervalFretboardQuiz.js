import { useState, useEffect, useCallback, useRef } from 'react';
import { useTools } from '../../context/ToolsContext';
import { fretboardModel, getDegree } from '../../utils/fretboardUtils.js';

export const quizData = {
    qualities: ['Diminished', 'Minor', 'Perfect', 'Major', 'Augmented'],
    numericButtons: ['Unison / Octave', '2nd', '3rd', '4th', 'Tritone', '5th', '6th', '7th'],
    intervalsToTest: [
        { name: { quality: 'Perfect', number: 'Unison' }, semitones: 0 }, { name: { quality: 'Minor', number: '2nd' }, semitones: 1 },
        { name: { quality: 'Major', number: '2nd' }, semitones: 2 }, { name: { quality: 'Minor', number: '3rd' }, semitones: 3 },
        { name: { quality: 'Major', number: '3rd' }, semitones: 4 }, { name: { quality: 'Perfect', number: '4th' }, semitones: 5 },
        { name: { quality: 'Tritone', number: 'Tritone' }, semitones: 6 }, { name: { quality: 'Perfect', number: '5th' }, semitones: 7 },
        { name: { quality: 'Minor', number: '6th' }, semitones: 8 }, { name: { quality: 'Major', number: '6th' }, semitones: 9 },
        { name: { quality: 'Minor', number: '7th' }, semitones: 10 }, { name: { quality: 'Major', number: '7th' }, semitones: 11 },
        { name: { quality: 'Perfect', number: 'Octave' }, semitones: 12 },
    ]
};

export const useIntervalFretboardQuiz = (autoAdvance, playAudio, onProgressUpdate) => {
    // UPDATED: No longer needs bpm here, as the context function will access it
    const { playFretboardNotes } = useTools();

    const [score, setScore] =useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [feedback, setFeedback] = useState({ message: '', type: '' });
    const [isAnswered, setIsAnswered] = useState(false);
    const [selected, setSelected] = useState({ quality: null, number: null });
    const [history, setHistory] = useState([]);
    const [reviewIndex, setReviewIndex] = useState(null);
    const timeoutRef = useRef(null);

    const startNewRound = useCallback(() => {
        clearTimeout(timeoutRef.current);
        setReviewIndex(null);
        let newQuestion = null;
        let attempts = 0;
        while (newQuestion === null && attempts < 50) {
            attempts++;
            const rootStringIndex = Math.floor(Math.random() * 6);
            const rootFret = Math.floor(Math.random() * 8);
            const rootNote = fretboardModel[rootStringIndex][rootFret];
            const interval = quizData.intervalsToTest[Math.floor(Math.random() * quizData.intervalsToTest.length)];

            const targetMidi = rootNote.midi + interval.semitones;
            const possibleTargets = [];
            [-2, -1, 0, 1, 2].forEach(stringOffset => {
                const targetStringIndex = rootStringIndex + stringOffset;
                if (targetStringIndex >= 0 && targetStringIndex < 6) {
                    fretboardModel[targetStringIndex].forEach((noteOnString, fret) => {
                        const isInRange = Math.abs(fret - rootFret) <= 4;
                        if (noteOnString.midi === targetMidi && fret < 12 && isInRange && (targetStringIndex !== rootStringIndex || fret !== rootFret)) {
                            possibleTargets.push({ string: 6 - targetStringIndex, fret: fret, label: noteOnString.note, midi: noteOnString.midi });
                        }
                    });
                }
            });
            if (possibleTargets.length > 0) {
                const targetNote = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
                const rootNoteForQuestion = { 
                    string: 6 - rootStringIndex, 
                    fret: rootFret, 
                    label: rootNote.note, 
                    isRoot: true, 
                    midi: rootNote.midi,
                    degree: '1'
                };
                const targetNoteForQuestion = {
                    ...targetNote,
                    degree: getDegree(rootNote.midi, targetNote.midi)
                };

                newQuestion = {
                    notes: [rootNoteForQuestion, targetNoteForQuestion],
                    answer: interval.name
                };
            }
        }
        
        setCurrentQuestion(newQuestion);
        setFeedback({ message: '', type: '' });
        setSelected({ quality: null, number: null });
        setIsAnswered(false);
    }, []);

    useEffect(() => {
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
            isCorrect = selected.quality === 'Perfect' && (correct.number === 'Unison' || correct.number === 'Octave');
        } else {
            isCorrect = selected.quality === correct.quality && selected.number === correct.number;
        }

        const newScore = isCorrect ? score + 1 : score;
        const newTotalAsked = history.length + 1;

        if (isCorrect) {
            setScore(newScore);
            setFeedback({ message: 'Correct!', type: 'correct' });
        } else {
            const correctAnswerText = correct.number === 'Tritone' ? 'a Tritone' : `a ${correct.quality} ${correct.number}`;
            setFeedback({ message: `Incorrect! It was ${correctAnswerText}.`, type: 'incorrect' });
        }
        
        setHistory(prev => [...prev, { question: currentQuestion, userAnswer: selected, wasCorrect: isCorrect }]);
        
        if (onProgressUpdate) {
            onProgressUpdate({ wasCorrect: isCorrect, score: newScore, totalAsked: newTotalAsked });
        }
        setIsAnswered(true);

        if (playAudio) {
            playFretboardNotes(currentQuestion.notes);
        }

        if (autoAdvance && isCorrect) {
            timeoutRef.current = setTimeout(startNewRound, 2000);
        }
    }, [isAnswered, selected, currentQuestion, autoAdvance, startNewRound, playAudio, playFretboardNotes, history.length, onProgressUpdate, score]);
    useEffect(() => {
        if (selected.quality && selected.number && !isAnswered) {
            checkAnswer();
        }
    }, [selected, checkAnswer, isAnswered]);

    const handleReviewNav = (direction) => {
        setReviewIndex(prevIndex => {
            const newIndex = prevIndex + direction;
            if (newIndex >= 0 && newIndex < history.length) return newIndex;
            return prevIndex;
        });
    };
    const startReview = () => {
        if (history.length > 0) {
            clearTimeout(timeoutRef.current);
            setReviewIndex(history.length - 1);
        }
    };

    const replayAudioForHistoryItem = (index) => {
        const historyItem = history[index];
        if (historyItem && historyItem.question.notes) {
            playFretboardNotes(historyItem.question.notes);
        }
    };
    
    return {
        score, currentQuestion, feedback, isAnswered, selected, setSelected, history, reviewIndex, setReviewIndex,
        checkAnswer, startNewRound, handleReviewNav, startReview, replayAudioForHistoryItem
    };
};