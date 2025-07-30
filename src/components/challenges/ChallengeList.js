import React from 'react';

const ChallengeList = ({ challenges, onStart, onEdit, onDelete, onExport, onShowCreator }) => {
    if (challenges.length === 0) {
        return (
            <div className="text-center p-8 bg-slate-700/50 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-300">No Challenges Found</h3>
                <p className="text-gray-400 mt-2">You haven't created any challenges yet. Get started by building a new one!</p>
                <button 
                    onClick={onShowCreator}
                    className="mt-4 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg"
                >
                    Create Your First Challenge
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {challenges.map(challenge => (
                <div key={challenge.id} className="bg-slate-700 p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-grow">
                        <h3 className="font-bold text-xl text-teal-300">{challenge.name}</h3>
                        <p className="text-sm text-gray-400 capitalize">{challenge.type.replace(/([A-Z])/g, ' $1').trim()} &bull; {challenge.steps.length} Steps</p>
                    </div>
                    <div className="flex flex-shrink-0 gap-2 flex-wrap">
                        <button onClick={() => onStart(challenge)} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg text-sm">Start</button>
                        <button onClick={() => onEdit(challenge)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg text-sm">Edit</button>
                        <button onClick={() => onExport(challenge)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg text-sm">Export</button>
                        <button onClick={() => onDelete(challenge.id)} className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm">Delete</button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ChallengeList;