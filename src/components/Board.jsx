import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { BoardCanvas } from './BoardCanvas';
import { logger } from '../utils/logger';

// --- Utilities & Constants ---

const COLORS = [
    '#fff9c4', '#ffecb3', '#ffe0b2', '#ffccbc', '#f8bbd0', '#e1bee7', '#d1c4e9', '#c5cae9',
    '#bbdefb', '#b3e5fc', '#b2ebf2', '#b2dfdb', '#c8e6c9', '#dcedc8', '#f1f8e9', '#f5f5f5',
    '#007AFF', '#FF3B30', '#34C759', '#5856D6', '#FF9500', '#AF52DE', '#1d1d1f', '#ffffff'
];

const FONTS = [
    { name: 'Default', value: 'inherit' },
    { name: 'Modern', value: "'Outfit', sans-serif" },
    { name: 'Serif', value: "'Playfair Display', serif" },
    { name: 'Monospace', value: "'JetBrains Mono', monospace" },
    { name: 'Handwritten', value: "'Kalam', cursive" }
];

const simplifyPath = (points, tolerance = 1) => {
    if (points.length <= 2) return points;
    const getSqDist = (p1, p2) => Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
    const getSqSegDist = (p, p1, p2) => {
        let x = p1.x, y = p1.y, dx = p2.x - x, dy = p2.y - y;
        if (dx !== 0 || dy !== 0) {
            let t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);
            if (t > 1) { x = p2.x; y = p2.y; }
            else if (t > 0) { x += dx * t; y += dy * t; }
        }
        return getSqDist(p, { x, y });
    };
    const simplifyDPStep = (points, first, last, sqTolerance, simplified) => {
        let maxSqDist = sqTolerance, index;
        for (let i = first + 1; i < last; i++) {
            let sqDist = getSqSegDist(points[i], points[first], points[last]);
            if (sqDist > maxSqDist) { index = i; maxSqDist = sqDist; }
        }
        if (maxSqDist > sqTolerance) {
            if (index - first > 1) simplifyDPStep(points, first, index, sqTolerance, simplified);
            simplified.push(points[index]);
            if (last - index > 1) simplifyDPStep(points, index, last, sqTolerance, simplified);
        }
    };
    const simplified = [points[0]];
    simplifyDPStep(points, 0, points.length - 1, tolerance * tolerance, simplified);
    simplified.push(points[points.length - 1]);
    return simplified;
};

const pointsToSVG = (points) => {
    if (!points || points.length === 0) return '';
    return `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
};

const snapToGrid = (val, size = 20) => Math.round(val / size) * size;

// --- Entity Components ---

const StickyNote = React.memo(({ entity, onUpdate, scale, activeTool, onClick, isSelected }) => {
    const isDragging = useRef(false);
    const lastPos = useRef({ x: 0, y: 0 });

    const handlePointerDown = (e) => {
        if (activeTool !== 'select') return;
        e.stopPropagation();
        isDragging.current = true;
        lastPos.current = { x: e.clientX, y: e.clientY };
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!isDragging.current) return;
        const dx = (e.clientX - lastPos.current.x) / scale;
        const dy = (e.clientY - lastPos.current.y) / scale;
        onUpdate(entity.id, { x: entity.x + dx, y: entity.y + dy });
        lastPos.current = { x: e.clientX, y: e.clientY };
    };

    return (
        <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={() => isDragging.current = false}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            style={{
                position: 'absolute', left: entity.x, top: entity.y,
                width: 160, height: 160, padding: '20px',
                background: entity.color || '#fff9c4',
                boxShadow: isSelected ? '0 0 0 2px #007AFF, 0 12px 32px rgba(0,0,0,0.12)' : '0 8px 24px rgba(0,0,0,0.08)',
                cursor: activeTool === 'select' ? 'grab' : 'default',
                borderRadius: '4px',
                display: 'flex', flexDirection: 'column',
                transform: 'rotate(-0.5deg)',
                zIndex: isSelected ? 100 : (entity.zIndex || 1)
            }}
        >
            <textarea
                value={entity.text}
                onChange={(e) => onUpdate(entity.id, { text: e.target.value })}
                placeholder="Type..."
                style={{
                    width: '100%', height: '100%', border: 'none', background: 'transparent',
                    resize: 'none', outline: 'none', fontSize: '15px', fontWeight: 600,
                    textAlign: 'center', color: 'rgba(0,0,0,0.8)',
                    fontFamily: entity.font || 'inherit'
                }}
            />
            <div style={{ position: 'absolute', bottom: -10, right: 10, background: 'white', borderRadius: '10px', padding: '2px 8px', fontSize: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', cursor: 'pointer', fontWeight: 700 }} onClick={(e) => { e.stopPropagation(); onUpdate(entity.id, { votes: (entity.votes || 0) + 1 }); }}>
                👍 {entity.votes || 0}
            </div>
        </div>
    );
});

const SmartShape = React.memo(({ entity, onUpdate, scale, activeTool, onClick, isSelected }) => {
    const isDragging = useRef(false);
    const lastPos = useRef({ x: 0, y: 0 });

    const handlePointerDown = (e) => {
        if (activeTool !== 'select') return;
        e.stopPropagation();
        isDragging.current = true;
        lastPos.current = { x: e.clientX, y: e.clientY };
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!isDragging.current) return;
        const dx = (e.clientX - lastPos.current.x) / scale;
        const dy = (e.clientY - lastPos.current.y) / scale;
        onUpdate(entity.id, { x: entity.x + dx, y: entity.y + dy });
        lastPos.current = { x: e.clientX, y: e.clientY };
    };

    const renderShape = () => {
        const style = {
            width: '100%', height: '100%',
            background: entity.color || 'rgba(0, 122, 255, 0.12)',
            border: `2.5px solid ${entity.stroke || '#007AFF'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        };
        const content = <textarea value={entity.text || ''} onChange={(e) => onUpdate(entity.id, { text: e.target.value })} style={{ width: '80%', height: '40%', border: 'none', background: 'transparent', resize: 'none', outline: 'none', fontSize: '12px', textAlign: 'center', color: 'inherit', fontWeight: 600, fontFamily: entity.font || 'inherit' }} placeholder="..." />;

        if (entity.shapeType === 'circle') return <div style={{ ...style, borderRadius: '50%' }}>{content}</div>;
        if (entity.shapeType === 'diamond') return <div style={{ ...style, transform: 'rotate(45deg) scale(0.7)' }}><div style={{ transform: 'rotate(-45deg)' }}>{content}</div></div>;
        return <div style={{ ...style, borderRadius: '12px' }}>{content}</div>;
    };

    return (
        <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={() => isDragging.current = false}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            style={{
                position: 'absolute', left: entity.x, top: entity.y,
                width: 150, height: 150,
                cursor: activeTool === 'select' ? 'grab' : 'default',
                zIndex: isSelected ? 100 : (entity.zIndex || 1),
                filter: isSelected ? 'drop-shadow(0 0 4px #007AFF)' : 'none'
            }}
        >
            {renderShape()}
        </div>
    );
});

const Frame = React.memo(({ entity, onUpdate, scale, activeTool, onClick, isSelected }) => {
    const isDragging = useRef(false);
    const lastPos = useRef({ x: 0, y: 0 });

    const handlePointerDown = (e) => {
        if (activeTool !== 'select') return;
        e.stopPropagation();
        isDragging.current = true;
        lastPos.current = { x: e.clientX, y: e.clientY };
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!isDragging.current) return;
        const dx = (e.clientX - lastPos.current.x) / scale;
        const dy = (e.clientY - lastPos.current.y) / scale;
        onUpdate(entity.id, { x: entity.x + dx, y: entity.y + dy }, true);
        lastPos.current = { x: e.clientX, y: e.clientY };
    };

    return (
        <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={() => { isDragging.current = false; }}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            style={{
                position: 'absolute', left: entity.x, top: entity.y,
                width: entity.width || 400, height: entity.height || 300,
                border: isSelected ? '2.5px solid #007AFF' : '2px dashed rgba(0, 122, 255, 0.4)',
                background: 'rgba(0, 122, 255, 0.05)',
                borderRadius: '16px',
                pointerEvents: 'all',
                zIndex: isSelected ? 50 : (entity.zIndex || 0)
            }}
        >
            <div style={{
                position: 'absolute', top: -36, left: 0,
                padding: '6px 16px', background: isSelected ? '#007AFF' : 'rgba(0, 122, 255, 0.6)',
                color: 'white', borderRadius: '10px 10px 0 0',
                fontSize: '13px', fontWeight: 800, backdropFilter: 'blur(5px)'
            }}>
                <input
                    value={entity.title || 'Frame'}
                    onChange={(e) => onUpdate(entity.id, { title: e.target.value })}
                    style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: 'auto' }}
                />
            </div>
        </div>
    );
});

// --- Main Board ---

export default function Board() {
    const { t } = useTranslation();
    const [canvas, setCanvas] = useState({ x: 0, y: 0, scale: 1 });
    const [entities, setEntities] = useState([]);
    const [drawings, setDrawings] = useState([]);
    const [connections, setConnections] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [activeTool, setActiveTool] = useState('select');
    const [currentPoints, setCurrentPoints] = useState([]);
    const [selectionRect, setSelectionRect] = useState(null);
    const [linkingState, setLinkingState] = useState(null);
    const [bgConfig, setBgConfig] = useState({ type: 'solid', color: '#f5f5f7' });
    const [gridType, setGridType] = useState('dots');
    const [showSettings, setShowSettings] = useState(false);
    const [remoteCursors, setRemoteCursors] = useState([]);


    // Persistence
    useEffect(() => {
        const saved = localStorage.getItem('miro_v4_cust');
        if (saved) {
            const data = JSON.parse(saved);
            setEntities(data.entities || []);
            setDrawings(data.drawings || []);
            setConnections(data.connections || []);
            setBgConfig(data.bgConfig || { type: 'solid', color: '#f5f5f7' });
            setGridType(data.gridType || 'dots');
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('miro_v4_cust', JSON.stringify({ entities, drawings, connections, bgConfig, gridType }));
    }, [entities, drawings, connections, bgConfig, gridType]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeys = (e) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (document.activeElement.tagName === 'BODY') {
                    deleteSelected();
                }
            }
            if (e.key === 'Escape') setSelectedIds([]);
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, [selectedIds]);

    const deleteSelected = () => {
        setEntities(prev => prev.filter(e => !selectedIds.includes(e.id)));
        setConnections(prev => prev.filter(c => !selectedIds.includes(c.from) && !selectedIds.includes(c.to)));
        setSelectedIds([]);
    };

    const exportToJSON = () => {
        const data = JSON.stringify({ entities, drawings, connections, bgConfig, gridType }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'universe_board.json';
        a.click();
    };

    const importFromJSON = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (re) => {
            const data = JSON.parse(re.target.result);
            setEntities(data.entities || []);
            setDrawings(data.drawings || []);
            setConnections(data.connections || []);
            setBgConfig(data.bgConfig || { type: 'solid', color: '#f5f5f7' });
            setGridType(data.gridType || 'dots');
        };
        reader.readAsText(file);
    };

    const handlePanZoom = (x, y, scale) => setCanvas({ x, y, scale });

    const screenToCanvas = (clientX, clientY) => {
        const viewport = document.querySelector('.board-canvas-viewport')?.getBoundingClientRect();
        if (!viewport) return { x: 0, y: 0 };
        return {
            x: (clientX - viewport.left - canvas.x) / canvas.scale,
            y: (clientY - viewport.top - canvas.y) / canvas.scale
        };
    };

    const onEntityClick = (id) => {
        if (activeTool === 'connect') {
            if (!linkingState) setLinkingState({ startId: id });
            else if (linkingState.startId !== id) {
                setConnections(prev => [...prev, { id: Date.now().toString(), from: linkingState.startId, to: id }]);
                setLinkingState(null);
            }
        } else if (activeTool === 'select') {
            setSelectedIds([id]); // Miro-like: click selects one, rubberband selects many
            // Bring to front
            setEntities(prev => {
                const maxZ = Math.max(...prev.map(p => p.zIndex || 0), 10);
                return prev.map(e => e.id === id ? { ...e, zIndex: maxZ + 1 } : e);
            });
        }
    };

    const handlePointerDown = (e) => {
        if (activeTool === 'pen') {
            setCurrentPoints([screenToCanvas(e.clientX, e.clientY)]);
        } else if (activeTool === 'select' && e.target.classList.contains('board-canvas-viewport')) {
            const pt = screenToCanvas(e.clientX, e.clientY);
            setSelectionRect({ x1: pt.x, y1: pt.y, x2: pt.x, y2: pt.y });
            setSelectedIds([]);
        }
    };

    const handlePointerMove = (e) => {
        if (activeTool === 'pen' && currentPoints.length > 0) {
            setCurrentPoints(prev => [...prev, screenToCanvas(e.clientX, e.clientY)]);
        } else if (selectionRect) {
            const pt = screenToCanvas(e.clientX, e.clientY);
            setSelectionRect(prev => ({ ...prev, x2: pt.x, y2: pt.y }));
        }
    };

    const handlePointerUp = () => {
        if (activeTool === 'pen' && currentPoints.length > 2) {
            const simplified = simplifyPath(currentPoints, 1.5 / canvas.scale);
            setDrawings(prev => [...prev, { path: pointsToSVG(simplified) }]);
        }
        if (selectionRect) {
            const x1 = Math.min(selectionRect.x1, selectionRect.x2);
            const y1 = Math.min(selectionRect.y1, selectionRect.y2);
            const x2 = Math.max(selectionRect.x1, selectionRect.x2);
            const y2 = Math.max(selectionRect.y1, selectionRect.y2);
            const inside = entities.filter(e => e.x >= x1 && e.x <= x2 && e.y >= y1 && e.y <= y2);
            setSelectedIds(inside.map(e => e.id));
        }
        setCurrentPoints([]);
        setSelectionRect(null);
    };

    const updateEntity = (id, data, isFrameMove = false) => {
        const entity = entities.find(e => e.id === id);
        if (!entity) return;
        const dx = data.x !== undefined ? data.x - entity.x : 0;
        const dy = data.y !== undefined ? data.y - entity.y : 0;

        if (selectedIds.includes(id) || isFrameMove) {
            const targets = isFrameMove ? [] : selectedIds;
            const frameBounds = isFrameMove ? { x1: entity.x, y1: entity.y, x2: entity.x + (entity.width || 400), y2: entity.y + (entity.height || 300) } : null;
            setEntities(prev => prev.map(e => {
                if (e.id === id) return { ...e, ...data, x: snapToGrid(e.x + dx), y: snapToGrid(e.y + dy) };
                if (targets.includes(e.id)) return { ...e, x: snapToGrid(e.x + dx), y: snapToGrid(e.y + dy) };
                if (frameBounds && e.x >= frameBounds.x1 && e.x <= frameBounds.x2 && e.y >= frameBounds.y1 && e.y <= frameBounds.y2) {
                    return { ...e, x: snapToGrid(e.x + dx), y: snapToGrid(e.y + dy) };
                }
                return e;
            }));
        } else {
            setEntities(prev => prev.map(e => e.id === id ? { ...e, ...data, x: data.x !== undefined ? snapToGrid(data.x) : e.x, y: data.y !== undefined ? snapToGrid(data.y) : e.y } : e));
        }
    };

    const addEntity = (type, params = {}) => {
        const viewport = document.querySelector('.board-canvas-viewport')?.getBoundingClientRect();
        const centerX = (viewport?.width / 2 - canvas.x) / canvas.scale || 0;
        const centerY = (viewport?.height / 2 - canvas.y) / canvas.scale || 0;
        setEntities([...entities, { id: Date.now().toString(), type, x: centerX - 50, y: centerY - 50, ...params }]);
    };

    const updateSelectionColor = (color) => {
        setEntities(prev => prev.map(e => selectedIds.includes(e.id) ? { ...e, color } : e));
    };

    const updateSelectionFont = (font) => {
        setEntities(prev => prev.map(e => selectedIds.includes(e.id) ? { ...e, font } : e));
    };

    // Calculate selection toolbar position
    const getToolbarPos = () => {
        if (selectedIds.length === 0) return null;
        const selected = entities.filter(e => selectedIds.includes(e.id));
        const avgX = selected.reduce((s, e) => s + e.x, 0) / selected.length;
        const avgY = Math.min(...selected.map(e => e.y));
        return {
            left: avgX * canvas.scale + canvas.x,
            top: (avgY - 60) * canvas.scale + canvas.y
        };
    };

    return (
        <div style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden' }}>
            {/* Selection Rect Overlay */}
            {selectionRect && (
                <div className="selection-rect" style={{
                    left: Math.min(selectionRect.x1 * canvas.scale + canvas.x, selectionRect.x2 * canvas.scale + canvas.x),
                    top: Math.min(selectionRect.y1 * canvas.scale + canvas.y, selectionRect.y2 * canvas.scale + canvas.y),
                    width: Math.abs(selectionRect.x1 - selectionRect.x2) * canvas.scale,
                    height: Math.abs(selectionRect.y1 - selectionRect.y2) * canvas.scale
                }} />
            )}

            {/* Selection Toolbar */}
            <AnimatePresence>
                {selectedIds.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                        className="aero-card"
                        style={{
                            position: 'absolute', zIndex: 500, display: 'flex', gap: 10, padding: '8px 12px',
                            left: getToolbarPos().left, top: getToolbarPos().top, transform: 'translateX(-50%)'
                        }}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 18px)', gap: 4 }}>
                            {COLORS.slice(0, 8).map(c => (
                                <div key={c} onClick={() => updateSelectionColor(c)} style={{ width: 18, height: 18, borderRadius: '50%', background: c, border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer' }} />
                            ))}
                        </div>
                        <div style={{ width: 1, background: 'rgba(0,0,0,0.1)' }} />
                        <select
                            onChange={(e) => updateSelectionFont(e.target.value)}
                            style={{ background: 'transparent', border: 'none', fontSize: '11px', fontWeight: 700, outline: 'none', color: '#007AFF' }}
                        >
                            {FONTS.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                        </select>
                        <div style={{ width: 1, background: 'rgba(0,0,0,0.1)' }} />
                        <ToolButton onClick={deleteSelected} icon="🗑️" small />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Connection Hint */}
            <AnimatePresence>
                {activeTool === 'connect' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'absolute', bottom: 100, left: '50%', transform: 'translateX(-50%)',
                            background: '#007AFF', color: 'white', padding: '10px 20px', borderRadius: '14px',
                            fontSize: '13px', fontWeight: 800, zIndex: 1000, boxShadow: '0 8px 24px rgba(0, 122, 255, 0.3)'
                        }}
                    >
                        {linkingState ? 'SELECT SECOND OBJECT' : 'SELECT FIRST OBJECT TO LINK'}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Interaction Sidebar */}
            <div className="aero-card" style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', zIndex: 100, display: 'flex', flexDirection: 'column', gap: 10, padding: 10 }}>
                <ToolButton active={activeTool === 'select'} onClick={() => setActiveTool('select')} icon="🖱️" />
                <ToolButton active={activeTool === 'hand'} onClick={() => setActiveTool('hand')} icon="✋" />
                <ToolButton active={activeTool === 'pen'} onClick={() => setActiveTool('pen')} icon="✏️" />
                <ToolButton active={activeTool === 'connect'} onClick={() => { setActiveTool('connect'); setLinkingState(null); }} icon="🔗" />
                <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', margin: '4px 0' }} />
                <ToolButton onClick={() => addEntity('frame', { width: 400, height: 300 })} icon="🖼️" />
                <ToolButton onClick={() => addEntity('note', { text: '', color: COLORS[0] })} icon="📝" />
                <ToolButton onClick={() => addEntity('shape', { shapeType: 'rect' })} icon="⬜" />
                <ToolButton onClick={() => addEntity('shape', { shapeType: 'circle' })} icon="⚪" />
                <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', margin: '4px 0' }} />
                <ToolButton active={showSettings} onClick={() => setShowSettings(!showSettings)} icon="⚙️" />
            </div>

            {/* Canvas Settings Panel */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                        className="aero-card" style={{ position: 'absolute', left: 85, top: '40%', zIndex: 100, padding: 20, width: 220, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#007AFF', marginBottom: 4 }}>CANVAS SETTINGS</div>
                        <div style={{ fontSize: 11, fontWeight: 700 }}>GRID TYPE</div>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => setGridType('dots')} style={{ flex: 1, padding: 6, fontSize: 11, borderRadius: 6, background: gridType === 'dots' ? '#007AFF' : 'rgba(0,0,0,0.05)', color: gridType === 'dots' ? 'white' : 'black', border: 'none' }}>Dots</button>
                            <button onClick={() => setGridType('lines')} style={{ flex: 1, padding: 6, fontSize: 11, borderRadius: 6, background: gridType === 'lines' ? '#007AFF' : 'rgba(0,0,0,0.05)', color: gridType === 'lines' ? 'white' : 'black', border: 'none' }}>Lines</button>
                            <button onClick={() => setGridType('none')} style={{ flex: 1, padding: 6, fontSize: 11, borderRadius: 6, background: gridType === 'none' ? '#007AFF' : 'rgba(0,0,0,0.05)', color: gridType === 'none' ? 'white' : 'black', border: 'none' }}>None</button>
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 700, marginTop: 8 }}>BACKGROUND</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                            {['#f5f5f7', '#ffffff', '#e5e5ea', '#f2f2f7', '#fffbe0', '#e0f7fa', '#fce4ec', '#1d1d1f'].map(c => (
                                <div key={c} onClick={() => setBgConfig({ type: 'solid', color: c })} style={{ height: 30, borderRadius: 6, background: c, border: bgConfig.color === c ? '2px solid #007AFF' : '1px solid rgba(0,0,0,0.1)', cursor: 'pointer' }} />
                            ))}
                        </div>
                        <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', margin: '8px 0' }} />
                        <button onClick={exportToJSON} style={{ padding: 10, borderRadius: 8, background: '#007AFF', color: 'white', border: 'none', fontWeight: 600, fontSize: 12 }}>Export Board</button>
                    </motion.div>
                )}
            </AnimatePresence>

            <BoardCanvas x={canvas.x} y={canvas.y} scale={canvas.scale} onPanZoom={handlePanZoom} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} backgroundConfig={bgConfig} gridType={gridType} activeTool={activeTool}>
                <svg style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, overflow: 'visible', pointerEvents: 'none' }}>
                    <defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#007AFF" /></marker></defs>
                    {connections.map(c => {
                        const f = entities.find(e => e.id === c.from), t = entities.find(e => e.id === c.to);
                        return f && t ? <line key={c.id} x1={f.x + 75} y1={f.y + 75} x2={t.x + 75} y2={t.y + 75} stroke="#007AFF" strokeWidth="2.5" markerEnd="url(#arrowhead)" opacity="0.5" /> : null;
                    })}
                    {drawings.map((d, i) => <path key={i} d={d.path} stroke="#007AFF" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />)}
                    {currentPoints.length > 1 && <path d={pointsToSVG(currentPoints)} stroke="#007AFF" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
                </svg>

                <AnimatePresence>
                    {entities.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)).map(e => {
                        const props = { key: e.id, entity: e, onUpdate: updateEntity, scale: canvas.scale, activeTool, onClick: () => onEntityClick(e.id), isSelected: selectedIds.includes(e.id) };
                        if (e.type === 'note') return <StickyNote {...props} />;
                        if (e.type === 'shape') return <SmartShape {...props} />;
                        if (e.type === 'frame') return <Frame {...props} />;
                        return null;
                    })}
                </AnimatePresence>

            </BoardCanvas>

            {/* Top Bar Label */}
            <div style={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>
                <div className="aero-card" style={{ padding: '10px 24px', fontSize: '13px', fontWeight: 900, color: '#1d1d1f', letterSpacing: '0.05em', textTransform: 'uppercase' }}>🛸 UNIVERSE CANVAS</div>
            </div>
        </div>
    );
}

const ToolButton = ({ active, onClick, icon }) => (
    <motion.button
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        onClick={onClick}
        style={{
            width: 56, height: 56, borderRadius: 16, border: 'none',
            background: active ? '#007AFF' : 'transparent', color: active ? 'white' : '#1d1d1f',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, transition: '0.2s', boxShadow: active ? '0 10px 20px rgba(0, 122, 255, 0.3)' : 'none'
        }}
    >
        {icon}
    </motion.button>
);
