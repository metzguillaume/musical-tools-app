// src/components/rhythmTool/VexFlowMeasure.js

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Renderer, Stave, StaveNote, Voice, Formatter, Beam, Tuplet, Dot } from 'vexflow';
import { useDroppable } from '@dnd-kit/core';
import { REST_TYPES } from './rhythmConstants'; 

// ... (getVexNoteConfig is unchanged)
const getVexNoteConfig = (item) => {
    let duration = 'q'; // default
    let isRest = item.type === 'rest';
    let dots = 0;
    
    // 1. Set Duration
    switch (item.duration) {
        case 4: duration = 'w'; break;
        case 3: duration = 'h'; dots = 1; break;
        case 2: duration = 'h'; break;
        case 1.5: duration = 'q'; dots = 1; break;
        case 1: duration = 'q'; break;
        case 0.75: duration = '8'; dots = 1; break;
        case 0.5: duration = '8'; break;
        case 0.25: duration = '16'; break;
        default: duration = 'q';
    }
    
    // 2. Add 'r' for rests
    if (isRest) {
        duration += 'r';
    }

    // 3. Create the StaveNote object
    const vexNote = new StaveNote({
        keys: [isRest ? 'b/4' : 'c/5'], 
        duration: duration,
    });
    
    // 4. Add dots robustly
    if (dots > 0) {
        for (let i = 0; i < dots; i++) {
            vexNote.addModifier(new Dot(), 0);
        }
    }
    
    return vexNote;
};

// ... (getRestsForDuration is unchanged)
const getRestsForDuration = (duration) => {
    const rests = [];
    const sortedRests = Object.entries(REST_TYPES)
        .map(([key, value]) => ({ key, ...value }))
        .sort((a, b) => b.duration - a.duration);

    let remaining = duration;
    
    for (const rest of sortedRests) {
        while (remaining >= rest.duration - 0.001) {
            rests.push(rest);
            remaining -= rest.duration;
        }
    }
    return rests;
};

const PADDING = 10; 

export const VexFlowMeasure = ({ 
    measure, 
    timeSignature, 
    width, // This is the *default* width
    measureIndex, 
    isQuizMode,
    beatsPerMeasure,
    isPlaying 
}) => {
    const vexflowRef = useRef(null);
    const [renderedWidth, setRenderedWidth] = useState(width); 

    const { setNodeRef } = useDroppable({
        id: `measure-${measureIndex}`,
        data: { measureIndex },
        disabled: isQuizMode, 
    });

    const combinedRef = useCallback(
        (node) => {
            vexflowRef.current = node;
        },
        []
    );

    useEffect(() => {
        if (vexflowRef.current) {
            vexflowRef.current.innerHTML = '';
            
            const renderer = new Renderer(vexflowRef.current, Renderer.Backends.SVG);
            const context = renderer.getContext();
            context.setFont('Arial', 10);
            
            const notes = [];
            const tuplets = [];
            const manualBeams = []; 
            
            // +++ This check is key for the logic below +++
            const userDuration = measure.reduce((sum, item) => sum + item.duration, 0);
            const isMeasureFull = userDuration >= beatsPerMeasure - 0.001;
            
            measure.forEach(item => {
                if (item.type === 'note' || item.type === 'rest') {
                    const vexNote = getVexNoteConfig(item);
                    vexNote.attrs.id = item.id; 
                    notes.push(vexNote);
                } else if (item.type === 'group' && item.playback) {
                    const groupNotes = item.playback.map((pbDuration, index) => {
                        const noteId = `${item.id}-sub-${index}`;
                        const vexNote = getVexNoteConfig({ duration: pbDuration, type: 'note' }); 
                        vexNote.attrs.id = noteId;
                        return vexNote;
                    });
                    manualBeams.push(new Beam(groupNotes)); 
                    notes.push(...groupNotes);
                } else if (item.type === 'triplet' && item.playback) {
                    const tripletNotes = item.playback.map((pbDuration, index) => {
                        const noteId = `${item.id}-sub-${index}`;
                        const vexNote = getVexNoteConfig({ duration: 0.5, type: 'note' }); 
                        vexNote.attrs.id = noteId;
                        // +++ FIX 1: Force triplet stems down to match +++
                        vexNote.setStemDirection(StaveNote.STEM_DOWN);
                        return vexNote;
                    });
                    
                    tuplets.push(new Tuplet(tripletNotes)); 
                    // +++ FIX 1: Re-add manual beam for triplets +++
                    manualBeams.push(new Beam(tripletNotes)); 
                    notes.push(...tripletNotes);
                }
            });

            // Auto-fill with rests in write mode
            let allTickables = [...notes];
            if (!isQuizMode && !isMeasureFull && userDuration < beatsPerMeasure) {
                const remainingDuration = beatsPerMeasure - userDuration;
                if (remainingDuration > 0.001) {
                    const rests = getRestsForDuration(remainingDuration);
                    const restVexNotes = rests.map(rest => getVexNoteConfig(rest));
                    allTickables.push(...restVexNotes);
                }
            }
            
            const defaultStaveWidth = width - (PADDING * 2);

            if (allTickables.length > 0) {
                const voice = new Voice({ 
                    num_beats: timeSignature.beats, 
                    beat_value: timeSignature.beatType 
                });
                
                voice.setStrict(false);
                voice.addTickables(allTickables);

                const formatter = new Formatter().joinVoices([voice]);
                const minRequiredWidth = formatter.preCalculateMinTotalWidth([voice]);
                
                let finalStaveWidth;
                let formatWidth;

                // +++ FIX 2: This is the definitive logic +++
                if (isMeasureFull && minRequiredWidth > defaultStaveWidth) {
                    // DENSE MEASURE (Overflow fix)
                    // Use natural width and expand the container
                    finalStaveWidth = minRequiredWidth;
                    formatWidth = minRequiredWidth; // Format to natural size (no stretch)
                } else {
                    // SPARSE MEASURE (Empty space fix)
                    // Use default width and stretch the notes
                    finalStaveWidth = defaultStaveWidth;
                    formatWidth = defaultStaveWidth; // Format (stretch) to default size
                }
                // +++ END FIX +++

                const finalWidth = finalStaveWidth + (PADDING * 2);
                renderer.resize(finalWidth, 120); 
                setRenderedWidth(finalWidth);

                const stave = new Stave(PADDING, 0, finalStaveWidth); 
                if (timeSignature) {
                    stave.addTimeSignature(timeSignature.label);
                }
                stave.setContext(context).draw();

                // Get notes that are not part of manual groups or tuplets
                const notesToAutoBeam = notes.filter(n => 
                    !tuplets.some(t => t.getNotes().includes(n)) &&
                    !manualBeams.some(b => b.getNotes().includes(n))
                );
                const autoBeams = Beam.generateBeams(notesToAutoBeam);
                
                formatter.format([voice], formatWidth, { align_rests: true }); 

                voice.draw(context, stave);
                [...manualBeams, ...autoBeams].forEach(beam => beam.setContext(context).draw());
                tuplets.forEach(tuplet => tuplet.setContext(context).draw()); 

            } else {
                // Empty measure
                renderer.resize(width, 120); 
                setRenderedWidth(width); 

                const stave = new Stave(PADDING, 0, defaultStaveWidth); 
                if (timeSignature) {
                    stave.addTimeSignature(timeSignature.label);
                }
                stave.setContext(context).draw();
            }
        }
    }, [measure, timeSignature, width, isQuizMode, beatsPerMeasure]);

    return (
        <div 
            ref={setNodeRef} 
            className={`vexflow-measure bg-white rounded-md border-l-4 transition-all
                        ${!isQuizMode ? 'cursor-copy' : ''}
                        ${isPlaying ? 'ring-2 ring-yellow-400 shadow-lg' : 'border-gray-400'}
                      `}
            // +++ Use dynamic state for width +++
            style={{ minHeight: '120px', width: `${renderedWidth}px` }} 
        >
            <div 
                ref={combinedRef} 
                className="w-full h-full"
            >
                {/* VexFlow draws directly here. */}
            </div>
        </div>
    );
};