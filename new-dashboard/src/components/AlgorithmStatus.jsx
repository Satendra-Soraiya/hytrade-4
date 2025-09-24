import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Grid,
  IconButton,
  Tooltip,
  Alert,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Speed as SpeedIcon,
  Assessment as AssessmentIcon,
  Code as CodeIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

// Mock algorithm data - replace with real API calls
const mockAlgorithms = [
  {
    id: 1,
    name: 'Moving Average Crossover',
    type: 'Technical Analysis',
    status: 'active',
    performance: {
      winRate: 68.5,
      totalTrades: 142,
      profitLoss: 2847.50,
      profitLossPercent: 12.3,
      sharpeRatio: 1.45,
      maxDrawdown: -8.2
    },
    settings: {
      shortPeriod: 10,
      longPeriod: 30,
      riskPerTrade: 2.0,
      stopLoss: 1.5
    },
    lastTrade: {
      symbol: 'AAPL',
      action: 'BUY',
      price: 175.50,
      quantity: 50,
      timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      profitLoss: 125.50
    },
    isRunning: true,
    tradesToday: 8,
    capitalAllocated: 25000
  },
  {
    id: 2,
    name: 'RSI Mean Reversion',
    type: 'Oscillator',
    status: 'paused',
    performance: {
      winRate: 72.1,
      totalTrades: 89,
      profitLoss: 1923.75,
      profitLossPercent: 8.7,
      sharpeRatio: 1.28,
      maxDrawdown: -5.8
    },
    settings: {
      rsiPeriod: 14,
      oversoldLevel: 30,
      overboughtLevel: 70,
      riskPerTrade: 1.5
    },
    lastTrade: {
      symbol: 'TSLA',
      action: 'SELL',
      price: 245.80,
      quantity: 30,
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      profitLoss: -45.20
    },
    isRunning: false,
    tradesToday: 3,
    capitalAllocated: 15000
  },
  {
    id: 3,
    name: 'Bollinger Bands Strategy',
    type: 'Volatility',
    status: 'active',
    performance: {
      winRate: 65.2,
      totalTrades: 156,
      profitLoss: 3241.80,
      profitLossPercent: 15.8,
      sharpeRatio: 1.62,
      maxDrawdown: -6.4
    },
    settings: {
      period: 20,
      standardDeviations: 2,
      riskPerTrade: 2.5,
      stopLoss: 2.0
    },
    lastTrade: {
      symbol: 'MSFT',
      action: 'BUY',
      price: 385.20,
      quantity: 25,
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      profitLoss: 78.30
    },
    isRunning: true,
    tradesToday: 12,
    capitalAllocated: 35000
  }
];

const AlgorithmStatus = () => {
  const [algorithms, setAlgorithms] = useState(mockAlgorithms);
  const [expandedAlgorithm, setExpandedAlgorithm] = useState(null);
  const [showCode, setShowCode] = useState({});

  // Toggle algorithm running state
  const toggleAlgorithm = (algorithmId) => {
    setAlgorithms(prev => prev.map(algo => 
      algo.id === algorithmId 
        ? { ...algo, isRunning: !algo.isRunning, status: !algo.isRunning ? 'active' : 'paused' }
        : algo
    ));
  };

  // Toggle code visibility
  const toggleCodeVisibility = (algorithmId) => {
    setShowCode(prev => ({
      ...prev,
      [algorithmId]: !prev[algorithmId]
    }));
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'stopped': return 'error';
      default: return 'default';
    }
  };

  // Get performance color
  const getPerformanceColor = (value) => {
    return value >= 0 ? 'success.main' : 'error.main';
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
            Trading Algorithms
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor and control your automated trading strategies
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Algorithm Settings">
            <IconButton>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Algorithm Cards */}
      <Grid container spacing={3}>
        {algorithms.map((algorithm) => (
          <Grid item xs={12} md={6} lg={4} key={algorithm.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Algorithm Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {algorithm.name}
                    </Typography>
                    <Chip 
                      label={algorithm.type} 
                      size="small" 
                      variant="outlined"
                      color="primary"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title={algorithm.isRunning ? 'Pause Algorithm' : 'Start Algorithm'}>
                      <IconButton 
                        size="small"
                        onClick={() => toggleAlgorithm(algorithm.id)}
                        color={algorithm.isRunning ? 'warning' : 'success'}
                      >
                        {algorithm.isRunning ? <PauseIcon /> : <PlayIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Algorithm Code">
                      <IconButton 
                        size="small"
                        onClick={() => toggleCodeVisibility(algorithm.id)}
                      >
                        {showCode[algorithm.id] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Status and Performance */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip 
                      label={algorithm.status.toUpperCase()} 
                      size="small"
                      color={getStatusColor(algorithm.status)}
                      variant="filled"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Performance
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        color: getPerformanceColor(algorithm.performance.profitLoss)
                      }}
                    >
                      {formatCurrency(algorithm.performance.profitLoss)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Win Rate
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {algorithm.performance.winRate}%
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Trades Today
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {algorithm.tradesToday}
                    </Typography>
                  </Box>
                </Box>

                {/* Last Trade */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Last Trade
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {algorithm.lastTrade.symbol} - {algorithm.lastTrade.action}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {algorithm.lastTrade.timestamp.toLocaleTimeString()}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600,
                          color: getPerformanceColor(algorithm.lastTrade.profitLoss)
                        }}
                      >
                        {formatCurrency(algorithm.lastTrade.profitLoss)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Capital Allocation */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Capital Allocated
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatCurrency(algorithm.capitalAllocated)}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(algorithm.capitalAllocated / 50000) * 100}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: algorithm.isRunning ? 'success.main' : 'warning.main',
                      },
                    }}
                  />
                </Box>

                {/* Algorithm Code Display */}
                <Collapse in={showCode[algorithm.id]}>
                  <Paper sx={{ p: 2, mt: 2, backgroundColor: 'grey.50' }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                      Algorithm Implementation:
                    </Typography>
                    <Box sx={{ 
                      fontFamily: 'monospace', 
                      fontSize: '0.75rem',
                      backgroundColor: 'grey.100',
                      p: 1,
                      borderRadius: 1,
                      overflow: 'auto',
                      maxHeight: 200
                    }}>
                      <pre>{`
// ${algorithm.name} Algorithm
function ${algorithm.name.replace(/\s+/g, '')}Algorithm(price, settings) {
  const { shortPeriod, longPeriod, riskPerTrade } = settings;
  
  // Calculate moving averages
  const shortMA = calculateMA(price, shortPeriod);
  const longMA = calculateMA(price, longPeriod);
  
  // Generate trading signals
  if (shortMA > longMA && !isLong) {
    return { action: 'BUY', confidence: 0.85 };
  } else if (shortMA < longMA && isLong) {
    return { action: 'SELL', confidence: 0.80 };
  }
  
  return { action: 'HOLD', confidence: 0.50 };
}

// Risk management
function calculatePositionSize(accountBalance, riskPerTrade, stopLoss) {
  return (accountBalance * riskPerTrade / 100) / stopLoss;
}

// Performance metrics
function calculateSharpeRatio(returns, riskFreeRate = 0.02) {
  const excessReturns = returns.map(r => r - riskFreeRate);
  const avgReturn = excessReturns.reduce((a, b) => a + b, 0) / excessReturns.length;
  const volatility = Math.sqrt(excessReturns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / excessReturns.length);
  return avgReturn / volatility;
}
                      `}</pre>
                    </Box>
                  </Paper>
                </Collapse>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Algorithm Performance Summary */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Algorithm Performance Summary
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                  {algorithms.filter(algo => algo.isRunning).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Algorithms
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {algorithms.reduce((sum, algo) => sum + algo.tradesToday, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Trades Today
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 600,
                    color: getPerformanceColor(
                      algorithms.reduce((sum, algo) => sum + algo.performance.profitLoss, 0)
                    )
                  }}
                >
                  {formatCurrency(
                    algorithms.reduce((sum, algo) => sum + algo.performance.profitLoss, 0)
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Algorithm P&L
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {(
                    algorithms.reduce((sum, algo) => sum + algo.performance.winRate, 0) / algorithms.length
                  ).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average Win Rate
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AlgorithmStatus;
