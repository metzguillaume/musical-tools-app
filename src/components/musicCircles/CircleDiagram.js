import React from 'react';

const CircleDiagram = ({ circleData, rotateCircle, onNodeClick, onNodeDoubleClick }) => {
    const SVG_SIZE = 500;
    const CENTER = SVG_SIZE / 2;
    // --- CHANGE: Radius and Node sizes are smaller ---
    const RADIUS = SVG_SIZE * 0.38;
    const NODE_WIDTH = SVG_SIZE * 0.16;
    const NODE_HEIGHT = SVG_SIZE * 0.13;

    return (
        <svg viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className="w-full h-full">
            {/* --- CHANGE: New SVG paths for clearer rotation arrows --- */}
            <g onClick={() => rotateCircle(-1)} className="cursor-pointer group">
                <rect x="150" y="225" width="50" height="50" fill="transparent" />
                <path d="M 195,250 A 50,50 0 1,1 195,251 Z M 165,235 L 165,265 L 185,250 Z"  fill="rgb(71 85 105)" className="group-hover:fill-slate-500 transition-colors" />
            </g>
            <g onClick={() => rotateCircle(1)} className="cursor-pointer group">
                <rect x="300" y="225" width="50" height="50" fill="transparent" />
                <path d="M 305,250 A 50,50 0 1,0 305,249 Z M 335,235 L 335,265 L 315,250 Z" fill="rgb(71 85 105)" className="group-hover:fill-slate-500 transition-colors" />
            </g>

            {/* Circle Nodes */}
            {circleData.map((item, i) => {
                // --- CHANGE: Angle calculation now dynamic based on the number of nodes ---
                const angle = (i / circleData.length) * 2 * Math.PI - (Math.PI / 2);
                const x = CENTER + RADIUS * Math.cos(angle);
                const y = CENTER + RADIUS * Math.sin(angle);

                const isTopNode = i === 0;
                const nodeFill = isTopNode ? 'rgb(22 78 99)' : 'rgb(51 65 85)';
                const textFill = item.isActive ? (isTopNode ? '#67e8f9' : '#e2e8f0') : '#475569';
                const fontSize = item.label.length > 3 ? '1.8rem' : '2.2rem';

                return (
                    <g
                        key={`${item.name}-${i}`}
                        transform={`translate(${x}, ${y})`}
                        onClick={() => item.isActive && onNodeClick(item)}
                        onDoubleClick={() => item.isActive && onNodeDoubleClick(i)}
                        className={item.isActive ? 'cursor-pointer group' : 'cursor-default'}
                    >
                        <rect
                            x={-NODE_WIDTH / 2}
                            y={-NODE_HEIGHT / 2}
                            width={NODE_WIDTH}
                            height={NODE_HEIGHT}
                            rx="15"
                            fill={nodeFill}
                            stroke={isTopNode ? '#06b6d4' : 'rgb(71 85 105)'}
                            strokeWidth="3"
                            className={item.isActive ? 'group-hover:fill-slate-600 transition-colors' : ''}
                        />
                        <text
                            x="0"
                            y="0"
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill={textFill}
                            fontSize={fontSize}
                            fontWeight="bold"
                            className="select-none"
                        >
                            {/* --- CHANGE: Use flat symbol --- */}
                            {item.label.replace('b', '♭')}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
};

export default CircleDiagram;