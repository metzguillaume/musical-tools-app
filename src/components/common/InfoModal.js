import React from 'react';

const InfoModal = ({ isOpen, onClose, title, children, verticalAlign = 'center' }) => {
    if (!isOpen) {
        return null;
    }

    const alignmentClass = verticalAlign === 'top' ? 'items-start pt-12 md:pt-24' : 'items-center';

    return (
        <div 
            className={`fixed inset-0 bg-black/60 flex justify-center p-4 z-50 transition-opacity duration-300 ${alignmentClass}`}
            onClick={onClose}
        >
            {/* MODIFIED: Switched from Flexbox to a Grid layout */}
            <div 
                className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl animate-pulse-once grid grid-rows-[auto_1fr_auto] max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                <h3 className="text-2xl font-bold text-indigo-300 p-6">{title}</h3>
                
                {/* MODIFIED: This is now a grid row that will scroll */}
                <div className="text-left text-gray-300 space-y-3 px-6 min-h-0 overflow-y-auto">
                    {children} 
                </div>

                <div className="p-6">
                    <button 
                        onClick={onClose}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg"
                    >
                        Got it!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InfoModal;