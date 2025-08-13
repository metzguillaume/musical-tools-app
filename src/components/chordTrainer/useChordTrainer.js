import { useState, useCallback, useRef, useEffect } from 'react';

// Core Data
const chordData = {
    'C': { triads: { chords: ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] }, sevenths: { chords: ['Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7', 'Am7', 'Bm7b5'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] } },
    'G': { triads: { chords: ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] }, sevenths: { chords: ['Gmaj7', 'Am7', 'Bm7', 'Cmaj7', 'D7', 'Em7', 'F#m7b5'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] } },
    'D': { triads: { chords: ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] }, sevenths: { chords: ['Dmaj7', 'Em7', 'F#m7', 'Gmaj7', 'A7', 'Bm7', 'C#m7b5'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] } },
    'A': { triads: { chords: ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#dim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] }, sevenths: { chords: ['Amaj7', 'Bm7', 'C#m7', 'Dmaj7', 'E7', 'F#m7', 'G#m7b5'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] } },
    'E': { triads: { chords: ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#dim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] }, sevenths: { chords: ['Emaj7', 'F#m7', 'G#m7', 'Amaj7', 'B7', 'C#m7', 'D#m7b5'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] } },
    'B': { triads: { chords: ['B', 'C#m', 'D#m', 'E', 'F#', 'G#m', 'A#dim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] }, sevenths: { chords: ['Bmaj7', 'C#m7', 'D#m7', 'Emaj7', 'F#7', 'G#m7', 'A#m7b5'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] } },
    'F#': { triads: { chords: ['F#', 'G#m', 'A#m', 'B', 'C#', 'D#m', 'E#dim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] }, sevenths: { chords: ['F#maj7', 'G#m7', 'A#m7', 'Bmaj7', 'C#7', 'D#m7', 'E#m7b5'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] } },
    'Gb': { triads: { chords: ['Gb', 'Abm', 'Bbm', 'Cb', 'Db', 'Ebm', 'Fdim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] }, sevenths: { chords: ['Gbmaj7', 'Abm7', 'Bbm7', 'Cbmaj7', 'Db7', 'Ebm7', 'Fm7b5'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] } },
    'Db': { triads: { chords: ['Db', 'Ebm', 'Fm', 'Gb', 'Ab', 'Bbm', 'Cdim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] }, sevenths: { chords: ['Dbmaj7', 'Ebm7', 'Fm7', 'Gbmaj7', 'Ab7', 'Bbm7', 'Cm7b5'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] } },
    'Ab': { triads: { chords: ['Ab', 'Bbm', 'Cm', 'Db', 'Eb', 'Fm', 'Gdim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] }, sevenths: { chords: ['Abmaj7', 'Bbm7', 'Cm7', 'Dbmaj7', 'Eb7', 'Fm7', 'Gm7b5'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] } },
    'Eb': { triads: { chords: ['Eb', 'Fm', 'Gm', 'Ab', 'Bb', 'Cm', 'Ddim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] }, sevenths: { chords: ['Ebmaj7', 'Fm7', 'Gm7', 'Abmaj7', 'Bb7', 'Cm7', 'Dm7b5'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] } },
    'Bb': { triads: { chords: ['Bb', 'Cm', 'Dm', 'Eb', 'F', 'Gm', 'Adim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] }, sevenths: { chords: ['Bbmaj7', 'Cm7', 'Dm7', 'Ebmaj7', 'F7', 'Gm7', 'Am7b5'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] } },
    'F': { triads: { chords: ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'Edim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] }, sevenths: { chords: ['Fmaj7', 'Gm7', 'Am7', 'Bbmaj7', 'C7', 'Dm7', 'Em7b5'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] } },
};

const COMMON_PATTERNS = {
    'Major': [
        ['I', 'V', 'vi', 'IV'], ['I', 'IV', 'V', 'IV'], ['vi', 'IV', 'I', 'V'], ['I', 'vi', 'ii', 'V'],
        ['I', 'iii', 'vi', 'IV'], ['ii', 'V', 'I', 'vi'], ['I', 'V', 'ii', 'IV'],
        ['vi', 'ii', 'V', 'I'], ['I', 'IV', 'vi', 'V'], ['iii', 'vi', 'IV', 'V']
    ],
    'Minor': [
        ['i', 'VI', 'III', 'VII'], ['i', 'iv', 'v', 'iv'], ['i', 'iv', 'VII', 'III'],
        ['ii°', 'v', 'i', 'VI'], ['i', 'VII', 'VI', 'V'], ['i', 'iv', 'V', 'i'],
        ['iv', 'i', 'VII', 'III'], ['i', 'VI', 'iv', 'V'], ['v', 'VI', 'III', 'VII'], ['i', 'III', 'VII', 'iv']
    ]
};

export const useChordTrainer = (settings, onProgressUpdate) => {
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState('');
    const [score, setScore] = useState(0);
    const [history, setHistory] = useState([]);
    const [reviewIndex, setReviewIndex] = useState(null);
    const autoAdvanceTimeout = useRef(null);

    const generateNewQuestion = useCallback(() => {
        clearTimeout(autoAdvanceTimeout.current);
        setReviewIndex(null);
        if (!settings) return;

        const { selectedKeys, selectedModes, majorWeights, degreeToggles, use7thChords, generationMethod, hideQuality, useAlternateNotation } = settings;
        if (selectedKeys.length === 0 || selectedModes.length === 0) {
            setCurrentQuestion({ type: 'error', prompt: { text: 'Please select keys and game modes to begin.' } }); return;
        }
        
        const key = selectedKeys[Math.floor(Math.random() * selectedKeys.length)];
        const mode = selectedModes[Math.floor(Math.random() * selectedModes.length)];
        const keyData = use7thChords ? chordData[key].sevenths : chordData[key].triads;
        const availableDegreeIndexes = Object.keys(degreeToggles).map((deg, i) => degreeToggles[deg] ? i : -1).filter(i => i !== -1);
        if (availableDegreeIndexes.length === 0) {
            setCurrentQuestion({ type: 'error', prompt: { text: 'Please enable at least one scale degree in Controls.' } }); return;
        }
        
        let selectionPool = [];
        if (generationMethod === 'random') {
            selectionPool = availableDegreeIndexes;
        } else {
            availableDegreeIndexes.forEach(index => { for (let i = 0; i < majorWeights[index]; i++) { selectionPool.push(index); } });
        }
        if (selectionPool.length === 0) {
            setCurrentQuestion({ type: 'error', prompt: { text: 'No chords available with current settings.' } }); return;
        }
        
        let prompt = {}, answer = '', reminder = null;
        const degreeIndex = selectionPool[Math.floor(Math.random() * selectionPool.length)];
        const neutralizeNumeral = (numeral) => numeral.toUpperCase().replace('°', '');

        if (mode === 1) {
            let numeral = keyData.numerals[degreeIndex];
            if (hideQuality) numeral = neutralizeNumeral(numeral);
            prompt = { text: "In {key}, what is the chord for:", keys: [key], content: numeral };
            answer = keyData.chords[degreeIndex];
        } else if (mode === 4) {
            prompt = { text: "In {key}, what is the numeral for:", keys: [key], content: keyData.chords[degreeIndex] };
            answer = keyData.numerals[degreeIndex];
        } else {
            let p_indexes;
            if (generationMethod === 'random') {
                const counts = {};
                p_indexes = [];
                let attempts = 0;
                while (p_indexes.length < 4 && attempts < 100) {
                    const randomIndex = selectionPool[Math.floor(Math.random() * selectionPool.length)];
                    const count = counts[randomIndex] || 0;
                    if (count < 2) {
                        p_indexes.push(randomIndex);
                        counts[randomIndex] = count + 1;
                    }
                    attempts++;
                }
            } else {
                // THIS IS THE FIX: This logic is now simplified and correct.
                // It correctly uses the Major patterns since only major keys can be selected.
                const basePatterns = COMMON_PATTERNS['Major'];
                const basePattern = basePatterns[Math.floor(Math.random() * basePatterns.length)];
                p_indexes = basePattern.map(numeral => keyData.numerals.findIndex(n => n.toLowerCase().replace('°','') === numeral.toLowerCase().replace('°','')));
            }
            
            let progressionNumerals = p_indexes.map(idx => keyData.numerals[idx]);
            if (mode === 2) {
                let displayNumerals = hideQuality ? progressionNumerals.map(neutralizeNumeral) : progressionNumerals;
                prompt = { text: "In {key}, what are the chords for:", keys: [key], content: displayNumerals.join(' ') };
                answer = p_indexes.map(idx => keyData.chords[idx]).join(' ');
            } else {
                const otherKeys = selectedKeys.filter(k => k !== key);
                if (otherKeys.length === 0) { generateNewQuestion(); return; }
                const keyTo = otherKeys[Math.floor(Math.random() * otherKeys.length)];
                const keyToData = use7thChords ? chordData[keyTo].sevenths : chordData[keyTo].triads;
                prompt = { text: "Transpose from {key} to {key}:", keys: [key, keyTo], content: p_indexes.map(idx => keyData.chords[idx]).join(' ') };
                answer = progressionNumerals.map(numeral => {
                    const numeralIndex = keyData.numerals.indexOf(numeral);
                    return keyToData.chords[numeralIndex];
                }).join(' ');
            }
        }
        
        if (use7thChords) { reminder = "Tetrad mode is active. Answers should be 7th chords (e.g., Cmaj7, Dm7, Bm7b5)."; }
        if (useAlternateNotation) { reminder = (reminder ? reminder + " " : "") + "Type answers using standard notation (e.g., m7, maj7)."; }

        setCurrentQuestion({ prompt, answer, key, mode, reminder });
        setUserAnswer('');
        setFeedback('');
    }, [settings]);
    
    useEffect(() => {
        if (settings && settings.selectedKeys.length > 0) generateNewQuestion();
    }, [settings, generateNewQuestion]);

    const checkAnswer = useCallback((answer, autoAdvance) => {
        if (feedback || !currentQuestion || currentQuestion.type === 'error') return;
        const isCorrect = answer.trim().replace(/\s+/g, ' ').toLowerCase() === currentQuestion.answer.toLowerCase();
        
        const newScore = isCorrect ? score + 1 : score;
        const newTotalAsked = history.length + 1;

        if (isCorrect) { 
            setScore(newScore); 
            setFeedback('Correct!');
        } else { 
            setFeedback(`Incorrect. The answer was: ${currentQuestion.answer}`); 
        }
        
        setHistory(prev => [...prev, { question: currentQuestion, userAnswer: answer, wasCorrect: isCorrect }]);
        
        if(onProgressUpdate) {
            onProgressUpdate({ wasCorrect: isCorrect, score: newScore, totalAsked: newTotalAsked });
        }

        if (autoAdvance && isCorrect) { 
            autoAdvanceTimeout.current = setTimeout(generateNewQuestion, 1500); 
        }
    }, [feedback, currentQuestion, generateNewQuestion, score, history.length, onProgressUpdate]);
    
    const handleReviewNav = (direction) => setReviewIndex(prev => { const newIndex = prev + direction; if (newIndex >= 0 && newIndex < history.length) return newIndex; return prev; });
    const startReview = () => history.length > 0 && setReviewIndex(history.length - 1);

    return {
        currentQuestion, userAnswer, setUserAnswer, feedback, score, history, reviewIndex, setReviewIndex,
        checkAnswer, generateNewQuestion, startReview, handleReviewNav
    };
};