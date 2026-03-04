import React from 'react';

// Design Item 33 & 34: Badges
export const Badge = ({ content, type = 'notification', show = true, style }) => {
    if (!show || !content) return null;

    const baseStyle = {
        padding: '0.125rem 0.5rem',
        borderRadius: '0.75rem',
        fontSize: '0.7rem',
        fontWeight: '700',
        color: '#fff',
        display: 'inline-flex',
        alignItems: 'center',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        ...style
    };

    const typeStyles = {
        notification: { background: '#FF3B30' },
        success: { background: '#34C759' },
        warning: { background: '#FF9500' },
        info: { background: '#007AFF' },
        level: {
            background: 'linear-gradient(45deg, #FFD700, #FDB931)',
            color: '#5a4a00',
            border: '1px solid #fff'
        }
    };

    return (
        <span style={{ ...baseStyle, ...typeStyles[type] }}>
            {content}
        </span>
    );
};
