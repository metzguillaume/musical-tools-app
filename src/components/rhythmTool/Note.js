import React from 'react';

// A simple SVG for a Quarter Note
const QuarterNote = () => (
    <svg width="24" height="60" viewBox="0 0 20 50" fill="currentColor">
        <path d="M 10 32 C 7 32, 6 34, 6 37 C 6 40, 7 42, 10 42 C 13 42, 14 40, 14 37 C 14 34, 13 32, 10 32 Z" />
        <rect x="13" y="0" width="2" height="35" />
    </svg>
);

// A simple SVG for a Quarter Rest
const QuarterRest = () => (
    <svg width="24" height="60" viewBox="0 0 20 50" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M 8 10 Q 12 15, 8 20 Q 12 25, 8 30 Q 12 35, 8 40" />
    </svg>
);
// ... you would add components for all other types

export const Note = ({ item }) => {
    // This is a "stub". You'll need a component for each type.
    const renderNote = () => {
        switch (item.label) {
            case 'Quarter': return <QuarterNote />;
            case 'Quarter Rest': return <QuarterRest />;
            // ... etc.
            default: return <QuarterNote />;
        }
    };

    return (
        <div className="p-1 inline-block relative cursor-pointer">
            {renderNote()}
            {/* // TODO: Add an onClick handler here to call actions.removeRhythmItem */}
        </div>
    );
};