import React from 'react';
import { theme } from '../theme';

const CircularProgress = ({ percentage, size, strokeWidth, color, label }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;
    const strokeColor = color || theme.colors.ui.primary;

    return (
        <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle stroke="#eee" strokeWidth={strokeWidth} fill="transparent" r={radius} cx={size / 2} cy={size / 2} />
                <circle
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontSize: size / 5, fontWeight: 700, color: theme.colors.text.primary }}>{percentage}%</div>
                {label && <div style={{ fontSize: size / 10, color: theme.colors.text.secondary }}>{label}</div>}
            </div>
        </div>
    );
};

export default CircularProgress;
