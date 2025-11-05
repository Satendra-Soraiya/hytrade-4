import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  IconButton,
  Tooltip,
  InputAdornment,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Badge
} from '@mui/material';
// Using MUI Grid from '@mui/material' which supports 'size' prop with the current version
import {
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  AccountBalance as AccountBalanceIcon,
  AttachMoney as AttachMoneyIcon,
  ShowChart as ShowChartIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  FlashOn as FlashOnIcon,
  Speed as SpeedIcon,
  TrendingFlat as TrendingFlatIcon,
  Visibility as VisibilityIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useRefresh } from '../contexts/RefreshContext';

// Mock data for development - will be replaced with real API calls for lists; order placement uses backend
const mockStocks = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 175.50,
    change: 12.45,
    changePercent: 7.63,
    volume: '45.2M',
    marketCap: '2.8T',
    sector: 'Technology',
    high: 178.20,
    low: 172.10,
    open: 173.25,
    previousClose: 163.05,
    logoUrl: 'https://logo.clearbit.com/apple.com',
    logoUrlFallback: 'https://companieslogo.com/img/orig/AAPL-7c4a9e4f.png',
    chartData: [
      { time: '09:30', price: 173.25 },
      { time: '10:00', price: 174.50 },
      { time: '10:30', price: 175.20 },
      { time: '11:00', price: 176.10 },
      { time: '11:30', price: 175.80 },
      { time: '12:00', price: 175.50 }
    ]
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 245.80,
    change: 18.90,
    changePercent: 8.33,
    volume: '78.5M',
    marketCap: '780B',
    sector: 'Automotive',
    high: 248.50,
    low: 240.20,
    open: 242.10,
    previousClose: 226.90,
    logoUrl: 'https://logo.clearbit.com/tesla.com',
    chartData: [
      { time: '09:30', price: 242.10 },
      { time: '10:00', price: 244.20 },
      { time: '10:30', price: 245.50 },
      { time: '11:00', price: 247.20 },
      { time: '11:30', price: 246.80 },
      { time: '12:00', price: 245.80 }
    ]
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 142.30,
    change: 8.75,
    changePercent: 6.55,
    volume: '28.9M',
    marketCap: '1.8T',
    sector: 'Technology',
    high: 144.20,
    low: 140.50,
    open: 141.80,
    previousClose: 133.55,
    logoUrl: 'https://static.dezeen.com/uploads/2025/05/sq-google-g-logo-update_dezeen_2364_col_0-852x852.jpg',
    logoUrlFallback: 'https://logo.clearbit.com/google.com',
    chartData: [
      { time: '09:30', price: 141.80 },
      { time: '10:00', price: 142.50 },
      { time: '10:30', price: 143.20 },
      { time: '11:00', price: 143.80 },
      { time: '11:30', price: 143.10 },
      { time: '12:00', price: 142.30 }
    ]
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 385.20,
    change: 15.40,
    changePercent: 4.17,
    volume: '32.1M',
    marketCap: '2.9T',
    sector: 'Technology',
    high: 387.50,
    low: 382.10,
    open: 383.80,
    previousClose: 369.80,
    logoUrl: 'https://logo.clearbit.com/microsoft.com',
    chartData: [
      { time: '09:30', price: 383.80 },
      { time: '10:00', price: 384.50 },
      { time: '10:30', price: 385.20 },
      { time: '11:00', price: 386.10 },
      { time: '11:30', price: 385.80 },
      { time: '12:00', price: 385.20 }
    ]
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    price: 3450.75,
    change: 198.25,
    changePercent: 6.09,
    volume: '15.7M',
    marketCap: '1.7T',
    sector: 'E-commerce',
    high: 3465.20,
    low: 3420.50,
    open: 3430.80,
    previousClose: 3252.50,
    logoUrl: 'https://logo.clearbit.com/amazon.com',
    chartData: [
      { time: '09:30', price: 3430.80 },
      { time: '10:00', price: 3440.50 },
      { time: '10:30', price: 3445.20 },
      { time: '11:00', price: 3450.10 },
      { time: '11:30', price: 3448.80 },
      { time: '12:00', price: 3450.75 }
    ]
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 485.20,
    change: 32.15,
    changePercent: 7.10,
    volume: '52.1M',
    marketCap: '1.2T',
    sector: 'Technology',
    high: 488.50,
    low: 480.20,
    open: 482.10,
    previousClose: 453.05,
    logoUrl: 'https://logo.clearbit.com/nvidia.com',
    chartData: [
      { time: '09:30', price: 482.10 },
      { time: '10:00', price: 483.50 },
      { time: '10:30', price: 484.20 },
      { time: '11:00', price: 485.80 },
      { time: '11:30', price: 485.50 },
      { time: '12:00', price: 485.20 }
    ]
  },
  {
    symbol: 'META',
    name: 'Meta Platforms Inc.',
    price: 485.20,
    change: 15.30,
    changePercent: 3.26,
    volume: '18.2M',
    marketCap: '1.2T',
    sector: 'Technology',
    high: 488.50,
    low: 480.20,
    open: 482.10,
    previousClose: 469.90,
    logoUrl: 'https://logo.clearbit.com/meta.com',
    chartData: [
      { time: '09:30', price: 482.10 },
      { time: '10:00', price: 483.50 },
      { time: '10:30', price: 484.20 },
      { time: '11:00', price: 485.80 },
      { time: '11:30', price: 485.50 },
      { time: '12:00', price: 485.20 }
    ]
  },
  {
    symbol: 'NFLX',
    name: 'Netflix Inc.',
    price: 485.20,
    change: -8.45,
    changePercent: -1.71,
    volume: '12.8M',
    marketCap: '215B',
    sector: 'Entertainment',
    high: 495.20,
    low: 483.50,
    open: 492.10,
    previousClose: 493.65,
    logoUrl: 'https://logo.clearbit.com/netflix.com',
    chartData: [
      { time: '09:30', price: 492.10 },
      { time: '10:00', price: 490.50 },
      { time: '10:30', price: 488.20 },
      { time: '11:00', price: 486.80 },
      { time: '11:30', price: 485.50 },
      { time: '12:00', price: 485.20 }
    ]
  },
  {
    symbol: 'AMD',
    name: 'Advanced Micro Devices Inc.',
    price: 142.85,
    change: 8.45,
    changePercent: 6.29,
    volume: '45.8M',
    marketCap: '230B',
    sector: 'Technology',
    high: 145.20,
    low: 140.10,
    open: 141.50,
    previousClose: 134.40,
    logoUrl: 'https://logo.clearbit.com/amd.com',
    chartData: [
      { time: '09:30', price: 141.50 },
      { time: '10:00', price: 142.20 },
      { time: '10:30', price: 143.80 },
      { time: '11:00', price: 144.50 },
      { time: '11:30', price: 143.20 },
      { time: '12:00', price: 142.85 }
    ]
  },
  {
    symbol: 'INTC',
    name: 'Intel Corporation',
    price: 45.30,
    change: 1.85,
    changePercent: 4.26,
    volume: '28.9M',
    marketCap: '185B',
    sector: 'Technology',
    high: 46.10,
    low: 44.20,
    open: 44.80,
    previousClose: 43.45,
    logoUrl: 'https://logo.clearbit.com/intel.com',
    chartData: [
      { time: '09:30', price: 44.80 },
      { time: '10:00', price: 45.20 },
      { time: '10:30', price: 45.60 },
      { time: '11:00', price: 45.80 },
      { time: '11:30', price: 45.50 },
      { time: '12:00', price: 45.30 }
    ]
  },
  {
    symbol: 'CRM',
    name: 'Salesforce Inc.',
    price: 248.75,
    change: 12.40,
    changePercent: 5.25,
    volume: '8.2M',
    marketCap: '245B',
    sector: 'Technology',
    high: 251.20,
    low: 245.80,
    open: 247.10,
    previousClose: 236.35,
    logoUrl: 'https://logo.clearbit.com/salesforce.com',
    chartData: [
      { time: '09:30', price: 247.10 },
      { time: '10:00', price: 248.50 },
      { time: '10:30', price: 249.80 },
      { time: '11:00', price: 250.20 },
      { time: '11:30', price: 249.10 },
      { time: '12:00', price: 248.75 }
    ]
  },
  {
    symbol: 'ADBE',
    name: 'Adobe Inc.',
    price: 385.40,
    change: -8.20,
    changePercent: -2.08,
    volume: '3.5M',
    marketCap: '175B',
    sector: 'Technology',
    high: 392.80,
    low: 383.50,
    open: 390.20,
    previousClose: 393.60,
    logoUrl: 'https://logo.clearbit.com/adobe.com',
    chartData: [
      { time: '09:30', price: 390.20 },
      { time: '10:00', price: 388.50 },
      { time: '10:30', price: 386.80 },
      { time: '11:00', price: 385.20 },
      { time: '11:30', price: 386.10 },
      { time: '12:00', price: 385.40 }
    ]
  },
  {
    symbol: 'PYPL',
    name: 'PayPal Holdings Inc.',
    price: 62.15,
    change: 3.25,
    changePercent: 5.52,
    volume: '12.8M',
    marketCap: '68B',
    sector: 'Financial Services',
    high: 63.40,
    low: 60.80,
    open: 61.20,
    previousClose: 58.90,
    logoUrl: 'https://logo.clearbit.com/paypal.com',
    chartData: [
      { time: '09:30', price: 61.20 },
      { time: '10:00', price: 61.80 },
      { time: '10:30', price: 62.40 },
      { time: '11:00', price: 62.80 },
      { time: '11:30', price: 62.50 },
      { time: '12:00', price: 62.15 }
    ]
  },
  {
    symbol: 'UBER',
    name: 'Uber Technologies Inc.',
    price: 58.90,
    change: 2.15,
    changePercent: 3.79,
    volume: '15.2M',
    marketCap: '120B',
    sector: 'Transportation',
    high: 59.80,
    low: 57.50,
    open: 58.20,
    previousClose: 56.75,
    logoUrl: 'https://logo.clearbit.com/uber.com',
    chartData: [
      { time: '09:30', price: 58.20 },
      { time: '10:00', price: 58.60 },
      { time: '10:30', price: 59.20 },
      { time: '11:00', price: 59.50 },
      { time: '11:30', price: 59.10 },
      { time: '12:00', price: 58.90 }
    ]
  },
  {
    symbol: 'SPOT',
    name: 'Spotify Technology S.A.',
    price: 185.60,
    change: -4.20,
    changePercent: -2.21,
    volume: '2.8M',
    marketCap: '35B',
    sector: 'Entertainment',
    high: 189.80,
    low: 184.20,
    open: 188.50,
    previousClose: 189.80,
    logoUrl: 'https://logo.clearbit.com/spotify.com',
    chartData: [
      { time: '09:30', price: 188.50 },
      { time: '10:00', price: 187.20 },
      { time: '10:30', price: 186.50 },
      { time: '11:00', price: 185.80 },
      { time: '11:30', price: 186.20 },
      { time: '12:00', price: 185.60 }
    ]
  }
];

const mockStockData = mockStocks[0]; // Default to AAPL

const mockRecentTrades = [
  {
    id: 1,
    symbol: 'AAPL',
    name: 'Apple Inc.',
    type: 'BUY',
    quantity: 4,
    price: 175.50,
    total: 702.00,
    time: '01:53 AM',
    status: 'COMPLETED'
  },
  {
    id: 2,
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    type: 'BUY',
    quantity: 3,
    price: 142.30,
    total: 426.90,
    time: '12:45 PM',
    status: 'COMPLETED'
  },
  {
    id: 3,
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    type: 'BUY',
    quantity: 2,
    price: 245.80,
    total: 491.60,
    time: '11:30 AM',
    status: 'COMPLETED'
  },
  {
    id: 4,
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    type: 'BUY',
    quantity: 2,
    price: 415.50,
    total: 831.00,
    time: '10:15 AM',
    status: 'COMPLETED'
  },
  {
    id: 5,
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    type: 'BUY',
    quantity: 1,
    price: 485.20,
    total: 485.20,
    time: '09:45 AM',
    status: 'COMPLETED'
  },
  {
    id: 6,
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    type: 'BUY',
    quantity: 1,
    price: 3450.75,
    total: 3450.75,
    time: '09:30 AM',
    status: 'COMPLETED'
  },
  {
    id: 7,
    symbol: 'META',
    name: 'Meta Platforms Inc.',
    type: 'BUY',
    quantity: 2,
    price: 485.20,
    total: 970.40,
    time: '09:15 AM',
    status: 'COMPLETED'
  }
];

const TradePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, token, updateUser } = useAuth();
  
  // State management
  const [selectedStock, setSelectedStock] = useState(mockStockData);
  const [orderType, setOrderType] = useState('BUY');
  const [orderQuantity, setOrderQuantity] = useState('');
  const [orderPrice, setOrderPrice] = useState('');
  const [orderPriceType, setOrderPriceType] = useState('MARKET');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [recentTrades, setRecentTrades] = useState(mockRecentTrades);
  const [portfolioBalance, setPortfolioBalance] = useState(100000);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [filteredStocks, setFilteredStocks] = useState(mockStocks);
  const [showStockList, setShowStockList] = useState(false);
  const [favorites, setFavorites] = useState(new Set(['AAPL', 'TSLA']));
  const [hoveredStock, setHoveredStock] = useState(null);
  const [showMiniChart, setShowMiniChart] = useState(null);
  const [notification, setNotification] = useState(null);
  const [logoAttempts, setLogoAttempts] = useState({});
  const [algorithmRecommendations, setAlgorithmRecommendations] = useState([
    {
      algorithm: 'Moving Average Crossover',
      signal: 'BUY',
      confidence: 0.85,
      reasoning: 'Short MA (10) crossed above Long MA (30) with strong momentum',
      targetPrice: 185.50,
      stopLoss: 170.20,
      timeHorizon: '2-5 days'
    },
    {
      algorithm: 'RSI Mean Reversion',
      signal: 'HOLD',
      confidence: 0.45,
      reasoning: 'RSI at 52 - neutral zone, waiting for oversold/overbought conditions',
      targetPrice: null,
      stopLoss: null,
      timeHorizon: '1-3 days'
    },
    {
      algorithm: 'Bollinger Bands Strategy',
      signal: 'BUY',
      confidence: 0.78,
      reasoning: 'Price touching lower band - potential bounce opportunity',
      targetPrice: 182.30,
      stopLoss: 168.50,
      timeHorizon: '1-2 days'
    }
  ]);

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

  // Calculate order total
  const calculateOrderTotal = () => {
    const quantity = parseFloat(orderQuantity) || 0;
    const price = orderPriceType === 'MARKET' ? selectedStock.price : (parseFloat(orderPrice) || selectedStock.price);
    return quantity * price;
  };

  // Handle order submission
  const handleOrderSubmit = async () => {
    setLoading(true);
    try {
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const API_URL = isDevelopment ? 'http://localhost:3002' : 'https://hytrade-backend.onrender.com';
      
      const orderData = {
        stockSymbol: selectedStock.symbol,
        stockName: selectedStock.name,
        orderType: orderType,
        quantity: parseFloat(orderQuantity),
        price: orderPriceType === 'MARKET' ? selectedStock.price : (parseFloat(orderPrice) || selectedStock.price),
        orderMode: orderPriceType
      };

      const response = await fetch(`${API_URL}/api/trading/order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Order API Response:', result); // Debug log
      
      if (result.success) {
        // Add to recent trades
        // Create properly formatted time
        const now = new Date();
        const formattedTime = now.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
        
        const newTrade = {
          id: result.order?._id || Date.now(),
          symbol: selectedStock.symbol,
          name: selectedStock.name,
          type: orderType,
          quantity: parseFloat(orderQuantity),
          price: orderPriceType === 'MARKET' ? selectedStock.price : (parseFloat(orderPrice) || selectedStock.price),
          total: calculateOrderTotal(),
          time: formattedTime,
          status: result.order?.orderStatus || 'COMPLETED'
        };
        
        setRecentTrades([newTrade, ...recentTrades]);
        setShowPreview(false);
        
        // Reset form
        setOrderQuantity('');
        setOrderPrice('');
        
        // Refresh portfolio summary from server to keep balance authoritative
        try {
          await fetchPortfolioData();
        } catch {}
        
        // Show success message and trigger global refresh for holdings/orders
        showNotification(`✅ ${orderType} order for ${selectedStock.symbol} executed successfully!`, 'success');
        try { triggerRefresh(); } catch {}
      } else {
        throw new Error(result.message || 'Failed to place order');
      }
      
    } catch (error) {
      console.error('Order submission error:', error);
      
      // Better error handling
      let errorMessage = 'Failed to place order';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response) {
        errorMessage = `Server error: ${error.response.status}`;
      } else if (error.name === 'TypeError') {
        errorMessage = 'Network error: Please check your connection';
      }
      
      showNotification(`❌ Order failed: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch portfolio balance and recent trades
  const fetchPortfolioData = async () => {
    try {
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const API_URL = isDevelopment ? 'http://localhost:3002' : 'https://hytrade-backend.onrender.com';
      
      // Fetch portfolio summary
      const portfolioResponse = await fetch(`${API_URL}/api/trading/portfolio/summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (portfolioResponse.ok) {
        const portfolioResult = await portfolioResponse.json();
        if (portfolioResult.success) {
          const latestBalance = portfolioResult.data.accountBalance || 100000;
          setPortfolioBalance(latestBalance);
          // Keep global user state in sync for consistent display across pages
          if (updateUser) {
            updateUser({ ...user, accountBalance: latestBalance });
          }
        }
      }

      // Fetch recent orders
      const ordersResponse = await fetch(`${API_URL}/api/trading/orders?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (ordersResponse.ok) {
        const ordersResult = await ordersResponse.json();
        if (ordersResult.success) {
          const formattedTrades = ordersResult.data.orders.map(order => {
            // Handle date formatting with error checking
            let formattedTime = 'Invalid Date';
            try {
              const orderDate = new Date(order.createdAt || order.orderDate || Date.now());
              if (!isNaN(orderDate.getTime())) {
                formattedTime = orderDate.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                });
              }
            } catch (error) {
              console.warn('Date formatting error for order:', order._id, error);
            }
            
            return {
              id: order._id,
              symbol: order.stockSymbol,
              name: order.stockName,
              type: order.orderType,
              quantity: order.quantity,
              price: order.price,
              total: order.quantity * order.price,
              time: formattedTime,
              status: order.orderStatus || 'COMPLETED'
            };
          });
          setRecentTrades(formattedTrades);
        }
      }
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (token) {
      fetchPortfolioData();
    }
  }, [token]);

  // Close stock list when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showStockList && !event.target.closest('.stock-search-container')) {
        setShowStockList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStockList]);

  // Handle stock search
  const handleStockSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredStocks(mockStocks);
      setShowStockList(false);
    } else {
      const filtered = mockStocks.filter(stock => 
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredStocks(filtered);
      setShowStockList(true);
    }
  };

  // Handle stock selection
  const handleStockSelect = (stock) => {
    setSelectedStock(stock);
    setSearchQuery(stock.symbol);
    setShowStockList(false);
    // Reset order form when stock changes
    setOrderQuantity('');
    setOrderPrice('');
  };

  // Toggle favorite
  const toggleFavorite = (symbol) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(symbol)) {
      newFavorites.delete(symbol);
    } else {
      newFavorites.add(symbol);
    }
    setFavorites(newFavorites);
  };

  // Get stock performance color
  const getPerformanceColor = (changePercent) => {
    if (changePercent > 5) return 'success.main';
    if (changePercent > 0) return 'success.light';
    if (changePercent > -5) return 'error.light';
    return 'error.main';
  };

  // Get stock performance intensity
  const getPerformanceIntensity = (changePercent) => {
    return Math.min(Math.abs(changePercent) / 10, 1);
  };

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Get logo URL with fallbacks
  const getLogoUrl = (symbol) => {
    const logoUrls = {
      'AAPL': [
        'https://logo.clearbit.com/apple.com',
        'https://companieslogo.com/img/orig/AAPL-7c4a9e4f.png',
        'https://storage.googleapis.com/iex/api/logos/AAPL.png'
      ],
      'TSLA': [
        'https://logo.clearbit.com/tesla.com',
        'https://companieslogo.com/img/orig/TSLA-7c4a9e4f.png',
        'https://storage.googleapis.com/iex/api/logos/TSLA.png'
      ],
      'GOOGL': [
        'https://static.dezeen.com/uploads/2025/05/sq-google-g-logo-update_dezeen_2364_col_0-852x852.jpg',
        'https://logo.clearbit.com/google.com',
        'https://logo.clearbit.com/alphabet.com',
        'https://companieslogo.com/img/orig/GOOGL-7c4a9e4f.png',
        'https://storage.googleapis.com/iex/api/logos/GOOGL.png'
      ],
      'MSFT': [
        'https://logo.clearbit.com/microsoft.com',
        'https://companieslogo.com/img/orig/MSFT-7c4a9e4f.png',
        'https://storage.googleapis.com/iex/api/logos/MSFT.png'
      ],
      'AMZN': [
        'https://logo.clearbit.com/amazon.com',
        'https://companieslogo.com/img/orig/AMZN-7c4a9e4f.png',
        'https://storage.googleapis.com/iex/api/logos/AMZN.png'
      ],
      'NVDA': [
        'https://logo.clearbit.com/nvidia.com',
        'https://companieslogo.com/img/orig/NVDA-7c4a9e4f.png',
        'https://storage.googleapis.com/iex/api/logos/NVDA.png'
      ],
      'META': [
        'https://logo.clearbit.com/meta.com',
        'https://companieslogo.com/img/orig/META-7c4a9e4f.png',
        'https://storage.googleapis.com/iex/api/logos/META.png'
      ],
      'NFLX': [
        'https://logo.clearbit.com/netflix.com',
        'https://companieslogo.com/img/orig/NFLX-7c4a9e4f.png',
        'https://storage.googleapis.com/iex/api/logos/NFLX.png'
      ],
      'AMD': [
        'https://logo.clearbit.com/amd.com',
        'https://companieslogo.com/img/orig/AMD-7c4a9e4f.png',
        'https://storage.googleapis.com/iex/api/logos/AMD.png'
      ],
      'INTC': [
        'https://logo.clearbit.com/intel.com',
        'https://companieslogo.com/img/orig/INTC-7c4a9e4f.png',
        'https://storage.googleapis.com/iex/api/logos/INTC.png'
      ],
      'CRM': [
        'https://logo.clearbit.com/salesforce.com',
        'https://companieslogo.com/img/orig/CRM-7c4a9e4f.png',
        'https://storage.googleapis.com/iex/api/logos/CRM.png'
      ],
      'ADBE': [
        'https://logo.clearbit.com/adobe.com',
        'https://companieslogo.com/img/orig/ADBE-7c4a9e4f.png',
        'https://storage.googleapis.com/iex/api/logos/ADBE.png'
      ],
      'PYPL': [
        'https://logo.clearbit.com/paypal.com',
        'https://companieslogo.com/img/orig/PYPL-7c4a9e4f.png',
        'https://storage.googleapis.com/iex/api/logos/PYPL.png'
      ],
      'UBER': [
        'https://logo.clearbit.com/uber.com',
        'https://companieslogo.com/img/orig/UBER-7c4a9e4f.png',
        'https://storage.googleapis.com/iex/api/logos/UBER.png'
      ],
      'SPOT': [
        'https://logo.clearbit.com/spotify.com',
        'https://companieslogo.com/img/orig/SPOT-7c4a9e4f.png',
        'https://storage.googleapis.com/iex/api/logos/SPOT.png'
      ]
    };
    
    return logoUrls[symbol] || [`https://logo.clearbit.com/${symbol.toLowerCase()}.com`];
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h6" color="primary.main">
            {formatCurrency(payload[0].value)}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Notification */}
      {notification && (
        <Box
          sx={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            p: 2,
            borderRadius: 2,
            backgroundColor: notification.type === 'success' ? 'success.main' : 'error.main',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            animation: 'slideInRight 0.3s ease-out',
            maxWidth: 400,
            wordWrap: 'break-word'
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {notification.message}
          </Typography>
        </Box>
      )}

      {/* Add CSS animations */}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(100px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          .stock-card {
            animation: slideInUp 0.6s ease-out;
          }
        `}
      </style>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        p: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 3,
        color: 'white'
      }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <FlashOnIcon sx={{ mr: 1, fontSize: 32 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              Trade Center
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Execute trades and manage your positions with lightning speed
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh Data">
            <IconButton 
              onClick={fetchPortfolioData}
              sx={{ 
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  transform: 'rotate(180deg)',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Live Market Data">
            <IconButton 
              sx={{ 
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)'
                }
              }}
            >
              <SpeedIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: 'flex-start' }}>
        {/* Algorithm Recommendations - HIDDEN FOR NOW */}
        {/* <Grid xs={12}>
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title="Algorithm Recommendations"
              subheader="AI-powered trading signals for your selected stock"
              action={
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={<PsychologyIcon />}
                >
                  View All Algorithms
                </Button>
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                {algorithmRecommendations.map((rec, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        border: '1px solid',
                        borderColor: rec.signal === 'BUY' ? 'success.main' : 
                                     rec.signal === 'SELL' ? 'error.main' : 'warning.main',
                        backgroundColor: rec.signal === 'BUY' ? 'success.light' : 
                                         rec.signal === 'SELL' ? 'error.light' : 'warning.light',
                        '&:hover': {
                          boxShadow: 2,
                          transform: 'translateY(-2px)',
                          transition: 'all 0.2s ease-in-out'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {rec.algorithm}
                        </Typography>
                        <Chip 
                          label={rec.signal}
                          size="small"
                          color={rec.signal === 'BUY' ? 'success' : 
                                 rec.signal === 'SELL' ? 'error' : 'warning'}
                          variant="filled"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {rec.reasoning}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Confidence
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {(rec.confidence * 100).toFixed(0)}%
                        </Typography>
                      </Box>
                      
                      <LinearProgress 
                        variant="determinate" 
                        value={rec.confidence * 100}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          mb: 1,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: rec.signal === 'BUY' ? 'success.main' : 
                                             rec.signal === 'SELL' ? 'error.main' : 'warning.main',
                          },
                        }}
                      />
                      
                      {rec.targetPrice && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            Target: {formatCurrency(rec.targetPrice)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Stop: {formatCurrency(rec.stopLoss)}
                          </Typography>
                        </Box>
                      )}
                      
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        Time Horizon: {rec.timeHorizon}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid> */}

        {/* Right: Stock List (scrolling) */}
        <Box sx={{ order: { xs: 2, md: 2 }, flexGrow: 1, minWidth: 0, minHeight: '100vh' }}>
          {/* Popular Stocks List */}
          <Card>
            <CardHeader
              title="Popular Stocks"
              subheader="Trade directly from the list below"
              sx={{
                position: 'sticky',
                top: { xs: 12, md: 80 },
                zIndex: 2,
                backgroundColor: 'background.paper',
                borderBottom: '1px solid',
                borderColor: 'divider',
                boxShadow: 1
              }}
            />
            <CardContent sx={{ pt: 5 }}>
              {mockStocks.map((stock, index) => (
                <Paper
                  key={stock.symbol}
                  className="stock-card"
                  onMouseEnter={() => setHoveredStock(stock.symbol)}
                  onMouseLeave={() => setHoveredStock(null)}
                  sx={{
                    mt: index === 0 ? 5 : 0,
                    p: 2.5,
                    mb: 2,
                    border: '1px solid',
                    borderColor: hoveredStock === stock.symbol ? 'primary.main' : 'divider',
                    borderRadius: 3,
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: '120px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                      transform: 'translateY(-2px)',
                      '& .stock-actions': {
                        opacity: 1,
                        transform: 'translateX(0)'
                      }
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: `linear-gradient(90deg, ${getPerformanceColor(stock.changePercent)} 0%, ${getPerformanceColor(stock.changePercent)} 100%)`,
                      opacity: getPerformanceIntensity(stock.changePercent)
                    }
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    {/* Stock Info */}
                    <Grid xs={12} md={8}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: 'grey.100', 
                            mr: 2, 
                            width: 56, 
                            height: 56,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            border: '2px solid',
                            borderColor: 'divider',
                            overflow: 'hidden',
                            '& img': {
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              objectPosition: 'center'
                            }
                          }}
                          src={getLogoUrl(stock.symbol)[0]}
                          alt={`${stock.name} logo`}
                          onError={(e) => {
                            const symbol = stock.symbol;
                            const currentAttempt = logoAttempts[symbol] || 0;
                            const logoUrls = getLogoUrl(symbol);
                            
                            if (currentAttempt < logoUrls.length - 1) {
                              // Try next fallback URL
                              setLogoAttempts(prev => ({
                                ...prev,
                                [symbol]: currentAttempt + 1
                              }));
                              e.target.src = logoUrls[currentAttempt + 1];
                            } else {
                              // All URLs failed, show initials
                              e.target.style.display = 'none';
                              const fallback = e.target.parentElement.querySelector('.logo-fallback');
                              if (fallback) fallback.style.display = 'flex';
                            }
                          }}
                        >
                          <Box 
                            className="logo-fallback"
                            sx={{ 
                              display: 'none',
                              width: '100%',
                              height: '100%',
                              backgroundColor: 'primary.main',
                              color: 'white',
                              fontSize: '1.5rem',
                              fontWeight: 700,
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {(stock.name?.charAt(0) || stock.symbol.charAt(0))}
                          </Box>
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '1.4rem', textTransform: 'uppercase' }}>
                              {stock.name}
                            </Typography>
                            <Chip label={stock.symbol} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                            {favorites.has(stock.symbol) && (
                              <FavoriteIcon color="error" sx={{ fontSize: 20 }} />
                            )}
                            {stock.changePercent > 5 && (
                              <Chip 
                                label="HOT" 
                                size="small" 
                                color="error" 
                                sx={{ 
                                  fontWeight: 600,
                                  animation: 'pulse 2s infinite'
                                }} 
                              />
                            )}
                          </Box>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              fontWeight: 500,
                              fontSize: '0.85rem',
                              lineHeight: 1.3,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              maxHeight: '2.6em'
                            }}
                          >
                            {stock.name}
                          </Typography>
                        </Box>
                        
                        {/* Stock Actions */}
                        <Box 
                          className="stock-actions"
                          sx={{
                            display: 'flex',
                            gap: 0.5,
                            opacity: 0,
                            transform: 'translateX(10px)',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <IconButton 
                            size="small"
                            onClick={() => toggleFavorite(stock.symbol)}
                            sx={{ 
                              color: favorites.has(stock.symbol) ? 'error.main' : 'text.secondary',
                              '&:hover': { backgroundColor: 'action.hover' }
                            }}
                          >
                            {favorites.has(stock.symbol) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                          </IconButton>
                          <IconButton size="small" sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                            <ShareIcon />
                          </IconButton>
                          <IconButton size="small" sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                            <MoreVertIcon />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        <Chip 
                          label={stock.sector} 
                          color="primary" 
                          variant="outlined" 
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                        <Chip 
                          label={`Market Cap: ${stock.marketCap}`} 
                          variant="outlined" 
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                        <Chip 
                          label={`Volume: ${stock.volume}`} 
                          variant="outlined" 
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                        {stock.changePercent > 0 && (
                          <Chip 
                            label="Bullish" 
                            color="success" 
                            size="small"
                            icon={<TrendingUpIcon />}
                            sx={{ fontWeight: 600 }}
                          />
                        )}
                        {stock.changePercent < 0 && (
                          <Chip 
                            label="Bearish" 
                            color="error" 
                            size="small"
                            icon={<TrendingDownIcon />}
                            sx={{ fontWeight: 600 }}
                          />
                        )}
                      </Box>

                      <Grid container spacing={2}>
                        <Grid xs={6} sm={3}>
                          <Typography variant="body2" color="text.secondary">
                            High
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {formatCurrency(stock.high)}
                          </Typography>
                        </Grid>
                        <Grid xs={6} sm={3}>
                          <Typography variant="body2" color="text.secondary">
                            Low
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {formatCurrency(stock.low)}
                          </Typography>
                        </Grid>
                        <Grid xs={6} sm={3}>
                          <Typography variant="body2" color="text.secondary">
                            Open
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {formatCurrency(stock.open)}
                          </Typography>
                        </Grid>
                        <Grid xs={6} sm={3}>
                          <Typography variant="body2" color="text.secondary">
                            Prev Close
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {formatCurrency(stock.previousClose)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>

                    {/* Price & Summary */}
                    <Grid xs={12} md={4}>
                      <Box sx={{ textAlign: { xs: 'left', md: 'right' }, width: '100%' }}>
                        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                          {formatCurrency(stock.price)}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'flex-end' }, mb: 3 }}>
                          {stock.change >= 0 ? (
                            <TrendingUpIcon color="success" sx={{ mr: 0.5 }} />
                          ) : (
                            <TrendingDownIcon color="error" sx={{ mr: 0.5 }} />
                          )}
                          <Typography
                            variant="h6"
                            color={stock.change >= 0 ? 'success.main' : 'error.main'}
                            sx={{ fontWeight: 500 }}
                          >
                            {formatCurrency(stock.change)} ({formatPercentage(stock.changePercent)})
                          </Typography>
                        </Box>

                      </Box>
                    </Grid>
                    {/* Full-width Quick Trading Buttons spanning card */}
                    <Grid xs={12}>
                      <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<TrendingUpIcon />}
                          onClick={() => {
                            setSelectedStock(stock);
                            setOrderType('BUY');
                            setShowPreview(true);
                          }}
                          sx={{ 
                            flexGrow: 1,
                            py: 1.5,
                            fontWeight: 700,
                            fontSize: '1rem',
                            borderRadius: 2,
                            background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
                            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #388e3c 30%, #4caf50 90%)',
                              boxShadow: '0 6px 16px rgba(76, 175, 80, 0.4)',
                              transform: 'translateY(-1px)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          Buy
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<TrendingDownIcon />}
                          onClick={() => {
                            setSelectedStock(stock);
                            setOrderType('SELL');
                            setShowPreview(true);
                          }}
                          sx={{ 
                            flexGrow: 1,
                            py: 1.5,
                            fontWeight: 700,
                            fontSize: '1rem',
                            borderRadius: 2,
                            background: 'linear-gradient(45deg, #f44336 30%, #ef5350 90%)',
                            boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #d32f2f 30%, #f44336 90%)',
                              boxShadow: '0 6px 16px rgba(244, 67, 54, 0.4)',
                              transform: 'translateY(-1px)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          Sell
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </CardContent>
          </Card>
        </Box>

        {/* Left: Portfolio Balance + Recent Trades (sticky) */}
        <Box sx={{ order: { xs: 1, md: 1 }, width: { xs: '100%', md: 360 }, flexShrink: 0 }}>
          <Box sx={{ position: 'sticky', top: { xs: 12, md: 80 }, height: 'fit-content' }}>
          {/* Portfolio Balance */}
          <Card sx={{ 
            mb: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100px',
              height: '100px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              transform: 'translate(30px, -30px)'
            }
          }}>
            <CardHeader
              title="Portfolio Balance"
              avatar={
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <AccountBalanceIcon />
                </Avatar>
              }
              sx={{ color: 'white' }}
            />
            <CardContent>
              <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                  {formatCurrency(user?.accountBalance ?? portfolioBalance)}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                  Available for trading
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
                  <Chip 
                    label="Live" 
                    color="success" 
                    size="small"
                    sx={{ 
                      backgroundColor: 'rgba(76, 175, 80, 0.2)',
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                  <Chip 
                    label="Active" 
                    color="primary" 
                    size="small"
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Recent Trades */}
          <Card>
            <CardHeader
              title="Recent Trades"
              subheader="Your latest transactions"
            />
            <CardContent>
              <List>
                {recentTrades.map((trade) => (
                  <ListItem key={trade.id} divider>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="body1" sx={{ fontWeight: 500 }} component="span">
                            {trade.symbol}
                          </Typography>
                          <Chip
                            label={trade.status}
                            size="small"
                            color={
                              trade.status === 'COMPLETED' || trade.status === 'FILLED' 
                                ? 'success' 
                                : trade.status === 'PENDING' 
                                  ? 'warning' 
                                  : 'error'
                            }
                            variant="filled"
                            sx={{
                              fontWeight: 600,
                              '&.MuiChip-colorSuccess': {
                                backgroundColor: '#4caf50',
                                color: 'white'
                              },
                              '&.MuiChip-colorWarning': {
                                backgroundColor: '#ff9800',
                                color: 'white'
                              },
                              '&.MuiChip-colorError': {
                                backgroundColor: '#f44336',
                                color: 'white'
                              }
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary" component="span" sx={{ display: 'block' }}>
                            {trade.type} {trade.quantity} shares @ {formatCurrency(trade.price)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" component="span" sx={{ display: 'block' }}>
                            Total: {formatCurrency(trade.total)} • {trade.time}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
          </Box>
        </Box>
      </Box>

      {/* Order Preview Dialog */}
      <Dialog open={showPreview} onClose={() => setShowPreview(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <InfoIcon color="primary" sx={{ mr: 1 }} />
            {orderType} {selectedStock.symbol}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Configure your {orderType.toLowerCase()} order for {selectedStock.symbol}
          </Alert>
          
          {/* Stock Info */}
          <Paper sx={{ p: 2, mb: 3, backgroundColor: 'background.default' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                {selectedStock.symbol.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {selectedStock.symbol}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedStock.name}
                </Typography>
              </Box>
              <Box sx={{ ml: 'auto', textAlign: 'right' }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {formatCurrency(selectedStock.price)}
                </Typography>
                <Typography
                  variant="body2"
                  color={selectedStock.change >= 0 ? 'success.main' : 'error.main'}
                >
                  {formatCurrency(selectedStock.change)} ({formatPercentage(selectedStock.changePercent)})
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Order Configuration */}
          <Grid container spacing={2}>
            <Grid xs={12}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">Shares</InputAdornment>,
                }}
                helperText="Enter the number of shares to trade"
              />
            </Grid>
            
            <Grid xs={12}>
              <FormControl fullWidth>
                <InputLabel>Price Type</InputLabel>
                <Select
                  value={orderPriceType}
                  onChange={(e) => setOrderPriceType(e.target.value)}
                  label="Price Type"
                >
                  <MenuItem value="MARKET">Market Price ({formatCurrency(selectedStock.price)})</MenuItem>
                  <MenuItem value="LIMIT">Limit Price</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {orderPriceType === 'LIMIT' && (
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Limit Price"
                  type="number"
                  value={orderPrice}
                  onChange={(e) => setOrderPrice(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
            )}

            <Grid xs={12}>
              <Divider sx={{ my: 1 }} />
              <Paper sx={{ p: 2, backgroundColor: 'background.default' }}>
                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Order Type:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {orderType}
                    </Typography>
                  </Grid>
                  <Grid xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Quantity:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {orderQuantity || '0'} shares
                    </Typography>
                  </Grid>
                  <Grid xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Price:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {orderPriceType === 'MARKET' 
                        ? formatCurrency(selectedStock.price) 
                        : formatCurrency(parseFloat(orderPrice) || selectedStock.price)
                      }
                    </Typography>
                  </Grid>
                  <Grid xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total:
                    </Typography>
                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                      {formatCurrency(calculateOrderTotal())}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleOrderSubmit}
            disabled={loading || !orderQuantity || parseFloat(orderQuantity) <= 0}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            color={orderType === 'BUY' ? 'success' : 'error'}
          >
            {loading ? 'Processing...' : `Confirm ${orderType} Order`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TradePage;
