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
                    <strong className="text-teal-400">Essential Tools:</strong> On desktop, you'll find a persistent toolbar on the left. On mobile, this toolbar is located at the bottom of the screen. You can open these tools at any time without interrupting your practice session.
                </p>
                <p className="text-md italic text-gray-400 pl-4 border-l-2 border-slate-500">
                    Tip: You can quickly start and stop any tool using the play/pause button without needing to open its full panel.
                </p>
                <p className="text-lg">
                    <strong className="text-teal-400">Track Your Progress:</strong> Each exercise features a "Log Session" button. This automatically captures the current metronome BPM, and you'll be prompted to add personal notes before saving to your Practice Log.
                </p>
            </div>
        </div>
    );
};

export default Welcome;
