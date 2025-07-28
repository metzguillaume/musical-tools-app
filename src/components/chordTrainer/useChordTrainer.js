import { useState, useCallback, useRef, useEffect } from 'react';

// --- Core Data (Now includes 7th chords) ---
const chordData = {
    'C': { triads: { chords: ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] }, sevenths: { chords: ['Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7', 'Am7', 'Bm7b5'], numerals: ['Imaj7', 'ii7', 'iii7', 'IVmaj7', 'V7', 'vi7', 'viim7b5'] } },
    'G': { triads: { chords: ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] }, sevenths: { chords: ['Gmaj7', 'Am7', 'Bm7', 'Cmaj7', 'D7', 'Em7', 'F#m7b5'], numerals: ['Imaj7', 'ii7', 'iii7', 'IVmaj7', 'V7', 'vi7', 'viim7b5'] } },
    'D': { triads: { chords: ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] }, sevenths: { chords: ['Dmaj7', 'Em7', 'F#m7', 'Gmaj7', 'A7', 'Bm7', 'C#m7b5'], numerals: ['Imaj7', 'ii7', 'iii7', 'IVmaj7', 'V7', 'vi7', 'viim7b5'] } },
    'A': { triads: { chords: ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#dim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] }, sevenths: { chords: ['Amaj7', 'Bm7', 'C#m7', 'Dmaj7', 'E7', 'F#m7', 'G#m7b5'], numerals: ['Imaj7', 'ii7', 'iii7', 'IVmaj7', 'V7', 'vi7', 'viim7b5'] } },
    'E': { triads: { chords: ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#dim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] }, sevenths: { chords: ['Emaj7', 'F#m7', 'G#m7', 'Amaj7', 'B7', 'C#m7', 'D#m7b5'], numerals: ['Imaj7', 'ii7', 'iii7', 'IVmaj7', 'V7', 'vi7', 'viim7b5'] } },
    'B': { triads: { chords: ['B', 'C#m', 'D#m', 'E', 'F#', 'G#m', 'A#dim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] }, sevenths: { chords: ['Bmaj7', 'C#m7', 'D#m7', 'Emaj7', 'F#7', 'G#m7', 'A#m7b5'], numerals: ['Imaj7', 'ii7', 'iii7', 'IVmaj7', 'V7', 'vi7', 'viim7b5'] } },
    'F#': { triads: { chords: ['F#', 'G#m', 'A#m', 'B', 'C#', 'D#m', 'E#dim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] }, sevenths: { chords: ['F#maj7', 'G#m7', 'A#m7', 'Bmaj7', 'C#7', 'D#m7', 'E#m7b5'], numerals: ['Imaj7', 'ii7', 'iii7', 'IVmaj7', 'V7', 'vi7', 'viim7b5'] } },
    'Gb': { triads: { chords: ['Gb', 'Abm', 'Bbm', 'Cb', 'Db', 'Ebm', 'Fdim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] }, sevenths: { chords: ['Gbmaj7', 'Abm7', 'Bbm7', 'Cbmaj7', 'Db7', 'Ebm7', 'Fm7b5'], numerals: ['Imaj7', 'ii7', 'iii7', 'IVmaj7', 'V7', 'vi7', 'viim7b5'] } },
    'Db': { triads: { chords: ['Db', 'Ebm', 'Fm', 'Gb', 'Ab', 'Bbm', 'Cdim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] }, sevenths: { chords: ['Dbmaj7', 'Ebm7', 'Fm7', 'Gbmaj7', 'Ab7', 'Bbm7', 'Cm7b5'], numerals: ['Imaj7', 'ii7', 'iii7', 'IVmaj7', 'V7', 'vi7', 'viim7b5'] } },
    'Ab': { triads: { chords: ['Ab', 'Bbm', 'Cm', 'Db', 'Eb', 'Fm', 'Gdim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] }, sevenths: { chords: ['Abmaj7', 'Bbm7', 'Cm7', 'Dbmaj7', 'Eb7', 'Fm7', 'Gm7b5'], numerals: ['Imaj7', 'ii7', 'iii7', 'IVmaj7', 'V7', 'vi7', 'viim7b5'] } },
    'Eb': { triads: { chords: ['Eb', 'Fm', 'Gm', 'Ab', 'Bb', 'Cm', 'Ddim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] }, sevenths: { chords: ['Ebmaj7', 'Fm7', 'Gm7', 'Abmaj7', 'Bb7', 'Cm7', 'Dm7b5'], numerals: ['Imaj7', 'ii7', 'iii7', 'IVmaj7', 'V7', 'vi7', 'viim7b5'] } },
    'Bb': { triads: { chords: ['Bb', 'Cm', 'Dm', 'Eb', 'F', 'Gm', 'Adim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] }, sevenths: { chords: ['Bbmaj7', 'Cm7', 'Dm7', 'Ebmaj7', 'F7', 'Gm7', 'Am7b5'], numerals: ['Imaj7', 'ii7', 'iii7', 'IVmaj7', 'V7', 'vi7', 'viim7b5'] } },
    'F': { triads: { chords: ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'Edim'], numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] }, sevenths: { chords: ['Fmaj7', 'Gm7', 'Am7', 'Bbmaj7', 'C7', 'Dm7', 'Em7b5'], numerals: ['Imaj7', 'ii7', 'iii7', 'IVmaj7', 'V7', 'vi7', 'viim7b5'] } },
};
const SYMBOL_MAP = { 'Minor': ['m', '-'], 'Diminished': ['dim', '°'], 'Major 7th': ['maj7', '△'], 'Half-Diminished 7th': ['m7b5', 'ø'] };
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export const useChordTrainer = (settings) => {
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

        const { selectedKeys, selectedModes, majorWeights, degreeToggles, useAlternateSymbols, use7thChords, generationMethod, hideQuality } = settings;
        if (selectedKeys.length === 0 || selectedModes.length === 0) {
            setCurrentQuestion({ type: 'error', prompt: 'Please select keys and game modes to begin.' }); return;
        }
        const symbolChoices = {};
        if (useAlternateSymbols) { Object.keys(SYMBOL_MAP).forEach(q => { symbolChoices[q] = SYMBOL_MAP[q][Math.floor(Math.random() * SYMBOL_MAP[q].length)]; }); }

        const formatChord = (chord) => {
            if (!useAlternateSymbols) return chord;
            if (chord.endsWith('m7b5')) return chord.replace('m7b5', symbolChoices['Half-Diminished 7th']);
            if (chord.endsWith('maj7')) return chord.replace('maj7', symbolChoices['Major 7th']);
            if (chord.endsWith('m7')) return chord.replace('m7', `${symbolChoices.Minor}7`);
            if (chord.endsWith('dim')) return chord.replace('dim', symbolChoices.Diminished);
            if (chord.endsWith('m')) return chord.replace('m', symbolChoices.Minor);
            return chord;
        };
        
        // NEW: Helper to neutralize Roman numeral quality
        const neutralizeNumeral = (numeral) => numeral.toUpperCase().replace('°', '').replace('Ø7', '7').replace('MAJ7', '7');

        const key = selectedKeys[Math.floor(Math.random() * selectedKeys.length)];
        const mode = selectedModes[Math.floor(Math.random() * selectedModes.length)];
        const keyData = use7thChords ? chordData[key].sevenths : chordData[key].triads;
        const availableDegreeIndexes = Object.keys(degreeToggles).map((deg, i) => degreeToggles[deg] ? i : -1).filter(i => i !== -1);
        if (availableDegreeIndexes.length === 0) {
            setCurrentQuestion({ type: 'error', prompt: 'Please enable at least one scale degree in Controls.' }); return;
        }
        
        let selectionPool = [];
        if (generationMethod === 'random') {
            selectionPool = availableDegreeIndexes;
        } else {
            availableDegreeIndexes.forEach(index => {
                for (let i = 0; i < majorWeights[index]; i++) {
                    selectionPool.push(index);
                }
            });
        }
        if (selectionPool.length === 0) {
            setCurrentQuestion({ type: 'error', prompt: 'No chords available with current settings.' }); return;
        }
        
        let prompt, answer, promptStructure;
        const degreeIndex = selectionPool[Math.floor(Math.random() * selectionPool.length)];
        
        if (mode === 1) { // Name Chord
            let numeral = keyData.numerals[degreeIndex];
            if (hideQuality) numeral = neutralizeNumeral(numeral);
            prompt = `In **${key}**, what is the **${numeral}** chord?`;
            answer = keyData.chords[degreeIndex];
        } else if (mode === 4) { // Name Numeral
            prompt = `In **${key}**, what is the numeral for **${formatChord(keyData.chords[degreeIndex])}**?`;
            answer = keyData.numerals[degreeIndex];
        } else { // Progressions
            const p = shuffle([...selectionPool]).slice(0, 4);
            let progressionNumerals = p.map(idx => keyData.numerals[idx]);
            
            if (mode === 2) { // Name Progression
                let displayNumerals = hideQuality ? progressionNumerals.map(neutralizeNumeral) : progressionNumerals;
                prompt = `In **${key}**, what are the chords for **${displayNumerals.join(' ')}**?`;
                answer = p.map(idx => keyData.chords[idx]).join(' ');
            } else { // Transpose
                const otherKeys = selectedKeys.filter(k => k !== key);
                if (otherKeys.length === 0) { generateNewQuestion(); return; }
                const keyTo = otherKeys[Math.floor(Math.random() * otherKeys.length)];
                const keyToData = use7thChords ? chordData[keyTo].sevenths : chordData[keyTo].triads;
                const chordProgFrom = p.map(idx => formatChord(keyData.chords[idx])).join(' ');
                promptStructure = {
                    textParts: ['Transpose ', ' from ', ' to '],
                    highlightParts: [chordProgFrom, key, keyTo]
                };
                answer = progressionNumerals.map(numeral => {
                    const numeralIndex = keyToData.numerals.indexOf(numeral);
                    return keyToData.chords[numeralIndex];
                }).join(' ');
            }
        }
        setCurrentQuestion({ prompt, answer, key, promptStructure, mode });
        setUserAnswer('');
        setFeedback('');
    }, [settings]);
    
    useEffect(() => {
        if (settings && settings.selectedKeys.length > 0) generateNewQuestion();
    }, [settings, generateNewQuestion]);

    const checkAnswer = useCallback((answer, autoAdvance) => {
        if (feedback || !currentQuestion || currentQuestion.type === 'error') return;
        const isCorrect = answer.trim().replace(/\s+/g, ' ').toLowerCase() === currentQuestion.answer.toLowerCase();
        if (isCorrect) { setScore(prev => prev + 1); setFeedback('Correct!');
        } else { setFeedback(`Incorrect. The answer was: ${currentQuestion.answer}`); }
        setHistory(prev => [...prev, { question: currentQuestion, userAnswer: answer, wasCorrect: isCorrect }]);
        if (autoAdvance) { autoAdvanceTimeout.current = setTimeout(generateNewQuestion, 1500); }
    }, [feedback, currentQuestion, generateNewQuestion]);
    
    const handleReviewNav = (direction) => setReviewIndex(prev => { const newIndex = prev + direction; if (newIndex >= 0 && newIndex < history.length) return newIndex; return prev; });
    const startReview = () => history.length > 0 && setReviewIndex(history.length - 1);

    return {
        currentQuestion, userAnswer, setUserAnswer, feedback, score, history, reviewIndex, setReviewIndex,
        checkAnswer, generateNewQuestion, startReview, handleReviewNav
    };
};