import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { GoalDecomposer } from '../../services/aiCoach/GoalDecomposer';
import { AIPriorityManager } from '../../services/aiCoach/AIPriorityManager';
import { haptic } from '../../utils/haptics';
import Modal from '../Modal';

export default function MorningRitual({ isOpen, onClose, onPlanGenerated }) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [energy, setEnergy] = useState(70);
    const [goal, setGoal] = useState('');
    const [generatedPlan, setGeneratedPlan] = useState(null);

    const handleGenerate = async () => {
        if (!goal.trim()) return;
        setLoading(true);
        haptic.medium();
        try {
            const profile = AIPriorityManager.getUserProfile();
            const plan = await GoalDecomposer.decomposeGoal(goal, "Morning plan", profile);

            profile.energyLevel = energy;
            AIPriorityManager.setUserProfile(profile);

            setGeneratedPlan(plan);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const confirmPlan = () => {
        haptic.success();
        onPlanGenerated(generatedPlan.steps);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('ai.morning_title') || "Morning Ritual"}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {!generatedPlan ? (
                    <>
                        <div>
                            <label style={{ fontSize: '13px', fontWeight: 800, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', marginBottom: '12px', display: 'block' }}>
                                {t('ai.main_goal') || "What is your main focus today?"}
                            </label>
                            <textarea
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                placeholder="e.g., Ремонт террасы..."
                                style={{
                                    width: '100%', padding: '16px', borderRadius: '18px', border: '1.5px solid rgba(0,0,0,0.05)',
                                    background: 'rgba(0,0,0,0.02)', outline: 'none', fontSize: '15px', minHeight: '80px', resize: 'none'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '13px', fontWeight: 800, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', marginBottom: '12px', display: 'block' }}>
                                {t('ai.energy_level') || "Current Energy Level"} ({energy}%)
                            </label>
                            <input
                                type="range" min="0" max="100" value={energy}
                                onChange={(e) => setEnergy(parseInt(e.target.value))}
                                style={{ width: '100%', accentColor: '#007AFF' }}
                            />
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleGenerate}
                            disabled={loading || !goal.trim()}
                            style={{
                                width: '100%', padding: '18px', borderRadius: '22px', background: '#1d1d1f', color: '#fff',
                                border: 'none', fontWeight: 800, fontSize: '15px', cursor: 'pointer', opacity: (loading || !goal.trim()) ? 0.5 : 1
                            }}
                        >
                            {loading ? "GEMINI BREIFING..." : "ANALYZE GOAL"}
                        </motion.button>
                    </>
                ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        <div className="aero-card" style={{ padding: '20px', background: 'rgba(0, 122, 255, 0.05)', marginBottom: '20px' }}>
                            <div style={{ fontSize: '11px', fontWeight: 900, color: '#007AFF', textTransform: 'uppercase', marginBottom: '8px' }}>🤖 Morning Briefing</div>
                            <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#1d1d1f', fontWeight: 600 }}>{generatedPlan.briefing}</div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '24px' }}>
                            {['economy', 'speed', 'balance'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => haptic.medium()}
                                    style={{
                                        padding: '12px 4px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)',
                                        background: s === 'balance' ? 'rgba(0,0,0,0.05)' : 'white', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase'
                                    }}>
                                    {s}
                                </button>
                            ))}
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={confirmPlan}
                            style={{
                                width: '100%', padding: '18px', borderRadius: '22px', background: '#007AFF', color: '#fff',
                                border: 'none', fontWeight: 800, fontSize: '15px', cursor: 'pointer'
                            }}
                        >
                            CONFIRM & START PLAN
                        </motion.button>
                    </motion.div>
                )}
            </div>
        </Modal>
    );
}
