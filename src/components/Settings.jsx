import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { haptic } from '../utils/haptics';
import AdminPanel from './AdminPanel';
import { backgrounds, applyTheme } from '../data/backgrounds';

export default function Settings({ settings, onUpdate }) {
    const { t, i18n } = useTranslation();

    const handleBgChange = (bgId) => {
        haptic.light();
        applyTheme(bgId);
        onUpdate({ ...settings, backgroundId: bgId });
    };

    const toggleSetting = (key) => {
        haptic.light();
        onUpdate({ ...settings, [key]: !settings[key] });
    };

    const handleLangChange = (code) => {
        haptic.light();
        i18n.changeLanguage(code);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Background Selection */}
            <section>
                <h3 style={{ fontSize: '11px', fontWeight: 900, color: 'rgba(0,0,0,0.35)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('settings.background') || 'Background'}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {Object.values(backgrounds).map(bg => (
                        <div
                            key={bg.id}
                            onClick={() => handleBgChange(bg.id)}
                            style={{
                                height: '44px', borderRadius: '12px',
                                background: settings.backgroundId === bg ? '#007AFF' : 'rgba(0,0,0,0.05)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '11px', fontWeight: 800, color: settings.backgroundId === bg ? '#white' : '#1d1d1f',
                                cursor: 'pointer', border: settings.backgroundId === bg ? 'none' : '1px solid rgba(0,0,0,0.05)'
                            }}
                        >
                            {bg.name}
                        </div>
                    ))}
                </div>
            </section>

            {/* Language Section */}
            <section>
                <h3 style={{ fontSize: '11px', fontWeight: 900, color: 'rgba(0,0,0,0.35)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('settings.language') || 'Language'}</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {[
                        { code: 'ru', label: 'RU', flag: '🇷🇺' },
                        { code: 'en', label: 'EN', flag: '🇺🇸' }
                    ].map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => handleLangChange(lang.code)}
                            style={{
                                flex: 1, padding: '12px', borderRadius: '14px',
                                border: 'none',
                                background: i18n.language === lang.code ? '#007AFF' : 'rgba(0,0,0,0.05)',
                                color: i18n.language === lang.code ? '#fff' : '#1d1d1f',
                                cursor: 'pointer', fontSize: '13px', fontWeight: 800
                            }}
                        >
                            {lang.flag} {lang.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* Preferences Section */}

            {/* Personal AI Key Section (BYOK) */}
            <section>
                <h3 style={{ fontSize: '11px', fontWeight: 900, color: 'rgba(0,0,0,0.35)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('settings.ai_key') || 'Personal AI Key'}</h3>
                <div style={{ background: 'white', padding: '20px', borderRadius: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                    <p style={{ fontSize: '13px', color: '#8e8e93', marginBottom: '16px', lineHeight: '1.4' }}>
                        {t('settings.ai_key_desc') || 'To unlock unlimited AI tasks, please enter your free Gemini API Key.'}
                        <br />
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: '#007AFF', fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginTop: '8px' }}>
                            {t('settings.get_key') || 'Get Free Key →'}
                        </a>
                    </p>
                    <div style={{ position: 'relative', display: 'flex', gap: '8px' }}>
                        <input
                            type="password"
                            placeholder="AIza..."
                            id="api-key-input"
                            defaultValue={localStorage.getItem('user_gemini_api_key') || ''}
                            onChange={(e) => {
                                // Just update value, save on button click for feedback
                            }}
                            style={{
                                flex: 1, padding: '16px', borderRadius: '16px',
                                background: '#f5f5f7', border: '1px solid transparent',
                                fontSize: '14px', fontFamily: 'monospace', color: '#1d1d1f',
                                outline: 'none', transition: 'all 0.2s'
                            }}
                        />
                        <button
                            onClick={() => {
                                const val = document.getElementById('api-key-input').value;
                                localStorage.setItem('user_gemini_api_key', val);
                                alert('Key Saved! AI features unlocked.');
                            }}
                            style={{
                                padding: '0 20px', borderRadius: '16px',
                                background: '#34C759', color: 'white', border: 'none',
                                fontWeight: 700, cursor: 'pointer'
                            }}
                        >
                            SAVE
                        </button>
                    </div>
                </div>
            </section>

            {/* Admin Section - Only if user is admin */}
            {settings.isAdmin && <AdminPanel />}

            {/* Reset Area */}
            <section style={{ marginTop: '20px' }}>
                <button
                    onClick={() => { if (confirm('Reset all data?')) { localStorage.clear(); window.location.reload(); } }}
                    style={{ width: '100%', padding: '14px', borderRadius: '14px', background: 'rgba(255, 69, 58, 0.1)', color: '#FF453A', border: 'none', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}
                >
                    RESET ALL DATA
                </button>
            </section>
        </div>
    );
}

const Switch = ({ checked, onChange }) => (
    <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer' }}>
        <input type="checkbox" checked={checked} onChange={onChange} style={{ opacity: 0, width: 0, height: 0 }} />
        <span style={{ position: 'absolute', inset: 0, backgroundColor: checked ? '#34C759' : 'rgba(0,0,0,0.1)', transition: '0.4s', borderRadius: '24px' }}></span>
        <motion.span animate={{ x: checked ? 22 : 4 }} style={{ position: 'absolute', top: '4px', height: '16px', width: '16px', backgroundColor: 'white', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
    </label>
);

