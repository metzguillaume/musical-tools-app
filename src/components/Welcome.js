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
                            <h4 className="font-bold text-2xl text-indigo-300 mb-3">1. Explore a Module</h4>
                            <p className="text-gray-300">
                                Use the navigation bar above to select a practice tool. Each module is a focused quiz or generator for a specific skill.
                            </p>
                        </div>
                        <div className="bg-slate-800/70 p-4 rounded-lg border border-slate-700">
                            <h4 className="font-bold text-2xl text-indigo-300 mb-3">2. Create Presets</h4>
                            <p className="text-gray-300">
                                In each module, click "Controls" to adjust the settings. Save any configuration as a preset from the **Preset Manager** page.
                            </p>
                        </div>
                        <div className="bg-slate-800/70 p-4 rounded-lg border border-slate-700">
                            <h4 className="font-bold text-2xl text-indigo-300 mb-3">3. Build a Challenge</h4>
                            <p className="text-gray-300">
                                Go to the **Challenge Hub** to combine your saved presets into a structured, multi-step workout routine.
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
                                Spark creativity and create targeted exercises. These tools provide random content on demand, including notes, intervals, chord progressions, and fretboard diagrams.
                            </p>
                        </div>
                        <div className="p-4 rounded-lg bg-slate-700/50">
                            <h4 className="font-bold text-xl text-indigo-300 mb-2">Music Theory</h4>
                            <p className="text-gray-300">
                                Sharpen your foundational knowledge with quizzes on intervals, triads, 7th chords, and diatonic harmony.
                            </p>
                        </div>
                        <div className="p-4 rounded-lg bg-slate-700/50">
                            <h4 className="font-bold text-xl text-indigo-300 mb-2">Fretboard</h4>
                            <p className="text-gray-300">
                                Apply theory directly to the guitar. These modules are focused on visualizing patterns and intervals on the fretboard with the Fretboard Intervals and CAGED System quizzes.
                            </p>
                        </div>
                         <div className="p-4 rounded-lg bg-slate-700/50">
                            <h4 className="font-bold text-xl text-indigo-300 mb-2">Ear Training</h4>
                            <p className="text-gray-300">
                                Develop your aural skills. Listen to and identify individual intervals or entire melodic phrases to connect your ears to your theoretical knowledge.
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- Master Your Workflow Section --- */}
                <div>
                    <SectionHeader title="Master Your Workflow" />
                    <div className="bg-slate-700/50 p-6 rounded-lg mt-6 space-y-6">
                        <div>
                            <h4 className="font-bold text-xl text-amber-300 mb-2">The Global Toolkit: Your Practice Companion</h4>
                            <p className="text-lg text-gray-300">
                                The floating toolbar on the side of the screen is your command center, accessible at any time. Use it to accompany any practice session with essential utilities like the Metronome, a pitch Drone, a Timer, or a Stopwatch. It also provides quick access to your Practice Log and saved Presets.
                            </p>
                        </div>
                        <div className="border-t border-slate-600 pt-6">
                            <h4 className="font-bold text-xl text-amber-300 mb-2">Unleash Your Potential with Presets & Challenges</h4>
                            <p className="text-lg text-gray-300">
                                The **Preset Manager** is where you build your personal library of exercises. After configuring a module, you can save its settings as a named preset. Then, visit the **Challenge Hub** to combine these presets into powerful, multi-step workout routines, complete with custom goals and scoring.
                            </p>
                        </div>
                        <div className="border-t border-slate-600 pt-6">
                            <h4 className="font-bold text-xl text-amber-300 mb-2">Track Everything in the Scoreboard & Log</h4>
                            <p className="text-lg text-gray-300">
                                Every completed challenge is automatically saved to the **Scoreboard**, giving you a detailed breakdown of your performance. For other practice sessions, you can manually save notes to your **Practice Log** using the Global Toolkit.
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* --- Mobile Note --- */}
                 <div className="bg-slate-800/70 p-4 rounded-lg border border-slate-600 mt-16">
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