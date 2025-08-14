import React, { useState } from 'react';
import { useTools } from '../../context/ToolsContext';
import InfoModal from '../common/InfoModal';
import InfoButton from '../common/InfoButton';
import SectionHeader from '../common/SectionHeader';
import ChallengeList from './ChallengeList';
import ChallengeEditor from './ChallengeEditor';

const ChallengesPage = () => {
    const [view, setView] = useState('list'); // 'list' or 'editor'
    const [challengeToEdit, setChallengeToEdit] = useState(null);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const { challenges, saveChallenge, deleteChallenge, exportChallenge, startChallenge } = useTools();

    const handleCreateNew = () => {
        setChallengeToEdit(null);
        setView('editor');
    };

    const handleEdit = (challenge) => {
        setChallengeToEdit(challenge);
        setView('editor');
    };

    const handleSave = (challengeData) => {
        saveChallenge(challengeData);
        setView('list');
    };
    
    // UPDATED: This function now calls the real startChallenge function from the context.
    const handleStartChallenge = (challenge) => {
        startChallenge(challenge); 
    };

    return (
        <>
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Challenge Hub Guide">
    <p>Welcome to the Challenge Hub! This is where you can build, manage, and launch structured practice routines.</p>

    <h4 className="font-bold text-indigo-300 mt-4">How It Works</h4>
    <ul className="list-disc list-inside text-sm space-y-1">
        <li>A <strong>Preset</strong> is a saved configuration for a single exercise (e.g., "Major 7th Chords in C, G, F").</li>
        <li>A <strong>Challenge</strong> is a sequence of these presets, turning them into a complete workout.</li>
        <li>Use the <strong>"Create New Challenge"</strong> button to open the editor and start building your routine.</li>
        <li>You can <strong>Export</strong> a challenge to share it with others. The exported file includes all the presets needed to run it!</li>
    </ul>

    <h4 className="font-bold text-indigo-300 mt-4">Challenge Types</h4>
    <ul className="list-disc list-inside text-sm space-y-1">
        <li><strong>Practice Routine:</strong> The standard workout mode. Set a goal for each step (either time or number of questions) and complete them in sequential or random order.</li>
        <li><strong>The Gauntlet:</strong> A race against the clock. Your goal is to correctly answer a set number of questions for a single preset as fast as possible.</li>
        <li><strong>The Streak:</strong> A test of consistency. See how many questions you can answer correctly in a row. The presets are chosen randomly from a pool, and one wrong answer ends the challenge.</li>
    </ul>
</InfoModal>

            <div className="w-full max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-extrabold text-indigo-300">Challenge Hub</h1>
                        <InfoButton onClick={() => setIsInfoModalOpen(true)} />
                    </div>
                    {view === 'list' && (
                        <button onClick={handleCreateNew} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg">
                            Create New Challenge
                        </button>
                    )}
                </div>

                {view === 'list' ? (
                    <>
                        <SectionHeader title="My Challenges" />
                        <div className="mt-6">
                            <ChallengeList 
                                challenges={challenges}
                                onStart={handleStartChallenge}
                                onEdit={handleEdit}
                                onDelete={deleteChallenge}
                                onExport={exportChallenge}
                                onShowCreator={handleCreateNew}
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <SectionHeader title={challengeToEdit ? "Edit Challenge" : "Create New Challenge"} />
                         <div className="mt-6">
                            <ChallengeEditor 
                                challengeToEdit={challengeToEdit}
                                onSave={handleSave}
                                onCancel={() => setView('list')}
                            />
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default ChallengesPage;