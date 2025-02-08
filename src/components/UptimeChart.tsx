import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

interface UptimeChartProps {
  uptime24h: number;
  uptime7d: number;
}

export function UptimeChart({ uptime24h, uptime7d }: UptimeChartProps) {
  const data = {
    labels: ['7 Days', '24 Hours'],
    datasets: [
      {
        fill: true,
        label: 'Uptime',
        data: [uptime7d, uptime24h],
        borderColor: 'rgb(37, 99, 235)',
        borderWidth: 3,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, context.chart.height);
          gradient.addColorStop(0, 'rgba(37, 99, 235, 0.25)');
          gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');
          return gradient;
        },
        tension: 0.4,
        pointBackgroundColor: 'rgb(37, 99, 235)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: 'rgb(37, 99, 235)',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawTicks: false,
        },
        ticks: {
          color: '#9CA3AF',
          padding: 10,
          callback: (value: number) => `${value}%`,
        },
        border: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9CA3AF',
          padding: 10,
        },
        border: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#F3F4F6',
        bodyColor: '#F3F4F6',
        padding: 12,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          title: () => 'Uptime Status',
          label: (context: any) => `${context.raw.toFixed(2)}% availability`,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  return (
    <div className="w-full h-72 p-4 transition-all duration-300">
      <Line data={data} options={options} />
    </div>
  );
}