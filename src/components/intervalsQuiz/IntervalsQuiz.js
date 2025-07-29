import React, { useState, useEffect, useMemo } from 'react';
import { useTools } from '../../context/ToolsContext';
import InfoModal from '../common/InfoModal';
import InfoButton from '../common/InfoButton';
import { useIntervalsQuiz, ACCIDENTALS, NOTE_LETTERS, intervalData } from './useIntervalsQuiz';

// Reusable UI components
const CollapsibleSection = ({ title, isOpen, onToggle, children }) => (
    <div className="border-t border-slate-600/80 pt-3 mt-3">
        <button onClick={onToggle} className="w-full flex justify-between items-center text-left text-lg font-bold text-teal-300 hover:text-teal-200">
            <span>{title}</span><span className="text-xl">{isOpen ? '−' : '+'}</span>
        </button>
        {isOpen && <div className="pt-4 space-y-4">{children}</div>}
    </div>
);

const AnswerButton = ({ value, type, selectedValue, onClick, isDisabled, children }) => {
    const isSelected = selectedValue === value;
    const buttonClass = 'bg-teal-600 hover:bg-teal-500';
    const selectedClass = 'bg-indigo-600 text-white';
    return (
        <button onClick={() => onClick(type, value)} disabled={isDisabled} className={`p-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isSelected ? selectedClass : buttonClass}`}>{children || value}</button>
    );
};

const IntervalsQuiz = () => {
    // Get all necessary functions from the context, including for presets
    const { addLogEntry, fretboardVolume, setFretboardVolume, savePreset, presetToLoad, clearPresetToLoad } = useTools();

    const allIntervalNames = useMemo(() => intervalData.map(i => i.name), []);
    
    // All configurable options are now in a single 'settings' state object
    const [settings, setSettings] = useState({
        quizMode: 'mixed',
        rootNoteType: 'chromatic',
        direction: 'both',
        autoAdvance: true,
        playAudio: true,
        audioDirection: 'above',
        selectedIntervals: allIntervalNames.reduce((acc, name) => ({ ...acc, [name]: true }), {}),
    });

    // Local state for the volume slider UI to prevent lag
    const [localVolume, setLocalVolume] = useState(fretboardVolume);
    const [isControlsOpen, setIsControlsOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [openControlSections, setOpenControlSections] = useState({ quiz: true, selection: true, preset: true });

    // This useEffect loads a preset when one is selected from the Presets tool
    useEffect(() => {
        if (presetToLoad && presetToLoad.gameId === 'intervals-quiz') {
            const { fretboardVolume: loadedVolume, ...loadedSettings } = presetToLoad.settings;
            setSettings(loadedSettings);
            if (loadedVolume !== undefined) {
                setFretboardVolume(loadedVolume);
                setLocalVolume(loadedVolume);
            }
            clearPresetToLoad();
        }
    }, [presetToLoad, clearPresetToLoad, setFretboardVolume]);

    const { 
        feedback, score, answerChecked, currentQuestion, userAnswer, setUserAnswer, 
        history, reviewIndex, setReviewIndex, handleReviewNav, startReview,
        checkAnswer, generateNewQuestion,
        replayAudioForHistoryItem
    } = useIntervalsQuiz(settings, settings.playAudio, settings.audioDirection);
    
    const isReviewing = reviewIndex !== null;
    
    // Generic handler to update any setting
    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleAnswerSelect = (type, value) => !answerChecked && !isReviewing && setUserAnswer(prev => ({ ...prev, [type]: value }));
    
    useEffect(() => {
        setLocalVolume(fretboardVolume);
    }, [fretboardVolume]);

    useEffect(() => {
        const handleKeyDown = (event) => { 
            if (isReviewing) return;
            if (event.key === 'Enter') { 
                if (answerChecked && !settings.autoAdvance) generateNewQuestion();
                else if (!answerChecked) checkAnswer();
            } 
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [answerChecked, checkAnswer, generateNewQuestion, settings.autoAdvance, isReviewing]);

    const handleLogProgress = () => {
        const remarks = prompt("Enter any remarks for this session:", `Score: ${score}/${history.length}`);
        if (remarks !== null) { addLogEntry({ game: 'Interval Practice Quiz', date: new Date().toLocaleDateString(), remarks }); alert("Session logged!"); }
    };
    
    // This function creates and saves the preset object
    const handleSavePreset = () => {
        const name = prompt("Enter a name for your preset:", "Intervals Quiz Setting");
        if (name && name.trim() !== "") {
            const newPreset = {
                id: Date.now().toString(),
                name: name.trim(),
                gameId: 'intervals-quiz',
                gameName: 'Interval Practice',
                settings: {
                    ...settings,
                    fretboardVolume: fretboardVolume // Save the current global volume
                },
            };
            savePreset(newPreset);
            alert(`Preset "${name.trim()}" saved!`);
        }
    };

    const handleIntervalSelection = (name) => {
        setSettings(prev => ({
            ...prev,
            selectedIntervals: { ...prev.selectedIntervals, [name]: !prev.selectedIntervals[name] }
        }));
    };

    const handleQuickSelect = (quality) => {
        const newSelection = { ...settings.selectedIntervals };
        intervalData.forEach(i => {
            if (i.quality === quality) newSelection[i.name] = !newSelection[i.name];
        });
        handleSettingChange('selectedIntervals', newSelection);
    };

    const handleSelectAll = (select) => {
        const newSelection = {};
        allIntervalNames.forEach(name => { newSelection[name] = select; });
        handleSettingChange('selectedIntervals', newSelection);
    };
    
    const itemToDisplay = isReviewing ? history[reviewIndex] : { question: currentQuestion, userAnswer };
    
    const renderQuestion = () => {
        const question = itemToDisplay?.question;
        if (!question) return <div className="text-2xl font-semibold text-gray-400">Loading...</div>;
        if (question.type === 'error') return <div className="text-2xl font-semibold text-red-400">{question.text}</div>;
        
        if (question.mode === 'nameTheNote') {
            return <>
                <div className="text-5xl font-bold text-teal-300 mb-4">{question.rootNote}</div>
                <div className="text-2xl font-semibold text-gray-400">
                    What is the {question.intervalName}{question.direction && ` ${question.direction}`}?
                </div>
            </>;
        }
        if (question.mode === 'nameTheInterval') {
            return <div className="flex justify-center items-center gap-5">
                <div className="text-6xl font-bold text-teal-300 p-4 bg-slate-700 rounded-lg w-36">{question.note1}</div>
                <div className="text-6xl font-bold text-teal-300 p-4 bg-slate-700 rounded-lg w-36">{question.note2}</div>
            </div>;
        }
    };

    const renderAnswerArea = () => {
        const question = itemToDisplay?.question;
        const answer = itemToDisplay?.userAnswer;
        if (!question || question.type === 'error') return null;

        const isDisabled = answerChecked || isReviewing;

        if (question.mode === 'nameTheNote') {
            return <>
                <div><h3 className="text-lg font-semibold text-gray-400 mb-2">Note</h3><div className="grid grid-cols-7 gap-1">{NOTE_LETTERS.map(note => <AnswerButton key={note} value={note} type="noteLetter" selectedValue={answer.noteLetter} onClick={handleAnswerSelect} isDisabled={isDisabled} />)}</div></div>
                <div><h3 className="text-lg font-semibold text-gray-400 mb-2">Accidental</h3><div className="grid grid-cols-5 gap-1">{ACCIDENTALS.map(acc => <AnswerButton key={acc.id} value={acc.id === 'natural' ? '' : acc.id} type="accidental" selectedValue={answer.accidental} onClick={handleAnswerSelect} isDisabled={isDisabled}>{acc.display}</AnswerButton>)}</div></div>
            </>;
        }
        if (question.mode === 'nameTheInterval') {
            const qualities = ['Diminished', 'Minor', 'Perfect', 'Major', 'Augmented'];
            const numbers = ['Unison / Octave', '2nd', '3rd', '4th', '5th', '6th', '7th'];
            return <div className="grid grid-cols-2 gap-6">
                <div><h3 className="text-lg font-semibold text-gray-400 mb-3">Quality</h3><div className="flex flex-col gap-2">{qualities.map(q => <AnswerButton key={q} value={q} type="quality" selectedValue={answer.quality} onClick={handleAnswerSelect} isDisabled={isDisabled}/>)}</div></div>
                <div><h3 className="text-lg font-semibold text-gray-400 mb-3">Number</h3><div className="grid grid-cols-2 gap-2">{numbers.map(n => <AnswerButton key={n} value={n} type="number" selectedValue={answer.number} onClick={handleAnswerSelect} isDisabled={isDisabled}/>)}</div></div>
            </div>;
        }
    };

    const renderReviewFeedback = () => {
        if (!isReviewing) return null;
        const { question, userAnswer, wasCorrect } = itemToDisplay;
        let userAnswerText, correctAnswerText;

        if (question.mode === 'nameTheNote') {
            userAnswerText = `${userAnswer.noteLetter || '?'}${userAnswer.accidental ?? ''}`;
            correctAnswerText = question.correctAnswer.note;
        } else {
            userAnswerText = `${userAnswer.quality || '?'} ${userAnswer.number || '?'}`;
            correctAnswerText = `${question.correctAnswer.quality} ${question.correctAnswer.number}`;
        }

        return (
            <div className={`text-center p-3 rounded-lg ${wasCorrect ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                <p className="font-bold text-gray-200">Correct Answer: <span className="text-teal-300 font-semibold">{correctAnswerText}</span></p>
                {!wasCorrect && <p className="mt-1"><span className="font-bold text-gray-300">Your Answer:</span> <span className="text-red-400 font-semibold">{userAnswerText}</span></p>}
            </div>
        );
    };
    
    const ControlsContent = () => (
        <div className="space-y-6">
            <CollapsibleSection title="Quiz Options" isOpen={openControlSections.quiz} onToggle={() => setOpenControlSections(s => ({...s, quiz: !s.quiz}))}>
                 <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-lg text-teal-300 mb-2">Quiz Mode</h4>
                        <div className="flex bg-slate-600 rounded-md p-1">
                            <button onClick={() => handleSettingChange('quizMode', 'nameTheInterval')} className={`flex-1 rounded-md text-sm py-1 ${settings.quizMode === 'nameTheInterval' ? 'bg-blue-600 text-white' : ''}`}>Name Interval</button>
                            <button onClick={() => handleSettingChange('quizMode', 'nameTheNote')} className={`flex-1 rounded-md text-sm py-1 ${settings.quizMode === 'nameTheNote' ? 'bg-blue-600 text-white' : ''}`}>Name Note</button>
                            <button onClick={() => handleSettingChange('quizMode', 'mixed')} className={`flex-1 rounded-md text-sm py-1 ${settings.quizMode === 'mixed' ? 'bg-blue-600 text-white' : ''}`}>Mixed</button>
                        </div>
                    </div>

                    {(settings.quizMode === 'nameTheNote' || settings.quizMode === 'mixed') && (
                        <div className="p-3 bg-slate-900/50 rounded-lg space-y-3">
                            <h5 className="font-bold text-base text-teal-300 border-b border-slate-600 pb-1">"Name the Note" Settings</h5>
                            <div>
                                <h4 className="font-semibold">Root Notes</h4>
                                <div className="flex gap-4 p-2">
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="rootType" value="natural" checked={settings.rootNoteType === 'natural'} onChange={() => handleSettingChange('rootNoteType', 'natural')} />Natural</label>
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="rootType" value="chromatic" checked={settings.rootNoteType === 'chromatic'} onChange={() => handleSettingChange('rootNoteType', 'chromatic')} />Chromatic</label>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold">Question Direction</h4>
                                <div className="flex bg-slate-600 rounded-md p-1 mt-1">
                                    <button onClick={() => handleSettingChange('direction', 'above')} className={`flex-1 rounded-md text-sm py-1 ${settings.direction === 'above' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Ascending</button>
                                    <button onClick={() => handleSettingChange('direction', 'below')} className={`flex-1 rounded-md text-sm py-1 ${settings.direction === 'below' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Descending</button>
                                    <button onClick={() => handleSettingChange('direction', 'both')} className={`flex-1 rounded-md text-sm py-1 ${settings.direction === 'both' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Both</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {(settings.quizMode === 'nameTheInterval' || settings.quizMode === 'mixed') && (
                        <div className="p-3 bg-slate-900/50 rounded-lg space-y-3">
                            <h5 className="font-bold text-base text-teal-300 border-b border-slate-600 pb-1">"Name the Interval" Settings</h5>
                            <div>
                                <h4 className="font-semibold">Audio Playback Direction</h4>
                                <div className="flex bg-slate-600 rounded-md p-1 mt-1">
                                    <button onClick={() => handleSettingChange('audioDirection', 'above')} className={`flex-1 rounded-md text-sm py-1 ${settings.audioDirection === 'above' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Ascending</button>
                                    <button onClick={() => handleSettingChange('audioDirection', 'below')} className={`flex-1 rounded-md text-sm py-1 ${settings.audioDirection === 'below' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Descending</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label htmlFor="interval-audio-volume" className="font-semibold text-lg text-teal-300 mb-2 block">Audio Volume</label>
                        <input
                            type="range"
                            id="interval-audio-volume"
                            min="-30"
                            max="0"
                            value={localVolume}
                            onChange={(e) => setLocalVolume(Number(e.target.value))}
                            onMouseUp={() => setFretboardVolume(localVolume)}
                            onKeyUp={() => setFretboardVolume(localVolume)}
                            className="w-full h-3 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                 </div>
            </CollapsibleSection>
            <CollapsibleSection title="Interval Selection" isOpen={openControlSections.selection} onToggle={() => setOpenControlSections(s => ({...s, selection: !s.selection}))}>
                <div className="flex flex-wrap justify-start gap-2 mb-4">
                    <h4 className="text-lg font-semibold text-blue-200 w-full">Quick Select</h4>
                    <button onClick={() => handleQuickSelect('Major')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1 px-3 text-sm rounded-lg">Toggle Major</button>
                    <button onClick={() => handleQuickSelect('Minor')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1 px-3 text-sm rounded-lg">Toggle Minor</button>
                    <button onClick={() => handleQuickSelect('Perfect')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1 px-3 text-sm rounded-lg">Toggle Perfect</button>
                    <button onClick={() => handleSelectAll(true)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 text-sm rounded-lg">Select All</button>
                    <button onClick={() => handleSelectAll(false)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 text-sm rounded-lg">Deselect All</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {Object.entries(useMemo(() => intervalData.reduce((acc, i) => {
                        const group = i.number.includes('Unison') || i.number.includes('Octave') ? 'Unison/Octave' : `${i.number}s`;
                        if (!acc[group]) acc[group] = [];
                        acc[group].push(i);
                        return acc;
                    }, {}), [])).map(([groupName, intervals]) => (
                        <div key={groupName} className="break-inside-avoid">
                            <h5 className="font-bold text-base text-teal-300 mb-2 border-b border-slate-600 pb-1">{groupName}</h5>
                            <div className="flex flex-col gap-3">{intervals.map(interval => (
                                <label key={interval.name} className="flex items-center justify-between text-gray-200 cursor-pointer">
                                    <span className="text-sm">{interval.name}</span>
                                    <div className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={!!settings.selectedIntervals[interval.name]} onChange={() => handleIntervalSelection(interval.name)} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </div>
                                </label>
                            ))}</div>
                        </div>
                    ))}
                </div>
            </CollapsibleSection>
            {/* The new "Save Preset" button is added here */}
            <div className="border-t border-slate-600 pt-4 mt-4">
                <button onClick={handleSavePreset} className="w-full py-2 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white">
                    Save Preset
                </button>
            </div>
        </div>
    );
    
    return (
        <div className="flex flex-col md:flex-row items-start w-full gap-4">
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Interval Practice Quiz Guide">
                <p>This module tests your knowledge of intervals in two ways: identifying an interval from two notes, or identifying a note from a root and an interval.</p>
                <p className="mt-2">Enable the <b>Play Audio</b> toggle to hear the interval played using natural guitar sounds after you answer.</p>
                <p>Use the "Controls" panel to select the quiz mode and other options, including audio volume and playback direction for the "Name Interval" mode.</p>
            </InfoModal>

            <div className="w-full flex-1 bg-slate-800 p-4 md:p-8 rounded-lg">
                <div className="flex justify-between items-center mb-4"><div className="flex items-center gap-3"><h1 className="text-3xl font-extrabold text-indigo-300">Intervals Quiz</h1><InfoButton onClick={() => setIsInfoModalOpen(true)} /></div><div className="flex items-center gap-2"><button onClick={handleLogProgress} className="bg-green-600 hover:bg-green-500 text-white font-bold py-1 px-3 rounded-lg text-sm">Log</button><button onClick={() => setIsControlsOpen(p => !p)} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-sm font-semibold">Controls</button></div></div>
                <div className="flex justify-between items-center mb-4 text-lg">
                    <span className="font-semibold text-gray-300">Score: {score} / {history.length}</span>
                    <div className="flex items-center gap-4">
                        {history.length > 0 && <button onClick={startReview} disabled={isReviewing} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded-lg text-sm disabled:opacity-50">Review</button>}
                        <label className="flex items-center gap-2 cursor-pointer font-semibold">
                            <span>Play Audio</span>
                            <div className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={settings.playAudio} onChange={() => handleSettingChange('playAudio', !settings.playAudio)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-500 rounded-full peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></div>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer font-semibold">
                            <span>Auto-Advance</span>
                            <div className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={settings.autoAdvance} onChange={() => handleSettingChange('autoAdvance', !settings.autoAdvance)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-500 rounded-full peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></div>
                        </label>
                    </div>
                </div>
                
                <div className="text-center w-full max-w-2xl mx-auto my-6 min-h-[120px] flex flex-col items-center justify-center">{renderQuestion()}</div>
                <div className={`my-4 min-h-[60px] flex flex-col justify-center`}>{isReviewing ? renderReviewFeedback() : <p className={`text-lg font-bold text-center ${feedback.type === 'correct' ? 'text-green-400' : 'text-red-400'}`}>{feedback.message || <>&nbsp;</>}</p>}</div>
                
                <div className="w-full max-w-lg mx-auto space-y-4">{renderAnswerArea()}</div>

                <div className="h-20 mt-4 flex justify-center items-center">
                    {isReviewing ? (
                        <div className="flex items-center justify-center gap-4 w-full">
                            <button onClick={() => handleReviewNav(-1)} disabled={reviewIndex === 0} className="bg-slate-600 hover:bg-slate-500 font-bold p-3 rounded-lg disabled:opacity-50">Prev</button>
                            <div className="flex flex-col gap-2 flex-grow max-w-xs">
                                <button onClick={() => setReviewIndex(null)} className="bg-purple-600 hover:bg-purple-500 font-bold p-3 rounded-lg text-xl">Return to Quiz</button>
                                <button onClick={() => replayAudioForHistoryItem(reviewIndex)} className="bg-sky-600 hover:bg-sky-500 text-sm p-2 rounded-lg font-semibold">Replay Audio</button>
                            </div>
                            <button onClick={() => handleReviewNav(1)} disabled={reviewIndex === history.length - 1} className="bg-slate-600 hover:bg-slate-500 font-bold p-3 rounded-lg disabled:opacity-50">Next</button>
                        </div>
                    ) : !settings.autoAdvance && !answerChecked ? (
                        <button onClick={checkAnswer} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg">Submit</button>
                    ) : !settings.autoAdvance && answerChecked ? (
                        <button onClick={generateNewQuestion} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg animate-pulse">Next</button>
                    ) : null}
                </div>
            </div>
            
            <div className={`hidden md:block bg-slate-700 rounded-lg transition-all duration-300 ease-in-out ${isControlsOpen ? 'w-96 p-4' : 'w-0 p-0 overflow-hidden'}`}>
                <div className={`${!isControlsOpen && 'hidden'}`}>
                    <h3 className="text-xl font-bold text-teal-300 mb-4">Settings & Controls</h3>
                    <ControlsContent />
                </div>
            </div>
            {isControlsOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex justify-center items-center bg-black/60" onClick={() => setIsControlsOpen(false)}>
                    <div className="w-11/12 max-w-sm bg-slate-800 rounded-2xl p-4 max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex-shrink-0 flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-teal-300">Settings & Controls</h3>
                            <button onClick={() => setIsControlsOpen(false)} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
                        </div>
                        <div className="flex-grow overflow-y-auto pr-2">
                            <ControlsContent />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IntervalsQuiz;