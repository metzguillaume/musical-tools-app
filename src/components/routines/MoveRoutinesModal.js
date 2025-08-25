import React, { useState } from 'react';

const MoveRoutinesModal = ({ isOpen, onClose, folders, onConfirm }) => {
    const [targetFolderIds, setTargetFolderIds] = useState(new Set());

    if (!isOpen) return null;

    const handleToggleFolder = (folderId) => {
        const newSelection = new Set(targetFolderIds);
        if (newSelection.has(folderId)) {
            newSelection.delete(folderId);
        } else {
            newSelection.add(folderId);
        }
        setTargetFolderIds(newSelection);
    };

    const handleConfirmClick = () => {
        onConfirm(targetFolderIds);
        setTargetFolderIds(new Set());
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/60" onClick={onClose}>
            <div className="w-11/12 max-w-md bg-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-teal-300 mb-4">Add Selected Routines to Folders</h3>
                <div className="flex-grow space-y-2 max-h-64 overflow-y-auto pr-2">
                    {folders.length > 0 ? folders.map(folder => (
                        <label key={folder.id} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-md cursor-pointer hover:bg-slate-700/50">
                             <input
                                type="checkbox"
                                className="h-5 w-5 rounded border-gray-400 text-indigo-600 bg-slate-700 focus:ring-indigo-500"
                                checked={targetFolderIds.has(folder.id)}
                                onChange={() => handleToggleFolder(folder.id)}
                            />
                            <span className="font-semibold text-white">{folder.name}</span>
                        </label>
                    )) : <p className="text-gray-400">You haven't created any custom folders yet.</p>}
                </div>
                <div className="flex justify-end gap-4 pt-4 mt-4 border-t border-slate-700">
                    <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg">Cancel</button>
                    <button onClick={handleConfirmClick} disabled={targetFolderIds.size === 0} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50">Apply</button>
                </div>
            </div>
        </div>
    );
};

export default MoveRoutinesModal;