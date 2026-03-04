import React from 'react';
import { theme } from '../theme';

export const SmartConnections = ({ center, nodes }) => {
    // nodes is array of { id, x, y, width, height }

    return (
        <svg
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                overflow: 'visible'
            }}
        >
            <defs>
                <marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" fill={theme.colors.ui.primary} opacity="0.4" />
                </marker>
            </defs>

            {nodes.map(node => {
                const startX = center.x + center.width / 2;
                const startY = center.y + center.height / 2;
                const endX = node.x + node.width / 2;
                const endY = node.y + node.height / 2;

                // Bezier for "organic" feel
                const dist = Math.hypot(endX - startX, endY - startY);
                const controlOffset = dist * 0.3;

                // Curve logic: pull towards center vertical/horizontal
                const d = `M ${startX} ${startY} Q ${startX} ${endY} ${endX} ${endY}`; // Simple curve
                // complex: C ${startX + (endX - startX) / 2} ${startY} ${startX + (endX - startX) / 2} ${endY} ${endX} ${endY}

                return (
                    <g key={node.id}>
                        <path
                            d={`M${startX},${startY} L${endX},${endY}`}
                            stroke={theme.colors.ui.primary}
                            strokeWidth="2"
                            strokeDasharray="5,5"
                            opacity="0.2"
                        />
                        <line
                            x1={startX} y1={startY} x2={endX} y2={endY}
                            stroke={theme.colors.ui.primary}
                            strokeWidth="1"
                            opacity="0.1"
                        />
                    </g>
                );
            })}
        </svg>
    );
};
