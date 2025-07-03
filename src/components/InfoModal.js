import React from 'react';

const InfoModal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 transition-opacity duration-300"
            onClick={onClose}
        >
            <div 
                className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-lg w-11/12 shadow-2xl animate-pulse-once" // Using a simple pulse animation
                onClick={e => e.stopPropagation()} // Prevents closing modal when clicking inside the box
            >
                <h3 className="text-2xl font-bold text-indigo-300 mb-4">{title}</h3>
                <div className="text-left text-gray-300 space-y-3">
                    {children} 
                </div>
                <button 
                    onClick={onClose}
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                >
                    Got it!
                </button>
            </div>
        </div>
    );
};

export default InfoModal;