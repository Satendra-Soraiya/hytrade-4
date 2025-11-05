const { Schema } = require("mongoose");

const CustomUserSchema = new Schema({
  // Basic User Information
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // Trading Profile
  tradingExperience: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Professional'],
    default: 'Beginner'
  },
  riskTolerance: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  
  // Profile avatar
  profilePicture: {
    type: String,
    default: ''
  },
  profilePictureType: {
    type: String,
    enum: ['default', 'custom', ''],
    default: ''
  },
  
  // Account Information
  accountBalance: {
    type: Number,
    default: 100000 // Starting balance of ₹1,00,000
  },
  totalInvestment: {
    type: Number,
    default: 0
  },
  totalPnL: {
    type: Number,
    default: 0
  },
  
  // Personal Preferences
  preferredStocks: [{
    type: String
  }],
  watchlistStocks: [{
    symbol: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
CustomUserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for full name
CustomUserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Method to calculate portfolio value
CustomUserSchema.methods.calculatePortfolioValue = function() {
  return this.accountBalance + this.totalInvestment + this.totalPnL;
};

module.exports = { CustomUserSchema };
