

import React from 'react';
import SectionHeader from './common/SectionHeader'; // UPDATED PATH

const Welcome = () => {
    return (
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <h2 className="text-4xl font-extrabold text-teal-400 mb-4">
                Welcome to Musical Practice Tools
            </h2>
            <p className="text-xl text-gray-300 mb-12">
                Your all-in-one companion for honing your musical skills.
            </p>

            <div className="w-full text-left space-y-12">

                {/* --- Tool Categories Section --- */}
                <div>
                    <SectionHeader title="Practice Modules" />
                    <p className="text-center text-lg text-gray-300 mt-4 mb-6">
                        Use the navigation bar at the top of the page to dive into a practice module from one of our three categories.
                    </p>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-slate-800/70 p-4 rounded-lg border border-slate-700">
                            <h4 className="font-bold text-xl text-indigo-300 mb-3">Generators</h4>
                            <p className="text-gray-300">
                                This category contains tools to spark creativity and provide random exercises. Use them to generate new chord progressions, random notes for sight-reading, or custom fretboard diagrams.
                            </p>
                        </div>
                        <div className="bg-slate-800/70 p-4 rounded-lg border border-slate-700">
                            <h4 className="font-bold text-xl text-indigo-300 mb-3">Music Theory</h4>
                             <p className="text-gray-300">
                                Test and improve your core theoretical knowledge with these quizzes. Modules cover identifying chords, naming intervals, and calculating notes within a key.
                            </p>
                        </div>
                        <div className="bg-slate-800/70 p-4 rounded-lg border border-slate-700">
                            <h4 className="font-bold text-xl text-indigo-300 mb-3">Practical Exercises</h4>
                            <p className="text-gray-300">
                                Apply your knowledge directly to an instrument. This category focuses on practical application, like identifying interval shapes on the guitar fretboard.
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- Global Toolkit Section --- */}
                <div>
                    <SectionHeader title="Your Practice Toolkit" />
                    <div className="bg-slate-700/50 p-6 rounded-lg mt-6 space-y-4">
                        <p className="text-lg text-gray-300">
                            The toolbar on the side of the screen gives you instant access to essential utilities for any practice session: a <strong className="text-teal-300">Metronome</strong>, a <strong className="text-teal-300">Drone</strong> for intonation, a <strong className="text-teal-300">Timer</strong>, and a <strong className="text-teal-300">Stopwatch</strong>.
                        </p>
                         <p className="text-lg text-gray-300">
                           Don't forget to track your progress! Every module includes a <strong className="text-teal-300">"Log Session"</strong> button. This saves a record of your work to the <strong className="text-teal-300">Practice Log</strong>, which is also accessible from the sidebar.
                        </p>
                         <div className="bg-slate-800/70 p-4 rounded-lg border border-slate-600">
                            <p className="text-lg font-bold text-amber-300">
                                A Note for iPhone & iPad Users:
                            </p>
                            <p className="text-md text-gray-300 mt-1">
                                To hear audio from the Metronome or Drone, please ensure your device's physical Ring/Silent switch is not in silent mode (the switch should not be showing orange).
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Welcome;