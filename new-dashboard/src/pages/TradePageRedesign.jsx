import React, { useEffect, useMemo, useState } from 'react';
import { Box, Grid, Paper, Typography, TextField, Button, ToggleButton, ToggleButtonGroup, FormControl, InputLabel, Select, MenuItem, Alert, Chip, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import { useRefresh } from '../contexts/RefreshContext';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const instruments = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.' }
];

const TradePage = () => {
  const theme = useTheme();
  const { user, token } = useAuth();
  const { triggerRefresh } = useRefresh();
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const API_URL = import.meta.env.VITE_API_URL || (isDevelopment ? 'http://localhost:3002' : 'https://hytrade-backend.onrender.com');

  const [symbol, setSymbol] = useState('AAPL');
  const [name, setName] = useState('Apple Inc.');
  const [type, setType] = useState('BUY');
  const [mode, setMode] = useState('MARKET');
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    const inst = instruments.find(i => i.symbol === symbol);
    if (inst) setName(inst.name);
  }, [symbol]);

  const series = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({ t: i, v: Math.round(100 + Math.random() * 40) }));
  }, [symbol]);

  const formatCurrency = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n || 0);
  const estPrice = mode === 'MARKET' ? undefined : (parseFloat(price) || 0);
  const estUnit = mode === 'MARKET' ? 0 : estPrice;
  const estCost = (mode === 'MARKET' ? 0 : estUnit) * (parseInt(qty || '0', 10));

  const placeOrder = async () => {
    setError('');
    setResult(null);
    setPlacing(true);
    try {
      const payload = {
        stockSymbol: symbol,
        stockName: name,
        orderType: type,
        quantity: parseInt(qty || '0', 10),
        price: mode === 'MARKET' ? 0 : parseFloat(price || '0'),
        orderMode: mode
      };
      const res = await fetch(`${API_URL}/api/trading/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || 'Order failed');
      setResult(json);
      try { triggerRefresh(); } catch {}
    } catch (e) {
      setError(e.message);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Trade</Typography>
          <Typography variant="body2" color="text.secondary">Fast, beautiful trading interface</Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="caption" color="text.secondary">Balance</Typography>
          <Typography variant="h6">{formatCurrency(user?.accountBalance)}</Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left: Instrument & Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Instrument</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label="Symbol" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
              </Grid>
            </Grid>
          </Paper>
          <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', height: 360 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Price Chart</Typography>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={series}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="t" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="v" stroke={theme.palette.primary.main} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Right: Order Panel */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Order</Typography>
            <ToggleButtonGroup value={type} exclusive onChange={(_, v) => v && setType(v)} sx={{ mb: 2 }}>
              <ToggleButton value="BUY" color="success">BUY</ToggleButton>
              <ToggleButton value="SELL" color="error">SELL</ToggleButton>
            </ToggleButtonGroup>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Mode</InputLabel>
                  <Select label="Mode" value={mode} onChange={(e) => setMode(e.target.value)}>
                    <MenuItem value="MARKET">Market</MenuItem>
                    <MenuItem value="LIMIT">Limit</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField label="Quantity" type="number" value={qty} onChange={(e) => setQty(parseInt(e.target.value || '0', 10))} fullWidth />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Price" type="number" disabled={mode === 'MARKET'} value={price} onChange={(e) => setPrice(e.target.value)} fullWidth />
              </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">Estimated Cost</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{mode === 'MARKET' ? 'Market' : formatCurrency(estCost)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Button variant="contained" color={type === 'BUY' ? 'success' : 'error'} disabled={placing || !token || qty <= 0 || (mode === 'LIMIT' && estPrice <= 0)} onClick={placeOrder}>
                {placing ? 'Placing…' : `${type} Order`}
              </Button>
              {error && <Chip label={error} color="error" />}
              {result && <Chip label={`Order ${result?.data?.orderStatus || 'PLACED'}`} color="success" />}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TradePage;