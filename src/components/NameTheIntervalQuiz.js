import React, { useState, useEffect, useCallback } from 'react';

// This is the React version of the "Name The Interval Quiz"
const NameTheIntervalQuiz = () => {
    const [score, setScore] = useState(0);
    const [note1, setNote1] = useState('C');
    const [note2, setNote2] = useState('E');
    const [feedback, setFeedback] = useState({ message: '', type: '' });
    const [correctInterval, setCorrectInterval] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [selected, setSelected] = useState({ quality: null, number: null });
    const [lastQuestion, setLastQuestion] = useState(null);

    // Memoize musical data to prevent re-declaration on every render
    const quizData = React.useMemo(() => ({
        qualities: ['Diminished', 'Minor', 'Perfect', 'Major', 'Augmented'],
        numericButtons: ['Unison / Octave', '2nd', '3rd', '4th', '5th', '6th', '7th'],
        intervals: [
            { name: 'Perfect Unison', semitones: 0, genericType: 'unison', quality: 'Perfect', number: 'Unison' },
            { name: 'Minor 2nd', semitones: 1, genericType: 'second', quality: 'Minor', number: '2nd' },
            { name: 'Major 2nd', semitones: 2, genericType: 'second', quality: 'Major', number: '2nd' },
            { name: 'Minor 3rd', semitones: 3, genericType: 'third', quality: 'Minor', number: '3rd' },
            { name: 'Major 3rd', semitones: 4, genericType: 'third', quality: 'Major', number: '3rd' },
            { name: 'Perfect 4th', semitones: 5, genericType: 'fourth', quality: 'Perfect', number: '4th' },
            { name: 'Augmented 4th', semitones: 6, genericType: 'fourth', quality: 'Augmented', number: '4th' },
            { name: 'Diminished 5th', semitones: 6, genericType: 'fifth', quality: 'Diminished', number: '5th' },
            { name: 'Perfect 5th', semitones: 7, genericType: 'fifth', quality: 'Perfect', number: '5th' },
            { name: 'Minor 6th', semitones: 8, genericType: 'sixth', quality: 'Minor', number: '6th' },
            { name: 'Major 6th', semitones: 9, genericType: 'sixth', quality: 'Major', number: '6th' },
            { name: 'Minor 7th', semitones: 10, genericType: 'seventh', quality: 'Minor', number: '7th' },
            { name: 'Major 7th', semitones: 11, genericType: 'seventh', quality: 'Major', number: '7th' },
            { name: 'Perfect Octave', semitones: 12, genericType: 'octave', quality: 'Perfect', number: 'Octave' }
        ],
    }), []);

    const startNewRound = useCallback(() => {
        let newNote1, newNote2, chosenInterval;
        
        do {
            chosenInterval = quizData.intervals[Math.floor(Math.random() * quizData.intervals.length)];
            const notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
            const firstNoteIndex = Math.floor(Math.random() * notes.length);
            const secondNoteIndex = (firstNoteIndex + chosenInterval.semitones) % 12;
            newNote1 = notes[firstNoteIndex];
            newNote2 = notes[secondNoteIndex];
        } while (lastQuestion && newNote1 === lastQuestion.note1 && newNote2 === lastQuestion.note2);

        setNote1(newNote1);
        setNote2(newNote2);
        setCorrectInterval(chosenInterval);
        setLastQuestion({ note1: newNote1, note2: newNote2 });
        
        setFeedback({ message: '', type: '' });
        setSelected({ quality: null, number: null });
        setIsAnswered(false);
    }, [quizData, lastQuestion]);


    useEffect(() => {
        startNewRound();
    }, [startNewRound]); 

    const checkAnswer = useCallback(() => {
        if(isAnswered) return;

        let isCorrect = false;
        if (selected.number === 'Unison / Octave') {
            if (selected.quality === 'Perfect' && (correctInterval.number === 'Unison' || correctInterval.number === 'Octave')) {
                isCorrect = true;
            }
        } else {
            if (selected.quality === correctInterval.quality && selected.number === correctInterval.number) {
                isCorrect = true;
            }
        }

        if (isCorrect) {
            setScore(s => s + 1);
            setFeedback({ message: 'Correct!', type: 'correct' });
        } else {
            setFeedback({ message: `Incorrect! It was ${correctInterval.name}.`, type: 'incorrect' });
        }

        setIsAnswered(true);
    }, [isAnswered, selected, correctInterval]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Enter') {
                if (isAnswered) {
                    startNewRound();
                } else if (selected.quality && selected.number) {
                    checkAnswer();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isAnswered, selected, startNewRound, checkAnswer]);


    const handleSelection = (type, value) => {
        if(isAnswered) return;
        setSelected(prev => ({ ...prev, [type]: value }));
    };

    return (
        <div className="bg-slate-800 p-8 rounded-lg w-full max-w-lg mx-auto text-center">
            <h1 className="text-3xl font-extrabold mb-4 text-indigo-300">Name The Interval</h1>
            <div className="text-xl mb-6 text-gray-300">Score: {score}</div>
            <div className="flex justify-center items-center gap-5 mb-6">
                <div className="text-6xl font-bold text-teal-300 p-4 bg-slate-700 rounded-lg w-32">{note1}</div>
                <div className="text-6xl font-bold text-teal-300 p-4 bg-slate-700 rounded-lg w-32">{note2}</div>
            </div>
            <div className={`text-lg font-bold my-4 min-h-[28px] ${feedback.type === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                {feedback.message || <>&nbsp;</>}
            </div>

            <div className="text-center text-gray-400 mb-4 min-h-[24px] animate-pulse">
                {!isAnswered && selected.quality && selected.number && "Press Enter to Submit"}
                {isAnswered && "Press Enter for Next Question"}
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-400 mb-3">Number</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {quizData.numericButtons.map(n => (
                            <button key={n} onClick={() => handleSelection('number', n)} disabled={isAnswered}
                                className={`p-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${selected.number === n ? 'bg-blue-600 text-white' : 'bg-teal-600 hover:bg-teal-500'}`}>
                                {n}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-400 mb-3">Quality</h3>
                    <div className="flex flex-col gap-2">
                        {quizData.qualities.map(q => (
                            <button key={q} onClick={() => handleSelection('quality', q)} disabled={isAnswered}
                                className={`p-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${selected.quality === q ? 'bg-blue-600 text-white' : 'bg-teal-600 hover:bg-teal-500'}`}>
                                {q}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NameTheIntervalQuiz;
