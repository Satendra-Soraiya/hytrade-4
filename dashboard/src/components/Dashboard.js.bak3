import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { portfolioAPI, marketAPI, fundsAPI } from "../services/api";
import { formatCurrency } from "../utils/formatters";
import LeftSidebar from "./LeftSidebar";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  Box,
  Paper,
  Divider,
  Avatar,
  Badge
} from "@mui/material";
import {
  Menu as MenuIcon,
  AccountCircle,
  Notifications,
  ArrowDropDown,
  Search as SearchIcon,
  Add,
  Dashboard as DashboardIcon,
  ShowChart,
  AccountBalanceWallet,
  Receipt,
  Assessment,
  Settings,
  HelpOutline,
  Logout
} from "@mui/icons-material";

import Apps from "./Apps";
import Funds from "./Funds";
import Holdings from "./Holdings";
import Orders from "./Orders";
import Positions from "./Positions";
import Summary from "./Summary";

import Trade from "./Trade";
import { GeneralContextProvider } from "./GeneralContext";
import "./Dashboard.css";

// Tab panel component
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    const basePath = location.pathname.split('/').slice(0, -1).join('/');
    switch(newValue) {
      case 0: 
        navigate(basePath); 
        break;
      case 1: 
        navigate(`${basePath}/orders`); 
        break;
      case 2: 
        navigate(`${basePath}/holdings`); 
        break;
      case 3: 
        navigate(`${basePath}/positions`); 
        break;
      case 4: 
        navigate(`${basePath}/funds`); 
        break;
      default: 
        navigate(basePath);
    }
  };
  
  // Update tab value when route changes
  useEffect(() => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    
    switch(lastSegment) {
      case 'orders':
        setTabValue(1);
        break;
      case 'holdings':
        setTabValue(2);
        break;
      case 'positions':
        setTabValue(3);
        break;
      case 'funds':
        setTabValue(4);
        break;
      default:
        setTabValue(0);
    }
  }, [location]);
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };
  
  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };
  
  const menuId = 'primary-search-account-menu';
  const mobileMenuId = 'primary-search-account-menu-mobile';
  const [holdings, setHoldings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [positions, setPositions] = useState([]);
  const [funds, setFunds] = useState({
    available: 0,
    used: 0,
    total: 0
  });
  const [watchlist, setWatchlist] = useState([]);
  const [tradeSymbol, setTradeSymbol] = useState('');
  const [tradePrice, setTradePrice] = useState('');
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [isLoading, setIsLoading] = useState({
    holdings: true,
    orders: true,
    positions: true,
    funds: true,
    watchlist: true
  });
  const [error, setError] = useState(null);

  // Comprehensive mock data for all sections
  const currentDate = new Date();
  const oneDay = 24 * 60 * 60 * 1000; // One day in milliseconds
  
  // Enhanced mock watchlist data with more stocks and additional fields
  const mockWatchlist = [
    { 
      symbol: 'RELIANCE', 
      name: 'Reliance Industries Ltd', 
      lastPrice: 2456.50, 
      change: 12.50, 
      changePercent: 0.51, 
      dayHigh: 2475.25,
      dayLow: 2435.75,
      volume: '5.2M',
      marketCap: '16.5T',
      peRatio: 28.5,
      sector: 'Energy',
      addedAt: new Date(currentDate - 5 * oneDay),
      isFavorite: true,
      alerts: []
    },
    { 
      symbol: 'HDFCBANK', 
      name: 'HDFC Bank Ltd', 
      lastPrice: 1650.25, 
      change: -5.75, 
      changePercent: -0.35,
      dayHigh: 1665.50,
      dayLow: 1642.80,
      volume: '3.8M',
      marketCap: '12.8T',
      peRatio: 22.3,
      sector: 'Banking',
      addedAt: new Date(currentDate - 10 * oneDay),
      isFavorite: true,
      alerts: [{ type: 'price', target: 1700, condition: 'above' }]
    },
    { 
      symbol: 'TCS', 
      name: 'Tata Consultancy Services Ltd', 
      lastPrice: 3250.80, 
      change: 25.30, 
      changePercent: 0.78,
      dayHigh: 3265.40,
      dayLow: 3220.10,
      volume: '2.1M',
      marketCap: '11.9T',
      peRatio: 35.2,
      sector: 'IT',
      addedAt: new Date(currentDate - 15 * oneDay),
      isFavorite: true,
      alerts: []
    },
    { 
      symbol: 'INFY', 
      name: 'Infosys Ltd', 
      lastPrice: 1450.60, 
      change: -12.40, 
      changePercent: -0.85,
      dayHigh: 1475.25,
      dayLow: 1442.30,
      volume: '4.5M',
      marketCap: '6.1T',
      peRatio: 30.8,
      sector: 'IT',
      addedAt: new Date(currentDate - 8 * oneDay),
      isFavorite: false,
      alerts: []
    },
    { 
      symbol: 'HINDUNILVR', 
      name: 'Hindustan Unilever Ltd', 
      lastPrice: 2650.90, 
      change: 5.20, 
      changePercent: 0.20,
      dayHigh: 2675.50,
      dayLow: 2635.25,
      volume: '1.8M',
      marketCap: '6.2T',
      peRatio: 65.4,
      sector: 'FMCG',
      addedAt: new Date(currentDate - 12 * oneDay),
      isFavorite: false,
      alerts: []
    },
    { 
      symbol: 'BHARTIARTL', 
      name: 'Bharti Airtel Ltd', 
      lastPrice: 785.45, 
      change: 8.75, 
      changePercent: 1.13,
      dayHigh: 792.20,
      dayLow: 778.90,
      volume: '3.2M',
      marketCap: '4.4T',
      peRatio: 82.5,
      sector: 'Telecom',
      addedAt: new Date(currentDate - 7 * oneDay),
      isFavorite: true,
      alerts: [{ type: 'price', target: 800, condition: 'above' }]
    }
  ];

  // Enhanced mock funds data with more detailed breakdown
  const mockFunds = {
    available: 125000.75,
    used: 25000.25,
    total: 150000.00,
    invested: 87500.50,
    pnl: 12500.25,
    pnlPercent: 16.67,
    lastUpdated: new Date(currentDate - 3600000), // 1 hour ago
    accounts: {
      equity: {
        available: 85000.25,
        used: 18000.50,
        total: 103000.75,
        marginUsed: 0.65
      },
      commodity: {
        available: 40000.50,
        used: 7000.75,
        total: 47000.25,
        marginUsed: 0.35
      }
    },
    margin: {
      available: 150000.00,
      used: 25000.25,
      total: 175000.25,
      utilization: 14.29
    },
    today: {
      pnl: 1250.50,
      pnlPercent: 0.83,
      trades: 8,
      brokerage: 250.75
    },
    lastSettlement: {
      date: new Date(currentDate - 2 * oneDay),
      amount: 5000.00,
      status: 'processed'
    },
    limits: {
      intraday: 200000.00,
      delivery: 150000.00,
      exposure: 350000.00
    },
    collateral: {
      value: 87500.50,
      haircut: 0.70,
      available: 61250.35
    },
    currency: 'INR',
    lastRefreshed: new Date()
  };

  // Enhanced mock holdings data with more details
  const mockHoldings = [
    {
      symbol: 'RELIANCE',
      name: 'Reliance Industries Ltd',
      quantity: 15,
      avgPrice: 2300.00,
      ltp: 2456.50,
      currentValue: 36847.50,
      investment: 34500.00,
      pnl: 2349.75,
      pnlPercent: 6.80,
      dayChange: 187.50,
      dayChangePercent: 0.51,
      sector: 'Energy',
      isin: 'INE002A01018',
      lastTraded: new Date(currentDate - 3600000), // 1 hour ago
      exchange: 'NSE',
      collateral: 0.7,
      pledgedQty: 0,
      t1Quantity: 0,
      realizedPnl: 1250.25,
      unrealizedPnl: 1099.50,
      buyValue: 34500.00,
      lastPrice: 2456.50,
      closePrice: 2444.00,
      yearHigh: 2850.75,
      yearLow: 2100.25,
      weekHighLow: {
        high: 2480.50,
        low: 2350.00
      },
      avgCost: 2300.00,
      totalCost: 34500.00,
      marketValue: 36847.50
    },
    {
      symbol: 'TCS',
      name: 'Tata Consultancy Services Ltd',
      quantity: 10,
      avgPrice: 3100.00,
      ltp: 3250.80,
      currentValue: 32508.00,
      investment: 31000.00,
      pnl: 1508.00,
      pnlPercent: 4.86,
      dayChange: 150.80,
      dayChangePercent: 0.78,
      sector: 'IT',
      isin: 'INE467B01029',
      lastTraded: new Date(currentDate - 7200000), // 2 hours ago
      exchange: 'NSE',
      collateral: 0.65,
      pledgedQty: 0,
      t1Quantity: 0,
      realizedPnl: 850.50,
      unrealizedPnl: 657.50,
      buyValue: 31000.00,
      lastPrice: 3250.80,
      closePrice: 3100.00,
      yearHigh: 3400.00,
      yearLow: 2800.50,
      weekHighLow: {
        high: 3280.00,
        low: 3050.25
      },
      avgCost: 3100.00,
      totalCost: 31000.00,
      marketValue: 32508.00
    },
    {
      symbol: 'HDFCBANK',
      name: 'HDFC Bank Ltd',
      quantity: 5,
      avgPrice: 1500.00,
      ltp: 1650.25,
      currentValue: 8251.25,
      investment: 7500.00,
      pnl: 751.25,
      pnlPercent: 10.02,
      dayChange: -28.75,
      dayChangePercent: -0.35,
      sector: 'Banking',
      isin: 'INE040A01034',
      lastTraded: new Date(currentDate - 10800000), // 3 hours ago
      exchange: 'NSE',
      collateral: 0.75,
      pledgedQty: 0,
      t1Quantity: 0,
      realizedPnl: 420.75,
      unrealizedPnl: 330.50,
      buyValue: 7500.00,
      lastPrice: 1650.25,
      closePrice: 1679.00,
      yearHigh: 1800.50,
      yearLow: 1350.25,
      weekHighLow: {
        high: 1680.00,
        low: 1620.50
      },
      avgCost: 1500.00,
      totalCost: 7500.00,
      marketValue: 8251.25
    },
    {
      symbol: 'INFY',
      name: 'Infosys Ltd',
      quantity: 20,
      avgPrice: 1400.00,
      ltp: 1450.60,
      currentValue: 29012.00,
      investment: 28000.00,
      pnl: 1012.00,
      pnlPercent: 3.61,
      dayChange: -124.00,
      dayChangePercent: -0.85,
      sector: 'IT',
      isin: 'INE009A01021',
      lastTraded: new Date(currentDate - 5400000), // 1.5 hours ago
      exchange: 'NSE',
      collateral: 0.6,
      pledgedQty: 0,
      t1Quantity: 0,
      realizedPnl: 600.00,
      unrealizedPnl: 412.00,
      buyValue: 28000.00,
      lastPrice: 1450.60,
      closePrice: 1450.60,
      yearHigh: 1800.00,
      yearLow: 1250.00,
      weekHighLow: {
        high: 1480.00,
        low: 1400.00
      },
      avgCost: 1400.00,
      totalCost: 28000.00,
      marketValue: 29012.00
    }
  ];

  // Enhanced mock orders data with more details
  const mockOrders = [
    {
      id: 'ORD' + Math.floor(10000 + Math.random() * 90000),
      symbol: 'RELIANCE',
      name: 'Reliance Industries Ltd',
      type: 'BUY',
      quantity: 5,
      price: 2400.00,
      status: 'COMPLETE',
      filledQty: 5,
      pendingQty: 0,
      orderType: 'LIMIT',
      product: 'CNC',
      validity: 'DAY',
      triggerPrice: 0,
      disclosedQty: 5,
      orderTimestamp: new Date(currentDate - 86400000), // 1 day ago
      exchange: 'NSE',
      exchangeOrderId: 'NSE' + Math.floor(10000000 + Math.random() * 90000000),
      parentOrderId: null,
      placedBy: 'WEB',
      statusMessage: 'Order filled',
      tags: ['intraday'],
      averagePrice: 2399.75,
      exchangeTimestamp: new Date(currentDate - 86395000)
    },
    {
      id: 'ORD' + Math.floor(10000 + Math.random() * 90000),
      symbol: 'TCS',
      name: 'Tata Consultancy Services Ltd',
      type: 'SELL',
      quantity: 3,
      price: 3200.00,
      status: 'PENDING',
      filledQty: 0,
      pendingQty: 3,
      orderType: 'LIMIT',
      product: 'MIS',
      validity: 'DAY',
      triggerPrice: 0,
      disclosedQty: 3,
      orderTimestamp: new Date(currentDate - 3600000), // 1 hour ago
      exchange: 'NSE',
      exchangeOrderId: 'NSE' + Math.floor(10000000 + Math.random() * 90000000),
      parentOrderId: null,
      placedBy: 'WEB',
      statusMessage: 'Order pending',
      tags: ['swing'],
      averagePrice: 0,
      exchangeTimestamp: null
    },
    {
      id: 'ORD' + Math.floor(10000 + Math.random() * 90000),
      symbol: 'INFY',
      name: 'Infosys Ltd',
      type: 'BUY',
      quantity: 8,
      price: 1430.00,
      status: 'EXECUTED',
      filledQty: 8,
      pendingQty: 0,
      orderType: 'MARKET',
      product: 'CNC',
      validity: 'DAY',
      triggerPrice: 0,
      disclosedQty: 8,
      orderTimestamp: new Date(currentDate - 7200000), // 2 hours ago
      exchange: 'NSE',
      exchangeOrderId: 'NSE' + Math.floor(10000000 + Math.random() * 90000000),
      parentOrderId: null,
      placedBy: 'MOBILE',
      statusMessage: 'Order executed',
      tags: ['investment'],
      averagePrice: 1430.25,
      exchangeTimestamp: new Date(currentDate - 7195000)
    }
  ];

  // Enhanced mock positions data with more details
  const mockPositions = [
    {
      symbol: 'RELIANCE',
      name: 'Reliance Industries Ltd',
      quantity: 15,
      avgPrice: 2300.00,
      ltp: 2456.50,
      pnl: 2349.75,
      pnlPercent: 6.80,
      dayChange: 187.50,
      dayChangePercent: 0.51,
      buyQty: 15,
      buyAvg: 2300.00,
      buyValue: 34500.00,
      sellQty: 0,
      sellAvg: 0,
      sellValue: 0,
      netQty: 15,
      exchange: 'NSE',
      product: 'CNC',
      collateral: 0.7,
      m2m: 2349.75,
      dayBuyQty: 0,
      daySellQty: 0,
      dayBuyValue: 0,
      daySellValue: 0,
      dayBuyAvg: 0,
      daySellAvg: 0,
      lastPrice: 2456.50,
      closePrice: 2444.00,
      isin: 'INE002A01018',
      multiplier: 1,
      precision: 2,
      tickSize: 0.05,
      instrumentToken: 'NSE:RELIANCE',
      oi: 0,
      oiDayHigh: 0,
      oiDayLow: 0,
      lowerCircuit: 2200.50,
      upperCircuit: 2700.00,
      lastTradedTime: new Date(currentDate - 3600000) // 1 hour ago
    },
    {
      symbol: 'TCS',
      name: 'Tata Consultancy Services Ltd',
      quantity: 10,
      avgPrice: 3100.00,
      ltp: 3250.80,
      pnl: 1508.00,
      pnlPercent: 4.86,
      dayChange: 150.80,
      dayChangePercent: 0.78,
      buyQty: 10,
      buyAvg: 3100.00,
      buyValue: 31000.00,
      sellQty: 0,
      sellAvg: 0,
      sellValue: 0,
      netQty: 10,
      exchange: 'NSE',
      product: 'MIS',
      collateral: 0.65,
      m2m: 1508.00,
      dayBuyQty: 10,
      daySellQty: 0,
      dayBuyValue: 31000.00,
      daySellValue: 0,
      dayBuyAvg: 3100.00,
      daySellAvg: 0,
      lastPrice: 3250.80,
      closePrice: 3100.00,
      isin: 'INE467B01029',
      multiplier: 1,
      precision: 2,
      tickSize: 0.05,
      instrumentToken: 'NSE:TCS',
      oi: 0,
      oiDayHigh: 0,
      oiDayLow: 0,
      lowerCircuit: 2950.50,
      upperCircuit: 3400.00,
      lastTradedTime: new Date(currentDate - 7200000) // 2 hours ago
    },
    {
      symbol: 'HDFCBANK',
      name: 'HDFC Bank Ltd',
      quantity: 5,
      avgPrice: 1500.00,
      ltp: 1650.25,
      pnl: 751.25,
      pnlPercent: 10.02,
      dayChange: -28.75,
      dayChangePercent: -0.35,
      buyQty: 5,
      buyAvg: 1500.00,
      buyValue: 7500.00,
      sellQty: 0,
      sellAvg: 0,
      sellValue: 0,
      netQty: 5,
      exchange: 'NSE',
      product: 'CNC',
      collateral: 0.75,
      m2m: 751.25,
      dayBuyQty: 0,
      daySellQty: 0,
      dayBuyValue: 0,
      daySellValue: 0,
      dayBuyAvg: 0,
      daySellAvg: 0,
      lastPrice: 1650.25,
      closePrice: 1679.00,
      isin: 'INE040A01034',
      multiplier: 1,
      precision: 2,
      tickSize: 0.05,
      instrumentToken: 'NSE:HDFCBANK',
      oi: 0,
      oiDayHigh: 0,
      oiDayLow: 0,
      lowerCircuit: 1485.00,
      upperCircuit: 1850.00,
      lastTradedTime: new Date(currentDate - 10800000) // 3 hours ago
    },
    {
      symbol: 'INFY',
      name: 'Infosys Ltd',
      quantity: 20,
      avgPrice: 1400.00,
      ltp: 1450.60,
      pnl: 1012.00,
      pnlPercent: 3.61,
      dayChange: -124.00,
      dayChangePercent: -0.85,
      buyQty: 20,
      buyAvg: 1400.00,
      buyValue: 28000.00,
      sellQty: 0,
      sellAvg: 0,
      sellValue: 0,
      netQty: 20,
      exchange: 'NSE',
      product: 'CNC',
      collateral: 0.6,
      m2m: 1012.00,
      dayBuyQty: 20,
      daySellQty: 0,
      dayBuyValue: 28000.00,
      daySellValue: 0,
      dayBuyAvg: 1400.00,
      daySellAvg: 0,
      lastPrice: 1450.60,
      closePrice: 1450.60,
      isin: 'INE009A01021',
      multiplier: 1,
      precision: 2,
      tickSize: 0.05,
      instrumentToken: 'NSE:INFY',
      oi: 0,
      oiDayHigh: 0,
      oiDayLow: 0,
      lowerCircuit: 1300.00,
      upperCircuit: 1600.00,
      lastTradedTime: new Date(currentDate - 5400000) // 1.5 hours ago
    }
  ];

  // Enhanced mock summary data with more detailed metrics
  const mockSummary = {
    totalValue: 150000.00,
    dayChange: 185.55, // Sum of dayChange from all positions
    dayChangePercent: 0.12,
    totalInvested: 130000.00,
    totalPnl: 20000.00,
    pnlPercent: 15.38,
    currentValue: 150000.00,
    valuation: {
      equity: 106618.75, // Sum of currentValue from all holdings
      commodity: 0,
      mutualFunds: 0,
      fno: 0,
      cash: 43381.25 // Total - equity
    },
    pnl: {
      realized: 3121.50, // Sum of realizedPnl from all holdings
      unrealized: 16878.50, // Sum of unrealizedPnl from all holdings
      today: 185.55, // dayChange
      todayPercent: 0.12 // dayChangePercent
    },
    risk: {
      var: 7500.00, // 5% of total value
      beta: 1.12,
      sharpe: 1.45,
      sortino: 1.85
    },
    allocation: {
      equity: 71.08, // (equity / total) * 100
      cash: 28.92, // (cash / total) * 100
      sector: {
        IT: 41.01, // (TCS + INFY) / total equity
        Banking: 10.50, // HDFCBANK / total equity
        Energy: 34.56, // RELIANCE / total equity
        FMCG: 13.93 // HINDUNILVR / total equity
      }
    },
    lastUpdated: new Date(),
    currency: 'INR',
    accountNumber: 'DEMO123456',
    broker: 'Hytrade',
    accountType: 'INDIVIDUAL',
    margin: {
      used: 25000.25,
      available: 124999.75,
      total: 150000.00,
      utilization: 16.67
    },
    today: {
      pnl: 185.55,
      pnlPercent: 0.12,
      trades: 8,
      brokerage: 250.75,
      turnover: 125000.00
    },
    lastSettlement: {
      date: new Date(currentDate - 2 * oneDay),
      amount: 5000.00,
      status: 'processed'
    },
    limits: {
      intraday: 200000.00,
      delivery: 150000.00,
      exposure: 350000.00
    },
    collateral: {
      value: 87500.50,
      haircut: 0.70,
      available: 61250.35
    }
  };

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // For testing, use mock data directly
        console.log('Using mock data for dashboard');
        
        // Update state with mock data directly
        setHoldings(mockHoldings);
        setOrders(mockOrders);
        setPositions(mockPositions);
        setFunds(mockFunds);
        
        // Format watchlist data
        const watchlistData = mockWatchlist;
        const formattedWatchlist = watchlistData.map(item => ({
          symbol: item.symbol,
          name: item.name || item.symbol,
          lastPrice: item.lastPrice || 0,
          change: item.change || '0.00',
          changePercent: item.changePercent || '0.00%',
          addedAt: item.addedAt || new Date()
        }));
        
        setWatchlist(formattedWatchlist);
        
        // Log that we're using mock data
        console.log('Using mock data for all dashboard components');
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading({
          holdings: false,
          orders: false,
          positions: false,
          funds: false,
          watchlist: false
        });
      }
    };

    fetchDashboardData();
  }, []);

  // Handle trade action from watchlist
  const handleTradeClick = (symbol, price) => {
    setTradeSymbol(symbol);
    setTradePrice(price);
    setShowTradeModal(true);
  };

  // Helper function to safely get data from response or use mock data
  const getDataOrMock = (res, mockData) => {
    if (res.status === 'fulfilled' && res.value && res.value.data) {
      return Array.isArray(res.value.data) ? 
        (res.value.data.length ? res.value.data : mockData) : 
        (Object.keys(res.value.data).length ? res.value.data : mockData);
    }
    return mockData;
  };

  // Refresh all dashboard data
  const refreshData = async () => {
    try {
      // Set all loading states to true
      setIsLoading({
        holdings: true,
        orders: true,
        positions: true,
        funds: true,
        watchlist: true
      });

      // Fetch all data in parallel with fallback to mock data
      const [
        holdingsRes, 
        ordersRes, 
        positionsRes, 
        fundsRes,
        watchlistRes
      ] = await Promise.allSettled([
        portfolioAPI.getHoldings().catch(() => ({ data: mockHoldings })),
        portfolioAPI.getOrders().catch(() => ({ data: mockOrders })),
        portfolioAPI.getPositions().catch(() => ({ data: mockPositions })),
        fundsAPI.getFunds().catch(() => ({ data: mockFunds })),
        marketAPI.getWatchlist().catch(() => ({ data: mockWatchlist }))
      ]);

      // Update state with fetched data or fallback to mock data
      setHoldings(getDataOrMock(holdingsRes, mockHoldings));
      setOrders(getDataOrMock(ordersRes, mockOrders));
      setPositions(getDataOrMock(positionsRes, mockPositions));
      setFunds(getDataOrMock(fundsRes, mockFunds));
      
      // Format watchlist data
      const watchlistData = getDataOrMock(watchlistRes, mockWatchlist);
      const formattedWatchlist = watchlistData.map(item => ({
        symbol: item.symbol,
        name: item.name || item.symbol,
        lastPrice: item.lastPrice || 0,
        change: item.change || '0.00',
        changePercent: item.changePercent || '0.00%',
        addedAt: item.addedAt || new Date()
      }));
      
      setWatchlist(formattedWatchlist);
      
      // If we're using mock data, log it for debugging
      if (holdingsRes.status === 'rejected') console.log('Using mock holdings data');
      if (ordersRes.status === 'rejected') console.log('Using mock orders data');
      if (positionsRes.status === 'rejected') console.log('Using mock positions data');
      if (fundsRes.status === 'rejected') console.log('Using mock funds data');
      if (watchlistRes.status === 'rejected') console.log('Using mock watchlist data');
    } catch (err) {
      console.error('Error refreshing dashboard data:', err);
      setError('Failed to refresh dashboard data. Please try again.');
    } finally {
      setIsLoading({
        holdings: false,
        orders: false,
        positions: false,
        funds: false,
        watchlist: false
      });
    }
  };

  // Create context value
  const contextValue = {
    user,
    holdings,
    orders,
    positions,
    funds,
    watchlist,
    isLoading,
    error,
    refreshData
  };

  // Render the main dashboard layout
  return (
    <GeneralContextProvider value={contextValue}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Main content wrapper */}
        {/* Header */}
        <AppBar 
          position="fixed" 
          color="default" 
          elevation={0} 
          sx={{ 
            bgcolor: '#fff',
            borderBottom: '1px solid #e0e0e0',
            zIndex: 1200,
            height: '48px',
            width: '100%',
            maxWidth: '100%',
            '& .MuiToolbar-root': {
              minHeight: '48px',
              height: '48px',
              padding: '0 16px',
              width: '100%',
              margin: 0,
              justifyContent: 'space-between',
              flexWrap: 'nowrap',
              '& > *': {
                flex: '0 0 auto',
                overflow: 'hidden'
              }
            }
          }}
        >
          <Toolbar 
            disableGutters
            sx={{
              width: '100%',
              maxWidth: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0 12px',
              '& > *': {
                flexShrink: 0
              }
            }}
          >
            {/* Left side - Logo */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              flex: '0 0 180px',
              minWidth: '180px',
              height: '100%',
              borderRight: '1px solid #e0e0e0',
              paddingRight: '16px',
              marginRight: '16px'
            }}>
              <Box
                component="a"
                href="/"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  '&:hover': { opacity: 0.9 }
                }}
              >
                <img 
                  src="/media/Images/logo.png"
                  alt="HYTrade Logo"
                  style={{
                    height: '24px',
                    width: 'auto',
                    objectFit: 'contain',
                    maxWidth: '100%'
                  }}
                />
              </Box>
            </Box>

            {/* Center - Navigation Links */}
            <Box sx={{
              flex: '1 1 auto',
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': {
                display: 'none'
              },
              '& .MuiButton-root': {
                minWidth: 'auto',
                padding: '0 16px',
                height: '100%',
                borderRadius: 0,
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: '#444',
                textTransform: 'none',
                position: 'relative',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.02)'
                },
                '&.active': {
                  color: '#ff3131',
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '80%',
                    height: '3px',
                    backgroundColor: '#ff3131',
                    borderRadius: '3px 3px 0 '
                  }
                }
              }
            }}>
              {[
                { label: 'Dashboard', icon: <DashboardIcon />, path: '' },
                { label: 'Orders', icon: <Receipt />, path: 'orders' },
                { label: 'Holdings', icon: <AccountBalanceWallet />, path: 'holdings' },
                { label: 'Positions', icon: <ShowChart />, path: 'positions' },
                { label: 'Funds', icon: <Assessment />, path: 'funds' }
              ].map((item, index) => (
                <Button
                  key={item.path}
                  startIcon={item.icon}
                  onClick={() => {
                    setTabValue(index);
                    const basePath = location.pathname.split('/').slice(0, -1).join('/');
                    navigate(`${basePath}${item.path ? `/${item.path}` : ''}`);
                  }}
                  sx={{
                    color: tabValue === index ? '#ff3131' : 'text.primary',
                    fontWeight: tabValue === index ? 600 : 400,
                    textTransform: 'none',
                    px: 2,
                    py: 1,
                    borderRadius: '4px',
                    minWidth: 'auto',
                    position: 'relative',
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: tabValue === index ? '80%' : '0%',
                      height: '3px',
                      backgroundColor: '#ff3131',
                      transition: 'width 0.3s ease-in-out',
                      borderRadius: '3px 3px 0 0'
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 49, 49, 0.08)',
                      color: '#ff3131',
                      '&:after': {
                        width: '80%',
                        backgroundColor: '#ff3131'
                      }
                    },
                    '& .MuiButton-startIcon': {
                      mr: 0.5,
                      color: tabValue === index ? '#ff3131' : 'inherit'
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            {/* Right side - User Menu */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              height: '100%',
              marginLeft: 'auto',
              padding: '0 8px',
              '& .MuiButton-root': {
                height: '100%',
                padding: '0 8px',
                minWidth: 'auto',
                textTransform: 'none',
                color: '#444',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.02)'
                }
              },
              '& .MuiIconButton-root': {
                padding: '4px',
                color: '#555',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.02)'
                }
              }
          }}>
              <IconButton 
                size="medium"
                sx={{ 
                  color: '#555',
                  '&:hover': { 
                    backgroundColor: 'rgba(0, 0, 0, 0.05)'
                  }
                }}
              >
                <Badge 
                  badgeContent={3} 
                  color="error"
                  overlap="circular"
                  sx={{ 
                    '& .MuiBadge-badge': { 
                      fontSize: '0.6rem', 
                      height: 16, 
                      minWidth: 16,
                      top: 4,
                      right: 4
                    } 
                  }}
                >
                  <Notifications fontSize="small" />
                </Badge>
              </IconButton>
              
              <Button
                onClick={handleProfileMenuOpen}
                color="inherit"
                size="small"
                sx={{ 
                  minWidth: '100px',
                  maxWidth: '180px',
                  p: '4px 8px',
                  textTransform: 'none',
                  height: '36px',
                  color: 'text.primary',
                  borderRadius: '4px',
                  border: '1px solid transparent',
                  backgroundColor: 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    borderColor: 'divider'
                  },
                  '& .MuiButton-startIcon': {
                    margin: 0,
                    marginRight: '6px'
                  },
                  '& .MuiButton-endIcon': {
                    margin: 0,
                    ml: 0
                  }
                }}
                endIcon={<ArrowDropDown />}
                startIcon={
                  <Avatar 
                    sx={{ 
                      width: 22, 
                      height: 22, 
                      bgcolor: '#ff3131',
                      fontSize: '0.7rem',
                      fontWeight: 500
                    }}
                  >
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                }
              >
                <Box sx={{ 
                  textAlign: 'left',
                  lineHeight: 1.2
                }}>
                  <Typography variant="subtitle2" sx={{ 
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    lineHeight: 1.1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100px',
                    display: 'block',
                    textAlign: 'left'
                  }}>
                    {user?.name || 'User'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ 
                    fontSize: '0.625rem',
                    lineHeight: 1.1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100px',
                    display: 'block',
                    textAlign: 'left'
                  }}>
                    {user?.email?.split('@')[0] || 'user'}
                  </Typography>
                </Box>
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
      
      {/* Main Layout Container */}
      <Box sx={{ display: 'flex', flex: 1, pt: '48px' }}>
        {/* Left Sidebar */}
        <LeftSidebar />
        
        {/* Main Content */}
        <Box 
          component="main" 
          sx={{ 
            flex: 1,
            pt: '32px',
            pl: { xs: 2, md: 3 },
            pr: { xs: 2, md: 3 },
            pb: 3,
            width: '100%',
            overflowX: 'hidden', // Prevent horizontal scroll
            position: 'relative',
            '& > *': {
              maxWidth: '100%',
              boxSizing: 'border-box'
            }
          }}
        >
          {/* Main Content Area */}
          <Box sx={{ 
            width: '100%',
            maxWidth: '1600px',
            mx: 'auto',
            px: { xs: 1, sm: 2, md: 3 },
            boxSizing: 'border-box',
            '& > *': {
              width: '100%',
              overflowX: 'auto', // Allow horizontal scroll within components if needed
              '&::-webkit-scrollbar': {
                height: '6px',
                width: '6px'
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#c1c1c1',
                borderRadius: '10px'
              }
            }
          }}>
            <Routes>
              <Route 
                index 
                element={
                  <Summary 
                    user={user} 
                    holdings={holdings}
                    funds={funds}
                    positions={positions}
                    watchlist={watchlist}
                    isLoading={isLoading.holdings || isLoading.funds}
                  />
                } 
              />
              <Route 
                path="orders" 
                element={
                  <Orders 
                    orders={orders} 
                    isLoading={isLoading.orders}
                  />
                } 
              />
              <Route 
                path="holdings" 
                element={
                  <Holdings 
                    holdings={holdings} 
                    isLoading={isLoading.holdings}
                  />
                } 
              />
              <Route 
                path="positions" 
                element={
                  <Positions 
                    positions={positions}
                    isLoading={isLoading.positions}
                  />
                } 
              />
              <Route 
                path="funds" 
                element={
                  <Funds 
                    funds={funds}
                    isLoading={isLoading.funds}
                  />
                } 
              />
              <Route path="apps" element={<Apps />} />
              {/* Redirect any unknown routes to the dashboard */}
              <Route 
                path="*" 
                element={
                  <Summary 
                    user={user} 
                    holdings={holdings}
                    funds={funds}
                    positions={positions}
                    watchlist={watchlist}
                    isLoading={isLoading.holdings || isLoading.funds}
                  />
                } 
              />
            </Routes>
          </Box>
        </Box>

        {/* Trade Modal */}
        {showTradeModal && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1300,
              backdropFilter: 'blur(2px)',
              transition: 'opacity 0.2s ease-in-out',
              opacity: 1
            }}
            onClick={() => {
              setShowTradeModal(false);
              setTradeSymbol('');
              setTradePrice('');
            }}
          >
            <Box
              onClick={(e) => e.stopPropagation()}
              sx={{
                bgcolor: 'background.paper',
                borderRadius: '8px',
                width: '100%',
                maxWidth: '440px',
                maxHeight: '90vh',
                overflow: 'hidden',
                boxShadow: '0 16px 32px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                transform: 'translateY(0)',
                transition: 'transform 0.2s ease-out, opacity 0.2s ease-out',
                '&:hover': {
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)'
                },
                '@media (max-width: 600px)': {
                  width: '95%',
                  maxWidth: '100%',
                  borderRadius: '8px 8px 0 0',
                  position: 'fixed',
                  bottom: 0,
                  top: 'auto',
                  maxHeight: '90vh',
                  transform: 'translateY(0)'
                }
              }}
            >
              <Trade 
                symbol={tradeSymbol}
                price={tradePrice}
                onClose={() => {
                  setShowTradeModal(false);
                  setTradeSymbol('');
                  setTradePrice('');
                  refreshData();
                }}
              />
            </Box>
          </Box>
        )}
      </Box>
    </GeneralContextProvider>
  );
};

export default Dashboard;
