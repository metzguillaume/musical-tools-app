import React, { useState, useEffect, useRef } from 'react';
import { useTools } from '../../context/ToolsContext';
import { useChordTrainer } from './useChordTrainer';
import InfoModal from '../common/InfoModal';
import InfoButton from '../common/InfoButton';
import { ChordTrainerSetup } from './ChordTrainerSetup';
import { ChordTrainerControls } from './ChordTrainerControls';

const ALTERNATE_SYMBOLS = { 'm': '-', 'maj7': '△7', 'm7': '-7', 'dim': '°', 'm7b5': 'ø7', '7': '7' };

const ChordDisplay = ({ chord, useAlternateNotation = false }) => {
    if (!chord) return null;
    let displayName = chord;
    if (useAlternateNotation) {
        const sortedSuffixes = Object.keys(ALTERNATE_SYMBOLS).sort((a, b) => b.length - a.length);
        for (const suffix of sortedSuffixes) {
            if (displayName.endsWith(suffix)) {
                displayName = displayName.slice(0, -suffix.length) + ALTERNATE_SYMBOLS[suffix];
                break;
            }
        }
    }
    const match = displayName.match(/^([A-G])([#b]?)(.*)/);
    if (!match) { return <span>{displayName}</span>; }
    let [, root, accidental, quality] = match;
    if (accidental === '#') accidental = '♯';
    if (accidental === 'b') accidental = '♭';

    return (
        <span className="whitespace-nowrap inline-flex items-baseline">
            <span>{root}</span>
            <span className="relative" style={{ marginLeft: '0.1em', display: 'inline-block' }}>
                <span style={{ fontSize: '70%', marginLeft: accidental ? '0.25em' : '0' }}>
                    {quality || <span className="opacity-0">&nbsp;</span>}
                </span>
                <span className="absolute left-0" style={{ fontSize: '60%', bottom: '45%' }}>
                    {accidental}
                </span>
            </span>
        </span>
    );
};

const QuizScreen = ({ initialSettings, onLogSession, onGoToSetup, onProgressUpdate, isChallengeMode }) => {
    const [settings, setSettings] = useState(initialSettings);
    const {
        currentQuestion, userAnswer, setUserAnswer, feedback, score, history,
        reviewIndex, setReviewIndex, checkAnswer, generateNewQuestion, startReview, handleReviewNav
    } = useChordTrainer(settings, onProgressUpdate);

    const [isControlsOpen, setIsControlsOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const { savePreset } = useTools();
    const inputRef = useRef(null);
    const isReviewing = reviewIndex !== null;
    const wasCorrect = history.length > 0 ? history[history.length - 1].wasCorrect : true;

    useEffect(() => {
        if (!feedback && !isReviewing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [currentQuestion, feedback, isReviewing]);
    
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Enter' && feedback && (!settings.autoAdvance || !wasCorrect)) {
                event.preventDefault();
                generateNewQuestion();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [feedback, settings.autoAdvance, wasCorrect, generateNewQuestion]);

    const handleSettingChange = (key, value) => setSettings(prev => ({...prev, [key]: value}));
    
    const handleSavePreset = () => {
        const name = prompt("Enter a name for your preset:", `CT - ${settings.selectedKeys.join(',')}`);
        if (name && name.trim() !== "") {
            savePreset({ id: Date.now().toString(), name: name.trim(), gameId: 'chord-trainer', gameName: 'Chord Trainer', settings });
            alert(`Preset "${name.trim()}" saved!`);
        }
    };
    
    const itemToDisplay = isReviewing ? history[reviewIndex] : { question: currentQuestion, userAnswer };
    
    const renderPrompt = () => {
        const q = itemToDisplay.question;
        if (!q || !q.prompt) return null;
        if (q.type === 'error') return <span className="text-red-400">{q.prompt.text}</span>;
        
        let keyIndex = 0;
        const questionTextParts = q.prompt.text.split('{key}').map((part, index) => {
            if (index < q.prompt.keys.length) {
                return (
                    <React.Fragment key={index}>
                        {part}
                        <span className="text-highlight font-bold">{q.prompt.keys[keyIndex++]}</span>
                    </React.Fragment>
                );
            }
            return part;
        });

        const contentParts = q.prompt.content.split(' ');

        return (
            <div className="flex flex-col items-center text-center">
                <div className="text-3xl mb-4">{questionTextParts}</div>
                <div className="inline-flex flex-wrap justify-center items-center gap-2">
                    {contentParts.map((part, index) => (
                        <strong key={index} className="text-4xl font-bold text-teal-300 bg-slate-700/50 px-3 py-1 rounded-md">
                            <ChordDisplay chord={part} useAlternateNotation={settings.useAlternateNotation} />
                        </strong>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col md:flex-row items-start w-full gap-4">
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Chord Trainer Guide">
                <div className="space-y-4 text-sm">
                    <div><h4 className="font-bold text-indigo-300 mb-1">Game Modes</h4><ul className="list-disc list-inside space-y-1"><li><b>Name Chord:</b> Given a key and a Roman numeral, name the chord.</li><li><b>Name Numeral:</b> Given a key and a chord, name the Roman numeral.</li><li><b>Progression:</b> Given a key and a numeral progression, name all the chords.</li></ul></div>
                    <div><h4 className="font-bold text-indigo-300 mt-2 mb-1">Chord Complexity</h4><p>Use the "Use 7th Chords" toggle to switch between triads (3-note chords) and tetrads (4-note chords). When active, you must provide the full 7th chord name (e.g., Cmaj7, Dm7).</p></div>
                    <div><h4 className="font-bold text-indigo-300 mt-2 mb-1">Roman Numerals</h4><p>Roman numerals represent scale degrees. Their case indicates quality (e.g., I is major, ii is minor, vii° is diminished). They do not include the "7" for tetrads; you are expected to know the correct 7th chord quality for that degree.</p></div>
                    <div><h4 className="font-bold text-indigo-300 mt-2">Advanced Options</h4><ul className="list-disc list-inside space-y-1"><li><b>Alternate Notation:</b> Displays chords with professional symbols (e.g., C-, F△7, Bø7). Even when active, you should type your answers in standard notation (e.g., Cm7, Fmaj7).</li><li><b>Hide Quality:</b> For a harder challenge, this makes all Roman numerals uppercase (e.g., ii becomes II), forcing you to recall the quality from theory.</li></ul></div>
                </div>
            </InfoModal>

            <div className="w-full flex-1 bg-slate-800 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2"><h1 className="text-2xl font-bold text-indigo-300">Chord Trainer</h1><InfoButton onClick={() => setIsInfoModalOpen(true)} /></div>
                    <div className="flex items-center gap-2"><button onClick={() => onLogSession(score, history)} className="bg-green-600 hover:bg-green-500 text-white font-bold py-1 px-3 rounded-lg text-sm">Log</button><button onClick={() => setIsControlsOpen(p => !p)} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-sm font-semibold">Controls</button></div>
                </div>
                <div className="grid grid-cols-3 items-center mb-4 text-lg">
                    <span className="font-semibold justify-self-start">Score: {score} / {history.length}</span>
                    <div className="justify-self-center">{history.length > 0 && <button onClick={startReview} disabled={isReviewing} className="bg-gray-600 hover:bg-gray-500 text-sm py-1 px-3 rounded-lg">Review</button>}</div>
                    <label className="flex items-center gap-2 cursor-pointer font-semibold justify-self-end"><span>Auto-Advance</span><div className="relative inline-flex items-center"><input type="checkbox" checked={settings.autoAdvance} onChange={(e) => handleSettingChange('autoAdvance', e.target.checked)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-500 rounded-full peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></div></label>
                </div>
                
                <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
                    <div className="w-full bg-slate-900/50 p-4 rounded-lg text-center min-h-[120px] flex justify-center items-center flex-wrap gap-x-2 mb-2">{renderPrompt()}</div>
                    
                    {currentQuestion && currentQuestion.reminder && !feedback && (
                        <div className="text-sm italic text-highlight bg-yellow-900/30 p-2 rounded-md my-2 w-full text-center">
                            {currentQuestion.reminder}
                        </div>
                    )}
                    
                    <div className={`text-xl my-4 min-h-[28px] ${feedback.startsWith('Correct') ? 'text-green-400' : 'text-red-400'}`}>{feedback}</div>
                    <form onSubmit={(e)=>{e.preventDefault(); checkAnswer(userAnswer, settings.autoAdvance)}} className="w-full max-w-sm flex flex-col items-center">
                        <input ref={inputRef} type="text" value={isReviewing ? '' : userAnswer} onChange={(e) => setUserAnswer(e.target.value)} className="w-full text-center text-xl p-3 rounded-lg bg-slate-700" disabled={!!feedback || isReviewing} autoFocus />
                        <div className="h-20 mt-3 flex justify-center items-center gap-4">
                            {isReviewing ? (<div className="flex items-center gap-4"><button type="button" onClick={() => handleReviewNav(-1)} disabled={reviewIndex === 0} className="p-3 rounded-lg bg-slate-600">Prev</button><button type="button" onClick={() => setReviewIndex(null)} className="bg-purple-600 p-3 rounded-lg font-bold">Return</button><button type="button" onClick={() => handleReviewNav(1)} disabled={reviewIndex === history.length - 1} className="p-3 rounded-lg bg-slate-600">Next</button></div>) 
                            : (
                                <>
                                    {!onProgressUpdate && <button type="button" onClick={onGoToSetup} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg">Menu</button>}
                                    {!feedback && <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg">Submit</button>}
                                    {feedback && (!settings.autoAdvance || !wasCorrect) && (
                                        <button type="button" onClick={generateNewQuestion} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg animate-pulse">Next Question</button>
                                    )}
                                </>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            <div className={`hidden md:block bg-slate-700 rounded-lg transition-all duration-300 ${isControlsOpen ? 'w-96 p-4' : 'w-0 overflow-hidden'}`}>{isControlsOpen && <ChordTrainerControls settings={settings} onSettingChange={handleSettingChange} onSavePreset={handleSavePreset} />}</div>
            {isControlsOpen && (<div className="md:hidden fixed inset-0 z-50 flex justify-center items-center bg-black/60" onClick={() => setIsControlsOpen(false)}><div className="w-11/12 max-w-sm bg-slate-800 rounded-2xl p-4 max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}><div className="flex-grow overflow-y-auto pr-2"><ChordTrainerControls settings={settings} onSettingChange={handleSettingChange} onSavePreset={handleSavePreset} /></div></div></div>)}
        </div>
    );
};

const ChordTrainer = ({ onProgressUpdate, challengeSettings }) => {
    const { addLogEntry, clearPresetToLoad, presetToLoad } = useTools();
    const [screen, setScreen] = useState('setup');
    const [initialSettings, setInitialSettings] = useState(null);

    useEffect(() => {
        if (challengeSettings) {
            setInitialSettings(challengeSettings);
            setScreen('quiz');
        } else if (presetToLoad && presetToLoad.gameId === 'chord-trainer') {
            setInitialSettings(presetToLoad.settings);
            setScreen('quiz');
            clearPresetToLoad();
        }
    }, [challengeSettings, presetToLoad, clearPresetToLoad]);

    const handleStart = (settingsFromSetup) => {
        setInitialSettings({ ...settingsFromSetup, degreeToggles: { 'I': true, 'ii': true, 'iii': true, 'IV': true, 'V': true, 'vi': true, 'vii°': true }, useAlternateNotation: false, autoAdvance: true, hideQuality: false, });
        setScreen('quiz');
    };
    const handleGoToSetup = () => { if (window.confirm("Are you sure you want to return to the menu? Your session will be lost.")) { setScreen('setup'); setInitialSettings(null); } };
    const handleLogSession = (score, history) => { const remarks = prompt("Enter any remarks for this session:", `Score: ${score}/${history.length}`); if (remarks !== null) { addLogEntry({ game: 'Chord Trainer', date: new Date().toLocaleDateString(), remarks }); alert("Session logged!"); } };

    if (screen === 'setup') { return <ChordTrainerSetup onStart={handleStart} />; }
    if (screen === 'quiz' && initialSettings) {
        return <QuizScreen key={JSON.stringify(initialSettings)} initialSettings={initialSettings} onLogSession={handleLogSession} onGoToSetup={handleGoToSetup} onProgressUpdate={onProgressUpdate} isChallengeMode={!!challengeSettings} />;
    }
    return null;
};

export default ChordTrainer;