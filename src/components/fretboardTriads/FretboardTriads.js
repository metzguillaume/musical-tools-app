import React, { useState, useMemo, useEffect } from 'react';
import { useTools } from '../../context/ToolsContext';
import InfoModal from '../common/InfoModal';
import QuizLayout from '../common/QuizLayout';
import FretboardDiagram from '../common/FretboardDiagram';
import { useFretboardTriads, ROOT_NOTE_OPTIONS, TRIAD_QUALITIES, TRIAD_INVERSIONS } from './useFretboardTriads';
import { FretboardTriadsControls } from './FretboardTriadsControls';
import { getChordNoteNames, CHORDS, NOTE_TO_MIDI_CLASS } from '../../utils/musicTheory';

const FretboardTriads = ({ onProgressUpdate }) => {
    const { addLogEntry, savePreset, presetToLoad, clearPresetToLoad } = useTools();
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isControlsOpen, setIsControlsOpen] = useState(false);

    const [settings, setSettings] = useState({
        modes: { identify: true, constructHorizontally: true, constructVertically: true },
        stringSets: { 'E A D': true, 'A D G': true, 'D G B': true, 'G B e': true },
        qualities: { Major: true, Minor: true, Diminished: false, Augmented: false, Sus2: false, Sus4: false },
        inversions: { Root: true, '1st': true, '2nd': true },
        autoAdvance: true,
        postAnswerDisplay: 'degrees',
        showRootHint: false,
    });

    useEffect(() => {
        if (presetToLoad && presetToLoad.gameId === 'fretboard-triads') {
            setSettings(prevSettings => ({
                ...prevSettings,
                ...presetToLoad.settings,
                modes: { ...prevSettings.modes, ...presetToLoad.settings.modes },
                stringSets: { ...prevSettings.stringSets, ...presetToLoad.settings.stringSets },
                qualities: { ...prevSettings.qualities, ...presetToLoad.settings.qualities },
                inversions: { ...prevSettings.inversions, ...presetToLoad.settings.inversions },
            }));
            clearPresetToLoad();
        }
    }, [presetToLoad, clearPresetToLoad]);

    const questionSettings = useMemo(() => ({
        modes: settings.modes,
        stringSets: settings.stringSets,
        qualities: settings.qualities,
        inversions: settings.inversions,
    }), [settings.modes, settings.stringSets, settings.qualities, settings.inversions]);

    const quiz = useFretboardTriads(questionSettings, onProgressUpdate);
    const { itemToDisplay, isAnswered, isReviewing, history, userAnswer } = quiz;
    
    useEffect(() => {
        // Auto-submit logic for Identify mode
        if (settings.autoAdvance && !isAnswered && !isReviewing &&
            itemToDisplay.question?.mode === 'identify' &&
            userAnswer.root && userAnswer.quality && userAnswer.inversion
        ) {
            quiz.checkAnswer(true);
        }
    }, [userAnswer, settings.autoAdvance, isAnswered, isReviewing, itemToDisplay.question, quiz]);


    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSavePreset = () => {
        const name = prompt("Enter a name for your preset:", "Fretboard Triads Custom");
        if (name && name.trim() !== "") {
            savePreset({
                id: `ft-${Date.now()}`,
                name: name.trim(),
                gameId: 'fretboard-triads',
                gameName: 'Fretboard Triads',
                settings: settings,
            });
            alert(`Preset "${name.trim()}" saved!`);
        }
    };

    const handleLogProgress = () => {
        const remarks = prompt("Enter any remarks for this session:", `Score: ${quiz.score}/${quiz.totalAsked}`);
        if (remarks !== null) {
            addLogEntry({ game: 'Fretboard Triads', date: new Date().toLocaleDateString(), remarks });
            alert("Session logged!");
        }
    };

    const notesForDiagram = useMemo(() => {
        if (!itemToDisplay?.question || (!itemToDisplay.question.notes && !itemToDisplay.question.answer?.notes)) return [];

        const { question } = itemToDisplay;
        
        if (isAnswered || isReviewing) {
            const { root, quality } = question.answer;

            // --- CORRECTED LOGIC ---
            const correctNoteNamesMap = {};
            const correctNoteNames = getChordNoteNames(root, quality);
            const intervals = CHORDS[quality]?.intervals;
            const rootMidiClass = NOTE_TO_MIDI_CLASS[root];

            if (correctNoteNames && intervals && rootMidiClass !== undefined) {
                 intervals.forEach((interval, index) => {
                    const midiClass = (rootMidiClass + interval) % 12;
                    if (correctNoteNames[index]) {
                       correctNoteNamesMap[midiClass] = correctNoteNames[index];
                    }
                 });
            }
            // --- END CORRECTION ---

            const getNoteLabel = (note) => {
                if (settings.postAnswerDisplay === 'degrees') return note.degree;
                const midiClass = note.midi % 12;
                return correctNoteNamesMap[midiClass] || note.label;
            };
            
            const wasCorrect = isReviewing ? itemToDisplay.wasCorrect : (history.length > 0 ? history[history.length - 1].wasCorrect : false);
            const correctNotes = question.answer.notes || question.notes;
            
            const styledCorrectNotes = correctNotes.map(note => ({
                ...note,
                overrideLabel: getNoteLabel(note),
                overrideColor: note.isRoot ? '#22c55e' : '#3b82f6',
            }));

            if (wasCorrect) {
                return styledCorrectNotes;
            }

            const userNotes = itemToDisplay.userAnswer.notes || [];

// Normalize the correct notes for comparison.
const correctNoteNormalizedSet = new Set(correctNotes.map(n => `${n.string}-${n.fret % 12}`));

const incorrectClicksStyled = userNotes
    // A user note is incorrect if its normalized version isn't in the correct set.
    .filter(n => !correctNoteNormalizedSet.has(`${n.string}-${n.fret % 12}`))
    .map(note => ({ ...note, label: getNoteLabel(note), overrideColor: '#f97316' }));

return [...styledCorrectNotes, ...incorrectClicksStyled];
        }

        // Logic for before answering
        if (question.mode === 'identify') {
            if (settings.showRootHint) {
                return question.notes.map(note => ({
                    ...note,
                    label: '',
                    overrideColor: note.isRoot ? '#22c55e' : undefined,
                }));
            }
            return question.notes.map(note => ({ ...note, isRoot: false, label: '' }));
        }
        return (userAnswer.notes || []).map(n => ({ ...n, overrideColor: '#3b82f6' }));

    }, [itemToDisplay, isAnswered, isReviewing, userAnswer.notes, history, settings.postAnswerDisplay, settings.showRootHint]);


    const renderPrompt = () => {
        const prompt = itemToDisplay.question?.prompt;
        if (!prompt) return null;
        return (
            <span>
                {prompt.text1}
                {prompt.highlight1 && <strong className="text-teal-300">{prompt.highlight1}</strong>}
                {prompt.text2}
                {prompt.highlight2 && <strong className="text-teal-300">{prompt.highlight2}</strong>}
            </span>
        );
    };

    const renderAnswerArea = () => {
        if (!itemToDisplay.question || isReviewing) return null;

        if (itemToDisplay.question.mode === 'identify') {
            return (
                <div className="space-y-4 max-w-2xl mx-auto">
                    <div><h3 className="text-base font-semibold text-gray-400 mb-2">Root Note</h3><div className="grid grid-cols-4 md:grid-cols-6 gap-1">{ROOT_NOTE_OPTIONS.map(note => <button key={note.value} onClick={() => quiz.handleAnswerSelect('root', note.value)} className={`py-3 px-1 rounded font-semibold text-xs md:text-sm ${userAnswer.root === note.value ? 'bg-indigo-600 text-white' : 'bg-teal-600 hover:bg-teal-500'}`}>{note.display}</button>)}</div></div>
                    <div><h3 className="text-base font-semibold text-gray-400 mb-2">Quality</h3><div className="grid grid-cols-3 gap-2">{TRIAD_QUALITIES.map(q => <button key={q} onClick={() => quiz.handleAnswerSelect('quality', q)} disabled={!settings.qualities[q]} className={`py-3 font-semibold capitalize text-base ${userAnswer.quality === q ? 'bg-indigo-600 text-white' : 'bg-teal-600 hover:bg-teal-500'} disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed`}>{q}</button>)}</div></div>
                    <div><h3 className="text-base font-semibold text-gray-400 mb-2">Inversion</h3><div className="grid grid-cols-3 gap-2">{TRIAD_INVERSIONS.map(inv => <button key={inv} onClick={() => quiz.handleAnswerSelect('inversion', inv)} className={`py-3 font-semibold text-base ${userAnswer.inversion === inv ? 'bg-indigo-600 text-white' : 'bg-teal-600 hover:bg-teal-500'}`}>{inv}</button>)}</div></div>
                </div>
            );
        } else { // Construct modes
             if (isAnswered) return null;
            return (
                <div className="flex justify-center gap-4 max-w-lg mx-auto">
                    <button onClick={() => quiz.setUserAnswer({ notes: [] })} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg">Clear</button>
                    <button onClick={() => quiz.checkAnswer(settings.autoAdvance)} disabled={!userAnswer.notes || userAnswer.notes.length === 0} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg disabled:bg-gray-500">Submit</button>
                </div>
            );
        }
    };

    const topControlsContent = (
      <label className="flex items-center gap-2 cursor-pointer font-semibold">
          <span>Auto-Advance</span>
          <div className="relative">
              <input type="checkbox" checked={settings.autoAdvance} onChange={() => handleSettingChange('autoAdvance', !settings.autoAdvance)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full after:content[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </div>
      </label>
    );

    const wasCorrect = history.length > 0 ? history[history.length - 1].wasCorrect : true;
    const footerContent = isReviewing ? (
        <div className="flex items-center justify-center gap-4 w-full">
            <button onClick={() => quiz.handleReviewNav(-1)} disabled={quiz.reviewIndex === 0} className="bg-slate-600 hover:bg-slate-500 font-bold p-3 rounded-lg disabled:opacity-50">Prev</button>
            <button onClick={() => quiz.setReviewIndex(null)} className="bg-purple-600 hover:bg-purple-500 font-bold p-3 rounded-lg text-xl">Return to Quiz</button>
            <button onClick={() => quiz.handleReviewNav(1)} disabled={quiz.reviewIndex === history.length - 1} className="bg-slate-600 hover:bg-slate-500 font-bold p-3 rounded-lg disabled:opacity-50">Next</button>
        </div>
    ) : isAnswered && (!settings.autoAdvance || !wasCorrect) ? (
         <button onClick={quiz.generateNewQuestion} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-lg animate-pulse">Next Question</button>
    ) : (!isAnswered && itemToDisplay.question?.mode === 'identify' && !settings.autoAdvance) ? (
        <button onClick={() => quiz.checkAnswer(settings.autoAdvance)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg">Submit</button>
    ) : null;

    return (
        <div className="flex flex-col md:flex-row items-start w-full gap-4">
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Fretboard Triads Guide">
                <p>Test your knowledge of triad shapes and inversions across the fretboard.</p>
                <h4 className="font-bold text-indigo-300 mt-4">Game Modes</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                    <li><strong>Identify:</strong> A triad shape is shown. You must identify its root, quality, and inversion.</li>
                    <li><strong>Construct Horizontally:</strong> You're given a triad and a string set. Find all three inversions on those strings.</li>
                    <li><strong>Construct Vertically:</strong> You're given a triad and an inversion. Find that specific shape on all possible string sets.</li>
                </ul>
                <h4 className="font-bold text-indigo-300 mt-4">Display Options</h4>
                 <ul className="list-disc list-inside text-sm space-y-1">
                    <li><strong>Show Root Hint:</strong> In 'Identify' mode, the root note of the triad will be colored green to help you find your bearings. This is off by default.</li>
                </ul>
            </InfoModal>

            <QuizLayout
                title="Fretboard Triads"
                score={quiz.score}
                totalAsked={quiz.totalAsked}
                history={history}
                isReviewing={isReviewing}
                onStartReview={quiz.handleEnterReview}
                topControls={topControlsContent}
                footerContent={footerContent}
                onLogProgress={handleLogProgress}
                onToggleControls={() => setIsControlsOpen(p => !p)}
                onShowInfo={() => setIsInfoModalOpen(true)}
            >
                <div className="text-center text-xl sm:text-2xl font-semibold text-gray-300 my-4">{renderPrompt()}</div>
                <div className="my-4"><FretboardDiagram notesToDisplay={notesForDiagram} onBoardClick={quiz.handleFretClick} showLabels={isAnswered || isReviewing} /></div>
                <div className={`my-4 min-h-[60px] flex flex-col justify-center`}>
                    <p className={`text-lg font-bold text-center ${quiz.feedback.type === 'correct' ? 'text-green-400' : 'text-red-400'}`}>{quiz.feedback.message || <>&nbsp;</>}</p>
                </div>
                {renderAnswerArea()}
            </QuizLayout>
            
            <div className={`hidden md:block bg-slate-700 rounded-lg transition-all duration-300 ease-in-out ${isControlsOpen ? 'w-80 p-4' : 'w-0 p-0 overflow-hidden'}`}>
                <div className={`${!isControlsOpen && 'hidden'}`}>
                     <h3 className="text-xl font-bold text-teal-300 mb-4">Settings & Controls</h3>
                    <FretboardTriadsControls settings={settings} onSettingChange={handleSettingChange} onSavePreset={handleSavePreset} />
                </div>
            </div>

            {isControlsOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex justify-center items-center bg-black/60" onClick={() => setIsControlsOpen(false)}>
                    <div className="w-11/12 max-w-sm bg-slate-800 rounded-2xl p-4 max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex-shrink-0 flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-teal-300">Settings & Controls</h3><button onClick={() => setIsControlsOpen(false)} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button></div>
                        <div className="flex-grow overflow-y-auto pr-2">
                           <FretboardTriadsControls settings={settings} onSettingChange={handleSettingChange} onSavePreset={handleSavePreset} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FretboardTriads;