import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
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
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { getApiUrl } from '../utils/api';
import { formatInr } from '../utils/currency';
import { PageContent, PageHeader, Panel } from '../components/layout/PageShell';

const HistoryPage = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${getApiUrl()}/api/trading/orders?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to load orders');
      setOrders(json.data?.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [token]);

  return (
    <PageContent>
      <PageHeader
        title="Order history"
        subtitle="Completed buy and sell orders"
        actions={<Button variant="outlined" startIcon={<RefreshIcon />} onClick={load}>Refresh</Button>}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Panel title="All orders" subtitle={`${orders.length} records`} noPadding fill>
        {loading ? (
          <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress size={28} /></Box>
        ) : orders.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 3 }}>No orders yet.</Typography>
        ) : (
          <TableContainer sx={{ width: '100%' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Symbol</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Mode</TableCell>
                  <TableCell align="right">P&L</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o._id} hover>
                    <TableCell>{o.orderDate ? new Date(o.orderDate).toLocaleString('en-IN') : '—'}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{o.stockSymbol}</TableCell>
                    <TableCell sx={{ color: o.orderType === 'BUY' ? 'success.main' : 'error.main' }}>{o.orderType}</TableCell>
                    <TableCell align="right">{o.quantity}</TableCell>
                    <TableCell align="right">{formatInr(o.price)}</TableCell>
                    <TableCell align="right">{formatInr(o.totalAmount)}</TableCell>
                    <TableCell>{o.orderMode}</TableCell>
                    <TableCell align="right">{o.profitLoss != null ? formatInr(o.profitLoss) : '—'}</TableCell>
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

export default HistoryPage;
