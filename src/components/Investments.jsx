import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { theme } from '../theme';
import { logger } from '../utils/logger';
import Modal from './Modal';
import HistoryModal from './HistoryModal';
import CircularProgress from './CircularProgress';
import { motion, AnimatePresence } from 'framer-motion';

const ICONS = ['❤️', '🧠', '🤝', '💼', '🧘', '🎨', '✈️', '🏠', '💰', '🎵', '📚', '⚽', '🌿', '🎁', '⭐', '🔥'];

const triggerHaptic = (style) => {
    // Dummy haptic
};


export default function Investments() {
    const { t } = useTranslation();

    const [assets, setAssets] = useState(() => {
        try {
            const saved = localStorage.getItem('lifeInvestments');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [activeModal, setActiveModal] = useState(null);
    const [historyModal, setHistoryModal] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);

    useEffect(() => {
        localStorage.setItem('lifeInvestments', JSON.stringify(assets));
    }, [assets]);

    const processedAssets = useMemo(() => {
        return assets.map(asset => {
            let yieldRate = 0;
            if (asset.progress > 80) yieldRate = 18;
            else if (asset.progress > 50) yieldRate = 10;
            else if (asset.progress > 20) yieldRate = 4;

            const isRecent = asset.lastInvested && (Date.now() - asset.lastInvested < 24 * 60 * 60 * 1000);

            return {
                ...asset,
                dynamicYield: yieldRate > 0 ? `+${yieldRate}% Yield` : 'Initial Phase 🌱',
                isRecent
            };
        });
    }, [assets, t]);

    const totalProgress = useMemo(() => {
        if (assets.length === 0) return 30; // Baseline
        const sum = assets.reduce((acc, curr) => acc + curr.progress, 0);
        return Math.round(sum / assets.length);
    }, [assets]);

    const handleInvest = async (amount) => {
        if (!activeModal?.data) return;
        triggerHaptic('medium');
        setAssets(prev => prev.map(a => {
            if (a.id === activeModal.data) {
                const oldProgress = a.progress;
                const newProgress = Math.min(100, a.progress + amount);

                if (newProgress === 100 && oldProgress < 100) {
                    // Confetti removed
                }

                return {
                    ...a,
                    progress: newProgress,
                    lastInvested: Date.now(),
                    history: [...(a.history || []), { amount, date: Date.now() }]
                };
            }
            return a;
        }));
        closeModal();
    };

    const handleCreateAsset = () => {
        if (!inputValue.trim()) return;
        triggerHaptic('heavy');
        const newAsset = {
            id: Date.now().toString(),
            name: inputValue,
            icon: selectedIcon,
            progress: 0,
            history: [],
            createdAt: Date.now()
        };
        setAssets(prev => [...prev, newAsset]);
        closeModal();
    };


    const closeModal = () => {
        setActiveModal(null);
        setInputValue('');
    };

    return (
        <div style={{ padding: '32px 24px', maxWidth: 840, margin: '0 auto', paddingBottom: '120px' }}>
            {/* Header / ROI */}
            <div className="aero-card" style={{
                padding: '32px', marginBottom: '40px', background: 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.2))',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '32px', fontWeight: 900, color: '#1d1d1f', letterSpacing: '-0.04em' }}>{t('investments.title')}</h2>
                    <div style={{ color: 'rgba(0,0,0,0.5)', marginTop: 6, fontSize: '15px', fontWeight: 600 }}>{t('investments.roi') || 'Resource Distribution Engine'}</div>
                </div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CircularProgress percentage={totalProgress} size={100} strokeWidth={10} color="#007AFF" />
                    <div style={{ position: 'absolute', textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: 900, color: '#1d1d1f' }}>{totalProgress}%</div>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase' }}>ROI</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '24px', paddingBottom: '160px' }}>
                <AnimatePresence>
                    {processedAssets.map(asset => (
                        <motion.div
                            layout key={asset.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            className="aero-card" style={{
                                padding: '28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative',
                                background: 'rgba(255, 255, 255, 0.35)', border: asset.isRecent ? '2px solid rgba(0, 122, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.6)'
                            }}
                        >
                            <div style={{ fontSize: '48px', marginBottom: '20px', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.1))' }}>{asset.icon}</div>

                            <div onClick={() => { triggerHaptic('light'); setHistoryModal(asset); }} style={{ position: 'absolute', top: '16px', right: '16px', cursor: 'pointer', opacity: 0.3 }}>

                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                            </div>

                            <div style={{ fontWeight: 800, fontSize: '18px', color: '#1d1d1f', textAlign: 'center', marginBottom: 8, letterSpacing: '-0.02em' }}>{asset.name}</div>
                            <div style={{ fontSize: '10px', color: '#007AFF', marginBottom: '24px', fontWeight: 900, background: 'rgba(0, 122, 255, 0.08)', padding: '6px 14px', borderRadius: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {asset.dynamicYield}
                            </div>

                            <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.06)', borderRadius: '12px', marginBottom: '28px', overflow: 'hidden' }}>
                                <motion.div initial={{ width: 0 }} animate={{ width: `${asset.progress}%` }} style={{ height: '100%', background: 'linear-gradient(90deg, #007AFF, #5856D6)', borderRadius: '12px', boxShadow: '0 0 8px rgba(0, 122, 255, 0.2)' }} />
                            </div>

                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveModal({ type: 'invest', data: asset.id })}
                                style={{ width: '100%', padding: '14px', borderRadius: '18px', border: 'none', background: '#1d1d1f', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '13px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                            >
                                {t('investments.invest')}
                            </motion.button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Reachability: Floating Action Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => { triggerHaptic('light'); setActiveModal({ type: 'new' }); }}

                style={{
                    position: 'fixed',
                    bottom: '120px',
                    right: '32px',
                    width: '64px',
                    height: '64px',
                    borderRadius: '22px',
                    background: '#007AFF',
                    color: 'white',
                    fontSize: '32px',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 12px 30px rgba(0, 122, 255, 0.4)',
                    zIndex: 100,
                    cursor: 'pointer'
                }}
            >
                +
            </motion.button>

            <Modal isOpen={!!activeModal} onClose={closeModal} title={activeModal?.type === 'new' ? t('investments.modal_create') : t('investments.modal_invest')}>
                {activeModal?.type === 'new' ? (
                    <div style={{ padding: '20px' }}>
                        <label style={{ display: 'block', fontSize: '11px', color: 'rgba(0,0,0,0.3)', marginBottom: '16px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('common.icon') || 'Identity Icon'}</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '32px' }}>
                            {ICONS.slice(0, 10).map(icon => (
                                <button key={icon} onClick={() => { triggerHaptic('light'); setSelectedIcon(icon); }} style={{ background: selectedIcon === icon ? 'rgba(0, 122, 255, 0.1)' : 'transparent', border: selectedIcon === icon ? '2px solid #007AFF' : '1.5px solid rgba(0,0,0,0.05)', borderRadius: '16px', fontSize: '26px', padding: '12px', cursor: 'pointer', transition: '0.3s' }}>

                                    {icon}
                                </button>
                            ))}
                        </div>
                        <input autoFocus placeholder="Asset Name" value={inputValue} onChange={e => setInputValue(e.target.value)} style={{ width: '100%', padding: '20px', borderRadius: '20px', border: '1.5px solid rgba(0,0,0,0.05)', fontSize: '18px', marginBottom: '24px', fontWeight: 700, outline: 'none', background: 'rgba(0,0,0,0.02)' }} />
                        <button onClick={handleCreateAsset} style={{ width: '100%', padding: '18px', background: '#007AFF', color: 'white', borderRadius: '22px', border: 'none', fontWeight: 800, fontSize: '16px', boxShadow: '0 12px 24px rgba(0, 122, 255, 0.3)' }}>{t('investments.create')}</button>
                    </div>
                ) : (
                    <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                        <p style={{ color: 'rgba(0,0,0,0.5)', marginBottom: '32px', fontWeight: 700, fontSize: '15px' }}>{t('investments.effort_level')}</p>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button onClick={() => handleInvest(5)} style={{ flex: 1, padding: '20px', borderRadius: '24px', border: '1.5px solid rgba(0,0,0,0.06)', background: 'white', cursor: 'pointer' }}>
                                <div style={{ fontSize: '12px', opacity: 0.5, marginBottom: 4, fontWeight: 800 }}>MOMENTUM</div>
                                <div style={{ fontSize: '24px', fontWeight: 900, color: '#34C759' }}>+5%</div>
                            </button>
                            <button onClick={() => handleInvest(15)} style={{ flex: 1, padding: '20px', borderRadius: '24px', border: 'none', background: '#1d1d1f', color: '#fff', cursor: 'pointer', boxShadow: '0 12px 24px rgba(0,0,0,0.2)' }}>
                                <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: 4, fontWeight: 800 }}>INTENSITY</div>
                                <div style={{ fontSize: '24px', fontWeight: 900, color: '#34C759' }}>+15%</div>
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            <HistoryModal isOpen={!!historyModal} onClose={() => setHistoryModal(null)} title={historyModal?.name || ''} goal={historyModal} />
        </div>
    );
}
