import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getDailyQuote } from '../data/quotes';
import { theme } from '../theme';

export default function QuoteWidget() {
    const { t } = useTranslation();
    const [quote, setQuote] = useState(() => getDailyQuote());

    useEffect(() => {
        const interval = setInterval(() => {
            setQuote(getDailyQuote());
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="aero-card" style={{
            margin: '0 0 16px 0', // No horizontal margins
            width: '100%', // Full width
            maxWidth: '100%',
            alignSelf: 'stretch', // Stretch to fill container
            boxSizing: 'border-box',
            // Dynamic padding: safe area + minimal 12px buffer (0.75rem)
            paddingTop: 'calc(env(safe-area-inset-top, 24px) + 0.75rem)',
            paddingBottom: '1.25rem',
            paddingLeft: '32px',
            paddingRight: '32px',
            height: 'auto',
            minHeight: '140px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center', // Center content horizontally
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            borderTop: 'none', // Remove top border for "hanging panel" look
            borderLeft: 'none', // Optional: cleaner look if full width
            borderRight: 'none', // Optional: cleaner look if full width
            boxShadow: '0 8px 32px rgba(0,0,0,0.03)',
            borderRadius: '0 0 2rem 2rem', // Relative border radius (approx 32px)
            overflow: 'hidden'
        }}>
            {/* Next Button */}
            <div style={{ position: 'absolute', bottom: '12px', right: '16px', zIndex: 10 }}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setQuote(getDailyQuote(true)); // Pass true to force random
                    }}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        fontSize: '16px',
                        cursor: 'pointer',
                        opacity: 0.6,
                        padding: '4px',
                        transition: 'opacity 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
                    title={t ? t('dashboard.next_quote') || "Next Quote" : "Next"}
                >
                    ↻
                </button>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={quote.text}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    style={{ paddingBottom: '16px' }}
                >
                    <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.5, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {t ? (t('dashboard.quote_title') || "QUOTE OF THE DAY") : "QUOTE OF THE DAY"}
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 700, lineHeight: '1.4', color: '#1d1d1f' }}>
                        «{quote.text}»
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 500, opacity: 0.6, marginTop: '4px' }}>
                        — {quote.author}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
