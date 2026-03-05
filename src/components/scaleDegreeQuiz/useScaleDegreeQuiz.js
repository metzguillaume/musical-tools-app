// src/components/scaleDegreeQuiz/useScaleDegreeQuiz.js

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { fretboardModel } from '../../utils/fretboardUtils.js';
import { SCALE_SHAPES, SCALE_TYPE_INFO, normalizeDegree } from './scaleDegreeConstants.js';
import { getWeightedEnharmonicName } from '../../utils/musicTheory.js';

export const useScaleDegreeQuiz = (settings, onProgressUpdate, sessionId) => {
    const [score, setScore]               = useState(0);
    const [totalAsked, setTotalAsked]     = useState(0);
    const [feedback, setFeedback]         = useState({ message: '', type: '' });
    const [isAnswered, setIsAnswered]     = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [selectedDegree, setSelectedDegree]   = useState(null);
    const [history, setHistory]           = useState([]);
    const [reviewIndex, setReviewIndex]   = useState(null);
    const timeoutRef = useRef(null);

    const isReviewing = reviewIndex !== null;

    // ── Build the pool of active (scaleType, shape) combos ────────────────
    const activePool = useMemo(() => {
        const pool = [];
        const { enabledScaleTypes, enabledShapes } = settings;
        if (!enabledScaleTypes || !enabledShapes) return pool;

        for (const scaleType of Object.keys(SCALE_SHAPES)) {
            if (!enabledScaleTypes[scaleType]) continue;
            for (const shape of Object.keys(SCALE_SHAPES[scaleType])) {
                if (!enabledShapes[shape]) continue;
                pool.push({ scaleType, shape });
            }
        }
        return pool;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settings.enabledScaleTypes, settings.enabledShapes]);

    // ── Build the pool of active context modes ────────────────────────────
    const activeModes = useMemo(() => {
        const { contextModes } = settings;
        if (!contextModes) return [];
        return Object.keys(contextModes).filter(m => contextModes[m]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settings.contextModes]);

    // ── Generate a new question ───────────────────────────────────────────
    const generateNewQuestion = useCallback(() => {
        clearTimeout(timeoutRef.current);
        setReviewIndex(null);

        if (activePool.length === 0 || activeModes.length === 0) {
            setCurrentQuestion({
                error: 'Please select at least one Scale Type, Shape, and Context Mode.',
            });
            setIsAnswered(false);
            setFeedback({ message: '', type: '' });
            setSelectedDegree(null);
            return;
        }

        let question = null;
        let attempts = 0;

        while (!question && attempts < 150) {
            attempts++;

            // Pick random scale/shape combo
            const { scaleType, shape } = activePool[Math.floor(Math.random() * activePool.length)];
            const shapeData = SCALE_SHAPES[scaleType][shape];

            // Pick random context mode
            const contextMode = activeModes[Math.floor(Math.random() * activeModes.length)];

            // Find the anchor root note (prefer string 6, then 5, then 4)
            const rootDef = shapeData.notes.find(n => n.d === 'R');
            if (!rootDef) continue;

            // Random fret placement (1–12)
            const randomFret = Math.floor(Math.random() * 12) + 1;
            const fretOffset = randomFret - rootDef.f;

            // Compute all absolute fret positions & check bounds
            let outOfBounds = false;
            const computedNotes = [];

            for (const note of shapeData.notes) {
                const f = note.f + fretOffset;
                if (f < 0 || f > 15) { outOfBounds = true; break; }
                const noteInfo = fretboardModel[6 - note.s][f];
                computedNotes.push({
                    ...note,
                    string: note.s,
                    fret: f,
                    isRoot: note.d === 'R',
                    label: noteInfo.note,
                    midi: noteInfo.midi,
                });
            }

            if (outOfBounds || computedNotes.length < 5) continue;

            // Get root name
            const rootNote = computedNotes.find(n => n.isRoot);
            if (!rootNote) continue;
            const rootName = getWeightedEnharmonicName(rootNote.label);

            // Pick mystery note — never pick a root for "identify the degree" 
            // (roots are always degree 1 — too easy / trivial)
            const nonRootNotes = computedNotes.filter(n => !n.isRoot);
            if (nonRootNotes.length === 0) continue;
            const mysteryNote = nonRootNotes[Math.floor(Math.random() * nonRootNotes.length)];
            const correctDegree = normalizeDegree(mysteryNote.degree);

            const scaleInfo = SCALE_TYPE_INFO[scaleType];

            question = {
                scaleType,
                shape,
                contextMode,
                rootName,
                quality: scaleInfo.quality,      // 'major' | 'minor'
                scaleLabel: scaleInfo.label,
                notes: computedNotes,
                mysteryNote,
                correctDegree,
            };
        }

        setCurrentQuestion(question);
        setIsAnswered(false);
        setFeedback({ message: '', type: '' });
        setSelectedDegree(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activePool, activeModes]);

    // ── Reset on new session (preset load) ───────────────────────────────
    useEffect(() => {
        setScore(0);
        setTotalAsked(0);
        setHistory([]);
        setFeedback({ message: '', type: '' });
        setIsAnswered(false);
        setSelectedDegree(null);
        generateNewQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId]);

    // ── Regenerate when settings change ──────────────────────────────────
    useEffect(() => {
        generateNewQuestion();
    }, [generateNewQuestion]);

    // ── Submit answer ─────────────────────────────────────────────────────
    const checkAnswer = useCallback((autoAdvance, forcedDegree) => {
        const degreeToCheck = forcedDegree ?? selectedDegree;
        if (isAnswered || !currentQuestion || !degreeToCheck) return;
        if (currentQuestion.error) return;

        const isCorrect = normalizeDegree(degreeToCheck) === normalizeDegree(currentQuestion.correctDegree);

        const newScore      = isCorrect ? score + 1 : score;
        const newTotalAsked = totalAsked + 1;

        if (isCorrect) {
            setScore(newScore);
            setFeedback({ message: `Correct! The degree is ${currentQuestion.correctDegree}.`, type: 'correct' });
        } else {
            setFeedback({
                message: `Incorrect. The correct degree was ${currentQuestion.correctDegree}.`,
                type: 'incorrect',
            });
        }

        setTotalAsked(newTotalAsked);
        if (onProgressUpdate) {
            onProgressUpdate({ wasCorrect: isCorrect, score: newScore, totalAsked: newTotalAsked });
        }

        setHistory(prev => [...prev, {
            question: currentQuestion,
            userAnswer: degreeToCheck,
            wasCorrect: isCorrect,
        }]);
        setIsAnswered(true);

        if (autoAdvance && isCorrect) {
            timeoutRef.current = setTimeout(generateNewQuestion, 1800);
        }
    }, [isAnswered, selectedDegree, currentQuestion, score, totalAsked, generateNewQuestion, onProgressUpdate]);

    // ── Review navigation ─────────────────────────────────────────────────
    const handleEnterReview = useCallback(() => {
        if (history.length > 0) {
            clearTimeout(timeoutRef.current);
            setReviewIndex(history.length - 1);
        }
    }, [history]);

    const handleReviewNav = useCallback((direction) => {
        setReviewIndex(prev => {
            const next = prev + direction;
            if (next >= 0 && next < history.length) return next;
            return prev;
        });
    }, [history]);

    const returnToQuiz = useCallback(() => setReviewIndex(null), []);

    // ── What to display (current question or review item) ─────────────────
    const itemToDisplay = useMemo(() => {
        if (isReviewing) return history[reviewIndex];
        return { question: currentQuestion, userAnswer: selectedDegree, wasCorrect: null };
    }, [isReviewing, history, reviewIndex, currentQuestion, selectedDegree]);

    return {
        score, totalAsked,
        feedback, isAnswered,
        currentQuestion,
        selectedDegree, setSelectedDegree,
        history, reviewIndex, isReviewing,
        itemToDisplay,
        generateNewQuestion, checkAnswer,
        handleEnterReview, handleReviewNav, returnToQuiz,
    };
};