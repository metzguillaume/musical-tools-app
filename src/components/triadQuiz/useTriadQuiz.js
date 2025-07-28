// src/components/triadQuiz/useTriadQuiz.js
import { useState, useEffect, useCallback, useMemo } from 'react';

// --- Data & Helpers ---
// Note: These helpers are moved from the original component
const QUIZ_ROOT_NOTES = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];
export const NOTES_ENHARMONIC = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];
export const NOTE_LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
export const ACCIDENTALS = [ { id: 'b', display: '♭' }, { id: 'natural', display: '' }, { id: '#', display: '♯' }];
const NOTE_TO_MIDI_BASE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

const CHORD_TYPES = { 'Major': [0, 4, 7], 'Minor': [0, 3, 7], 'Diminished': [0, 3, 6], 'Augmented': [0, 4, 8] };
const SEVENTH_CHORD_TYPES = { 'Major 7th': [0, 4, 7, 11], 'Minor 7th': [0, 3, 7, 10], 'Dominant 7th': [0, 4, 7, 10], 'Half-Diminished 7th': [0, 3, 6, 10], 'Diminished 7th': [0, 3, 6, 9] };

const getMidiFromNote = (note) => {
    const letter = note.charAt(0).toUpperCase();
    const accidental = note.substring(1);
    let midi = NOTE_TO_MIDI_BASE[letter];
    if (accidental.includes('#')) midi += accidental.length;
    if (accidental.includes('b')) midi -= accidental.length;
    return midi;
};

const getCorrectEnharmonicNotes = (rootNote, intervals) => {
    const rootMidi = getMidiFromNote(rootNote);
    const rootLetter = rootNote.charAt(0);
    const rootLetterIndex = NOTE_LETTERS.indexOf(rootLetter);
    const noteDegrees = [0, 2, 4, 6]; 
    
    const finalNotes = intervals.map((interval, index) => {
        const degree = noteDegrees[index];
        const noteLetter = NOTE_LETTERS[(rootLetterIndex + degree) % 7];
        const requiredMidi = rootMidi + interval;
        const naturalMidi = NOTE_TO_MIDI_BASE[noteLetter];
        let accidentalValue = (requiredMidi % 12) - (naturalMidi % 12);
        if (accidentalValue > 6) accidentalValue -= 12;
        if (accidentalValue < -6) accidentalValue += 12;

        let accidental = '';
        if (accidentalValue === 1) accidental = '#';
        else if (accidentalValue === 2) accidental = '##';
        else if (accidentalValue === -1) accidental = 'b';
        else if (accidentalValue === -2) accidental = 'bb';
        return `${noteLetter}${accidental}`;
    });
    return finalNotes;
};


export const useTriadQuiz = (quizMode, include7ths, includeInversions, autoAdvance) => {
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [userAnswer, setUserAnswer] = useState({});
    const [feedback, setFeedback] = useState({ message: '', type: '' });
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [totalAsked, setTotalAsked] = useState(0);
    const [history, setHistory] = useState([]);
    const [reviewIndex, setReviewIndex] = useState(null);

    const questionTypes = useMemo(() => {
        return include7ths ? { ...CHORD_TYPES, ...SEVENTH_CHORD_TYPES } : CHORD_TYPES;
    }, [include7ths]);

    const generateNewQuestion = useCallback(() => {
        setReviewIndex(null);
        let question = null;
        let attempts = 0;
        do {
            const rootNote = QUIZ_ROOT_NOTES[Math.floor(Math.random() * QUIZ_ROOT_NOTES.length)];
            const qualityOptions = Object.keys(questionTypes);
            const quality = qualityOptions[Math.floor(Math.random() * qualityOptions.length)];
            const intervals = questionTypes[quality];
            const canonicalNotes = getCorrectEnharmonicNotes(rootNote, intervals);
            const isAnswerable = canonicalNotes.every(note => NOTES_ENHARMONIC.includes(note));
            
            if (isAnswerable) {
                let displayNotes = [...canonicalNotes];
                if (includeInversions && Math.random() > 0.3) {
                    const inversion = Math.floor(Math.random() * displayNotes.length);
                    if (inversion > 0) { displayNotes = [...displayNotes.slice(inversion), ...displayNotes.slice(0, inversion)]; }
                }
                const mode = (quizMode === 'mixed') ? (Math.random() < 0.5 ? 'nameTheTriad' : 'nameTheNotes') : quizMode;
                question = { 
                    root: rootNote, 
                    quality: quality, 
                    notes: displayNotes, 
                    rootPositionNotes: canonicalNotes,
                    sortedNotes: [...canonicalNotes].sort(), 
                    mode: mode 
                };
            }
            attempts++;
        } while (!question && attempts < 100);

        if (!question) { console.error("Could not generate an answerable question."); return; }

        setCurrentQuestion(question);
        setTotalAsked(prev => prev + 1);
        setIsAnswered(false);
        setFeedback({ message: '', type: '' });
        setUserAnswer({accidental: ''});
    }, [quizMode, questionTypes, includeInversions]);

    const checkAnswer = useCallback(() => {
        if (isAnswered || !currentQuestion) return;
        let isCorrect = false;
        let correctAnswerText = '';
        if (currentQuestion.mode === 'nameTheTriad') {
            const userAnswerRoot = `${userAnswer.noteLetter || ''}${userAnswer.accidental || ''}`;
            isCorrect = userAnswerRoot === currentQuestion.root && userAnswer.quality === currentQuestion.quality;
            correctAnswerText = `${currentQuestion.root} ${currentQuestion.quality}`;
        } else {
            const sortedUserNotes = userAnswer.notes?.sort() || [];
            correctAnswerText = currentQuestion.rootPositionNotes.join(', ');
            if (sortedUserNotes.length === currentQuestion.sortedNotes.length) {
                isCorrect = sortedUserNotes.every((note, index) => note === currentQuestion.sortedNotes[index]);
            }
        }
        if (isCorrect) { setScore(s => s + 1); setFeedback({ message: 'Correct!', type: 'correct' });
        } else { setFeedback({ message: `Incorrect! The answer was ${correctAnswerText}.`, type: 'incorrect' }); }
        
        setHistory(prev => [...prev, { question: currentQuestion, userAnswer, wasCorrect: isCorrect }]);
        setIsAnswered(true);
        if (autoAdvance) { setTimeout(generateNewQuestion, 2000); }
    }, [isAnswered, userAnswer, currentQuestion, autoAdvance, generateNewQuestion]);

    useEffect(() => {
        setScore(0);
        setTotalAsked(0);
        setHistory([]);
        setReviewIndex(null);
        if (questionTypes && Object.keys(questionTypes).length > 0) { generateNewQuestion(); }
    }, [generateNewQuestion, questionTypes]);
    
    const handleReviewNav = (direction) => { 
        setReviewIndex(prev => { 
            const newIndex = prev + direction; 
            if (newIndex >= 0 && newIndex < history.length) { return newIndex; } 
            return prev; 
        }); 
    };

    const startReview = () => {
        if (history.length > 0) {
            setReviewIndex(history.length - 1);
        }
    }

    return {
        score, totalAsked, feedback, isAnswered, currentQuestion, userAnswer, setUserAnswer,
        history, reviewIndex, setReviewIndex,
        questionTypes, checkAnswer, generateNewQuestion, handleReviewNav, startReview
    };
};