const { Schema, model } = require('mongoose');

const WatchlistSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    symbol: { type: String, required: true, uppercase: true },
    stockName: { type: String, required: true },
    notes: { type: String, default: '' },
    alertPricePaise: { type: Number, default: null },
    addedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: 'watchlists_v2' }
);

WatchlistSchema.index({ userId: 1, symbol: 1 }, { unique: true });

const Watchlist = model('Watchlist', WatchlistSchema);

module.exports = { Watchlist };
