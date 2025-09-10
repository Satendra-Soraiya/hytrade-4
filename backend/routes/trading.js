const express = require('express');
const TradingService = require('../services/tradingService');
const { CustomHoldingsModel, CustomOrdersModel } = require('../model/CustomTradingModels');
const { authMiddleware, verifiedUserMiddleware } = require('../middleware/auth');
const { validateOrder, validatePagination, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// All trading routes require authentication
router.use(authMiddleware);

// Place a new order (BUY or SELL)
router.post('/order', verifiedUserMiddleware, validateOrder, async (req, res) => {
  try {
    const { stockSymbol, stockName, orderType, quantity, price, orderMode } = req.body;
    
    const orderData = {
      stockSymbol: stockSymbol.toUpperCase(),
      stockName,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      orderMode: orderMode || 'MARKET'
    };

    let result;

    if (orderType.toUpperCase() === 'BUY') {
      // Validate user has sufficient balance
      const validation = TradingService.validateOrder(orderData, req.user.accountBalance);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Order validation failed',
          errors: validation.errors,
          code: 'VALIDATION_ERROR'
        });
      }

      result = await TradingService.executeBuyOrder(req.user.id, orderData);
    } else if (orderType.toUpperCase() === 'SELL') {
      result = await TradingService.executeSellOrder(req.user.id, orderData);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid order type. Must be BUY or SELL',
        code: 'INVALID_ORDER_TYPE'
      });
    }

    res.status(201).json(result);

  } catch (error) {
    console.error('Order execution error:', error);
    
    if (error.message.includes('Insufficient')) {
      return res.status(400).json({
        success: false,
        message: error.message,
        code: 'INSUFFICIENT_FUNDS_OR_SHARES'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Order execution failed. Please try again.',
      code: 'ORDER_EXECUTION_ERROR'
    });
  }
});

// Get user's portfolio holdings
router.get('/holdings', validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const sortBy = req.query.sortBy || 'lastUpdated';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const holdings = await CustomHoldingsModel.find({ userId: req.user.id })
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalHoldings = await CustomHoldingsModel.countDocuments({ userId: req.user.id });
    
    // Calculate totals
    let totalInvestment = 0;
    let totalCurrentValue = 0;
    let totalProfitLoss = 0;

    holdings.forEach(holding => {
      totalInvestment += holding.totalInvestment;
      totalCurrentValue += holding.currentValue;
      totalProfitLoss += holding.profitLoss;
    });

    res.status(200).json({
      success: true,
      data: {
        holdings: holdings,
        pagination: {
          page: page,
          limit: limit,
          total: totalHoldings,
          pages: Math.ceil(totalHoldings / limit)
        },
        summary: {
          totalInvestment: parseFloat(totalInvestment.toFixed(2)),
          totalCurrentValue: parseFloat(totalCurrentValue.toFixed(2)),
          totalProfitLoss: parseFloat(totalProfitLoss.toFixed(2)),
          totalProfitLossPercentage: totalInvestment > 0 ? parseFloat(((totalProfitLoss / totalInvestment) * 100).toFixed(2)) : 0,
          holdingsCount: totalHoldings
        }
      }
    });

  } catch (error) {
    console.error('Holdings fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch holdings',
      code: 'HOLDINGS_FETCH_ERROR'
    });
  }
});

// Get specific holding by ID
router.get('/holdings/:id', validateObjectId, async (req, res) => {
  try {
    const holding = await CustomHoldingsModel.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!holding) {
      return res.status(404).json({
        success: false,
        message: 'Holding not found',
        code: 'HOLDING_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      data: holding
    });

  } catch (error) {
    console.error('Holding fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch holding',
      code: 'HOLDING_FETCH_ERROR'
    });
  }
});

// Get user's order history
router.get('/orders', validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const sortBy = req.query.sortBy || 'orderDate';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const orderType = req.query.orderType; // Optional filter: BUY or SELL

    const skip = (page - 1) * limit;
    
    // Build query
    const query = { userId: req.user.id };
    if (orderType && ['BUY', 'SELL'].includes(orderType.toUpperCase())) {
      query.orderType = orderType.toUpperCase();
    }

    const orders = await CustomOrdersModel.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalOrders = await CustomOrdersModel.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        orders: orders,
        pagination: {
          page: page,
          limit: limit,
          total: totalOrders,
          pages: Math.ceil(totalOrders / limit)
        }
      }
    });

  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      code: 'ORDERS_FETCH_ERROR'
    });
  }
});

// Get specific order by ID
router.get('/orders/:id', validateObjectId, async (req, res) => {
  try {
    const order = await CustomOrdersModel.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        code: 'ORDER_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Order fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      code: 'ORDER_FETCH_ERROR'
    });
  }
});

// Get portfolio summary
router.get('/portfolio/summary', async (req, res) => {
  try {
    const summary = await TradingService.calculatePortfolioSummary(req.user.id);
    
    res.status(200).json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Portfolio summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio summary',
      code: 'PORTFOLIO_SUMMARY_ERROR'
    });
  }
});

// Get trading statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get order statistics
    const totalOrders = await CustomOrdersModel.countDocuments({ userId });
    const buyOrders = await CustomOrdersModel.countDocuments({ userId, orderType: 'BUY' });
    const sellOrders = await CustomOrdersModel.countDocuments({ userId, orderType: 'SELL' });
    
    // Get recent orders (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentOrders = await CustomOrdersModel.countDocuments({
      userId,
      orderDate: { $gte: thirtyDaysAgo }
    });

    // Get profit/loss statistics from sell orders
    const sellOrdersWithPnL = await CustomOrdersModel.find({
      userId,
      orderType: 'SELL',
      profitLoss: { $exists: true }
    }).select('profitLoss profitLossPercentage');

    let totalRealizedPnL = 0;
    let profitableOrders = 0;
    let lossOrders = 0;

    sellOrdersWithPnL.forEach(order => {
      totalRealizedPnL += order.profitLoss || 0;
      if (order.profitLoss > 0) profitableOrders++;
      else if (order.profitLoss < 0) lossOrders++;
    });

    const winRate = sellOrdersWithPnL.length > 0 ? 
      parseFloat(((profitableOrders / sellOrdersWithPnL.length) * 100).toFixed(2)) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        buyOrders,
        sellOrders,
        recentOrders,
        totalRealizedPnL: parseFloat(totalRealizedPnL.toFixed(2)),
        profitableOrders,
        lossOrders,
        winRate,
        tradingFrequency: recentOrders / 30 // Orders per day average
      }
    });

  } catch (error) {
    console.error('Trading stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trading statistics',
      code: 'STATS_FETCH_ERROR'
    });
  }
});

module.exports = router;
