import React, { useState } from 'react';
import { ToolsProvider, useTools } from './context/ToolsContext';

// Import all the components
import Welcome from './components/Welcome';
import IntervalsQuiz from './components/IntervalsQuiz';
import NameTheIntervalQuiz from './components/NameTheIntervalQuiz';
import NoteGenerator from './components/NoteGenerator';
import ChordTrainer from './components/ChordTrainer';
import GlobalTools from './components/GlobalTools';
import IntervalFretboardQuiz from './components/IntervalFretboardQuiz';
import DiagramMaker from './components/DiagramMaker';

// This component contains the main application view
const AppContent = () => {
  const [activeTab, setActiveTab] = useState('welcome');
  const { activeTool, unlockAudio } = useTools();

  const handleTabClick = (tabName) => {
    unlockAudio();
    setActiveTab(tabName);
  }

  return (
    <div className={`min-h-screen bg-slate-900 font-inter text-gray-200 p-4 pb-32 md:p-6 transition-all duration-300 ${activeTool === 'log' ? 'md:pl-96' : 'md:pl-72'}`}>

      {/* Signature Logo: Hidden on mobile (default), visible on medium screens and up */}
      <div className="hidden md:block fixed top-5 left-0 z-50">
        <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Signature Logo" className="h-32 w-auto" />
      </div>

      <GlobalTools />

      <header className="w-full max-w-5xl bg-slate-800 shadow-lg rounded-xl p-6 mb-8 text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold text-teal-400 leading-tight">
          Musical Practice Tools
        </h1>
        <p className="text-md md:text-lg text-gray-300">
          Your comprehensive companion for musical growth!
        </p>
      </header>

      <nav className="w-full max-w-5xl bg-slate-800 shadow-md rounded-xl p-2 mb-8 flex flex-wrap justify-center gap-2 md:gap-4">
         <button
              onClick={() => handleTabClick('welcome')}
              className={`px-4 py-2 rounded-full text-md font-medium transition-all duration-300 ease-in-out ${activeTab === 'welcome' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-300 hover:bg-slate-700'}`}
          >
              Welcome
          </button>
           <button
              onClick={() => handleTabClick('note-generator')}
              className={`px-4 py-2 rounded-full text-md font-medium transition-all duration-300 ease-in-out ${activeTab === 'note-generator' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-300 hover:bg-slate-700'}`}
            >
              Note Generator
            </button>
          <button
              onClick={() => handleTabClick('name-the-interval-quiz')}
              className={`px-4 py-2 rounded-full text-md font-medium transition-all duration-300 ease-in-out ${activeTab === 'name-the-interval-quiz' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-300 hover:bg-slate-700'}`}
          >
              Name The Interval
          </button>
         <button
              onClick={() => handleTabClick('intervals-quiz')}
              className={`px-4 py-2 rounded-full text-md font-medium transition-all duration-300 ease-in-out ${activeTab === 'intervals-quiz' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-300 hover:bg-slate-700'}`}
          >
              Interval Practice
          </button>
          <button
              onClick={() => handleTabClick('interval-fretboard-quiz')}
              className={`px-4 py-2 rounded-full text-md font-medium transition-all duration-300 ease-in-out ${activeTab === 'interval-fretboard-quiz' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-300 hover:bg-slate-700'}`}
          >
              Fretboard Intervals
          </button>
          <button
              onClick={() => handleTabClick('diagram-maker')}
              className={`px-4 py-2 rounded-full text-md font-medium transition-all duration-300 ease-in-out ${activeTab === 'diagram-maker' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-300 hover:bg-slate-700'}`}
          >
              Diagram Maker
          </button>
          <button
              onClick={() => handleTabClick('chord-trainer')}
              className={`px-4 py-2 rounded-full text-md font-medium transition-all duration-300 ease-in-out ${activeTab === 'chord-trainer' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-300 hover:bg-slate-700'}`}
          >
              Chord Trainer
          </button>
      </nav>

      <main className="w-full max-w-5xl bg-slate-800 shadow-2xl rounded-xl p-4 md:p-8 transform transition-transform duration-500 ease-out flex-grow">
          {activeTab === 'welcome' && <Welcome />}
          {activeTab === 'chord-trainer' && <ChordTrainer />}
          {activeTab === 'intervals-quiz' && <IntervalsQuiz />}
          {activeTab === 'name-the-interval-quiz' && <NameTheIntervalQuiz />}
          {activeTab === 'note-generator' && <NoteGenerator />}
          {activeTab === 'interval-fretboard-quiz' && <IntervalFretboardQuiz />}
          {activeTab === 'diagram-maker' && <DiagramMaker />}
      </main>

      <footer className="w-full max-w-5xl text-center mt-8 text-gray-400 text-sm">
        <p>&copy; 2025 Toon's Musical Practice Tools. All rights reserved.</p>
      </footer>
    </div>
  );
}

// The final App component now just sets up the provider and the main content
function App() {
  return (
    <ToolsProvider>
      <AppContent />
    </ToolsProvider>
  );
}

export default App;