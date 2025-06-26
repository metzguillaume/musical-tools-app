    import React, { useState, useEffect, useCallback } from 'react';

    // This is the React version of the "Name The Interval Quiz"
    const NameTheIntervalQuiz = () => {
        const [score, setScore] = useState(0);
        const [note1, setNote1] = useState('C');
        const [note2, setNote2] = useState('E');
        const [feedback, setFeedback] = useState({ message: '', type: '' });
        const [correctInterval, setCorrectInterval] = useState(null);
        const [isWaiting, setIsWaiting] = useState(false);
        const [selected, setSelected] = useState({ quality: null, number: null });

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
            naturalNoteAlphabeticalIndex: { 'C': 0, 'D': 1, 'E': 2, 'F': 3, 'G': 4, 'A': 5, 'B': 6 },
            alphabeticalIndexToNaturalNote: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
            naturalNoteSemitoneOffsetFromC: { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 }
        }), []);

        const startNewRound = useCallback(() => {
            if(isWaiting) return;
            
            // Generate a question
            const chosenInterval = quizData.intervals[Math.floor(Math.random() * quizData.intervals.length)];
            const baseNote = quizData.alphabeticalIndexToNaturalNote[Math.floor(Math.random() * 7)];
            const accidentalNumber = Math.floor(Math.random() * 3) -1; // -1, 0, 1 for b, natural, #
            
            // Simplified note generation
            const notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
            const firstNoteIndex = Math.floor(Math.random() * notes.length);
            const secondNoteIndex = (firstNoteIndex + chosenInterval.semitones) % 12;

            setNote1(notes[firstNoteIndex]);
            setNote2(notes[secondNoteIndex]);
            setCorrectInterval(chosenInterval);
            
            // Reset for new round
            setFeedback({ message: '', type: '' });
            setSelected({ quality: null, number: null });
        }, [isWaiting, quizData]);


        useEffect(() => {
            startNewRound();
        }, [startNewRound]);
        
        // Check answer when both quality and number are selected
        useEffect(() => {
            if (selected.quality && selected.number) {
                 if(isWaiting) return;

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

                setIsWaiting(true);
                setTimeout(() => {
                    setIsWaiting(false);
                    startNewRound();
                }, 2000);
            }
        }, [selected, correctInterval, startNewRound, isWaiting]);

        const handleSelection = (type, value) => {
            if(isWaiting) return;
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
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-400 mb-3">Quality</h3>
                        <div className="flex flex-col gap-2">
                            {quizData.qualities.map(q => (
                                <button key={q} onClick={() => handleSelection('quality', q)} disabled={isWaiting}
                                    className={`p-3 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed ${selected.quality === q ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-400 mb-3">Number</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {quizData.numericButtons.map(n => (
                                <button key={n} onClick={() => handleSelection('number', n)} disabled={isWaiting}
                                    className={`p-3 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed ${selected.number === n ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    export default NameTheIntervalQuiz;
    