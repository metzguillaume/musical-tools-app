import React from 'react';
import { useDroppable } from '@dnd-kit/core';

// --- Note in the Measure (Click to delete) ---
const RhythmItem = ({ item, onRemove, isPlaying, left, width }) => (
    <button 
        onClick={onRemove} 
        className={`absolute bottom-0 p-2 rounded-md font-mono text-4xl h-20 flex items-center justify-center transition-all duration-75
                    ${isPlaying ? 'bg-yellow-400 text-black shadow-lg scale-110 z-10' : 'bg-slate-900 text-white'}`}
        style={{ left: `${left}px`, width: `${width}px` }}
        title={`Click to remove ${item.label}`}
    >
        {item.symbol}
    </button>
);

// --- Beat Subdivision Display ---
const BeatSubdivision = ({ beatsPerMeasure, timeSignature, widthPerBeat }) => {
    const subdivisions = [];
    
    // **FIX 2: Switched to a flex-based layout for subdivisions**
    if (timeSignature.beatType === 4) { // 4/4, 3/4, 2/4
        for (let i = 0; i < beatsPerMeasure; i++) {
            subdivisions.push(
                <div 
                    key={i} 
                    className="absolute top-0 h-full border-l border-slate-600 flex justify-around items-start pt-1" 
                    style={{ left: `${i * widthPerBeat}px`, width: `${widthPerBeat}px` }}
                >
                    <span className="font-bold text-lg text-teal-300 w-1/4 text-center">{i + 1}</span>
                    <span className="text-sm text-gray-400 w-1/4 text-center">e</span>
                    <span className="text-sm text-gray-400 w-1/4 text-center">+</span>
                    <span className="text-sm text-gray-400 w-1/4 text-center">a</span>
                </div>
            );
        }
    } else if (timeSignature.beatType === 8) { // 6/8
        const numMainBeats = beatsPerMeasure / 1.5; // 6/8 has 2 main beats
        for (let i = 0; i < numMainBeats; i++) {
            subdivisions.push(
                <div 
                    key={i} 
                    className="absolute top-0 h-full border-l border-slate-600 flex justify-around items-start pt-1" 
                    style={{ left: `${i * (widthPerBeat * 1.5)}px`, width: `${widthPerBeat * 1.5}px` }}
                >
                    <span className="font-bold text-lg text-teal-300 w-1/3 text-center">{i + 1}</span>
                    <span className="text-sm text-gray-400 w-1/3 text-center">+</span>
                    <span className="text-sm text-gray-400 w-1/3 text-center">a</span>
                </div>
            );
        }
    }
    
    // Add final bar line
    subdivisions.push(
        <div key="end" className="absolute top-0 h-full border-r-4 border-gray-400" style={{ left: `${beatsPerMeasure * widthPerBeat}px` }} />
    );

    return <div className="absolute top-0 left-0 w-full h-8">{subdivisions}</div>;
};

// --- Main Measure Component ---
export const Measure = ({ measure, measureIndex, beatsPerMeasure, timeSignature, isQuizMode, showBeatDisplay, onRemoveItem, onRemoveMeasure, currentlyPlayingId }) => {
    
    const QUARTER_NOTE_WIDTH = 100;
    const measureWidth = beatsPerMeasure * QUARTER_NOTE_WIDTH;
    
    const { setNodeRef } = useDroppable({
        id: `measure-${measureIndex}`,
        data: { measureIndex },
    });

    let cumulativeLeft = 0;
    const noteElements = measure.map((item) => {
        const itemWidth = item.duration * QUARTER_NOTE_WIDTH;
        const noteEl = (
            <RhythmItem 
                key={item.id} 
                item={item} 
                onRemove={() => onRemoveItem(measureIndex, item.id)}
                isPlaying={item.id === currentlyPlayingId}
                left={cumulativeLeft}
                width={itemWidth}
            />
        );
        cumulativeLeft += itemWidth;
        return noteEl;
    });

    return (
        <div className="flex-shrink-0 relative" style={{ width: `${measureWidth}px` }}>
            {!isQuizMode && (
                <button 
                    onClick={onRemoveMeasure} 
                    className="absolute -top-3 -right-3 w-6 h-6 bg-red-700 hover:bg-red-600 text-white font-bold rounded-full flex items-center justify-center border-2 border-slate-900 z-20"
                    title="Remove Measure"
                >
                    &times;
                </button>
            )}

            <div 
                ref={setNodeRef} 
                className={`relative h-40 p-2 bg-slate-700/50 rounded-md border-l-4 border-gray-400
                            ${!isQuizMode ? 'cursor-copy' : 'cursor-not-allowed'}`}
                style={{ width: `${measureWidth}px` }}
            >
                {showBeatDisplay && (
                    <BeatSubdivision 
                        beatsPerMeasure={beatsPerMeasure}
                        timeSignature={timeSignature}
                        widthPerBeat={QUARTER_NOTE_WIDTH}
                    />
                )}
                
                <div className="absolute bottom-0 left-0 h-28 w-full">
                    {noteElements}
                </div>
            </div>
        </div>
    );
};