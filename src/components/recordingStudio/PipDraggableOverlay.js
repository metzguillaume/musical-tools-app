import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTools } from '../../context/ToolsContext';

// Drag/resize the screen-capture PiP rectangle on top of the live preview.
// Geometry is mapped between the canvas (compositor output) and the surface
// (DOM element shown on screen) using a contain-fit transform.
const computeFit = (surfW, surfH, canW, canH) => {
    const surfRatio = surfW / surfH;
    const canRatio = canW / canH;
    if (canRatio > surfRatio) {
        const scale = surfW / canW;
        return { scale, offX: 0, offY: (surfH - canH * scale) / 2 };
    }
    const scale = surfH / canH;
    return { scale, offX: (surfW - canW * scale) / 2, offY: 0 };
};

const PipDraggableOverlay = ({ enabled = true, mirrorSurface = false }) => {
    const { recorder } = useTools();
    const { pip, setPip } = recorder;
    const compositor = recorder.getCompositor();

    const surfaceRef = useRef(null);
    const [drag, setDrag] = useState(null);
    const [, force] = useState(0); // re-render on resize

    useEffect(() => {
        const onResize = () => force((n) => n + 1);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const onMouseMove = useCallback((e) => {
        if (!drag || !surfaceRef.current || !compositor) return;
        const surfNow = surfaceRef.current.getBoundingClientRect();
        const { scale } = computeFit(surfNow.width, surfNow.height, compositor.canvas.width, compositor.canvas.height);
        const dxPx = e.clientX - drag.startMouseX;
        const dyPx = e.clientY - drag.startMouseY;
        const dxCanvas = (mirrorSurface ? -dxPx : dxPx) / scale;
        const dyCanvas = dyPx / scale;

        if (drag.mode === 'move') {
            const newX = drag.startCanvasRect.x + dxCanvas;
            const newY = drag.startCanvasRect.y + dyCanvas;
            const widthPct = drag.startPip.widthPct;
            const heightCanvas = drag.startCanvasRect.h;
            const xPct = Math.max(0, Math.min(1 - widthPct, newX / compositor.canvas.width));
            const yPct = Math.max(0, Math.min(1 - heightCanvas / compositor.canvas.height, newY / compositor.canvas.height));
            setPip({ ...drag.startPip, anchor: 'free', xPct, yPct });
        } else if (drag.mode === 'resize') {
            const newW = drag.startCanvasRect.w + dxCanvas;
            const widthPct = Math.max(0.12, Math.min(0.9, newW / compositor.canvas.width));
            setPip({ ...drag.startPip, anchor: 'free', widthPct });
        }
    }, [drag, compositor, mirrorSurface, setPip]);

    const onMouseUp = useCallback(() => setDrag(null), []);

    useEffect(() => {
        if (!drag) return undefined;
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [drag, onMouseMove, onMouseUp]);

    if (!enabled || !compositor) return null;

    const surf = surfaceRef.current?.getBoundingClientRect();

    const canvasToSurface = (x, y, w, h) => {
        if (!surf) return { left: 0, top: 0, width: 0, height: 0 };
        const { scale, offX, offY } = computeFit(surf.width, surf.height, compositor.canvas.width, compositor.canvas.height);
        const left = mirrorSurface
            ? offX + (compositor.canvas.width - x - w) * scale
            : offX + x * scale;
        const top = offY + y * scale;
        return { left, top, width: w * scale, height: h * scale, scale, offX, offY };
    };

    const r = compositor.getPipRect();
    const surfaceRect = canvasToSurface(r.x, r.y, r.w, r.h);

    const onMouseDown = (e, mode) => {
        e.preventDefault();
        e.stopPropagation();
        setDrag({
            mode,
            startMouseX: e.clientX,
            startMouseY: e.clientY,
            startPip: { ...pip },
            startCanvasRect: { ...r },
        });
    };

    return (
        <div ref={surfaceRef} className="absolute inset-0 pointer-events-none">
            <div
                onMouseDown={(e) => onMouseDown(e, 'move')}
                className="absolute border-2 border-teal-300/80 hover:border-teal-300 cursor-move pointer-events-auto"
                style={{
                    left: surfaceRect.left,
                    top: surfaceRect.top,
                    width: surfaceRect.width,
                    height: surfaceRect.height,
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.6)',
                }}
            >
                <div
                    onMouseDown={(e) => onMouseDown(e, 'resize')}
                    className="absolute right-[-6px] bottom-[-6px] w-3 h-3 bg-teal-300 border border-slate-900 cursor-nwse-resize"
                />
                <div className="absolute top-1 left-1 text-[10px] bg-black/60 text-teal-200 px-1 rounded">PiP</div>
            </div>
        </div>
    );
};

export default PipDraggableOverlay;
