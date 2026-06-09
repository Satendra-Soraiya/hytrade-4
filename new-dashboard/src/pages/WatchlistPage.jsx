import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Typography,
} from '@mui/material';
import { Delete as DeleteIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchWithAuth } from '../utils/api';
import { formatInr, formatPercentage } from '../utils/currency';
import { PageContent, PageHeader, Panel } from '../components/layout/PageShell';

const WatchlistPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetchWithAuth('/api/watchlist', { token });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to load watchlist');
      setItems(json.watchlist || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [token]);

  const remove = async (symbol) => {
    try {
      const res = await fetchWithAuth(`/api/watchlist/${encodeURIComponent(symbol)}`, { method: 'DELETE', token });
      if (!res.ok) throw new Error((await res.json()).message || 'Remove failed');
      setItems((prev) => prev.filter((i) => i.symbol !== symbol));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <PageContent>
      <PageHeader
        title="Watchlist"
        subtitle="Symbols you are tracking"
        actions={(
          <>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={load}>Refresh</Button>
            <Button variant="contained" onClick={() => navigate('/markets')}>Browse markets</Button>
          </>
        )}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Panel title="Tracked symbols" subtitle={`${items.length} items`} noPadding fill>
        {loading ? (
          <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress size={28} /></Box>
        ) : items.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 3 }}>No symbols yet. Add some from Markets.</Typography>
        ) : (
          <TableContainer sx={{ width: '100%' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Symbol</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">LTP</TableCell>
                  <TableCell align="right">Change</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((row) => (
                  <TableRow key={row.symbol} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{row.symbol}</TableCell>
                    <TableCell>{row.stockName}</TableCell>
                    <TableCell align="right">{row.price != null ? formatInr(row.price) : '—'}</TableCell>
                    <TableCell align="right" sx={{ color: (row.changePercent || 0) >= 0 ? 'success.main' : 'error.main' }}>
                      {row.changePercent != null ? formatPercentage(row.changePercent) : '—'}
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => navigate(`/trade?symbol=${encodeURIComponent(row.symbol)}`)}>Trade</Button>
                      <IconButton size="small" onClick={() => remove(row.symbol)}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Panel>
    </PageContent>
  );
};

export default WatchlistPage;
