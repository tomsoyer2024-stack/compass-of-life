import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { format, subDays, startOfWeek, startOfMonth, startOfYear, isAfter } from 'date-fns';
import { theme } from '../theme';
import Modal from './Modal';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function HistoryModal({ isOpen, onClose, title, goal }) {
    const { t } = useTranslation();
    const [period, setPeriod] = useState('week'); // week, month, year, custom
    const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const chartData = useMemo(() => {
        if (!goal) return null;

        const start = period === 'custom' ? new Date(startDate) : null;
        const end = period === 'custom' ? new Date(endDate) : new Date();

        let labels = [];
        const now = new Date();

        if (period === 'week') {
            for (let i = 6; i >= 0; i--) {
                labels.push(format(subDays(now, i), 'EEE'));
            }
        } else if (period === 'month') {
            for (let i = 29; i >= 0; i -= 2) { // More detailed for month
                labels.push(format(subDays(now, i), 'd MMM'));
            }
        } else if (period === 'year') {
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        } else if (period === 'custom') {
            // Simplified custom labels
            labels = [format(start, 'd MMM'), '...', format(end, 'd MMM')];
        }

        const dataMap = {};
        goal.steps.forEach(s => {
            if (s.completed && s.completedAt) {
                const date = new Date(s.completedAt);

                // Filter by period
                let inRange = false;
                if (period === 'week') inRange = isAfter(date, subDays(now, 7));
                else if (period === 'month') inRange = isAfter(date, subDays(now, 30));
                else if (period === 'year') inRange = isAfter(date, startOfYear(now));
                else inRange = date >= start && date <= end;

                if (inRange) {
                    let dateKey;
                    if (period === 'year') dateKey = format(date, 'MMM');
                    else if (period === 'month') dateKey = format(date, 'd MMM');
                    else if (period === 'week') dateKey = format(date, 'EEE');
                    else dateKey = format(date, 'd MMM');

                    dataMap[dateKey] = (dataMap[dateKey] || 0) + 1;
                }
            }
        });

        const displayData = labels.map(l => dataMap[l] || 0);

        return {
            labels,
            datasets: [
                {
                    label: t('stats.xp'),
                    data: displayData,
                    fill: true,
                    backgroundColor: 'rgba(29, 29, 31, 0.05)',
                    borderColor: '#1d1d1f',
                    borderWidth: 3,
                    tension: 0.4,
                    pointRadius: period === 'year' ? 2 : 5,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#1d1d1f',
                    pointBorderWidth: 2,
                    pointHoverRadius: 7,
                    pointHoverBackgroundColor: '#1d1d1f',
                    pointHoverBorderColor: '#fff',
                    pointHoverBorderWidth: 2,
                },
            ],
        };
    }, [goal, period, startDate, endDate, t]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(255,255,255,0.9)',
                titleColor: '#000',
                bodyColor: '#333',
                padding: 12,
                cornerRadius: 12,
                displayColors: false,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                borderWidth: 1,
                borderColor: '#eee'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { display: true, color: '#f5f5f5', drawBorder: false },
                ticks: { stepSize: 1, color: '#999' }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#999' }
            }
        },
    };

    const historyList = useMemo(() => {
        const list = [];
        if (goal) {
            goal.steps.forEach(s => {
                if (s.completed && s.completedAt) {
                    list.push({
                        goalTitle: goal.title,
                        stepTitle: s.title,
                        date: s.completedAt,
                        impact: '+10 XP'
                    });
                }
            });
        }
        return list.sort((a, b) => b.date - a.date);
    }, [goal]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div style={{ width: '100%', animation: 'fadeIn 0.4s ease-out' }}>
                {/* Period Selector */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginBottom: '32px' }}>
                    {['week', 'month', 'year', 'custom'].map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '14px',
                                border: period === p ? '1px solid rgba(255,255,255,0.5)' : '1px solid transparent',
                                background: period === p ? '#1d1d1f' : 'rgba(0,0,0,0.05)',
                                color: period === p ? '#fff' : '#1d1d1f',
                                fontWeight: 700,
                                fontSize: '13px',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                boxShadow: period === p ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                            }}
                        >
                            {t(`common.period_${p}`) || p}
                        </button>
                    ))}
                </div>

                {period === 'custom' && (
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', justifyContent: 'center', animation: 'fadeIn 0.3s ease' }}>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ padding: '10px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.5)', fontSize: '13px' }} />
                        <span style={{ alignSelf: 'center', opacity: 0.5 }}>→</span>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ padding: '10px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.5)', fontSize: '13px' }} />
                    </div>
                )}

                {/* Chart Area */}
                <div style={{
                    height: '260px',
                    width: '100%',
                    marginBottom: '40px',
                    padding: '20px',
                    background: 'rgba(255,255,255,0.3)',
                    borderRadius: '28px',
                    border: '1px solid rgba(255,255,255,0.5)',
                    boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)'
                }}>
                    {chartData && historyList.length > 0 ? <Line data={chartData} options={options} /> : (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📈</div>
                            <div style={{ fontWeight: 600, fontSize: '14px' }}>{t('common.no_data')}</div>
                        </div>
                    )}
                </div>

                {/* History Table-like List */}
                <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
                    <h4 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 800, color: '#1d1d1f', letterSpacing: '-0.4px' }}>{t('common.recent_activity')}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {historyList.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#999', padding: '40px', background: 'rgba(0,0,0,0.02)', borderRadius: '20px' }}>{t('common.no_steps')}</div>
                        ) : (
                            historyList.map((item, idx) => (
                                <div key={idx} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '18px 20px',
                                    background: 'rgba(255,255,255,0.5)',
                                    borderRadius: '22px',
                                    border: '1px solid rgba(255,255,255,0.8)',
                                    transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                                }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#1d1d1f' }}>{item.stepTitle}</div>
                                        <div style={{ fontSize: '11px', color: 'rgba(0,0,0,0.4)', marginTop: '4px', fontWeight: 600 }}>{format(item.date, 'EEE, d MMM yyyy')}</div>
                                    </div>
                                    <div style={{
                                        padding: '6px 12px',
                                        background: 'rgba(76, 175, 80, 0.1)',
                                        color: '#2E7D32',
                                        borderRadius: '10px',
                                        fontSize: '11px',
                                        fontWeight: 800,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        {item.impact}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}

