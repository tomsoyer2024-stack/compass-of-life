import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export function OrbitChart({ data, labels }) {
    const chartData = {
        labels: labels,
        datasets: [
            {
                data: data,
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#4CAF50', '#6366F1'
                ],
                hoverOffset: 10,
                borderWidth: 0,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true },
        },
        cutout: '70%',
    };

    return <div style={{ width: '200px', height: '200px' }}><Doughnut data={chartData} options={options} /></div>;
}

export default function ProgressChart({ data, labels, color }) {

    const chartData = {
        labels: labels,
        datasets: [
            {
                data: data,
                fill: true,
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 150);
                    gradient.addColorStop(0, `${color}44`);
                    gradient.addColorStop(1, `${color}00`);
                    return gradient;
                },
                borderColor: color,
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
        },
        scales: {
            y: { display: false, beginAtZero: true, max: Math.max(...data, 100) + 10 },
            x: { display: false },
        },
    };

    return <div style={{ width: '100%', height: '100%' }}><Line data={chartData} options={options} /></div>;
}

