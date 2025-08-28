import { useState, useCallback, useEffect, useRef } from 'react';
import { useTools } from '../../../context/ToolsContext';
import { NOTE_TO_MIDI, CHORDS } from '../../../utils/musicTheory';
import { findChordVoicing } from '../../../utils/fretboardUtils';
import * as Tone from 'tone';

const KEY_TO_DRONE_NOTE = { 'Db':'C#', 'Eb':'D#', 'Gb':'F#', 'Ab':'G#', 'Bb':'A#' };

export const useChordEarTrainer = (settings, onProgressUpdate) => {
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

    // Effect to manage the drone player integration
    useEffect(() => {
        let droneKey = null;
        if (settings.useDrone) {
            if (reviewIndex !== null && history[reviewIndex]) {
                droneKey = history[reviewIndex].question.rootNote;
            } else if (currentQuestion) {
                droneKey = currentQuestion.rootNote;
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

        const { keyMode, fixedKey, qualities, questionsPerKey } = settings;
        let keyDidChange = false;

        if (keyMode === 'Roving') {
            if (questionCounter.current > 0 && questionCounter.current % questionsPerKey === 0) {
                const possibleKeys = ['C', 'G', 'D', 'A', 'E', 'F', 'Bb'];
                let nextKey = currentKey.current;
                while (nextKey === currentKey.current) {
                    nextKey = possibleKeys[Math.floor(Math.random() * possibleKeys.length)];
                }
                currentKey.current = nextKey;
                keyDidChange = true;
            }
        } else {
            currentKey.current = fixedKey;
        }
        
        const activeQualities = Object.keys(qualities).filter(q => qualities[q]);
        if (activeQualities.length === 0) {
            setCurrentQuestion({ noOptions: true });
            return;
        }

        const randomQuality = activeQualities[Math.floor(Math.random() * activeQualities.length)];
        const chordInfo = CHORDS[randomQuality];
        if (!chordInfo) return;

        const rootNoteName = currentKey.current;
        const rootMidi = NOTE_TO_MIDI[rootNoteName];
        const noteNames = chordInfo.intervals.map(interval => {
            const noteMidi = rootMidi + interval;
            // This is a simplified way to get note names; for a perfect system, it would need a full diatonic spelling engine.
            const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            return notes[noteMidi % 12];
        });
        
        const voicing = findChordVoicing(noteNames);
        if (!voicing) {
            // If finding a voicing fails, retry.
            setTimeout(generateNewQuestion, 50);
            return;
        }
        
        const question = {
            rootNote: rootNoteName,
            quality: randomQuality,
            noteNames: noteNames,
            voicing: voicing,
            answer: randomQuality,
            keyChanged: keyDidChange
        };
        
        setCurrentQuestion(question);
        setIsAnswered(false);
        setFeedback({ message: '', type: '' });
    }, [settings]);

    const playQuestionAudio = useCallback(async (questionToPlay) => {
        const question = questionToPlay || currentQuestion;
        if (!question || !question.noteNames || !areFretboardSoundsReady) return;
        await unlockAudio();
        
        Tone.Transport.cancel();
        // The playChord function is designed to handle this playback.
        playChord(question.noteNames, settings.playbackStyle);

    }, [currentQuestion, areFretboardSoundsReady, unlockAudio, playChord, settings.playbackStyle]);


    const checkAnswer = useCallback((userAnswer) => {
        if (isAnswered) return;
        
        questionCounter.current += 1; // Increment the counter
        
        const isCorrect = userAnswer === currentQuestion.answer;
        const newScore = isCorrect ? score + 1 : score;
        const newTotalAsked = totalAsked + 1;

        if(isCorrect) {
            setScore(newScore);
            setFeedback({ message: 'Correct!', type: 'correct' });
        } else {
            setFeedback({ message: `Incorrect. The answer was: ${currentQuestion.answer}`, type: 'incorrect' });
        }
        
        setTotalAsked(newTotalAsked);
        setHistory(h => [...h, { question: currentQuestion, userAnswer, wasCorrect: isCorrect }]);
        setIsAnswered(true);

        if (onProgressUpdate) {
            onProgressUpdate({ wasCorrect: isCorrect, score: newScore, totalAsked: newTotalAsked });
        }

        if (settings.autoAdvance && isCorrect) {
            timeoutRef.current = setTimeout(generateNewQuestion, 2000);
        }
    }, [isAnswered, currentQuestion, settings.autoAdvance, onProgressUpdate, score, totalAsked, generateNewQuestion]);
    
    // Initial question generation
    useEffect(() => {
        generateNewQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(settings)]); // Re-generate if settings change


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