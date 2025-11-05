import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Paper, Typography, Button, Chip, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import BackendStatus from '../components/BackendStatus';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import HoldingsTable from '../components/HoldingsTable';
import { AccountBalanceWallet as WalletIcon, TrendingUp as TrendingUpIcon, ReceiptLong as OrdersIcon, PieChart as PieIcon } from '@mui/icons-material';

const DashboardPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, token, updateUser } = useAuth();
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const API_URL = import.meta.env.VITE_API_URL || (isDevelopment ? 'http://localhost:3002' : 'https://hytrade-backend.onrender.com');

  const [summary, setSummary] = useState({
    totalInvestment: 0,
    totalCurrentValue: 0,
    totalProfitLoss: 0,
    totalProfitLossPercentage: 0,
    holdingsCount: 0,
  });
  const [ordersCount, setOrdersCount] = useState(0);
  const [allocations, setAllocations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) return; // wait for auth
        const holdingsRes = await fetch(`${API_URL}/api/trading/holdings?limit=50`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (holdingsRes.ok) {
          const json = await holdingsRes.json();
          const s = json.data.summary;
          setSummary(s);
          const alloc = json.data.holdings.map(h => ({ name: h.stockSymbol, value: h.currentValue }));
          setAllocations(alloc);
        }
        // Also sync account balance from portfolio summary to keep user state consistent
        const summaryRes = await fetch(`${API_URL}/api/trading/portfolio/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (summaryRes.ok) {
          const js = await summaryRes.json();
          const latestBalance = js?.data?.accountBalance;
          if (typeof latestBalance === 'number' && updateUser) {
            updateUser({ ...user, accountBalance: latestBalance });
          }
        }

        const ordersRes = await fetch(`${API_URL}/api/trading/orders?limit=1`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (ordersRes.ok) {
          const json = await ordersRes.json();
          setOrdersCount(json.data.pagination.total);
        }
      } catch (e) {
        console.warn('Dashboard data fetch fallback:', e);
      }
    };
    fetchData();
  }, [API_URL, token]);

  const portfolioSeries = useMemo(() => {
    const base = summary.totalCurrentValue || 50000;
    // Mock a 12-point monthly series around base
    return Array.from({ length: 12 }, (_, i) => ({
      month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
      value: Math.round(base * (0.95 + Math.random() * 0.1)),
    }));
  }, [summary.totalCurrentValue]);

  const allocColors = [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.success.main, theme.palette.warning.main, theme.palette.info.main];

  const formatCurrency = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n || 0);

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">Overview of your trading portfolio</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" color="primary" onClick={() => navigate('/portfolio')}>Deposit</Button>
          <Button variant="outlined" color="primary" onClick={() => navigate('/trade')}>Trade</Button>
        </Box>
      </Box>

      <BackendStatus />

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WalletIcon color="primary" />
              <Typography variant="body2" color="text.secondary">Account Balance</Typography>
            </Box>
            <Typography variant="h5" sx={{ mt: 1 }}>{formatCurrency(user?.accountBalance)}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon color="success" />
              <Typography variant="body2" color="text.secondary">Portfolio Value</Typography>
            </Box>
            <Typography variant="h5" sx={{ mt: 1 }}>{formatCurrency(summary.totalCurrentValue)}</Typography>
            <Typography variant="caption" color="text.secondary">Invested: {formatCurrency(summary.totalInvestment)}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon color={summary.totalProfitLoss >= 0 ? 'success' : 'error'} />
              <Typography variant="body2" color="text.secondary">Total P&L</Typography>
            </Box>
            <Typography variant="h5" sx={{ mt: 1, color: summary.totalProfitLoss >= 0 ? 'success.main' : 'error.main' }}>
              {formatCurrency(summary.totalProfitLoss)} ({summary.totalProfitLossPercentage || 0}%)
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <OrdersIcon color="info" />
              <Typography variant="body2" color="text.secondary">Orders</Typography>
            </Box>
            <Typography variant="h5" sx={{ mt: 1 }}>{ordersCount}</Typography>
            <Typography variant="caption" color="text.secondary">Total orders placed</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', height: 380 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Portfolio Value (12 months)</Typography>
            <ResponsiveContainer width="100%" height="88%">
              <LineChart data={portfolioSeries}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Line type="monotone" dataKey="value" stroke={theme.palette.primary.main} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', height: 380 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <PieIcon color="secondary" />
              <Typography variant="subtitle1">Allocation</Typography>
              <Chip label={`${summary.holdingsCount} holdings`} size="small" sx={{ ml: 'auto' }} />
            </Box>
            <ResponsiveContainer width="100%" height="88%">
              <PieChart>
                <Pie 
                  data={allocations.length ? allocations : [{ name: 'N/A', value: 1 }]} 
                  dataKey="value" 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={70} 
                  outerRadius={120} 
                  paddingAngle={2}
                  labelLine={false}
                >
                  {(allocations.length ? allocations : [{ name: 'N/A', value: 1 }]).map((entry, idx) => (
                    <Cell key={`alloc-${idx}`} fill={allocColors[idx % allocColors.length]} />
                  ))}
                </Pie>
                {allocations.length ? <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" /> : null}
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Holdings snapshot */}
      <HoldingsTable compact />

      <Divider sx={{ my: 3 }} />
      <Typography variant="caption" color="text.secondary">Legacy dashboard widgets are preserved separately in DashboardLegacy.jsx for backup.</Typography>
    </Box>
  );
};

export default DashboardPage;
