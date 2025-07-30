import React, { useState, useEffect } from 'react';
import { useTools } from '../../context/ToolsContext';
import { useMelodicEarTrainer } from './useMelodicEarTrainer';
import InfoModal from '../common/InfoModal';
import QuizLayout from '../common/QuizLayout';
import { MelodicEarTrainerControls } from './MelodicEarTrainerControls';

const AnswerInput = ({ settings, userAnswer, setUserAnswer, isAnswered, currentQuestion, checkAnswer }) => {
    const [currentInput, setCurrentInput] = useState('');

    const degreeKeys = ['1', '2', '3', '4', '5', '6', '7'];
    const noteKeys = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const modifierKeys = [{ id: 'b', display: '♭'}, { id: 'natural', display: '♮'}, { id: '#', display: '♯'}];
    const mainKeys = settings.answerMode === 'Scale Degrees' ? degreeKeys : noteKeys;

    useEffect(() => {
        setCurrentInput('');
    }, [currentQuestion]);

    const commitInput = (inputToCommit) => {
        if (isAnswered || userAnswer.length >= settings.melodyLength || !inputToCommit) return;
        
        const finalInput = inputToCommit.replace('natural', '');
        const newAnswer = [...userAnswer, finalInput];
        setUserAnswer(newAnswer);
        setCurrentInput('');

        if (newAnswer.length === settings.melodyLength && settings.autoAdvance) {
            setTimeout(() => checkAnswer(newAnswer), 300);
        }
    };

    const handleMainKeyPress = (key) => {
        if (settings.answerMode === 'Scale Degrees') {
            commitInput(currentInput + key);
        } else {
            if (currentInput) {
                commitInput(currentInput);
            }
            setCurrentInput(key);
        }
    };

    const handleModifierPress = (mod) => {
        if (isAnswered) return;
        if (mod === 'natural') {
            if(currentInput) commitInput(currentInput);
        } else if (settings.answerMode === 'Scale Degrees') {
            setCurrentInput(mod);
        } else {
            if (currentInput && currentInput.length === 1) {
                commitInput(currentInput + mod);
            }
        }
    };

    const handleBackspace = () => {
        if (isAnswered) return;
        if (currentInput) {
            setCurrentInput('');
        } else {
            setUserAnswer(prev => prev.slice(0, -1));
        }
    };

    return (
        <div className="w-full max-w-md mt-4 flex flex-col items-center">
            <div className="flex items-center justify-center gap-2 h-14 bg-slate-900/50 rounded-md px-4 w-full mb-4">
                <span className="flex-1 text-left font-mono text-xl text-gray-400">Your Answer:</span>
                <span className="font-mono text-2xl text-teal-300 tracking-wider">
                    {userAnswer.map(ans => ans.replace('#', '♯').replace('b', '♭')).join(' - ')}
                </span>
                <span className="w-8 h-8 flex items-center justify-center bg-slate-700 rounded text-blue-300 font-bold text-xl">
                    {currentInput.replace('#', '♯').replace('b', '♭') || ''}
                </span>
            </div>

            <div className="flex flex-col gap-2 w-full">
                <div className="grid grid-cols-3 gap-2">
                    {modifierKeys.map(key => <button key={key.id} onClick={() => handleModifierPress(key.id)} disabled={isAnswered} className="py-3 bg-teal-700 hover:bg-teal-600 rounded-md text-xl disabled:opacity-50">{key.display}</button>)}
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {mainKeys.map(key => <button key={key} onClick={() => handleMainKeyPress(key)} disabled={isAnswered} className="py-3 bg-teal-600 hover:bg-teal-500 rounded-md text-xl disabled:opacity-50">{key}</button>)}
                </div>
                <button onClick={handleBackspace} disabled={isAnswered} className="w-full mt-2 py-2 bg-yellow-600/80 hover:bg-yellow-700/80 rounded-md disabled:opacity-50">Backspace</button>
            </div>
        </div>
    );
};

const MelodicEarTrainer = () => {
    const { addLogEntry, savePreset, presetToLoad, clearPresetToLoad, fretboardVolume, setFretboardVolume } = useTools();
    const [settings, setSettings] = useState({
        autoAdvance: true,
        answerMode: 'Scale Degrees',
        octaveRange: 1,
        melodyLength: 4,
        startOnRoot: true,
        playRootFirst: false,
        useDrone: true,
        notePool: 'Diatonic',
        diatonicMode: 'Major',
        rootNoteMode: 'Roving',
        fixedKey: 'C',
        questionsPerRoot: 5,
    });
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isControlsOpen, setIsControlsOpen] = useState(false);
    const [userAnswer, setUserAnswer] = useState([]);

    const {
        score, totalAsked, feedback, isAnswered, currentQuestion, history, reviewIndex, setReviewIndex,
        generateNewQuestion, checkAnswer, handleReviewNav, startReview, playMelody, playUserAnswer
    } = useMelodicEarTrainer(settings);
    
    useEffect(() => {
        if (presetToLoad && presetToLoad.gameId === 'melodic-ear-trainer') {
            setSettings(presetToLoad.settings);
            clearPresetToLoad();
        }
    }, [presetToLoad, clearPresetToLoad]);

    useEffect(() => {
        setUserAnswer([]);
    }, [currentQuestion]);

    const isReviewing = reviewIndex !== null;

    useEffect(() => {
        if (currentQuestion && !isAnswered && !isReviewing) {
            const delay = currentQuestion.keyChanged ? 3000 : 500;
            const timer = setTimeout(() => playMelody(), delay);
            return () => clearTimeout(timer);
        }
    }, [currentQuestion, isAnswered, isReviewing, playMelody]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Enter' && !isAnswered && userAnswer.length === settings.melodyLength) {
                checkAnswer(userAnswer);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [userAnswer, isAnswered, checkAnswer, settings.melodyLength]);

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleRandomKey = () => {
        const possibleKeys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F', 'Bb', 'Eb', 'Ab', 'Db'];
        const newKey = possibleKeys[Math.floor(Math.random() * possibleKeys.length)];
        handleSettingChange('fixedKey', newKey);
    };

    const handleSavePreset = () => {
        const name = prompt("Enter a name for your preset:", "Melody Trainer Setting");
        if (name && name.trim() !== "") {
            savePreset({
                id: Date.now().toString(), name: name.trim(),
                gameId: 'melodic-ear-trainer', gameName: 'Melodic Ear Trainer',
                settings: { ...settings, fretboardVolume },
            });
            alert(`Preset "${name.trim()}" saved!`);
        }
    };

    const handleLogProgress = () => {
        const remarks = prompt("Enter any remarks for this session:", `Score: ${score}/${totalAsked}`);
        if (remarks !== null) { addLogEntry({ game: 'Melodic Ear Trainer', date: new Date().toLocaleDateString(), remarks }); alert("Session logged!"); }
    };

    const topControlsContent = (
        <label className="flex items-center gap-2 cursor-pointer font-semibold">
            <span>Auto-Advance</span>
            <div className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={settings.autoAdvance} onChange={(e) => handleSettingChange('autoAdvance', e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-500 rounded-full peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </div>
        </label>
    );

    const footerContent = isReviewing ? (
        <div className="flex items-center gap-4">
            <button onClick={() => handleReviewNav(-1)} disabled={reviewIndex === 0} className="p-3 rounded-lg bg-slate-600 hover:bg-slate-500">Prev</button>
            <button onClick={() => setReviewIndex(null)} className="bg-purple-600 p-3 rounded-lg font-bold">Return to Quiz</button>
            <button onClick={() => handleReviewNav(1)} disabled={reviewIndex === history.length - 1} className="p-3 rounded-lg bg-slate-600 hover:bg-slate-500">Next</button>
        </div>
    ) : (
        <>
            <button onClick={() => checkAnswer(userAnswer)} disabled={isAnswered || userAnswer.length !== settings.melodyLength} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg disabled:bg-gray-500">Submit (Enter)</button>
            {!settings.autoAdvance && isAnswered && <button onClick={() => { setUserAnswer([]); generateNewQuestion(); }} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg animate-pulse">Next</button>}
        </>
    );

    return (
        <div className="flex flex-col md:flex-row items-start w-full gap-4">
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Melodic Ear Trainer Guide">
                 <p>This tool plays a short melody and asks you to identify the notes you heard.</p>
                 <h4 className="font-bold text-indigo-300 mt-2">How to Play</h4>
                 <ul className="list-disc list-inside text-sm space-y-1">
                     <li>Press "Apply & Start New" in the controls to begin.</li>
                     <li>Listen to the melody. You can press "Replay Melody" to hear it again.</li>
                     <li>Use the keypad to build your answer one note/degree at a time. It will be added to your answer sequence automatically.</li>
                     <li>Press "Submit" or the Enter key once the sequence is full.</li>
                 </ul>
                 <h4 className="font-bold text-indigo-300 mt-2">Controls Explained</h4>
                 <ul className="list-disc list-inside text-sm space-y-1">
                     <li><b>Answer Mode:</b> Guess note names (C, F♯, B♭) or scale degrees (1, 5, ♭7).</li>
                     <li><b>Melody Options:</b> Control the number of notes and the octave range. "Always Start on Root" forces the first note to be the tonic.</li>
                     <li><b>Reference Note:</b> "Play Root Note First" plays the tonic before the melody begins. "Use Drone" plays a continuous drone of the root note.</li>
                     <li><b>Key & Scale:</b> Practice with all 12 notes (Chromatic) or within a specific key (Diatonic). You can fix the key, have it change after a set number of questions (Roving), or get a new random key every question.</li>
                 </ul>
            </InfoModal>

            <QuizLayout
                title="Melodic Ear Trainer"
                score={score} totalAsked={totalAsked} history={history} isReviewing={isReviewing}
                onStartReview={startReview} topControls={topControlsContent} footerContent={footerContent}
                onLogProgress={handleLogProgress} onToggleControls={() => setIsControlsOpen(p => !p)} onShowInfo={() => setIsInfoModalOpen(true)}
            >
                <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
                    <div className="flex items-center gap-4 mb-4">
                        <button onClick={() => playMelody(isReviewing ? history[reviewIndex].question : currentQuestion)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg">Replay Melody</button>
                        {isReviewing && !history[reviewIndex].wasCorrect && (
                             <button onClick={() => playUserAnswer(history[reviewIndex].userAnswer, history[reviewIndex])} className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-8 rounded-lg">Replay Your Answer</button>
                        )}
                    </div>
                    <div className={`text-xl my-4 min-h-[28px] ${feedback.type === 'correct' ? 'text-green-400' : 'text-red-400'}`}>{feedback.message || <>&nbsp;</>}</div>
                    
                    {!isReviewing ? 
                        <AnswerInput
                            settings={settings}
                            userAnswer={userAnswer}
                            setUserAnswer={setUserAnswer}
                            isAnswered={isAnswered}
                            currentQuestion={currentQuestion}
                            checkAnswer={checkAnswer}
                        />
                    :
                        <div className="text-center p-3 rounded-lg bg-slate-900/50 space-y-2">
                             <p className="font-bold text-gray-200">Correct Answer: <span className="text-teal-300 font-semibold">{(history[reviewIndex].answerMode === 'Scale Degrees' ? history[reviewIndex].question.answerDegrees : history[reviewIndex].question.answerNotes).join(' - ')}</span></p>
                            {!history[reviewIndex].wasCorrect && (
                                <p className="font-bold text-gray-400">Your Answer: <span className="text-red-400 font-semibold">{history[reviewIndex].userAnswer.join(' - ')}</span></p>
                            )}
                        </div>
                    }
                </div>
            </QuizLayout>

            <div className={`hidden md:block bg-slate-700 rounded-lg transition-all duration-300 ${isControlsOpen ? 'w-80 p-4' : 'w-0 overflow-hidden'}`}>
               {isControlsOpen && (
                 <div className="flex flex-col h-full">
                    <h3 className="text-xl font-bold text-teal-300 mb-4 flex-shrink-0">Settings & Controls</h3>
                    <div className="flex-grow overflow-y-auto pr-2">
                        <MelodicEarTrainerControls 
                            settings={settings} 
                            onSettingChange={handleSettingChange} 
                            onRandomKey={handleRandomKey} 
                            onSavePreset={handleSavePreset}
                            volume={fretboardVolume}
                            onVolumeChange={setFretboardVolume}
                            onApplySettings={() => { setUserAnswer([]); generateNewQuestion(); }}
                        />
                    </div>
                 </div>
               )}
            </div>
            {isControlsOpen && (<div className="md:hidden fixed inset-0 z-50 flex justify-center items-center bg-black/60" onClick={() => setIsControlsOpen(false)}>
                <div className="w-11/12 max-w-sm bg-slate-800 rounded-2xl p-4 max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    <div className="flex-shrink-0 flex justify-between items-center mb-4">
                       <h3 className="text-xl font-bold text-teal-300">Settings & Controls</h3>
                       <button onClick={() => setIsControlsOpen(false)} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
                    </div>
                    <div className="flex-grow overflow-y-auto pr-2">
                      <MelodicEarTrainerControls 
                          settings={settings} 
                          onSettingChange={handleSettingChange} 
                          onRandomKey={handleRandomKey} 
                          onSavePreset={handleSavePreset}
                          volume={fretboardVolume}
                          onVolumeChange={setFretboardVolume}
                          onApplySettings={() => { setUserAnswer([]); generateNewQuestion(); }}
                      />
                    </div>
                </div>
            </div>)}
        </div>
    );
};

export default MelodicEarTrainer;