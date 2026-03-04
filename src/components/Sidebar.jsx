import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSwipeable } from 'react-swipeable';
import CircularProgress from './CircularProgress';
import Settings from './Settings';
import { supabase } from '../services/supabase';

export default function Sidebar({ isOpen, onClose, settings, onUpdateSettings, progress }) {
    const { t } = useTranslation();

    // Get today's steps from localStorage
    const [todaySteps, setTodaySteps] = useState([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [session, setSession] = useState(null);

    useEffect(() => {
        // Sync session state
        supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (isOpen) {
            const saved = localStorage.getItem('daily_steps');
            if (saved) setTodaySteps(JSON.parse(saved));
        }
    }, [isOpen]);

    const handleEmailLogin = async () => {
        const email = prompt("Enter your email:");
        if (!email) return;
        if (error) alert(error.message);
        else alert(t('sidebar.email_link_sent') || "Ссылка для входа отправлена на почту!");
    };

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: 'com.workflow.compass://login-callback'
            }
        });
        if (error) alert(error.message);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const handleManualSync = async () => {
        if (!session) {
            alert("Please login to sync");
            return;
        }
        setIsSyncing(true);
        try {
            // Manual Pull: Goals
            const { data: cloudGoals, error } = await supabase
                .from('goals')
                .select('*')
                .eq('user_id', session.user.id);

            if (cloudGoals) {
                console.log("Cloud goals pulled:", cloudGoals);
                // logic to merge with local state if needed
            }

            alert(t('sidebar.sync_success') || "Облачная синхронизация прошла успешно! ☁️");
        } catch (e) {
            console.error(e);
            alert("Sync Failed. Check console.");
        } finally {
            setIsSyncing(false);
        }
    };

    const handlers = useSwipeable({
        onSwipedLeft: () => onClose(),
        trackMouse: true
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', zIndex: 1999 }}
                    />

                    <motion.div
                        {...handlers}
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        style={{
                            position: 'fixed', top: 0, left: 0, bottom: 0, width: 'min(20rem, 85vw)',
                            background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)',
                            borderRight: '1px solid rgba(255, 255, 255, 0.5)', zIndex: 2000,
                            padding: 'calc(var(--safe-top) + 2rem) 1.5rem 1.5rem 1.5rem',
                            boxShadow: '1.25rem 0 3.75rem rgba(0,0,0,0.1)',
                            display: 'flex', flexDirection: 'column', overflowY: 'auto'
                        }}
                    >
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1.5rem', marginTop: '-1rem', color: '#1d1d1f', letterSpacing: '-0.04em', textAlign: 'center' }}>
                            {t('sidebar.title') || 'Меню'}
                        </h2>

                        {/* PROGRESS MINI CHART */}
                        <section style={{ marginBottom: '2.5rem' }}>
                            <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'rgba(0,0,0,0.35)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('sidebar.progress') || 'Daily Progress'}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', background: 'rgba(255,255,255,0.4)', padding: '1.25rem', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.6)' }}>
                                <CircularProgress size={60} strokeWidth={8} percentage={progress.habits || 0} color="#007AFF" />
                                <div>
                                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#1d1d1f' }}>{progress.habits || 0}%</div>
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(0,0,0,0.4)' }}>{t('sidebar.completed') || 'ВЫПОЛНЕНО'}</div>
                                </div>
                            </div>
                        </section>

                        {/* TODAY'S TASKS */}
                        <section style={{ marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '11px', fontWeight: 900, color: 'rgba(0,0,0,0.35)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('sidebar.tasks') || 'Today'}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {todaySteps.length > 0 ? todaySteps.slice(0, 3).map((step, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.03)', padding: '12px', borderRadius: '14px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '4px', background: '#34C759' }} />
                                        <span style={{ fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{step.text || step}</span>
                                    </div>
                                )) : (
                                    <div style={{ fontSize: '13px', color: 'rgba(0,0,0,0.3)', fontWeight: 600 }}>{t('sidebar.no_tasks') || 'Запланируй свой день'}</div>
                                )}
                            </div>
                        </section>

                        {/* SETTINGS COMPONENT */}
                        <Settings settings={settings} onUpdate={onUpdateSettings} />

                        {/* CLOUD AUTH & SYNC */}
                        <div style={{ marginTop: 'auto', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {!session ? (
                                <>
                                    <button
                                        onClick={handleGoogleLogin}
                                        style={{ width: '100%', padding: '14px', borderRadius: '16px', background: '#fff', color: '#000', border: '1px solid #ddd', fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                    >
                                        <span style={{ fontSize: '16px' }}>G</span> {t('sidebar.google_login') || 'Войти через Google'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', fontWeight: 600 }}>
                                        {t('sidebar.logged_in_as') || 'Вошли как'} {session.user.email}
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.96 }}
                                        onClick={handleManualSync}
                                        disabled={isSyncing}
                                        style={{
                                            width: '100%', padding: '16px', borderRadius: '18px',
                                            background: 'rgba(0,122,255,0.1)', color: '#007AFF', border: '1px solid rgba(0,122,255,0.2)',
                                            fontWeight: 800, fontSize: '13px', cursor: 'pointer',
                                            opacity: isSyncing ? 0.6 : 1
                                        }}
                                    >
                                        {isSyncing ? (t('sidebar.syncing') || 'СИНХРОНИЗАЦИЯ...') : (t('sidebar.sync_cloud') || '☁️ ОБЛАЧНАЯ СИНХРОНИЗАЦИЯ')}
                                    </motion.button>
                                    <button onClick={handleLogout} style={{ border: 'none', background: 'none', color: '#999', fontSize: '11px', textDecoration: 'underline' }}>{t('sidebar.logout') || 'Выйти'}</button>
                                </>
                            )}

                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
