const { Schema, model } = require('mongoose');

const InstrumentSchema = new Schema(
  {
    symbol: { type: String, required: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    exchange: { type: String, enum: ['NSE', 'BSE'], default: 'NSE' },
    isin: { type: String, default: null },
    sector: { type: String, default: 'General' },
    isTradable: { type: Boolean, default: true },
    lotSize: { type: Number, default: 1, min: 1 },
    providerSymbol: { type: String, default: null },
    referencePricePaise: { type: Number, default: null },
  },
  { timestamps: true, collection: 'instruments' }
);

InstrumentSchema.index({ symbol: 1, exchange: 1 }, { unique: true });
InstrumentSchema.index({ name: 'text', symbol: 'text' });

const QuoteCacheSchema = new Schema(
  {
    symbol: { type: String, required: true, uppercase: true, unique: true },
    ltpPaise: { type: Number, required: true },
    changePaise: { type: Number, default: 0 },
    changePct: { type: Number, default: 0 },
    volume: { type: Number, default: 0 },
    asOf: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: 'quote_cache' }
);

const Instrument = model('Instrument', InstrumentSchema);
const QuoteCache = model('QuoteCache', QuoteCacheSchema);

module.exports = { Instrument, QuoteCache };
