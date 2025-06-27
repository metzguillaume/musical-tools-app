import React from 'react';
import { useTools } from '../context/ToolsContext';
import Metronome from './Metronome';
import DronePlayer from './DronePlayer';
import Timer from './Timer';
import Stopwatch from './Stopwatch';
import PracticeLog from './PracticeLog';

// This component is the persistent toolbar on the left of the screen.
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
        <div className={`fixed top-1/4 left-5 flex flex-col gap-2 z-40 transition-all duration-300 ${activeTool === 'log' ? 'w-96' : 'w-64'}`}>
            {tools.map(tool => (
                <div key={tool.name} className="bg-slate-800 rounded-lg shadow-lg border border-slate-700">
                    <div className="flex items-center">
                        <button 
                            onClick={() => toggleActiveTool(tool.name)} 
                            className="flex-grow text-left font-bold py-3 px-4 text-white transition-colors duration-300 hover:bg-indigo-700 rounded-l-lg"
                        >
                            {tool.label}
                        </button>
                        {!tool.hidePlayPause && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); tool.toggle(); }}
                                className="p-3 text-white hover:bg-indigo-700 rounded-r-lg"
                                aria-label={`${tool.isPlaying ? 'Pause' : 'Play'} ${tool.label}`}
                            >
                                {tool.isPlaying ? <PauseIcon /> : <PlayIcon />}
                            </button>
                        )}
                    </div>
                    {activeTool === tool.name && (
                        <div className="p-2 border-t border-slate-700">
                           {tool.component}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default GlobalTools;
