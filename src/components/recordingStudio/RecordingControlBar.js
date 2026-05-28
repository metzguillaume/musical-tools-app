import React, { useEffect, useRef, useState } from 'react';
import { useTools } from '../../context/ToolsContext';

const formatTime = (ms) => {
    const total = Math.floor(ms / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const formatBytes = (b) => {
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
    if (b < 1024 * 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(1)} MB`;
    return `${(b / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const RecordingControlBar = () => {
    const { recorder } = useTools();
    const {
        phase, elapsedMs, recordedSize, markers,
        pauseRecording, resumeRecording, stopRecording, dropMarker,
    } = recorder;

    const [minimized, setMinimized] = useState(false);
    const [pos, setPos] = useState({ x: 16, y: 16 });
    const dragRef = useRef(null);

    // Hotkeys: P pause/resume, M marker, S stop
    useEffect(() => {
        const onKey = (e) => {
            // ignore if typing in an input
            const tag = (e.target?.tagName || '').toLowerCase();
            if (['input', 'textarea', 'select'].includes(tag) || e.target?.isContentEditable) return;
            if (e.key === 'p' || e.key === 'P') {
                if (phase === 'recording') pauseRecording();
                else if (phase === 'paused') resumeRecording();
            } else if (e.key === 'm' || e.key === 'M') {
                if (phase === 'recording') dropMarker();
            } else if (e.key === 's' || e.key === 'S') {
                if (phase === 'recording' || phase === 'paused') stopRecording();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [phase, pauseRecording, resumeRecording, dropMarker, stopRecording]);

    const onMouseDown = (e) => {
        // Only the drag handle starts a drag
        const target = e.target;
        if (!(target.dataset && target.dataset.drag === 'handle')) return;
        e.preventDefault();
        dragRef.current = { startX: e.clientX, startY: e.clientY, posX: pos.x, posY: pos.y };
        const onMove = (ev) => {
            if (!dragRef.current) return;
            const dx = ev.clientX - dragRef.current.startX;
            const dy = ev.clientY - dragRef.current.startY;
            setPos({
                x: Math.max(4, dragRef.current.posX + dx),
                y: Math.max(4, dragRef.current.posY + dy),
            });
        };
        const onUp = () => {
            dragRef.current = null;
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    };

    const isLive = phase === 'recording' || phase === 'paused';
    if (!isLive) return null;

    if (minimized) {
        return (
            <button
                onClick={() => setMinimized(false)}
                title="Recording in progress — click to expand controls"
                className="fixed z-[100] flex items-center gap-2 bg-black/70 text-white px-2 py-1 rounded-full shadow-lg hover:bg-black/90"
                style={{ left: pos.x, top: pos.y }}
            >
                <span className={`w-3 h-3 rounded-full ${phase === 'recording' ? 'bg-red-500 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-xs font-mono">{formatTime(elapsedMs)}</span>
            </button>
        );
    }

    return (
        <div
            onMouseDown={onMouseDown}
            className="fixed z-[100] flex items-center gap-2 bg-slate-900/95 border border-slate-600 rounded-full shadow-2xl px-2 py-1.5 select-none"
            style={{ left: pos.x, top: pos.y }}
        >
            <div data-drag="handle" className="cursor-move px-2 py-1 text-gray-400 text-xs">⋮⋮</div>
            <div className="flex items-center gap-2 px-2">
                <span className={`w-3 h-3 rounded-full ${phase === 'recording' ? 'bg-red-500 animate-pulse' : 'bg-amber-400'}`} />
                <span className="font-mono text-white text-sm">{formatTime(elapsedMs)}</span>
                <span className="text-xs text-gray-400">{formatBytes(recordedSize)}</span>
                {markers.length > 0 && (
                    <span className="text-xs text-teal-300">⚑{markers.length}</span>
                )}
            </div>
            {phase === 'recording' ? (
                <button onClick={pauseRecording} className="px-3 py-1.5 rounded-full bg-slate-700 hover:bg-slate-600 text-white text-sm" title="Pause (P)">⏸</button>
            ) : (
                <button onClick={resumeRecording} className="px-3 py-1.5 rounded-full bg-slate-700 hover:bg-slate-600 text-white text-sm" title="Resume (P)">▶</button>
            )}
            <button onClick={dropMarker} className="px-3 py-1.5 rounded-full bg-slate-700 hover:bg-slate-600 text-teal-300 text-sm" title="Drop marker (M)">⚑</button>
            <button onClick={stopRecording} className="px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-sm font-bold" title="Stop (S)">■</button>
            <button onClick={() => setMinimized(true)} className="px-2 py-1 text-gray-400 hover:text-white text-xs" title="Minimize">_</button>
        </div>
    );
};

export default RecordingControlBar;
