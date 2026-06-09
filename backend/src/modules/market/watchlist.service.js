const { Watchlist } = require('./watchlist.model');
const { Instrument } = require('./instrument.model');
const { getQuotesForSymbols } = require('./market-data.service');
const { paiseToInr } = require('../../shared/utils/money');

async function listWatchlist(userId) {
  const items = await Watchlist.find({ userId }).sort({ addedAt: -1 }).lean();
  const symbols = items.map((i) => i.symbol);
  const quotes = await getQuotesForSymbols(symbols);

  return items.map((item) => {
    const quote = quotes[item.symbol];
    return {
      _id: item._id,
      symbol: item.symbol,
      stockName: item.stockName,
      notes: item.notes,
      alertPrice: item.alertPricePaise != null ? paiseToInr(item.alertPricePaise) : null,
      addedAt: item.addedAt,
      price: quote ? paiseToInr(quote.ltpPaise) : null,
      change: quote ? paiseToInr(quote.changePaise) : null,
      changePercent: quote ? quote.changePct : null,
    };
  });
}

async function addToWatchlist(userId, { symbol, stockName, notes, alertPrice }) {
  const upper = symbol.toUpperCase();
  const instrument = await Instrument.findOne({ symbol: upper, isTradable: true });
  if (!instrument) {
    throw new Error(`Instrument not found: ${upper}`);
  }

  const existing = await Watchlist.findOne({ userId, symbol: upper });
  if (existing) {
    return existing;
  }

  const created = await Watchlist.create({
    userId,
    symbol: upper,
    stockName: stockName || instrument.name,
    notes: notes || '',
    alertPricePaise: alertPrice != null ? Math.round(Number(alertPrice) * 100) : null,
  });

  return created;
}

async function removeFromWatchlist(userId, symbol) {
  const result = await Watchlist.deleteOne({ userId, symbol: symbol.toUpperCase() });
  if (result.deletedCount === 0) {
    throw new Error(`Symbol not in watchlist: ${symbol}`);
  }
  return { removed: true };
}

module.exports = {
  listWatchlist,
  addToWatchlist,
  removeFromWatchlist,
};
