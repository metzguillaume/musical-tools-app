import { useState, useEffect, useCallback, useRef } from 'react';
import { findTriadShapes } from '../../utils/fretboardUtils';
import { fretboardModel } from '../../utils/fretboardUtils';
import { getWeightedEnharmonicName, NOTE_TO_MIDI_CLASS } from '../../utils/musicTheory';

export const TRIAD_QUALITIES = ['Major', 'Minor', 'Diminished', 'Augmented', 'Sus2', 'Sus4'];
export const TRIAD_INVERSIONS = ['Root', '1st', '2nd'];
export const STRING_SETS = {
    'E A D': [6, 5, 4],
    'A D G': [5, 4, 3],
    'D G B': [4, 3, 2],
    'G B e': [3, 2, 1],
};
export const ROOT_NOTE_OPTIONS = [
    { value: 'A', display: 'A' }, { value: 'A#', display: 'A♯/B♭' },
    { value: 'B', display: 'B' }, { value: 'C', display: 'C' },
    { value: 'C#', display: 'C♯/D♭' }, { value: 'D', display: 'D' },
    { value: 'D#', display: 'D♯/E♭' }, { value: 'E', display: 'E' },
    { value: 'F', display: 'F' }, { value: 'F#', display: 'F♯/G♭' },
    { value: 'G', display: 'G' }, { value: 'G#', display: 'G♯/A♭' },
];

export const useFretboardTriads = (questionSettings, onProgressUpdate) => {
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

    const currentQuestionRef = useRef(currentQuestion);
    useEffect(() => {
        currentQuestionRef.current = currentQuestion;
    }, [currentQuestion]);


    const generateNewQuestion = useCallback(() => {
        clearTimeout(timeoutRef.current);
        setReviewIndex(null);

        const { modes, qualities, stringSets, inversions } = questionSettings;
        
        const activeModes = Object.keys(modes).filter(m => modes[m]);
        const activeQualities = Object.keys(qualities).filter(q => qualities[q]);
        const activeStringSets = Object.keys(stringSets).filter(s => stringSets[s]);
        const activeInversions = Object.keys(inversions).filter(i => inversions[i]);

        if (activeModes.length === 0 || activeQualities.length === 0 || activeInversions.length === 0 || (activeStringSets.length === 0 && activeModes.some(m => m !== 'constructVertically'))) {
            setCurrentQuestion({ prompt: { text1: 'Please select options in Controls to begin.' } });
            return;
        }

        const mode = activeModes[Math.floor(Math.random() * activeModes.length)];
        let question = null;
        let attempts = 0;

        while (!question && attempts < 50) {
            attempts++;
            const randomQuality = activeQualities[Math.floor(Math.random() * activeQualities.length)];
            const baseRootName = ROOT_NOTE_OPTIONS[Math.floor(Math.random() * ROOT_NOTE_OPTIONS.length)].value;
            const finalRootName = getWeightedEnharmonicName(baseRootName);
            const randomInversion = activeInversions[Math.floor(Math.random() * activeInversions.length)];
            
            const prevQuestion = currentQuestionRef.current;

            if (mode === 'identify') {
                const randomStringSetName = activeStringSets[Math.floor(Math.random() * activeStringSets.length)];
                
                if (prevQuestion?.answer && prevQuestion.mode === 'identify') {
                    const prev = prevQuestion.answer;
                    if (prev.root === finalRootName && prev.quality === randomQuality && prev.inversion === randomInversion) {
                        continue; 
                    }
                }

                const shapes = findTriadShapes(finalRootName, randomQuality, randomInversion, STRING_SETS[randomStringSetName]);
                const playableShapes = shapes.filter(shape => shape.every(note => note.fret <= 15));

                if (playableShapes.length > 0) {
                    const chosenShape = playableShapes[Math.floor(Math.random() * playableShapes.length)];
                    question = {
                        notes: chosenShape,
                        answer: { root: finalRootName, quality: randomQuality, inversion: randomInversion },
                        prompt: { text1: 'Identify the triad:' },
                        mode: 'identify'
                    };
                }
            } else if (mode === 'constructHorizontally') {
                const randomStringSetName = activeStringSets[Math.floor(Math.random() * activeStringSets.length)];
                
                if (prevQuestion?.answer && prevQuestion.mode === 'constructHorizontally') {
                    const prev = prevQuestion.answer;
                    if (prev.root === finalRootName && prev.quality === randomQuality && prev.stringSetName === randomStringSetName) {
                        continue; 
                    }
                }

                let allInversionsOnSet = [];
                activeInversions.forEach(inv => {
                    const shapes = findTriadShapes(finalRootName, randomQuality, inv, STRING_SETS[randomStringSetName]);
                    if (shapes.length > 0) allInversionsOnSet.push(...shapes[0]);
                });

                if (allInversionsOnSet.length === activeInversions.length * 3) {
                     question = {
                        answer: { 
                            notes: allInversionsOnSet,
                            root: finalRootName,
                            quality: randomQuality,
                            inversions: activeInversions,
                            stringSetName: randomStringSetName
                        },
                        prompt: { text1: 'Construct all ', highlight1: `${finalRootName} ${randomQuality}`, text2: ' triads on the ', highlight2: `${randomStringSetName} strings` },
                        mode: 'constructHorizontally'
                    };
                }
            } else if (mode === 'constructVertically') {
                if (prevQuestion?.answer && prevQuestion.mode === 'constructVertically') {
                    const prev = prevQuestion.answer;
                    if (prev.root === finalRootName && prev.quality === randomQuality && prev.inversion === randomInversion) {
                        continue;
                    }
                }

                let allShapesOnFretboard = [];
                Object.values(STRING_SETS).forEach(stringSet => {
                    const shapes = findTriadShapes(finalRootName, randomQuality, randomInversion, stringSet);
                    if (shapes.length > 0) allShapesOnFretboard.push(...shapes[0]);
                });
                 if (allShapesOnFretboard.length > 0) {
                    question = {
                        answer: { 
                            notes: allShapesOnFretboard,
                            root: finalRootName,
                            quality: randomQuality,
                            inversion: randomInversion
                        },
                        prompt: { text1: 'Construct all ', highlight1: `${finalRootName} ${randomQuality}`, text2: ` triads in `, highlight2: `${randomInversion} inversion` },
                        mode: 'constructVertically'
                    };
                }
            }
        }

        setCurrentQuestion(question);
        setIsAnswered(false);
        setFeedback({ message: '', type: '' });
        setUserAnswer(mode === 'identify' ? {} : { notes: [] });

    }, [questionSettings]);

    useEffect(() => {
        generateNewQuestion();
    }, [generateNewQuestion]);

    const checkAnswer = useCallback((autoAdvance) => {
        if (isAnswered || !currentQuestion || !currentQuestion.answer) return;
        
        let isCorrect = false;

        if (currentQuestion.mode === 'identify') {
            const { root, quality, inversion } = currentQuestion.answer;
            const userAnswerRootMidi = NOTE_TO_MIDI_CLASS[userAnswer.root];
            const correctAnswerRootMidi = NOTE_TO_MIDI_CLASS[root];
            isCorrect = userAnswerRootMidi === correctAnswerRootMidi && userAnswer.quality === quality && userAnswer.inversion === inversion;
        } else {
            const userNotes = userAnswer.notes || [];
            const correctNotes = currentQuestion.answer.notes;
            const correctNoteIdSet = new Set(correctNotes.map(n => `${n.string}-${n.fret}`));
            isCorrect = userNotes.length === correctNotes.length && userNotes.every(n => correctNoteIdSet.has(`${n.string}-${n.fret}`));
        }
        
        const newScore = isCorrect ? score + 1 : score;
        const newTotalAsked = totalAsked + 1;

        if (isCorrect) {
            setScore(newScore);
            setFeedback({ message: 'Correct!', type: 'correct' });
        } else {
            if (currentQuestion.mode === 'identify') {
                const { root, quality, inversion } = currentQuestion.answer;
                const correctAnswerText = `${root} ${quality} (${inversion})`;
                setFeedback({ message: `Incorrect. The answer was ${correctAnswerText}.`, type: 'incorrect' });
            } else {
                setFeedback({ message: `Incorrect. The correct answer is shown.`, type: 'incorrect' });
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
        
        const noteId = `${string}-${fret}`;
        const currentNotes = userAnswer.notes || [];
        const isAlreadyClicked = currentNotes.some(n => `${n.string}-${n.fret}` === noteId);
        
        let newNotes;
        if (isAlreadyClicked) {
            newNotes = currentNotes.filter(n => `${n.string}-${n.fret}` !== noteId);
        } else {
            const noteInfo = fretboardModel[6 - string][fret];
            newNotes = [...currentNotes, { string, fret, label: noteInfo.note, midi: noteInfo.midi }];
        }
        setUserAnswer({ notes: newNotes });
    };
    
    const itemToDisplay = isReviewing ? history[reviewIndex] : { question: currentQuestion, userAnswer };
    const handleReviewNav = (direction) => setReviewIndex(prev => { const newIndex = prev + direction; if (newIndex >= 0 && newIndex < history.length) return newIndex; return prev; });
    const handleEnterReview = () => { if (history.length > 0) { clearTimeout(timeoutRef.current); setReviewIndex(history.length - 1); } };

    return {
        score, totalAsked, feedback, isAnswered, history, reviewIndex, setReviewIndex, isReviewing,
        itemToDisplay, generateNewQuestion, checkAnswer, handleAnswerSelect, handleFretClick,
        userAnswer, setUserAnswer, handleReviewNav, handleEnterReview
    };
};