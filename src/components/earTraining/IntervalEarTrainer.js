import React, { useState, useEffect } from 'react';
import { useTools } from '../../context/ToolsContext';
import { useIntervalEarTrainer } from './useIntervalEarTrainer';
import InfoModal from '../common/InfoModal';
import InfoButton from '../common/InfoButton';
import { SEMITONE_TO_DEGREE } from '../../utils/musicTheory';

const IntervalEarTrainer = () => {
    const { addLogEntry, setDroneNote } = useTools();
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
        diatonicOptions, newKeyNotification, isKeyChanging
    } = useIntervalEarTrainer(settings);

    const isReviewing = reviewIndex !== null;

    useEffect(() => {
        if (currentQuestion) setSelectedNotes([]);
        if (currentQuestion && !isAnswered && !isReviewing) {
            const delay = (isKeyChanging && settings.rootNoteMode === 'Roving' && settings.useDrone) ? 3000 : 500;
            const timer = setTimeout(() => playQuestionAudio(), delay);
            return () => clearTimeout(timer);
        }
    }, [currentQuestion, isAnswered, isReviewing, playQuestionAudio, isKeyChanging, settings.rootNoteMode, settings.useDrone]);
    
    useEffect(() => {
        if (settings.useDrone) {
            setDroneNote(settings.fixedKey);
        }
    }, [settings.useDrone, settings.fixedKey, setDroneNote]);

    const handleLogProgress = () => {
        const remarks = prompt("Enter any remarks for this session:", `Score: ${score}/${totalAsked}`);
        if (remarks !== null) { addLogEntry({ game: 'Interval Ear Trainer', date: new Date().toLocaleDateString(), remarks }); alert("Session logged!"); }
    };

    const itemToDisplay = isReviewing ? history[reviewIndex] : null;
    const questionForDisplay = isReviewing ? itemToDisplay?.question : currentQuestion;
    const buttonsDisabled = isAnswered || isReviewing;
    const keyOptions = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F', 'Bb', 'Eb', 'Ab', 'Db'];
    const noteNameOptions = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

    const ControlsContent = () => (
        <div className="space-y-4 text-sm">
            <label className="flex items-center justify-between gap-2 cursor-pointer p-2 bg-slate-600 rounded-md">
                <span className="font-semibold text-green-300">Training Mode</span>
                <div className="relative inline-flex items-center"><input type="checkbox" checked={settings.isTrainingMode} onChange={(e) => setSettings(s => ({...s, isTrainingMode: e.target.checked}))} className="sr-only peer" /><div className="w-11 h-6 bg-gray-500 rounded-full peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div></div>
            </label>
            <div className="border-t border-slate-600 pt-4">
                <h4 className="font-semibold text-lg text-teal-300 mb-2">Playback Options</h4>
                <div className="flex bg-slate-600 rounded-md p-1"><button onClick={() => setSettings(s => ({...s, playbackStyle: 'Melodic'}))} className={`flex-1 rounded-md py-1 ${settings.playbackStyle === 'Melodic' ? 'bg-blue-600' : ''}`}>Melodic</button><button onClick={() => setSettings(s => ({...s, playbackStyle: 'Harmonic'}))} className={`flex-1 rounded-md py-1 ${settings.playbackStyle === 'Harmonic' ? 'bg-blue-600' : ''}`}>Harmonic</button></div>
                <div className="flex bg-slate-600 rounded-md p-1 mt-2"><button onClick={() => setSettings(s => ({...s, direction: 'Ascending'}))} className={`flex-1 rounded-md py-1 ${settings.direction === 'Ascending' ? 'bg-blue-600' : ''}`}>Ascending</button><button onClick={() => setSettings(s => ({...s, direction: 'Descending'}))} className={`flex-1 rounded-md py-1 ${settings.direction === 'Descending' ? 'bg-blue-600' : ''}`}>Descending</button><button onClick={() => setSettings(s => ({...s, direction: 'Both'}))} className={`flex-1 rounded-md py-1 ${settings.direction === 'Both' ? 'bg-blue-600' : ''}`}>Both</button></div>
                <label className="flex items-center justify-between gap-2 cursor-pointer p-2 mt-2 bg-slate-700 rounded-md"><span className="font-semibold">Use Drone</span><div className="relative inline-flex items-center"><input type="checkbox" checked={settings.useDrone} onChange={(e) => setSettings(s => ({...s, useDrone: e.target.checked}))} className="sr-only peer" /><div className="w-11 h-6 bg-gray-500 rounded-full peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></div></label>
                {settings.playbackStyle === 'Melodic' && settings.useDrone && <label className="flex items-center justify-between gap-2 cursor-pointer p-2 mt-2 bg-slate-700 rounded-md"><span className="font-semibold">Play First Note</span><div className="relative inline-flex items-center"><input type="checkbox" checked={settings.playRootNote} onChange={(e) => setSettings(s => ({...s, playRootNote: e.target.checked}))} className="sr-only peer" /><div className="w-11 h-6 bg-gray-500 rounded-full peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></div></label>}
            </div>
            <div className="border-t border-slate-600 pt-4">
                <h4 className="font-semibold text-lg text-teal-300 mb-2">Question Options</h4>
                <div className="flex bg-slate-600 rounded-md p-1"><button onClick={() => setSettings(s => ({...s, notePool: 'Chromatic'}))} className={`flex-1 rounded-md py-1 ${settings.notePool === 'Chromatic' ? 'bg-blue-600' : ''}`}>Chromatic</button><button onClick={() => setSettings(s => ({...s, notePool: 'Diatonic'}))} className={`flex-1 rounded-md py-1 ${settings.notePool === 'Diatonic' ? 'bg-blue-600' : ''}`}>Diatonic</button></div>
                {settings.notePool === 'Diatonic' && <div className="flex bg-slate-600 rounded-md p-1 mt-2"><button onClick={() => setSettings(s => ({...s, diatonicMode: 'Major'}))} className={`flex-1 rounded-md py-1 ${settings.diatonicMode === 'Major' ? 'bg-blue-600' : ''}`}>Major</button><button onClick={() => setSettings(s => ({...s, diatonicMode: 'Minor'}))} className={`flex-1 rounded-md py-1 ${settings.diatonicMode === 'Minor' ? 'bg-blue-600' : ''}`}>Minor</button></div>}
                <div className="flex items-center justify-between mt-2"><span className="font-semibold">Key/Root:</span><div className="flex bg-slate-600 rounded-md p-1"><button onClick={() => setSettings(s => ({...s, rootNoteMode: 'Fixed'}))} className={`px-2 rounded-md py-1 ${settings.rootNoteMode === 'Fixed' ? 'bg-blue-600' : ''}`}>Fixed</button><button onClick={() => setSettings(s => ({...s, rootNoteMode: 'Roving'}))} className={`px-2 rounded-md py-1 ${settings.rootNoteMode === 'Roving' ? 'bg-blue-600' : ''}`}>Roving</button></div></div>
                {settings.rootNoteMode === 'Fixed' && <select value={settings.fixedKey} onChange={(e) => setSettings(s=>({...s, fixedKey: e.target.value}))} className="w-full p-2 mt-2 bg-slate-600 rounded-md"> {keyOptions.map(n => <option key={n} value={n}>{n}</option>)} </select>}
                {settings.rootNoteMode === 'Roving' && 
                    <>
                        <div className="flex items-center gap-2 mt-2"><label htmlFor="qpr">Questions per Key:</label><input type="number" id="qpr" min="1" max="20" value={settings.questionsPerRoot} onChange={e => setSettings(s=>({...s, questionsPerRoot: Number(e.target.value)}))} className="w-16 p-1 bg-slate-600 rounded-md text-center"/></div>
                        <label className="flex items-center justify-between gap-2 cursor-pointer p-2 mt-2 bg-slate-700 rounded-md"><span className="font-semibold">Show Key Change Alert</span><div className="relative inline-flex items-center"><input type="checkbox" checked={settings.showKeyChange} onChange={(e) => setSettings(s => ({...s, showKeyChange: e.target.checked}))} className="sr-only peer" /><div className="w-11 h-6 bg-gray-500 rounded-full peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></div></label>
                    </>
                }
                <div className="mt-2"><label htmlFor="octave-range" className="font-semibold">Octave Range: {settings.octaveRange}</label><input type="range" id="octave-range" min="1" max="3" step="1" value={settings.octaveRange} onChange={e => setSettings(s=>({...s, octaveRange: Number(e.target.value)}))} className="w-full h-2 mt-1 bg-slate-600 rounded-lg appearance-none cursor-pointer" /></div>
            </div>
            <div className="border-t border-slate-600 pt-4">
                <h4 className="font-semibold text-lg text-teal-300 mb-2">Answer Mode</h4>
                <div className="flex bg-slate-600 rounded-md p-1"><button onClick={() => setSettings(s => ({...s, answerMode: 'Interval Name'}))} className={`flex-1 rounded-md py-1 ${settings.answerMode === 'Interval Name' ? 'bg-blue-600' : ''}`}>Interval Name</button><button onClick={() => setSettings(s => ({...s, answerMode: 'Scale Degree'}))} className={`flex-1 rounded-md py-1 ${settings.answerMode === 'Scale Degree' ? 'bg-blue-600' : ''}`}>Scale Degree</button><button onClick={() => setSettings(s => ({...s, answerMode: 'Note Names'}))} className={`flex-1 rounded-md py-1 ${settings.answerMode === 'Note Names' ? 'bg-blue-600' : ''}`}>Note Names</button></div>
            </div>
        </div>
    );
    
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
            const handleNoteNameSelect = (note) => {
                if (buttonsDisabled) return;
                setSelectedNotes(prev => prev.includes(note) ? prev.filter(n => n !== note) : [...prev, note].slice(0, 2));
            };
            return (
                <div className="w-full flex flex-col items-center gap-2">
                    <p className="text-sm text-gray-400">Select the two notes you heard. (Octaves are excluded in this mode)</p>
                    <div className="grid grid-cols-6 gap-1 w-full">
                        {noteNameOptions.map(note => <button key={note} onClick={() => handleNoteNameSelect(note)} disabled={buttonsDisabled} className={`py-3 rounded-md font-semibold ${selectedNotes.includes(note) ? 'bg-indigo-600 text-white' : 'bg-slate-600 hover:bg-slate-500'}`}>{note.replace('b','♭')}</button>)}
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

            <div className="w-full flex-1 bg-slate-800 p-4 rounded-lg relative">
                {newKeyNotification && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white text-2xl font-bold p-6 rounded-lg z-20 animate-pulse-once">{newKeyNotification}</div>}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2"><h1 className="text-2xl font-bold text-indigo-300">Interval Recognition</h1><InfoButton onClick={() => setIsInfoModalOpen(true)} /></div>
                    <div className="flex items-center gap-2"><button onClick={handleLogProgress} className="bg-green-600 hover:bg-green-500 text-white font-bold py-1 px-3 rounded-lg text-sm">Log</button><button onClick={() => setIsControlsOpen(p => !p)} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-sm font-semibold">Controls</button></div>
                </div>
                <div className="grid grid-cols-3 items-center mb-4 text-lg">
                    <span className="font-semibold justify-self-start">Score: {score} / {totalAsked}</span>
                    <div className="justify-self-center">{history.length > 0 && <button onClick={startReview} disabled={isReviewing} className="bg-gray-600 hover:bg-gray-500 text-sm py-1 px-3 rounded-lg">Review History</button>}</div>
                    <label className="flex items-center gap-2 cursor-pointer font-semibold justify-self-end"><span>Auto-Advance</span><div className="relative inline-flex items-center"><input type="checkbox" checked={settings.autoAdvance} onChange={(e) => setSettings(s => ({...s, autoAdvance: e.target.checked}))} className="sr-only peer" /><div className="w-11 h-6 bg-gray-500 rounded-full peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></div></label>
                </div>
                
                <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
                    <div className="w-full bg-slate-900/50 p-4 rounded-lg text-center min-h-[80px] flex justify-center items-center flex-wrap gap-x-2 mb-4">
                        <button onClick={() => playQuestionAudio(questionForDisplay)} disabled={isAnswered} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg text-xl disabled:opacity-50 disabled:cursor-not-allowed">Replay Sound</button>
                    </div>
                    <div className={`text-xl my-4 min-h-[28px]`}>
                        {isReviewing ? (
                            itemToDisplay.wasCorrect ? 
                            <span className="text-green-400 font-semibold">Correct: {renderCorrectAnswerForReview(itemToDisplay)}</span> :
                            <span className="text-gray-300">Your Answer: <span className="text-red-400">{itemToDisplay.userAnswer}</span> | Correct: <span className="text-teal-300">{renderCorrectAnswerForReview(itemToDisplay)}</span></span>
                        ) : (
                            <span className={feedback.type === 'correct' ? 'text-green-400' : 'text-red-400'}>{feedback.message || <>&nbsp;</>}</span>
                        )}
                    </div>
                    <AnswerButtons />
                    <div className="h-20 mt-4 flex justify-center items-center">
                        {isReviewing ? (<div className="flex items-center gap-4"><button type="button" onClick={() => handleReviewNav(-1)} disabled={reviewIndex === 0} className="p-3 rounded-lg bg-slate-600 hover:bg-slate-500">Prev</button><button type="button" onClick={() => setReviewIndex(null)} className="bg-purple-600 p-3 rounded-lg font-bold">Return to Quiz</button><button type="button" onClick={() => handleReviewNav(1)} disabled={reviewIndex === history.length - 1} className="p-3 rounded-lg bg-slate-600 hover:bg-slate-500">Next</button></div>) 
                        : (isAnswered && !settings.autoAdvance && settings.answerMode !== 'Note Names') && (<button onClick={generateNewQuestion} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg animate-pulse">Next Question</button>)}
                    </div>
                </div>
            </div>

            <div className={`hidden md:block bg-slate-700 rounded-lg transition-all duration-300 ${isControlsOpen ? 'w-80 p-4' : 'w-0 overflow-hidden'}`}>{isControlsOpen && <ControlsContent />}</div>
            {isControlsOpen && (<div className="md:hidden fixed inset-0 z-50 flex justify-center items-center bg-black/60" onClick={() => setIsControlsOpen(false)}><div className="w-11/12 max-w-sm bg-slate-800 rounded-2xl p-4 overflow-y-auto" onClick={e => e.stopPropagation()}><ControlsContent /></div></div>)}
        </div>
    );
};

export default IntervalEarTrainer;