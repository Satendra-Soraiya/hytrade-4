const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

// Import our custom models
const { CustomUserModel } = require("./model/CustomUserModel");
const {
  CustomHoldingsModel,
  CustomOrdersModel,
  CustomPositionsModel,
  CustomWatchlistModel
} = require("./model/CustomTradingModels");

const app = express();
const PORT = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || "hytrade_custom_secret_2024";

// MongoDB connection
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/HYTRADE_CUSTOM";

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Custom JWT verification middleware
const verifyCustomToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
};

// CUSTOM AUTHENTICATION ROUTES

// Register new user
app.post("/custom/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, tradingExperience, riskTolerance } = req.body;

    // Check if user already exists
    const existingUser = await CustomUserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new CustomUserModel({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      tradingExperience: tradingExperience || 'Beginner',
      riskTolerance: riskTolerance || 'Medium',
      accountBalance: 100000, // Starting with ₹1,00,000
      watchlistStocks: [
        { symbol: 'RELIANCE', addedAt: new Date() },
        { symbol: 'TCS', addedAt: new Date() },
        { symbol: 'INFY', addedAt: new Date() }
      ]
    });

    await newUser.save();

    // Create initial sample holdings for new user
    const sampleHoldings = [
      {
        userId: newUser._id,
        stockSymbol: 'BHARTIARTL',
        stockName: 'Bharti Airtel Limited',
        quantity: 10,
        averagePrice: 850.00,
        currentPrice: 875.50,
        totalInvestment: 8500,
        currentValue: 8755,
        profitLoss: 255,
        profitLossPercentage: 3.00
      },
      {
        userId: newUser._id,
        stockSymbol: 'HDFCBANK',
        stockName: 'HDFC Bank Limited',
        quantity: 5,
        averagePrice: 1650.00,
        currentPrice: 1680.25,
        totalInvestment: 8250,
        currentValue: 8401.25,
        profitLoss: 151.25,
        profitLossPercentage: 1.83
      }
    ];

    await CustomHoldingsModel.insertMany(sampleHoldings);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        fullName: newUser.fullName,
        email: newUser.email,
        tradingExperience: newUser.tradingExperience,
        riskTolerance: newUser.riskTolerance,
        accountBalance: newUser.accountBalance
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Login user
app.post("/custom/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await CustomUserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        tradingExperience: user.tradingExperience,
        riskTolerance: user.riskTolerance,
        accountBalance: user.accountBalance,
        totalInvestment: user.totalInvestment,
        totalPnL: user.totalPnL
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// CUSTOM TRADING DATA ROUTES

// Get user's holdings
app.get("/custom/holdings", verifyCustomToken, async (req, res) => {
  try {
    const holdings = await CustomHoldingsModel.find({ userId: req.userId }).sort({ purchaseDate: -1 });
    
    console.log(`Fetching holdings for user: ${req.userEmail}, Found: ${holdings.length} holdings`);
    
    res.json({
      success: true,
      count: holdings.length,
      data: holdings
    });
  } catch (error) {
    console.error("Holdings fetch error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get user's orders
app.get("/custom/orders", verifyCustomToken, async (req, res) => {
  try {
    const orders = await CustomOrdersModel.find({ userId: req.userId }).sort({ orderDate: -1 });
    
    console.log(`Fetching orders for user: ${req.userEmail}, Found: ${orders.length} orders`);
    
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error("Orders fetch error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get user's watchlist
app.get("/custom/watchlist", verifyCustomToken, async (req, res) => {
  try {
    const user = await CustomUserModel.findById(req.userId).select('watchlistStocks');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Get watchlist with current prices (mock data for now)
    const watchlistWithPrices = user.watchlistStocks.map(stock => ({
      symbol: stock.symbol,
      name: stock.symbol, // In a real app, you'd fetch the company name from a stock API
      lastPrice: Math.round(Math.random() * 10000) / 100, // Mock price
      change: (Math.random() * 20 - 10).toFixed(2), // Mock change
      changePercent: (Math.random() * 5 - 2.5).toFixed(2), // Mock change percent
      addedAt: stock.addedAt
    }));
    
    res.json({
      success: true,
      data: watchlistWithPrices
    });
  } catch (error) {
    console.error("Watchlist fetch error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Add stock to watchlist
app.post("/custom/watchlist", verifyCustomToken, async (req, res) => {
  try {
    const { symbol } = req.body;
    
    if (!symbol) {
      return res.status(400).json({ message: "Stock symbol is required" });
    }
    
    const user = await CustomUserModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Check if already in watchlist
    const alreadyInWatchlist = user.watchlistStocks.some(
      stock => stock.symbol === symbol.toUpperCase()
    );
    
    if (alreadyInWatchlist) {
      return res.status(400).json({ message: "Stock already in watchlist" });
    }
    
    // Add to watchlist
    user.watchlistStocks.push({
      symbol: symbol.toUpperCase(),
      addedAt: new Date()
    });
    
    await user.save();
    
    res.json({
      success: true,
      message: "Stock added to watchlist",
      data: user.watchlistStocks
    });
  } catch (error) {
    console.error("Add to watchlist error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Remove stock from watchlist
app.delete("/custom/watchlist/:symbol", verifyCustomToken, async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const user = await CustomUserModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const initialLength = user.watchlistStocks.length;
    user.watchlistStocks = user.watchlistStocks.filter(
      stock => stock.symbol !== symbol.toUpperCase()
    );
    
    if (user.watchlistStocks.length === initialLength) {
      return res.status(404).json({ message: "Stock not found in watchlist" });
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: "Stock removed from watchlist",
      data: user.watchlistStocks
    });
  } catch (error) {
    console.error("Remove from watchlist error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Place new order
app.post("/custom/order", verifyCustomToken, async (req, res) => {
  try {
    const { stockSymbol, stockName, orderType, quantity, price } = req.body;
    const totalAmount = quantity * price;

    // Create new order
    const newOrder = new CustomOrdersModel({
      userId: req.userId,
      stockSymbol: stockSymbol.toUpperCase(),
      stockName,
      orderType: orderType.toUpperCase(),
      quantity,
      price,
      totalAmount,
      orderStatus: 'COMPLETED'
    });

    await newOrder.save();

    // Update holdings if it's a BUY order
    if (orderType.toUpperCase() === 'BUY') {
      const existingHolding = await CustomHoldingsModel.findOne({
        userId: req.userId,
        stockSymbol: stockSymbol.toUpperCase()
      });

      if (existingHolding) {
        // Update existing holding
        const newTotalQty = existingHolding.quantity + quantity;
        const newTotalInvestment = existingHolding.totalInvestment + totalAmount;
        const newAvgPrice = newTotalInvestment / newTotalQty;

        existingHolding.quantity = newTotalQty;
        existingHolding.averagePrice = newAvgPrice;
        existingHolding.totalInvestment = newTotalInvestment;
        existingHolding.currentPrice = price;
        existingHolding.currentValue = newTotalQty * price;
        existingHolding.profitLoss = existingHolding.currentValue - existingHolding.totalInvestment;
        existingHolding.profitLossPercentage = (existingHolding.profitLoss / existingHolding.totalInvestment) * 100;
        existingHolding.lastUpdated = new Date();

        await existingHolding.save();
      } else {
        // Create new holding
        const newHolding = new CustomHoldingsModel({
          userId: req.userId,
          stockSymbol: stockSymbol.toUpperCase(),
          stockName,
          quantity,
          averagePrice: price,
          currentPrice: price,
          totalInvestment: totalAmount,
          currentValue: totalAmount,
          profitLoss: 0,
          profitLossPercentage: 0
        });

        await newHolding.save();
      }

      // Update user's account balance and total investment
      const user = await CustomUserModel.findById(req.userId);
      user.accountBalance -= totalAmount;
      user.totalInvestment += totalAmount;
      await user.save();
    }

    console.log(`Order placed successfully for user: ${req.userEmail}, Order: ${orderType} ${quantity} ${stockSymbol} at ₹${price}`);

    res.json({
      success: true,
      message: "Order placed successfully!",
      order: newOrder
    });
  } catch (error) {
    console.error("Order placement error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get user profile
app.get("/custom/profile", verifyCustomToken, async (req, res) => {
  try {
    const user = await CustomUserModel.findById(req.userId).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        tradingExperience: user.tradingExperience,
        riskTolerance: user.riskTolerance,
        accountBalance: user.accountBalance,
        totalInvestment: user.totalInvestment,
        totalPnL: user.totalPnL,
        portfolioValue: user.calculatePortfolioValue(),
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      }
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Custom Hytrade Server started on port ${PORT}!`);
  mongoose.connect(MONGO_URL);
  console.log(`📊 Connected to MongoDB: ${MONGO_URL}`);
  console.log(`🔐 Using JWT Secret: ${JWT_SECRET.substring(0, 10)}...`);
});
