import React, { useState, useEffect, useRef, useCallback } from 'react';
import { dashboardConfig } from '../config/dashboard';
import QuoteWidget from './QuoteWidget';
import BlobWidget from './BlobWidget';
import { useGesture } from '@use-gesture/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { supabase, syncWidgetPositions, syncGoalsToCloud } from '../services/supabase';

import { GoalDecomposer } from '../services/aiCoach/GoalDecomposer';
import { SystemDiagnostics } from '../services/SystemDiagnostics';
import { WidgetDetailModal } from './WidgetDetailModal';

export default function Dashboard({ t, isMobile, categoryProgressMap, userGoals = {}, onUpdateGoal, onOpenSidebar, settings }) {
    const [scale, setScale] = useState(1);
    const [focusedWidgetId, setFocusedWidgetId] = useState(null);
    const [detailWidget, setDetailWidget] = useState(null);

    // Widget positions state...
    const [widgetPositions, setWidgetPositions] = useState(() => {
        try {
            const saved = localStorage.getItem('dashboard_layout_v5');
            if (saved) return JSON.parse(saved);
        } catch (e) { }

        const initial = {};
        dashboardConfig.forEach(w => {
            const defPos = isMobile ? w.position?.mobile : w.position?.desktop;
            if (!defPos) return;
            initial[w.id] = {
                x: (parseFloat(defPos.x) / 100) * 400,
                y: (parseFloat(defPos.y) / 100) * 850
            };
        });
        return initial;
    });

    const handlers = useSwipeable({
        onSwipedRight: () => onOpenSidebar && onOpenSidebar(),
        trackMouse: true
    });

    // ... (Resize Effect remains same)
    useEffect(() => {
        const handleResize = () => {
            const vWidth = 400;
            const vHeight = 850;
            const windowW = window.innerWidth;
            const windowH = window.innerHeight;
            // Adaptive scaling for mobile
            const s = isMobile ? Math.min(windowW / vWidth, windowH / vHeight) * 0.95 : Math.min(windowW / vWidth, windowH / vHeight);
            setScale(s);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMobile]);

    // Position sync effect remains same...
    useEffect(() => {
        // ... (SystemDiagnostics check)
        // ... (Supabase load moved to App.jsx)
        // But we still need to load layout?
        // Actually layout loading was in useEffect in previous version. I should keep layout loading here or move to App?
        // Layout is UI state, can stay here.
        // I will keep the layout loading part but remove goals loading part.
        const loadLayout = async () => {
            const { data: { user } = {} } = await supabase.auth.getUser(); // Added default empty object for data
            if (user) {
                const { data: layoutData } = await supabase.from('widget_positions').select('*').eq('user_id', user.id);
                if (layoutData && layoutData.length > 0) {
                    const loadedLayout = {};
                    layoutData.forEach(item => {
                        loadedLayout[item.widget_id] = {
                            x: parseFloat(item.x),
                            y: parseFloat(item.y),
                            width: parseFloat(item.width),
                            height: parseFloat(item.height),
                            shape: item.shape
                        };
                    });
                    setWidgetPositions(loadedLayout);
                }
            }
        };
        loadLayout();
    }, []);

    // Sync Changes (Debounced)
    useEffect(() => {
        localStorage.setItem('dashboard_layout_v5', JSON.stringify(widgetPositions));
        const timer = setTimeout(() => syncWidgetPositions(widgetPositions), 2000);
        return () => clearTimeout(timer);
    }, [widgetPositions]);

    const updatePos = useCallback((id, x, y) => {
        setWidgetPositions(prev => {
            const newPos = { ...prev, [id]: { x, y } };
            // Simple Collision Detection
            Object.keys(newPos).forEach(otherId => {
                if (otherId === id) return;
                const dist = Math.sqrt(Math.pow(newPos[id].x - newPos[otherId].x, 2) + Math.pow(newPos[id].y - newPos[otherId].y, 2));
                if (dist < 80) { // Push away
                    const angle = Math.atan2(newPos[otherId].y - newPos[id].y, newPos[otherId].x - newPos[id].x);
                    newPos[otherId].x += Math.cos(angle) * 20;
                    newPos[otherId].y += Math.sin(angle) * 20;
                }
            });
            return newPos;
        });
    }, []);

    return (
        <div
            {...handlers}
            onClick={(e) => {
                if (e.target === e.currentTarget || e.target.id === 'dashboard-scale-container') {
                    setFocusedWidgetId(null);
                    setDetailWidget(null);
                }
            }}
            style={{
                display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
                width: '100%', height: '100dvh', background: 'var(--bg-color, #f5f5f7)', overflow: 'hidden', position: 'fixed', inset: 0,
                fontSize: '1rem', paddingTop: '0', paddingBottom: 'var(--safe-bottom)', paddingLeft: 'var(--safe-left)', paddingRight: 'var(--safe-right)'
            }}
        >
            <div
                id="dashboard-scale-container"
                onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        setFocusedWidgetId(null);
                        setDetailWidget(null);
                    }
                }}
                style={{
                    transform: `scale(${scale})`, transformOrigin: 'top center',
                    width: '400px', height: '850px', position: 'relative', touchAction: 'none'
                }}
            >
                {settings?.showQuotes && <QuoteWidget />}

                <div style={{ position: 'absolute', top: '15vh', left: 0, right: 0, bottom: 0 }}>
                    {dashboardConfig.map(widget => {
                        // Goal Data Mapping
                        const goal = userGoals[widget.id] || {};
                        const progress = categoryProgressMap?.[widget.id] || 0;
                        const pos = widgetPositions[widget.id] || { x: 0, y: 0 };
                        // Use goal title if exists, else fallback to translation
                        const displayTitle = goal.title || t(widget.name);

                        return (
                            <DraggableWidget
                                key={widget.id}
                                widget={widget}
                                title={displayTitle}
                                x={pos.x}
                                y={pos.y}
                                width={pos.width}
                                height={pos.height}
                                scale={scale}
                                updatePos={updatePos}
                                progress={progress}
                                t={t}
                                isMobile={isMobile}
                                onClick={() => {
                                    // Merge widget config with goal data (steps, etc)
                                    setDetailWidget({ ...widget, ...goal, progress });
                                }}
                                isFocused={focusedWidgetId === widget.id}
                                isBlurred={focusedWidgetId !== null && focusedWidgetId !== widget.id}
                                setFocus={(val) => setFocusedWidgetId(val ? widget.id : null)}
                            />
                        );
                    })}
                </div>
            </div>

            <AnimatePresence>
                {detailWidget && (
                    <WidgetDetailModal
                        widget={detailWidget}
                        t={t}
                        initialTitle={detailWidget.title || t(detailWidget.name)} // Use merged title
                        onClose={() => setDetailWidget(null)}
                        onUpdateGoal={onUpdateGoal}
                    // Remove old onUpdateTitle/onUpdateProgress props as onUpdateGoal handles everything
                    />
                )}
            </AnimatePresence>


        </div>
    );
}

const DraggableWidget = React.memo(({
    widget, x, y, width, height, scale, updatePos, progress, t, isMobile, onClick, isFocused, isBlurred, setFocus, title
}) => {
    const holdTimer = useRef(null);
    const defPos = isMobile ? widget.position?.mobile : widget.position?.desktop;
    const initialWidth = defPos?.width || 100;
    const initialHeight = defPos?.height || 100;

    const [size, setSize] = useState({
        width: width || initialWidth,
        height: height || initialHeight
    });

    const bind = useGesture({
        onDrag: ({ delta: [dx, dy] }) => {
            if (isFocused) updatePos(widget.id, x + dx / scale, y + dy / scale);
        },
        onPinch: ({ offset: [d] }) => {
            if (isFocused) {
                setSize(prev => ({
                    width: Math.max(80, Math.min(300, initialWidth * d)),
                    height: Math.max(80, Math.min(300, initialHeight * d))
                }));
            }
        },
        onPointerDown: () => {
            holdTimer.current = setTimeout(() => { setFocus(true); }, 500);
        },
        onPointerUp: () => {
            if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null; }
        }
    }, {
        drag: { threshold: 10, filterTaps: true, enabled: isFocused },
        pinch: { scaleBounds: { min: 0.5, max: 3 }, rubberband: true }
    });

    return (
        <div
            {...bind()}
            style={{
                position: 'absolute', left: `${x}px`, top: `${y}px`,
                width: size.width, height: size.height,
                zIndex: isFocused ? 2000 : 10, touchAction: 'none',
                opacity: isBlurred ? 0.5 : 1,
                transition: 'opacity 0.3s ease'
            }}
        >
            <BlobWidget
                onClick={() => { if (!isFocused) onClick(); else setFocus(false); }}
                shape={defPos?.shape || '24px'}
            >
                <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
                    <div style={{ fontSize: '24px' }}>{widget.icon}</div>
                    <div style={{ fontWeight: 800, fontSize: '11px', color: 'rgba(0,0,0,0.7)' }}>{title}</div>
                    <div style={{ fontSize: '9px', fontWeight: 900, color: '#007AFF' }}>{progress}%</div>
                </div>
            </BlobWidget>
        </div>
    );
});
