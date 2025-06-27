import React from 'react';

const Welcome = () => {
    return (
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
            <h2 className="text-4xl font-extrabold text-teal-400 mb-4">
                Welcome to Musical Practice Tools
            </h2>
            <p className="text-xl text-gray-300 mb-8">
                Your all-in-one companion for honing your musical skills.
            </p>

            <div className="bg-slate-700 p-6 rounded-lg shadow-lg text-left space-y-4">
                <h3 className="text-2xl font-bold text-indigo-300 mb-3">How It Works</h3>
                <p className="text-lg">
                    <strong className="text-teal-400">Practice Exercises:</strong> Use the navigation bar above to switch between different practice modules, including interval recognition and note generation.
                </p>
                <p className="text-lg">
                    <strong className="text-teal-400">Essential Tools:</strong> On the left-hand toolbar, you'll find persistent tools like a Metronome, Drone, Timer, and Stopwatch. You can open these at any time without interrupting your practice session.
                </p>
                <p className="text-lg">
                    <strong className="text-teal-400">Practice Log:</strong> Each exercise features a "Log Session" button. This automatically captures the current metronome BPM, and you'll be prompted to add personal notes before saving to your Practice Log.
                </p>
            </div>
        </div>
    );
};

export default Welcome;
