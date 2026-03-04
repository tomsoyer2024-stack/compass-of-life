import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { logger } from '../utils/logger';

// PREMIUM STYLES FOR CALCULATOR
const BUTTON_STYLE = {
    padding: '20px',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.45)',
    fontSize: '24px',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
};

const BusinessCalculator = () => {
    const [revenue, setRevenue] = useState('');
    const [costs, setCosts] = useState('');
    const profit = (parseFloat(revenue) || 0) - (parseFloat(costs) || 0);
    const margin = revenue ? ((profit / revenue) * 100).toFixed(1) : 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="aero-card" style={{ padding: '24px', background: 'rgba(255, 255, 255, 0.35)' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: 'rgba(0,0,0,0.3)', marginBottom: '8px', textTransform: 'uppercase' }}>Revenue ($)</label>
                <input type="number" placeholder="0" value={revenue} onChange={e => setRevenue(e.target.value)}
                    style={{ width: '100%', fontSize: '32px', padding: '8px 0', border: 'none', background: 'transparent', fontWeight: 700, outline: 'none', color: '#1d1d1f' }} />
            </div>
            <div className="aero-card" style={{ padding: '24px', background: 'rgba(255, 255, 255, 0.35)' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: 'rgba(0,0,0,0.3)', marginBottom: '8px', textTransform: 'uppercase' }}>Costs ($)</label>
                <input type="number" placeholder="0" value={costs} onChange={e => setCosts(e.target.value)}
                    style={{ width: '100%', fontSize: '32px', padding: '8px 0', border: 'none', background: 'transparent', fontWeight: 700, outline: 'none', color: '#1d1d1f' }} />
            </div>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="aero-card" style={{ background: 'linear-gradient(135deg, #007AFF, #5856D6)', padding: '36px 24px', color: '#fff', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', marginBottom: '8px' }}>Estimated Profit</div>
                <div style={{ fontSize: '48px', fontWeight: 900 }}>${profit.toLocaleString()}</div>
                <div style={{ fontSize: '16px', marginTop: '16px', fontWeight: 700, background: 'rgba(255,255,255,0.25)', display: 'inline-block', padding: '6px 16px', borderRadius: '14px' }}>Margin: {margin}%</div>
            </motion.div>
        </div>
    );
};

const SavingsCalculator = () => {
    const { t } = useTranslation();
    const [monthly, setMonthly] = useState('');
    const [years, setYears] = useState('');
    const [rate, setRate] = useState('5');

    const total = (parseFloat(monthly) || 0) * (parseFloat(years) || 0) * 12 * (1 + (parseFloat(rate) || 0) / 100);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="aero-card" style={{ padding: '24px', background: 'rgba(255, 255, 255, 0.35)' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: 'rgba(0,0,0,0.3)', marginBottom: '8px', textTransform: 'uppercase' }}>Monthly Saving ($)</label>
                <input type="number" placeholder="0" value={monthly} onChange={e => setMonthly(e.target.value)}
                    style={{ width: '100%', fontSize: '32px', padding: '8px 0', border: 'none', background: 'transparent', fontWeight: 700, outline: 'none', color: '#1d1d1f' }} />
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
                <div className="aero-card" style={{ flex: 1, padding: '24px', background: 'rgba(255, 255, 255, 0.35)' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: 'rgba(0,0,0,0.3)', marginBottom: '8px', textTransform: 'uppercase' }}>Years</label>
                    <input type="number" placeholder="0" value={years} onChange={e => setYears(e.target.value)}
                        style={{ width: '100%', fontSize: '24px', padding: '8px 0', border: 'none', background: 'transparent', fontWeight: 700, outline: 'none', color: '#1d1d1f' }} />
                </div>
                <div className="aero-card" style={{ flex: 1, padding: '24px', background: 'rgba(255, 255, 255, 0.35)' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 900, color: 'rgba(0,0,0,0.3)', marginBottom: '8px', textTransform: 'uppercase' }}>Rate (%)</label>
                    <input type="number" placeholder="5" value={rate} onChange={e => setRate(e.target.value)}
                        style={{ width: '100%', fontSize: '24px', padding: '8px 0', border: 'none', background: 'transparent', fontWeight: 700, outline: 'none', color: '#1d1d1f' }} />
                </div>
            </div>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="aero-card" style={{ background: 'linear-gradient(135deg, #34C759, #30B0C7)', padding: '36px 24px', color: '#fff', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', marginBottom: '8px' }}>Projected Capital</div>
                <div style={{ fontSize: '48px', fontWeight: 900 }}>${Math.round(total).toLocaleString()}</div>
                <div style={{ fontSize: '13px', marginTop: '12px', fontWeight: 600, opacity: 0.9 }}>🌱 Your future self will thank you.</div>
            </motion.div>
        </div>
    );
};

export default function Calculator() {
    const { t } = useTranslation();
    const [mode, setMode] = useState('regular');
    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('calc_history');
        return saved ? JSON.parse(saved) : [];
    });

    const addToHistory = (calc) => {
        const newHistory = [calc, ...history].slice(0, 3);
        setHistory(newHistory);
        localStorage.setItem('calc_history', JSON.stringify(newHistory));
    };

    return (
        <div style={{
            padding: 'calc(32px + env(safe-area-inset-top)) 24px 120px 24px',
            height: '100%',
            maxWidth: '480px',
            margin: '0 auto',
            position: 'relative'
        }}>
            {/* Mode Switcher */}
            <div className="aero-card" style={{ display: 'flex', padding: '6px', marginBottom: '36px', background: 'rgba(255, 255, 255, 0.35)', borderRadius: '24px' }}>
                {['regular', 'business', 'savings'].map(m => (
                    <motion.button
                        key={m}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setMode(m); }}
                        style={{
                            flex: 1, padding: '12px', borderRadius: '20px', border: 'none',
                            background: mode === m ? '#007AFF' : 'transparent',
                            color: mode === m ? '#fff' : 'rgba(0,0,0,0.5)',
                            fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em'
                        }}
                    >
                        {t(`calc.mode_${m}`) || m.toUpperCase()}
                    </motion.button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={mode}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.4 }}
                >
                    {mode === 'regular' && <RegularCalculator onComplete={(res) => addToHistory({ type: 'calc', val: res, icon: '🧮' })} />}
                    {mode === 'business' && <BusinessCalculator />}
                    {mode === 'savings' && <SavingsCalculator />}
                </motion.div>
            </AnimatePresence>

            {/* History Section */}
            {history.length > 0 && mode === 'regular' && (
                <div style={{ marginTop: '32px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 900, color: 'rgba(0,0,0,0.3)', textTransform: 'uppercase', marginBottom: '12px' }}>Recent</div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {history.map((h, i) => (
                            <div key={i} className="aero-card" style={{ flex: 1, padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: 700, background: 'rgba(255,255,255,0.2)' }}>
                                {h.icon} {h.val}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

const RegularCalculator = ({ onComplete }) => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState('');

    const handleCalc = () => {
        if (!input) return;
        try {
            // eslint-disable-next-line no-new-func
            const res = new Function('return ' + input.replace(/×/g, '*').replace(/÷/g, '/'))();
            setResult(String(res));
            onComplete(String(res));
        } catch (e) {
            setResult('Error');
        }
    };

    const addToken = (t) => {
        setInput(prev => prev + t);
    };

    const buttons = [
        { label: 'C', type: 'clear', bg: 'rgba(255, 69, 58, 0.12)', color: '#FF453A' },
        { label: '÷', type: 'op', bg: 'rgba(255, 255, 255, 0.4)', color: '#007AFF' },
        { label: '×', type: 'op', bg: 'rgba(255, 255, 255, 0.4)', color: '#007AFF' },
        { label: '⌫', type: 'delete', bg: 'rgba(255, 255, 255, 0.4)', color: '#8E8E93' },
        { label: '7', bg: 'rgba(255, 255, 255, 0.55)' }, { label: '8', bg: 'rgba(255, 255, 255, 0.55)' }, { label: '9', bg: 'rgba(255, 255, 255, 0.55)' }, { label: '-', type: 'op', bg: 'rgba(255, 255, 255, 0.4)', color: '#007AFF' },
        { label: '4', bg: 'rgba(255, 255, 255, 0.55)' }, { label: '5', bg: 'rgba(255, 255, 255, 0.55)' }, { label: '6', bg: 'rgba(255, 255, 255, 0.55)' }, { label: '+', type: 'op', bg: 'rgba(255, 255, 255, 0.4)', color: '#007AFF' },
        { label: '1', bg: 'rgba(255, 255, 255, 0.55)' }, { label: '2', bg: 'rgba(255, 255, 255, 0.55)' }, { label: '3', bg: 'rgba(255, 255, 255, 0.55)' }, { label: '=', type: 'eq', bg: '#007AFF', color: '#fff' },
        { label: '0', bg: 'rgba(255, 255, 255, 0.55)', span: 2 }, { label: '.', bg: 'rgba(255, 255, 255, 0.55)' }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="aero-card" style={{ padding: '32px 24px', textAlign: 'right', minHeight: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: 'rgba(255, 255, 255, 0.25)', borderRadius: '36px' }}>
                <div style={{ color: 'rgba(0,0,0,0.3)', fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>{result}</div>
                <div style={{ fontSize: '48px', fontWeight: 800, color: '#1d1d1f', overflowX: 'auto' }}>{input || '0'}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {buttons.map((btn) => (
                    <motion.button
                        whileTap={{ scale: 0.9 }} key={btn.label}
                        onClick={() => {
                            if (btn.type === 'eq') handleCalc();
                            else if (btn.type === 'clear') { setInput(''); setResult(''); }
                            else if (btn.type === 'delete') { setInput(prev => prev.slice(0, -1)); }
                            else addToken(btn.label);
                        }}
                        style={{ ...BUTTON_STYLE, background: btn.bg, color: btn.color || '#1d1d1f', gridColumn: btn.span ? `span ${btn.span}` : 'span 1', height: '76px' }}
                    >
                        {btn.label}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};
