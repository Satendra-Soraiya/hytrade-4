import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  LinearProgress,
  Chip,
  Button,
  useTheme,
  useMediaQuery,
  ListItemButton
} from '@mui/material';
import BackendStatus from '../components/BackendStatus';
import AlgorithmStatus from '../components/AlgorithmStatus';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  ShowChart as ChartIcon,
  AccountBalanceWallet as WalletIcon,
  AttachMoney as MoneyIcon,
  Timeline as TimelineIcon,
  SwapHoriz as TradeIcon,
  NotificationsActive as AlertIcon,
  StarBorder as WatchlistIcon,
  Receipt as ReceiptIcon,
  Psychology as AlgorithmIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { Business as CompanyIcon } from '@mui/icons-material';

// Sample data - Replace with API calls later
const portfolioData = {
  totalValue: 48750.32,
  dayChange: 1245.50,
  dayChangePercent: 2.62,
  allTimeReturn: 8750.32,
  allTimeReturnPercent: 21.88,
  assets: [
    { id: 1, symbol: 'BTC', name: 'Bitcoin', amount: 0.5, value: 21300, change: 5.2, changeType: 'up' },
    { id: 2, symbol: 'ETH', name: 'Ethereum', amount: 12.5, value: 15625, change: -1.8, changeType: 'down' },
    { id: 3, symbol: 'SOL', name: 'Solana', amount: 85, value: 5640, change: 12.3, changeType: 'up' },
    { id: 4, symbol: 'DOT', name: 'Polkadot', amount: 250, value: 1250, change: 3.1, changeType: 'up' },
  ]
};

const marketData = [
  { id: 1, symbol: 'BTC/USD', price: 42600.50, change: 5.2, volume: '2.5B', chartData: [65, 59, 80, 81, 56, 55, 40] },
  { id: 2, symbol: 'ETH/USD', price: 2250.75, change: -1.8, volume: '1.8B', chartData: [28, 48, 40, 19, 86, 27, 90] },
  { id: 3, symbol: 'SOL/USD', price: 98.25, change: 12.3, volume: '850M', chartData: [18, 28, 45, 60, 40, 30, 70] },
  { id: 4, symbol: 'DOT/USD', price: 6.89, change: 3.1, volume: '320M', chartData: [25, 35, 30, 45, 50, 40, 35] },
];

const recentTransactions = [
  { id: 1, type: 'Buy', symbol: 'BTC', amount: 0.1, price: 42500, total: 4250, status: 'Completed', time: '10:30 AM' },
  { id: 2, type: 'Sell', symbol: 'ETH', amount: 5, price: 2240, total: 11200, status: 'Completed', time: 'Yesterday' },
  { id: 3, type: 'Buy', symbol: 'SOL', amount: 50, price: 95.50, total: 4775, status: 'Pending', time: 'Mar 15' },
  { id: 4, type: 'Buy', symbol: 'DOT', amount: 200, price: 6.75, total: 1350, status: 'Completed', time: 'Mar 14' },
];

const watchlist = [
  { id: 1, symbol: 'BTC', name: 'Bitcoin', price: 42600.50, change: 5.2 },
  { id: 2, symbol: 'ETH', name: 'Ethereum', price: 2250.75, change: -1.8 },
  { id: 3, symbol: 'SOL', name: 'Solana', price: 98.25, change: 12.3 },
  { id: 4, symbol: 'DOT', name: 'Polkadot', price: 6.89, change: 3.1 },
];

const topCompaniesData = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 189.98, change: 2.34, changePercent: 1.25, marketCap: 2.98 },
  { symbol: 'MSFT', name: 'Microsoft Corp', price: 420.72, change: -1.56, changePercent: -0.37, marketCap: 3.13 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 177.53, change: 3.21, changePercent: 1.84, marketCap: 2.23 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 185.19, change: 0.87, changePercent: 0.47, marketCap: 1.93 },
  { symbol: 'META', name: 'Meta Platforms', price: 497.88, change: -2.45, changePercent: -0.49, marketCap: 1.27 },
];

// Small chart component (placeholder - replace with actual chart library)
const MiniChart = ({ data, isPositive }) => {
  const theme = useTheme();
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  return (
    <Box sx={{ width: 80, height: 30, display: 'flex', alignItems: 'flex-end' }}>
      {data.map((value, index) => {
        const height = ((value - min) / range) * 100;
        return (
          <Box
            key={index}
            sx={{
              flex: 1,
              height: `${height}%`,
              backgroundColor: isPositive ? theme.palette.success.main : theme.palette.error.main,
              opacity: 0.8,
              mx: 0.2,
              borderRadius: '2px',
            }}
          />
        );
      })}
    </Box>
  );
};

const TopCompanies = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const chartData = topCompaniesData.map(company => ({
    name: company.symbol,
    value: company.marketCap,
    color: [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.info.main
    ][topCompaniesData.indexOf(company) % 5]
  }));

  return (
    <Paper 
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" component="h2">
          Top Companies
        </Typography>
        <Button size="small" color="primary">
          View All
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ flex: 1, minHeight: 300 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ 
            height: '100%', 
            minHeight: 250,
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative'
          }}>
            <Box sx={{ 
              width: '100%', 
              height: '100%',
              maxHeight: 250,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? '50%' : '60%'}
                    outerRadius={isMobile ? '70%' : '80%'}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  {!isMobile && <Legend layout="horizontal" verticalAlign="bottom" align="center" />}
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <List dense sx={{ height: '100%', overflow: 'auto' }}>
            {topCompaniesData.map((company, index) => (
              <Box key={company.symbol}>
                <ListItemButton 
                  component="div"
                  sx={{ 
                    px: 1,
                    py: 1.5,
                    '&:hover': { 
                      bgcolor: 'action.hover', 
                      borderRadius: 1,
                      transform: 'translateX(4px)',
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar 
                      sx={{ 
                        bgcolor: chartData[index].color,
                        width: 36, 
                        height: 36,
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}
                    >
                      {company.symbol[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <Box sx={{ flex: 1, minWidth: 0, mr: 2 }}>
                    <Typography variant="subtitle2" noWrap>
                      {company.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {company.symbol}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="subtitle2">
                      ${company.price.toFixed(2)}
                    </Typography>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        color: company.change >= 0 ? 'success.main' : 'error.main',
                        fontSize: '0.75rem',
                        fontWeight: 500
                      }}
                    >
                      {company.change >= 0 ? (
                        <ArrowUpwardIcon fontSize="small" sx={{ fontSize: '1rem', mr: 0.5 }} />
                      ) : (
                        <ArrowDownwardIcon fontSize="small" sx={{ fontSize: '1rem', mr: 0.5 }} />
                      )}
                      {Math.abs(company.change).toFixed(2)} ({company.change >= 0 ? '+' : ''}{company.changePercent}%)
                    </Box>
                  </Box>
                </ListItemButton>
                {index < topCompaniesData.length - 1 && (
                  <Divider component="li" sx={{ my: 0.5 }} />
                )}
              </Box>
            ))}
          </List>
        </Grid>
      </Grid>
    </Paper>
  );
};

const DashboardPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const stats = [
    { 
      title: 'Total Portfolio Value', 
      value: `$${portfolioData.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <WalletIcon />, 
      color: 'primary.main' 
    },
    { 
      title: '24h Change', 
      value: `${portfolioData.dayChange >= 0 ? '+' : ''}${portfolioData.dayChange.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${portfolioData.dayChangePercent}%)`,
      icon: <TrendingUpIcon />, 
      color: portfolioData.dayChange >= 0 ? 'success.main' : 'error.main' 
    },
    { 
      title: 'All Time Return', 
      value: `+$${portfolioData.allTimeReturn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${portfolioData.allTimeReturnPercent}%)`, 
      icon: <ChartIcon />, 
      color: 'info.main' 
    },
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };


  return (
    <Box sx={{ pb: 4, minHeight: '100vh' }}>
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' },
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 },
        mb: 4 
      }}>
        <Box>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back! Here's your portfolio overview
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<MoneyIcon />}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1
            }}
          >
            Add Funds
          </Button>
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<TradeIcon />}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1
            }}
          >
            New Trade
          </Button>
        </Box>
      </Box>
      
      {/* Stats Cards */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: theme.shadows[4],
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {stat.title}
                </Typography>
                <Box sx={{ color: stat.color, display: 'flex', alignItems: 'center' }}>
                  {stat.icon}
                </Box>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {stat.value}
              </Typography>
              {stat.title === 'Today\'s Change' && (
                <Typography variant="caption" sx={{ color: stat.color, mt: 0.5, fontWeight: 500 }}>
                  {portfolioData.dayChangePercent >= 0 ? '+' : ''}{portfolioData.dayChangePercent}%
                </Typography>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Portfolio Summary */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
              mb: { xs: 3, md: 0 }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" component="h2">
                Portfolio Summary
              </Typography>
              <Button size="small" color="primary">View Details</Button>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" color="text.primary" gutterBottom sx={{ fontWeight: 600 }}>
                Asset Allocation
              </Typography>
              <Box sx={{ width: '100%', mb: 2 }}>
                <Box sx={{ display: 'flex', width: '100%', height: 12, borderRadius: 6, overflow: 'hidden', bgcolor: 'action.hover' }}>
                  {portfolioData.assets.map((asset, index) => (
                    <Box 
                      key={index}
                      sx={{
                        width: `${(asset.value / portfolioData.totalValue) * 100}%`,
                        bgcolor: asset.change >= 0 ? theme.palette.success.main : theme.palette.error.main,
                        height: '100%',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          opacity: 0.8,
                        },
                        '&:not(:last-child)': {
                          mr: '1px'
                        }
                      }}
                    />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                  {portfolioData.assets.map((asset, index) => (
                    <Chip
                      key={index}
                      label={`${asset.symbol} ${(asset.value / portfolioData.totalValue * 100).toFixed(1)}%`}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: asset.change >= 0 ? theme.palette.success.main : theme.palette.error.main,
                        color: asset.change >= 0 ? theme.palette.success.main : theme.palette.error.main,
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Top Holdings
                </Typography>
                <List dense>
                  {watchlist.slice(0, 3).map((item, index) => (
                    <ListItemButton key={index} component="div" disableGutters>
                      <ListItemAvatar sx={{ minWidth: 40 }}>
                        <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.main' }}>
                          {item.symbol[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={item.symbol} 
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                        secondary={item.name}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" fontWeight="medium">
                          ${item.price.toFixed(2)}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: item.change >= 0 ? 'success.main' : 'error.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end'
                          }}
                        >
                          {item.change >= 0 ? <ArrowUpwardIcon fontSize="inherit" /> : <ArrowDownwardIcon fontSize="inherit" />}
                          {Math.abs(item.change).toFixed(2)} ({item.change >= 0 ? '+' : ''}{item.change}%)
                        </Typography>
                      </Box>
                    </ListItemButton>
                  ))}
                </List>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Recent Performance
                </Typography>
                <Box sx={{ 
                  height: 120, 
                  bgcolor: 'action.hover', 
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'flex-end',
                  p: 1,
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* This is a placeholder for the chart */}
                  {[20, 35, 25, 50, 40, 60, 75, 80, 65, 90, 85, 100].map((value, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: 8,
                        height: `${value * 0.7}%`,
                        bgcolor: theme.palette.primary.main,
                        borderRadius: 1,
                        mx: 0.5,
                        opacity: 0.8,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          opacity: 1,
                          transform: 'scaleY(1.1)'
                        }
                      }}
                    />
                  ))}
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    p: 1,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 100%)'
                  }}>
                    <Typography variant="caption" color="text.secondary">
                      Last 12 Months
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Watchlist */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" component="h2">
                Watchlist
              </Typography>
              <Button size="small" color="primary">Manage</Button>
            </Box>
            
            <List dense sx={{ flex: 1 }}>
              {watchlist.map((item, index) => (
                <Box key={index}>
                  <ListItemButton component="div" 
                    sx={{ 
                      px: 0,
                      '&:hover': {
                        bgcolor: 'action.hover',
                        borderRadius: 1
                      }
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: 40 }}>
                      <Avatar 
                        sx={{ 
                          width: 30, 
                          height: 30, 
                          bgcolor: 'primary.main',
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {item.symbol.split('-')[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={item.symbol} 
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                      secondary={item.name}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="medium">
                        ${item.price.toFixed(2)}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: item.change >= 0 ? 'success.main' : 'error.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end'
                        }}
                      >
                        {item.change >= 0 ? <ArrowUpwardIcon fontSize="inherit" /> : <ArrowDownwardIcon fontSize="inherit" />}
                        {Math.abs(item.change).toFixed(2)} ({item.change >= 0 ? '+' : ''}{item.change}%)
                      </Typography>
                    </Box>
                  </ListItemButton>
                  {index < watchlist.length - 1 && <Divider component="li" />}
                </Box>
              ))}
            </List>
            
            <Button 
              fullWidth 
              variant="outlined" 
              size="small" 
              startIcon={<WatchlistIcon />}
              sx={{ mt: 2 }}
            >
              Add to Watchlist
            </Button>
          </Paper>
        </Grid>

        {/* Market Overview */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" component="h2">
                Market Overview
              </Typography>
              <Button size="small" color="primary">View All</Button>
            </Box>
            
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px 0', borderBottom: `1px solid ${theme.palette.divider}` }}>
                      <Typography variant="caption" color="text.secondary">SYMBOL</Typography>
                    </th>
                    <th style={{ textAlign: 'right', padding: '8px 0', borderBottom: `1px solid ${theme.palette.divider}` }}>
                      <Typography variant="caption" color="text.secondary">PRICE</Typography>
                    </th>
                    <th style={{ textAlign: 'right', padding: '8px 0', borderBottom: `1px solid ${theme.palette.divider}` }}>
                      <Typography variant="caption" color="text.secondary">CHANGE</Typography>
                    </th>
                    <th style={{ textAlign: 'right', padding: '8px 0', borderBottom: `1px solid ${theme.palette.divider}` }}>
                      <Typography variant="caption" color="text.secondary">VOLUME</Typography>
                    </th>
                    <th style={{ width: '100px', padding: '8px 0', borderBottom: `1px solid ${theme.palette.divider}` }}>
                      <Typography variant="caption" color="text.secondary">CHART</Typography>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {marketData.map((item, index) => {
                    const isPositive = item.change >= 0;
                    return (
                      <tr key={index}>
                        <td style={{ padding: '12px 0', borderBottom: `1px solid ${theme.palette.divider}` }}>
                          <Typography variant="body2" fontWeight="medium">
                            {item.symbol}
                          </Typography>
                        </td>
                        <td style={{ textAlign: 'right', padding: '12px 16px', borderBottom: `1px solid ${theme.palette.divider}` }}>
                          <Typography variant="body2">
                            ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </Typography>
                        </td>
                        <td style={{ textAlign: 'right', padding: '12px 16px', borderBottom: `1px solid ${theme.palette.divider}` }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: isPositive ? 'success.main' : 'error.main',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              gap: 0.5
                            }}
                          >
                            {isPositive ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />}
                            {Math.abs(item.change).toFixed(2)} ({isPositive ? '+' : ''}{item.change}%)
                          </Typography>
                        </td>
                        <td style={{ textAlign: 'right', padding: '12px 16px', borderBottom: `1px solid ${theme.palette.divider}` }}>
                          <Typography variant="body2">
                            {item.volume}
                          </Typography>
                        </td>
                        <td style={{ padding: '12px 0', borderBottom: `1px solid ${theme.palette.divider}` }}>
                          <Box sx={{ 
                            height: 30, 
                            width: 100, 
                            position: 'relative',
                            '&:after': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: `linear-gradient(to right, ${isPositive ? theme.palette.success.main : theme.palette.error.main}, transparent)`,
                              opacity: 0.2,
                              borderRadius: '4px',
                              zIndex: 1
                            }
                          }}>
                            <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
                              <polyline 
                                fill="none" 
                                stroke={isPositive ? theme.palette.success.main : theme.palette.error.main} 
                                strokeWidth="2" 
                                points={Array(10).fill(0).map((_, i) => {
                                  const x = i * (100 / 9);
                                  const y = 15 + (Math.random() * 10 - 5) * (isPositive ? 1 : -1);
                                  return `${x},${y}`;
                                }).join(' ')}
                              />
                            </svg>
                          </Box>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Transactions */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" component="h2">
                Recent Transactions
              </Typography>
              <Button size="small" color="primary">View All</Button>
            </Box>
            
            <List dense>
              {recentTransactions.map((transaction, index) => (
                <Box key={transaction.id}>
                  <ListItemButton component="div" 
                    sx={{ 
                      px: 0,
                      '&:hover': {
                        bgcolor: 'action.hover',
                        borderRadius: 1
                      }
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: 40 }}>
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32, 
                          bgcolor: transaction.type === 'Buy' ? 'success.light' : 'error.light',
                          color: transaction.type === 'Buy' ? 'success.contrastText' : 'error.contrastText',
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {transaction.type.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" fontWeight="medium" component="span">
                            {transaction.type} {transaction.symbol}
                          </Typography>
                          <Typography variant="body2" fontWeight="medium" component="span">
                            {formatCurrency(transaction.price * transaction.amount)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>
                            {transaction.amount} shares @ {formatCurrency(transaction.price)}
                          </span>
                          <span>
                            {transaction.time}
                          </span>
                        </Box>
                      }
                    />
                    <Chip 
                      label={transaction.status}
                      size="small"
                      sx={{ 
                        ml: 1,
                        bgcolor: transaction.status === 'Completed' ? 'success.light' : 'warning.light',
                        color: transaction.status === 'Completed' ? 'success.contrastText' : 'warning.contrastText',
                        fontSize: '0.7rem',
                        height: 20
                      }}
                    />
                  </ListItemButton>
                  {index < recentTransactions.length - 1 && <Divider component="li" />}
                </Box>
              ))}
            </List>
            
            <Button 
              fullWidth 
              variant="outlined" 
              size="small" 
              startIcon={<ReceiptIcon />}
              sx={{ mt: 2 }}
            >
              View Transaction History
            </Button>
          </Paper>
        </Grid>

        {/* Top Companies */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TopCompanies />
        </Grid>

        {/* Algorithm Status Section */}
        <Grid size={{ xs: 12 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(45deg, #1a1a1a 30%, #2a2a2a 90%)' 
                : 'linear-gradient(45deg, #f5f5f5 30%, #e0e0e0 90%)',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 3
            }}
          >
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' }, mb: 1 }}>
                <AlgorithmIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="h2">
                  Trading Algorithms
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 600 }}>
                Monitor your automated trading algorithms in real-time. View performance metrics, adjust parameters, and control algorithm execution.
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              color="primary"
              size="large"
              startIcon={<AlgorithmIcon />}
              sx={{ flexShrink: 0 }}
            >
              View Algorithms
            </Button>
          </Paper>
        </Grid>

        {/* Algorithm Status Component */}
        <Grid size={{ xs: 12 }}>
          <AlgorithmStatus />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
