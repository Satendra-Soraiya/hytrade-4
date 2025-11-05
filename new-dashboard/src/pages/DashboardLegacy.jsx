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

const DashboardLegacy = () => {
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
      {/* Legacy content preserved */}
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
            Dashboard (Legacy)
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Legacy widgets preserved below for backup
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

      {/* A subset of original sections for backup */}
      <Grid container spacing={3}>
        {/* Market Overview sample */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
              Market Overview (Backup)
            </Typography>
            <List dense>
              {watchlist.map((item, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.main' }}>
                      {item.symbol[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={`${item.symbol} - $${item.price.toFixed(2)}`} 
                    secondary={item.name}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Recent Transactions sample */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
              Recent Transactions (Backup)
            </Typography>
            <List dense>
              {recentTransactions.map((tx) => (
                <ListItem key={tx.id}>
                  <ListItemText 
                    primary={`${tx.type} ${tx.symbol} • ${tx.amount} @ $${tx.price}`} 
                    secondary={`${tx.status} • ${tx.time}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardLegacy;