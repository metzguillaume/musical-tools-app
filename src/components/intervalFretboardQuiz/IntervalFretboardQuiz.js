import React, { useState, useEffect } from 'react';
import { useTools } from '../../context/ToolsContext';
import FretboardDiagram from '../common/FretboardDiagram';
import InfoModal from '../common/InfoModal';
import QuizLayout from '../common/QuizLayout'; 
import { IntervalFretboardQuizControls } from './IntervalFretboardQuizControls'; 
import { useIntervalFretboardQuiz, quizData } from './useIntervalFretboardQuiz';

const IntervalFretboardQuiz = ({ onProgressUpdate }) => {
    const { addLogEntry, fretboardVolume, setFretboardVolume, savePreset, presetToLoad, clearPresetToLoad } = useTools();
    
    const [settings, setSettings] = useState({
        autoAdvance: true,
        playAudio: true,
        labelType: 'name',
    });

    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isControlsOpen, setIsControlsOpen] = useState(false);

    useEffect(() => {
        if (presetToLoad && presetToLoad.gameId === 'interval-fretboard-quiz') {
            const { fretboardVolume: presetVolume, ...localSettings } = presetToLoad.settings;
            setSettings(localSettings);
            if (presetVolume !== undefined) {
                setFretboardVolume(presetVolume);
            }
            clearPresetToLoad();
        }
    }, [presetToLoad, clearPresetToLoad, setFretboardVolume]);

    const {
        score, currentQuestion, feedback, isAnswered, selected, setSelected, history, reviewIndex, setReviewIndex,
        startNewRound, handleReviewNav, startReview, replayAudioForHistoryItem
    } = useIntervalFretboardQuiz(settings.autoAdvance, settings.playAudio, onProgressUpdate);

    useEffect(() => {
        const handleKeyDown = (event) => {
            // Get the status of the last answer from history
            const wasCorrect = history.length > 0 ? history[history.length - 1].wasCorrect : true;
            if (event.key === 'Enter' && isAnswered && (!settings.autoAdvance || !wasCorrect)) {
                event.preventDefault();
                startNewRound();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isAnswered, settings.autoAdvance, history, startNewRound]);

    const isReviewing = reviewIndex !== null;

    const handleLogProgress = () => {
        const remarks = prompt("Enter any remarks for this session:", `Score: ${score}/${history.length}`);
        if (remarks !== null) { addLogEntry({ game: 'Interval Fretboard Quiz', date: new Date().toLocaleDateString(), remarks }); alert("Session logged!"); }
    };

    const handleSavePreset = () => {
        const name = prompt("Enter a name for your preset:", `Fretboard Ints - ${settings.labelType}`);
        if (name && name.trim() !== "") {
            const newPreset = {
                id: Date.now().toString(),
                name: name.trim(),
                gameId: 'interval-fretboard-quiz',
                gameName: 'Fretboard Intervals',
                settings: {
                    ...settings,
                    fretboardVolume: fretboardVolume
                },
            };
            savePreset(newPreset);
            alert(`Preset "${name.trim()}" saved!`);
        }
    };

    const handleSelection = (type, value) => {
        if (isAnswered || isReviewing) return;
        if (value === 'Tritone') {
            setSelected({ quality: 'Tritone', number: 'Tritone' });
        } else {
            setSelected(prev => ({ ...prev, [type]: value }));
        }
    };
    
    const handleSettingChange = (key, value) => {
        setSettings(prev => ({...prev, [key]: value}));
    };

    const itemToDisplay = isReviewing ? history[reviewIndex] : { question: currentQuestion };
    if (!itemToDisplay.question) return <div>Loading...</div>;

    const topControlsContent = (
      <>
        <label className="flex items-center gap-2 cursor-pointer font-semibold">
          <span>Play Audio</span>
          <div className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={settings.playAudio} onChange={() => handleSettingChange('playAudio', !settings.playAudio)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-500 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </div>
        </label>
        <label className="flex items-center gap-2 cursor-pointer font-semibold">
          <span>Auto-Advance</span>
          <div className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={settings.autoAdvance} onChange={() => handleSettingChange('autoAdvance', !settings.autoAdvance)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-500 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </div>
        </label>
      </>
    );

    const wasCorrect = history.length > 0 ? history[history.length - 1].wasCorrect : true;
    const footerContent = isReviewing ? (
      <div className='flex items-center justify-center gap-4 w-full'>
        <button onClick={() => handleReviewNav(-1)} disabled={reviewIndex === 0} className="bg-slate-600 p-3 rounded-lg">Prev</button>
        <div className="flex flex-col gap-2 flex-grow max-w-xs">
           <button onClick={() => setReviewIndex(null)} className="bg-purple-600 p-3 rounded-lg text-xl">Return to Quiz</button>
           <button onClick={() => replayAudioForHistoryItem(reviewIndex)} className="bg-sky-600 text-sm p-2 rounded-lg">Replay Audio</button>
        </div>
        <button onClick={() => handleReviewNav(1)} disabled={reviewIndex === history.length - 1} className="bg-slate-600 p-3 rounded-lg">Next</button>
      </div>
    ) : isAnswered && (!settings.autoAdvance || !wasCorrect) ? (
      <button onClick={startNewRound} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg animate-pulse">Next Question</button>
    ) : null;

    return (
        <div className="flex flex-col md:flex-row items-start w-full gap-4">
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="How to Play: Intervals on Fretboard">
                <p>A diagram of a guitar fretboard will be displayed with two notes.</p>
                <p>The green note marked 'R' is the **root note**.</p>
                <p>Your goal is to identify the interval between the root note and the second note by its shape.</p>
                <p className="mt-2">Enable the <b>Play Audio</b> toggle to hear the interval after you answer, reinforcing your ear training.</p>
                <p className="mt-2">Use the <b>Controls</b> button to change the audio volume and switch the label display between Note Names and Scale Degrees.</p>
            </InfoModal>

            <QuizLayout
                title="Fretboard Intervals"
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
                <FretboardDiagram notesToDisplay={itemToDisplay.question.notes} showLabels={isReviewing || isAnswered} startFret={0} fretCount={12} labelType={settings.labelType} />
                
                <div className={`text-lg font-bold my-4 min-h-[28px] ${feedback.type === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                    {isReviewing ? `The correct answer was ${itemToDisplay.question.answer.number === 'Tritone' ? 'a Tritone' : `a ${itemToDisplay.question.answer.quality} ${itemToDisplay.question.answer.number}`}.` : (feedback.message || <>&nbsp;</>)}
                </div>
                
                {/* THIS SECTION WAS MISSING AND HAS BEEN RESTORED */}
                <div className="grid grid-cols-2 gap-6 mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-400 mb-3">Quality</h3>
                        <div className="flex flex-col gap-2">
                            {quizData.qualities.map(q => {
                                const isDisabled = (isAnswered || isReviewing) || q === 'Augmented' || q === 'Diminished';
                                return (<button key={q} onClick={() => handleSelection('quality', q)} disabled={isDisabled} className={`p-3 rounded-lg font-semibold transition-colors disabled:opacity-50 ${selected.quality === q && !isReviewing ? 'bg-indigo-600 ring-2' : 'bg-teal-600 hover:bg-teal-500'}`}>{q}</button>);
                            })}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-400 mb-3">Number</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {quizData.numericButtons.map(n => {
                                const colorClasses = selected.number === n && !isReviewing ? 'bg-indigo-600 ring-2' : 'bg-teal-600 hover:bg-teal-500';
                                return (<button key={n} onClick={() => handleSelection('number', n)} disabled={isAnswered || isReviewing} className={`p-3 rounded-lg font-semibold transition-colors disabled:opacity-50 ${colorClasses}`}>{n}</button>)
                            })}
                        </div>
                    </div>
                </div>
            </QuizLayout>

            <div className={`hidden md:block bg-slate-700 rounded-lg transition-all duration-300 ease-in-out ${isControlsOpen ? 'w-80 p-4' : 'w-0 p-0 overflow-hidden'}`}>
                <div className={`${!isControlsOpen && 'hidden'}`}>
                     <h3 className="text-xl font-bold text-teal-300 mb-4">Settings & Controls</h3>
                    <IntervalFretboardQuizControls
                      settings={settings}
                      onSettingChange={handleSettingChange}
                      volume={fretboardVolume}
                      onVolumeChange={setFretboardVolume}
                      onSavePreset={handleSavePreset}
                    />
                </div>
            </div>
            {isControlsOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex justify-center items-center bg-black/60" onClick={() => setIsControlsOpen(false)}>
                    <div className="w-11/12 max-w-sm bg-slate-800 rounded-2xl p-4" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-teal-300">Settings & Controls</h3>
                            <button onClick={() => setIsControlsOpen(false)} className="text-gray-400 text-2xl">&times;</button>
                        </div>
                        <IntervalFretboardQuizControls
                          settings={settings}
                          onSettingChange={handleSettingChange}
                          volume={fretboardVolume}
                          onVolumeChange={setFretboardVolume}
                          onSavePreset={handleSavePreset}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default IntervalFretboardQuiz;