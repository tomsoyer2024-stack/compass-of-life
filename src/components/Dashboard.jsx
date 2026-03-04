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

    // Cleaned up free-drag positions as we use strict Grid now.

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

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '2.5rem',
                    padding: '2rem',
                    marginTop: '15vh',
                    placeItems: 'center'
                }}>
                    {dashboardConfig.map(widget => {
                        // Goal Data Mapping
                        const goal = userGoals[widget.id] || {};
                        const progress = categoryProgressMap?.[widget.id] || 0;
                        const displayTitle = goal.title || t(widget.name);

                        return (
                            <GridWidget
                                key={widget.id}
                                widget={widget}
                                title={displayTitle}
                                progress={progress}
                                t={t}
                                onClick={() => {
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
                        initialTitle={detailWidget.title || t(detailWidget.name)}
                        onClose={() => setDetailWidget(null)}
                        onUpdateGoal={onUpdateGoal}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

const GridWidget = React.memo(({
    widget, progress, t, onClick, isFocused, isBlurred, setFocus, title
}) => {
    return (
        <div
            style={{
                position: 'relative',
                width: '120px',
                height: '120px',
                zIndex: isFocused ? 1500 : 10,
                opacity: isBlurred ? 0.5 : 1,
                transition: 'opacity 0.3s ease, transform 0.2s ease',
                transform: isFocused ? 'scale(1.1)' : 'scale(1)'
            }}
        >
            <BlobWidget
                onClick={() => { if (!isFocused) onClick(); else setFocus(false); }}
                shape={'24px'}
            >
                <div style={{ textAlign: 'center', pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>{widget.icon}</div>
                    <div style={{ fontWeight: 800, fontSize: '12px', color: 'rgba(0,0,0,0.7)', lineHeight: '1.2' }}>{title}</div>
                    <div style={{ fontSize: '11px', fontWeight: 900, color: '#007AFF', marginTop: '4px' }}>{progress}%</div>
                </div>
            </BlobWidget>
        </div>
    );
});
