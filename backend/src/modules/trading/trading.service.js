const { Instrument } = require('../market/instrument.model');
const { Holding, Order } = require('./holding.model');
const { User } = require('../users/user.model');
const { getQuoteForSymbol } = require('../market/market-data.service');
const {
  creditWallet,
  debitWallet,
  linkLedgerToOrder,
  withOptionalTransaction,
  getOrCreateWallet,
} = require('../wallet/wallet.service');
const { syncUserInvestmentTotals } = require('../users/user-totals.service');
const { config } = require('../../config/env');
const { inrToPaise, formatInrFromPaise } = require('../../shared/utils/money');

async function resolveExecutionPrice({ symbol, orderMode, clientPriceInr }) {
  if (orderMode === 'STOP_LOSS') {
    throw new Error('STOP_LOSS orders are not supported yet. Use MARKET or LIMIT.');
  }

  const quote = await getQuoteForSymbol(symbol, { bypassCache: orderMode === 'MARKET' });
  const ltpInr = formatInrFromPaise(quote.ltpPaise);

  if (orderMode === 'MARKET') {
    return { executedPricePaise: quote.ltpPaise, quote };
  }

  const clientPaise = inrToPaise(clientPriceInr);
  const band = config.limitOrderBandPct / 100;
  const lower = quote.ltpPaise * (1 - band);
  const upper = quote.ltpPaise * (1 + band);

  if (clientPaise < lower || clientPaise > upper) {
    throw new Error(
      `Limit price must be within ±${config.limitOrderBandPct}% of LTP (₹${ltpInr.toFixed(2)})`
    );
  }

  return { executedPricePaise: clientPaise, quote };
}

async function executeBuyOrder(userId, { stockSymbol, stockName, quantity, price, orderMode = 'MARKET' }) {
  const symbol = stockSymbol.toUpperCase();
  const instrument = await Instrument.findOne({ symbol, isTradable: true });
  if (!instrument) throw new Error(`Instrument not tradable: ${symbol}`);

  const { executedPricePaise } = await resolveExecutionPrice({
    symbol,
    orderMode,
    clientPriceInr: price,
  });

  const totalAmountPaise = executedPricePaise * quantity;

  return withOptionalTransaction(async (session) => {
    const { ledgerEntry } = await debitWallet(
      {
        userId,
        amountPaise: totalAmountPaise,
        reason: 'buy',
        refType: 'order',
        metadata: { symbol, quantity, orderMode },
      },
      session
    );

    let holding = await Holding.findOne({ userId, symbol }).session(session || null);
    if (holding) {
      const newQty = holding.qty + quantity;
      const newInvested = holding.investedPaise + totalAmountPaise;
      holding.qty = newQty;
      holding.investedPaise = newInvested;
      holding.avgPricePaise = Math.round(newInvested / newQty);
      holding.stockName = stockName || instrument.name;
      holding.lastUpdated = new Date();
      await holding.save(session ? { session } : undefined);
    } else {
      const created = await Holding.create(
        [{
          userId,
          symbol,
          stockName: stockName || instrument.name,
          qty: quantity,
          avgPricePaise: executedPricePaise,
          investedPaise: totalAmountPaise,
        }],
        session ? { session } : undefined
      );
      holding = created[0];
    }

    const order = await Order.create(
      [{
        userId,
        symbol,
        stockName: stockName || instrument.name,
        orderType: 'BUY',
        quantity,
        requestedPricePaise: orderMode === 'MARKET' ? executedPricePaise : inrToPaise(price),
        executedPricePaise,
        totalAmountPaise,
        orderMode,
        orderStatus: 'COMPLETED',
      }],
      session ? { session } : undefined
    );

    await linkLedgerToOrder(ledgerEntry._id, order[0]._id, session);

    const updatedWallet = await getOrCreateWallet(userId, session);
    const investedPaise = await syncUserInvestmentTotals(userId, session);

    return {
      success: true,
      message: 'Buy order executed successfully',
      order: order[0],
      newBalance: formatInrFromPaise(updatedWallet.balancePaise),
      totalInvestment: formatInrFromPaise(investedPaise),
    };
  });
}

async function executeSellOrder(userId, { stockSymbol, stockName, quantity, price, orderMode = 'MARKET' }) {
  const symbol = stockSymbol.toUpperCase();
  const instrument = await Instrument.findOne({ symbol, isTradable: true });
  if (!instrument) throw new Error(`Instrument not tradable: ${symbol}`);

  const { executedPricePaise } = await resolveExecutionPrice({
    symbol,
    orderMode,
    clientPriceInr: price,
  });

  const totalAmountPaise = executedPricePaise * quantity;

  return withOptionalTransaction(async (session) => {
    const holding = await Holding.findOne({ userId, symbol }).session(session || null);
    if (!holding) throw new Error(`You don't own any shares of ${symbol}`);
    if (holding.qty < quantity) {
      throw new Error(`Insufficient shares. Available: ${holding.qty}, Requested: ${quantity}`);
    }

    const soldInvestmentPaise = holding.avgPricePaise * quantity;
    const profitLossPaise = totalAmountPaise - soldInvestmentPaise;
    const profitLossPercentage = soldInvestmentPaise > 0
      ? (profitLossPaise / soldInvestmentPaise) * 100
      : 0;

    if (holding.qty === quantity) {
      await Holding.deleteOne({ _id: holding._id }).session(session || null);
    } else {
      holding.qty -= quantity;
      holding.investedPaise -= soldInvestmentPaise;
      holding.lastUpdated = new Date();
      await holding.save(session ? { session } : undefined);
    }

    const order = await Order.create(
      [{
        userId,
        symbol,
        stockName: stockName || instrument.name,
        orderType: 'SELL',
        quantity,
        requestedPricePaise: orderMode === 'MARKET' ? executedPricePaise : inrToPaise(price),
        executedPricePaise,
        totalAmountPaise,
        orderMode,
        orderStatus: 'COMPLETED',
        profitLossPaise,
        profitLossPercentage: parseFloat(profitLossPercentage.toFixed(2)),
      }],
      session ? { session } : undefined
    );

    const { wallet: creditedWallet, ledgerEntry } = await creditWallet(
      {
        userId,
        amountPaise: totalAmountPaise,
        reason: 'sell',
        refType: 'order',
        refId: order[0]._id,
        metadata: { symbol, quantity, orderMode },
      },
      session
    );

    await linkLedgerToOrder(ledgerEntry._id, order[0]._id, session);

    const user = await User.findById(userId).session(session || null);
    if (user) {
      user.totalPnLPaise = (user.totalPnLPaise || 0) + profitLossPaise;
      await user.save(session ? { session } : undefined);
    }

    const investedPaise = await syncUserInvestmentTotals(userId, session);

    return {
      success: true,
      message: 'Sell order executed successfully',
      order: order[0],
      newBalance: formatInrFromPaise(creditedWallet.balancePaise),
      totalInvestment: formatInrFromPaise(investedPaise),
      totalPnL: formatInrFromPaise(user?.totalPnLPaise || 0),
      profitLoss: formatInrFromPaise(profitLossPaise),
      profitLossPercentage,
    };
  });
}

module.exports = {
  executeBuyOrder,
  executeSellOrder,
  resolveExecutionPrice,
};
