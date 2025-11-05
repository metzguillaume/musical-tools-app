// src/components/rhythmTool/VexFlowMeasure.js

import React, { useRef, useEffect, useCallback } from 'react';
import { Renderer, Stave, StaveNote, Voice, Formatter, Beam, Fraction, Tuplet, Dot } from 'vexflow';
import { useDroppable } from '@dnd-kit/core';

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


export const VexFlowMeasure = ({ 
    measure, 
    timeSignature, 
    width, // This is now a *minimum* width
    measureIndex, 
    isQuizMode, 
}) => {
    const vexflowRef = useRef(null);

    const { setNodeRef } = useDroppable({
        id: `measure-${measureIndex}`,
        data: { measureIndex },
        disabled: isQuizMode, 
    });

    const combinedRef = useCallback(
        (node) => {
            vexflowRef.current = node;
            setNodeRef(node);
        },
        [setNodeRef]
    );

    useEffect(() => {
        if (vexflowRef.current) {
            vexflowRef.current.innerHTML = '';
            
            const renderer = new Renderer(vexflowRef.current, Renderer.Backends.SVG);
            const context = renderer.getContext();
            context.setFont('Arial', 10).setBackgroundFillStyle('#FFFFFF');

            // --- Note generation ---
            const notes = [];
            const tuplets = [];
            
            measure.forEach(item => {
                if (item.type === 'note' || item.type === 'rest') {
                    const vexNote = getVexNoteConfig(item);
                    
                    // +++ THIS IS THE CORRECT FIX +++
                    // We set the 'id' property on the 'attrs' object.
                    vexNote.attrs.id = item.id; 
                    
                    notes.push(vexNote);
                } else if (item.type === 'group' && item.playback) {
                    item.playback.forEach((pbDuration, index) => {
                        const noteId = `${item.id}-sub-${index}`;
                        const vexNote = getVexNoteConfig({ duration: pbDuration, type: 'note' });
                        
                        // +++ THIS IS THE CORRECT FIX +++
                        vexNote.attrs.id = noteId;

                        notes.push(vexNote);
                    });
                } else if (item.type === 'triplet' && item.playback) {
                    const tripletNotes = item.playback.map((pbDuration, index) => {
                        const noteId = `${item.id}-sub-${index}`;
                        const vexNote = getVexNoteConfig({ duration: 0.5, type: 'note' });
                        
                        // +++ THIS IS THE CORRECT FIX +++
                        vexNote.attrs.id = noteId;

                        return vexNote;
                    });
                    notes.push(...tripletNotes);
                    tuplets.push(new Tuplet(tripletNotes)); 
                }
            });
            
            const PADDING = 10; // 10px padding on left and right
            
            if (notes.length > 0) {
                const beams = Beam.generateBeams(notes);

                const voice = new Voice({ 
                    num_beats: timeSignature.beats, 
                    beat_value: timeSignature.beatType 
                });
                
                voice.setStrict(false);
                voice.addTickables(notes);

                const formatter = new Formatter().joinVoices([voice]);
                
                formatter.preCalculateMinTotalWidth([voice]);
                
                const minRequiredWidth = formatter.getMinTotalWidth();
                const minWidth = minRequiredWidth + (PADDING * 2);
                const finalWidth = Math.max(width, minWidth); 
                
                renderer.resize(finalWidth, 120); 

                const staveWidth = finalWidth - (PADDING * 2);
                const stave = new Stave(PADDING, 0, staveWidth); 
                
                if (timeSignature) {
                    stave.addTimeSignature(timeSignature.label);
                }
                stave.setContext(context).draw();

                formatter.format([voice], staveWidth); 

                voice.draw(context, stave);
                beams.forEach(beam => beam.setContext(context).draw());
                tuplets.forEach(tuplet => tuplet.setContext(context).draw()); 
            } else {
                // Handle empty measure
                renderer.resize(width, 120);
                const staveWidth = width - (PADDING * 2);
                const stave = new Stave(PADDING, 0, staveWidth); 
                if (timeSignature) {
                    stave.addTimeSignature(timeSignature.label);
                }
                stave.setContext(context).draw();
            }
        }
    }, [measure, timeSignature, width, isQuizMode]);

    return (
        <div 
            ref={combinedRef} 
            className={`vexflow-measure bg-white rounded-md border-l-4 transition-all border-gray-400
                        ${!isQuizMode ? 'cursor-copy' : ''}
                      `}
            style={{ minHeight: '120px' }} // Width is now set automatically
        >
            {/* VexFlow draws directly here. */}
        </div>
    );
};