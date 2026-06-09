import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Button, Stack, LinearProgress, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import HoldingsTable from '../components/HoldingsTable';
import { getApiUrl } from '../utils/api';
import { formatInr } from '../utils/currency';
import { useAuth } from '../contexts/AuthContext';
import { PageContent, PageHeader, StatCard, Panel } from '../components/layout/PageShell';
import { CHART_COLORS, buildChartSeries, chartYDomain } from '../utils/chartTheme';

function AllocationList({ items, total }) {
  const sum = total > 0 ? total : items.reduce((s, i) => s + i.value, 0) || 1;
  return (
    <Stack spacing={1.75} sx={{ py: 0.5 }}>
      {items.map((item, i) => {
        const pct = (item.value / sum) * 100;
        return (
          <Box key={item.name}>
            <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={1}>
              <Typography variant="body2" fontWeight={600} noWrap sx={{ minWidth: 0, flex: 1 }}>
                {item.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                {pct.toFixed(1)}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, pct)}
              sx={{
                mt: 0.75,
                height: 6,
                borderRadius: 1,
                bgcolor: 'action.hover',
                '& .MuiLinearProgress-bar': { bgcolor: CHART_COLORS[i % CHART_COLORS.length], borderRadius: 1 },
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'block' }}>
              {formatInr(item.value)}
            </Typography>
          </Box>
        );
      })}
    </Stack>
  );
}

const DashboardPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, token, updateUser } = useAuth();
  const API_URL = getApiUrl();

  const [summary, setSummary] = useState({
    totalInvestment: 0,
    totalCurrentValue: 0,
    totalProfitLoss: 0,
    totalProfitLossPercentage: 0,
    holdingsCount: 0,
    totalPortfolioValue: 0,
    accountBalance: 0,
  });
  const [ordersCount, setOrdersCount] = useState(0);
  const [allocations, setAllocations] = useState([]);
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const [detailedRes, ordersRes] = await Promise.all([
          fetch(`${API_URL}/api/trading/portfolio/detailed`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/trading/orders?limit=1`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (detailedRes.ok) {
          const { data } = await detailedRes.json();
          setSummary({
            totalInvestment: data.totalInvestment || 0,
            totalCurrentValue: data.totalCurrentValue || 0,
            totalProfitLoss: data.totalProfitLoss || 0,
            totalProfitLossPercentage: data.totalProfitLossPercentage || 0,
            holdingsCount: data.holdingsCount || 0,
            totalPortfolioValue: data.totalPortfolioValue || data.totalValue || 0,
            accountBalance: data.accountBalance || 0,
          });
          setTimeline(data.timeline || []);
          setAllocations((data.holdings || []).map((h) => ({ name: h.stockSymbol, value: h.currentValue })));
          if (typeof data.accountBalance === 'number' && updateUser && user) {
            updateUser({ ...user, accountBalance: data.accountBalance });
          }
        }
        if (ordersRes.ok) {
          const json = await ordersRes.json();
          setOrdersCount(json.data?.pagination?.total || 0);
        }
      } catch (e) {
        console.warn('Dashboard fetch error:', e);
      }
    })();
  }, [API_URL, token]);

  const chartData = useMemo(
    () => buildChartSeries(timeline, summary.totalPortfolioValue || summary.accountBalance),
    [timeline, summary.totalPortfolioValue, summary.accountBalance],
  );

  const yDomain = useMemo(() => chartYDomain(chartData), [chartData]);

  const allocationItems = useMemo(() => {
    if (allocations.length) return allocations;
    return [{ name: 'Cash', value: summary.accountBalance || 0 }];
  }, [allocations, summary.accountBalance]);

  const allocationTotal = summary.totalPortfolioValue || summary.accountBalance || 0;

  return (
    <PageContent>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your paper trading account"
        actions={(
          <>
            <Button variant="outlined" onClick={() => navigate('/portfolio')}>Portfolio</Button>
            <Button variant="contained" onClick={() => navigate('/trade')}>Trade</Button>
          </>
        )}
      />

      <Grid container spacing={2} sx={{ mb: 3, width: '100%' }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Cash balance" value={formatInr(summary.accountBalance || user?.accountBalance)} hint="Available INR" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Holdings value" value={formatInr(summary.totalCurrentValue)} hint={`Invested ${formatInr(summary.totalInvestment)}`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Unrealized P&L"
            value={`${formatInr(summary.totalProfitLoss)} (${summary.totalProfitLossPercentage || 0}%)`}
            tone={summary.totalProfitLoss >= 0 ? 'up' : 'down'}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Total orders" value={String(ordersCount)} hint="All time" />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3, width: '100%' }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Panel title="Portfolio value" subtitle="Based on your trade history">
            <Box sx={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    interval="preserveStartEnd"
                    minTickGap={28}
                  />
                  <YAxis
                    domain={yDomain}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 11 }}
                    width={56}
                  />
                  <Tooltip formatter={(v) => formatInr(v)} labelFormatter={(l) => l} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={theme.palette.primary.main}
                    strokeWidth={2}
                    dot={chartData.length <= 1}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Panel>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Panel
            title="Allocation"
            subtitle={summary.holdingsCount ? `${summary.holdingsCount} positions` : 'Cash only'}
          >
            <AllocationList items={allocationItems} total={allocationTotal} />
          </Panel>
        </Grid>
      </Grid>

      <HoldingsTable compact />
    </PageContent>
  );
};

export default DashboardPage;
