import React from 'react';
import { useTools } from '../context/ToolsContext';
import Metronome from './Metronome';
import DronePlayer from './DronePlayer';
import Timer from './Timer';
import Stopwatch from './Stopwatch';
import PracticeLog from './PracticeLog';

// This component is the persistent toolbar. It's a vertical bar on desktop and a horizontal one on mobile.
const GlobalTools = () => {
    const { 
        activeTool, toggleActiveTool,
        isMetronomePlaying, toggleMetronome,
        isDronePlaying, toggleDrone,
        isTimerRunning, toggleTimer,
        isStopwatchRunning, toggleStopwatch
    } = useTools();

    const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>;
    const PauseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" /></svg>;

    const tools = [
        { name: 'log', label: 'Practice Log', component: <PracticeLog />, hidePlayPause: true },
        { name: 'metronome', label: 'Metronome', component: <Metronome />, isPlaying: isMetronomePlaying, toggle: toggleMetronome },
        { name: 'drone', label: 'Drone', component: <DronePlayer />, isPlaying: isDronePlaying, toggle: toggleDrone },
        { name: 'timer', label: 'Timer', component: <Timer />, isPlaying: isTimerRunning, toggle: toggleTimer },
        { name: 'stopwatch', label: 'Stopwatch', component: <Stopwatch />, isPlaying: isStopwatchRunning, toggle: toggleStopwatch },
    ];

    return (
        // On mobile (default), it's a bar at the bottom that can scroll horizontally.
        // On medium screens and up, it's a sidebar on the left.
        <div className={`fixed z-40 bg-slate-900/80 backdrop-blur-sm
                     bottom-0 left-0 right-0 p-2 flex flex-row items-center justify-start gap-2 border-t border-slate-700 overflow-x-auto
                     md:top-1/4 md:left-5 md:right-auto md:bottom-auto md:flex-col md:items-stretch md:p-3 md:gap-2 md:border-t-0 md:rounded-lg md:border
                     transition-all duration-300 ${activeTool === 'log' ? 'md:w-96' : 'md:w-64'}`}>
            {tools.map(tool => (
                <div key={tool.name} className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 flex-shrink-0">
                    <div className="flex items-center">
                        <button 
                            onClick={() => toggleActiveTool(tool.name)} 
                            className="flex-grow text-left font-bold py-2 px-3 md:py-3 md:px-4 text-white transition-colors duration-300 hover:bg-indigo-700 rounded-l-lg text-sm md:text-base"
                        >
                            {tool.label}
                        </button>
                        {!tool.hidePlayPause && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); tool.toggle(); }}
                                className="p-2 md:p-3 text-white hover:bg-indigo-700 rounded-r-lg"
                                aria-label={`${tool.isPlaying ? 'Pause' : 'Play'} ${tool.label}`}
                            >
                                {tool.isPlaying ? <PauseIcon /> : <PlayIcon />}
                            </button>
                        )}
                    </div>
                    {/* On mobile, the active tool panel will appear as a modal-like fixed element */}
                    <div className={`md:hidden fixed bottom-20 left-4 right-4 z-50 transition-opacity duration-300 ${activeTool === tool.name ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                        <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-2">
                            {tool.component}
                        </div>
                    </div>
                    {/* On desktop, it expands below */}
                    <div className="hidden md:block">
                        {activeTool === tool.name && (
                            <div className="p-2 border-t border-slate-700">
                               {tool.component}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default GlobalTools;
