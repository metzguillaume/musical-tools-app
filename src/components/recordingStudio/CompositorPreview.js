import React, { useEffect, useRef } from 'react';
import { useTools } from '../../context/ToolsContext';

// Mounts the compositor's offscreen canvas into the DOM as a live preview.
// The canvas itself is created by the compositor — we just attach it and
// optionally apply a CSS mirror for the on-screen view.
const CompositorPreview = ({ className = '' }) => {
    const { recorder } = useTools();
    const wrapRef = useRef(null);

    useEffect(() => {
        const compositor = recorder.getCompositor();
        const wrap = wrapRef.current;
        if (!compositor || !wrap) return undefined;
        const canvas = compositor.canvas;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.objectFit = 'contain';
        canvas.style.transform = 'none';
        wrap.appendChild(canvas);
        return () => {
            if (canvas.parentElement === wrap) wrap.removeChild(canvas);
        };
    }, [recorder, recorder.phase, recorder.hasWebcamStream, recorder.hasScreenStream]);

    return (
        <div
            ref={wrapRef}
            className={`bg-black w-full aspect-video flex items-center justify-center overflow-hidden rounded-lg ${className}`}
        />
    );
};

export default CompositorPreview;
