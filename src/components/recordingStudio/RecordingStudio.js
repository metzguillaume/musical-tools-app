import React, { useEffect } from 'react';
import { useTools } from '../../context/ToolsContext';
import SetupPanel from './SetupPanel';
import ReviewPanel from './ReviewPanel';
import RecordingControlBar from './RecordingControlBar';

// The studio modal opens for setup and review. During recording the modal
// closes so the app is fully usable; only the floating control bar remains.
const RecordingStudio = () => {
    const { recorder } = useTools();
    const { phase, studioOpen, closeStudio } = recorder;

    const showModal = studioOpen && (phase === 'setup' || phase === 'review');

    // Close on Escape from modal (but not while recording)
    useEffect(() => {
        if (!showModal) return undefined;
        const onKey = (e) => {
            if (e.key === 'Escape') closeStudio();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [showModal, closeStudio]);

    return (
        <>
            {showModal && (
                <div className="fixed inset-0 z-[80] bg-black/70 flex items-start justify-center overflow-auto p-4 md:p-8">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-6xl p-4 md:p-6">
                        {phase === 'setup' && <SetupPanel onClose={closeStudio} />}
                        {phase === 'review' && <ReviewPanel onClose={closeStudio} />}
                    </div>
                </div>
            )}
            <RecordingControlBar />
        </>
    );
};

export default RecordingStudio;
