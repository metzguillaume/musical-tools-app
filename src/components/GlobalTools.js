import React from 'react';
import { useTools } from '../context/ToolsContext';
import Metronome from './Metronome';
import DronePlayer from './DronePlayer';
import Timer from './Timer';
import Stopwatch from './Stopwatch';
import PracticeLog from './PracticeLog';

const GlobalTools = () => {
    const { 
        unlockAudio, activeTool, toggleActiveTool,
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
    
    const activeToolData = tools.find(t => t.name === activeTool);

    const handleToggleTool = (toolName) => {
        unlockAudio();
        toggleActiveTool(toolName);
    }

    const handlePlayPause = (e, toggleFn) => {
        e.stopPropagation();
        unlockAudio();
        toggleFn();
    }

    return (
        <>
            {/* Mobile Tool Panel Overlay */}
            <div className={`md:hidden fixed inset-0 z-50 flex justify-center items-center transition-opacity duration-300 ${activeTool ? 'bg-black/60 opacity-100' : 'bg-transparent opacity-0 pointer-events-none'}`} onClick={() => toggleActiveTool(null)}>
                <div className="w-11/12 max-w-sm bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-4" onClick={e => e.stopPropagation()}>
                    {activeToolData && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-teal-300">{activeToolData.label}</h3>
                                <button onClick={() => toggleActiveTool(null)} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
                            </div>
                            {activeToolData.component}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Toolbar */}
            <div className={`fixed z-30 bg-slate-900/80 backdrop-blur-sm
                         bottom-0 left-0 right-0 p-2 flex flex-row items-center justify-start gap-2 border-t border-slate-700 overflow-x-auto
                         md:top-1/4 md:left-5 md:right-auto md:bottom-auto md:flex-col md:items-stretch md:p-3 md:gap-2 md:border-t-0 md:rounded-lg md:border
                         transition-all duration-300 ${activeTool === 'log' ? 'md:w-96' : 'md:w-64'}`}>
                {tools.map(tool => (
                    <div key={tool.name} className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 flex-shrink-0">
                        <div className="flex items-center">
                            <button 
                                onClick={() => handleToggleTool(tool.name)} 
                                className="flex-grow text-left font-bold py-2 px-3 md:py-3 md:px-4 text-white transition-colors duration-300 hover:bg-indigo-700 rounded-l-lg text-sm md:text-base"
                            >
                                {tool.label}
                            </button>
                            {!tool.hidePlayPause && (
                                <button 
                                    onClick={(e) => handlePlayPause(e, tool.toggle)}
                                    className="p-2 md:p-3 text-white hover:bg-indigo-700 rounded-r-lg"
                                    aria-label={`${tool.isPlaying ? 'Pause' : 'Play'} ${tool.label}`}
                                >
                                    {tool.isPlaying ? <PauseIcon /> : <PlayIcon />}
                                </button>
                            )}
                        </div>
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
        </>
    );
};

export default GlobalTools;
