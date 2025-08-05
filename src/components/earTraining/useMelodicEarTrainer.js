import { useState, useCallback, useEffect, useRef } from 'react';
import { useTools } from '../../context/ToolsContext';
import { getScaleNotes, NOTE_TO_MIDI, SEMITONE_TO_DEGREE } from '../../utils/musicTheory';
import { fretboardModel } from '../../utils/fretboardUtils';
import * as Tone from 'tone';

const CHROMATIC_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const PLAYABLE_MIDI_RANGE = { min: 40, max: 76 }; // E2 to E5 (12th fret high E)
const KEY_TO_DRONE_NOTE = { 'Db':'C#', 'Eb':'D#', 'Gb':'F#', 'Ab':'G#', 'Bb':'A#' };

const DEGREE_TO_SEMITONE = {
    '1': 0, 'b2': 1, '2': 2, 'b3': 3, '3': 4, '4': 5, '#4': 6, 'b5': 6, '5': 7, 'b6': 8, '6': 9, 'b7': 10, '7': 11
};

const findPlayableNote = (midi) => {
    for (let s = fretboardModel.length - 1; s >= 0; s--) {
        for (let f = 0; f <= 12; f++) {
            if (fretboardModel[s][f].midi === midi) return `${6 - s}-${f}`;
        }
    }
    return null;
};

export const useMelodicEarTrainer = (settings, onProgressUpdate) => {
    const { bpm, fretboardPlayers, areFretboardSoundsReady, unlockAudio, setDroneNote } = useTools();
    const [score, setScore] = useState(0);
    const [totalAsked, setTotalAsked] = useState(0);
    const [feedback, setFeedback] = useState({ message: '', type: '' });
    const [isAnswered, setIsAnswered] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [history, setHistory] = useState([]);
    const [reviewIndex, setReviewIndex] = useState(null);
    
    const timeoutRef = useRef(null);
    const questionCounter = useRef(0);
    const currentKey = useRef('C');

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
        let keyDidChange = false;

        const { melodyLength, notePool, diatonicMode, octaveRange, startOnRoot, rootNoteMode, fixedKey, questionsPerRoot } = settings;

        if (rootNoteMode === 'Roving' && questionCounter.current > 0 && questionCounter.current % questionsPerRoot === 0) {
            const possibleKeys = ['C', 'G', 'D', 'A', 'E', 'F', 'Bb'];
            let nextKey = currentKey.current;
            while (nextKey === currentKey.current) { nextKey = possibleKeys[Math.floor(Math.random() * possibleKeys.length)]; }
            currentKey.current = nextKey;
            keyDidChange = true;
        } else if (rootNoteMode === 'Fixed') {
            currentKey.current = fixedKey;
        } else if (rootNoteMode === 'Random') {
            const possibleKeys = ['C', 'G', 'D', 'A', 'E', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'F#'];
            currentKey.current = possibleKeys[Math.floor(Math.random() * possibleKeys.length)];
        }
        
        const rootMidi = NOTE_TO_MIDI[currentKey.current];
        const scaleName = diatonicMode === 'Minor' ? 'Natural Minor' : 'Major';
        const diatonicNotes = getScaleNotes(currentKey.current, scaleName);
        
        let potentialNotes = [];
        if (notePool === 'Diatonic') {
            for (let i = 0; i < octaveRange; i++) {
                diatonicNotes.forEach(note => potentialNotes.push({ name: note, midi: NOTE_TO_MIDI[note] + (i * 12) }));
            }
        } else {
            for (let i = 0; i < octaveRange; i++) {
                CHROMATIC_SCALE.forEach(note => potentialNotes.push({ name: note, midi: NOTE_TO_MIDI[note] + (i * 12) }));
            }
        }

        const availableNotes = potentialNotes.filter(note => note.midi >= PLAYABLE_MIDI_RANGE.min && note.midi <= PLAYABLE_MIDI_RANGE.max);
        if (availableNotes.length === 0 || (startOnRoot && availableNotes.length < melodyLength -1)) {
            console.error("Not enough playable notes with current settings. Try a lower octave range.");
            return;
        }

        const melody = [];
        if (startOnRoot) {
            const rootNote = { name: currentKey.current, midi: rootMidi, degree: '1' };
            if (rootNote.midi >= PLAYABLE_MIDI_RANGE.min && rootNote.midi <= PLAYABLE_MIDI_RANGE.max) {
                melody.push(rootNote);
            }
        }

        while (melody.length < melodyLength) {
            const randomNote = availableNotes[Math.floor(Math.random() * availableNotes.length)];
            const degree = SEMITONE_TO_DEGREE[(randomNote.midi - rootMidi + 120) % 12];
            melody.push({ ...randomNote, degree });
        }

        const question = {
            key: currentKey.current, melody,
            answerDegrees: melody.map(n => n.degree),
            answerNotes: melody.map(n => n.name),
            keyChanged: keyDidChange
        };
        
        setCurrentQuestion(question);
        setIsAnswered(false);
        setFeedback({ message: '', type: '' });
        questionCounter.current += 1;

    }, [settings]);

    const playMelody = useCallback(async (questionToPlay) => {
        const question = questionToPlay || currentQuestion;
        if (!question || !areFretboardSoundsReady || !fretboardPlayers.current) return;
        await unlockAudio();

        Tone.Transport.cancel();
        fretboardPlayers.current.stopAll();

        const noteInterval = 120 / bpm;
        let initialDelay = 0;

        if (settings.playRootFirst && !settings.startOnRoot) {
            const rootMidi = NOTE_TO_MIDI[question.key];
            if (rootMidi !== undefined) {
                let lowMidi = rootMidi - 12;
                let highMidi = rootMidi;

                // Adjust octaves to fit within playable range
                if (lowMidi < PLAYABLE_MIDI_RANGE.min) {
                    lowMidi = rootMidi;
                    highMidi = rootMidi + 12 > PLAYABLE_MIDI_RANGE.max ? PLAYABLE_MIDI_RANGE.max : rootMidi + 12;
                }
                if (highMidi > PLAYABLE_MIDI_RANGE.max) {
                    highMidi = rootMidi;
                    lowMidi = rootMidi - 12 < PLAYABLE_MIDI_RANGE.min ? PLAYABLE_MIDI_RANGE.min : rootMidi - 12;
                }

                const lowNoteId = findPlayableNote(lowMidi);
                const highNoteId = findPlayableNote(highMidi);
                
                if (lowNoteId) fretboardPlayers.current.player(lowNoteId).start(Tone.now());
                if (highNoteId && highNoteId !== lowNoteId) fretboardPlayers.current.player(highNoteId).start(Tone.now() + 0.4);
                
                initialDelay = 2.2; // Increased delay for a clear pause
            }
        }

        question.melody.forEach((note, index) => {
            const noteId = findPlayableNote(note.midi);
            if (noteId && fretboardPlayers.current.has(noteId)) {
                fretboardPlayers.current.player(noteId).start(Tone.now() + initialDelay + (index * noteInterval));
            }
        });
    }, [currentQuestion, areFretboardSoundsReady, unlockAudio, fretboardPlayers, bpm, settings.playRootFirst, settings.startOnRoot]);

    const checkAnswer = useCallback((userAnswerArray) => {
        if (isAnswered) return;
        const { answerMode, autoAdvance } = settings;
        const correctAnswer = answerMode === 'Scale Degrees' ? currentQuestion.answerDegrees : currentQuestion.answerNotes;
        
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
        setHistory(h => [...h, { question: currentQuestion, userAnswer: userAnswerArray, wasCorrect: isCorrect, answerMode }]);

        if (onProgressUpdate) {
            onProgressUpdate({ wasCorrect: isCorrect, score: newScore, totalAsked: newTotalAsked });
        }
        setIsAnswered(true);

        if (autoAdvance) {
            timeoutRef.current = setTimeout(generateNewQuestion, 2500);
        }
    }, [isAnswered, currentQuestion, settings, generateNewQuestion, onProgressUpdate, score, totalAsked]);
    
    const playUserAnswer = useCallback(async (userAnswerArray, historyItem) => {
        if (!userAnswerArray || userAnswerArray.length === 0 || !historyItem || !areFretboardSoundsReady) return;
        await unlockAudio();

        Tone.Transport.cancel();
        fretboardPlayers.current.stopAll();
        
        const noteInterval = 120 / bpm;
        const rootMidi = NOTE_TO_MIDI[historyItem.question.key];
        if (rootMidi === undefined) return;

        userAnswerArray.forEach((answerItem, index) => {
            let midiVal;
            if (historyItem.answerMode === 'Scale Degrees') {
                const semitone = DEGREE_TO_SEMITONE[answerItem];
                if (semitone !== undefined) midiVal = rootMidi + semitone;
            } else { // Note Names
                midiVal = NOTE_TO_MIDI[answerItem];
            }
            
            if (midiVal === undefined) return;

            if (midiVal < PLAYABLE_MIDI_RANGE.min) midiVal += 12;
            if (midiVal > PLAYABLE_MIDI_RANGE.max) midiVal -= 12;

            const noteId = findPlayableNote(midiVal);
            if (noteId && fretboardPlayers.current.has(noteId)) {
                fretboardPlayers.current.player(noteId).start(Tone.now() + (index * noteInterval));
            }
        });
    }, [areFretboardSoundsReady, unlockAudio, bpm, fretboardPlayers]);
    
    useEffect(() => {
        generateNewQuestion();
    }, [generateNewQuestion]);

    const handleReviewNav = (direction) => setReviewIndex(prev => { const newIndex = prev + direction; if (newIndex >= 0 && newIndex < history.length) return newIndex; return prev; });
    const startReview = () => { if (history.length > 0) { clearTimeout(timeoutRef.current); setReviewIndex(history.length - 1); } };

    return {
        score, totalAsked, feedback, isAnswered, currentQuestion, history, reviewIndex, setReviewIndex,
        generateNewQuestion, checkAnswer, handleReviewNav, startReview, playMelody,
        playUserAnswer
    };
};