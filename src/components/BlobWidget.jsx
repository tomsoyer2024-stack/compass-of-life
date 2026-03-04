import React from 'react';
import { motion } from 'framer-motion';

/**
 * Optimized BlobWidget for maximum performance.
 * Focus on speed and responsiveness.
 */
const BlobWidget = React.memo(({
    children,
    onClick,
    className = '',
    style = {},
    shape = '28px'
}) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onClick}
            className={`blob-widget-simple ${className}`}
            style={{
                width: '100%',
                height: '100%',
                borderRadius: shape,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
                position: 'relative',
                background: 'rgba(255,255,255,0.8)',
                border: '1px solid rgba(255,255,255,0.4)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
                ...style
            }}
        >
            <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                {children}
            </div>
        </motion.div>
    );
});

export default BlobWidget;

