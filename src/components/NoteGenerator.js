import React, { useState } from 'react';
import SectionHeader from './SectionHeader'; // This was the problematic import path

const NoteGenerator = () => {
  const [lastNote, setLastNote] = useState('');
  const [noteOctave, setNoteOctave] = useState(4);
  const [sharpsFlats, setSharpsFlats] = useState('sharps');

  const generateRandomNote = () => {
    const notesSharps = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const notesFlats = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
    const notes = sharpsFlats === 'sharps' ? notesSharps : notesFlats;
    const randomIndex = Math.floor(Math.random() * notes.length);
    const selectedNote = notes[randomIndex];
    setLastNote(`${selectedNote}${noteOctave}`);
  };

  return (
    <div className="flex flex-col items-center">
      <SectionHeader title="Random Note Generator" />
      <div className="mb-6 text-center">
        <p className="text-5xl font-extrabold text-blue-400 mb-4 h-20 flex items-center justify-center">
          {lastNote || 'Press Generate'}
        </p>
        <div className="flex items-center space-x-4 mb-4 justify-center">
          <label htmlFor="octave" className="text-lg font-semibold text-gray-200">Octave:</label>
          <input
            type="number"
            id="octave"
            min="0"
            max="8"
            value={noteOctave}
            onChange={(e) => setNoteOctave(Number(e.target.value))}
            className="w-20 p-2 border border-gray-600 rounded-md text-center text-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-100"
          />
        </div>
        <div className="flex space-x-4 mb-6 justify-center">
          <label className="inline-flex items-center text-lg">
            <input
              type="radio"
              value="sharps"
              checked={sharpsFlats === 'sharps'}
              onChange={() => setSharpsFlats('sharps')}
              className="form-radio text-blue-500 h-5 w-5"
            />
            <span className="ml-2 text-gray-200">Sharps (#)</span>
          </label>
          <label className="inline-flex items-center text-lg">
            <input
              type="radio"
              value="flats"
              checked={sharpsFlats === 'flats'}
              onChange={() => setSharpsFlats('flats')}
              className="form-radio text-blue-500 h-5 w-5"
            />
            <span className="ml-2 text-gray-200">Flats (b)</span>
          </label>
        </div>
      </div>
      <button
        onClick={generateRandomNote}
        className="px-8 py-4 rounded-full text-xl font-bold text-white bg-blue-500 hover:bg-blue-600 shadow-lg transform transition-transform duration-200 ease-in-out active:scale-95"
      >
        Generate Note
      </button>
    </div>
  );
};

export default NoteGenerator;
