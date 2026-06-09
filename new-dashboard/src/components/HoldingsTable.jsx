import React, { useEffect, useState } from 'react';
import { Typography, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Button, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useRefresh } from '../contexts/RefreshContext';
import { getApiUrl } from '../utils/api';
import { formatInr } from '../utils/currency';
import { Panel } from './layout/PageShell';

const HoldingsTable = ({ compact = false }) => {
  const { token } = useAuth();
  const { refreshKey } = useRefresh();
  const API_URL = getApiUrl();
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [page, setPage] = useState(1);

  const fetchHoldings = async () => {
    if (!token) return;
    const res = await fetch(`${API_URL}/api/trading/holdings?page=${page}&limit=20`, {
      headers: { Authorization: `Bearer ${token}` },
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

  return (
    <Panel
      title="Holdings"
      subtitle={summary ? `Invested ${formatInr(summary.totalInvestment)} · P&L ${formatInr(summary.totalProfitLoss)}` : undefined}
      noPadding
    >
      <TableContainer sx={{ width: '100%' }}>
        <Table size={compact ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              <TableCell>Symbol</TableCell>
              <TableCell align="right">Qty</TableCell>
              <TableCell align="right">Avg</TableCell>
              <TableCell align="right">LTP</TableCell>
              <TableCell align="right">Value</TableCell>
              <TableCell align="right">P&L</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>No holdings yet.</Typography>
                </TableCell>
              </TableRow>
            ) : rows.map((h) => (
              <TableRow key={`${h.stockSymbol}-${h._id}`} hover>
                <TableCell sx={{ fontWeight: 600 }}>{h.stockSymbol}</TableCell>
                <TableCell align="right">{h.quantity}</TableCell>
                <TableCell align="right">{formatInr(h.averagePrice)}</TableCell>
                <TableCell align="right">{formatInr(h.currentPrice)}</TableCell>
                <TableCell align="right">{formatInr(h.currentValue)}</TableCell>
                <TableCell align="right" sx={{ color: h.profitLoss >= 0 ? 'success.main' : 'error.main' }}>
                  {formatInr(h.profitLoss)} ({h.profitLossPercentage}%)
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button size="small" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
        <Button size="small" onClick={() => setPage((p) => p + 1)}>Next</Button>
      </Box>
    </Panel>
  );
};

export default HoldingsTable;
