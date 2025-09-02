const { Schema } = require("mongoose");

// Custom User Holdings Schema
const CustomHoldingsSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'CustomUser',
    required: true
  },
  stockSymbol: {
    type: String,
    required: true,
    uppercase: true
  },
  stockName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  averagePrice: {
    type: Number,
    required: true,
    min: 0
  },
  currentPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalInvestment: {
    type: Number,
    required: true
  },
  currentValue: {
    type: Number,
    required: true
  },
  profitLoss: {
    type: Number,
    required: true
  },
  profitLossPercentage: {
    type: Number,
    required: true
  },
  dayChange: {
    type: Number,
    default: 0
  },
  dayChangePercentage: {
    type: Number,
    default: 0
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Custom User Orders Schema
const CustomOrdersSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'CustomUser',
    required: true
  },
  stockSymbol: {
    type: String,
    required: true,
    uppercase: true
  },
  stockName: {
    type: String,
    required: true
  },
  orderType: {
    type: String,
    enum: ['BUY', 'SELL'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  orderStatus: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'CANCELLED', 'FAILED'],
    default: 'COMPLETED'
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  executedAt: {
    type: Date,
    default: Date.now
  }
});

// Custom User Positions Schema (for day trading)
const CustomPositionsSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'CustomUser',
    required: true
  },
  stockSymbol: {
    type: String,
    required: true,
    uppercase: true
  },
  stockName: {
    type: String,
    required: true
  },
  positionType: {
    type: String,
    enum: ['LONG', 'SHORT'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  entryPrice: {
    type: Number,
    required: true
  },
  currentPrice: {
    type: Number,
    required: true
  },
  profitLoss: {
    type: Number,
    required: true
  },
  profitLossPercentage: {
    type: Number,
    required: true
  },
  openedAt: {
    type: Date,
    default: Date.now
  },
  isOpen: {
    type: Boolean,
    default: true
  }
});

// Custom User Watchlist Schema
const CustomWatchlistSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'CustomUser',
    required: true
  },
  stockSymbol: {
    type: String,
    required: true,
    uppercase: true
  },
  stockName: {
    type: String,
    required: true
  },
  currentPrice: {
    type: Number,
    required: true
  },
  dayChange: {
    type: Number,
    default: 0
  },
  dayChangePercentage: {
    type: Number,
    default: 0
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  alertPrice: {
    type: Number,
    default: null
  },
  notes: {
    type: String,
    default: ''
  }
});

module.exports = {
  CustomHoldingsSchema,
  CustomOrdersSchema,
  CustomPositionsSchema,
  CustomWatchlistSchema
};
