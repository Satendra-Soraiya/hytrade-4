const { config } = require('../../config/env');
const { Instrument, QuoteCache } = require('./instrument.model');
const { FinnhubProvider } = require('./providers/finnhub.provider');
const { paiseToInr } = require('../../shared/utils/money');

let provider;

function getProvider() {
  if (provider) return provider;
  if (config.marketDataProvider === 'finnhub') {
    provider = new FinnhubProvider();
    return provider;
  }
  throw new Error(`Unsupported MARKET_DATA_PROVIDER: ${config.marketDataProvider}`);
}

async function getCachedQuote(symbol) {
  const upper = symbol.toUpperCase();
  const cached = await QuoteCache.findOne({ symbol: upper });
  if (!cached) return null;
  const age = Date.now() - new Date(cached.asOf).getTime();
  if (age > config.quoteCacheTtlMs) return null;
  return cached;
}

async function upsertQuoteCache(symbol, quote) {
  return QuoteCache.findOneAndUpdate(
    { symbol: symbol.toUpperCase() },
    {
      symbol: symbol.toUpperCase(),
      ltpPaise: quote.ltpPaise,
      changePaise: quote.changePaise,
      changePct: quote.changePct,
      volume: quote.volume || 0,
      asOf: quote.asOf || new Date(),
    },
    { upsert: true, new: true }
  );
}

function buildReferenceQuote(instrument) {
  return {
    ltpPaise: instrument.referencePricePaise,
    changePaise: 0,
    changePct: 0,
    volume: 0,
    asOf: new Date(),
  };
}

async function getQuoteForSymbol(symbol, { bypassCache = false } = {}) {
  const upper = symbol.toUpperCase();

  if (!bypassCache) {
    const cached = await getCachedQuote(upper);
    if (cached) return cached;
  }

  const instrument = await Instrument.findOne({ symbol: upper, isTradable: true });
  if (!instrument) {
    throw new Error(`Instrument not found or not tradable: ${upper}`);
  }

  try {
    const quote = await getProvider().getQuote(instrument.symbol, instrument.exchange);
    return upsertQuoteCache(upper, quote);
  } catch (err) {
    if (instrument.referencePricePaise) {
      console.warn(`Using reference price for ${upper}: ${err.message}`);
      return upsertQuoteCache(upper, buildReferenceQuote(instrument));
    }
    throw new Error(`Market quote unavailable for ${upper}. Configure a valid MARKET_DATA_API_KEY.`);
  }
}

async function getQuotesForSymbols(symbols = [], options = {}) {
  const unique = [...new Set(symbols.map((s) => String(s).toUpperCase()))];
  const results = {};
  for (const symbol of unique) {
    try {
      results[symbol] = await getQuoteForSymbol(symbol, options);
    } catch (err) {
      console.warn(`getQuotesForSymbols: ${symbol} - ${err.message}`);
    }
  }
  return results;
}

async function searchInstruments({ search = '', exchange = '', limit = 50 } = {}) {
  const query = { isTradable: true };
  if (exchange) query.exchange = exchange.toUpperCase();
  if (search) {
    const regex = new RegExp(search.trim(), 'i');
    query.$or = [{ symbol: regex }, { name: regex }];
  }
  return Instrument.find(query).sort({ symbol: 1 }).limit(limit).lean();
}

async function getMarketOverview() {
  const instruments = await Instrument.find({ isTradable: true }).sort({ symbol: 1 }).limit(30).lean();
  const symbols = instruments.map((i) => i.symbol);
  const quotes = await getQuotesForSymbols(symbols);

  const movers = instruments
    .map((inst) => {
      const q = quotes[inst.symbol];
      if (!q) return null;
      return {
        symbol: inst.symbol,
        name: inst.name,
        price: paiseToInr(q.ltpPaise),
        change: paiseToInr(q.changePaise),
        changePercent: q.changePct,
        volume: String(q.volume || 0),
        marketCap: '—',
        sector: inst.sector,
      };
    })
    .filter(Boolean);

  const sorted = [...movers].sort((a, b) => b.changePercent - a.changePercent);
  const topGainers = sorted.filter((m) => m.changePercent >= 0).slice(0, 5);
  const topLosers = [...sorted].reverse().filter((m) => m.changePercent < 0).slice(0, 5);

  let globalIndices = [];
  try {
    globalIndices = await getProvider().getIndices();
  } catch (err) {
    console.warn('Index fetch failed:', err.message);
  }

  return {
    globalIndices,
    topGainers,
    topLosers,
    volumeLeaders: movers.slice(0, 5).map((m) => ({
      symbol: m.symbol,
      name: m.name,
      price: m.price,
      volume: m.volume,
      avgVolume: m.volume,
      volumeRatio: 1,
      sector: m.sector,
    })),
    sectorPerformance: [],
  };
}

async function refreshInstrumentQuotes() {
  const instruments = await Instrument.find({ isTradable: true }).select('symbol exchange referencePricePaise').lean();
  for (const inst of instruments) {
    try {
      const quote = await getProvider().getQuote(inst.symbol, inst.exchange);
      await upsertQuoteCache(inst.symbol, quote);
    } catch (err) {
      if (inst.referencePricePaise) {
        await upsertQuoteCache(inst.symbol, buildReferenceQuote(inst));
      } else {
        console.warn(`Background quote refresh failed for ${inst.symbol}:`, err.message);
      }
    }
  }
}

function startQuoteRefreshJob() {
  const intervalMs = Math.max(config.quoteCacheTtlMs, 60000);
  setInterval(() => {
    refreshInstrumentQuotes().catch((err) => console.error('Quote refresh job error:', err));
  }, intervalMs);
}

module.exports = {
  getProvider,
  getQuoteForSymbol,
  getQuotesForSymbols,
  searchInstruments,
  getMarketOverview,
  startQuoteRefreshJob,
  upsertQuoteCache,
};
