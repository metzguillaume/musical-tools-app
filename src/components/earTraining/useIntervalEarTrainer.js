import { useState, useEffect, useCallback, useRef } from 'react';
import { useTools } from '../../context/ToolsContext';
import { fretboardModel } from '../../utils/fretboardUtils';
import { getScaleNotes, NOTE_TO_MIDI, SEMITONE_TO_DEGREE } from '../../utils/musicTheory';
import * as Tone from 'tone';

const ALL_INTERVALS = [
    { name: 'Minor 2nd', semitones: 1 }, { name: 'Major 2nd', semitones: 2 },
    { name: 'Minor 3rd', semitones: 3 }, { name: 'Major 3rd', semitones: 4 },
    { name: 'Perfect 4th', semitones: 5 }, { name: 'Tritone', semitones: 6 },
    { name: 'Perfect 5th', semitones: 7 }, { name: 'Minor 6th', semitones: 8 },
    { name: 'Major 6th', semitones: 9 }, { name: 'Minor 7th', semitones: 10 },
    { name: 'Major 7th', semitones: 11 }, { name: 'Octave', semitones: 12 },
];

const DEGREE_TO_SEMITONE = Object.fromEntries(Object.entries(SEMITONE_TO_DEGREE).map(([k, v]) => [v, parseInt(k, 10)]));

const findPlayableNote = (midi) => {
    for (let s = fretboardModel.length - 1; s >= 0; s--) {
        for (let f = 0; f <= 12; f++) {
            if (fretboardModel[s][f].midi === midi) return `${6 - s}-${f}`;
        }
    }
    return null;
};

const initializePerformanceData = () => {
    const data = {};
    ALL_INTERVALS.forEach(interval => {
        data[interval.name] = { correct: 0, incorrect: 0, weight: 10 };
    });
    return data;
};

const getEnharmonicName = (midi, key, scaleName) => {
    const scaleNotes = getScaleNotes(key, scaleName);
    const midiMod12 = midi % 12;
    for (const note of scaleNotes) {
        if (NOTE_TO_MIDI[note] % 12 === midiMod12) return note;
    }
    const preferredChromatic = { 0: 'C', 1: 'C#', 2: 'D', 3: 'Eb', 4: 'E', 5: 'F', 6: 'F#', 7: 'G', 8: 'Ab', 9: 'A', 10: 'Bb', 11: 'B' };
    return preferredChromatic[midiMod12] || '';
};

export const useIntervalEarTrainer = (settings, onProgressUpdate) => {
    const { fretboardPlayers, areFretboardSoundsReady, unlockAudio, setDroneNote } = useTools();
    const [score, setScore] = useState(0);
    const [totalAsked, setTotalAsked] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [feedback, setFeedback] = useState({ message: '', type: '' });
    const [isAnswered, setIsAnswered] = useState(false);
    const [history, setHistory] = useState([]);
    const [reviewIndex, setReviewIndex] = useState(null);
    const [performanceData, setPerformanceData] = useState(() => initializePerformanceData());
    const [diatonicOptions, setDiatonicOptions] = useState({ intervals: [], degrees: [] });
    const [newKeyNotification, setNewKeyNotification] = useState(null);
    
    const currentKey = useRef('C');
    const questionCounter = useRef(0);
    const timeoutRef = useRef(null);

    useEffect(() => { setPerformanceData(initializePerformanceData()); }, [settings.isTrainingMode]);
    
    const generateNewQuestion = useCallback(() => {
        clearTimeout(timeoutRef.current);
        setReviewIndex(null);

        // --- FIX #3: Roving/Key Change Logic Moved Here ---
        let keyDidChange = false;
        if (settings.rootNoteMode === 'Roving' && questionCounter.current > 0 && questionCounter.current % settings.questionsPerRoot === 0) {
            const possibleKeys = ['C', 'G', 'D', 'A', 'E', 'F', 'Bb'];
            let nextKey = currentKey.current;
            while (nextKey === currentKey.current) { nextKey = possibleKeys[Math.floor(Math.random() * possibleKeys.length)]; }
            currentKey.current = nextKey;
            keyDidChange = true;
        } else if (settings.rootNoteMode === 'Fixed') {
            if (currentKey.current !== settings.fixedKey) keyDidChange = true;
            currentKey.current = settings.fixedKey;
        }

        if (settings.useDrone) setDroneNote(currentKey.current);
        if (keyDidChange && settings.showKeyChange) {
            const scaleDisplayName = settings.notePool === 'Diatonic' ? settings.diatonicMode : '';
            setNewKeyNotification(`New Key: ${currentKey.current} ${scaleDisplayName}`.trim());
            setTimeout(() => setNewKeyNotification(null), 2500);
        }
        // --- End of Fix #3 ---

        let question = null;
        let attempts = 0;
        
        while (question === null && attempts < 100) {
            attempts++;
            
            const keyRootMidi = NOTE_TO_MIDI[currentKey.current];
            let rootMidi;

            // --- FIX #2: Diatonic Filtering Logic Restructured ---
            const scaleName = settings.diatonicMode === 'Minor' ? 'Natural Minor' : 'Major';
            let availableIntervals = ALL_INTERVALS;

            if (settings.notePool === 'Diatonic') {
                const scaleNotes = getScaleNotes(currentKey.current, scaleName);
                const keyTonicMidiMod12 = NOTE_TO_MIDI[currentKey.current] % 12;
                const scaleMidiMod12 = scaleNotes.map(n => NOTE_TO_MIDI[n] % 12);
                
                const intervalsFromTonic = ALL_INTERVALS.filter(interval => scaleMidiMod12.includes((keyTonicMidiMod12 + interval.semitones) % 12));
                const degreesFromTonic = intervalsFromTonic.map(i => SEMITONE_TO_DEGREE[i.semitones % 12]);
                
                setDiatonicOptions({ intervals: intervalsFromTonic.map(i => i.name), degrees: [...new Set(degreesFromTonic)] });
                availableIntervals = intervalsFromTonic;
            } else { 
                setDiatonicOptions({ intervals: [], degrees: [] });
            }

            if (settings.answerMode === 'Note Names') {
                availableIntervals = availableIntervals.filter(i => i.name !== 'Octave');
            }
            
            rootMidi = keyRootMidi + (Math.floor(Math.random() * settings.octaveRange) * 12);
            // --- End of Fix #2 ---
            
            let interval;
            if (settings.isTrainingMode && availableIntervals.length > 0) {
                const relevantWeights = availableIntervals.map(i => performanceData[i.name]?.weight || 1);
                const totalWeight = relevantWeights.reduce((sum, weight) => sum + weight, 0);
                let randomWeight = Math.random() * totalWeight;
                for (let i = 0; i < availableIntervals.length; i++) {
                    randomWeight -= relevantWeights[i];
                    if (randomWeight <= 0) { interval = availableIntervals[i]; break; }
                }
            } else if (availableIntervals.length > 0) {
                interval = availableIntervals[Math.floor(Math.random() * availableIntervals.length)];
            }
            if (!interval) continue;

            const direction = settings.direction === 'Both' ? (Math.random() < 0.5 ? 1 : -1) : (settings.direction === 'Ascending' ? 1 : -1);
            const targetMidi = rootMidi + (interval.semitones * direction);
            
            if (findPlayableNote(rootMidi) && findPlayableNote(targetMidi)) {
                question = { 
                    rootMidi, 
                    targetMidi, 
                    answer: { 
                        intervalName: interval.name, 
                        scaleDegree: SEMITONE_TO_DEGREE[(targetMidi - rootMidi + 12*5) % 12], 
                        noteName: getEnharmonicName(targetMidi, currentKey.current, scaleName) 
                    } 
                };
            }
        }
        
        if (question) setCurrentQuestion(question);
        else console.error("Failed to generate a valid, playable question. Please check settings.");
        
        setIsAnswered(false);
        setFeedback({ message: '', type: '' });
    }, [settings, performanceData, setDroneNote]);

    // --- FIX #1: useEffect Dependency Array Changed ---
    useEffect(() => {
        questionCounter.current = 0;
        generateNewQuestion();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(settings)]);
    // --- End of Fix #1 ---

    const playQuestionAudio = useCallback(async (questionToPlay) => {
        const question = questionToPlay || currentQuestion;
        if (!question || !areFretboardSoundsReady || !fretboardPlayers.current) return;
        await unlockAudio();
        const rootNoteId = findPlayableNote(question.rootMidi);
        const targetNoteId = findPlayableNote(question.targetMidi);
        if (!rootNoteId || !targetNoteId) return;

        const now = Tone.now();
        const playNote = (noteId, time) => {
            if (fretboardPlayers.current.has(noteId)) {
                fretboardPlayers.current.player(noteId).start(time);
            }
        };
        if (settings.playbackStyle === 'Harmonic') {
            if (settings.useDrone && !settings.playRootNote) { playNote(targetNoteId, now); } 
            else { playNote(rootNoteId, now); playNote(targetNoteId, now); }
        } else {
            if (settings.useDrone && !settings.playRootNote) { playNote(targetNoteId, now); } 
            else { playNote(rootNoteId, now); playNote(targetNoteId, now + 0.7); }
        }
    }, [currentQuestion, areFretboardSoundsReady, unlockAudio, fretboardPlayers, settings]);

    const checkAnswer = useCallback((answer) => {
        if (isAnswered || !currentQuestion || answer === null) return;
        const correctAnswers = currentQuestion.answer;
        let isCorrect = false;
        let correctAnswerText = '';

        if (settings.answerMode === 'Interval Name') {
            isCorrect = answer === correctAnswers.intervalName;
            correctAnswerText = correctAnswers.intervalName;
        } else if (settings.answerMode === 'Scale Degree') {
            isCorrect = answer === correctAnswers.scaleDegree;
            correctAnswerText = correctAnswers.scaleDegree;
        } else if (settings.answerMode === 'Note Names') {
            isCorrect = answer === correctAnswers.noteName;
            correctAnswerText = correctAnswers.noteName;
        }
        
        const newScore = isCorrect ? score + 1 : score;
        const newTotalAsked = totalAsked + 1;

        if (isCorrect) {
            setScore(newScore);
            setFeedback({ message: 'Correct!', type: 'correct' });
        } else {
            setFeedback({ message: `Incorrect! The answer was ${correctAnswerText}.`, type: 'incorrect' });
        }

        setPerformanceData(prevData => {
            const key = correctAnswers.intervalName;
            if (!prevData[key]) return prevData;
            const newPerf = { ...prevData[key] };
            if (isCorrect) newPerf.correct += 1; else newPerf.incorrect += 1;
            newPerf.weight = Math.max(1, 10 + (newPerf.incorrect * 20) - (newPerf.correct * 2));
            return { ...prevData, [key]: newPerf };
        });
        
        questionCounter.current += 1;
        setTotalAsked(newTotalAsked);
        setHistory(prev => [...prev, { question: currentQuestion, userAnswer: Array.isArray(answer) ? answer.join(', ') : answer, wasCorrect: isCorrect, answerMode: settings.answerMode }]);
        setIsAnswered(true);

        if (onProgressUpdate) {
            onProgressUpdate({ wasCorrect: isCorrect, score: newScore, totalAsked: newTotalAsked });
        }

        if (isCorrect && settings.autoAdvance) {
            timeoutRef.current = setTimeout(generateNewQuestion, 2500);
        }
    }, [isAnswered, currentQuestion, settings, generateNewQuestion, score, totalAsked, onProgressUpdate]);
    
    const playUserAnswer = useCallback(async (historyItem) => {
        if (!historyItem || !areFretboardSoundsReady) return;
        await unlockAudio();

        const { question, userAnswer, answerMode } = historyItem;
        const rootMidi = question.rootMidi;
        let targetMidi = null;
        
        const direction = question.targetMidi > rootMidi ? 1 : -1;

        if (answerMode === 'Interval Name') {
            const answeredInterval = ALL_INTERVALS.find(i => i.name === userAnswer);
            if (answeredInterval) {
                targetMidi = rootMidi + (answeredInterval.semitones * direction);
            }
        } else if (answerMode === 'Scale Degree') {
            const semitones = DEGREE_TO_SEMITONE[userAnswer];
            if (semitones !== undefined) {
                 targetMidi = rootMidi + (semitones * direction);
            }
        } else if (answerMode === 'Note Names') {
             const answeredNoteMidi = NOTE_TO_MIDI[userAnswer];
             if (answeredNoteMidi !== undefined) {
                 const originalDiff = Math.abs(question.targetMidi - rootMidi);
                 let bestOctaveMidi = answeredNoteMidi;
                 [-24, -12, 0, 12, 24].forEach(octave => {
                     const currentMidi = answeredNoteMidi + octave;
                     if(Math.abs( (currentMidi - rootMidi) - originalDiff) < Math.abs( (bestOctaveMidi - rootMidi) - originalDiff)) {
                         bestOctaveMidi = currentMidi;
                     }
                 });
                 targetMidi = bestOctaveMidi;
             }
        }

        if (rootMidi !== null && targetMidi !== null) {
            playQuestionAudio({ rootMidi, targetMidi });
        }
    }, [areFretboardSoundsReady, unlockAudio, playQuestionAudio]);

    const handleReviewNav = (direction) => setReviewIndex(prev => { const newIndex = prev + direction; if (newIndex >= 0 && newIndex < history.length) return newIndex; return prev; });
    const startReview = () => history.length > 0 && setReviewIndex(history.length - 1);
    
    return {
        score, totalAsked, feedback, isAnswered, currentQuestion, history, reviewIndex, setReviewIndex,
        generateNewQuestion, checkAnswer, handleReviewNav, startReview, playQuestionAudio, ALL_INTERVALS,
        diatonicOptions, newKeyNotification, currentKey: currentKey.current,
        playUserAnswer
    };
};