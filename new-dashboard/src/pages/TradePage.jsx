import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Typography,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { TrendingUp, TrendingDown, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRefresh } from '../contexts/RefreshContext';
import { getApiUrl, fetchWithAuth } from '../utils/api';
import { formatInr, formatPercentage } from '../utils/currency';
import { PageContent, PageHeader, StatCard, Panel } from '../components/layout/PageShell';
import StockLogo from '../components/StockLogo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const emptyStock = { symbol: '', name: '', price: 0, change: 0, changePercent: 0, sector: '' };

const TradePage = () => {
  const { user, token, updateUser } = useAuth();
  const { triggerRefresh } = useRefresh();

  const [stocks, setStocks] = useState([]);
  const [loadingMarket, setLoadingMarket] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState(emptyStock);
  const [orderType, setOrderType] = useState('BUY');
  const [orderQuantity, setOrderQuantity] = useState('');
  const [orderPrice, setOrderPrice] = useState('');
  const [orderPriceType, setOrderPriceType] = useState('MARKET');
  const [orderLoading, setOrderLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [recentTrades, setRecentTrades] = useState([]);
  const [portfolioBalance, setPortfolioBalance] = useState(0);
  const [notice, setNotice] = useState(null);

  const filteredStocks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return stocks;
    return stocks.filter((s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
  }, [stocks, searchQuery]);

  const loadMarket = async () => {
    if (!token) return;
    setLoadingMarket(true);
    try {
      const instRes = await fetchWithAuth('/api/market/instruments?limit=50', { token });
      const instJson = await instRes.json();
      if (!instJson.success || !instJson.data?.length) return;
      const symbols = instJson.data.map((i) => i.symbol).join(',');
      const qRes = await fetchWithAuth(`/api/market/quotes?symbols=${encodeURIComponent(symbols)}`, { token });
      const qJson = await qRes.json();
      const mapped = instJson.data
        .map((inst) => {
          const q = qJson.data?.[inst.symbol] || {};
          const price = Number(q.ltp) || 0;
          if (price <= 0) return null;
          return {
            symbol: inst.symbol,
            name: inst.name,
            price,
            change: Number(q.change) || 0,
            changePercent: Number(q.changePercent) || 0,
            sector: inst.sector || 'General',
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.symbol.localeCompare(b.symbol));
      setStocks(mapped);
      if (mapped.length && !selectedStock.symbol) setSelectedStock(mapped[0]);
    } catch {
      setNotice({ type: 'error', text: 'Could not load market data' });
    } finally {
      setLoadingMarket(false);
    }
  };

  const fetchPortfolioData = async () => {
    if (!token) return;
    const API_URL = getApiUrl();
    try {
      const [summaryRes, ordersRes] = await Promise.all([
        fetch(`${API_URL}/api/trading/portfolio/summary`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/trading/orders?limit=8`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (summaryRes.ok) {
        const summary = await summaryRes.json();
        const balance = summary.data?.accountBalance ?? 0;
        setPortfolioBalance(balance);
        if (updateUser && user) updateUser({ ...user, accountBalance: balance });
      }
      if (ordersRes.ok) {
        const orders = await ordersRes.json();
        setRecentTrades((orders.data?.orders || []).map((o) => ({
          id: o._id,
          symbol: o.stockSymbol,
          type: o.orderType,
          quantity: o.quantity,
          price: o.price,
          total: o.totalAmount ?? o.quantity * o.price,
          time: o.orderDate ? new Date(o.orderDate).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '—',
        })));
      }
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    if (token) {
      loadMarket();
      fetchPortfolioData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const balance = portfolioBalance || user?.accountBalance || 0;

  const openOrder = (stock, type) => {
    setSelectedStock(stock);
    setOrderType(type);
    setOrderQuantity('');
    setOrderPrice(String(stock.price));
    setOrderPriceType('MARKET');
    setShowPreview(true);
  };

  const calculateOrderTotal = () => {
    const qty = parseFloat(orderQuantity) || 0;
    const price = orderPriceType === 'MARKET' ? selectedStock.price : (parseFloat(orderPrice) || selectedStock.price);
    return qty * price;
  };

  const handleOrderSubmit = async () => {
    const qty = parseFloat(orderQuantity);
    if (!qty || qty < 1) {
      setNotice({ type: 'error', text: 'Enter a valid quantity' });
      return;
    }
    setOrderLoading(true);
    setNotice(null);
    try {
      const response = await fetch(`${getApiUrl()}/api/trading/order`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stockSymbol: selectedStock.symbol,
          stockName: selectedStock.name,
          orderType,
          quantity: qty,
          price: orderPriceType === 'MARKET' ? selectedStock.price : (parseFloat(orderPrice) || selectedStock.price),
          orderMode: orderPriceType,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Order failed');
      setShowPreview(false);
      setOrderQuantity('');
      await Promise.all([fetchPortfolioData(), loadMarket()]);
      triggerRefresh?.();
      setNotice({ type: 'success', text: `${orderType} ${selectedStock.symbol} executed` });
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Order failed' });
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <PageContent>
      <PageHeader
        title="Trade"
        subtitle="Place market or limit orders on NSE instruments"
        actions={(
          <IconButton onClick={() => { loadMarket(); fetchPortfolioData(); }} aria-label="refresh">
            <RefreshIcon />
          </IconButton>
        )}
      />

      {notice && (
        <Alert severity={notice.type} onClose={() => setNotice(null)} sx={{ mb: 2 }}>
          {notice.text}
        </Alert>
      )}

      <Box sx={{ mb: 2, maxWidth: 360 }}>
        <StatCard label="Available balance" value={formatInr(balance)} hint="INR paper account" />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 280px' },
          gap: 2,
          alignItems: 'start',
          width: '100%',
        }}
      >
        <Panel
          title="NSE instruments"
          subtitle={`${filteredStocks.length} symbols`}
          action={(
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search symbol or company"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          )}
          noPadding
        >
          {loadingMarket ? (
            <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress size={28} /></Box>
          ) : (
            <TableContainer className="hytrade-scroll" sx={{ width: '100%', maxHeight: 560 }}>
              <Table stickyHeader size="small" sx={{ width: '100%' }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Company</TableCell>
                    <TableCell align="right">LTP</TableCell>
                    <TableCell align="right">Change</TableCell>
                    <TableCell align="right" width={160}>Trade</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStocks.map((stock) => {
                    const isUp = stock.changePercent >= 0;
                    const selected = selectedStock.symbol === stock.symbol;
                    return (
                      <TableRow
                        key={stock.symbol}
                        hover
                        selected={selected}
                        onClick={() => setSelectedStock(stock)}
                        className="group"
                        sx={{
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease',
                          '&.Mui-selected': { bgcolor: 'action.selected' },
                        }}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3 py-0.5">
                            <StockLogo symbol={stock.symbol} name={stock.name} />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">{stock.symbol}</p>
                              <p className="truncate text-xs text-muted-foreground">{stock.name}</p>
                              <p className="text-[10px] text-muted-foreground">{stock.sector}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell align="right">
                          <span className="text-sm font-semibold text-foreground">{formatInr(stock.price)}</span>
                        </TableCell>
                        <TableCell align="right">
                          <Badge variant={isUp ? 'up' : 'down'} className="gap-1">
                            {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {formatPercentage(stock.changePercent)}
                          </Badge>
                        </TableCell>
                        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-1.5">
                            <Button
                              variant="buy"
                              size="sm"
                              className="min-w-[52px]"
                              onClick={() => openOrder(stock, 'BUY')}
                            >
                              Buy
                            </Button>
                            <Button
                              variant="sell"
                              size="sm"
                              className="min-w-[52px]"
                              onClick={() => openOrder(stock, 'SELL')}
                            >
                              Sell
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Panel>

        <Panel title="Recent orders" subtitle="Last 8 trades" noPadding>
          {recentTrades.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>No orders yet</Typography>
          ) : (
            <Table size="small">
              <TableBody>
                {recentTrades.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StockLogo symbol={t.symbol} size="sm" />
                        <div>
                          <Typography variant="body2" fontWeight={600}>{t.symbol}</Typography>
                          <Typography variant="caption" color="text.secondary">{t.type} · {t.quantity}</Typography>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color={t.type === 'BUY' ? 'success.main' : 'error.main'}>
                        {formatInr(t.total)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{t.time}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Panel>
      </Box>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <StockLogo symbol={selectedStock.symbol} name={selectedStock.name} size="lg" />
              <div>
                <DialogTitle className={cn(orderType === 'BUY' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
                  {orderType} · {selectedStock.symbol}
                </DialogTitle>
                <DialogDescription>{selectedStock.name}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex justify-between rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
              <span className="text-muted-foreground">LTP</span>
              <span className="font-semibold">{formatInr(selectedStock.price)}</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="order-qty">Quantity</label>
              <Input
                id="order-qty"
                type="number"
                min={1}
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(e.target.value)}
                placeholder="e.g. 10"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="order-mode">Order mode</label>
              <select
                id="order-mode"
                value={orderPriceType}
                onChange={(e) => setOrderPriceType(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="MARKET">Market — {formatInr(selectedStock.price)}</option>
                <option value="LIMIT">Limit</option>
              </select>
            </div>

            {orderPriceType === 'LIMIT' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="order-price">Limit price (₹)</label>
                <Input
                  id="order-price"
                  type="number"
                  value={orderPrice}
                  onChange={(e) => setOrderPrice(e.target.value)}
                />
              </div>
            )}

            <Divider />

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estimated total</span>
              <span className="text-base font-semibold">{formatInr(calculateOrderTotal())}</span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowPreview(false)}>Cancel</Button>
            <Button
              variant={orderType === 'BUY' ? 'buy' : 'destructive'}
              disabled={orderLoading}
              onClick={handleOrderSubmit}
            >
              {orderLoading ? 'Placing…' : `Confirm ${orderType}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContent>
  );
};

export default TradePage;
