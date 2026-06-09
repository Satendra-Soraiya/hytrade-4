const express = require('express');
const { body, param } = require('express-validator');
const { authMiddleware } = require('../../shared/middleware/auth.middleware');
const { handleValidationErrors } = require('../../shared/middleware/validation.middleware');
const { listWatchlist, addToWatchlist, removeFromWatchlist } = require('./watchlist.service');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const items = await listWatchlist(req.user.id);
    res.json({ success: true, watchlist: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch watchlist' });
  }
});

router.post(
  '/',
  authMiddleware,
  [
    body('symbol').trim().notEmpty().isLength({ max: 20 }).matches(/^[A-Za-z0-9&.-]+$/),
    body('stockName').optional().trim().isLength({ max: 100 }),
    body('notes').optional().trim().isLength({ max: 500 }),
    body('alertPrice').optional().isFloat({ min: 0.01 }),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const item = await addToWatchlist(req.user.id, req.body);
      res.status(201).json({ success: true, message: 'Added to watchlist', item });
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 400;
      res.status(status).json({ success: false, message: error.message });
    }
  }
);

router.delete(
  '/:symbol',
  authMiddleware,
  [
    param('symbol').trim().notEmpty().matches(/^[A-Za-z0-9&.-]+$/),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      await removeFromWatchlist(req.user.id, req.params.symbol);
      res.json({ success: true, message: 'Removed from watchlist' });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }
);

module.exports = router;
