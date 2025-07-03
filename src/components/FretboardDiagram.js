import React from 'react';
import PropTypes from 'prop-types';

const FretboardDiagram = ({
  fretCount = 15,
  startFret = 0,
  stringCount = 6,
  notesToDisplay = [],
  showLabels = false,
  labelType = 'name',
  colorMap = {},
  onBoardClick,
  onNoteMouseDown,
  onBoardMouseMove,
  onBoardMouseUp,
  draggingNote,
}) => {

    const VIEWBOX_WIDTH = 800;
    const VIEWBOX_HEIGHT = 240;
    const STRING_SPACING = VIEWBOX_HEIGHT / stringCount;
    const NUT_WIDTH = startFret === 0 ? 10 : 0;
    const FRET_WIDTH = (VIEWBOX_WIDTH - NUT_WIDTH) / fretCount;

    const singleInlays = [3, 5, 7, 9, 15, 17, 19, 21];
    const doubleInlays = [12, 24];

    const handleBoardClick = (evt) => {
        if (onBoardClick) {
            if (evt.target.closest('.notes g')) {
                return;
            }
            const svg = evt.currentTarget;
            const point = svg.createSVGPoint();
            point.x = evt.clientX;
            point.y = evt.clientY;
            
            const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse());
            const clickedString = Math.floor(svgPoint.y / STRING_SPACING) + 1;
            
            if (startFret === 0 && svgPoint.x > 0 && svgPoint.x < NUT_WIDTH) {
                 onBoardClick(clickedString, 0);
                 return;
            }
            
            const clickedFretOnView = Math.floor((svgPoint.x - NUT_WIDTH) / FRET_WIDTH);
            let clickedFret;

            if (startFret === 0) {
                clickedFret = clickedFretOnView + 1;
            } else {
                clickedFret = clickedFretOnView + startFret;
            }

            if (clickedString >= 1 && clickedString <= stringCount && clickedFret >= startFret && clickedFret <= startFret + fretCount) {
                 onBoardClick(clickedString, clickedFret);
            }
        }
    };
    
    const Frets = () => (
        <g className="frets">
            {Array.from({ length: fretCount + 1 }).map((_, i) => {
                const isNut = startFret === 0 && i === 0;
                const x = i * FRET_WIDTH + NUT_WIDTH;
                return (
                    <line
                        key={`fret-${i}`}
                        x1={x} y1={0} x2={x} y2={VIEWBOX_HEIGHT}
                        stroke={isNut ? 'hsl(0, 0%, 80%)' : 'hsl(0, 0%, 50%)'}
                        strokeWidth={isNut ? NUT_WIDTH : 4}
                    />
                );
            })}
        </g>
    );

    const Strings = () => (
        <g className="strings">
            {Array.from({ length: stringCount }).map((_, i) => (
                <line
                    key={`string-${i}`}
                    x1={0} y1={i * STRING_SPACING + STRING_SPACING / 2}
                    x2={VIEWBOX_WIDTH} y2={i * STRING_SPACING + STRING_SPACING / 2}
                    stroke="hsl(0, 0%, 70%)"
                    strokeWidth={1 + i * 0.3}
                />
            ))}
        </g>
    );

    const Inlays = () => {
        const markers = [];
        for (let i = 0; i < fretCount; i++) {
            const absoluteFret = startFret + i + 1;
            const x = i * FRET_WIDTH + (FRET_WIDTH / 2) + NUT_WIDTH;
            if (singleInlays.includes(absoluteFret)) {
                markers.push(<circle key={`inlay-${i}`} cx={x} cy={VIEWBOX_HEIGHT / 2} r="8" fill="rgba(255, 255, 255, 0.15)" />);
            }
            if (doubleInlays.includes(absoluteFret)) {
                markers.push(<circle key={`inlay-${i}-1`} cx={x} cy={STRING_SPACING * 1.5} r="8" fill="rgba(255, 255, 255, 0.15)" />);
                markers.push(<circle key={`inlay-${i}-2`} cx={x} cy={VIEWBOX_HEIGHT - (STRING_SPACING * 1.5)} r="8" fill="rgba(255, 255, 255, 0.15)" />);
            }
        }
        return <g className="inlays">{markers}</g>;
    };
    
    const Notes = () => (
        <g className="notes">
            {notesToDisplay.map((note) => {
                // --- FIX 1: Corrected the boundary condition to include the last fret ---
                // The upper bound check is changed from '>=' to '>' to correctly include the last fret in the view.
                if (note.fret < startFret || note.fret > startFret + fretCount) { return null; }
                
                let x;
                const displayFret = note.movedFret !== undefined ? note.movedFret : note.fret;

                if (displayFret > 0) {
                    const relativeFret = displayFret - startFret;
                    x = (relativeFret - 0.5) * FRET_WIDTH + NUT_WIDTH;
                } else {
                    if (startFret !== 0) return null;
                    x = NUT_WIDTH / 2;
                }
                const y = (note.string - 1) * STRING_SPACING + (STRING_SPACING / 2);
                
                const defaultColor = note.isRoot ? 'hsl(170, 100%, 35%)' : 'hsl(220, 80%, 55%)';
                const colorMapEntry = colorMap[note.degree];
                const fillColor = note.overrideColor || ((colorMapEntry && colorMapEntry.active) ? colorMapEntry.color : defaultColor);
                const strokeColor = note.isRoot ? 'hsl(170, 100%, 75%)' : 'hsl(220, 80%, 85%)';
                const baseLabel = labelType === 'degree' ? note.degree : note.label;
                const displayLabel = showLabels ? (note.overrideLabel || baseLabel) : (note.isRoot ? 'R' : '');
                const isDragging = draggingNote && draggingNote.string === note.string && draggingNote.fret === note.fret;

                return (
                    <g
                        key={`note-${note.string}-${note.fret}`}
                        transform={`translate(${x}, ${y})`}
                        onMouseDown={(e) => { e.stopPropagation(); if (onNoteMouseDown) onNoteMouseDown(note, e); }}
                        className={isDragging ? 'opacity-70 scale-110' : ''}
                        style={{ 
                            transition: isDragging ? 'none' : 'all 0.3s ease', 
                            cursor: onNoteMouseDown ? 'grab' : 'default',
                         }}
                    >
                        <circle r="16" fill={fillColor} stroke={strokeColor} strokeWidth="2" />
                        <text textAnchor="middle" dy=".3em" fill="white" fontSize="1.1rem" fontWeight="bold">{displayLabel}</text>
                    </g>
                );
            })}
        </g>
    );

    return (
        <div className="flex flex-col items-center w-full">
            {startFret > 0 && (<div className="text-gray-400 text-sm font-bold mb-1">Fret: {startFret}</div>)}
            <svg
                id="fretboard-diagram-svg"
                className="w-full max-w-4xl bg-slate-800 rounded-lg shadow-lg border border-slate-700"
                viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
                preserveAspectRatio="xMidYMid meet"
                onClick={handleBoardClick}
                onMouseMove={onBoardMouseMove}
                onMouseUp={onBoardMouseUp}
                onMouseLeave={onBoardMouseUp}
                style={{ cursor: onBoardClick ? 'copy' : (draggingNote ? 'grabbing' : 'default') }}
            >
                <rect width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} fill="transparent" />
                <g transform={`translate(0, 0)`}>
                    <Inlays />
                    <Strings />
                    <Frets />
                    <Notes />
                </g>
            </svg>
        </div>
    );
};

FretboardDiagram.propTypes = {
  fretCount: PropTypes.number,
  startFret: PropTypes.number,
  stringCount: PropTypes.number,
  notesToDisplay: PropTypes.arrayOf(PropTypes.shape({
    string: PropTypes.number.isRequired,
    fret: PropTypes.number.isRequired,
    label: PropTypes.string,
    midi: PropTypes.number,
    isRoot: PropTypes.bool,
    degree: PropTypes.string,
    overrideColor: PropTypes.string,
    overrideLabel: PropTypes.string,
    movedFret: PropTypes.number,
  })),
  showLabels: PropTypes.bool,
  labelType: PropTypes.oneOf(['name', 'degree']),
  colorMap: PropTypes.objectOf(PropTypes.shape({ color: PropTypes.string, active: PropTypes.bool })),
  onNoteMouseDown: PropTypes.func,
  onBoardMouseMove: PropTypes.func,
  onBoardMouseUp: PropTypes.func,
  onBoardClick: PropTypes.func,
  draggingNote: PropTypes.object,
};

// --- FIX 2: Removed React.memo to prevent stale rendering issues ---
// This ensures the component always re-renders with fresh data from its parent.
export default FretboardDiagram;