import React from 'react';
import { theme } from '../theme';

export const dashboardConfig = [
    {
        id: 'habits',
        name: 'nav.habits',
        icon: '🏃',
        position: {
            desktop: { x: '5%', y: '10%', width: '130px', height: '130px', shape: '42% 58% 70% 30% / 45% 45% 55% 55%' },
            mobile: { x: '5%', y: '8%', width: '120px', height: '120px', shape: '42% 58% 70% 30% / 45% 45% 55% 55%' }
        },
        renderContent: (progress, t) => (
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>🏃</div>
                <div style={{ fontWeight: 800, fontSize: '12px', color: theme.colors.text.primary }}>{t('nav.habits')}</div>
                <div style={{ fontSize: '14px', color: theme.colors.text.muted, fontWeight: 700 }}>{progress}%</div>
            </div>
        )
    },
    {
        id: 'tasks',
        name: 'nav.workflow',
        icon: '🎯',
        position: {
            desktop: { x: '60%', y: '12%', width: '140px', height: '140px', shape: '30% 70% 70% 30% / 30% 30% 70% 70%' },
            mobile: { x: '55%', y: '10%', width: '130px', height: '130px', shape: '30% 70% 70% 30% / 30% 30% 70% 70%' }
        },
        renderContent: (progress, t) => (
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '4px' }}>🎯</div>
                <div style={{ fontWeight: 800, fontSize: '12px', color: theme.colors.text.primary }}>{t('nav.workflow')}</div>
                <div style={{ fontSize: '14px', color: theme.colors.text.muted, fontWeight: 700 }}>{progress}%</div>
            </div>
        )
    },
    {
        id: 'finance',
        name: 'nav.finance',
        icon: '💰',
        position: {
            desktop: { x: '25%', y: '35%', width: '180px', height: '180px', shape: '50% 50% 50% 50% / 30% 30% 70% 70%', zIndex: 10 },
            mobile: { x: '15%', y: '32%', width: '170px', height: '170px', shape: '50% 50% 50% 50% / 30% 30% 70% 70%', zIndex: 10 }
        },
        renderContent: (progress, t) => (
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>💰</div>
                <div style={{ fontWeight: 900, fontSize: '15px', color: theme.colors.text.primary }}>{t('nav.finance')}</div>
                <div style={{ fontSize: '18px', fontWeight: 700, opacity: 0.6 }}>{progress}%</div>
            </div>
        )
    },
    {
        id: 'skills',
        name: 'nav.skills',
        icon: '🧠',
        position: {
            desktop: { x: '55%', y: '55%', width: '150px', height: '150px', shape: '70% 30% 30% 70% / 50% 50% 50% 50%' },
            mobile: { x: '52%', y: '52%', width: '140px', height: '140px', shape: '70% 30% 30% 70% / 50% 50% 50% 50%' }
        },
        renderContent: (progress, t) => (
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', marginBottom: '6px' }}>🧠</div>
                <div style={{ fontWeight: 800, fontSize: '12px', color: theme.colors.text.primary }}>{t('nav.skills')}</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: theme.colors.ui.primary }}>{progress}%</div>
            </div>
        )
    },
    {
        id: 'social',
        name: 'nav.social',
        icon: '👥',
        position: {
            desktop: { x: '10%', y: '75%', width: '130px', height: '130px', shape: '40% 60% 30% 70% / 60% 30% 70% 40%' },
            mobile: { x: '5%', y: '72%', width: '120px', height: '120px', shape: '40% 60% 30% 70% / 60% 30% 70% 40%' }
        },
        renderContent: (progress, t) => (
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '26px', marginBottom: '6px' }}>👥</div>
                <div style={{ fontWeight: 800, fontSize: '12px', color: theme.colors.text.primary }}>{t('nav.social')}</div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{progress}%</div>
            </div>
        )
    },
    {
        id: 'faith',
        name: 'nav.faith',
        icon: '🙏',
        position: {
            desktop: { x: '60%', y: '85%', width: '125px', height: '125px', shape: '50% 50% 70% 30% / 50% 50% 50% 50%' },
            mobile: { x: '58%', y: '82%', width: '115px', height: '115px', shape: '50% 50% 70% 30% / 50% 50% 50% 50%' }
        },
        renderContent: (progress, t) => (
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '26px', marginBottom: '6px' }}>🙏</div>
                <div style={{ fontWeight: 800, fontSize: '12px', color: theme.colors.text.primary }}>{t('nav.faith')}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#FF9500' }}>{progress}%</div>
            </div>
        )
    },
    {
        id: 'projects',
        name: 'nav.projects',
        icon: '🚀',
        position: {
            desktop: { x: '35%', y: '65%', width: '160px', height: '160px', shape: '40% 60% 60% 40% / 60% 40% 60% 40%', zIndex: 5 },
            mobile: { x: '35%', y: '62%', width: '150px', height: '150px', shape: '40% 60% 60% 40% / 60% 40% 60% 40%', zIndex: 5 }
        },
        renderContent: (progress, t) => (
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '6px' }}>🚀</div>
                <div style={{ fontWeight: 800, fontSize: '13px', color: theme.colors.text.primary }}>{t('nav.projects')}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#34C759' }}>{progress}%</div>
            </div>
        )
    }
];
