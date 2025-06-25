import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import SectionHeader from './SectionHeader'; // Assuming SectionHeader is also in components

const Metronome = () => {
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const metronomeIntervalRef = useRef(null);
  const clickSynthRef = useRef(null);

  // Initialize Tone.js synth for metronome click
  useEffect(() => {
    clickSynthRef.current = new Tone.MembraneSynth().toDestination();
    return () => {
      if (clickSynthRef.current) {
        clickSynthRef.current.dispose();
      }
    };
  }, []);

  const startMetronome = useCallback(() => {
    Tone.start().then(() => {
        setIsPlaying(true);
        setCurrentBeat(0);
        if (metronomeIntervalRef.current) {
          clearInterval(metronomeIntervalRef.current);
        }
        const intervalTime = (60 / bpm) * 1000;
        clickSynthRef.current.triggerAttackRelease("C4", "8n", Tone.now());
        setCurrentBeat(1);
        let beatCounter = 1;
        metronomeIntervalRef.current = setInterval(() => {
          clickSynthRef.current.triggerAttackRelease("C4", "8n", Tone.now());
          beatCounter = (beatCounter % 4) + 1;
          setCurrentBeat(beatCounter);
        }, intervalTime);
    });
  }, [bpm]);

  const stopMetronome = useCallback(() => {
    setIsPlaying(false);
    if (metronomeIntervalRef.current) {
      clearInterval(metronomeIntervalRef.current);
    }
    setCurrentBeat(0);
  }, []);

  // Effect to handle BPM changes while playing
  useEffect(() => {
    if (isPlaying) {
      stopMetronome();
      const timeoutId = setTimeout(() => startMetronome(), 50);
      return () => clearTimeout(timeoutId);
    }
  }, [bpm, isPlaying, startMetronome, stopMetronome]);

  return (
    <div className="flex flex-col items-center">
      <SectionHeader title="Metronome" />
      <div className="mb-6">
        <label htmlFor="bpm" className="block text-gray-200 text-lg font-semibold mb-2">
          Beats Per Minute (BPM): {bpm}
        </label>
        <input
          type="range"
          id="bpm"
          min="40"
          max="240"
          step="1"
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className="w-80 h-3 bg-gray-600 rounded-lg appearance-none cursor-pointer range-lg"
        />
      </div>
      <div className="flex space-x-4 mb-8">
        <button
          onClick={isPlaying ? stopMetronome : startMetronome}
          className={`px-8 py-4 rounded-full text-xl font-bold text-white shadow-lg transform transition-transform duration-200 ease-in-out
                     ${isPlaying ? 'bg-red-600 hover:bg-red-700 active:scale-95' : 'bg-green-600 hover:bg-green-700 active:scale-95'}`}
        >
          {isPlaying ? 'Stop Metronome' : 'Start Metronome'}
        </button>
      </div>
      <div className="flex space-x-3 mt-4">
        {[1, 2, 3, 4].map((beat) => (
          <div
            key={beat}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg
                      ${currentBeat === beat ? 'bg-blue-500 shadow-xl scale-110' : 'bg-gray-600'}
                      transition-all duration-150 ease-out`}
          >
            {beat}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Metronome;
