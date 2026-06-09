const express = require('express');
const { authMiddleware } = require('../../shared/middleware/auth.middleware');
const { validateOrder, validatePagination, validateObjectId } = require('../../shared/middleware/validation.middleware');
const { executeBuyOrder, executeSellOrder } = require('./trading.service');
const {
  getHoldingsWithSummary,
  getPortfolioSummary,
  getPortfolioDetailed,
  getOrders,
  getTradingStats,
  mapOrderToLegacy,
} = require('../portfolio/portfolio.service');
const { getMarketOverview } = require('../market/market-data.service');
const { Holding, Order } = require('./holding.model');
const { creditWallet } = require('../wallet/wallet.service');
const { config } = require('../../config/env');
const { inrToPaise } = require('../../shared/utils/money');

const router = express.Router();
router.use(authMiddleware);

router.post('/order', validateOrder, async (req, res) => {
  try {
    const { stockSymbol, stockName, orderType, quantity, price, orderMode } = req.body;
    const payload = {
      stockSymbol,
      stockName,
      quantity: parseInt(quantity, 10),
      price: parseFloat(price),
      orderMode: orderMode || 'MARKET',
    };

    const result = orderType.toUpperCase() === 'BUY'
      ? await executeBuyOrder(req.user.id, payload)
      : await executeSellOrder(req.user.id, payload);

    res.status(201).json({
      ...result,
      order: mapOrderToLegacy(result.order),
    });
  } catch (error) {
    const status = error.message?.includes('Insufficient') ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Order execution failed',
      code: 'ORDER_EXECUTION_ERROR',
    });
  }
});

router.get('/holdings', validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const data = await getHoldingsWithSummary(req.user.id, {
      page,
      limit,
      sortBy: req.query.sortBy || 'lastUpdated',
      sortOrder: req.query.sortOrder || 'desc',
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch holdings', code: 'HOLDINGS_FETCH_ERROR' });
  }
});

router.get('/holdings/:id', validateObjectId, async (req, res) => {
  try {
    const holding = await Holding.findOne({ _id: req.params.id, userId: req.user.id });
    if (!holding) return res.status(404).json({ success: false, message: 'Holding not found', code: 'HOLDING_NOT_FOUND' });
    res.json({ success: true, data: holding });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch holding', code: 'HOLDING_FETCH_ERROR' });
  }
});

router.get('/orders', validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const data = await getOrders(req.user.id, { page, limit, orderType: req.query.orderType });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders', code: 'ORDERS_FETCH_ERROR' });
  }
});

router.get('/orders/:id', validateObjectId, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found', code: 'ORDER_NOT_FOUND' });
    res.json({ success: true, data: mapOrderToLegacy(order) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch order', code: 'ORDER_FETCH_ERROR' });
  }
});

router.get('/portfolio/summary', async (req, res) => {
  try {
    const data = await getPortfolioSummary(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch portfolio summary', code: 'PORTFOLIO_SUMMARY_ERROR' });
  }
});

router.get('/portfolio/detailed', async (req, res) => {
  try {
    const data = await getPortfolioDetailed(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch detailed portfolio data', code: 'PORTFOLIO_DETAILED_ERROR' });
  }
});

router.post('/portfolio/deposit', async (req, res) => {
  if (config.isProduction) {
    return res.status(403).json({
      success: false,
      message: 'Deposits are disabled in production (paper trading only)',
      code: 'DEPOSIT_DISABLED',
    });
  }

  try {
    const amount = parseFloat(req.body.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid deposit amount', code: 'INVALID_AMOUNT' });
    }

    const { wallet } = await creditWallet({
      userId: req.user.id,
      amountPaise: inrToPaise(amount),
      reason: 'deposit',
      metadata: { source: 'dev_deposit' },
    });

    res.json({
      success: true,
      message: 'Deposit successful',
      data: { accountBalance: wallet.balancePaise / 100 },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to deposit funds', code: 'DEPOSIT_ERROR' });
  }
});

router.get('/markets', async (req, res) => {
  try {
    const data = await getMarketOverview();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch market data', code: 'MARKET_DATA_ERROR' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const data = await getTradingStats(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch trading statistics', code: 'STATS_FETCH_ERROR' });
  }
});

module.exports = router;
