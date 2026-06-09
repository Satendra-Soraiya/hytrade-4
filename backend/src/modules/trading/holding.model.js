const { Schema, model } = require('mongoose');

const HoldingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    symbol: { type: String, required: true, uppercase: true },
    stockName: { type: String, required: true },
    qty: { type: Number, required: true, min: 0 },
    avgPricePaise: { type: Number, required: true, min: 0 },
    investedPaise: { type: Number, required: true, min: 0 },
    purchaseDate: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: 'holdings_v2' }
);

HoldingSchema.index({ userId: 1, symbol: 1 }, { unique: true });

const OrderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    symbol: { type: String, required: true, uppercase: true },
    stockName: { type: String, required: true },
    orderType: { type: String, enum: ['BUY', 'SELL'], required: true },
    quantity: { type: Number, required: true, min: 1 },
    requestedPricePaise: { type: Number, required: true },
    executedPricePaise: { type: Number, required: true },
    totalAmountPaise: { type: Number, required: true },
    orderMode: { type: String, enum: ['MARKET', 'LIMIT', 'STOP_LOSS'], default: 'MARKET' },
    orderStatus: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'CANCELLED', 'FAILED'],
      default: 'COMPLETED',
    },
    profitLossPaise: { type: Number, default: null },
    profitLossPercentage: { type: Number, default: null },
    orderDate: { type: Date, default: Date.now },
    executedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: 'orders_v2' }
);

const Holding = model('Holding', HoldingSchema);
const Order = model('Order', OrderSchema);

module.exports = { Holding, Order };
