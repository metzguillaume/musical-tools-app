import React from 'react';

const LandingPage = ({ onEnter }) => {
    return (
        <div className="min-h-screen bg-slate-900 font-inter text-gray-200 flex flex-col justify-center items-center p-6 text-center">
            <div className="max-w-2xl">
                <h1 className="text-5xl md:text-6xl font-extrabold text-teal-400 mb-4">
                    Welcome to Musical Practice Tools
                </h1>
                <p className="text-xl text-gray-300 mb-8">
                    Your all-in-one companion for honing your musical skills.
                </p>

                <div className="bg-slate-800 p-6 rounded-lg shadow-lg text-left space-y-4 mb-8">
                    <h2 className="text-2xl font-bold text-indigo-300 mb-3">How It Works</h2>
                    <p className="text-lg">
                        <strong className="text-teal-400">Practice Exercises:</strong> Use the top navigation bar to switch between different practice modules, including interval recognition and note generation.
                    </p>
                    <p className="text-lg">
                        <strong className="text-teal-400">Essential Tools:</strong> On the left-hand toolbar, you'll find persistent tools like a Metronome, Drone, Timer, and Stopwatch. You can open these at any time without interrupting your practice session.
                    </p>
                </div>

                <button
                    onClick={onEnter}
                    className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-8 rounded-full text-2xl transition-transform duration-300 ease-in-out transform hover:scale-105"
                >
                    Start Practicing
                </button>
            </div>
        </div>
    );
};

export default LandingPage;
