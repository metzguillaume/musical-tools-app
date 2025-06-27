import React, { useState } from 'react';
import { ToolsProvider, useTools } from './context/ToolsContext';

// Import all the components
import Welcome from './components/Welcome';
import IntervalsQuiz from './components/IntervalsQuiz';
import NameTheIntervalQuiz from './components/NameTheIntervalQuiz';
import NoteGenerator from './components/NoteGenerator';
import GlobalTools from './components/GlobalTools';

// This component contains the main application view
const AppContent = () => {
  const [activeTheoryTab, setActiveTheoryTab] = useState('welcome');
  const { activeTool } = useTools(); // Get activeTool to adjust layout

  return (
    <div className={`min-h-screen bg-slate-900 font-inter text-gray-200 p-6 flex flex-col items-center transition-all duration-300 ${activeTool === 'log' ? 'pl-96' : 'pl-72'}`}>
      
      {/* Signature Logo */}
      <div className="fixed top-5 left-0 z-50">
        <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Signature Logo" className="h-32 w-auto" />
      </div>

      <GlobalTools />
      
      <header className="w-full max-w-5xl bg-slate-800 shadow-lg rounded-xl p-6 mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-teal-400 leading-tight">
          Musical Practice Tools
        </h1>
        <p className="mt-2 text-lg text-gray-300">
          Your comprehensive companion for musical growth!
        </p>
      </header>

      <nav className="w-full max-w-5xl bg-slate-800 shadow-md rounded-xl p-2 mb-8 flex flex-wrap justify-center gap-2 md:gap-4">
         <button
              onClick={() => setActiveTheoryTab('welcome')}
              className={`px-4 py-2 rounded-full text-md font-medium transition-all duration-300 ease-in-out ${activeTheoryTab === 'welcome' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-300 hover:bg-slate-700'}`}
          >
              Welcome
          </button>
         <button
              onClick={() => setActiveTheoryTab('intervals-quiz')}
              className={`px-4 py-2 rounded-full text-md font-medium transition-all duration-300 ease-in-out ${activeTheoryTab === 'intervals-quiz' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-300 hover:bg-slate-700'}`}
          >
              Interval Practice
          </button>
          <button
              onClick={() => setActiveTheoryTab('name-the-interval-quiz')}
              className={`px-4 py-2 rounded-full text-md font-medium transition-all duration-300 ease-in-out ${activeTheoryTab === 'name-the-interval-quiz' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-300 hover:bg-slate-700'}`}
          >
              Name The Interval
          </button>
           <button
              onClick={() => setActiveTheoryTab('note-generator')}
              className={`px-4 py-2 rounded-full text-md font-medium transition-all duration-300 ease-in-out ${activeTheoryTab === 'note-generator' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-300 hover:bg-slate-700'}`}
            >
              Note Generator
            </button>
      </nav>

      <main className="w-full max-w-5xl bg-slate-800 shadow-2xl rounded-xl p-8 transform transition-transform duration-500 ease-out flex-grow">
          {activeTheoryTab === 'welcome' && <Welcome />}
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

// The final App component now just sets up the provider and the main content
function App() {
  return (
    <ToolsProvider>
      <AppContent />
    </ToolsProvider>
  );
}

export default App;
