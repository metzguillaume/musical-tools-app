import React, { useState, useEffect } from 'react';
import { useTools } from '../../context/ToolsContext';
import FretboardDiagram from '../common/FretboardDiagram';
import InfoModal from '../common/InfoModal';
import InfoButton from '../common/InfoButton';
import { useIntervalFretboardQuiz, quizData } from './useIntervalFretboardQuiz';

const IntervalFretboardQuiz = () => {
    const { addLogEntry, fretboardVolume, setFretboardVolume, savePreset, presetToLoad, clearPresetToLoad } = useTools();
    
    // Settings are now grouped into a single state object for presets
    const [settings, setSettings] = useState({
        autoAdvance: true,
        playAudio: true,
        labelType: 'name',
    });

    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isControlsOpen, setIsControlsOpen] = useState(false);

    // useEffect to listen for a preset to load
    useEffect(() => {
    if (presetToLoad && presetToLoad.gameId === 'interval-fretboard-quiz') {
        const { fretboardVolume: presetVolume, ...localSettings } = presetToLoad.settings;
        setSettings(localSettings);
        // Apply the saved volume to the global context
        if (presetVolume !== undefined) {
            setFretboardVolume(presetVolume);
        }
        clearPresetToLoad();
    }
}, [presetToLoad, clearPresetToLoad, setFretboardVolume]);

    const {
        score, currentQuestion, feedback, isAnswered, selected, setSelected, history, reviewIndex, setReviewIndex,
        startNewRound, handleReviewNav, startReview, replayAudioForHistoryItem
    } = useIntervalFretboardQuiz(settings.autoAdvance, settings.playAudio);
    
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
                fretboardVolume: fretboardVolume // Add the current volume to the preset
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
    
    const itemToDisplay = isReviewing ? history[reviewIndex] : { question: currentQuestion };
    const buttonsDisabled = isAnswered || isReviewing;
    if (!itemToDisplay.question) return <div>Loading...</div>;

    const ControlsContent = () => (
        <div className="space-y-4">
            <div>
                <h3 className="font-semibold text-lg text-teal-300 mb-2">Note Display</h3>
                <div className="flex bg-slate-600 rounded-md p-1">
                    <button onClick={() => setSettings(s => ({ ...s, labelType: 'name' }))} className={`flex-1 rounded-md text-sm py-1 ${settings.labelType === 'name' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Note Name</button>
                    <button onClick={() => setSettings(s => ({ ...s, labelType: 'degree' }))} className={`flex-1 rounded-md text-sm py-1 ${settings.labelType === 'degree' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Scale Degree</button>
                </div>
            </div>
            <div>
                <label htmlFor="fretboard-audio-volume" className="font-semibold text-lg text-teal-300 mb-2 block">Audio Volume</label>
                <input
                    type="range" id="fretboard-audio-volume"
                    min="-30" max="0" step="1"
                    value={fretboardVolume}
                    onChange={(e) => setFretboardVolume(Number(e.target.value))}
                    className="w-full h-3 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
            </div>
            <div className="border-t border-slate-600 pt-4 mt-4">
                <button onClick={handleSavePreset} className="w-full py-2 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white">
                    Save Preset
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col md:flex-row items-start w-full gap-4">
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="How to Play: Intervals on Fretboard">
                <p>A diagram of a guitar fretboard will be displayed with two notes.</p>
                <p>The green note marked 'R' is the **root note**.</p>
                <p>Your goal is to identify the interval between the root note and the second note by its shape.</p>
                <p className="mt-2">Enable the <b>Play Audio</b> toggle to hear the interval after you answer, reinforcing your ear training.</p>
                <p className="mt-2">Use the <b>Controls</b> button to change the audio volume and switch the label display between Note Names and Scale Degrees.</p>
            </InfoModal>

            <div className="w-full flex-1 bg-slate-800 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-indigo-300">Fretboard Intervals</h1>
                        <InfoButton onClick={() => setIsInfoModalOpen(true)} />
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleLogProgress} className="bg-green-600 hover:bg-green-500 text-white font-bold py-1 px-3 rounded-lg text-sm">Log</button>
                        <button onClick={() => setIsControlsOpen(p => !p)} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-sm font-semibold">Controls</button>
                    </div>
                </div>
                <div className="w-full flex justify-between items-center mb-4 text-lg">
                    <span className="font-semibold">Score: {score} / {history.length}</span>
                    <div className="flex items-center gap-4">
                        {history.length > 0 && <button onClick={startReview} disabled={isReviewing} className="bg-gray-600 hover:bg-gray-500 text-sm py-1 px-3 rounded-lg">Review</button>}
                        <label className="flex items-center gap-2 cursor-pointer font-semibold">
                            <span>Play Audio</span>
                            <div className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={settings.playAudio} onChange={() => setSettings(s => ({ ...s, playAudio: !s.playAudio }))} className="sr-only peer" /><div className="w-11 h-6 bg-gray-500 rounded-full peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></div>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer font-semibold">
                            <span>Auto-Advance</span>
                            <div className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={settings.autoAdvance} onChange={() => setSettings(s => ({ ...s, autoAdvance: !s.autoAdvance }))} className="sr-only peer" /><div className="w-11 h-6 bg-gray-500 rounded-full peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></div>
                        </label>
                    </div>
                </div>
                
                <div className="max-w-2xl mx-auto">
                    <FretboardDiagram notesToDisplay={itemToDisplay.question.notes} showLabels={isReviewing || isAnswered} startFret={0} fretCount={12} labelType={settings.labelType} />
                    
                    <div className={`text-lg font-bold my-4 min-h-[28px] ${feedback.type === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                        {isReviewing ? `The correct answer was ${itemToDisplay.question.answer.number === 'Tritone' ? 'a Tritone' : `a ${itemToDisplay.question.answer.quality} ${itemToDisplay.question.answer.number}`}.` : (feedback.message || <>&nbsp;</>)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-400 mb-3">Quality</h3>
                            <div className="flex flex-col gap-2">
                                {quizData.qualities.map(q => {
                                    const isDisabled = buttonsDisabled || q === 'Augmented' || q === 'Diminished';
                                    return (<button key={q} onClick={() => handleSelection('quality', q)} disabled={isDisabled} className={`p-3 rounded-lg font-semibold transition-colors disabled:opacity-50 ${selected.quality === q && !isReviewing ? 'bg-indigo-600 ring-2' : 'bg-teal-600 hover:bg-teal-500'}`}>{q}</button>);
                                })}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-400 mb-3">Number</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {quizData.numericButtons.map(n => {
                                    const colorClasses = selected.number === n && !isReviewing ? 'bg-indigo-600 ring-2' : 'bg-teal-600 hover:bg-teal-500';
                                    return (<button key={n} onClick={() => handleSelection('number', n)} disabled={buttonsDisabled} className={`p-3 rounded-lg font-semibold transition-colors disabled:opacity-50 ${colorClasses}`}>{n}</button>)
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 min-h-[52px] flex justify-center items-center gap-4">
                        {isReviewing ? (
                            <div className='flex items-center justify-center gap-4 w-full'>
                                <button onClick={() => handleReviewNav(-1)} disabled={reviewIndex === 0} className="bg-slate-600 p-3 rounded-lg">Prev</button>
                                <div className="flex flex-col gap-2 flex-grow max-w-xs">
                                   <button onClick={() => setReviewIndex(null)} className="bg-purple-600 p-3 rounded-lg text-xl">Return to Quiz</button>
                                   <button onClick={() => replayAudioForHistoryItem(reviewIndex)} className="bg-sky-600 text-sm p-2 rounded-lg">Replay Audio</button>
                                </div>
                                <button onClick={() => handleReviewNav(1)} disabled={reviewIndex === history.length - 1} className="bg-slate-600 p-3 rounded-lg">Next</button>
                            </div>
                        ) : isAnswered && !settings.autoAdvance && (
                            <button onClick={startNewRound} className="bg-blue-600 p-3 rounded-lg text-xl animate-pulse">Next Question</button>
                        )}
                    </div>
                </div>
            </div>

            <div className={`hidden md:block bg-slate-700 rounded-lg transition-all duration-300 ease-in-out ${isControlsOpen ? 'w-80 p-4' : 'w-0 p-0 overflow-hidden'}`}>
                <div className={`${!isControlsOpen && 'hidden'}`}>
                     <h3 className="text-xl font-bold text-teal-300 mb-4">Settings & Controls</h3>
                    <ControlsContent />
                </div>
            </div>
            {isControlsOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex justify-center items-center bg-black/60" onClick={() => setIsControlsOpen(false)}>
                    <div className="w-11/12 max-w-sm bg-slate-800 rounded-2xl p-4" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-teal-300">Settings & Controls</h3>
                            <button onClick={() => setIsControlsOpen(false)} className="text-gray-400 text-2xl">&times;</button>
                        </div>
                        <ControlsContent />
                    </div>
                </div>
            )}
        </div>
    );
};

export default IntervalFretboardQuiz;