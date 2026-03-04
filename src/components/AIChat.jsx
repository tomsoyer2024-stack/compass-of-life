import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { theme } from '../theme';
import { sendMessageToGemini } from '../services/gemini';

export default function AIChat({ context, onClose, onApplySteps, character = 'energetic', initialMessage }) {
    const { t } = useTranslation();

    const getInitialMessage = () => {
        if (initialMessage) return initialMessage;
        return t(`ai.greeting_${character}`, { context });
    };

    const [messages, setMessages] = useState([
        { role: 'ai', text: getInitialMessage() }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simulate professional AI response logic with localization
        (async () => {
            try {
                const responseText = await sendMessageToGemini(input);
                setMessages(prev => [...prev, { role: 'ai', text: responseText, source: 'Strategic Partner AI' }]);
                setIsTyping(false);
            } catch (e) {
                console.error("Chat Error", e);
                setMessages(prev => [...prev, { role: 'ai', text: t('ai.default_reply') }]);
                setIsTyping(false);
            }
        })();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px', gap: '16px' }}>
            <div
                className="aero-card"
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '1.5rem 1.25rem',
                    background: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '1.75rem',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    scrollBehavior: 'smooth'
                }}
                ref={scrollRef}
            >
                {messages.map((m, i) => (
                    <div key={i} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
                        marginBottom: '20px'
                    }}>
                        <div style={{
                            maxWidth: '85%',
                            padding: '0.875rem 1.25rem',
                            borderRadius: '1.375rem',
                            background: m.role === 'user' ? '#1d1d1f' : 'rgba(255, 255, 255, 0.6)',
                            backdropFilter: m.role === 'ai' ? 'blur(10px)' : 'none',
                            color: m.role === 'user' ? 'white' : '#1d1d1f',
                            boxShadow: m.role === 'ai' ? '0 4px 15px rgba(0,0,0,0.05)' : '0 4px 15px rgba(0,0,0,0.1)',
                            fontSize: '0.9375rem',
                            lineHeight: '1.6',
                            borderBottomRightRadius: m.role === 'user' ? '4px' : '22px',
                            borderBottomLeftRadius: m.role === 'ai' ? '4px' : '22px',
                            border: m.role === 'ai' ? '1px solid rgba(255, 255, 255, 0.8)' : 'none',
                        }}>
                            {m.text}

                            {m.source && (
                                <div style={{
                                    fontSize: '9px', fontWeight: 900, marginTop: '8px',
                                    opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em',
                                    display: 'flex', alignItems: 'center', gap: '4px'
                                }}>
                                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: m.source.includes('Local') ? '#34C759' : '#007AFF' }} />
                                    {m.source}
                                </div>
                            )}

                            {m.steps && (
                                <div style={{
                                    marginTop: '16px',
                                    borderTop: '1px solid rgba(0,0,0,0.05)',
                                    paddingTop: '12px'
                                }}>
                                    {m.steps.map((step, idx) => (
                                        <div key={idx} style={{
                                            marginBottom: '8px',
                                            fontSize: '13px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            color: '#444'
                                        }}>
                                            <div style={{
                                                width: '6px',
                                                height: '6px',
                                                borderRadius: '50%',
                                                background: '#4CAF50',
                                                boxShadow: '0 0 8px rgba(76, 175, 80, 0.5)'
                                            }}></div>
                                            {step}
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => onApplySteps && onApplySteps(m.steps)}
                                        style={{
                                            marginTop: '12px',
                                            width: '100%',
                                            padding: '12px',
                                            background: '#1d1d1f',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '14px',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={e => e.target.style.opacity = 0.9}
                                        onMouseLeave={e => e.target.style.opacity = 1}
                                    >
                                        {t('ai.apply_steps')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div style={{
                        color: 'rgba(0,0,0,0.4)',
                        fontSize: '12px',
                        marginLeft: '12px',
                        fontStyle: 'italic',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span className="typing-dot">●</span>
                        {t('ai.typing')}
                    </div>
                )}
            </div>

            <div
                className="aero-card"
                style={{
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'center',
                    padding: '0.5rem 0.5rem 0.5rem 1rem',
                    background: 'rgba(255, 255, 255, 0.4)',
                    borderRadius: '1.875rem',
                    boxShadow: '0 0.625rem 1.875rem rgba(0,0,0,0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.6)'
                }}
            >
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder={t('ai.input_placeholder')}
                    style={{
                        flex: 1,
                        border: 'none',
                        outline: 'none',
                        fontSize: '15px',
                        background: 'transparent',
                        color: '#1d1d1f',
                        padding: '8px 0'
                    }}
                />
                <button
                    onClick={handleSend}
                    style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: '#1d1d1f',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
            </div>
            <style>{`
                .typing-dot {
                    animation: blink 1.4s infinite both;
                }
                @keyframes blink {
                    0% { opacity: .2; }
                    20% { opacity: 1; }
                    100% { opacity: .2; }
                }
            `}</style>
        </div>
    );
}
