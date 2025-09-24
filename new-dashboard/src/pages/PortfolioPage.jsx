import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  PieChart as PieChartIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Psychology as PsychologyIcon,
  Code as CodeIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon,
  CompareArrows as CompareIcon,
  ShowChart as ChartIcon,
  BugReport as BugReportIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';

// Mock data for development - will be replaced with real API calls
const mockPortfolioData = {
  totalValue: 125000,
  totalInvestment: 100000,
  totalPnL: 25000,
  totalPnLPercentage: 25.0,
  dayChange: 1250,
  dayChangePercentage: 1.01,
  timeline: [
    { date: '2024-01-01', value: 95000 },
    { date: '2024-02-01', value: 98000 },
    { date: '2024-03-01', value: 102000 },
    { date: '2024-04-01', value: 105000 },
    { date: '2024-05-01', value: 108000 },
    { date: '2024-06-01', value: 112000 },
    { date: '2024-07-01', value: 115000 },
    { date: '2024-08-01', value: 118000 },
    { date: '2024-09-01', value: 120000 },
    { date: '2024-10-01', value: 123000 },
    { date: '2024-11-01', value: 124500 },
    { date: '2024-12-01', value: 125000 }
  ],
  holdings: [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      quantity: 50,
      avgBuyPrice: 150.00,
      currentPrice: 175.50,
      marketValue: 8775,
      pnl: 1275,
      pnlPercentage: 17.0,
      allocation: 7.02,
      sector: 'Technology'
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      quantity: 25,
      avgBuyPrice: 120.00,
      currentPrice: 142.30,
      marketValue: 3557.5,
      pnl: 557.5,
      pnlPercentage: 18.6,
      allocation: 2.85,
      sector: 'Technology'
    },
    {
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      quantity: 30,
      avgBuyPrice: 200.00,
      currentPrice: 245.80,
      marketValue: 7374,
      pnl: 1374,
      pnlPercentage: 22.9,
      allocation: 5.90,
      sector: 'Automotive'
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      quantity: 40,
      avgBuyPrice: 300.00,
      currentPrice: 385.20,
      marketValue: 15408,
      pnl: 3408,
      pnlPercentage: 28.4,
      allocation: 12.33,
      sector: 'Technology'
    },
    {
      symbol: 'AMZN',
      name: 'Amazon.com Inc.',
      quantity: 20,
      avgBuyPrice: 3200.00,
      currentPrice: 3450.75,
      marketValue: 69015,
      pnl: 5015,
      pnlPercentage: 7.8,
      allocation: 55.21,
      sector: 'E-commerce'
    }
  ],
  sectorAllocation: [
    { name: 'Technology', value: 67.41, color: '#8884d8' },
    { name: 'E-commerce', value: 55.21, color: '#82ca9d' },
    { name: 'Automotive', value: 5.90, color: '#ffc658' },
    { name: 'Healthcare', value: 3.25, color: '#ff7300' },
    { name: 'Finance', value: 2.15, color: '#00ff00' },
    { name: 'Others', value: 1.08, color: '#0088fe' }
  ]
};

const PortfolioPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, token } = useAuth();
  const [portfolioData, setPortfolioData] = useState(mockPortfolioData);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Algorithm performance data
  const algorithmTrades = [
    {
      id: 1,
      algorithm: 'Moving Average Crossover',
      symbol: 'AAPL',
      action: 'BUY',
      quantity: 50,
      entryPrice: 150.25,
      exitPrice: 175.50,
      entryDate: '2024-01-15',
      exitDate: '2024-01-20',
      pnl: 1262.50,
      pnlPercent: 16.8,
      confidence: 0.85,
      reasoning: 'Short MA crossed above Long MA with strong momentum',
      status: 'COMPLETED'
    },
    {
      id: 2,
      algorithm: 'RSI Mean Reversion',
      symbol: 'TSLA',
      action: 'BUY',
      quantity: 30,
      entryPrice: 200.00,
      exitPrice: 245.80,
      entryDate: '2024-01-18',
      exitDate: '2024-01-25',
      pnl: 1374.00,
      pnlPercent: 22.9,
      confidence: 0.78,
      reasoning: 'RSI oversold at 28, mean reversion opportunity',
      status: 'COMPLETED'
    },
    {
      id: 3,
      algorithm: 'Bollinger Bands Strategy',
      symbol: 'MSFT',
      action: 'BUY',
      quantity: 25,
      entryPrice: 300.00,
      exitPrice: 385.20,
      entryDate: '2024-02-01',
      exitDate: '2024-02-10',
      pnl: 2130.00,
      pnlPercent: 28.4,
      confidence: 0.82,
      reasoning: 'Price touched lower band, volatility breakout expected',
      status: 'COMPLETED'
    },
    {
      id: 4,
      algorithm: 'Moving Average Crossover',
      symbol: 'GOOGL',
      action: 'SELL',
      quantity: 20,
      entryPrice: 120.00,
      exitPrice: 142.30,
      entryDate: '2024-02-05',
      exitDate: '2024-02-12',
      pnl: 446.00,
      pnlPercent: 18.6,
      confidence: 0.75,
      reasoning: 'Short MA crossed below Long MA, trend reversal',
      status: 'COMPLETED'
    },
    {
      id: 5,
      algorithm: 'RSI Mean Reversion',
      symbol: 'AMZN',
      action: 'BUY',
      quantity: 10,
      entryPrice: 3200.00,
      exitPrice: 3450.75,
      entryDate: '2024-02-15',
      exitDate: '2024-02-22',
      pnl: 2507.50,
      pnlPercent: 7.8,
      confidence: 0.68,
      reasoning: 'RSI at 32, oversold condition with potential bounce',
      status: 'COMPLETED'
    }
  ];

  const algorithmPerformance = {
    totalTrades: algorithmTrades.length,
    winningTrades: algorithmTrades.filter(trade => trade.pnl > 0).length,
    totalPnL: algorithmTrades.reduce((sum, trade) => sum + trade.pnl, 0),
    winRate: (algorithmTrades.filter(trade => trade.pnl > 0).length / algorithmTrades.length) * 100,
    avgConfidence: algorithmTrades.reduce((sum, trade) => sum + trade.confidence, 0) / algorithmTrades.length,
    bestTrade: Math.max(...algorithmTrades.map(trade => trade.pnl)),
    worstTrade: Math.min(...algorithmTrades.map(trade => trade.pnl)),
    avgTradeDuration: '5.2 days',
    sharpeRatio: 1.45,
    maxDrawdown: -8.2,
    var95: 1250.00,
    beta: 0.85,
    volatility: 18.5
  };

  const manualTrades = [
    {
      id: 1,
      symbol: 'NVDA',
      action: 'BUY',
      quantity: 15,
      entryPrice: 450.00,
      exitPrice: 485.20,
      entryDate: '2024-01-10',
      exitDate: '2024-01-18',
      pnl: 528.00,
      pnlPercent: 7.8,
      status: 'COMPLETED'
    },
    {
      id: 2,
      symbol: 'META',
      action: 'SELL',
      quantity: 20,
      entryPrice: 350.00,
      exitPrice: 385.50,
      entryDate: '2024-01-22',
      exitDate: '2024-01-30',
      pnl: -710.00,
      pnlPercent: -10.1,
      status: 'COMPLETED'
    }
  ];

  const manualPerformance = {
    totalTrades: manualTrades.length,
    winningTrades: manualTrades.filter(trade => trade.pnl > 0).length,
    totalPnL: manualTrades.reduce((sum, trade) => sum + trade.pnl, 0),
    winRate: (manualTrades.filter(trade => trade.pnl > 0).length / manualTrades.length) * 100,
    avgTradeDuration: '8.5 days',
    sharpeRatio: 0.85,
    maxDrawdown: -15.2,
    var95: 2100.00,
    beta: 1.15,
    volatility: 25.8
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Fetch portfolio data from API
  const fetchPortfolioData = async () => {
    try {
      setError(null);
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const API_URL = isDevelopment ? 'http://localhost:3002' : 'https://hytrade-backend.onrender.com';
      
      const response = await fetch(`${API_URL}/api/trading/portfolio/detailed`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Transform API data to match our component structure
        const transformedData = {
          totalValue: result.data.totalPortfolioValue || result.data.totalCurrentValue || 0,
          totalInvestment: result.data.totalInvestment || 0,
          totalPnL: result.data.totalProfitLoss || 0,
          totalPnLPercentage: result.data.totalProfitLossPercentage || 0,
          dayChange: 0, // Will be calculated from timeline
          dayChangePercentage: 0, // Will be calculated from timeline
          timeline: result.data.timeline || [],
          holdings: result.data.holdings || [],
          sectorAllocation: result.data.sectorAllocation || []
        };
        
        setPortfolioData(transformedData);
      } else {
        throw new Error(result.message || 'Failed to fetch portfolio data');
      }
    } catch (err) {
      console.error('Error fetching portfolio data:', err);
      setError(err.message);
      // Fall back to mock data if API fails
      setPortfolioData(mockPortfolioData);
    } finally {
      setLoading(false);
    }
  };

  // Refresh portfolio data
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPortfolioData();
    setRefreshing(false);
  };

  // Load data on component mount
  useEffect(() => {
    if (token) {
      fetchPortfolioData();
    }
  }, [token]);

  // Custom tooltip for timeline chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            {new Date(label).toLocaleDateString()}
          </Typography>
          <Typography variant="h6" color="primary.main">
            {formatCurrency(payload[0].value)}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <Paper sx={{ p: 2, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            {data.name}
          </Typography>
          <Typography variant="h6" color="primary.main">
            {data.value.toFixed(1)}%
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ width: '100%' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Error Loading Portfolio
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button variant="contained" onClick={fetchPortfolioData}>
            Retry
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
            Portfolio
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your investments and performance
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export Portfolio">
            <IconButton>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Filter Holdings">
            <IconButton>
              <FilterIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Portfolio Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AssessmentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Total Value
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                {formatCurrency(portfolioData.totalValue)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {portfolioData.dayChange >= 0 ? (
                  <TrendingUpIcon color="success" sx={{ mr: 0.5, fontSize: 20 }} />
                ) : (
                  <TrendingDownIcon color="error" sx={{ mr: 0.5, fontSize: 20 }} />
                )}
                <Typography
                  variant="body2"
                  color={portfolioData.dayChange >= 0 ? 'success.main' : 'error.main'}
                  sx={{ fontWeight: 500 }}
                >
                  {formatCurrency(portfolioData.dayChange)} ({formatPercentage(portfolioData.dayChangePercentage)})
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Total P&L
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                {formatCurrency(portfolioData.totalPnL)}
              </Typography>
              <Typography
                variant="body2"
                color={portfolioData.totalPnL >= 0 ? 'success.main' : 'error.main'}
                sx={{ fontWeight: 500 }}
              >
                {formatPercentage(portfolioData.totalPnLPercentage)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PieChartIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Total Investment
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                {formatCurrency(portfolioData.totalInvestment)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Invested amount
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AssessmentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Holdings
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                {portfolioData.holdings.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active positions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Holdings" />
          <Tab label="Performance" />
          <Tab label="Algorithm Performance" />
          <Tab label="Analysis" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Portfolio Timeline */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardHeader
                title="Portfolio Value Timeline"
                subheader="Historical performance over time"
              />
              <CardContent>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={portfolioData.timeline}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
                        stroke={theme.palette.text.secondary}
                      />
                      <YAxis 
                        tickFormatter={(value) => formatCurrency(value)}
                        stroke={theme.palette.text.secondary}
                      />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={theme.palette.primary.main}
                        strokeWidth={3}
                        dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: theme.palette.primary.main, strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Sector Allocation */}
          <Grid item xs={12} lg={4}>
            <Card>
              <CardHeader
                title="Sector Allocation"
                subheader="Portfolio diversification"
              />
              <CardContent>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={portfolioData.sectorAllocation}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {portfolioData.sectorAllocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomPieTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Card>
          <CardHeader
            title="Holdings"
            subheader="Your current positions"
          />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Symbol</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Avg Buy Price</TableCell>
                    <TableCell align="right">Current Price</TableCell>
                    <TableCell align="right">Market Value</TableCell>
                    <TableCell align="right">P&L</TableCell>
                    <TableCell align="right">Allocation</TableCell>
                    <TableCell>Sector</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {portfolioData.holdings.map((holding) => (
                    <TableRow key={holding.symbol} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {holding.symbol}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {holding.name}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {holding.quantity}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatCurrency(holding.avgBuyPrice)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatCurrency(holding.currentPrice)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatCurrency(holding.marketValue)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          {holding.pnl >= 0 ? (
                            <TrendingUpIcon color="success" sx={{ mr: 0.5, fontSize: 16 }} />
                          ) : (
                            <TrendingDownIcon color="error" sx={{ mr: 0.5, fontSize: 16 }} />
                          )}
                          <Box>
                            <Typography
                              variant="body2"
                              color={holding.pnl >= 0 ? 'success.main' : 'error.main'}
                              sx={{ fontWeight: 500 }}
                            >
                              {formatCurrency(holding.pnl)}
                            </Typography>
                            <Typography
                              variant="caption"
                              color={holding.pnl >= 0 ? 'success.main' : 'error.main'}
                            >
                              {formatPercentage(holding.pnlPercentage)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <Box sx={{ width: 60, mr: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={holding.allocation}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: theme.palette.grey[200],
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: theme.palette.primary.main,
                                },
                              }}
                            />
                          </Box>
                          <Typography variant="body2">
                            {holding.allocation.toFixed(1)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={holding.sector}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Alert severity="info">
          Performance analysis charts and metrics will be implemented here.
        </Alert>
      )}

      {activeTab === 3 && (
        <Box>
          {/* Algorithm Performance Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                Algorithm Performance Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Compare algorithm-generated trades with manual trading performance
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" startIcon={<CodeIcon />}>
                View Algorithm Code
              </Button>
              <Button variant="outlined" startIcon={<BugReportIcon />}>
                Backtest Results
              </Button>
            </Box>
          </Box>

          {/* Performance Comparison Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Algorithm Trading"
                  subheader="Automated strategy performance"
                  avatar={<PsychologyIcon color="primary" />}
                />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Total Trades
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {algorithmPerformance.totalTrades}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Win Rate
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                        {algorithmPerformance.winRate.toFixed(1)}%
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Total P&L
                      </Typography>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600,
                          color: algorithmPerformance.totalPnL >= 0 ? 'success.main' : 'error.main'
                        }}
                      >
                        {formatCurrency(algorithmPerformance.totalPnL)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Avg Confidence
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {(algorithmPerformance.avgConfidence * 100).toFixed(0)}%
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Sharpe Ratio
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {algorithmPerformance.sharpeRatio}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Max Drawdown
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main' }}>
                        {algorithmPerformance.maxDrawdown}%
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Manual Trading"
                  subheader="Human decision performance"
                  avatar={<AssessmentIcon color="secondary" />}
                />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Total Trades
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {manualPerformance.totalTrades}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Win Rate
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                        {manualPerformance.winRate.toFixed(1)}%
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Total P&L
                      </Typography>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600,
                          color: manualPerformance.totalPnL >= 0 ? 'success.main' : 'error.main'
                        }}
                      >
                        {formatCurrency(manualPerformance.totalPnL)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Avg Duration
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {manualPerformance.avgTradeDuration}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Sharpe Ratio
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {manualPerformance.sharpeRatio}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Max Drawdown
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main' }}>
                        {manualPerformance.maxDrawdown}%
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Algorithm Trades Table */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title="Algorithm-Generated Trades"
              subheader="Detailed breakdown of automated trading decisions"
              action={
                <Button variant="outlined" size="small" startIcon={<DownloadIcon />}>
                  Export Trades
                </Button>
              }
            />
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Algorithm</TableCell>
                      <TableCell>Symbol</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Entry Price</TableCell>
                      <TableCell align="right">Exit Price</TableCell>
                      <TableCell align="right">P&L</TableCell>
                      <TableCell align="right">Confidence</TableCell>
                      <TableCell>Reasoning</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {algorithmTrades.map((trade) => (
                      <TableRow key={trade.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PsychologyIcon sx={{ mr: 1, fontSize: 20, color: 'primary.main' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {trade.algorithm}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {trade.symbol}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={trade.action}
                            size="small"
                            color={trade.action === 'BUY' ? 'success' : 'error'}
                            variant="filled"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {trade.quantity}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatCurrency(trade.entryPrice)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {formatCurrency(trade.exitPrice)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            {trade.pnl >= 0 ? (
                              <TrendingUpIcon color="success" sx={{ mr: 0.5, fontSize: 16 }} />
                            ) : (
                              <TrendingDownIcon color="error" sx={{ mr: 0.5, fontSize: 16 }} />
                            )}
                            <Box>
                              <Typography
                                variant="body2"
                                color={trade.pnl >= 0 ? 'success.main' : 'error.main'}
                                sx={{ fontWeight: 500 }}
                              >
                                {formatCurrency(trade.pnl)}
                              </Typography>
                              <Typography
                                variant="caption"
                                color={trade.pnl >= 0 ? 'success.main' : 'error.main'}
                              >
                                {formatPercentage(trade.pnlPercent)}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <Box sx={{ width: 60, mr: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={trade.confidence * 100}
                                sx={{
                                  height: 6,
                                  borderRadius: 3,
                                  backgroundColor: 'grey.200',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: 'primary.main',
                                  },
                                }}
                              />
                            </Box>
                            <Typography variant="body2">
                              {(trade.confidence * 100).toFixed(0)}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={trade.reasoning}>
                            <Typography variant="body2" sx={{ 
                              maxWidth: 200, 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {trade.reasoning}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={trade.status}
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Risk Metrics Comparison */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Algorithm Risk Metrics"
                  subheader="Automated risk management"
                  avatar={<SecurityIcon color="primary" />}
                />
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <SecurityIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Value at Risk (95%)" 
                        secondary={formatCurrency(algorithmPerformance.var95)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TrendingUpIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Beta" 
                        secondary={algorithmPerformance.beta}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <SpeedIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Volatility" 
                        secondary={`${algorithmPerformance.volatility}%`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TimelineIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Avg Trade Duration" 
                        secondary={algorithmPerformance.avgTradeDuration}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Manual Risk Metrics"
                  subheader="Human risk management"
                  avatar={<AssessmentIcon color="secondary" />}
                />
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <SecurityIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Value at Risk (95%)" 
                        secondary={formatCurrency(manualPerformance.var95)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TrendingUpIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Beta" 
                        secondary={manualPerformance.beta}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <SpeedIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Volatility" 
                        secondary={`${manualPerformance.volatility}%`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TimelineIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Avg Trade Duration" 
                        secondary={manualPerformance.avgTradeDuration}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {activeTab === 4 && (
        <Alert severity="info">
          Risk analysis and advanced portfolio metrics will be implemented here.
        </Alert>
      )}
    </Box>
  );
};

export default PortfolioPage;
