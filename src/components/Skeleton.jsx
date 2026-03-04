import React from 'react';

const Skeleton = ({ width = '100%', height = '20px', borderRadius = '4px', style }) => {
    return (
        <div style={{
            width,
            height,
            borderRadius,
            background: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite linear',
            ...style
        }} />
    );
};

export default Skeleton;

// Add to index.css if not present:
// @keyframes shimmer {
//   0% { background-position: 200% 0; }
//   100% { background-position: -200% 0; }
// }
