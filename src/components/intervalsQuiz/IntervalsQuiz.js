import React, { useState, useEffect, useMemo } from 'react';
import { useTools } from '../../context/ToolsContext';
import InfoModal from '../common/InfoModal';
import QuizLayout from '../common/QuizLayout';
import { useIntervalsQuiz, ACCIDENTALS, NOTE_LETTERS, intervalData } from './useIntervalsQuiz';
import { IntervalsQuizControls } from './IntervalsQuizControls';

// A small, local component for answer buttons
const AnswerButton = ({ value, type, selectedValue, onClick, isDisabled, children }) => {
    const isSelected = selectedValue === value;
    return (
        <button onClick={() => onClick(type, value)} disabled={isDisabled} className={`p-3 rounded-lg font-semibold transition-colors disabled:opacity-50 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-teal-600 hover:bg-teal-500'}`}>{children || value}</button>
    );
};

const IntervalsQuiz = ({ onProgressUpdate }) => {
    const { addLogEntry, fretboardVolume, setFretboardVolume, savePreset, presetToLoad, clearPresetToLoad } = useTools();

    
    // Consolidated settings state object
    const allIntervalNames = useMemo(() => intervalData.map(i => i.name), []);
    const [settings, setSettings] = useState({
        quizMode: 'mixed',
        rootNoteType: 'chromatic',
        direction: 'both',
        autoAdvance: true,
        playAudio: true,
        selectedIntervals: allIntervalNames.reduce((acc, name) => ({ ...acc, [name]: true }), {}),
    });
    
    // Non-preset related state
    const [audioDirection, setAudioDirection] = useState('above');
    const [isControlsOpen, setIsControlsOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [openControlSections, setOpenControlSections] = useState({ quiz: true, selection: true });
    const [localVolume, setLocalVolume] = useState(fretboardVolume);

    // Load Preset Effect
    useEffect(() => {
        if (presetToLoad && presetToLoad.gameId === 'intervals-quiz') {
            const { fretboardVolume: presetVolume, audioDirection: presetAudioDirection, ...presetSettings } = presetToLoad.settings;
            setSettings(presetSettings);
            if (presetAudioDirection) setAudioDirection(presetAudioDirection);
            if (presetVolume !== undefined) {
                setFretboardVolume(presetVolume);
                setLocalVolume(presetVolume);
            }
            clearPresetToLoad();
        }
    }, [presetToLoad, clearPresetToLoad, setFretboardVolume]);
    
    // Sync local slider with global volume
    useEffect(() => { setLocalVolume(fretboardVolume); }, [fretboardVolume]);

    const { 
        feedback, score, answerChecked, currentQuestion, userAnswer, setUserAnswer, 
        history, reviewIndex, setReviewIndex, handleReviewNav, startReview,
        checkAnswer, generateNewQuestion,
        replayAudioForHistoryItem
    } = useIntervalsQuiz(settings, settings.playAudio, audioDirection, onProgressUpdate);
    
    const isReviewing = reviewIndex !== null;
    
    const handleSettingChange = (key, value) => setSettings(prev => ({...prev, [key]: value}));
    const handleAnswerSelect = (type, value) => !answerChecked && !isReviewing && setUserAnswer(prev => ({ ...prev, [type]: value }));
    
    useEffect(() => {
        const handleKeyDown = (event) => { 
    const targetTagName = event.target.tagName.toLowerCase();
    if (targetTagName === 'input' || targetTagName === 'textarea' || targetTagName === 'select') {
        return;
    }

    if (isReviewing || event.key !== 'Enter') return;

    if (!answerChecked) {
        event.preventDefault();
        checkAnswer();
    } 
};
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [answerChecked, checkAnswer, isReviewing]);

    // NEW: This useEffect handles "Enter to continue" after a mistake
    useEffect(() => {
        const handleKeyDown = (event) => {
    const targetTagName = event.target.tagName.toLowerCase();
    if (targetTagName === 'input' || targetTagName === 'textarea' || targetTagName === 'select') {
        return;
    }

    const wasCorrect = history.length > 0 ? history[history.length - 1].wasCorrect : true;
    if (event.key === 'Enter' && answerChecked && (!settings.autoAdvance || !wasCorrect)) {
        event.preventDefault();
        generateNewQuestion();
    }
};
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [answerChecked, settings.autoAdvance, history, generateNewQuestion]);
    const handleLogProgress = () => {
        const remarks = prompt("Enter any remarks for this session:", `Score: ${score}/${history.length}`);
        if (remarks !== null) { addLogEntry({ game: 'Interval Practice Quiz', date: new Date().toLocaleDateString(), remarks }); alert("Session logged!"); }
    };
    
    const handleSavePreset = () => {
        const name = prompt("Enter a name for your preset:", `Intervals - ${settings.quizMode}`);
        if (name && name.trim() !== "") {
            savePreset({
                id: Date.now().toString(), name: name.trim(),
                gameId: 'intervals-quiz', gameName: 'Interval Practice',
                settings: { ...settings, audioDirection, fretboardVolume }
            });
            alert(`Preset "${name.trim()}" saved!`);
        }
    };

    const handleSelectionChange = (name) => handleSettingChange('selectedIntervals', { ...settings.selectedIntervals, [name]: !settings.selectedIntervals[name] });
    const handleQuickSelect = (quality) => { 
        const newSelection = { ...settings.selectedIntervals }; 
        intervalData.forEach(i => { if (i.quality === quality) newSelection[i.name] = !newSelection[i.name]; }); 
        handleSettingChange('selectedIntervals', newSelection);
    };
    const handleSelectAll = (select) => { 
        const newSelection = {}; 
        allIntervalNames.forEach(name => { newSelection[name] = select; }); 
        handleSettingChange('selectedIntervals', newSelection);
    };
    
    const itemToDisplay = isReviewing ? history[reviewIndex] : { question: currentQuestion, userAnswer };

    // --- HELPER RENDER FUNCTIONS (Restored) ---
    
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

    // --- JSX FOR LAYOUT SLOTS ---
    
    const topControlsContent = (
        <>
            <label className="flex items-center gap-2 cursor-pointer font-semibold">
                <span>Play Audio</span>
                <div className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={settings.playAudio} onChange={() => handleSettingChange('playAudio', !settings.playAudio)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-500 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </div>
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-semibold">
                <span>Auto-Advance</span>
                <div className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={settings.autoAdvance} onChange={() => handleSettingChange('autoAdvance', !settings.autoAdvance)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-500 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </div>
            </label>
        </>
    );

     const wasCorrect = history.length > 0 ? history[history.length - 1].wasCorrect : true;
   
     const footerContent = isReviewing ? (
        <div className="flex items-center justify-center gap-4 w-full">
            <button onClick={() => handleReviewNav(-1)} disabled={reviewIndex === 0} className="bg-slate-600 hover:bg-slate-500 font-bold p-3 rounded-lg disabled:opacity-50">Prev</button>
            <div className="flex flex-col gap-2 flex-grow max-w-xs">
                <button onClick={() => setReviewIndex(null)} className="bg-purple-600 hover:bg-purple-500 font-bold p-3 rounded-lg text-xl">Return to Quiz</button>
                {/* This new button uses the function */}
                <button onClick={() => replayAudioForHistoryItem(reviewIndex)} className="bg-sky-600 hover:bg-sky-500 text-sm p-2 rounded-lg font-semibold">Replay Audio</button>
            </div>
            <button onClick={() => handleReviewNav(1)} disabled={reviewIndex === history.length - 1} className="bg-slate-600 hover:bg-slate-500 font-bold p-3 rounded-lg disabled:opacity-50">Next</button>
        </div>
    ) : answerChecked && (!settings.autoAdvance || !wasCorrect) ? (
        <button onClick={generateNewQuestion} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg animate-pulse">Next Question</button>
    ) : !answerChecked ? (
        <button onClick={checkAnswer} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg">Submit</button>
    ) : null;
    
    return (
        <div className="flex flex-col md:flex-row items-start w-full gap-4">
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Interval Practice Quiz Guide">
                <p>This module tests your knowledge of intervals in two ways: identifying an interval from two notes, or identifying a note from a root and an interval.</p>
                <p className="mt-2">Enable the <b>Play Audio</b> toggle to hear the interval played using natural guitar sounds after you answer.</p>
                <p>Use the "Controls" panel to select the quiz mode and other options, including audio volume and playback direction for the "Name Interval" mode.</p>
            </InfoModal>

            <QuizLayout
                title="Interval Practice"
                score={score}
                totalAsked={history.length}
                history={history}
                isReviewing={isReviewing}
                onStartReview={startReview}
                topControls={topControlsContent}
                footerContent={footerContent}
                onLogProgress={handleLogProgress}
                onToggleControls={() => setIsControlsOpen(p => !p)}
                onShowInfo={() => setIsInfoModalOpen(true)}
            >
                <div className="text-center w-full max-w-2xl mx-auto my-6 min-h-[120px] flex flex-col items-center justify-center">{renderQuestion()}</div>
                <div className={`my-4 min-h-[60px] flex flex-col justify-center`}>{isReviewing ? renderReviewFeedback() : <p className={`text-lg font-bold text-center ${feedback.type === 'correct' ? 'text-green-400' : 'text-red-400'}`}>{feedback.message || <>&nbsp;</>}</p>}</div>
                <div className="w-full max-w-lg mx-auto space-y-4">{renderAnswerArea()}</div>
            </QuizLayout>
            
            <div className={`hidden md:block bg-slate-700 rounded-lg transition-all duration-300 ease-in-out ${isControlsOpen ? 'w-96 p-4' : 'w-0 p-0 overflow-hidden'}`}>
                <div className={`${!isControlsOpen && 'hidden'}`}>
                    <h3 className="text-xl font-bold text-teal-300 mb-4">Settings & Controls</h3>
                    <IntervalsQuizControls
                        settings={settings}
                        onSettingChange={handleSettingChange}
                        audioDirection={audioDirection}
                        onAudioDirectionChange={setAudioDirection}
                        localVolume={localVolume}
                        onLocalVolumeChange={setLocalVolume}
                        onVolumeSet={() => setFretboardVolume(localVolume)}
                        onIntervalSelectionChange={handleSelectionChange}
                        onQuickSelect={handleQuickSelect}
                        onSelectAll={handleSelectAll}
                        onSavePreset={handleSavePreset}
                        openControlSections={openControlSections}
                        onToggleSection={(section) => setOpenControlSections(s => ({...s, [section]: !s[section]}))}
                    />
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
                           <IntervalsQuizControls
                                settings={settings}
                                onSettingChange={handleSettingChange}
                                audioDirection={audioDirection}
                                onAudioDirectionChange={setAudioDirection}
                                localVolume={localVolume}
                                onLocalVolumeChange={setLocalVolume}
                                onVolumeSet={() => setFretboardVolume(localVolume)}
                                onIntervalSelectionChange={handleSelectionChange}
                                onQuickSelect={handleQuickSelect}
                                onSelectAll={handleSelectAll}
                                onSavePreset={handleSavePreset}
                                openControlSections={openControlSections}
                                onToggleSection={(section) => setOpenControlSections(s => ({...s, [section]: !s[section]}))}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IntervalsQuiz;