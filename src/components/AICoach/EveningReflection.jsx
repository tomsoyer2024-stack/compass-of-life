import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { GoalDecomposer } from '../../services/aiCoach/GoalDecomposer';
import { haptic } from '../../utils/haptics';
import Modal from '../Modal';

export default function EveningReflection({ isOpen, onClose, dailyPlan = [], onPlanUpdated }) {
    const { t } = useTranslation();
    const [stepStates, setStepStates] = useState(dailyPlan.map(s => ({ ...s, completed: false, reason: '' })));
    const [loading, setLoading] = useState(false);
    const [showReasonIdx, setShowReasonIdx] = useState(null);

    const toggleStep = (idx) => {
        haptic.light();
        const next = [...stepStates];
        next[idx].completed = !next[idx].completed;
        setStepStates(next);
        if (!next[idx].completed) setShowReasonIdx(idx);
    };

    const handleReflect = async () => {
        setLoading(true);
        haptic.medium();
        try {
            const updatedPlan = [];
            for (const step of stepStates) {
                if (step.completed) {
                    updatedPlan.push({ ...step, status: 'completed' });
                } else {
                    // RECURSIVE DECOMPOSITION for problematic steps
                    const reason = step.reason || "Short on time";
                    const subSteps = await GoalDecomposer.splitProblematicStep(step.title, reason);
                    updatedPlan.push({
                        ...step,
                        status: 'decomposed',
                        subSteps: subSteps.map(s => ({ ...s, category: 'Recovery Plan' }))
                    });
                }
            }
            onPlanUpdated(updatedPlan);
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('ai.evening_title') || "Evening Reflection"}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ color: 'rgba(0,0,0,0.4)', fontSize: '13px', fontWeight: 700, textAlign: 'center' }}>
                    How did you do today? Be honest with the Mentor.
                </div>

                <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {stepStates.map((step, idx) => (
                        <div key={idx} className="aero-card" style={{ padding: '16px', background: step.completed ? 'rgba(52, 199, 89, 0.05)' : 'rgba(255,255,255,0.4)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <input
                                    type="checkbox"
                                    checked={step.completed}
                                    onChange={() => toggleStep(idx)}
                                    style={{ width: '20px', height: '20px', accentColor: '#34C759' }}
                                />
                                <div style={{ flex: 1, fontSize: '14px', fontWeight: 800, textDecoration: step.completed ? 'line-through' : 'none', opacity: step.completed ? 0.5 : 1 }}>
                                    {step.title}
                                </div>
                            </div>

                            {!step.completed && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={{ marginTop: '12px', overflow: 'hidden' }}>
                                    <input
                                        placeholder="Why wasn't this done? (Fear, info, time...)"
                                        value={step.reason}
                                        onChange={(e) => {
                                            const next = [...stepStates];
                                            next[idx].reason = e.target.value;
                                            setStepStates(next);
                                        }}
                                        style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', fontSize: '12px', outline: 'none' }}
                                    />
                                </motion.div>
                            )}
                        </div>
                    ))}
                </div>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReflect}
                    disabled={loading}
                    style={{
                        width: '100%', padding: '18px', borderRadius: '22px', background: '#1d1d1f', color: '#fff',
                        border: 'none', fontWeight: 800, fontSize: '15px', cursor: 'pointer', opacity: loading ? 0.5 : 1
                    }}
                >
                    {loading ? "ADAPTING TOMORROW..." : "FINISH REFLECTION"}
                </motion.button>
            </div>
        </Modal>
    );
}
