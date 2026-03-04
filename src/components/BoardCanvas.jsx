import React, { useRef } from 'react';
import { useGesture } from '@use-gesture/react';
import { motion } from 'framer-motion';

export const BoardCanvas = ({
    x, y, scale, onPanZoom, onPointerDown, onPointerMove, onPointerUp,
    children, backgroundConfig = { type: 'solid', color: '#f5f5f7' }, gridType = 'dots', activeTool = 'select'
}) => {
    const containerRef = useRef(null);

    // useGesture for smooth panning and pinch-to-zoom
    const bind = useGesture(
        {
            onDrag: ({ offset: [dx, dy], event, memo }) => {
                // Only pan if it's a background drag or middle/right click
                // OR if it's a two-finger drag OR if active tool is 'hand'
                const isTwoFinger = event.touches && event.touches.length === 2;
                const isBackground = event.target.classList.contains('board-canvas-viewport');
                const isPanButton = event.button === 1 || event.button === 2 || (event.button === 0 && event.altKey);
                const isHandTool = activeTool === 'hand';

                if (isBackground || isPanButton || isTwoFinger || isHandTool) {
                    event.stopPropagation();
                    onPanZoom(dx, dy, scale);
                }
            },
            onPinch: ({ origin: [ox, oy], offset: [s], event }) => {
                event.preventDefault();
                const rect = containerRef.current.getBoundingClientRect();
                const mouseX = ox - rect.left;
                const mouseY = oy - rect.top;

                const newScale = Math.min(Math.max(0.1, s), 5);
                if (newScale !== scale) {
                    const newX = mouseX - (mouseX - x) * (newScale / scale);
                    const newY = mouseY - (mouseY - y) * (newScale / scale);
                    onPanZoom(newX, newY, newScale);
                }
            },
            onWheel: ({ event, offset: [dx, dy] }) => {
                if (event.ctrlKey || event.metaKey) return; // handled by pinch/zoom logic if implemented via wheel
                onPanZoom(x - event.deltaX, y - event.deltaY, scale);
            }
        },
        {
            drag: { from: () => [x, y] },
            pinch: { from: () => [scale, 0] },
            wheel: { eventOptions: { passive: false } }
        }
    );

    const renderGrid = () => {
        if (gridType === 'none') return null;
        const size = 30 * scale; // Slightly larger grid for simplicity
        const pattern = gridType === 'lines'
            ? `linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)`
            : `radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)`;

        return (
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: pattern,
                backgroundSize: `${size}px ${size}px`,
                backgroundPosition: `${x}px ${y}px`,
                pointerEvents: 'none',
                opacity: 0.8,
                willChange: 'background-position, background-size'
            }} />
        );
    };

    const bgStyle = backgroundConfig.type === 'image'
        ? { backgroundImage: `url(${backgroundConfig.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { background: backgroundConfig.color || '#f5f5f7' };

    return (
        <div
            {...bind()}
            ref={containerRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onContextMenu={(e) => e.preventDefault()}
            className="board-canvas-viewport"
            style={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                position: 'relative',
                ...bgStyle,
                touchAction: 'none',
                cursor: 'grab'
            }}
        >
            {renderGrid()}

            <motion.div
                style={{
                    x,
                    y,
                    scale,
                    transformOrigin: '0 0',
                    width: 0,
                    height: 0,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                }}
            >
                {children}
            </motion.div>

            {/* Zoom Indicator */}
            <div style={{
                position: 'absolute', bottom: 24, left: 24, padding: '8px 16px',
                background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)',
                borderRadius: '16px', fontSize: '13px', fontWeight: 800,
                color: '#1d1d1f', pointerEvents: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                zIndex: 1000, border: '1px solid rgba(255,255,255,0.4)'
            }}>
                {(scale * 100).toFixed(0)}%
            </div>
        </div>
    );
};
