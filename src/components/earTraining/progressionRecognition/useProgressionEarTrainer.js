import { useState, useCallback, useEffect, useRef } from 'react';
import { useTools } from '../../../context/ToolsContext';
import { getDiatonicChords, NOTE_TO_MIDI } from '../../../utils/musicTheory';

const KEY_TO_DRONE_NOTE = { 'Db':'C#', 'Eb':'D#', 'Gb':'F#', 'Ab':'G#', 'Bb':'A#' };

export const useProgressionEarTrainer = (settings, onProgressUpdate) => {
    const { areFretboardSoundsReady, unlockAudio, setDroneNote, playChord } = useTools();
    const [score, setScore] = useState(0);
    const [totalAsked, setTotalAsked] = useState(0);
    const [feedback, setFeedback] = useState({ message: '', type: '' });
    const [isAnswered, setIsAnswered] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [history, setHistory] = useState([]);
    const [reviewIndex, setReviewIndex] = useState(null);
    
    const timeoutRef = useRef(null);
    const currentKey = useRef('C');
    const questionCounter = useRef(0);

    useEffect(() => {
        let droneKey = null;
        if (settings.useDrone) {
            if (reviewIndex !== null && history[reviewIndex]) {
                droneKey = history[reviewIndex].question.key;
            } else if (currentQuestion) {
                droneKey = currentQuestion.key;
            }
        }
        
        if (droneKey) {
            const droneNote = KEY_TO_DRONE_NOTE[droneKey] || droneKey;
            setDroneNote(droneNote);
        } else {
            setDroneNote(null);
        }
    }, [settings.useDrone, currentQuestion, reviewIndex, history, setDroneNote]);

    const generateNewQuestion = useCallback(() => {
        clearTimeout(timeoutRef.current);
        setReviewIndex(null);

        const { keyMode, fixedKey, keyType, chordFilter, excludeDiminished, startOnTonic, questionsPerKey } = settings;

        if (keyMode === 'Roving') {
            if (questionCounter.current > 0 && questionCounter.current % questionsPerKey === 0) {
                const possibleKeys = ['C', 'G', 'D', 'A', 'E', 'F', 'Bb'];
                let nextKey;
                do {
                    nextKey = possibleKeys[Math.floor(Math.random() * possibleKeys.length)];
                } while (nextKey === currentKey.current);
                currentKey.current = nextKey;
            }
        } else {
            currentKey.current = fixedKey;
        }

        let availableChords = getDiatonicChords(currentKey.current, keyType, 'Triads');

        if (excludeDiminished) {
            availableChords = availableChords.filter(c => c.quality !== 'Diminished');
        }
        if (chordFilter === 'Major Only') {
            availableChords = availableChords.filter(c => c.quality === 'Major');
        } else if (chordFilter === 'Minor Only') {
            availableChords = availableChords.filter(c => c.quality === 'Minor');
        }

        if (availableChords.length < 2) {
             setCurrentQuestion({ noOptions: true, error: "Not enough chords available with current filters." });
             return;
        }

        const progression = [];
        const progressionLength = 4;

        // Add the first chord
        if (startOnTonic) {
            const tonic = availableChords.find(c => c.roman.toUpperCase().startsWith('I'));
            if (tonic) progression.push(tonic);
            else progression.push(availableChords[0]); // Fallback if tonic was filtered out
        } else {
            progression.push(availableChords[Math.floor(Math.random() * availableChords.length)]);
        }
        
        // Add remaining chords
        while (progression.length < progressionLength) {
            const nextChord = availableChords[Math.floor(Math.random() * availableChords.length)];
            // Avoid repeating the same chord back-to-back
            if (nextChord.roman !== progression[progression.length - 1].roman) {
                progression.push(nextChord);
            }
        }

        const answer = progression.map(c => c.roman);
        
        const question = {
            key: currentKey.current,
            keyType: keyType,
            progression: progression,
            answer: answer
        };
        
        setCurrentQuestion(question);
        setIsAnswered(false);
        setFeedback({ message: '', type: '' });
    }, [settings]);

    const playQuestionAudio = useCallback(async (questionToPlay) => {
        const question = questionToPlay || currentQuestion;
        if (!question || !question.progression || !areFretboardSoundsReady) return;
        await unlockAudio();
        
        const chordInterval = 1.5; // seconds between chords
        for (const chord of question.progression) {
            // Re-get notes to ensure correct spelling for playback
            const rootMidi = NOTE_TO_MIDI[chord.root];
            const intervals = (chord.quality === 'Major') ? [0, 4, 7] : (chord.quality === 'Minor') ? [0, 3, 7] : [0, 3, 6];
            const notesForChord = intervals.map(interval => {
                const midi = rootMidi + interval;
                const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
                return notes[midi % 12];
            });

            playChord(notesForChord, 'Harmonic');
            await new Promise(resolve => setTimeout(resolve, chordInterval * 1000));
        }

    }, [currentQuestion, areFretboardSoundsReady, unlockAudio, playChord]);

    const checkAnswer = useCallback((userAnswerArray) => {
        if (isAnswered) return;

        questionCounter.current += 1; // Increment the counter
        
        const correctAnswer = currentQuestion.answer;
        const isCorrect = userAnswerArray.length === correctAnswer.length && userAnswerArray.every((val, i) => val === correctAnswer[i]);

        const newScore = isCorrect ? score + 1 : score;
        const newTotalAsked = totalAsked + 1;

        if(isCorrect) {
            setScore(newScore);
            setFeedback({ message: 'Correct!', type: 'correct' });
        } else {
            setFeedback({ message: `Incorrect. The answer was: ${correctAnswer.join(' - ')}`, type: 'incorrect' });
        }
        
        setTotalAsked(newTotalAsked);
        setHistory(h => [...h, { question: currentQuestion, userAnswer: userAnswerArray, wasCorrect: isCorrect }]);
        setIsAnswered(true);

        if (onProgressUpdate) {
            onProgressUpdate({ wasCorrect: isCorrect, score: newScore, totalAsked: newTotalAsked });
        }

        if (settings.autoAdvance && isCorrect) {
            timeoutRef.current = setTimeout(generateNewQuestion, 2500);
        }
    }, [isAnswered, currentQuestion, settings.autoAdvance, onProgressUpdate, score, totalAsked, generateNewQuestion]);
    
    useEffect(() => {
        generateNewQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(settings)]);

    const handleReviewNav = (direction) => setReviewIndex(prev => { 
        const newIndex = prev + direction; 
        if (newIndex >= 0 && newIndex < history.length) return newIndex; 
        return prev; 
    });

    const startReview = () => { 
        if (history.length > 0) { 
            clearTimeout(timeoutRef.current); 
            setReviewIndex(history.length - 1); 
        } 
    };

    return {
        score, totalAsked, feedback, isAnswered, currentQuestion,
        history, reviewIndex, setReviewIndex,
        generateNewQuestion, checkAnswer, handleReviewNav, startReview, playQuestionAudio
    };
};