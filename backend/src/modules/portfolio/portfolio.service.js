const { Holding, Order } = require('../trading/holding.model');
const { User } = require('../users/user.model');
const { getBalanceInr } = require('../wallet/wallet.service');
const { getQuotesForSymbols } = require('../market/market-data.service');
const { config } = require('../../config/env');
const { formatInrFromPaise, paiseToInr } = require('../../shared/utils/money');

const DB_SORT_FIELDS = {
  lastUpdated: 'lastUpdated',
  symbol: 'symbol',
  stockSymbol: 'symbol',
  quantity: 'qty',
  qty: 'qty',
  averagePrice: 'avgPricePaise',
  totalInvestment: 'investedPaise',
};

const COMPUTED_SORT_FIELDS = new Set(['profitLoss', 'currentValue', 'profitLossPercentage', 'currentPrice']);

function mapHoldingToLegacy(holding, quote) {
  const currentPrice = quote ? paiseToInr(quote.ltpPaise) : paiseToInr(holding.avgPricePaise);
  const currentValue = currentPrice * holding.qty;
  const totalInvestment = paiseToInr(holding.investedPaise);
  const profitLoss = currentValue - totalInvestment;
  const profitLossPercentage = totalInvestment > 0 ? (profitLoss / totalInvestment) * 100 : 0;

  return {
    _id: holding._id,
    userId: holding.userId,
    stockSymbol: holding.symbol,
    stockName: holding.stockName,
    quantity: holding.qty,
    averagePrice: paiseToInr(holding.avgPricePaise),
    currentPrice,
    totalInvestment: parseFloat(totalInvestment.toFixed(2)),
    currentValue: parseFloat(currentValue.toFixed(2)),
    profitLoss: parseFloat(profitLoss.toFixed(2)),
    profitLossPercentage: parseFloat(profitLossPercentage.toFixed(2)),
    dayChange: quote ? paiseToInr(quote.changePaise) : 0,
    dayChangePercentage: quote ? quote.changePct : 0,
    purchaseDate: holding.purchaseDate,
    lastUpdated: holding.lastUpdated,
  };
}

function mapOrderToLegacy(order) {
  return {
    _id: order._id,
    userId: order.userId,
    stockSymbol: order.symbol,
    stockName: order.stockName,
    orderType: order.orderType,
    quantity: order.quantity,
    price: paiseToInr(order.executedPricePaise),
    totalAmount: paiseToInr(order.totalAmountPaise),
    orderStatus: order.orderStatus,
    orderMode: order.orderMode,
    profitLoss: order.profitLossPaise != null ? paiseToInr(order.profitLossPaise) : undefined,
    profitLossPercentage: order.profitLossPercentage,
    orderDate: order.orderDate,
    executedAt: order.executedAt,
  };
}

function buildSummaryFromHoldings(mapped) {
  let totalInvestment = 0;
  let totalCurrentValue = 0;
  let totalProfitLoss = 0;
  mapped.forEach((h) => {
    totalInvestment += h.totalInvestment;
    totalCurrentValue += h.currentValue;
    totalProfitLoss += h.profitLoss;
  });

  return {
    totalInvestment: parseFloat(totalInvestment.toFixed(2)),
    totalCurrentValue: parseFloat(totalCurrentValue.toFixed(2)),
    totalProfitLoss: parseFloat(totalProfitLoss.toFixed(2)),
    totalProfitLossPercentage: totalInvestment > 0
      ? parseFloat(((totalProfitLoss / totalInvestment) * 100).toFixed(2))
      : 0,
  };
}

async function buildPortfolioTimeline(userId, currentPortfolioValue) {
  const orders = await Order.find({ userId }).sort({ orderDate: 1 }).lean();
  const today = new Date().toISOString().slice(0, 10);

  if (orders.length === 0) {
    return [{ date: today, value: currentPortfolioValue }];
  }

  let cash = config.startingBalanceInr;
  const holdings = {};
  const points = [];

  for (const order of orders) {
    const amountInr = order.totalAmountPaise / 100;
    if (order.orderType === 'BUY') {
      cash -= amountInr;
      if (!holdings[order.symbol]) holdings[order.symbol] = { qty: 0, cost: 0 };
      holdings[order.symbol].qty += order.quantity;
      holdings[order.symbol].cost += amountInr;
    } else {
      cash += amountInr;
      const h = holdings[order.symbol];
      if (h && h.qty > 0) {
        const avgCost = h.cost / h.qty;
        h.cost -= avgCost * order.quantity;
        h.qty -= order.quantity;
        if (h.qty <= 0) delete holdings[order.symbol];
      }
    }

    const holdingsCost = Object.values(holdings).reduce((sum, h) => sum + h.cost, 0);
    points.push({
      date: new Date(order.orderDate).toISOString().slice(0, 10),
      value: parseFloat((cash + holdingsCost).toFixed(2)),
    });
  }

  const last = points[points.length - 1];
  if (!last || last.date !== today) {
    points.push({ date: today, value: currentPortfolioValue });
  } else {
    last.value = currentPortfolioValue;
  }

  return points;
}

async function getHoldingsWithSummary(userId, { page = 1, limit = 20, sortBy = 'lastUpdated', sortOrder = 'desc' } = {}) {
  const direction = sortOrder === 'asc' ? 1 : -1;
  const allHoldings = await Holding.find({ userId }).lean();
  const quotes = await getQuotesForSymbols(allHoldings.map((h) => h.symbol));
  let mapped = allHoldings.map((h) => mapHoldingToLegacy(h, quotes[h.symbol]));

  if (COMPUTED_SORT_FIELDS.has(sortBy)) {
    mapped.sort((a, b) => (a[sortBy] - b[sortBy]) * direction);
  } else {
    const dbField = DB_SORT_FIELDS[sortBy] || 'lastUpdated';
    mapped.sort((a, b) => {
      const aVal = dbField === 'qty' ? a.quantity : (a[sortBy] ?? a[dbField === 'symbol' ? 'stockSymbol' : dbField]);
      const bVal = dbField === 'qty' ? b.quantity : (b[sortBy] ?? b[dbField === 'symbol' ? 'stockSymbol' : dbField]);
      if (typeof aVal === 'string') return aVal.localeCompare(bVal) * direction;
      return (aVal - bVal) * direction;
    });
  }

  const total = mapped.length;
  const skip = (page - 1) * limit;
  const holdings = mapped.slice(skip, skip + limit);
  const summary = buildSummaryFromHoldings(mapped);

  return {
    holdings,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
    summary: {
      ...summary,
      holdingsCount: total,
    },
  };
}

async function getPortfolioSummary(userId) {
  const accountBalance = await getBalanceInr(userId);
  const allHoldings = await Holding.find({ userId }).lean();
  const quotes = await getQuotesForSymbols(allHoldings.map((h) => h.symbol));
  const mapped = allHoldings.map((h) => mapHoldingToLegacy(h, quotes[h.symbol]));
  const summary = buildSummaryFromHoldings(mapped);
  const user = await User.findById(userId).lean();

  return {
    accountBalance,
    ...summary,
    totalPortfolioValue: parseFloat((accountBalance + summary.totalCurrentValue).toFixed(2)),
    totalPnL: user ? paiseToInr(user.totalPnLPaise || 0) : 0,
    holdingsCount: allHoldings.length,
  };
}

async function getPortfolioDetailed(userId) {
  const summary = await getPortfolioSummary(userId);
  const holdingsResult = await getHoldingsWithSummary(userId, { limit: 100 });
  const timeline = await buildPortfolioTimeline(userId, summary.totalPortfolioValue);

  const sectorAllocation = holdingsResult.holdings
    .map((h) => ({ name: h.stockSymbol, value: h.currentValue }))
    .sort((a, b) => b.value - a.value);

  return {
    ...summary,
    totalValue: summary.totalPortfolioValue,
    timeline,
    holdings: holdingsResult.holdings,
    sectorAllocation,
  };
}

async function getOrders(userId, { page = 1, limit = 50, orderType } = {}) {
  const query = { userId };
  if (orderType && ['BUY', 'SELL'].includes(orderType.toUpperCase())) {
    query.orderType = orderType.toUpperCase();
  }
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find(query).sort({ orderDate: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(query),
  ]);

  return {
    orders: orders.map(mapOrderToLegacy),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
}

async function getTradingStats(userId) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [totalOrders, buyOrders, sellOrders, recentOrders, sellOrdersWithPnL] = await Promise.all([
    Order.countDocuments({ userId }),
    Order.countDocuments({ userId, orderType: 'BUY' }),
    Order.countDocuments({ userId, orderType: 'SELL' }),
    Order.countDocuments({ userId, orderDate: { $gte: thirtyDaysAgo } }),
    Order.find({ userId, orderType: 'SELL', profitLossPaise: { $ne: null } })
      .select('profitLossPaise profitLossPercentage')
      .lean(),
  ]);

  let totalRealizedPnL = 0;
  let profitableOrders = 0;
  let lossOrders = 0;
  sellOrdersWithPnL.forEach((o) => {
    const pnl = paiseToInr(o.profitLossPaise || 0);
    totalRealizedPnL += pnl;
    if (pnl > 0) profitableOrders += 1;
    else if (pnl < 0) lossOrders += 1;
  });

  const winRate = sellOrdersWithPnL.length > 0
    ? parseFloat(((profitableOrders / sellOrdersWithPnL.length) * 100).toFixed(2))
    : 0;

  return {
    totalOrders,
    buyOrders,
    sellOrders,
    recentOrders,
    totalRealizedPnL: parseFloat(totalRealizedPnL.toFixed(2)),
    profitableOrders,
    lossOrders,
    winRate,
    tradingFrequency: recentOrders / 30,
  };
}

module.exports = {
  getHoldingsWithSummary,
  getPortfolioSummary,
  getPortfolioDetailed,
  getOrders,
  getTradingStats,
  mapOrderToLegacy,
};
