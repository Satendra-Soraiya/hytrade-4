require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const rateLimit = require("express-rate-limit");

// Import Models
const { CustomUserModel } = require("./model/CustomUserModel");
const { HoldingsModel } = require("./model/HoldingsModel");
const { PositionsModel } = require("./model/PositionsModel");
const { OrdersModel } = require("./model/OrdersModel");
const { WatchlistModel } = require("./model/WatchlistModel");

// Configuration
const PORT = process.env.PORT || 3002;
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/fathersadvice?directConnection=true&serverSelectionTimeoutMS=2000";

const app = express();

// Trust proxy for Render deployment
app.set('trust proxy', 1);

// Database connection
async function connectDB() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    console.log('✅ MongoDB Atlas connected successfully');
    
    // Create test user after successful connection
    await createTestUser();
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('Please check your internet connection and MongoDB Atlas settings');
    process.exit(1);
  }
}

// Create or update test user
async function createTestUser() {
  try {
    const testEmail = 'test@example.com';
    const testPassword = 'password123';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    // Find or create the test user with all required fields for CustomUserModel
    const result = await CustomUserModel.findOneAndUpdate(
      { email: testEmail },
      {
        $setOnInsert: {
          firstName: 'Test',
          lastName: 'User',
          email: testEmail,
          password: hashedPassword,
          tradingExperience: 'Intermediate',
          riskTolerance: 'Medium',
          accountBalance: 100000,
          totalInvestment: 0,
          totalPnL: 0,
          watchlist: [],
          createdAt: new Date()
        }
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );
    
    console.log('Test user ensured:', result ? 'Updated existing user' : 'Created new user');
  } catch (error) {
    console.error('Error ensuring test user:', error);
  }
}

// Configure CORS with specific options
const corsOptions = {
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001',
    'https://hytrade-frontend-gqvf8c92x-satendra-soraiya-s-projects.vercel.app',
    'https://hytrade-dashboard-88t9jtiu5-satendra-soraiya-s-projects.vercel.app',
    'https://new-dashboard-8gb7pxajw-satendra-soraiya-s-projects.vercel.app',
    /\.vercel\.app$/,
    /hytrade.*\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

// Apply CORS middleware with options
app.use(cors(corsOptions));

// Handle pre-flight requests
app.options('*', cors(corsOptions));

// Parse JSON bodies
app.use(bodyParser.json());
app.use(express.json());

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: {
    error: "Too many login attempts, please try again later"
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests
  skipSuccessfulRequests: true
});

// Simple Authentication System
const activeTokens = new Map(); // In-memory token storage (use Redis in production)

// Generate simple token
function generateAuthToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Clean up expired tokens periodically
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of activeTokens.entries()) {
    if (now > data.expiresAt) {
      activeTokens.delete(token);
    }
  }
}, 60 * 60 * 1000); // Clean up every hour

// New Signup/Register Endpoint
app.post("/auth/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required",
        error: "Missing required fields: firstName, lastName, email, password"
      });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 8 characters long",
        error: "Password must be at least 8 characters long"
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid email format",
        error: "Invalid email format"
      });
    }

    // Check if user already exists
    const existingUser = await CustomUserModel.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "Email already registered",
        error: "Email already registered. Please use a different email or try logging in."
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new CustomUserModel({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      tradingExperience: 'Beginner',
      riskTolerance: 'Low',
      accountBalance: 100000, // Starting balance
      totalInvestment: 0,
      totalPnL: 0,
      watchlist: [],
      createdAt: new Date()
    });

    await newUser.save();

    console.log(`New user registered: ${email} at ${new Date().toISOString()}`);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        accountBalance: newUser.accountBalance
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Server error during registration",
      error: error.message 
    });
  }
});

// New Login Endpoint - Replace existing /auth/login
app.post("/auth/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await CustomUserModel.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Generate auth token
    const authToken = generateAuthToken();
    
    // Store token with user data (expires in 24 hours)
    activeTokens.set(authToken, {
      userId: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      accountBalance: user.accountBalance,
      role: user.role || 'user',
      createdAt: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    });

    console.log(`User logged in: ${email} with token: ${authToken}`);

    // Return success with token and user data
    res.status(200).json({
      success: true,
      message: "Login successful",
      authToken: authToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accountBalance: user.accountBalance
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Token Validation Endpoint - Replace existing /auth/verify-token
app.get("/auth/user/:token", async (req, res) => {
  try {
    const { token } = req.params;
    console.log(`Token validation request for: ${token}`);
    
    // Check if token exists and is valid
    const tokenData = activeTokens.get(token);
    if (!tokenData) {
      console.log('Token not found in active tokens');
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    
    // Check if token is expired
    if (Date.now() > tokenData.expiresAt) {
      console.log('Token expired, removing from active tokens');
      activeTokens.delete(token);
      return res.status(401).json({ success: false, message: "Token expired" });
    }
    
    console.log(`Token valid for user: ${tokenData.email}`);
    
    // Return user data
    res.json({
      success: true,
      authenticated: true,
      user: {
        id: tokenData.userId,
        firstName: tokenData.firstName,
        lastName: tokenData.lastName,
        email: tokenData.email,
        accountBalance: tokenData.accountBalance,
        role: tokenData.role
      }
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Logout Endpoint
app.post("/auth/logout", (req, res) => {
  try {
    const { token } = req.body;
    if (token && activeTokens.has(token)) {
      activeTokens.delete(token);
      console.log(`Token invalidated: ${token}`);
    }
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Protected route middleware
const authMiddleware = async (req, res, next) => {
  try {
    // Check if token exists and is valid
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    
    const tokenData = activeTokens.get(token);
    if (!tokenData) {
      console.log('Token not found in active tokens');
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    
    // Check if token is expired
    if (Date.now() > tokenData.expiresAt) {
      console.log('Token expired, removing from active tokens');
      activeTokens.delete(token);
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    
    // Attach full user object to request for use in protected routes
    req.user = {
      id: tokenData.userId,
      firstName: tokenData.firstName,
      lastName: tokenData.lastName,
      email: tokenData.email,
      accountBalance: tokenData.accountBalance,
      role: tokenData.role
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Example protected route - Dashboard Access
app.get("/api/dashboard", authMiddleware, async (req, res) => {
  try {
    // req.user is available thanks to authMiddleware
    res.status(200).json({
      message: `Welcome, ${req.user.email}`,
      user: {
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        accountBalance: req.user.accountBalance,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Dashboard route error:', error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Trading Data Routes - User-specific holdings
app.get("/allHoldings", authMiddleware, async (req, res) => {
  try {
    // Get holdings for the authenticated user only
    let userHoldings = await HoldingsModel.find({ userId: req.user.id });
    
    // If user has no holdings, create some personalized default holdings
    if (userHoldings.length === 0) {
      const user = await CustomUserModel.findById(req.user.id);
      const defaultHoldings = [
        { userId: req.user.id, name: "BHARTIARTL", qty: 2, avg: 538.05, price: 541.15, net: "+0.58", day: "+6.20" },
        { userId: req.user.id, name: "HDFCBANK", qty: 1, avg: 1383.4, price: 1522.35, net: "+10.04", day: "+138.95" },
        { userId: req.user.id, name: "ICICIBANK", qty: 3, avg: 528.6, price: 648.4, net: "+22.63", day: "+359.40" }
      ];
      
      userHoldings = await HoldingsModel.insertMany(defaultHoldings);
      console.log(`Created default holdings for user: ${user.name}`);
    }
    
    res.json(userHoldings);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

app.get("/allPositions", async (req, res) => {
  try {
    let allPositions = await PositionsModel.find({});
    res.json(allPositions);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

app.post("/newOrder", authMiddleware, async (req, res) => {
  try {
    let newOrder = new OrdersModel({
      userId: req.user.id, // Associate order with authenticated user
      name: req.body.name,
      qty: req.body.qty,
      price: req.body.price,
      mode: req.body.mode,
    });

    await newOrder.save();
    
    // Update user's holdings if it's a BUY order
    if (req.body.mode === 'BUY') {
      const existingHolding = await HoldingsModel.findOne({
        userId: req.user.id,
        name: req.body.name
      });
      
      if (existingHolding) {
        // Update existing holding
        const totalQty = existingHolding.qty + req.body.qty;
        const newAvg = ((existingHolding.avg * existingHolding.qty) + (req.body.price * req.body.qty)) / totalQty;
        
        existingHolding.qty = totalQty;
        existingHolding.avg = newAvg;
        existingHolding.price = req.body.price;
        await existingHolding.save();
      } else {
        // Create new holding
        const newHolding = new HoldingsModel({
          userId: req.user.id,
          name: req.body.name,
          qty: req.body.qty,
          avg: req.body.price,
          price: req.body.price,
          net: "0.00",
          day: "0.00"
        });
        await newHolding.save();
      }
    }
    
    res.json({ success: true, message: "Order saved successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// Get user-specific orders (protected route)
app.get("/allOrders", authMiddleware, async (req, res) => {
  try {
    // Get orders for the authenticated user only
    const userOrders = await OrdersModel.find({ userId: req.user.id }).sort({ timestamp: -1 });
    res.json(userOrders);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// Get user profile (protected route)
app.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await CustomUserModel.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// Watchlist Endpoints
app.get("/custom/watchlist", authMiddleware, async (req, res) => {
  try {
    const watchlist = await WatchlistModel.find({ userId: req.user.id });
    res.json(watchlist);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching watchlist", error: error.message });
  }
});

app.post("/custom/watchlist", authMiddleware, async (req, res) => {
  try {
    const { symbol, name } = req.body;
    
    if (!symbol || !name) {
      return res.status(400).json({ success: false, message: "Symbol and name are required" });
    }
    
    // Check if already in watchlist
    const existing = await WatchlistModel.findOne({ 
      userId: req.user.id, 
      symbol: symbol.toUpperCase() 
    });
    
    if (existing) {
      return res.status(400).json({ success: false, message: "Symbol already in watchlist" });
    }
    
    // Get current price (mock implementation - in real app, fetch from market data API)
    const mockPrice = (Math.random() * 1000 + 100).toFixed(2);
    const mockChange = (Math.random() * 20 - 10).toFixed(2);
    
    const watchlistItem = new WatchlistModel({
      userId: req.user.id,
      symbol: symbol.toUpperCase(),
      name: name,
      currentPrice: parseFloat(mockPrice),
      change: parseFloat(mockChange),
      changePercent: parseFloat((mockChange / mockPrice * 100).toFixed(2))
    });
    
    await watchlistItem.save();
    res.status(201).json(watchlistItem);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding to watchlist", error: error.message });
  }
});

app.delete("/custom/watchlist/:symbol", authMiddleware, async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const result = await WatchlistModel.findOneAndDelete({ 
      userId: req.user.id, 
      symbol: symbol.toUpperCase() 
    });
    
    if (!result) {
      return res.status(404).json({ success: false, message: "Symbol not found in watchlist" });
    }
    
    res.json({ success: true, message: "Symbol removed from watchlist" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error removing from watchlist", error: error.message });
  }
});

// Start the server after database connection is established
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`App started on port ${PORT}!`);
  });
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
