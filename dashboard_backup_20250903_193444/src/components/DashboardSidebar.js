import React from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './DashboardSidebar.css';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const DashboardSidebar = () => {
  // Sample watchlist data
  const watchlist = [
    { 
      symbol: 'RELIANCE', 
      name: 'Reliance Industries', 
      price: 2456.50, 
      change: 12.50,
      changePercent: 0.51,
      volume: '5.2M'
    },
    { 
      symbol: 'TCS', 
      name: 'Tata Consultancy', 
      price: 3250.80, 
      change: 25.30,
      changePercent: 0.78,
      volume: '3.8M'
    },
    { 
      symbol: 'HDFCBANK', 
      name: 'HDFC Bank', 
      price: 1650.25, 
      change: -5.75,
      changePercent: -0.35,
      volume: '4.1M'
    },
    { 
      symbol: 'INFY', 
      name: 'Infosys', 
      price: 1450.60, 
      change: -12.40,
      changePercent: -0.85,
      volume: '2.9M'
    },
    { 
      symbol: 'HINDUNILVR', 
      name: 'Hindustan Unilever', 
      price: 2650.90, 
      change: 5.20,
      changePercent: 0.20,
      volume: '1.2M'
    }
  ];

  // Prepare chart data
  const chartData = {
    labels: watchlist.map(item => item.symbol),
    datasets: [
      {
        data: watchlist.map((_, index) => (5 - index) * 5), // Sample market share data
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 10,
          padding: 10,
          font: {
            size: 10
          }
        }
      },
    },
    cutout: '70%',
  };

  return (
    <Box className="dashboard-sidebar">
      <Paper className="watchlist-container" elevation={0}>
        <Box className="watchlist-header">
          <Typography variant="subtitle2" fontWeight={600} color="text.primary">
            Watchlist
          </Typography>
        </Box>
        
        <Box className="watchlist-items">
          {watchlist.map((item, index) => (
            <Box key={index} className="watchlist-item">
              <Box className="stock-info">
                <Typography variant="body2" fontWeight={600} color="text.primary">
                  {item.symbol}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {item.name}
                </Typography>
              </Box>
              <Box className="stock-price" textAlign="right">
                <Typography variant="body2" fontWeight={500} color="text.primary">
                  ₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Typography>
                <Typography 
                  variant="caption" 
                  color={item.change >= 0 ? 'success.main' : 'error.main'}
                  fontWeight={500}
                >
                  {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} ({item.changePercent >= 0 ? '+' : ''}{item.changePercent}%)
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>

      <Paper className="chart-container" elevation={0}>
        <Box className="chart-header">
          <Typography variant="subtitle2" fontWeight={600} color="text.primary">
            Market Share
          </Typography>
        </Box>
        <Box className="doughnut-chart">
          <Doughnut data={chartData} options={chartOptions} />
        </Box>
      </Paper>
    </Box>
  );
};

export default DashboardSidebar;
