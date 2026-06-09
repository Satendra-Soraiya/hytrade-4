const express = require('express');
const { authMiddleware } = require('../../shared/middleware/auth.middleware');
const {
  searchInstruments,
  getQuotesForSymbols,
  getMarketOverview,
} = require('./market-data.service');
const { getLogoSourceUrls } = require('./stock-logos');
const { paiseToInr } = require('../../shared/utils/money');

const router = express.Router();

router.get('/instruments', authMiddleware, async (req, res) => {
  try {
    const instruments = await searchInstruments({
      search: req.query.search || '',
      exchange: req.query.exchange || '',
      limit: parseInt(req.query.limit, 10) || 50,
    });
    res.json({ success: true, data: instruments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch instruments' });
  }
});

router.get('/quotes', authMiddleware, async (req, res) => {
  try {
    const raw = req.query.symbols || '';
    const symbols = String(raw).split(',').map((s) => s.trim()).filter(Boolean);
    const quotes = await getQuotesForSymbols(symbols);
    const data = Object.fromEntries(
      Object.entries(quotes).map(([symbol, q]) => [
        symbol,
        {
          symbol,
          ltp: paiseToInr(q.ltpPaise),
          change: paiseToInr(q.changePaise),
          changePercent: q.changePct,
          asOf: q.asOf,
        },
      ])
    );
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch quotes' });
  }
});

/** Public — <img> tags cannot send Authorization headers */
router.get('/logo/:symbol', async (req, res) => {
  try {
    const symbol = decodeURIComponent(req.params.symbol || '').trim();
    if (!symbol) return res.status(400).json({ success: false, message: 'Symbol required' });

    const sources = getLogoSourceUrls(symbol);
    for (const url of sources) {
      try {
        const response = await fetch(url, {
          headers: { 'User-Agent': 'Hytrade/1.0 (paper-trading)' },
          signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) continue;
        const buffer = Buffer.from(await response.arrayBuffer());
        if (!buffer.length) continue;
        const contentType = response.headers.get('content-type') || 'image/png';
        res.set('Content-Type', contentType);
        res.set('Cache-Control', 'public, max-age=604800, immutable');
        return res.send(buffer);
      } catch {
        // try next source
      }
    }
    return res.status(404).json({ success: false, message: 'Logo not found' });
  } catch (error) {
    console.error('Logo proxy error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch logo' });
  }
});

router.get('/indices', authMiddleware, async (req, res) => {
  try {
    const overview = await getMarketOverview();
    res.json({ success: true, data: overview.globalIndices });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch indices' });
  }
});

module.exports = router;
