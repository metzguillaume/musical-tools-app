import React, { useState, useEffect } from 'react';
import { useTools } from '../../context/ToolsContext';
import { useIntervalEarTrainer } from './useIntervalEarTrainer';
import InfoModal from '../common/InfoModal';
import QuizLayout from '../common/QuizLayout';
import { IntervalEarTrainerControls } from './IntervalEarTrainerControls';
import { SEMITONE_TO_DEGREE } from '../../utils/musicTheory';

// Determines whether to show sharp or flat notes based on the musical key.
const getNoteNamesForKey = (key) => {
    const sharpKeys = ['G', 'D', 'A', 'E', 'B', 'F#', 'C'];
    const useSharps = sharpKeys.includes(key);

    if (useSharps) {
        return ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
    } else {
        return ['A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab'];
    }
};

const IntervalEarTrainer = () => {
    const { addLogEntry, savePreset, presetToLoad, clearPresetToLoad } = useTools();
    const [settings, setSettings] = useState({
        autoAdvance: true,
        isTrainingMode: false,
        playbackStyle: 'Melodic',
        direction: 'Ascending',
        notePool: 'Diatonic',
        diatonicMode: 'Major',
        answerMode: 'Interval Name',
        rootNoteMode: 'Fixed',
        fixedKey: 'C',
        questionsPerRoot: 5,
        octaveRange: 2,
        useDrone: false,
        playRootNote: true,
        showKeyChange: false,
    });
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isControlsOpen, setIsControlsOpen] = useState(false);
    const [selectedNotes, setSelectedNotes] = useState([]);

    const {
        score, totalAsked, feedback, isAnswered, currentQuestion, history, reviewIndex, setReviewIndex,
        generateNewQuestion, checkAnswer, handleReviewNav, startReview, playQuestionAudio, ALL_INTERVALS,
        diatonicOptions, newKeyNotification, currentKey
    } = useIntervalEarTrainer(settings);

    useEffect(() => {
        if (presetToLoad && presetToLoad.gameId === 'interval-ear-trainer') {
            setSettings(presetToLoad.settings);
            clearPresetToLoad();
        }
    }, [presetToLoad, clearPresetToLoad]);

    const isReviewing = reviewIndex !== null;

    useEffect(() => {
        if (currentQuestion) setSelectedNotes([]);
        if (currentQuestion && !isAnswered && !isReviewing) {
            const delay = (newKeyNotification && settings.rootNoteMode === 'Roving' && settings.useDrone) ? 3000 : 500;
            const timer = setTimeout(() => playQuestionAudio(), delay);
            return () => clearTimeout(timer);
        }
    }, [currentQuestion, isAnswered, isReviewing, playQuestionAudio, newKeyNotification, settings.rootNoteMode, settings.useDrone]);
    
    // THIS REDUNDANT useEffect WAS THE SOURCE OF THE DRONE BUG AND HAS BEEN REMOVED.
    // The useIntervalEarTrainer hook now correctly handles all drone note updates.

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({...prev, [key]: value}));
    };

    const handleLogProgress = () => {
        const remarks = prompt("Enter any remarks for this session:", `Score: ${score}/${totalAsked}`);
        if (remarks !== null) { addLogEntry({ game: 'Interval Ear Trainer', date: new Date().toLocaleDateString(), remarks }); alert("Session logged!"); }
    };

    const generatePresetName = (currentSettings) => {
        const parts = [];
        parts.push(currentSettings.notePool === 'Diatonic' ? `${currentSettings.diatonicMode}` : 'Chromatic');
        parts.push(currentSettings.rootNoteMode === 'Fixed' ? `${currentSettings.fixedKey}` : 'Roving');
        parts.push(currentSettings.playbackStyle);
        if(currentSettings.playbackStyle === 'Melodic') {
            parts.push(currentSettings.direction.slice(0, 4));
        }
        return parts.join(' ');
    };

    const handleSavePreset = () => {
        const suggestedName = generatePresetName(settings);
        const name = prompt("Enter a name for your preset:", suggestedName);
        if (name && name.trim() !== "") {
            savePreset({
                id: Date.now().toString(),
                name: name.trim(),
                gameId: 'interval-ear-trainer',
                gameName: 'Interval Recognition',
                settings: settings,
            });
            alert(`Preset "${name.trim()}" saved!`);
        }
    };

    const itemToDisplay = isReviewing ? history[reviewIndex] : null;
    const questionForDisplay = isReviewing ? itemToDisplay?.question : currentQuestion;
    const buttonsDisabled = isAnswered || isReviewing;
    
    const AnswerButtons = () => {
        const isDiatonic = settings.notePool === 'Diatonic';
        if (settings.answerMode === 'Scale Degree') {
            const degrees = Object.values(SEMITONE_TO_DEGREE);
            return (
                <div className="w-full grid grid-cols-4 md:grid-cols-6 gap-2">
                    {degrees.map(degree => {
                        const isDisabled = buttonsDisabled || (isDiatonic && !diatonicOptions.degrees.includes(degree));
                        return <button key={degree} onClick={() => checkAnswer(degree)} disabled={isDisabled} className={`py-3 rounded-lg font-mono text-lg transition-colors disabled:opacity-30 ${'bg-teal-600 hover:bg-teal-500'}`}>{degree}</button>
                    })}
                </div>
            );
        }
        if (settings.answerMode === 'Note Names') {
            const noteNameOptions = getNoteNamesForKey(currentKey);
            const handleNoteNameSelect = (note) => {
                if (buttonsDisabled) return;
                setSelectedNotes(prev => prev.includes(note) ? prev.filter(n => n !== note) : [...prev, note].slice(0, 2));
            };
            return (
                <div className="w-full flex flex-col items-center gap-2">
                    <p className="text-sm text-gray-400">Select the two notes you heard. (Octaves are excluded in this mode)</p>
                    <div className="grid grid-cols-6 gap-1 w-full">
                        {noteNameOptions.map(note => <button key={note} onClick={() => handleNoteNameSelect(note)} disabled={buttonsDisabled} className={`py-3 rounded-md font-semibold ${selectedNotes.includes(note) ? 'bg-indigo-600 text-white' : 'bg-teal-600 hover:bg-teal-500'}`}>{note.replace('b','♭').replace('#','♯')}</button>)}
                    </div>
                    <div className="flex gap-2 mt-2">
                        <button onClick={() => setSelectedNotes([])} disabled={buttonsDisabled} className="py-2 px-4 rounded-md bg-gray-600 hover:bg-gray-500">Clear</button>
                        <button onClick={() => checkAnswer(selectedNotes)} disabled={buttonsDisabled || selectedNotes.length !== 2} className="py-2 px-4 rounded-md bg-blue-600 hover:bg-blue-500 disabled:bg-gray-500">Submit</button>
                    </div>
                </div>
            );
        }
        return (
            <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-2">
                {ALL_INTERVALS.map(interval => <button key={interval.name} onClick={() => checkAnswer(interval.name)} disabled={buttonsDisabled || (isDiatonic && !diatonicOptions.intervals.includes(interval.name))} className={`py-4 rounded-lg font-semibold text-lg transition-colors disabled:opacity-30 ${'bg-teal-600 hover:bg-teal-500'}`}>{interval.name}</button>)}
            </div>
        );
    };
    
    const renderCorrectAnswerForReview = (item) => {
        if (!item || !item.question) return '';
        switch(item.answerMode) {
            case 'Note Names': return item.question.answer.noteNames.join(', ');
            case 'Scale Degree': return item.question.answer.scaleDegree;
            case 'Interval Name':
            default: return item.question.answer.intervalName;
        }
    };

    const topControlsContent = (
        <label className="flex items-center gap-2 cursor-pointer font-semibold">
            <span>Auto-Advance</span>
            <div className="relative inline-flex items-center">
                <input type="checkbox" checked={settings.autoAdvance} onChange={(e) => handleSettingChange('autoAdvance', e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-500 rounded-full peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </div>
        </label>
    );

    const footerContent = isReviewing ? (
        <div className="flex items-center gap-4">
            <button type="button" onClick={() => handleReviewNav(-1)} disabled={reviewIndex === 0} className="p-3 rounded-lg bg-slate-600 hover:bg-slate-500">Prev</button>
            <button type="button" onClick={() => setReviewIndex(null)} className="bg-purple-600 p-3 rounded-lg font-bold">Return to Quiz</button>
            <button type="button" onClick={() => handleReviewNav(1)} disabled={reviewIndex === history.length - 1} className="p-3 rounded-lg bg-slate-600 hover:bg-slate-500">Next</button>
        </div>
    ) : (isAnswered && !settings.autoAdvance && settings.answerMode !== 'Note Names') ? (
        <button onClick={generateNewQuestion} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg animate-pulse">Next Question</button>
    ) : null;

    return (
        <div className="flex flex-col md:flex-row items-start w-full gap-4">
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Interval Recognition Guide">
                <div className="space-y-3 text-sm">
                    <p>Listen to the interval and select the correct answer. Use the controls panel to customize your practice session.</p>
                    <h4 className="font-bold text-indigo-300 mt-2">Core Features</h4>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                        <li><b>Training Mode:</b> Focuses on intervals you get wrong more often.</li>
                        <li><b>Playback:</b> Hear notes together (Harmonic) or one after another (Melodic), and in different directions.</li>
                        <li><b>Note Pool:</b> Practice with all notes (Chromatic) or within a Major/Minor key (Diatonic).</li>
                        <li><b>Key/Root:</b> Keep the starting key fixed, or have it rove to a new key after a set number of questions.</li>
                         <li><b>Drone Assist:</b> Use the drone to establish a key center. You can even turn off the first note of the interval to rely solely on the drone for your reference.</li>
                    </ul>
                </div>
            </InfoModal>

            <QuizLayout
                title="Interval Recognition"
                score={score}
                totalAsked={totalAsked}
                history={history}
                isReviewing={isReviewing}
                onStartReview={startReview}
                topControls={topControlsContent}
                footerContent={footerContent}
                onLogProgress={handleLogProgress}
                onToggleControls={() => setIsControlsOpen(p => !p)}
                onShowInfo={() => setIsInfoModalOpen(true)}
            >
                <div className="w-full max-w-2xl mx-auto flex flex-col items-center relative">
                    {newKeyNotification && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white text-2xl font-bold p-6 rounded-lg z-20 animate-pulse-once">{newKeyNotification}</div>}
                    
                    <div className="w-full bg-slate-900/50 p-4 rounded-lg text-center min-h-[80px] flex justify-center items-center flex-wrap gap-x-2 mb-4">
                        <button onClick={() => playQuestionAudio(questionForDisplay)} disabled={!isReviewing && isAnswered} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg text-xl disabled:opacity-50 disabled:cursor-not-allowed">Replay Sound</button>
                    </div>

                    <div className="text-xl my-4 min-h-[28px]">
                        {isReviewing ? (
                            itemToDisplay.wasCorrect ? 
                            <span className="text-green-400 font-semibold">Correct: {renderCorrectAnswerForReview(itemToDisplay)}</span> :
                            <span className="text-gray-300">Your Answer: <span className="text-red-400">{itemToDisplay.userAnswer}</span> | Correct: <span className="text-teal-300">{renderCorrectAnswerForReview(itemToDisplay)}</span></span>
                        ) : (
                            <span className={feedback.type === 'correct' ? 'text-green-400' : 'text-red-400'}>{feedback.message || <>&nbsp;</>}</span>
                        )}
                    </div>
                    
                    <AnswerButtons />
                </div>
            </QuizLayout>

            <div className={`hidden md:block bg-slate-700 rounded-lg transition-all duration-300 ${isControlsOpen ? 'w-80 p-4' : 'w-0 overflow-hidden'}`}>
                {isControlsOpen && <IntervalEarTrainerControls settings={settings} onSettingChange={handleSettingChange} onSavePreset={handleSavePreset} />}
            </div>
            
            {isControlsOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex justify-center items-center bg-black/60" onClick={() => setIsControlsOpen(false)}>
                    <div className="w-11/12 max-w-sm bg-slate-800 rounded-2xl p-4 overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-teal-300 mb-4">Settings & Controls</h3>
                        <IntervalEarTrainerControls settings={settings} onSettingChange={handleSettingChange} onSavePreset={handleSavePreset} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default IntervalEarTrainer;