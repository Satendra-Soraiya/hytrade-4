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
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Alert,
  CircularProgress,
  Badge,
  Avatar
} from '@mui/material';
import {
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  StarBorder as StarBorderIcon,
  Star as StarIcon,
  Public as PublicIcon,
  ShowChart as ShowChartIcon,
  AttachMoney as AttachMoneyIcon,
  VolumeUp as VolumeUpIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';

// Mock market data - will be replaced with real API calls
const mockMarketData = {
  globalIndices: [
    {
      name: 'NIFTY 50',
      symbol: 'NIFTY',
      value: 19850.25,
      change: 125.50,
      changePercent: 0.64,
      country: 'India',
      flag: '🇮🇳'
    },
    {
      name: 'SENSEX',
      symbol: 'SENSEX',
      value: 66123.45,
      change: -89.25,
      changePercent: -0.13,
      country: 'India',
      flag: '🇮🇳'
    },
    {
      name: 'NASDAQ',
      symbol: 'NASDAQ',
      value: 14567.89,
      change: 234.12,
      changePercent: 1.63,
      country: 'USA',
      flag: '🇺🇸'
    },
    {
      name: 'S&P 500',
      symbol: 'SPX',
      value: 4567.23,
      change: 45.67,
      changePercent: 1.01,
      country: 'USA',
      flag: '🇺🇸'
    },
    {
      name: 'DOW JONES',
      symbol: 'DJI',
      value: 34567.89,
      change: -123.45,
      changePercent: -0.36,
      country: 'USA',
      flag: '🇺🇸'
    },
    {
      name: 'FTSE 100',
      symbol: 'FTSE',
      value: 7890.12,
      change: 67.89,
      changePercent: 0.87,
      country: 'UK',
      flag: '🇬🇧'
    }
  ],
  topGainers: [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 175.50,
      change: 12.45,
      changePercent: 7.63,
      volume: '45.2M',
      marketCap: '2.8T',
      sector: 'Technology'
    },
    {
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      price: 245.80,
      change: 18.90,
      changePercent: 8.33,
      volume: '78.5M',
      marketCap: '780B',
      sector: 'Automotive'
    },
    {
      symbol: 'NVDA',
      name: 'NVIDIA Corp.',
      price: 485.20,
      change: 32.15,
      changePercent: 7.10,
      volume: '52.1M',
      marketCap: '1.2T',
      sector: 'Technology'
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      price: 142.30,
      change: 8.75,
      changePercent: 6.55,
      volume: '28.9M',
      marketCap: '1.8T',
      sector: 'Technology'
    },
    {
      symbol: 'AMZN',
      name: 'Amazon.com Inc.',
      price: 3450.75,
      change: 198.25,
      changePercent: 6.09,
      volume: '15.7M',
      marketCap: '1.7T',
      sector: 'E-commerce'
    }
  ],
  topLosers: [
    {
      symbol: 'META',
      name: 'Meta Platforms Inc.',
      price: 298.45,
      change: -15.20,
      changePercent: -4.85,
      volume: '32.4M',
      marketCap: '760B',
      sector: 'Technology'
    },
    {
      symbol: 'NFLX',
      name: 'Netflix Inc.',
      price: 445.60,
      change: -18.90,
      changePercent: -4.07,
      volume: '12.8M',
      marketCap: '195B',
      sector: 'Entertainment'
    },
    {
      symbol: 'UBER',
      name: 'Uber Technologies Inc.',
      price: 45.20,
      change: -1.85,
      changePercent: -3.93,
      volume: '25.6M',
      marketCap: '95B',
      sector: 'Transportation'
    },
    {
      symbol: 'SNAP',
      name: 'Snap Inc.',
      price: 12.45,
      change: -0.45,
      changePercent: -3.49,
      volume: '45.2M',
      marketCap: '20B',
      sector: 'Technology'
    },
    {
      symbol: 'TWTR',
      name: 'Twitter Inc.',
      price: 34.20,
      change: -1.15,
      changePercent: -3.25,
      volume: '18.9M',
      marketCap: '26B',
      sector: 'Technology'
    }
  ],
  volumeLeaders: [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 175.50,
      volume: '78.5M',
      avgVolume: '45.2M',
      volumeRatio: 1.74,
      sector: 'Technology'
    },
    {
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      price: 245.80,
      volume: '65.2M',
      avgVolume: '38.7M',
      volumeRatio: 1.68,
      sector: 'Automotive'
    },
    {
      symbol: 'SPY',
      name: 'SPDR S&P 500 ETF',
      price: 456.78,
      volume: '52.1M',
      avgVolume: '42.3M',
      volumeRatio: 1.23,
      sector: 'ETF'
    },
    {
      symbol: 'QQQ',
      name: 'Invesco QQQ Trust',
      price: 378.90,
      volume: '48.7M',
      avgVolume: '35.6M',
      volumeRatio: 1.37,
      sector: 'ETF'
    },
    {
      symbol: 'NVDA',
      name: 'NVIDIA Corp.',
      price: 485.20,
      volume: '45.8M',
      avgVolume: '28.9M',
      volumeRatio: 1.58,
      sector: 'Technology'
    }
  ],
  sectorPerformance: [
    { name: 'Technology', value: 2.45, color: '#8884d8' },
    { name: 'Healthcare', value: 1.89, color: '#82ca9d' },
    { name: 'Finance', value: 1.23, color: '#ffc658' },
    { name: 'Energy', value: -0.45, color: '#ff7300' },
    { name: 'Consumer', value: 0.78, color: '#0088fe' },
    { name: 'Industrial', value: 1.12, color: '#00ff00' },
    { name: 'Utilities', value: -0.23, color: '#ff00ff' },
    { name: 'Materials', value: 0.56, color: '#ffff00' }
  ]
};

const MarketsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, token } = useAuth();
  const [marketData, setMarketData] = useState(mockMarketData);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [sortBy, setSortBy] = useState('changePercent');
  const [sortOrder, setSortOrder] = useState('desc');
  const [watchlist, setWatchlist] = useState(new Set());
  const [error, setError] = useState(null);

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

  // Format large numbers
  const formatLargeNumber = (num) => {
    if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Toggle watchlist
  const toggleWatchlist = (symbol) => {
    const newWatchlist = new Set(watchlist);
    if (newWatchlist.has(symbol)) {
      newWatchlist.delete(symbol);
    } else {
      newWatchlist.add(symbol);
    }
    setWatchlist(newWatchlist);
  };

  // Fetch market data from API
  const fetchMarketData = async () => {
    try {
      setError(null);
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const API_URL = isDevelopment ? 'http://localhost:3002' : 'https://hytrade-backend.onrender.com';
      
      const response = await fetch(`${API_URL}/api/trading/markets`, {
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
        setMarketData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch market data');
      }
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError(err.message);
      // Fall back to mock data if API fails
      setMarketData(mockMarketData);
    } finally {
      setLoading(false);
    }
  };

  // Refresh market data
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMarketData();
    setRefreshing(false);
  };

  // Load data on component mount
  useEffect(() => {
    if (token) {
      fetchMarketData();
    }
  }, [token]);

  // Filter and sort data
  const getFilteredData = (data) => {
    let filtered = data.filter(item => {
      const matchesSearch = item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSector = selectedSector === 'All' || item.sector === selectedSector;
      return matchesSearch && matchesSector;
    });

    // Sort data
    filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h6" color="primary.main">
            {formatPercentage(payload[0].value)}
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
            Error Loading Market Data
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button variant="contained" onClick={fetchMarketData}>
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
            Markets
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Global market analysis and stock research
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Global Market Indices */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {marketData.globalIndices.map((index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index.symbol}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" sx={{ mr: 1 }}>
                    {index.flag}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {index.symbol}
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {index.value.toLocaleString()}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {index.change >= 0 ? (
                    <TrendingUpIcon color="success" sx={{ mr: 0.5, fontSize: 16 }} />
                  ) : (
                    <TrendingDownIcon color="error" sx={{ mr: 0.5, fontSize: 16 }} />
                  )}
                  <Typography
                    variant="body2"
                    color={index.change >= 0 ? 'success.main' : 'error.main'}
                    sx={{ fontWeight: 500 }}
                  >
                    {formatPercentage(index.changePercent)}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {index.name}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search stocks, ETFs, or symbols..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sector</InputLabel>
                <Select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  label="Sector"
                >
                  <MenuItem value="All">All Sectors</MenuItem>
                  <MenuItem value="Technology">Technology</MenuItem>
                  <MenuItem value="Healthcare">Healthcare</MenuItem>
                  <MenuItem value="Finance">Finance</MenuItem>
                  <MenuItem value="Energy">Energy</MenuItem>
                  <MenuItem value="Consumer">Consumer</MenuItem>
                  <MenuItem value="Industrial">Industrial</MenuItem>
                  <MenuItem value="Automotive">Automotive</MenuItem>
                  <MenuItem value="E-commerce">E-commerce</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="changePercent">Change %</MenuItem>
                  <MenuItem value="price">Price</MenuItem>
                  <MenuItem value="volume">Volume</MenuItem>
                  <MenuItem value="marketCap">Market Cap</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                startIcon={<FilterIcon />}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Top Gainers" />
          <Tab label="Top Losers" />
          <Tab label="Volume Leaders" />
          <Tab label="Sector Performance" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Card>
          <CardHeader
            title="Top Gainers"
            subheader="Stocks with highest percentage gains today"
          />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Symbol</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Change</TableCell>
                    <TableCell align="right">Volume</TableCell>
                    <TableCell align="right">Market Cap</TableCell>
                    <TableCell>Sector</TableCell>
                    <TableCell>Watch</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getFilteredData(marketData.topGainers).map((stock) => (
                    <TableRow key={stock.symbol} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {stock.symbol}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {stock.name}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatCurrency(stock.price)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <TrendingUpIcon color="success" sx={{ mr: 0.5, fontSize: 16 }} />
                          <Box>
                            <Typography
                              variant="body2"
                              color="success.main"
                              sx={{ fontWeight: 500 }}
                            >
                              {formatCurrency(stock.change)}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="success.main"
                            >
                              {formatPercentage(stock.changePercent)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {stock.volume}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {stock.marketCap}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={stock.sector}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => toggleWatchlist(stock.symbol)}
                        >
                          {watchlist.has(stock.symbol) ? (
                            <StarIcon color="primary" />
                          ) : (
                            <StarBorderIcon />
                          )}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 1 && (
        <Card>
          <CardHeader
            title="Top Losers"
            subheader="Stocks with highest percentage losses today"
          />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Symbol</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Change</TableCell>
                    <TableCell align="right">Volume</TableCell>
                    <TableCell align="right">Market Cap</TableCell>
                    <TableCell>Sector</TableCell>
                    <TableCell>Watch</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getFilteredData(marketData.topLosers).map((stock) => (
                    <TableRow key={stock.symbol} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {stock.symbol}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {stock.name}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatCurrency(stock.price)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <TrendingDownIcon color="error" sx={{ mr: 0.5, fontSize: 16 }} />
                          <Box>
                            <Typography
                              variant="body2"
                              color="error.main"
                              sx={{ fontWeight: 500 }}
                            >
                              {formatCurrency(stock.change)}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="error.main"
                            >
                              {formatPercentage(stock.changePercent)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {stock.volume}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {stock.marketCap}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={stock.sector}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => toggleWatchlist(stock.symbol)}
                        >
                          {watchlist.has(stock.symbol) ? (
                            <StarIcon color="primary" />
                          ) : (
                            <StarBorderIcon />
                          )}
                        </IconButton>
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
        <Card>
          <CardHeader
            title="Volume Leaders"
            subheader="Stocks with highest trading volume today"
          />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Symbol</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Volume</TableCell>
                    <TableCell align="right">Avg Volume</TableCell>
                    <TableCell align="right">Ratio</TableCell>
                    <TableCell>Sector</TableCell>
                    <TableCell>Watch</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getFilteredData(marketData.volumeLeaders).map((stock) => (
                    <TableRow key={stock.symbol} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {stock.symbol}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {stock.name}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatCurrency(stock.price)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <VolumeUpIcon sx={{ mr: 0.5, fontSize: 16, color: 'primary.main' }} />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {stock.volume}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {stock.avgVolume}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Badge
                          badgeContent={stock.volumeRatio.toFixed(2)}
                          color={stock.volumeRatio > 1.5 ? 'error' : 'primary'}
                        >
                          <Typography variant="body2">
                            {stock.volumeRatio > 1.5 ? 'High' : 'Normal'}
                          </Typography>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={stock.sector}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => toggleWatchlist(stock.symbol)}
                        >
                          {watchlist.has(stock.symbol) ? (
                            <StarIcon color="primary" />
                          ) : (
                            <StarBorderIcon />
                          )}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardHeader
                title="Sector Performance"
                subheader="Today's sector-wise performance"
              />
              <CardContent>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={marketData.sectorPerformance} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis type="number" stroke={theme.palette.text.secondary} />
                      <YAxis dataKey="name" type="category" stroke={theme.palette.text.secondary} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Bar dataKey="value">
                        {marketData.sectorPerformance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Card>
              <CardHeader
                title="Sector Summary"
                subheader="Performance overview"
              />
              <CardContent>
                {marketData.sectorPerformance.map((sector) => (
                  <Box key={sector.name} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {sector.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color={sector.value >= 0 ? 'success.main' : 'error.main'}
                        sx={{ fontWeight: 500 }}
                      >
                        {formatPercentage(sector.value)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        height: 8,
                        backgroundColor: theme.palette.grey[200],
                        borderRadius: 4,
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        sx={{
                          height: '100%',
                          width: `${Math.abs(sector.value) * 20}%`,
                          backgroundColor: sector.value >= 0 ? 'success.main' : 'error.main',
                          borderRadius: 4
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default MarketsPage;
