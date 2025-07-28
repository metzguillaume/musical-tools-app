import React, { useState } from 'react';
import { useTools } from '../../context/ToolsContext';
// UPDATED: Corrected import paths
import FretboardDiagram from '../common/FretboardDiagram';
import InfoModal from '../common/InfoModal';
import InfoButton from '../common/InfoButton';
import { useIntervalFretboardQuiz, quizData } from './useIntervalFretboardQuiz';

const IntervalFretboardQuiz = () => {
    const { addLogEntry } = useTools();
    const [autoAdvance, setAutoAdvance] = useState(true);
    const [playAudio, setPlayAudio] = useState(true);
    const [labelType, setLabelType] = useState('name');
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    const {
        score, currentQuestion, feedback, isAnswered, selected, setSelected, history, reviewIndex, setReviewIndex,
        startNewRound, handleReviewNav, startReview, replayAudioForHistoryItem
    } = useIntervalFretboardQuiz(autoAdvance, playAudio);
    
    const isReviewing = reviewIndex !== null;

    const handleLogProgress = () => {
        const remarks = prompt("Enter any remarks for this session:", `Score: ${score}/${history.length}`);
        if (remarks !== null) { addLogEntry({ game: 'Interval Fretboard Quiz', date: new Date().toLocaleDateString(), remarks }); alert("Session logged!"); }
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

    return (
        <div className="bg-slate-800 p-4 md:p-8 rounded-lg w-full max-w-2xl mx-auto text-center">
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="How to Play: Intervals on Fretboard">
                <p>A diagram of a guitar fretboard will be displayed with two notes.</p>
                <p>The green note marked 'R' is the **root note**.</p>
                <p>Your goal is to identify the interval between the root note and the second note by its shape.</p>
                <p className="mt-2">Enable the <b>Play Audio</b> toggle to hear the interval after you answer, reinforcing your ear training.</p>
                <p className="mt-2">Use the <b>Note / Degree</b> toggle to choose how the note labels are displayed after you answer.</p>
            </InfoModal>

            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-indigo-300">Fretboard Intervals</h1>
                    <InfoButton onClick={() => setIsInfoModalOpen(true)} />
                </div>
            </div>
            
            <div className="w-full flex justify-between items-center mb-2 text-lg">
                <div className="flex gap-2">
                    {history.length > 0 && <button onClick={startReview} disabled={isReviewing} className="bg-gray-600 hover:bg-gray-500 text-sm py-1 px-3 rounded-lg">Review</button>}
                    <button onClick={handleLogProgress} className="bg-green-600 hover:bg-green-500 text-sm py-1 px-3 rounded-lg">Log</button>
                </div>
                <span className="font-semibold">Score: {score} / {history.length}</span>
            </div>
            
            <FretboardDiagram notesToDisplay={itemToDisplay.question.notes} showLabels={isReviewing || isAnswered} startFret={0} fretCount={12} labelType={labelType} />
            
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
                ) : isAnswered && !autoAdvance && (
                    <button onClick={startNewRound} className="bg-blue-600 p-3 rounded-lg text-xl animate-pulse">Next Question</button>
                )}
            </div>

            <div className="w-full border-t border-slate-600 pt-4 mt-6 flex flex-wrap justify-center items-center gap-6">
                <div className="flex bg-slate-700 rounded-md p-1">
                    <button onClick={() => setLabelType('name')} className={`px-3 py-1 text-sm rounded-md ${labelType === 'name' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Note Name</button>
                    <button onClick={() => setLabelType('degree')} className={`px-3 py-1 text-sm rounded-md ${labelType === 'degree' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}>Scale Degree</button>
                </div>
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                    <span>Play Audio</span>
                    <div className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={playAudio} onChange={() => setPlayAudio(p => !p)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-500 rounded-full peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                    <span>Auto-Advance</span>
                    <div className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={autoAdvance} onChange={() => setAutoAdvance(p => !p)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-500 rounded-full peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></div>
                </label>
            </div>
        </div>
    );
};

export default IntervalFretboardQuiz;