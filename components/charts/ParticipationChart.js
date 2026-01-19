'use client';

import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ParticipationChart = ({ voted = 0, total = 0, title = 'Voter Turnout' }) => {
  const notVoted = total - voted;
  const percentage = total > 0 ? ((voted / total) * 100).toFixed(1) : 0;

  const data = {
    labels: ['Voted', 'Not Voted'],
    datasets: [
      {
        data: [voted, notVoted],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(229, 231, 235, 0.8)',
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(229, 231, 235)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <div className="relative h-64">
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">
          {percentage}%
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {title}
        </span>
      </div>
    </div>
  );
};

export default ParticipationChart;
