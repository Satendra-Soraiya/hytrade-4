import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Table, TableHead, TableBody, TableRow, TableCell, Chip, Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useRefresh } from '../contexts/RefreshContext';

const HoldingsTable = ({ compact = false }) => {
  const { token } = useAuth();
  const { refreshKey } = useRefresh();
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const API_URL = import.meta.env.VITE_API_URL || (isDevelopment ? 'http://localhost:3002' : 'https://hytrade-backend.onrender.com');

  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const fetchHoldings = async () => {
    if (!token) return;
    const res = await fetch(`${API_URL}/api/trading/holdings?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const json = await res.json();
      setRows(json.data.holdings || []);
      setSummary(json.data.summary || null);
    }
  };

  useEffect(() => {
    fetchHoldings();
    const id = setInterval(fetchHoldings, 30000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page, refreshKey]);

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n || 0);

  return (
    <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle1">Holdings</Typography>
        {summary && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip label={`Invested: ${fmt(summary.totalInvestment)}`} size="small" />
            <Chip label={`Current: ${fmt(summary.totalCurrentValue)}`} size="small" />
            <Chip label={`P&L: ${fmt(summary.totalProfitLoss)} (${summary.totalProfitLossPercentage}%)`} size="small" color={summary.totalProfitLoss >= 0 ? 'success' : 'error'} />
          </Box>
        )}
      </Box>

      <Table size={compact ? 'small' : 'medium'}>
        <TableHead>
          <TableRow>
            <TableCell>Symbol</TableCell>
            <TableCell align="right">Qty</TableCell>
            <TableCell align="right">Avg Price</TableCell>
            <TableCell align="right">Current</TableCell>
            <TableCell align="right">Value</TableCell>
            <TableCell align="right">P&L</TableCell>
            <TableCell align="right">Updated</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7}>
                <Typography variant="body2" color="text.secondary">No holdings yet. Place a trade to see positions here.</Typography>
              </TableCell>
            </TableRow>
          ) : rows.map((h) => (
            <TableRow key={`${h.stockSymbol}-${h._id}`}>
              <TableCell>{h.stockSymbol}</TableCell>
              <TableCell align="right">{h.quantity}</TableCell>
              <TableCell align="right">{fmt(h.averagePrice)}</TableCell>
              <TableCell align="right">{fmt(h.currentPrice)}</TableCell>
              <TableCell align="right">{fmt(h.currentValue)}</TableCell>
              <TableCell align="right">
                <Typography sx={{ color: (h.profitLoss >= 0) ? 'success.main' : 'error.main' }}>
                  {fmt(h.profitLoss)} ({h.profitLossPercentage}%)
                </Typography>
              </TableCell>
              <TableCell align="right">{new Date(h.lastUpdated).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        <Button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
        <Button onClick={() => setPage((p) => p + 1)}>Next</Button>
      </Box>
    </Paper>
  );
};

export default HoldingsTable;