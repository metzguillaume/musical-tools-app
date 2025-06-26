import React, { useState } from 'react';
import { ToolsProvider } from './context/ToolsContext';

// Import all the components from their new files
import IntervalsQuiz from './components/IntervalsQuiz';
import NameTheIntervalQuiz from './components/NameTheIntervalQuiz';
import NoteGenerator from './components/NoteGenerator';
import GlobalTools from './components/GlobalTools';


// The main App content
const AppContent = () => {
  const [activeTheoryTab, setActiveTheoryTab] = useState('intervals-quiz');

  return (
    <div className="min-h-screen bg-slate-900 font-inter text-gray-200 p-6 pl-64 flex flex-col items-center">
      <GlobalTools />
      
      <header className="w-full max-w-5xl bg-slate-800 shadow-lg rounded-xl p-6 mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-teal-400 leading-tight">
          Musical Practice Tools
        </h1>
        <p className="mt-2 text-lg text-gray-300">
          Your comprehensive companion for musical growth!
        </p>
      </header>

      {/* Main Category Navigation has been simplified */}
      <nav className="w-full max-w-5xl bg-slate-800 shadow-md rounded-xl p-2 mb-8 flex flex-wrap justify-center gap-2 md:gap-4">
         <button
              onClick={() => setActiveTheoryTab('intervals-quiz')}
              className={`px-4 py-2 rounded-full text-md font-medium transition-all duration-300 ease-in-out ${activeTheoryTab === 'intervals-quiz' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-300 hover:bg-slate-700'}`}
          >
              Intervals Quiz
          </button>
          <button
              onClick={() => setActiveTheoryTab('name-the-interval-quiz')}
              className={`px-4 py-2 rounded-full text-md font-medium transition-all duration-300 ease-in-out ${activeTheoryTab === 'name-the-interval-quiz' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-300 hover:bg-slate-700'}`}
          >
              Name The Interval Quiz
          </button>
           <button
              onClick={() => setActiveTheoryTab('note-generator')}
              className={`px-4 py-2 rounded-full text-md font-medium transition-all duration-300 ease-in-out ${activeTheoryTab === 'note-generator' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-300 hover:bg-slate-700'}`}
            >
              Note Generator
            </button>
      </nav>

      <main className="w-full max-w-5xl bg-slate-800 shadow-2xl rounded-xl p-8 transform transition-transform duration-500 ease-out flex-grow">
          {activeTheoryTab === 'intervals-quiz' && <IntervalsQuiz />}
          {activeTheoryTab === 'name-the-interval-quiz' && <NameTheIntervalQuiz />}
          {activeTheoryTab === 'note-generator' && <NoteGenerator />}
      </main>

      <footer className="w-full max-w-5xl text-center mt-8 text-gray-400 text-sm">
        <p>&copy; 2024 Musical Practice Tools. All rights reserved.</p>
      </footer>
    </div>
  );
}

// The final App component now just sets up the provider
function App() {
  return (
    <ToolsProvider>
      <AppContent />
    </ToolsProvider>
  );
}

export default App;
