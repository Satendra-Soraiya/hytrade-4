import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, Title);

const DoughnutChart = ({ data, options = {} }) => {
  // Default options if none provided
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Watchlist Distribution',
        font: {
          size: 14
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${percentage}% (${value.toFixed(2)})`;
          }
        }
      }
    },
    cutout: '70%',
    ...options
  };

  return (
    <div style={{ width: '100%', height: '300px', position: 'relative' }}>
      <Doughnut data={data} options={defaultOptions} />
    </div>
  );
};

export default DoughnutChart;
