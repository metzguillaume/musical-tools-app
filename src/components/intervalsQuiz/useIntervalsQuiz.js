import { useState, useEffect, useCallback, useRef } from 'react';
import { useTools } from '../../context/ToolsContext';
import { NOTE_TO_MIDI } from '../../utils/musicTheory';
import { fretboardModel } from '../../utils/fretboardUtils';

export const NOTE_LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
export const ACCIDENTALS = [{ id: 'bb', display: '♭♭' }, { id: 'b', display: '♭' }, { id: 'natural', display: '' }, { id: '#', display: '♯' }, { id: '##', display: '♯♯' }];
const NATURAL_NOTE_DATA = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 };
const CHROMATIC_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'];

export const intervalData = [
    { name: 'Perfect Unison', semitones: 0, quality: 'Perfect', number: 'Unison' }, { name: 'Minor 2nd', semitones: 1, quality: 'Minor', number: '2nd' },
    { name: 'Major 2nd', semitones: 2, quality: 'Major', number: '2nd' }, { name: 'Minor 3rd', semitones: 3, quality: 'Minor', number: '3rd' },
    { name: 'Major 3rd', semitones: 4, quality: 'Major', number: '3rd' }, { name: 'Perfect 4th', semitones: 5, quality: 'Perfect', number: '4th' },
    { name: 'Augmented 4th', semitones: 6, quality: 'Augmented', number: '4th' }, { name: 'Diminished 5th', semitones: 6, quality: 'Diminished', number: '5th' },
    { name: 'Perfect 5th', semitones: 7, quality: 'Perfect', number: '5th' }, { name: 'Minor 6th', semitones: 8, quality: 'Minor', number: '6th' },
    { name: 'Major 6th', semitones: 9, quality: 'Major', number: '6th' }, { name: 'Minor 7th', semitones: 10, quality: 'Minor', number: '7th' },
    { name: 'Major 7th', semitones: 11, quality: 'Major', number: '7th' }, { name: 'Perfect Octave', semitones: 12, quality: 'Perfect', number: 'Octave' }
];

// --- CHANGE: The `audioDirection` argument is removed ---
export const useIntervalsQuiz = (settings, playAudio, onProgressUpdate) => {
    const { playFretboardNotes } = useTools();
    const { quizMode, rootNoteType, direction, autoAdvance, selectedIntervals } = settings;

    const [feedback, setFeedback] = useState({ message: '', type: '' });
    const [score, setScore] = useState(0);
    const [answerChecked, setAnswerChecked] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [userAnswer, setUserAnswer] = useState({});
    const timeoutRef = useRef(null);
    const [history, setHistory] = useState([]);
    const [reviewIndex, setReviewIndex] = useState(null);

    const generateNewQuestion = useCallback(() => {
        clearTimeout(timeoutRef.current);
        setReviewIndex(null);
        const mode = quizMode === 'mixed' ? (Math.random() < 0.5 ? 'nameTheNote' : 'nameTheInterval') : quizMode;
        
        let activeIntervals = intervalData.filter(i => selectedIntervals[i.name]);
        if (activeIntervals.length === 0) {
            setCurrentQuestion({ type: 'error', text: 'Please select intervals in the controls.' });
            return;
        }

        let question = {};
        let questionDirection = direction === 'both' ? (Math.random() < 0.5 ? 'above' : 'below') : direction;
        
        if (questionDirection === 'below') {
            activeIntervals = activeIntervals.filter(i => i.name !== 'Perfect Unison');
        }

        const chosenInterval = activeIntervals[Math.floor(Math.random() * activeIntervals.length)];
        
        if (chosenInterval.name === 'Perfect Unison') {
            questionDirection = '';
        }

        if (mode === 'nameTheNote') {
            const rootNotePool = rootNoteType === 'natural' ? NOTE_LETTERS : CHROMATIC_KEYS;
            const rootNote = rootNotePool[Math.floor(Math.random() * rootNotePool.length)];
            const rootNoteLetter = rootNote.charAt(0);
            const rootAccidentalStr = rootNote.substring(1);
            let rootAccidentalVal = rootAccidentalStr.includes('#') ? rootAccidentalStr.length : -rootAccidentalStr.length;
            if (rootAccidentalStr === '') rootAccidentalVal = 0;
            const intervalNumber = parseInt(chosenInterval.name.match(/\d+/)?.[0] || (chosenInterval.name.includes('Unison') ? 1 : 8), 10);
            const rootIndex = NOTE_LETTERS.indexOf(rootNoteLetter);
            const rootMidi = NATURAL_NOTE_DATA[rootNoteLetter] + rootAccidentalVal;
            let targetIndex = (questionDirection === 'above' || questionDirection === '') ? (rootIndex + intervalNumber - 1) % 7 : (rootIndex - (intervalNumber - 1) + 7) % 7;
            let requiredMidi = (questionDirection === 'above' || questionDirection === '') ? rootMidi + chosenInterval.semitones : rootMidi - chosenInterval.semitones;
            const targetLetter = NOTE_LETTERS[targetIndex];
            let targetNaturalMidi = NATURAL_NOTE_DATA[targetLetter];
            if ((questionDirection === 'above' || questionDirection === '') && (targetIndex < rootIndex || intervalNumber === 8)) targetNaturalMidi += 12;
            else if (questionDirection === 'below' && (targetIndex > rootIndex || intervalNumber === 8)) targetNaturalMidi -= 12;
            const accidentalValue = requiredMidi - targetNaturalMidi;
            let accidental = '';
            if (accidentalValue === 1) accidental = '#'; else if (accidentalValue === 2) accidental = '##';
            else if (accidentalValue === -1) accidental = 'b'; else if (accidentalValue === -2) accidental = 'bb';
            question = { mode, rootNote, intervalName: chosenInterval.name, direction: questionDirection, correctAnswer: { note: targetLetter + accidental }};
        } else { // nameTheInterval
            const rootNoteName = NOTE_LETTERS[Math.floor(Math.random() * 7)];
            const accVal = Math.floor(Math.random() * 3) - 1;
            const rootAccidental = accVal === 1 ? '#' : (accVal === -1 ? 'b' : '');
            const note1 = rootNoteName + rootAccidental;
            const targetNoteName = NOTE_LETTERS[ (NOTE_LETTERS.indexOf(rootNoteName) + (parseInt(chosenInterval.name.match(/\d+/)?.[0] || 1, 10) - 1)) % 7 ];
            const rootMidi = NATURAL_NOTE_DATA[rootNoteName] + accVal;
            let targetNaturalMidi = NATURAL_NOTE_DATA[targetNoteName];
            if (NOTE_LETTERS.indexOf(targetNoteName) < NOTE_LETTERS.indexOf(rootNoteName) || chosenInterval.number === 'Octave') targetNaturalMidi += 12;
            const accDiff = (rootMidi + chosenInterval.semitones) - targetNaturalMidi;
            let targetAccidental = '';
            if(accDiff === 1) targetAccidental = '#'; else if (accDiff === 2) targetAccidental = '##';
            else if (accDiff === -1) targetAccidental = 'b'; else if (accDiff === -2) targetAccidental = 'bb';
            const note2 = targetNoteName + targetAccidental;
            question = { mode, note1, note2, correctAnswer: { quality: chosenInterval.quality, number: chosenInterval.number } };
        }

        setCurrentQuestion(question);
        setAnswerChecked(false);
        setFeedback({ message: '', type: '' });
        setUserAnswer({});
    }, [quizMode, rootNoteType, direction, selectedIntervals]);

    const playIntervalAudio = useCallback((rootMidi, targetMidi) => {
        const findPlayablePositions = (startMidi, endMidi) => {
            const intervalDistance = endMidi - startMidi;
            
            for (let s = 6; s >= 1; s--) { // Search low strings first
                for (let f = 0; f <= 7; f++) { // On low frets
                    const root = fretboardModel[6 - s][f];
                    if (root.midi % 12 === startMidi % 12) {
                        const rootPosition = { string: s, fret: f, midi: root.midi };
                        const finalTargetMidi = rootPosition.midi + intervalDistance;

                        for (let ts = 6; ts >= 1; ts--) {
                            for (let tf = 0; tf <= 12; tf++) {
                                const target = fretboardModel[6 - ts][tf];
                                if (target.midi === finalTargetMidi) {
                                    return [rootPosition, { string: ts, fret: tf }];
                                }
                            }
                        }
                    }
                }
            }
            return null;
        };
        
        const positions = findPlayablePositions(rootMidi, targetMidi);

        if (positions) {
            playFretboardNotes(positions);
        } else {
            console.error("Could not find a playable fretboard position for MIDI notes:", rootMidi, targetMidi);
        }
    }, [playFretboardNotes]);

    const checkAnswer = useCallback(() => {
        if (answerChecked || !currentQuestion) return;
        let isCorrect = false;
        let correctAnswerText = '';

        if (currentQuestion.mode === 'nameTheNote') {
            const userAnswerString = `${userAnswer.noteLetter || ''}${userAnswer.accidental ?? ''}`;
            const correctAnswerNote = currentQuestion.correctAnswer.note;
            isCorrect = userAnswerString === correctAnswerNote;
            correctAnswerText = correctAnswerNote;
        } else {
            const { quality, number } = currentQuestion.correctAnswer;
            if (userAnswer.number === 'Unison / Octave') {
                isCorrect = userAnswer.quality === 'Perfect' && (number === 'Unison' || number === 'Octave');
            } else {
                isCorrect = userAnswer.quality === quality && userAnswer.number === number;
            }
            correctAnswerText = `${quality} ${number}`;
        }
        
        const newScore = isCorrect ? score + 1 : score;
        const newTotalAsked = history.length + 1;

        if (isCorrect) {
            setScore(newScore);
            setFeedback({ message: 'Correct!', type: 'correct' });
        } else {
            setFeedback({ message: `Incorrect! The answer was ${correctAnswerText}.`, type: 'incorrect' });
        }
        
        setHistory(prev => [...prev, { question: currentQuestion, userAnswer, wasCorrect: isCorrect }]);

        if (onProgressUpdate) {
            onProgressUpdate({ wasCorrect: isCorrect, score: newScore, totalAsked: newTotalAsked });
        }
        setAnswerChecked(true);

        if (playAudio) {
            let rootNoteForAudio, intervalForAudio, directionForAudio;

            if (currentQuestion.mode === 'nameTheNote') {
                rootNoteForAudio = currentQuestion.rootNote;
                intervalForAudio = intervalData.find(i => i.name === currentQuestion.intervalName);
                directionForAudio = currentQuestion.direction;
            } else { 
                rootNoteForAudio = currentQuestion.note1;
                intervalForAudio = intervalData.find(i => i.quality === currentQuestion.correctAnswer.quality && i.number === currentQuestion.correctAnswer.number);
                // --- CHANGE: Direction is now hardcoded to 'above' for this mode ---
                directionForAudio = 'above';
            }

            if (intervalForAudio && NOTE_TO_MIDI[rootNoteForAudio]) {
                const rootMidi = (NOTE_TO_MIDI[rootNoteForAudio] % 12) + 60;
                let targetMidi;

                if (directionForAudio === 'below') {
                    targetMidi = rootMidi - intervalForAudio.semitones;
                } else { 
                    targetMidi = rootMidi + intervalForAudio.semitones;
                }
                playIntervalAudio(rootMidi, targetMidi);
            }
        }

        if (autoAdvance && isCorrect) {
            timeoutRef.current = setTimeout(generateNewQuestion, 2000);
        }
    }, [answerChecked, userAnswer, currentQuestion, autoAdvance, generateNewQuestion, playAudio, playIntervalAudio, score, history.length, onProgressUpdate]);

    useEffect(() => {
        setScore(0);
        setHistory([]);
        generateNewQuestion();
    }, [generateNewQuestion]);

    useEffect(() => {
        if (autoAdvance) {
            if (currentQuestion?.mode === 'nameTheNote' && userAnswer.noteLetter && typeof userAnswer.accidental !== 'undefined') {
                checkAnswer();
            } else if (currentQuestion?.mode === 'nameTheInterval' && userAnswer.quality && userAnswer.number) {
                checkAnswer();
            }
        }
    }, [userAnswer, autoAdvance, checkAnswer, currentQuestion]);

    const handleReviewNav = (direction) => { 
        setReviewIndex(prev => { 
            const newIndex = prev + direction; 
            if (newIndex >= 0 && newIndex < history.length) return newIndex;
            return prev; 
        }); 
    };
    const startReview = () => history.length > 0 && setReviewIndex(history.length - 1);

    const replayAudioForHistoryItem = (index) => {
        const historyItem = history[index];
        if (!historyItem || !playAudio) return;

        const { question } = historyItem;
        let rootNoteForAudio, intervalForAudio, directionForAudio;

        if (question.mode === 'nameTheNote') {
            rootNoteForAudio = question.rootNote;
            intervalForAudio = intervalData.find(i => i.name === question.intervalName);
            directionForAudio = question.direction;
        } else if (question.mode === 'nameTheInterval') {
            rootNoteForAudio = question.note1;
            intervalForAudio = intervalData.find(i => i.quality === question.correctAnswer.quality && i.number === question.correctAnswer.number);
            // --- CHANGE: Direction is now hardcoded to 'above' for this mode ---
            directionForAudio = 'above';
        }

        if (intervalForAudio && NOTE_TO_MIDI[rootNoteForAudio]) {
            const rootMidi = (NOTE_TO_MIDI[rootNoteForAudio] % 12) + 60;
            let targetMidi;
            if (directionForAudio === 'below') {
                targetMidi = rootMidi - intervalForAudio.semitones;
            } else {
                targetMidi = rootMidi + intervalForAudio.semitones;
            }
            playIntervalAudio(rootMidi, targetMidi);
        }
    };

    return {
        feedback, score, answerChecked, currentQuestion, userAnswer, setUserAnswer,
        history, reviewIndex, setReviewIndex, handleReviewNav, startReview,
        checkAnswer, generateNewQuestion,
        replayAudioForHistoryItem
    };
};