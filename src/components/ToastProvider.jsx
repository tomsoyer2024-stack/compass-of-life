import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext({});

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'default', duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div style={{
                position: 'fixed',
                bottom: '100px', // Above nav bar
                left: 0,
                right: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                pointerEvents: 'none',
                zIndex: 2000
            }}>
                {toasts.map(toast => (
                    <div key={toast.id} className="glass-panel" style={{
                        padding: '12px 24px',
                        borderRadius: '30px',
                        background: 'rgba(0, 0, 0, 0.8)',
                        color: 'white',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        animation: 'springUp 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                        fontSize: '14px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        {toast.type === 'success' && <span style={{ color: '#4CAF50' }}>✓</span>}
                        {toast.type === 'error' && <span style={{ color: '#FF5252' }}>!</span>}
                        {toast.message}
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes springUp {
                    from { transform: translateY(20px) scale(0.9); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
            `}</style>
        </ToastContext.Provider>
    );
};
