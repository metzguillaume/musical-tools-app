import React from 'react';

const BatchEditBar = ({ selectedCount, onMove, onDelete }) => {
    return (
        <div className="bg-slate-900/80 backdrop-blur-sm p-4 rounded-lg mb-6 flex justify-between items-center sticky top-4 z-20 border border-yellow-500">
            <span className="font-bold text-lg text-yellow-300">{selectedCount} Routine(s) Selected</span>
            <div className="flex gap-2">
                <button onClick={onMove} disabled={selectedCount === 0} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                    Move Selected
                </button>
                <button onClick={onDelete} disabled={selectedCount === 0} className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                    Delete Selected
                </button>
            </div>
        </div>
    );
};

export default BatchEditBar;