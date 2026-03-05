// src/components/scaleDegreeQuiz/ScaleDegreeQuiz.js

import React, { useState, useEffect, useCallback } from 'react';
import { useTools } from '../../context/ToolsContext';
import QuizLayout from '../common/QuizLayout';
import FretboardDiagram from '../common/FretboardDiagram';
import InfoModal from '../common/InfoModal';
import { ScaleDegreeQuizControls } from './ScaleDegreeQuizControls';
import { useScaleDegreeQuiz } from './useScaleDegreeQuiz';
import { DEGREE_BUTTONS, normalizeDegree } from './scaleDegreeConstants';

// ── Root markers only on low E (6), A (5), D (4) ─────────────────────────
const ROOT_MARKER_STRINGS = new Set([6, 5, 4]);

// ── Pentatonic degrees by quality — used for post-answer highlight ────────
const PENTATONIC_DEGREES = {
    major: new Set(['1', '2', '3', '5', '6']),
    minor: new Set(['1', 'b3', '4', '5', 'b7']),
};

// ── Build display notes for the fretboard ────────────────────────────────
const buildDisplayNotes = (question, isAnswered, isReviewing, reviewItem) => {
    const q = isReviewing ? reviewItem?.question : question;
    if (!q || q.error || !q.notes) return [];

    const { contextMode, quality } = q;
    const mystery = isReviewing ? reviewItem?.question?.mysteryNote : q.mysteryNote;
    const pentaDegrees = PENTATONIC_DEGREES[quality] || new Set();

    // Only mark the single lowest-pitched root (highest string number) among strings 6, 5, 4
    const markedRootStrings = q.notes
        .filter(n => n.isRoot && ROOT_MARKER_STRINGS.has(n.string))
        .map(n => n.string);
    const lowestMarkedRootString = markedRootStrings.length > 0 ? Math.max(...markedRootStrings) : null;

    const showPostAnswer = isAnswered || isReviewing;

    return q.notes.map(note => {
        const isMystery = note.string === mystery?.string && note.fret === mystery?.fret;
        const normDeg = normalizeDegree(note.degree);

        // ── POST-ANSWER state ─────────────────────────────────────────────
        if (showPostAnswer) {
            // Mystery note — amber, shows its degree
            if (isMystery) {
                return {
                    ...note,
                    overrideColor: 'hsl(45, 100%, 55%)',
                    overrideLabel: note.degree,
                    isRoot: false,
                };
            }
            // Root notes → red
            if (note.isRoot) {
                return {
                    ...note,
                    overrideColor: 'hsl(0, 80%, 50%)',
                    overrideLabel: note.degree,
                    isRoot: false,
                };
            }
            // Pentatonic shape notes → teal/green
            if (pentaDegrees.has(normDeg)) {
                return {
                    ...note,
                    overrideColor: 'hsl(170, 100%, 35%)',
                    overrideLabel: note.degree,
                    isRoot: false,
                };
            }
            // Remaining scale notes (non-pentatonic) → plain blue, show degree
            return {
                ...note,
                overrideColor: 'hsl(220, 80%, 55%)',
                overrideLabel: note.degree,
                isRoot: false,
            };
        }

        // ── PRE-ANSWER state ──────────────────────────────────────────────
        // Mystery note — amber with '?'
        if (isMystery) {
            return {
                ...note,
                overrideColor: 'hsl(45, 100%, 55%)',
                overrideLabel: '?',
                isRoot: false,
            };
        }
        // Root note display rules
        if (note.isRoot) {
            if (contextMode === 'rootGiven' && note.string === lowestMarkedRootString) {
                return {
                    ...note,
                    overrideColor: 'hsl(170, 100%, 35%)',
                    overrideLabel: 'R',
                };
            }
            return {
                ...note,
                overrideColor: 'hsl(220, 80%, 55%)',
                overrideLabel: '',
                isRoot: false,
            };
        }
        // All other notes — plain blue, blank
        return {
            ...note,
            overrideColor: 'hsl(220, 80%, 55%)',
            overrideLabel: '',
            isRoot: false,
        };
    });
};

// ── Prompt text ───────────────────────────────────────────────────────────
const buildPrompt = (question) => {
    if (!question || question.error) return '';
    const { contextMode, quality } = question;
    if (contextMode === 'rootGiven') {
        return 'What is the scale degree of the highlighted note?';
    }
    return `${quality === 'major' ? 'Major' : 'Minor'} pattern — what is the scale degree of the highlighted note?`;
};

// ── Main Component ────────────────────────────────────────────────────────
const ScaleDegreeQuiz = ({ onProgressUpdate }) => {
    const { presetToLoad, clearPresetToLoad, savePreset, addLogEntry } = useTools();

    const defaultSettings = {
        enabledScaleTypes: {
            majorPentatonic: true,
            minorPentatonic: true,
            majorScale: false,
            naturalMinor: false,
        },
        enabledShapes: { E: true, A: true, G: true, C: true, D: true },
        contextModes: { rootGiven: true, qualityGiven: false },
        autoAdvance: true,
    };

    const [settings, setSettings]             = useState(defaultSettings);
    const [sessionId, setSessionId]           = useState(() => Date.now());
    const [isControlsOpen, setIsControlsOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    // Load preset
    useEffect(() => {
        if (presetToLoad?.gameId === 'scale-degree-quiz') {
            setSettings(presetToLoad.settings);
            setSessionId(Date.now());
            clearPresetToLoad();
        }
    }, [presetToLoad, clearPresetToLoad]);

    const {
        score, totalAsked,
        feedback, isAnswered,
        currentQuestion,
        selectedDegree, setSelectedDegree,
        history, reviewIndex, isReviewing,
        itemToDisplay,
        generateNewQuestion, checkAnswer,
        handleEnterReview, handleReviewNav, returnToQuiz,
    } = useScaleDegreeQuiz(settings, onProgressUpdate, sessionId);

    // ── Settings toggle ───────────────────────────────────────────────────
    const handleSettingToggle = useCallback((type, key) => {
        setSettings(prev => {
            if (type === 'misc') return { ...prev, [key]: !prev[key] };
            return { ...prev, [type]: { ...prev[type], [key]: !prev[type]?.[key] } };
        });
    }, []);

    // ── Save preset ───────────────────────────────────────────────────────
    const handleSavePreset = useCallback(() => {
        const name = window.prompt('Enter a name for this preset:');
        if (!name || !name.trim()) return;
        savePreset({
            id: `preset_${Date.now()}`,
            name: name.trim(),
            gameId: 'scale-degree-quiz',
            gameName: 'Scale Degree Quiz',
            settings,
        });
        alert('Preset saved!');
    }, [savePreset, settings]);

    // ── Log progress ──────────────────────────────────────────────────────
    const handleLogProgress = useCallback(() => {
        const remarks = prompt('Enter any remarks for this session:', `Score: ${score}/${totalAsked}`);
        if (remarks !== null) {
            addLogEntry({ game: 'Scale Degree Quiz', date: new Date().toLocaleDateString(), remarks });
            alert('Session logged!');
        }
    }, [addLogEntry, score, totalAsked]);

    // ── Derived display data ──────────────────────────────────────────────
    const displayQuestion = isReviewing ? itemToDisplay?.question : currentQuestion;
    const displayAnswer   = isReviewing ? itemToDisplay?.userAnswer : selectedDegree;

    const displayNotes = buildDisplayNotes(currentQuestion, isAnswered, isReviewing, itemToDisplay);
    const promptText   = buildPrompt(displayQuestion);

    // ── Answer button classes ─────────────────────────────────────────────
    const getDegreeButtonClass = (degree) => {
        const norm         = normalizeDegree(degree);
        const normCorrect  = normalizeDegree(currentQuestion?.correctDegree || '');
        const normSelected = normalizeDegree(displayAnswer || '');

        if (isAnswered || isReviewing) {
            if (norm === normCorrect)                          return 'bg-green-600 text-white ring-2 ring-green-400 shadow-lg';
            if (norm === normSelected && norm !== normCorrect) return 'bg-red-600 text-white ring-2 ring-red-400 shadow-lg';
            return 'bg-teal-600 text-white opacity-40';
        }
        if (norm === normalizeDegree(selectedDegree || '')) return 'bg-indigo-600 text-white ring-2 ring-indigo-300 shadow-lg';
        return 'bg-teal-600 hover:bg-teal-500 text-white';
    };

    // ── Top controls (auto-advance only) ─────────────────────────────────
    const topControlsContent = (
        <label className="flex items-center gap-2 cursor-pointer font-semibold">
            <span>Auto-Advance</span>
            <div className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    checked={!!settings.autoAdvance}
                    onChange={() => handleSettingToggle('misc', 'autoAdvance')}
                    className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-500 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </div>
        </label>
    );

    // ── Footer ────────────────────────────────────────────────────────────
    const wasCorrect = history.length > 0 ? history[history.length - 1].wasCorrect : true;

    const footerContent = isReviewing ? (
        <div className="flex items-center justify-center gap-4 w-full">
            <button onClick={() => handleReviewNav(-1)} disabled={reviewIndex === 0} className="bg-slate-600 hover:bg-slate-500 font-bold p-3 rounded-lg disabled:opacity-50">Prev</button>
            <button onClick={returnToQuiz} className="bg-purple-600 hover:bg-purple-500 font-bold py-3 px-6 rounded-lg">Return to Quiz</button>
            <button onClick={() => handleReviewNav(1)} disabled={reviewIndex === history.length - 1} className="bg-slate-600 hover:bg-slate-500 font-bold p-3 rounded-lg disabled:opacity-50">Next</button>
        </div>
    ) : isAnswered && (!settings.autoAdvance || !wasCorrect) ? (
        <button onClick={generateNewQuestion} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg animate-pulse">
            Next Question
        </button>
    ) : !isAnswered ? (
        settings.autoAdvance ? null : (
        <button
            onClick={() => checkAnswer(false)}
            disabled={!selectedDegree}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
        >
            Submit Answer
        </button>
        )
    ) : null;

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col md:flex-row items-start w-full gap-4">

            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Scale Degree Quiz">
                <p>A scale pattern is shown on the fretboard. One note is highlighted in <span className="text-amber-400 font-bold">amber</span> — identify its scale degree.</p>
                <h4 className="font-bold text-indigo-300 mt-4">Context Modes</h4>
                <ul className="list-disc list-inside text-sm space-y-1 mt-1">
                    <li><strong>Root Given:</strong> The root (R) is shown in teal on the low E, A or D string. The root can itself be the mystery note.</li>
                    <li><strong>Quality Given:</strong> Only Major or Minor is told. All notes are identical blue — find the root from the shape, then determine the degree.</li>
                </ul>
                <h4 className="font-bold text-indigo-300 mt-4">Tips</h4>
                <p className="text-sm">Roots are never marked on the G, B or high E strings — use the low strings as your reference point to navigate the full pattern.</p>
            </InfoModal>

            <QuizLayout
                title="Scale Degree Quiz"
                score={score}
                totalAsked={totalAsked}
                history={history}
                isReviewing={isReviewing}
                onStartReview={handleEnterReview}
                topControls={topControlsContent}
                footerContent={footerContent}
                onLogProgress={handleLogProgress}
                onToggleControls={() => setIsControlsOpen(p => !p)}
                onShowInfo={() => setIsInfoModalOpen(true)}
            >
                {currentQuestion?.error && (
                    <div className="text-center text-amber-400 font-semibold py-8">{currentQuestion.error}</div>
                )}

                {!currentQuestion?.error && displayQuestion && (
                    <div className="space-y-4">

                        {/* Prompt */}
                        <div className="text-center text-gray-200 font-semibold text-lg min-h-[2rem]">
                            {promptText}
                        </div>

                        {/* Full fretboard — always 0 to 15 */}
                        <FretboardDiagram
                            startFret={0}
                            fretCount={15}
                            notesToDisplay={displayNotes}
                            showLabels={true}
                            labelType="degree"
                        />

                        {/* Feedback */}
                        {(feedback.message || isReviewing) && (
                            <div className={`text-center font-bold text-lg py-2 rounded-lg ${
                                isReviewing
                                    ? (itemToDisplay?.wasCorrect ? 'text-green-400 bg-green-900/30' : 'text-red-400 bg-red-900/30')
                                    : feedback.type === 'correct'
                                        ? 'text-green-400 bg-green-900/30'
                                        : 'text-red-400 bg-red-900/30'
                            }`}>
                                {isReviewing
                                    ? (itemToDisplay?.wasCorrect
                                        ? `Correct! The degree was ${itemToDisplay?.question?.correctDegree}.`
                                        : `Incorrect. Correct: ${itemToDisplay?.question?.correctDegree} — Your answer: ${itemToDisplay?.userAnswer}.`)
                                    : feedback.message
                                }
                            </div>
                        )}

                        {/* Degree answer buttons */}
                        <div className="grid grid-cols-6 gap-2 mt-2">
                            {DEGREE_BUTTONS.map(degree => (
                                <button
                                    key={degree}
                                    onClick={() => {
                                        if (isAnswered || isReviewing) return;
                                        setSelectedDegree(degree);
                                        if (settings.autoAdvance) {
                                            // Pass degree directly — state update is async
                                            checkAnswer(true, degree);
                                        }
                                    }}
                                    disabled={isAnswered || isReviewing}
                                    className={`py-3 rounded-lg font-bold text-sm transition-all active:scale-95 disabled:cursor-default ${getDegreeButtonClass(degree)}`}
                                >
                                    {degree}
                                </button>
                            ))}
                        </div>

                    </div>
                )}
            </QuizLayout>

            {/* Desktop: sliding panel pushing quiz view to the side */}
            <div className={`hidden md:block bg-slate-700 rounded-lg transition-all duration-300 ease-in-out ${isControlsOpen ? 'w-96 p-4' : 'w-0 p-0 overflow-hidden'}`}>
                <div className={`${!isControlsOpen && 'hidden'}`}>
                    <h3 className="text-xl font-bold text-teal-300 mb-4">Settings & Controls</h3>
                    <ScaleDegreeQuizControls
                        settings={settings}
                        onSettingToggle={handleSettingToggle}
                        onSavePreset={handleSavePreset}
                    />
                </div>
            </div>

            {/* Mobile: full-screen overlay */}
            {isControlsOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex justify-center items-center bg-black/60" onClick={() => setIsControlsOpen(false)}>
                    <div className="w-11/12 max-w-sm bg-slate-800 rounded-2xl p-4 max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex-shrink-0 flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-teal-300">Settings & Controls</h3>
                            <button onClick={() => setIsControlsOpen(false)} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
                        </div>
                        <div className="flex-grow overflow-y-auto pr-2">
                            <ScaleDegreeQuizControls
                                settings={settings}
                                onSettingToggle={handleSettingToggle}
                                onSavePreset={handleSavePreset}
                            />
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ScaleDegreeQuiz;