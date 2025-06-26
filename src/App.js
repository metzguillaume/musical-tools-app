import React, { useState, useEffect } from 'react';

// Import all the components from their new files
import IntervalsQuiz from './components/IntervalsQuiz';
import NameTheIntervalQuiz from './components/NameTheIntervalQuiz';
import SectionHeader from './components/SectionHeader';
import Metronome from './components/Metronome';
import NoteGenerator from './components/NoteGenerator';

function App() {
  const [activeCategory, setActiveCategory] = useState('practical'); // 'practical' or 'theory'
  const [activePracticalTab, setActivePracticalTab] = useState('metronome'); // 'metronome', 'note-generator', 'drone-player'
  const [activeTheoryTab, setActiveTheoryTab] = useState('intervals-quiz'); // 'intervals-quiz', 'name-the-interval-quiz', 'music-theory-general'

  useEffect(() => {
    document.body.style.backgroundColor = '#0f172a'; // This is slate-900
  }, []);


  return (
    <div className="min-h-screen bg-slate-900 font-inter text-gray-200 p-6 flex flex-col items-center">
      <header className="w-full max-w-5xl bg-slate-800 shadow-lg rounded-xl p-6 mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-teal-400 leading-tight">
          Musical Practice Tools
        </h1>
        <p className="mt-2 text-lg text-gray-300">
          Your comprehensive companion for musical growth!
        </p>
      </header>

      {/* Main Category Navigation Tabs */}
      <nav className="w-full max-w-5xl bg-slate-800 shadow-md rounded-xl p-2 mb-8 flex flex-wrap justify-center gap-2 md:gap-4">
        <button
          onClick={() => { setActiveCategory('practical'); setActivePracticalTab('metronome'); }}
          className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 ease-in-out
            ${activeCategory === 'practical' ? 'bg-indigo-700 text-white shadow-md' : 'text-teal-400 hover:bg-slate-700'}`}
        >
          Practical Exercises
        </button>
        <button
          onClick={() => { setActiveCategory('theory'); setActiveTheoryTab('intervals-quiz'); }}
          className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 ease-in-out
            ${activeCategory === 'theory' ? 'bg-indigo-700 text-white shadow-md' : 'text-teal-400 hover:bg-slate-700'}`}
        >
          Theory Exercises
        </button>
      </nav>

      {/* Sub-Navigation Tabs based on Category */}
      <nav className="w-full max-w-5xl bg-slate-800 shadow-md rounded-xl p-2 mb-8 flex flex-wrap justify-center gap-2 md:gap-4">
        {activeCategory === 'practical' && (
          <>
            <button
              onClick={() => setActivePracticalTab('metronome')}
              className={`px-4 py-2 rounded-full text-md font-medium transition-all duration-300 ease-in-out
                ${activePracticalTab === 'metronome' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-300 hover:bg-slate-700'}`}
            >
              Metronome
            </button>
            <button
              onClick={() => setActivePracticalTab('note-generator')}
              className={`px-4 py-2 rounded-full text-md font-medium transition-all duration-300 ease-in-out
                ${activePracticalTab === 'note-generator' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-300 hover:bg-slate-700'}`}
            >
              Note Generator
            </button>
            <button
              onClick={() => setActivePracticalTab('drone-player')}
              className={`px-4 py-2 rounded-full text-md font-medium transition-all duration-300 ease-in-out
                ${activePracticalTab === 'drone-player' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-300 hover:bg-slate-700'} opacity-50 cursor-not-allowed`}
              disabled
            >
              Drone Player (Coming Soon)
            </button>
          </>
        )}
        {activeCategory === 'theory' && (
          <>
            <button
              onClick={() => setActiveTheoryTab('intervals-quiz')}
              className={`px-4 py-2 rounded-full text-md font-medium transition-all duration-300 ease-in-out
                ${activeTheoryTab === 'intervals-quiz' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-300 hover:bg-slate-700'}`}
            >
              Intervals Quiz
            </button>
            <button
              onClick={() => setActiveTheoryTab('name-the-interval-quiz')}
              className={`px-4 py-2 rounded-full text-md font-medium transition-all duration-300 ease-in-out
                ${activeTheoryTab === 'name-the-interval-quiz' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-300 hover:bg-slate-700'}`}
            >
              Name The Interval Quiz
            </button>
            <button
              onClick={() => setActiveTheoryTab('music-theory-general')}
              className={`px-4 py-2 rounded-full text-md font-medium transition-all duration-300 ease-in-out
                ${activeTheoryTab === 'music-theory-general' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-300 hover:bg-slate-700'} opacity-50 cursor-not-allowed`}
              disabled
            >
              More Theory (Soon)
            </button>
          </>
        )}
      </nav>

      {/* Content Area */}
      <main className="w-full max-w-5xl bg-slate-800 shadow-2xl rounded-xl p-8 transform transition-transform duration-500 ease-out flex-grow">
        {/* Practical Exercises Content */}
        {activeCategory === 'practical' && (
          <>
            {activePracticalTab === 'metronome' && <Metronome />}
            {activePracticalTab === 'note-generator' && <NoteGenerator />}
            {activePracticalTab === 'drone-player' && (
              <div className="text-center p-10">
                <p className="text-xl text-gray-400">
                  Drone Player is coming soon!
                </p>
              </div>
            )}
          </>
        )}

        {/* Theory Exercises Content */}
        {activeCategory === 'theory' && (
          <>
            {activeTheoryTab === 'intervals-quiz' && <IntervalsQuiz />}
            {activeTheoryTab === 'name-the-interval-quiz' && <NameTheIntervalQuiz />}
            {activeTheoryTab === 'music-theory-general' && (
              <div className="text-center p-10">
                <p className="text-xl text-gray-400">
                  More music theory exercises are coming soon!
                </p>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="w-full max-w-5xl text-center mt-8 text-gray-400 text-sm">
        <p>&copy; 2025 Toon's Musical Practice Tools. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
