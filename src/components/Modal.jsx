import React from 'react';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
    const [offsetY, setOffsetY] = React.useState(0);
    const [isDragging, setIsDragging] = React.useState(false);

    if (!isOpen) return null;

    const handleTouchStart = (e) => {
        setIsDragging(true);
        // Store initial touch Y
    };

    const handleTouchMove = (e) => {
        // Simple drag logic placeholder - use useGesture for prod
        // For now, allow simple click-outside close as fallback for swipe
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            paddingBottom: 'env(safe-area-inset-bottom)'
        }} onClick={onClose}>
            <div
                className="aero-card"
                style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '40px 40px 0 0',
                    padding: '32px 24px',
                    width: '100%',
                    maxWidth: '480px',
                    boxShadow: '0 -20px 60px rgba(0,0,0,0.1)',
                    animation: 'slideUpAero 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                    transform: `translateY(${offsetY}px)`,
                    marginBottom: 0,
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                }} onClick={e => e.stopPropagation()}>
                {/* Drag Handle */}
                <div style={{
                    width: '40px',
                    height: '5px',
                    background: 'rgba(0,0,0,0.1)',
                    borderRadius: '3px',
                    margin: '0 auto 24px',
                    opacity: 0.5
                }} />

                {title && (
                    <div style={{
                        fontSize: '22px',
                        fontWeight: 800,
                        marginBottom: '24px',
                        color: '#1d1d1f',
                        textAlign: 'center',
                        letterSpacing: '-0.5px'
                    }}>
                        {title}
                    </div>
                )}
                <div style={{ marginBottom: '32px', maxHeight: '75vh', overflowY: 'auto' }}>
                    {children}
                </div>
                {footer && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        {footer}
                    </div>
                )}
            </div>
            <style>{`
        @keyframes slideUpAero {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
        </div>
    );
};

export default Modal;
