import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
export default function Pulse() {
    const { t } = useTranslation();
    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem('pulse_tasks');
        return saved ? JSON.parse(saved) : [
            { id: 1, title: 'Утренняя привычка', category: 'Health', icon: '☀️', completed: false, xp: 50 },
            { id: 2, title: 'Главная рабочая задача', category: 'Work', icon: '💻', completed: false, xp: 100 },
            { id: 3, title: 'Минута тишины', category: 'Spirit', icon: '🧘', completed: false, xp: 20 },
            { id: 4, title: 'Звонок близким', category: 'Relation', icon: '📞', completed: false, xp: 30 }
        ];
    });

    const [xp, setXp] = useState(() => Number(localStorage.getItem('user_xp') || 0));

    useEffect(() => {
        localStorage.setItem('pulse_tasks', JSON.stringify(tasks));
        localStorage.setItem('user_xp', xp.toString());
    }, [tasks, xp]);

    const toggleTask = (id) => {
        setTasks(prev => prev.map(task => {
            if (task.id === id) {
                if (!task.completed) {
                    setXp(cur => cur + (task.xp || 0));
                } else {
                    setXp(cur => Math.max(0, cur - (task.xp || 0)));
                }
                return { ...task, completed: !task.completed };
            }
            return task;
        }));
    };

    return (
        <div style={{
            padding: 'calc(32px + env(safe-area-inset-top)) 24px 120px 24px',
            maxWidth: '500px',
            margin: '0 auto',
            minHeight: '100dvh'
        }}>
            {/* AI Hint */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    padding: '16px 20px',
                    background: 'rgba(0, 122, 255, 0.08)',
                    borderRadius: '20px',
                    border: '1px solid rgba(0, 122, 255, 0.2)',
                    marginBottom: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}
            >
                <span style={{ fontSize: '24px' }}>💡</span>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#007AFF', lineHeight: 1.4 }}>
                    {t('pulse.ai_hint') || "Сначала привычка — получишь энергию на главную задачу."}
                </p>
            </motion.div>

            {/* Header / XP */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div>
                    <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#1d1d1f', margin: 0, letterSpacing: '-0.04em' }}>
                        {t('pulse.title') || "Пульс дня"}
                    </h2>
                    <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.4)', fontWeight: 700, margin: '4px 0 0 0' }}>
                        {tasks.filter(t => t.completed).length} / {tasks.length} {t('pulse.completed_count') || "ВЫПОЛНЕНО"}
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#FF9500' }}>{xp}</div>
                    <div style={{ fontSize: '10px', color: '#FF9500', fontWeight: 800, textTransform: 'uppercase' }}>XP</div>
                </div>
            </div>

            {/* Task List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <AnimatePresence>
                    {tasks.map((task) => (
                        <motion.div
                            key={task.id}
                            layout
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleTask(task.id)}
                            className="aero-card"
                            style={{
                                padding: '16px 20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                background: task.completed ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 255, 255, 0.35)',
                                borderColor: task.completed ? 'rgba(52, 199, 89, 0.3)' : 'rgba(255, 255, 255, 0.6)',
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '8px',
                                border: '2px solid',
                                borderColor: task.completed ? '#34C759' : 'rgba(0,0,0,0.1)',
                                background: task.completed ? '#34C759' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '14px'
                            }}>
                                {task.completed && '✓'}
                            </div>
                            <div style={{ fontSize: '24px' }}>{task.icon}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontSize: '16px',
                                    fontWeight: 700,
                                    color: task.completed ? 'rgba(0,0,0,0.3)' : '#1d1d1f',
                                    textDecoration: task.completed ? 'line-through' : 'none',
                                    transition: 'all 0.3s'
                                }}>
                                    {task.title}
                                </div>
                                <div style={{ fontSize: '11px', color: 'rgba(0,0,0,0.4)', fontWeight: 800, textTransform: 'uppercase' }}>
                                    {task.category} • +{task.xp} XP
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
