import React, { useState, useEffect, useMemo } from 'react';
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
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
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
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import HoldingsTable from '../components/HoldingsTable';
import { formatInr, formatPercentage as formatPct } from '../utils/currency';
import { getApiUrl } from '../utils/api';
import { PageContent, PageHeader, StatCard, Panel } from '../components/layout/PageShell';
import AllocationChart from '../components/portfolio/AllocationChart';
import { enrichAllocationItems, buildChartSeries, chartYDomain, getChartColor } from '../utils/chartTheme';

const emptyPortfolio = {
  totalValue: 0,
  totalInvestment: 0,
  totalPnL: 0,
  totalPnLPercentage: 0,
  dayChange: 0,
  dayChangePercentage: 0,
  timeline: [],
  holdings: [],
  sectorAllocation: [],
};

const PortfolioPage = () => {
  const theme = useTheme();
  const { user, token } = useAuth();
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [portfolioData, setPortfolioData] = useState(emptyPortfolio);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

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

  const formatCurrency = (amount) => formatInr(amount, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const formatPercentage = formatPct;

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Fetch portfolio data from API
  const fetchPortfolioData = async () => {
    try {
      setLoadError(null);
      const API_URL = getApiUrl();
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
      setLoadError(err.message);
      setPortfolioData(emptyPortfolio);
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

  const handleDeposit = async () => {
    const amountNum = parseFloat(depositAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setActionMessage('Please enter a valid amount greater than 0');
      return;
    }
    try {
      setDepositLoading(true);
      const API_URL = getApiUrl();
      const res = await fetch(`${API_URL}/api/trading/portfolio/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: amountNum })
      });
      const js = await res.json();
      if (!res.ok || !js.success) throw new Error(js.message || 'Deposit failed');
      setDepositOpen(false);
      setDepositAmount('');
      await fetchPortfolioData();
    } catch (e) {
      setActionMessage(e.message);
    } finally {
      setDepositLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPortfolioData();
    }
  }, [token]);

  const chartData = useMemo(
    () => buildChartSeries(portfolioData.timeline, portfolioData.totalValue),
    [portfolioData.timeline, portfolioData.totalValue],
  );

  const yDomain = useMemo(() => chartYDomain(chartData), [chartData]);

  const allocationChartData = useMemo(
    () => enrichAllocationItems(portfolioData.sectorAllocation, portfolioData.totalValue),
    [portfolioData.sectorAllocation, portfolioData.totalValue],
  );

  const allocationColorBySymbol = useMemo(() => {
    const map = new Map();
    allocationChartData.forEach((item) => map.set(item.name, item.color));
    return map;
  }, [allocationChartData]);

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Show error state
  if (loadError && !portfolioData.holdings.length && !portfolioData.totalValue) {
    return (
      <Box sx={{ width: '100%' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Error Loading Portfolio
          </Typography>
          <Typography variant="body2">
            {loadError}
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
    <PageContent>
      <PageHeader
        title="Portfolio"
        subtitle="Track your paper holdings and performance"
        actions={(
          <>
            <Button variant="contained" onClick={() => setDepositOpen(true)}>Add funds</Button>
            <Tooltip title="Refresh data">
              <IconButton onClick={handleRefresh} disabled={refreshing} aria-label="Refresh">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export portfolio">
              <IconButton aria-label="Export">
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Filter holdings">
              <IconButton aria-label="Filter">
                <FilterIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
      />

      {actionMessage && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setActionMessage('')}>
          {actionMessage}
        </Alert>
      )}

      <Dialog open={depositOpen} onClose={() => setDepositOpen(false)}>
        <DialogTitle>Add Funds</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            inputProps={{ min: 0, step: '0.01' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDepositOpen(false)}>Cancel</Button>
          <Button onClick={handleDeposit} disabled={depositLoading} variant="contained">Deposit</Button>
        </DialogActions>
      </Dialog>

      <Grid container spacing={2} sx={{ mb: 3, width: '100%' }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Total value"
            value={formatCurrency(portfolioData.totalValue)}
            hint={`Cash + holdings · ${formatCurrency(portfolioData.dayChange)} (${formatPercentage(portfolioData.dayChangePercentage)}) today`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Unrealized P&L"
            value={formatCurrency(portfolioData.totalPnL)}
            hint={formatPercentage(portfolioData.totalPnLPercentage)}
            tone={portfolioData.totalPnL >= 0 ? 'up' : 'down'}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Invested"
            value={formatCurrency(portfolioData.totalInvestment)}
            hint="Cost basis in open positions"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Holdings"
            value={String(portfolioData.holdings.length)}
            hint="Active NSE positions"
          />
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
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Panel title="Portfolio value" subtitle="Based on your trade history">
              <Box sx={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                      interval="preserveStartEnd"
                      minTickGap={28}
                    />
                    <YAxis
                      domain={yDomain}
                      tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                      tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                      width={56}
                    />
                    <RechartsTooltip formatter={(v) => formatCurrency(v)} labelFormatter={(l) => l} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={theme.palette.primary.main}
                      strokeWidth={2}
                      dot={chartData.length <= 1}
                      activeDot={{ r: 4, fill: theme.palette.primary.main }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Panel>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Panel
              title="Holdings allocation"
              subtitle={portfolioData.holdings.length ? `${portfolioData.holdings.length} positions` : 'No open positions'}
            >
              <AllocationChart data={allocationChartData} height={320} />
            </Panel>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <>
        <Card sx={{ mb: 2 }}>
          <CardHeader title="Holdings (Live)" subheader="Fetched from backend in real time" />
          <CardContent>
            <HoldingsTable />
          </CardContent>
        </Card>
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
                    <TableCell>Exchange</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {portfolioData.holdings.map((holding, index) => {
                    const symbol = holding.stockSymbol || holding.symbol;
                    const pnl = holding.profitLoss ?? holding.pnl ?? 0;
                    const pnlPct = holding.profitLossPercentage ?? holding.pnlPercentage ?? 0;
                    const marketValue = holding.currentValue ?? holding.marketValue ?? 0;
                    const allocationPct = portfolioData.totalValue > 0
                      ? (marketValue / portfolioData.totalValue) * 100
                      : 0;
                    return (
                    <TableRow key={symbol || index} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {symbol}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {holding.stockName || holding.name || symbol}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {holding.quantity}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatCurrency(holding.averagePrice ?? holding.avgBuyPrice)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatCurrency(holding.currentPrice)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatCurrency(marketValue)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          {pnl >= 0 ? (
                            <TrendingUpIcon color="success" sx={{ mr: 0.5, fontSize: 16 }} />
                          ) : (
                            <TrendingDownIcon color="error" sx={{ mr: 0.5, fontSize: 16 }} />
                          )}
                          <Box>
                            <Typography
                              variant="body2"
                              color={pnl >= 0 ? 'success.main' : 'error.main'}
                              sx={{ fontWeight: 500 }}
                            >
                              {formatCurrency(pnl)}
                            </Typography>
                            <Typography
                              variant="caption"
                              color={pnl >= 0 ? 'success.main' : 'error.main'}
                            >
                              {formatPercentage(pnlPct)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <Box sx={{ width: 60, mr: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(100, allocationPct)}
                              sx={{
                                height: 6,
                                borderRadius: 1,
                                bgcolor: 'action.hover',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: allocationColorBySymbol.get(symbol) || getChartColor(index),
                                  borderRadius: 1,
                                },
                              }}
                            />
                          </Box>
                          <Typography variant="body2">
                            {allocationPct.toFixed(1)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">NSE</Typography>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
        </>
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
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardHeader
                  title="Algorithm Trading"
                  subheader="Automated strategy performance"
                  avatar={<PsychologyIcon color="primary" />}
                />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Total Trades
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {algorithmPerformance.totalTrades}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Win Rate
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                        {algorithmPerformance.winRate.toFixed(1)}%
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
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
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Avg Confidence
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {(algorithmPerformance.avgConfidence * 100).toFixed(0)}%
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Sharpe Ratio
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {algorithmPerformance.sharpeRatio}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
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

            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardHeader
                  title="Manual Trading"
                  subheader="Human decision performance"
                  avatar={<AssessmentIcon color="secondary" />}
                />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Total Trades
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {manualPerformance.totalTrades}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Win Rate
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                        {manualPerformance.winRate.toFixed(1)}%
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
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
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Avg Duration
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {manualPerformance.avgTradeDuration}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Sharpe Ratio
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {manualPerformance.sharpeRatio}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
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
                                  borderRadius: 1,
                                  bgcolor: 'action.hover',
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: 'primary.main',
                                    borderRadius: 1,
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
            <Grid size={{ xs: 12, md: 6 }}>
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

            <Grid size={{ xs: 12, md: 6 }}>
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
    </PageContent>
  );
};

export default PortfolioPage;
