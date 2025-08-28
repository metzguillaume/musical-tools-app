import React, { useState, useEffect } from 'react';
import { useTools } from '../../../context/ToolsContext';
import { useChordEarTrainer } from './useChordEarTrainer'; // Corrected import path
import InfoModal from '../../common/InfoModal';
import QuizLayout from '../../common/QuizLayout';
import { ChordEarTrainerControls } from './ChordEarTrainerControls'; // Corrected import path
import { CHORDS } from '../../../utils/musicTheory';

const ChordEarTrainer = ({ onProgressUpdate }) => {
    const { addLogEntry, savePreset, presetToLoad, clearPresetToLoad } = useTools();
    
    const [settings, setSettings] = useState({
        autoAdvance: true,
        playbackStyle: 'Harmonic',
        qualities: {
            'Major': true, 'Minor': true, 'Diminished': false, 'Augmented': false,
            'Sus2': false, 'Sus4': false, 'Major 7th': false, 'Minor 7th': false,
            'Dominant 7th': false, 'Half-Diminished 7th': false, 'Diminished 7th': false,
        },
        keyMode: 'Fixed',
        fixedKey: 'C',
        questionsPerKey: 5, // Added for the new feature
        useDrone: true,
    });
    
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isControlsOpen, setIsControlsOpen] = useState(false);

    const {
        score, totalAsked, feedback, isAnswered, currentQuestion, history, reviewIndex, setReviewIndex,
        generateNewQuestion, checkAnswer, handleReviewNav, startReview, playQuestionAudio
    } = useChordEarTrainer(settings, onProgressUpdate);

    useEffect(() => {
        if (presetToLoad && presetToLoad.gameId === 'chord-ear-trainer') {
            setSettings(presetToLoad.settings);
            clearPresetToLoad();
        }
    }, [presetToLoad, clearPresetToLoad]);

    const isReviewing = reviewIndex !== null;

    useEffect(() => {
        if (currentQuestion && !currentQuestion.noOptions && !isAnswered && !isReviewing) {
            // Add a 2.5 second delay if the key just changed, otherwise use a short delay.
            const delay = currentQuestion.keyChanged ? 2500 : 500;
            const timer = setTimeout(() => playQuestionAudio(), delay);
            return () => clearTimeout(timer);
        }
    }, [currentQuestion, isAnswered, isReviewing, playQuestionAudio]);
    
    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleRandomKey = () => {
        const possibleKeys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F', 'Bb', 'Eb', 'Ab', 'Db'];
        const newKey = possibleKeys[Math.floor(Math.random() * possibleKeys.length)];
        handleSettingChange('fixedKey', newKey);
    };
    
    const handleSavePreset = () => {
        const name = prompt("Enter a name for your preset:", "Chord Recognition Custom");
        if (name && name.trim() !== "") {
            savePreset({
                id: `cet-${Date.now()}`,
                name: name.trim(),
                gameId: 'chord-ear-trainer',
                gameName: 'Chord Recognition',
                settings: settings,
            });
            alert(`Preset "${name.trim()}" saved!`);
        }
    };

    const handleLogProgress = () => {
        const remarks = prompt("Enter any remarks for this session:", `Score: ${score}/${totalAsked}`);
        if (remarks !== null) { addLogEntry({ game: 'Chord Recognition', date: new Date().toLocaleDateString(), remarks }); alert("Session logged!"); }
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
    ) : isAnswered && (!settings.autoAdvance || !wasCorrect) ? (
         <button onClick={generateNewQuestion} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg animate-pulse">Next Question</button>
    ) : null;
    
    const activeQualities = Object.keys(CHORDS).filter(q => settings.qualities[q]);

    return (
        <div className="flex flex-col md:flex-row items-start w-full gap-4">
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Chord Recognition Guide">
                <p>Listen to the chord and identify its quality.</p>
                <h4 className="font-bold text-indigo-300 mt-4">How to Play</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                    <li>A chord will be played either as a block chord (Harmonic) or an arpeggio (Melodic).</li>
                    <li>Click the button corresponding to the chord quality you heard.</li>
                    <li>Use the "Replay Sound" button to hear the chord again.</li>
                </ul>
                <h4 className="font-bold text-indigo-300 mt-4">Controls</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                    <li><b>Playback Style:</b> Choose between hearing the notes as an "Arpeggio" or a "Chord".</li>
                    <li><b>Chord Selection:</b> Select which triad and 7th chord qualities you want to be tested on.</li>
                    <li><b>Key Options:</b> Practice with a fixed root note or have it change to a new random key (Roving).</li>
                    <li><b>Drone:</b> Enable the global drone player to hear a constant root note for reference. The drone will automatically follow the key.</li>
                </ul>
            </InfoModal>

            <QuizLayout
                title="Chord Recognition"
                score={score} totalAsked={totalAsked} history={history} isReviewing={isReviewing}
                onStartReview={startReview} topControls={topControlsContent} footerContent={footerContent}
                onLogProgress={handleLogProgress} onToggleControls={() => setIsControlsOpen(p => !p)} onShowInfo={() => setIsInfoModalOpen(true)}
            >
                <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
                    {questionForDisplay?.noOptions ? (
                        <p className="text-yellow-400 text-center my-8">Please select at least one chord quality in the controls to begin.</p>
                    ) : (
                        <>
                            <div className="w-full bg-slate-900/50 p-4 rounded-lg text-center min-h-[80px] flex justify-center items-center flex-wrap gap-x-2 mb-4">
                                <button onClick={() => playQuestionAudio(questionForDisplay)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg text-xl">Replay Sound</button>
                            </div>
                            <div className={`text-xl my-4 min-h-[28px] ${feedback.type === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                                {isReviewing ? `Your Answer: ${itemToDisplay.userAnswer} | Correct: ${questionForDisplay.answer}` : (feedback.message || <>&nbsp;</>)}
                            </div>
                            <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-2">
                                {activeQualities.map(quality => (
                                    <button 
                                        key={quality} 
                                        onClick={() => checkAnswer(quality)} 
                                        disabled={isAnswered || isReviewing}
                                        className="py-4 rounded-lg font-semibold text-base transition-colors disabled:opacity-30 bg-teal-600 hover:bg-teal-500"
                                    >
                                        {quality}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </QuizLayout>

            <div className={`hidden md:block bg-slate-700 rounded-lg transition-all duration-300 ease-in-out ${isControlsOpen ? 'w-80 p-4' : 'w-0 p-0 overflow-hidden'}`}>
                <div className={`${!isControlsOpen && 'hidden'}`}>
                    <h3 className="text-xl font-bold text-teal-300 mb-4">Settings & Controls</h3>
                    <ChordEarTrainerControls settings={settings} onSettingChange={handleSettingChange} onRandomKey={handleRandomKey} onSavePreset={handleSavePreset} />
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
                           <ChordEarTrainerControls settings={settings} onSettingChange={handleSettingChange} onRandomKey={handleRandomKey} onSavePreset={handleSavePreset} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChordEarTrainer;