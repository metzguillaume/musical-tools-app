import React from 'react';
import SectionHeader from './common/SectionHeader';

const Welcome = () => {
    return (
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <h2 className="text-4xl font-extrabold text-teal-400 mb-4">
                Welcome to Your Personal Music Gym
            </h2>
            <p className="text-xl text-gray-300 mb-12">
                A complete suite of tools designed to structure your practice, sharpen your skills, and track your progress.
            </p>

            <div className="w-full text-left space-y-16">

                {/* --- How to Get Started --- */}
                <div>
                    <SectionHeader title="How to Get Started" />
                    <div className="grid md:grid-cols-3 gap-6 mt-6 text-center">
                        <div className="bg-slate-800/70 p-4 rounded-lg border border-slate-700">
                            <h4 className="font-bold text-2xl text-indigo-300 mb-3">1. Pick a Module</h4>
                            <p className="text-gray-300">
                                Use the navigation bar above to select a practice tool from one of the categories. Each module is a focused quiz or generator.
                            </p>
                        </div>
                        <div className="bg-slate-800/70 p-4 rounded-lg border border-slate-700">
                            <h4 className="font-bold text-2xl text-indigo-300 mb-3">2. Use the Toolkit</h4>
                            <p className="text-gray-300">
                                The Global Toolkit on the left gives you access to tools like the Metronome, Drone, and Timer to accompany your practice.
                            </p>
                        </div>
                        <div className="bg-slate-800/70 p-4 rounded-lg border border-slate-700">
                            <h4 className="font-bold text-2xl text-indigo-300 mb-3">3. Controls & Presets</h4>
                            <p className="text-gray-300">
                                Every module has a dedicated Controls button where you can adjust parameters for the game. These parameters can be saved in presets to be recalled.
                            </p>
                        </div>
                    </div>
                </div>


                {/* --- Tool Categories Section --- */}
                <div>
                    <SectionHeader title="Explore the Practice Modules" />
                    <p className="text-center text-lg text-gray-300 mt-4 mb-8">
                        The practice modules are divided into four distinct categories to target every aspect of your musicianship.
                    </p>
                    <div className="space-y-6">
                        <div className="p-4 rounded-lg bg-slate-700/50">
                            <h4 className="font-bold text-xl text-indigo-300 mb-2">Generators</h4>
                            <p className="text-gray-300">
                                Spark creativity and create targeted exercises. These tools provide random content on demand. Modules include the Note Generator, Interval Generator, Chord Progression Generator, and a powerful Fretboard Diagram Maker.
                            </p>
                        </div>
                        <div className="p-4 rounded-lg bg-slate-700/50">
                            <h4 className="font-bold text-xl text-indigo-300 mb-2">Music Theory</h4>
                            <p className="text-gray-300">
                                Sharpen your foundational knowledge. These quizzes test your understanding of core theoretical concepts. Modules include the Interval Practice, Triad & Tetrads Quiz, and the advanced Chord Trainer.
                            </p>
                        </div>
                        <div className="p-4 rounded-lg bg-slate-700/50">
                            <h4 className="font-bold text-xl text-indigo-300 mb-2">Fretboard</h4>
                            <p className="text-gray-300">
                                Apply theory directly to the guitar. These modules are focused on visualizing patterns and intervals on the fretboard. Test yourself with Fretboard Intervals or master chord shapes with the CAGED System Quiz.
                            </p>
                        </div>
                         <div className="p-4 rounded-lg bg-slate-700/50">
                            <h4 className="font-bold text-xl text-indigo-300 mb-2">Ear Training</h4>
                            <p className="text-gray-300">
                                Develop your aural skills. Listen and identify what you hear. You can practice recognizing individual intervals or entire melodic phrases.
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- Master Your Workflow Section --- */}
                <div>
                    <SectionHeader title="Master Your Workflow" />
                    <div className="bg-slate-700/50 p-6 rounded-lg mt-6 space-y-6">
                        <div>
                            <h4 className="font-bold text-xl text-amber-300 mb-2">The Global Toolkit</h4>
                            <p className="text-lg text-gray-300">
                                The floating toolbar gives you instant access to essential utilities. It includes a Metronome, Drone, Timer, and Stopwatch. It's also your hub for managing your Practice Log and all your saved Presets.
                            </p>
                        </div>
                         <div className="border-t border-slate-600 pt-6">
                            <h4 className="font-bold text-xl text-amber-300 mb-2">Build Your Library with Presets</h4>
                            <p className="text-lg text-gray-300">
                                Presets are the heart of a structured practice. Every module has a "Controls" panel where you can fine-tune your exercises. Once you have a setup you like, you can save it as a named preset. You can then instantly load these settings later from the "Presets" tab in the Global Toolkit.
                            </p>
                             <p className="text-lg text-gray-300 mt-2">
                                Want to share your favorite drill with a friend? You can export your entire preset library to a file and import presets from others.
                            </p>
                        </div>
                        <div className="border-t border-slate-600 pt-6">
                            <h4 className="font-bold text-xl text-amber-300 mb-2">Track Everything in the Practice Log</h4>
                            <p className="text-lg text-gray-300">
                                Every quiz and trainer has a "Log" button that lets you save the results of your session with custom notes. You can view your entire history, filter by activity, and even add custom entries for offline practice in the "Practice Log" tab.
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* --- Coming Soon Section --- */}
                <div>
                    <SectionHeader title="Coming Soon: The Challenge Tool" />
                    <div className="bg-slate-800/70 p-6 rounded-lg mt-6 border border-indigo-500">
                         <p className="text-lg text-gray-300">
                            Take your practice to the next level by combining your saved presets into structured, multi-step workout routines. Design your own time-based practice sessions, race against the clock in a "Gauntlet," or test your focus with a "Streak Challenge."
                        </p>
                        <p className="text-lg text-indigo-300 font-bold mt-4">
                            The Challenge Tool will unify the entire site, transforming your collection of presets into a powerful, personalized training plan.
                        </p>
                    </div>
                </div>

                {/* --- Mobile Note --- */}
                 <div className="bg-slate-800/70 p-4 rounded-lg border border-slate-600 mt-8">
                    <p className="text-lg font-bold text-amber-300">
                        A Note for iPhone & iPad Users:
                    </p>
                    <p className="text-md text-gray-300 mt-1">
                        To hear audio from the Metronome or Ear Training modules, please ensure your device's physical Ring/Silent switch is not in silent mode (the switch should not be showing orange).
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Welcome;