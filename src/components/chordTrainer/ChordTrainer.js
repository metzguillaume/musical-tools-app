import React, { useState, useEffect, useRef } from 'react';
import { useTools } from '../../context/ToolsContext';
import { useChordTrainer } from './useChordTrainer';
import InfoModal from '../common/InfoModal'; // UPDATED PATH
import InfoButton from '../common/InfoButton'; // UPDATED PATH

// --- UI Constants ---
const keysInFifthsOrder = [
    ['C', 'Am'], ['G', 'Em'], ['D', 'Bm'], ['A', 'F#m'], ['E', 'C#m'], ['B', 'G#m'],
    ['F#', 'D#m'], ['Db', 'Bbm'], ['Ab', 'Fm'], ['Eb', 'Cm'], ['Bb', 'Gm'], ['F', 'Dm']
];
// ADDED: Missing constants for key sorting
const keysSharpOrder = ['C', 'G', 'D', 'A', 'E', 'B', 'F#'];
const keysFlatOrder = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'];
const extraEnharmonicKeys = ['Gb'];
const majorDefaultWeights = [10, 6, 4, 8, 10, 8, 2];
const scaleDegreeNames = {
    triads: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
    sevenths: ['Imaj7', 'ii7', 'iii7', 'IVmaj7', 'V7', 'vi7', 'viim7b5']
};
const gameModes = [ {id: 1, label: "Name Chord"}, {id: 4, label: "Name Numeral"}, {id: 2, label: "Progression"}, {id: 3, label: "Transpose"} ];
const reminders = {
    1: "e.g., Dm or F#maj7",
    2: "e.g., C G Am Bdim",
    3: "e.g., G D Em Bm7b5",
    4: "e.g., I V vi vii°"
};

const ChordDisplay = ({ chord }) => {
    if (!chord) return null;
    const regex = /([A-G][#b]?)(-|°|△|ø|maj7|m7b5|m7|7|dim)/;
    const match = chord.match(regex);
    if (!match) return <span>{chord}</span>;
    const [, root, quality] = match;
    return <span>{root}<sup>{quality}</sup></span>;
};

// --- Sub-Components ---
const SetupScreen = ({ onStart }) => {
    const [localSettings, setLocalSettings] = useState({
        selectedKeys: ['C', 'G', 'F'],
        selectedModes: [1, 4],
        use7thChords: false,
        generationMethod: 'weighted',
        majorWeights: majorDefaultWeights,
    });
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleKeySelection = (key) => {
        const newKeys = localSettings.selectedKeys.includes(key) ? localSettings.selectedKeys.filter(k => k !== key) : [...localSettings.selectedKeys, key];
        setLocalSettings(p => ({...p, selectedKeys: newKeys}));
    };
    const handleModeSelection = (modeId) => {
        const newModes = localSettings.selectedModes.includes(modeId) ? localSettings.selectedModes.filter(m => m !== modeId) : [...localSettings.selectedModes, modeId];
        setLocalSettings(p => ({...p, selectedModes: newModes}));
    };
    const handleStart = () => {
        if (localSettings.selectedKeys.length === 0 || localSettings.selectedModes.length === 0) {
            alert("Please select at least one key and one game mode.");
            return;
        }
        onStart(localSettings);
    };

    return (
        <div className="w-full">
            <h2 className="text-3xl font-extrabold mb-6 text-indigo-300 text-center">Chord Trainer Setup</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-700 p-4 rounded-lg flex flex-col items-center">
                    <h3 className="text-xl font-bold text-teal-300 mb-4 text-center">Select Keys</h3>
                    <div className="relative w-[350px] h-[350px] mx-auto mb-4">
                        {keysInFifthsOrder.map(([majorKey], index) => {
                            const angle = index * (360 / 12) - 90;
                            const radius = 150;
                            const style = { transform: `translate(-50%, -50%) rotate(${angle}deg) translate(${radius}px) rotate(${-angle}deg)` };
                            return (
                                <div key={majorKey} style={style} className="absolute top-1/2 left-1/2">
                                    <button onClick={() => handleKeySelection(majorKey)} className={`p-2 rounded-md min-w-[50px] ${localSettings.selectedKeys.includes(majorKey) ? 'bg-blue-600 text-white' : 'bg-slate-600 hover:bg-slate-500'}`}>
                                        {majorKey}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    <div className="border-t border-slate-600 pt-3 text-center mt-2"><h4 className="font-semibold text-lg text-gray-400 mb-2">Enharmonic Keys</h4><div className="flex justify-center gap-4">{extraEnharmonicKeys.map(key => (<button key={key} onClick={() => handleKeySelection(key)} className={`p-2 rounded-md min-w-[50px] ${localSettings.selectedKeys.includes(key) ? 'bg-blue-600 text-white' : 'bg-slate-600 hover:bg-slate-500'}`}>{key}</button>))}</div></div>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg flex flex-col">
                    <h3 className="text-xl font-bold text-teal-300 mb-4">Game Modes</h3>
                    <div className="space-y-2">{gameModes.map(mode => (<button key={mode.id} onClick={() => handleModeSelection(mode.id)} className={`w-full text-left p-3 rounded-md ${localSettings.selectedModes.includes(mode.id) ? 'bg-blue-600 text-white':'bg-slate-600 hover:bg-slate-500'}`}>{mode.label}</button>))}</div>
                    <div className="border-t border-slate-600 my-4"></div>
                    <h3 className="text-xl font-bold text-teal-300 mb-2">Chord Type</h3>
                    <label className="flex items-center justify-between p-3 rounded-md bg-slate-600 cursor-pointer"><span className="font-semibold">Use 7th Chords</span><div className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={localSettings.use7thChords} onChange={(e) => setLocalSettings(p => ({...p, use7thChords: e.target.checked}))} className="sr-only peer" /><div className="w-11 h-6 bg-gray-500 rounded-full peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></div></label>
                    <div className="border-t border-slate-600 my-4"></div>
                    <button onClick={() => setShowAdvanced(p => !p)} className="text-left text-teal-300 font-bold text-lg hover:text-teal-200 w-full">{showAdvanced ? '▼' : '►'} Advanced Settings</button>
                    {showAdvanced && (
                        <div className="mt-2 p-3 bg-slate-800/50 rounded-lg space-y-4">
                            <div><h4 className="font-semibold">Generation Method</h4><div className="flex bg-slate-600 rounded-md p-1 mt-1"><button onClick={() => setLocalSettings(p=>({...p, generationMethod: 'weighted'}))} className={`flex-1 text-sm rounded-md py-1 ${localSettings.generationMethod === 'weighted' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Weighted</button><button onClick={() => setLocalSettings(p=>({...p, generationMethod: 'random'}))} className={`flex-1 text-sm rounded-md py-1 ${localSettings.generationMethod === 'random' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Random</button></div></div>
                            <div><h4 className="font-semibold">Chord Weights</h4>{localSettings.majorWeights.map((weight, index) => (<div key={index} className="flex items-center gap-3 mt-1"><label className="w-8 font-mono text-right text-sm">{scaleDegreeNames.triads[index]}</label><input type="range" min="0" max="10" value={weight} onChange={(e) => setLocalSettings(p => ({...p, majorWeights: p.majorWeights.map((w, i) => i === index ? Number(e.target.value) : w)}))} className="flex-1" /><span className="w-4 text-left text-sm">{weight}</span></div>))}</div>
                        </div>
                    )}
                    <div className="mt-auto pt-4"><button onClick={handleStart} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-lg text-xl">Start Practice</button></div>
                </div>
            </div>
        </div>
    );
};

const QuizScreen = ({ initialSettings, onLogSession, onGoToSetup }) => {
    const [settings, setSettings] = useState(initialSettings);
    const {
        currentQuestion, userAnswer, setUserAnswer, feedback, score, history,
        reviewIndex, setReviewIndex, checkAnswer, generateNewQuestion, startReview, handleReviewNav
    } = useChordTrainer(settings);

    const [isControlsOpen, setIsControlsOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const inputRef = useRef(null);
    const isReviewing = reviewIndex !== null;

    useEffect(() => {
        if (!feedback && !isReviewing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [currentQuestion, feedback, isReviewing]);
    
    const handleSettingChange = (key, value) => setSettings(prev => ({...prev, [key]: value}));
    const handleKeySelection = (key) => { const newKeys = settings.selectedKeys.includes(key) ? settings.selectedKeys.filter(k => k !== key) : [...settings.selectedKeys, key]; handleSettingChange('selectedKeys', newKeys); };
    const handleModeSelection = (modeId) => { const newModes = settings.selectedModes.includes(modeId) ? settings.selectedModes.filter(m => m !== modeId) : [...settings.selectedModes, modeId]; handleSettingChange('selectedModes', newModes); };
    const handleDegreeToggle = (degree) => handleSettingChange('degreeToggles', {...settings.degreeToggles, [degree]: !settings.degreeToggles[degree]});

    const itemToDisplay = isReviewing ? history[reviewIndex] : { question: currentQuestion, userAnswer };
    
    const ControlsContent = () => (
        <div className="space-y-4">
            <div><h4 className="font-semibold text-lg text-teal-300 mb-2">Keys</h4><div className="space-y-2"><div>{keysSharpOrder.map(key => (<button key={key} onClick={() => handleKeySelection(key)} className={`px-3 py-1 mr-1 mb-1 text-sm rounded-full font-semibold ${settings.selectedKeys.includes(key) ? 'bg-blue-600 text-white' : 'bg-slate-600'}`}>{key}</button>))}</div><div>{keysFlatOrder.map(key => (<button key={key} onClick={() => handleKeySelection(key)} className={`px-3 py-1 mr-1 mb-1 text-sm rounded-full font-semibold ${settings.selectedKeys.includes(key) ? 'bg-blue-600 text-white' : 'bg-slate-600'}`}>{key}</button>))}</div></div></div>
            <div><h4 className="font-semibold text-lg text-teal-300 mb-2">Game Modes</h4><div className="grid grid-cols-2 gap-2">{gameModes.map(mode => (<button key={mode.id} onClick={() => handleModeSelection(mode.id)} className={`p-2 text-sm rounded-md font-semibold ${settings.selectedModes.includes(mode.id) ? 'bg-blue-600 text-white' : 'bg-slate-600'}`}>{mode.label}</button>))}</div></div>
            <label className="flex items-center justify-between p-2 rounded-md bg-slate-600 cursor-pointer"><span className="font-semibold">Use 7th Chords</span><div className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={settings.use7thChords} onChange={(e) => handleSettingChange('use7thChords', e.target.checked)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-500 rounded-full peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></div></label>
            <div><h4 className="font-semibold text-lg text-teal-300 mb-2">Generation Method</h4><div className="flex bg-slate-600 rounded-md p-1 mt-1"><button onClick={() => handleSettingChange('generationMethod', 'weighted')} className={`flex-1 text-sm rounded-md py-1 ${settings.generationMethod === 'weighted' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Weighted</button><button onClick={() => handleSettingChange('generationMethod', 'random')} className={`flex-1 text-sm rounded-md py-1 ${settings.generationMethod === 'random' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Random</button></div></div>
            <div><h4 className="font-semibold text-lg text-teal-300 mb-2">Scale Degrees</h4><div className="grid grid-cols-4 gap-2">{Object.keys(settings.degreeToggles).map((degree, i) => (<button key={degree} onClick={() => handleDegreeToggle(degree)} className={`p-2 text-sm rounded-md font-mono ${settings.degreeToggles[degree] ? 'bg-blue-600 text-white' : 'bg-slate-600'}`}>{settings.use7thChords ? scaleDegreeNames.sevenths[i] : scaleDegreeNames.triads[i]}</button>))}</div></div>
            <label className="flex items-center justify-between p-2 rounded-md bg-slate-600 cursor-pointer"><span className="font-semibold">Use Alternate Symbols</span><div className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={settings.useAlternateSymbols} onChange={(e) => handleSettingChange('useAlternateSymbols', e.target.checked)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-500 rounded-full peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></div></label>
            <label className="flex items-center justify-between p-2 rounded-md bg-slate-600 cursor-pointer"><span className="font-semibold">Hide Quality (Challenge)</span><div className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={settings.hideQuality} onChange={(e) => handleSettingChange('hideQuality', e.target.checked)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-500 rounded-full peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></div></label>
        </div>
    );

    const renderPrompt = () => {
        const q = itemToDisplay.question;
        if (!q) return null;
        if (q.type === 'error') return <span className="text-red-400">{q.prompt}</span>;
        if (q.promptStructure) {
            return (<span className="text-2xl">{q.promptStructure.textParts[0]}<strong className="text-3xl font-bold text-teal-300 mx-2">{q.promptStructure.highlightParts[0].split(' ').map((c,i)=><ChordDisplay key={i} chord={c}/>).reduce((p,c)=>[p,' ',c])}</strong>{q.promptStructure.textParts[1]}<strong className="text-3xl font-bold text-teal-300">{q.promptStructure.highlightParts[1]}</strong>{q.promptStructure.textParts[2]}<strong className="text-3xl font-bold text-teal-300">{q.promptStructure.highlightParts[2]}</strong></span>);
        }
        return q.prompt.split('**').map((part, index) => (
            index % 2 === 1 ? <strong key={index} className="text-3xl font-bold text-teal-300"><ChordDisplay chord={part}/></strong> : <span key={index} className="text-2xl">{part}</span>
        ));
    };

    return (
        <div className="flex flex-col md:flex-row items-start w-full gap-4">
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Chord Trainer Guide">
                <div className="space-y-4 text-sm">
                    <div>
                        <h4 className="font-bold text-indigo-300 mb-1">Game Modes</h4>
                        <ul className="list-disc list-inside space-y-1">
                            <li><b>Name Chord:</b> Given a key and a Roman numeral, name the chord.</li>
                            <li><b>Name Numeral:</b> Given a key and a chord, name the Roman numeral.</li>
                            <li><b>Progression:</b> Given a key and a numeral progression, name all the chords.</li>
                            <li><b>Transpose:</b> Transpose a chord progression from one key to another.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-indigo-300 mt-2 mb-1">Answer Formatting</h4>
                        <p>Type your answer using standard notation (e.g., <span className="font-mono">C, F#m, Bbdim, Gmaj7, viim7b5</span>). For progressions, separate chords with a single space.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-indigo-300 mt-2">Challenge Mode: Hide Quality</h4>
                        <p>For a tougher workout, enable the "Hide Quality" toggle in the controls. This will hide whether a Roman numeral is major, minor, or diminished in the "Name Chord" and "Progression" modes, forcing you to recall the quality from theory.</p>
                    </div>
                </div>
            </InfoModal>
            <div className="w-full flex-1 bg-slate-800 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2"><h1 className="text-2xl font-bold text-indigo-300">Chord Trainer</h1><InfoButton onClick={() => setIsInfoModalOpen(true)} /></div>
                    <div className="flex items-center gap-2">
                        <button onClick={onGoToSetup} className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-lg text-sm">Menu</button>
                        <button onClick={() => setIsControlsOpen(p => !p)} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-sm font-semibold">Controls</button>
                    </div>
                </div>
                <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
                    <div className="w-full flex justify-between items-center mb-2 text-lg"><div className="flex gap-2">{history.length > 0 && <button onClick={startReview} disabled={isReviewing} className="bg-gray-600 text-sm py-1 px-3 rounded-lg">Review</button>}<button onClick={() => onLogSession(score, history)} className="bg-green-600 text-sm py-1 px-3 rounded-lg">Log</button></div><span className="font-semibold">Score: {score} / {history.length}</span></div>
                    <div className="w-full bg-slate-900/50 p-4 rounded-lg text-center min-h-[80px] flex justify-center items-center flex-wrap gap-x-2 mb-2">{renderPrompt()}</div>
                    {isReviewing ? (<div className="my-4 p-3 rounded-lg w-full bg-slate-700"><div className="w-full bg-slate-900/50 p-4 rounded-lg text-center min-h-[80px] flex justify-center items-center flex-wrap gap-x-2 mb-2">{renderPrompt()}</div><div className={`mt-4 text-center p-3 rounded-lg w-full ${itemToDisplay.wasCorrect ? 'bg-green-900/50':'bg-red-900/50'}`}><p className="font-bold">Correct: <span className="text-teal-300">{itemToDisplay.question.answer.split(' ').map((c,i)=><ChordDisplay key={i} chord={c}/>).reduce((p,c)=>[p,' ',c])}</span></p>{!itemToDisplay.wasCorrect && <p className="mt-1"><span className="font-bold">You:</span> <span className="text-red-400">{itemToDisplay.userAnswer}</span></p>}</div></div>) : (<div className={`text-xl my-4 min-h-[28px] ${feedback.startsWith('Correct') ? 'text-green-400' : 'text-red-400'}`}>{feedback || <div className="text-base italic text-gray-400">{currentQuestion && reminders[currentQuestion.mode]}</div>}</div>)}
                    <form onSubmit={(e)=>{e.preventDefault(); checkAnswer(userAnswer, settings.autoAdvance)}} className="w-full max-w-sm flex flex-col items-center">
                        <input ref={inputRef} type="text" value={isReviewing ? '' : userAnswer} onChange={(e) => setUserAnswer(e.target.value)} className="w-full text-center text-xl p-3 rounded-lg bg-slate-700" disabled={!!feedback || isReviewing} autoFocus />
                        <div className="h-20 mt-3 flex justify-center items-center">
                            {isReviewing ? (<div className="flex items-center gap-4"><button type="button" onClick={() => handleReviewNav(-1)} disabled={reviewIndex === 0}>Prev</button><button type="button" onClick={() => setReviewIndex(null)} className="bg-purple-600 p-3 rounded-lg">Return</button><button type="button" onClick={() => handleReviewNav(1)} disabled={reviewIndex === history.length - 1}>Next</button></div>) 
                            : !feedback ? (<button type="submit" className="bg-blue-600 p-3 rounded-lg">Submit</button>) 
                            : !settings.autoAdvance && (<button type="button" onClick={generateNewQuestion} className="bg-gray-600 p-3 rounded-lg animate-pulse">Next</button>)}
                        </div>
                    </form>
                    <label className="flex items-center gap-2 cursor-pointer"><div className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={settings.autoAdvance} onChange={(e) => handleSettingChange('autoAdvance', e.target.checked)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-500 rounded-full peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></div><span className="ml-2 font-semibold">Auto-Advance</span></label>
                </div>
            </div>
            <div className={`hidden md:block bg-slate-700 rounded-lg transition-all duration-300 ${isControlsOpen ? 'w-96 p-4' : 'w-0 overflow-hidden'}`}>{isControlsOpen && <ControlsContent />}</div>
            {isControlsOpen && (<div className="md:hidden fixed inset-0 z-50 flex justify-center items-center bg-black/60" onClick={() => setIsControlsOpen(false)}><div className="w-11/12 max-w-sm bg-slate-800 rounded-2xl p-4" onClick={e => e.stopPropagation()}><div className="flex-grow overflow-y-auto pr-2"><ControlsContent /></div></div></div>)}
        </div>
    );
};

const ChordTrainer = () => {
    const { addLogEntry } = useTools();
    const [screen, setScreen] = useState('setup');
    const [initialSettings, setInitialSettings] = useState(null);

    const handleStart = (settingsFromSetup) => {
        setInitialSettings({
            ...settingsFromSetup,
            degreeToggles: { 'I': true, 'ii': true, 'iii': true, 'IV': true, 'V': true, 'vi': true, 'vii°': true },
            useAlternateSymbols: false,
            autoAdvance: true,
            hideQuality: false,
        });
        setScreen('quiz');
    };
    
    const handleGoToSetup = () => {
        if (window.confirm("Are you sure you want to return to the menu? Your session will be lost.")) {
            setScreen('setup');
            setInitialSettings(null);
        }
    }
    
    const handleLogSession = (score, history) => {
        const remarks = prompt("Enter any remarks for this session:", `Score: ${score}/${history.length}`);
        if (remarks !== null) { addLogEntry({ game: 'Chord Trainer', date: new Date().toLocaleDateString(), remarks }); alert("Session logged!"); }
    };

    if (screen === 'setup') {
        return <SetupScreen onStart={handleStart} />;
    }
    
    if (screen === 'quiz' && initialSettings) {
        return <QuizScreen 
            key={JSON.stringify(initialSettings)}
            initialSettings={initialSettings} 
            onLogSession={handleLogSession} 
            onGoToSetup={handleGoToSetup}
        />;
    }

    return null;
};

export default ChordTrainer;