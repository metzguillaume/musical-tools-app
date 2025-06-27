import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTools } from '../context/ToolsContext';

const NameTheIntervalQuiz = () => {
    const { bpm, addLogEntry } = useTools();
    const [score, setScore] = useState(0);
    const [note1, setNote1] = useState('C');
    const [note2, setNote2] = useState('E');
    const [feedback, setFeedback] = useState({ message: '', type: '' });
    const [correctInterval, setCorrectInterval] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [selected, setSelected] = useState({ quality: null, number: null });
    const lastQuestionRef = useRef(null);

    const quizData = React.useMemo(() => ({
        qualities: ['Diminished', 'Minor', 'Perfect', 'Major', 'Augmented'],
        numericButtons: ['Unison / Octave', '2nd', '3rd', '4th', '5th', '6th', '7th'],
        intervals: [{ name: 'Perfect Unison', semitones: 0, quality: 'Perfect', number: 'Unison' }, { name: 'Minor 2nd', semitones: 1, quality: 'Minor', number: '2nd' }, { name: 'Major 2nd', semitones: 2, quality: 'Major', number: '2nd' }, { name: 'Minor 3rd', semitones: 3, quality: 'Minor', number: '3rd' }, { name: 'Major 3rd', semitones: 4, quality: 'Major', number: '3rd' }, { name: 'Perfect 4th', semitones: 5, quality: 'Perfect', number: '4th' }, { name: 'Augmented 4th', semitones: 6, quality: 'Augmented', number: '4th' }, { name: 'Diminished 5th', semitones: 6, quality: 'Diminished', number: '5th' }, { name: 'Perfect 5th', semitones: 7, quality: 'Perfect', number: '5th' }, { name: 'Minor 6th', semitones: 8, quality: 'Minor', number: '6th' }, { name: 'Major 6th', semitones: 9, quality: 'Major', number: '6th' }, { name: 'Minor 7th', semitones: 10, quality: 'Minor', number: '7th' }, { name: 'Major 7th', semitones: 11, quality: 'Major', number: '7th' }, { name: 'Perfect Octave', semitones: 12, quality: 'Perfect', number: 'Octave' }],
        naturalNoteAlphabeticalIndex: { 'C': 0, 'D': 1, 'E': 2, 'F': 3, 'G': 4, 'A': 5, 'B': 6 },
        alphabeticalIndexToNaturalNote: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
        naturalNoteSemitoneOffsetFromC: { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 }
    }), []);

    const startNewRound = useCallback(() => {
        let newNote1, newNote2, chosenInterval;
        do {
            chosenInterval = quizData.intervals[Math.floor(Math.random() * quizData.intervals.length)];
            const { naturalNoteAlphabeticalIndex, alphabeticalIndexToNaturalNote, naturalNoteSemitoneOffsetFromC } = quizData;
            const rootNoteName = alphabeticalIndexToNaturalNote[Math.floor(Math.random() * 7)];
            const accidentalVal = Math.floor(Math.random() * 3) - 1;
            let rootAccidental = '';
            if (accidentalVal === 1) rootAccidental = '#'; if (accidentalVal === -1) rootAccidental = 'b';
            const note1Base = rootNoteName + rootAccidental;
            const intervalNumber = parseInt(chosenInterval.name.match(/\d+/)?.[0] || (chosenInterval.name.includes('Unison') ? 1 : 8), 10);
            const rootNoteIndex = naturalNoteAlphabeticalIndex[rootNoteName];
            const targetNoteIndex = (rootNoteIndex + intervalNumber - 1) % 7;
            const targetNoteName = alphabeticalIndexToNaturalNote[targetNoteIndex];
            const rootNoteNaturalMidi = naturalNoteSemitoneOffsetFromC[rootNoteName];
            const rootNoteActualMidi = rootNoteNaturalMidi + accidentalVal;
            let targetNoteNaturalMidi = naturalNoteSemitoneOffsetFromC[targetNoteName];
            if (targetNoteIndex < rootNoteIndex || chosenInterval.number === 'Octave') targetNoteNaturalMidi += 12;
            const targetNoteActualMidi = rootNoteActualMidi + chosenInterval.semitones;
            const accidentalDifference = targetNoteActualMidi - targetNoteNaturalMidi;
            let targetAccidental = '';
            if (accidentalDifference === 1) targetAccidental = '#'; else if (accidentalDifference === 2) targetAccidental = '##'; else if (accidentalDifference === -1) targetAccidental = 'b'; else if (accidentalDifference === -2) targetAccidental = 'bb'; else if (accidentalDifference !== 0) continue;
            const note2Base = targetNoteName + targetAccidental;
            if (lastQuestionRef.current && note1Base === lastQuestionRef.current.note1 && note2Base === lastQuestionRef.current.note2) continue;
            newNote1 = note1Base; newNote2 = note2Base; break;
        } while (true);
        setNote1(newNote1); setNote2(newNote2); setCorrectInterval(chosenInterval);
        lastQuestionRef.current = { note1: newNote1, note2: newNote2 };
        setFeedback({ message: '', type: '' }); setSelected({ quality: null, number: null }); setIsAnswered(false);
    }, [quizData]);

    useEffect(() => { startNewRound(); }, [startNewRound]);

    const checkAnswer = useCallback(() => {
        if (isAnswered) return;
        let isCorrect = false;
        if (selected.number === 'Unison / Octave') { if (selected.quality === 'Perfect' && (correctInterval.number === 'Unison' || correctInterval.number === 'Octave')) isCorrect = true; }
        else { if (selected.quality === correctInterval.quality && selected.number === correctInterval.number) isCorrect = true; }
        if (isCorrect) { setScore(s => s + 1); setFeedback({ message: 'Correct!', type: 'correct' }); }
        else { setFeedback({ message: `Incorrect! It was ${correctInterval.name}.`, type: 'incorrect' }); }
        setIsAnswered(true);
    }, [isAnswered, selected, correctInterval]);

    useEffect(() => {
        const handleKeyDown = (event) => { if (event.key === 'Enter') { if (isAnswered) startNewRound(); else if (selected.quality && selected.number) checkAnswer(); } };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isAnswered, selected, startNewRound, checkAnswer]);

    const handleLogProgress = () => {
        const remarks = prompt("Enter any remarks for this session:", `Score: ${score}`);
        if (remarks !== null) {
            addLogEntry({ game: 'Name The Interval', bpm, date: new Date().toLocaleDateString(), remarks: remarks || "No remarks." });
            alert("Session logged!");
        }
    };

    const handleSelection = (type, value) => { if (isAnswered) return; setSelected(prev => ({ ...prev, [type]: value })); };

    return (
        <div className="bg-slate-800 p-8 rounded-lg w-full max-w-lg mx-auto text-center">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-extrabold text-indigo-300">Name The Interval</h1>
                <button onClick={handleLogProgress} className="bg-green-600 hover:bg-green-500 text-white font-bold py-1 px-3 rounded-lg text-sm">Log Session</button>
            </div>
            <div className="text-xl mb-6 text-gray-300">Score: {score}</div>
            <div className="flex justify-center items-center gap-5 mb-6"><div className="text-6xl font-bold text-teal-300 p-4 bg-slate-700 rounded-lg w-32">{note1}</div><div className="text-6xl font-bold text-teal-300 p-4 bg-slate-700 rounded-lg w-32">{note2}</div></div>
            <div className={`text-lg font-bold my-4 min-h-[28px] ${feedback.type === 'correct' ? 'text-green-400' : 'text-red-400'}`}>{feedback.message || <>&nbsp;</>}</div>
            <div className="text-center text-gray-400 mb-4 min-h-[24px] animate-pulse">{!isAnswered && selected.quality && selected.number && "Press Enter to Submit"}{isAnswered && "Press Enter for Next Question"}</div>
            <div className="grid grid-cols-2 gap-6">
                <div><h3 className="text-lg font-semibold text-gray-400 mb-3">Quality</h3><div className="flex flex-col gap-2">{quizData.qualities.map(q => (<button key={q} onClick={() => handleSelection('quality', q)} disabled={isAnswered} className={`p-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${selected.quality === q ? 'bg-blue-600 text-white' : 'bg-teal-600 hover:bg-teal-500'}`}>{q}</button>))}</div></div>
                <div><h3 className="text-lg font-semibold text-gray-400 mb-3">Number</h3><div className="grid grid-cols-2 gap-2">{quizData.numericButtons.map(n => (<button key={n} onClick={() => handleSelection('number', n)} disabled={isAnswered} className={`p-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${selected.number === n ? 'bg-blue-600 text-white' : 'bg-teal-600 hover:bg-teal-500'}`}>{n}</button>))}</div></div>
            </div>
        </div>
    );
};

export default NameTheIntervalQuiz;
