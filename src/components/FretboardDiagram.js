import React from 'react';
import PropTypes from 'prop-types';

/**
 * A dynamic and reusable guitar fretboard diagram component.
 * It renders a specified section of the fretboard and displays notes on it.
 * Built with SVG for scalability and easy styling.
 */
const FretboardDiagram = ({
  fretCount = 5,
  startFret = 0,
  stringCount = 6,
  notesToDisplay = [],
  showLabels = false,
}) => {

  // --- Dimensions and Constants ---
  const VIEWBOX_WIDTH = 800;
  const VIEWBOX_HEIGHT = 240;

  const STRING_SPACING = VIEWBOX_HEIGHT / stringCount;
  const NUT_WIDTH = startFret === 0 ? 10 : 0;
  const FRET_WIDTH = (VIEWBOX_WIDTH - NUT_WIDTH) / fretCount;
  
  const singleInlays = [3, 5, 7, 9, 15, 17, 19, 21];
  const doubleInlays = [12, 24];

  // --- Sub-Components ---

  const Frets = () => (
    <g className="frets">
      {Array.from({ length: fretCount + 1 }).map((_, i) => {
        const isNut = startFret === 0 && i === 0;
        const x = i * FRET_WIDTH + NUT_WIDTH;
        return (
          <line
            key={`fret-${i}`}
            x1={x}
            y1={0}
            x2={x}
            y2={VIEWBOX_HEIGHT}
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
          x1={0}
          y1={i * STRING_SPACING + STRING_SPACING / 2}
          x2={VIEWBOX_WIDTH}
          y2={i * STRING_SPACING + STRING_SPACING / 2}
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
      {notesToDisplay.map((note, index) => {
        if (note.fret < startFret || note.fret > startFret + fretCount) {
          return null;
        }

        // UPDATED: This block now calculates the X position for both fretted and open notes,
        // and then uses a single piece of code to render the note circle.
        let x;
        if (note.fret > 0) {
          // X position for a fretted note
          const relativeFret = note.fret - startFret;
          x = (relativeFret - 0.5) * FRET_WIDTH + NUT_WIDTH;
        } else {
          // X position for an open string note (fret 0)
          if (startFret !== 0) return null; // Don't show if nut isn't visible
          x = NUT_WIDTH / 2; // Center the circle on the nut
        }

        const y = (note.string - 1) * STRING_SPACING + (STRING_SPACING / 2);

        const fillColor = note.isRoot ? 'hsl(170, 100%, 35%)' : 'hsl(220, 80%, 55%)';
        const strokeColor = note.isRoot ? 'hsl(170, 100%, 75%)' : 'hsl(220, 80%, 85%)';

        let displayLabel = '';
        if (showLabels) {
          displayLabel = note.label || '';
        } else if (note.isRoot) {
          displayLabel = 'R';
        }

        return (
          <g key={`note-${index}`} transform={`translate(${x}, ${y})`} style={{ transition: 'all 0.3s ease' }}>
            <circle r="16" fill={fillColor} stroke={strokeColor} strokeWidth="2" />
            <text textAnchor="middle" dy=".3em" fill="white" fontSize="1.1rem" fontWeight="bold">
              {displayLabel}
            </text>
          </g>
        );
      })}
    </g>
  );

  return (
    <div className="flex flex-col items-center w-full">
      {startFret > 0 && (
        <div className="text-gray-400 text-sm font-bold mb-1">
          Fret: {startFret}
        </div>
      )}
      <svg
        className="w-full max-w-4xl bg-slate-800 rounded-lg shadow-lg border border-slate-700"
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
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
    isRoot: PropTypes.bool,
  })),
  showLabels: PropTypes.bool,
};

export default React.memo(FretboardDiagram);