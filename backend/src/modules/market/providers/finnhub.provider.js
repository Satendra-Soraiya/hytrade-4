const { config } = require('../../../config/env');
const { inrToPaise } = require('../../../shared/utils/money');

const INDEX_SYMBOLS = {
  NIFTY: '^NSEI',
  SENSEX: '^BSESN',
  BANKNIFTY: '^NSEBANK',
};

function toProviderEquitySymbol(symbol, exchange = 'NSE') {
  const base = String(symbol).toUpperCase().replace(/\.(NS|BO)$/i, '');
  if (exchange === 'BSE') return `${base}.BO`;
  return `${base}.NS`;
}

async function fetchQuote(providerSymbol) {
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(providerSymbol)}&token=${config.marketDataApiKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Finnhub quote failed (${res.status}) for ${providerSymbol}`);
  }
  const data = await res.json();
  if (!data || typeof data.c !== 'number' || data.c <= 0) {
    throw new Error(`No valid quote for ${providerSymbol}`);
  }
  return {
    ltpPaise: inrToPaise(data.c),
    changePaise: inrToPaise(data.d || 0),
    changePct: Number(data.dp || 0),
    volume: 0,
    asOf: new Date(),
  };
}

class FinnhubProvider {
  async getQuote(symbol, exchange = 'NSE') {
    const providerSymbol = toProviderEquitySymbol(symbol, exchange);
    return fetchQuote(providerSymbol);
  }

  async getQuotes(symbols = []) {
    const results = {};
    for (const item of symbols) {
      const symbol = typeof item === 'string' ? item : item.symbol;
      const exchange = typeof item === 'string' ? 'NSE' : item.exchange || 'NSE';
      try {
        results[symbol.toUpperCase()] = await this.getQuote(symbol, exchange);
      } catch (err) {
        console.warn(`Quote fetch failed for ${symbol}:`, err.message);
      }
    }
    return results;
  }

  async getIndices() {
    const indices = [];
    for (const [name, providerSymbol] of Object.entries(INDEX_SYMBOLS)) {
      try {
        const quote = await fetchQuote(providerSymbol);
        indices.push({
          name,
          symbol: name,
          value: quote.ltpPaise / 100,
          change: quote.changePaise / 100,
          changePercent: quote.changePct,
          country: 'India',
          flag: '🇮🇳',
        });
      } catch (err) {
        console.warn(`Index fetch failed for ${name}:`, err.message);
      }
    }
    return indices;
  }
}

module.exports = { FinnhubProvider, toProviderEquitySymbol };
