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
// --- FIX: Import the new component ---
import ChordProgressionGenerator from './components/ChordProgressionGenerator';


const AppContent = () => {
  const [activeTab, setActiveTab] = useState('welcome');
  const [openCategory, setOpenCategory] = useState(null);
  const { activeTool, unlockAudio } = useTools();

  const toolCategories = [
    {
      name: 'Generators',
      tools: [
        { id: 'note-generator', name: 'Note Generator' },
        { id: 'diagram-maker', name: 'Diagram Maker' },
        // --- FIX: Add the new generator to the list ---
        { id: 'chord-progression-generator', name: 'Chord Progression Generator' },
      ],
    },
    {
      name: 'Music Theory',
      tools: [
        { id: 'name-the-interval-quiz', name: 'Name The Interval' },
        { id: 'intervals-quiz', name: 'Interval Practice' },
        { id: 'chord-trainer', name: 'Chord Trainer' },
      ],
    },
    {
      name: 'Practical Exercises',
      tools: [
        { id: 'interval-fretboard-quiz', name: 'Fretboard Intervals' },
      ],
    },
  ];

  const handleTabClick = (tabName) => {
    unlockAudio();
    setActiveTab(tabName);
  }

  const handleCategoryClick = (categoryName) => {
    setOpenCategory(prevOpenCategory => 
        prevOpenCategory === categoryName ? null : categoryName
    );
  };

  return (
    <div className={`min-h-screen bg-slate-900 font-inter text-gray-200 p-4 pb-32 md:p-6 transition-all duration-300 ${activeTool === 'log' ? 'md:pl-96' : 'md:pl-72'}`}>

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
      
      <nav className="w-full max-w-5xl bg-slate-800 shadow-md rounded-xl p-4 md:p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-around gap-y-4 md:gap-x-6">
            <div className="flex-1 text-center">
                 <button
                    onClick={() => handleTabClick('welcome')}
                    className={`px-6 py-3 rounded-lg text-lg font-bold transition-all duration-300 ease-in-out w-full ${activeTab === 'welcome' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-700 text-blue-300 hover:bg-slate-600'}`}
                >
                    Welcome
                </button>
            </div>
            {toolCategories.map(category => (
                <div key={category.name} className="flex-1 flex flex-col items-center gap-2">
                    <button 
                        onClick={() => handleCategoryClick(category.name)}
                        className="w-full bg-slate-700 hover:bg-slate-600 rounded-lg p-3 flex justify-between items-center transition-all"
                    >
                        <h3 className="text-lg font-bold text-teal-300">{category.name}</h3>
                        <span className={`transform transition-transform duration-300 ${openCategory === category.name ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    {openCategory === category.name && (
                        <div className="w-full flex flex-col items-center gap-2 bg-slate-900/50 p-2 rounded-b-lg animate-fade-in-down">
                           {category.tools.map(tool => (
                                <button
                                    key={tool.id}
                                    onClick={() => handleTabClick(tool.id)}
                                    className={`w-full px-4 py-2 rounded-full text-md font-medium transition-all duration-300 ease-in-out ${activeTab === tool.id ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-300 hover:bg-slate-700'}`}
                                >
                                    {tool.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
      </nav>

      <main className="w-full max-w-5xl bg-slate-800 shadow-2xl rounded-xl p-4 md:p-8 transform transition-transform duration-500 ease-out flex-grow">
          {activeTab === 'welcome' && <Welcome />}
          {activeTab === 'chord-trainer' && <ChordTrainer />}
          {activeTab === 'intervals-quiz' && <IntervalsQuiz />}
          {activeTab === 'name-the-interval-quiz' && <NameTheIntervalQuiz />}
          {activeTab === 'note-generator' && <NoteGenerator />}
          {activeTab === 'interval-fretboard-quiz' && <IntervalFretboardQuiz />}
          {activeTab === 'diagram-maker' && <DiagramMaker />}
          {/* --- FIX: Add the new component to the main view --- */}
          {activeTab === 'chord-progression-generator' && <ChordProgressionGenerator />}
      </main>

      <footer className="w-full max-w-5xl text-center mt-8 text-gray-400 text-sm">
        <p>&copy; 2025 Toon's Musical Practice Tools. All rights reserved.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ToolsProvider>
      <AppContent />
    </ToolsProvider>
  );
}

export default App;