import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider, Paper } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { formatCurrency } from '../utils/formatters';
import { marketAPI } from '../services/api';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const LeftSidebar = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [marketData, setMarketData] = useState({
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#4e73df',
        '#1cc88a',
        '#36b9cc',
        '#f6c23e',
        '#e74a3b',
        '#6f42c1',
        '#fd7e14'
      ],
      borderWidth: 1,
    }],
  });

  // Mock data - replace with actual API call
  const fetchWatchlist = async () => {
    try {
      // Replace with actual API call
      // const response = await marketAPI.getWatchlist();
      // setWatchlist(response.data);
      
      // Mock data for now
      const mockWatchlist = [
        { symbol: 'AAPL', name: 'Apple Inc.', price: 185.92, change: 1.25, changePercent: 0.68 },
        { symbol: 'MSFT', name: 'Microsoft', price: 420.72, change: -2.35, changePercent: -0.56 },
        { symbol: 'GOOGL', name: 'Alphabet', price: 178.45, change: 3.12, changePercent: 1.78 },
        { symbol: 'AMZN', name: 'Amazon', price: 185.25, change: -1.05, changePercent: -0.56 },
        { symbol: 'META', name: 'Meta', price: 485.10, change: 8.25, changePercent: 1.73 },
        { symbol: 'TSLA', name: 'Tesla', price: 245.50, change: -5.75, changePercent: -2.29 },
        { symbol: 'NVDA', name: 'NVIDIA', price: 950.02, change: 25.35, changePercent: 2.74 },
      ];
      
      setWatchlist(mockWatchlist);
      
      // Update chart data
      setMarketData({
        labels: mockWatchlist.map(item => item.symbol),
        datasets: [{
          data: mockWatchlist.map(item => Math.abs(item.price * 100)),
          backgroundColor: [
            '#4e73df',
            '#1cc88a',
            '#36b9cc',
            '#f6c23e',
            '#e74a3b',
            '#6f42c1',
            '#fd7e14'
          ],
          borderWidth: 1,
        }],
      });
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${percentage}%`;
          }
        }
      }
    },
    cutout: '70%',
  };

  return (
    <Box sx={{
      width: { xs: '100%', md: 300 },
      height: { xs: 'auto', md: 'calc(100vh - 64px)' },
      position: { xs: 'static', md: 'fixed' },
      left: 0,
      top: 64,
      bottom: 0,
      zIndex: 1100,
      overflowY: 'auto',
      bgcolor: 'background.paper',
      borderRight: '1px solid',
      borderColor: 'divider',
      transition: 'transform 0.3s ease-in-out',
      transform: { xs: 'translateX(-100%)', md: 'none' },
      boxShadow: 'none',
      p: 2,
      '&.MuiDrawer-paper': {
        position: { xs: 'fixed', md: 'static' },
        width: { xs: '100%', md: 300 },
      },
      '&::-webkit-scrollbar': {
        width: '6px',
      },
      '&::-webkit-scrollbar-track': {
        background: '#f1f1f1',
      },
      '&::-webkit-scrollbar-thumb': {
        background: '#888',
        borderRadius: '3px',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        background: '#555',
      },
    }}>
      {/* Watchlist Section */}
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Watchlist</Typography>
        <List dense disablePadding>
          {watchlist.map((item, index) => (
            <React.Fragment key={item.symbol}>
              <ListItem sx={{ px: 1, py: 0.5 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle2" component="span" sx={{ fontWeight: 600 }}>
                          {item.symbol}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {item.name}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {formatCurrency(item.price)}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: item.change >= 0 ? 'success.main' : 'error.main',
                            fontWeight: 500
                          }}
                        >
                          {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} ({item.changePercent.toFixed(2)}%)
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
              {index < watchlist.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Box>

      {/* Market Share Chart */}
      <Box sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Market Share</Typography>
        <Box sx={{ height: 250, position: 'relative' }}>
          <Doughnut data={marketData} options={chartOptions} />
        </Box>
      </Box>
    </Box>
  );
};

export default LeftSidebar;
