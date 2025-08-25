import React from 'react';

// A new sub-component for the expandable folder manager
const FolderManager = ({ routine, folders, onToggleFolder }) => ( // RENAMED prop
    <div className="bg-slate-800 p-4 rounded-b-lg -mt-2 animate-fade-in-down">
        <h4 className="font-bold text-indigo-300 mb-2">Assign to Folders:</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {folders.map(folder => (
                <label key={folder.id} className="flex items-center gap-3 p-2 bg-slate-900/50 rounded-md cursor-pointer hover:bg-slate-700/50">
                    <input
                        type="checkbox"
                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 bg-slate-700"
                        checked={routine.folderIds.includes(folder.id)} // RENAMED prop
                        onChange={() => onToggleFolder(routine.id, folder.id)} // RENAMED prop
                    />
                    <span className="font-semibold">{folder.name}</span>
                </label>
            ))}
             {folders.length === 0 && <p className="text-gray-400 col-span-full">No folders created yet.</p>}
        </div>
    </div>
);

const RoutineList = ({ routines = [], folders = [], onStart, onEdit, onDelete, onExport, onShowCreator, onToggleManageFolders, onToggleFolder, managingFoldersForId }) => { // RENAMED component and prop
    
    const getBorderColor = (type) => {
        switch (type) {
            case 'PracticeRoutine': return 'border-blue-600';
            case 'Gauntlet': return 'border-yellow-500';
            case 'Streak': return 'border-green-600';
            default: return 'border-slate-700';
        }
    };
    
    if (!routines || routines.length === 0) { // RENAMED prop
        if (!onShowCreator) {
            return <p className="text-center text-gray-400 py-4">No routines in this folder match your current filters.</p>; // RENAMED text
        }
        return (
            <div className="text-center p-8 bg-slate-700/50 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-300">No Routines Found</h3> {/*RENAMED text*/}
                <p className="text-gray-400 mt-2">You haven't created any routines yet. Get started by building a new one!</p> {/*RENAMED text*/}
                <button 
                    onClick={onShowCreator}
                    className="mt-4 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg"
                >
                    Create Your First Routine
                </button> {/*RENAMED text*/}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {routines.map(routine => ( // RENAMED prop
                <div key={routine.id}>
                    <div className={`bg-slate-700 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-2 ${getBorderColor(routine.type)} ${managingFoldersForId === routine.id ? 'rounded-t-lg' : 'rounded-lg'}`}>
                        <div className="flex-grow">
                            <h3 className="font-bold text-xl text-teal-300">{routine.name}</h3>
                            <p className="text-sm text-gray-400 capitalize">{routine.type.replace(/([A-Z])/g, ' $1').trim()} &bull; {routine.steps.length} Steps</p>
                            {routine.createdAt && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Created: {new Date(routine.createdAt).toLocaleString()}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-shrink-0 gap-2 flex-wrap items-center">
                            <button onClick={() => onToggleManageFolders(routine.id)} className={`${managingFoldersForId === routine.id ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'} text-white font-bold py-2 px-4 rounded-lg text-sm`}>Manage Folders</button>
                            <button onClick={() => onStart(routine)} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg text-sm">Start</button>
                            <button onClick={() => onEdit(routine)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg text-sm">Edit</button>
                            <button onClick={() => onExport(routine)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg text-sm">Export</button>
                            <button onClick={() => onDelete(routine.id)} className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-sm">Delete</button>
                        </div>
                    </div>
                    {/* Conditionally render the expandable panel */}
                    {managingFoldersForId === routine.id && (
                        <FolderManager 
                            routine={routine} // RENAMED prop
                            folders={folders}
                            onToggleFolder={onToggleFolder}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};

export default RoutineList; // RENAMED component