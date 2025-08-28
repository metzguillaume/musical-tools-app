import React, { useState, useEffect } from 'react';
import { useTools } from '../../../context/ToolsContext';
import { useProgressionEarTrainer } from './useProgressionEarTrainer';
import InfoModal from '../../common/InfoModal';
import QuizLayout from '../../common/QuizLayout';
import { ProgressionEarTrainerControls } from './ProgressionEarTrainerControls';
import { getDiatonicChords } from '../../../utils/musicTheory';

// A sub-component for the unique answer input of this quiz
const AnswerInput = ({ userAnswer, setUserAnswer, currentQuestion, isAnswered }) => {
    if (!currentQuestion || !currentQuestion.progression) return null;

    const progressionLength = currentQuestion.progression.length;
    const diatonicChords = getDiatonicChords(currentQuestion.key, currentQuestion.keyType, 'Triads');

    const handleRomanClick = (roman) => {
        if (isAnswered || userAnswer.length >= progressionLength) return;
        setUserAnswer(prev => [...prev, roman]);
    };

    const handleBackspace = () => {
        if (isAnswered) return;
        setUserAnswer(prev => prev.slice(0, -1));
    };

    return (
        <div className="w-full max-w-lg mt-4 flex flex-col items-center">
            <div className="flex items-center justify-center gap-2 h-14 bg-slate-900/50 rounded-md px-4 w-full mb-4">
                <span className="flex-1 text-left font-mono text-xl text-gray-400">Your Answer:</span>
                <span className="font-mono text-2xl text-teal-300 tracking-wider">
                    {userAnswer.join(' - ')}
                </span>
            </div>
            <div className="grid grid-cols-4 gap-2 w-full">
                {diatonicChords.map(chord => (
                    <button 
                        key={chord.roman} 
                        onClick={() => handleRomanClick(chord.roman)}
                        disabled={isAnswered || userAnswer.length >= progressionLength}
                        className="py-4 bg-teal-600 hover:bg-teal-500 rounded-md text-xl font-semibold disabled:opacity-50"
                    >
                        {chord.roman}
                    </button>
                ))}
                <button 
                    onClick={handleBackspace} 
                    disabled={isAnswered || userAnswer.length === 0}
                    className="col-span-3 py-3 bg-yellow-600/80 hover:bg-yellow-700/80 rounded-md text-lg font-semibold disabled:opacity-50"
                >
                    Backspace
                </button>
            </div>
        </div>
    );
};


const ProgressionEarTrainer = ({ onProgressUpdate }) => {
    const { addLogEntry, savePreset, presetToLoad, clearPresetToLoad } = useTools();
    
    const [settings, setSettings] = useState({
        autoAdvance: true,
        keyType: 'Major',
        keyMode: 'Fixed',
        fixedKey: 'C',
        questionsPerKey: 3, // Added for the new feature
        chordFilter: 'All',
        excludeDiminished: true,
        startOnTonic: true,
        useDrone: true,
    });
    
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isControlsOpen, setIsControlsOpen] = useState(false);
    const [userAnswer, setUserAnswer] = useState([]);

    const {
        score, totalAsked, feedback, isAnswered, currentQuestion, history, reviewIndex, setReviewIndex,
        generateNewQuestion, checkAnswer, handleReviewNav, startReview, playQuestionAudio
    } = useProgressionEarTrainer(settings, onProgressUpdate);

    useEffect(() => {
        if (presetToLoad && presetToLoad.gameId === 'progression-ear-trainer') {
            setSettings(presetToLoad.settings);
            clearPresetToLoad();
        }
    }, [presetToLoad, clearPresetToLoad]);

    // Clear user answer for each new question
    useEffect(() => {
        setUserAnswer([]);
    }, [currentQuestion]);

    const isReviewing = reviewIndex !== null;

    useEffect(() => {
        if (currentQuestion && !currentQuestion.noOptions && !isAnswered && !isReviewing) {
            const timer = setTimeout(() => playQuestionAudio(), 500);
            return () => clearTimeout(timer);
        }
    }, [currentQuestion, isAnswered, isReviewing, playQuestionAudio]);
    
    const handleSettingChange = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));
    const handleRandomKey = () => {
        const possibleKeys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F', 'Bb', 'Eb', 'Ab', 'Db'];
        handleSettingChange('fixedKey', possibleKeys[Math.floor(Math.random() * possibleKeys.length)]);
    };
    
    const handleSavePreset = () => {
        const name = prompt("Enter a name for your preset:", "Progression Recognition Custom");
        if (name && name.trim() !== "") {
            savePreset({
                id: `pet-${Date.now()}`, name: name.trim(),
                gameId: 'progression-ear-trainer', gameName: 'Progression Recognition',
                settings: settings,
            });
            alert(`Preset "${name.trim()}" saved!`);
        }
    };

    const handleLogProgress = () => {
        const remarks = prompt("Enter any remarks for this session:", `Score: ${score}/${totalAsked}`);
        if (remarks !== null) { addLogEntry({ game: 'Progression Recognition', date: new Date().toLocaleDateString(), remarks }); alert("Session logged!"); }
    };
    
    const itemToDisplay = isReviewing ? history[reviewIndex] : { question: currentQuestion };
    const questionForDisplay = itemToDisplay?.question;

    const topControlsContent = (
      <label className="flex items-center gap-2 cursor-pointer font-semibold">
          <span>Auto-Advance</span>
          <div className="relative inline-flex items-center">
              <input type="checkbox" checked={settings.autoAdvance} onChange={(e) => handleSettingChange('autoAdvance', e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-500 rounded-full peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </div>
      </label>
    );

    const wasCorrect = history.length > 0 ? history[history.length - 1].wasCorrect : true;
    const footerContent = isReviewing ? (
        <div className="flex items-center justify-center gap-4 w-full">
            <button onClick={() => handleReviewNav(-1)} disabled={reviewIndex === 0} className="bg-slate-600 hover:bg-slate-500 font-bold p-3 rounded-lg disabled:opacity-50">Prev</button>
            <button onClick={() => setReviewIndex(null)} className="bg-purple-600 hover:bg-purple-500 font-bold p-3 rounded-lg text-xl">Return to Quiz</button>
            <button onClick={() => handleReviewNav(1)} disabled={reviewIndex === history.length - 1} className="bg-slate-600 hover:bg-slate-500 font-bold p-3 rounded-lg disabled:opacity-50">Next</button>
        </div>
    ) : (
        <div className="flex items-center justify-center gap-4">
            <button onClick={() => checkAnswer(userAnswer)} disabled={isAnswered || userAnswer.length !== 4} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg disabled:bg-gray-500">Submit</button>
            {isAnswered && (!settings.autoAdvance || !wasCorrect) && 
                <button onClick={generateNewQuestion} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg animate-pulse">Next Question</button>
            }
        </div>
    );

    return (
        <div className="flex flex-col md:flex-row items-start w-full gap-4">
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Progression Recognition Guide">
                <p>Listen to the chord progression and identify the sequence of chords by their Roman numerals.</p>
                <h4 className="font-bold text-indigo-300 mt-4">How to Play</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                    <li>A 4-chord progression will be played.</li>
                    <li>Use the Roman numeral buttons to build your answer sequence.</li>
                    <li>Press "Submit" once you have selected all 4 chords.</li>
                </ul>
            </InfoModal>

            <QuizLayout
                title="Progression Recognition"
                score={score} totalAsked={totalAsked} history={history} isReviewing={isReviewing}
                onStartReview={startReview} topControls={topControlsContent} footerContent={footerContent}
                onLogProgress={handleLogProgress} onToggleControls={() => setIsControlsOpen(p => !p)} onShowInfo={() => setIsInfoModalOpen(true)}
            >
                <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
                    {questionForDisplay?.noOptions ? (
                        <p className="text-yellow-400 text-center my-8">{questionForDisplay.error}</p>
                    ) : (
                        <>
                            <div className="w-full bg-slate-900/50 p-4 rounded-lg text-center min-h-[80px] flex justify-center items-center flex-wrap gap-x-2 mb-4">
                                <button onClick={() => playQuestionAudio(questionForDisplay)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg text-xl">Replay Progression</button>
                            </div>
                            <div className={`text-xl my-4 min-h-[28px] ${feedback.type === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                                {isReviewing ? `Your Answer: ${itemToDisplay.userAnswer.join(' - ')} | Correct: ${questionForDisplay.answer.join(' - ')}` : (feedback.message || <>&nbsp;</>)}
                            </div>
                            
                            {!isReviewing && <AnswerInput userAnswer={userAnswer} setUserAnswer={setUserAnswer} currentQuestion={currentQuestion} isAnswered={isAnswered} />}
                        </>
                    )}
                </div>
            </QuizLayout>

            <div className={`hidden md:block bg-slate-700 rounded-lg transition-all duration-300 ease-in-out ${isControlsOpen ? 'w-80 p-4' : 'w-0 p-0 overflow-hidden'}`}>
                <div className={`${!isControlsOpen && 'hidden'}`}>
                    <h3 className="text-xl font-bold text-teal-300 mb-4">Settings & Controls</h3>
                    <ProgressionEarTrainerControls settings={settings} onSettingChange={handleSettingChange} onRandomKey={handleRandomKey} onSavePreset={handleSavePreset} />
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
                           <ProgressionEarTrainerControls settings={settings} onSettingChange={handleSettingChange} onRandomKey={handleRandomKey} onSavePreset={handleSavePreset} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgressionEarTrainer;