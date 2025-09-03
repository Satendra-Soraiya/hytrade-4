require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
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
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/fathersadvice?directConnection=true&serverSelectionTimeoutMS=2000";

const app = express();

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

// Initialize database connection
connectDB();

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
    /\.vercel\.app$/
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

// Session configuration with MongoDB store - Cross-Platform Support
app.use(session({
  secret: process.env.SESSION_SECRET || 'hytrade-session-secret-key-2024',
  name: 'hytrade.sid', // Custom session name
  resave: true, // Changed to true to ensure session is saved to store
  saveUninitialized: true, // Changed to true to save new sessions
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
    ttl: 24 * 60 * 60 // 24 hours in seconds
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true in production for HTTPS
    httpOnly: true, // Prevent XSS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-domain in production
    domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost', // Remove domain restriction in production
    path: '/' // Ensure cookie is sent for all paths
  }
}));

// JWT Verification Middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Auth verification endpoint
app.get("/auth/verify-token", verifyToken, async (req, res) => {
  try {
    // If we got here, the token is valid (thanks to verifyToken middleware)
    // Now get the full user data
    const user = await CustomUserModel.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      success: true, 
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        accountBalance: user.accountBalance
      }
    });
  } catch (error) {
    console.error('Error in verify-token:', error);
    res.status(500).json({ message: 'Server error during token verification' });
  }
});

// Authentication Routes
app.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await CustomUserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with all required fields for CustomUserModel
    const newUser = new CustomUserModel({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      tradingExperience: 'Beginner',
      riskTolerance: 'Medium',
      accountBalance: 100000,
      totalInvestment: 0,
      totalPnL: 0,
      watchlist: []
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ 
      userId: newUser._id,
      email: newUser.email
    }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        accountBalance: newUser.accountBalance
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await CustomUserModel.findOne({ email });
    if (!user) {
      console.log('Login failed: User not found for email', email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('Login failed: Invalid password for email', email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ 
      userId: user._id,
      email: user.email 
    }, JWT_SECRET, {
      expiresIn: "24h",
    });

    console.log('Login successful for user:', user.email);
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accountBalance: user.accountBalance
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Secure Signup Endpoint - Enhanced Security Implementation
app.post("/auth/signup", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Trim and lowercase email for consistency
    const normalizedEmail = email.trim().toLowerCase();

    // Email format validation (basic regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Password length validation (minimum 8 characters)
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }

    // Check if email already exists
    const existingUser = await CustomUserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password with bcrypt (12 salt rounds for enhanced security)
    const passwordHash = await bcrypt.hash(password, 12);

    // Create new user with secure fields
    const newUser = new CustomUserModel({
      email: normalizedEmail,
      password: passwordHash, // Store as passwordHash but using existing schema field
      firstName: firstName ? firstName.trim() : 'User', // Default to 'User' if not provided
      lastName: lastName ? lastName.trim() : normalizedEmail.split('@')[0], // Default to email prefix
      tradingExperience: 'Beginner',
      riskTolerance: 'Medium',
      accountBalance: 100000, // Default starting balance
      totalInvestment: 0,
      totalPnL: 0,
      preferredStocks: [],
      watchlistStocks: [],
      isActive: true,
      isVerified: false,
      createdAt: new Date()
    });

    // Save user to database
    await newUser.save();

    // Log successful registration (without sensitive data)
    console.log(`New user registered: ${normalizedEmail} at ${new Date().toISOString()}`);

    // Respond with success message (no sensitive data)
    res.status(201).json({ 
      message: "User registered successfully"
    });

  } catch (error) {
    // Log error without exposing sensitive information
    console.error('Signup error:', {
      message: error.message,
      timestamp: new Date().toISOString(),
      // Do not log passwords or sensitive data
    });
    
    res.status(500).json({ error: "Internal server error" });
  }
});

// Secure Login Endpoint - Enhanced Security Implementation with Sessions
app.post("/auth/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Trim and lowercase email for consistency
    const normalizedEmail = email.trim().toLowerCase();

    // Email format validation (basic regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Password length validation (minimum 8 characters)
    if (password.length < 8) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Look up user in MongoDB with normalized email
    const user = await CustomUserModel.findOne({ email: normalizedEmail });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Use bcrypt to compare submitted password with stored passwordHash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Regenerate session ID to prevent session fixation attacks
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regeneration error:', err);
        return res.status(500).json({ error: "Internal server error" });
      }

      // Create server-side session - store user's _id and role
      req.session.userId = user._id;
      req.session.userEmail = user.email;
      req.session.role = user.role || 'user'; // Default role if not specified
      req.session.isAuthenticated = true;
      req.session.loginTime = new Date();

      // Update user's last login time
      user.lastLoginAt = new Date();
      user.save().catch(err => console.error('Error updating last login:', err));

      // Save session before responding
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ error: "Internal server error" });
        }

        // Generate JWT token for cross-domain compatibility
        const token = jwt.sign(
          { 
            userId: user._id,
            email: user.email,
            role: user.role || 'user'
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        // Prepare response data
        const responseData = { 
          message: "Login successful",
          token: token,
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role || 'user',
            accountBalance: user.accountBalance,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt
          }
        };

        // Debug: Log what we're sending
        console.log('DEBUG: Sending response with token:', !!token);
        console.log('DEBUG: Response data:', JSON.stringify(responseData, null, 2));

        // Return success message with JWT token
        res.status(200).json(responseData);
      });
    });

  } catch (error) {
    // Log error without exposing sensitive information
    console.error('Login error:', {
      message: error.message,
      timestamp: new Date().toISOString(),
      // Do not log passwords or sensitive data
    });
    
    res.status(500).json({ error: "Internal server error" });
  }
});

// Protected route middleware - Enhanced Security Implementation
const authMiddleware = async (req, res, next) => {
  try {
    // Check if session exists and user is authenticated
    if (!req.session || !req.session.isAuthenticated || !req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    // Load fresh user data from database (never trust session data alone)
    const user = await CustomUserModel.findById(req.session.userId).select('-password');
    
    if (!user) {
      // User was deleted or doesn't exist anymore
      req.session.destroy(() => {});
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    // Attach full user object to request for use in protected routes
    req.user = user;
    req.userId = user._id;
    req.userEmail = user.email;
    req.userRole = user.role || 'user';
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Legacy alias for backward compatibility
const requireAuth = authMiddleware;

// Secure logout endpoint - Enhanced Security Implementation
app.post("/auth/logout", (req, res) => {
  if (req.session) {
    const userEmail = req.session.userEmail;
    
    // Destroy the session in MongoDB store
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({ error: "Could not log out" });
      }
      
      // Clear the session cookie (hytrade.sid)
      res.clearCookie('hytrade.sid', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      // Log successful logout (without sensitive data)
      console.log(`User logged out: ${userEmail || 'unknown'} at ${new Date().toISOString()}`);
      
      res.status(200).json({ message: "Logout successful" });
    });
  } else {
    res.status(200).json({ message: "Logout successful" });
  }
});

// Optional session verification route - Enhanced Implementation
app.get("/auth/verify-session", async (req, res) => {
  try {
    // Check if session exists and user is authenticated
    if (!req.session || !req.session.isAuthenticated || !req.session.userId) {
      return res.status(200).json({ authenticated: false });
    }
    
    // Load fresh user data from database (never trust session data alone)
    const user = await CustomUserModel.findById(req.session.userId).select('-password');
    
    if (!user) {
      // User was deleted, destroy session and return unauthenticated
      req.session.destroy(() => {});
      return res.status(200).json({ authenticated: false });
    }
    
    // Return authenticated status with user data
    res.status(200).json({
      authenticated: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role || 'user',
        accountBalance: user.accountBalance,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Session verification error:', error);
    // On error, return unauthenticated rather than 500 for security
    res.status(200).json({ authenticated: false });
  }
});

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
        role: req.userRole
      }
    });
  } catch (error) {
    console.error('Dashboard route error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Trading Data Routes - User-specific holdings
app.get("/allHoldings", authMiddleware, async (req, res) => {
  try {
    // Get holdings for the authenticated user only
    let userHoldings = await HoldingsModel.find({ userId: req.user.userId });
    
    // If user has no holdings, create some personalized default holdings
    if (userHoldings.length === 0) {
      const user = await CustomUserModel.findById(req.userId);
      const defaultHoldings = [
        { userId: req.userId, name: "BHARTIARTL", qty: 2, avg: 538.05, price: 541.15, net: "+0.58", day: "+6.20" },
        { userId: req.userId, name: "HDFCBANK", qty: 1, avg: 1383.4, price: 1522.35, net: "+10.04", day: "+138.95" },
        { userId: req.userId, name: "ICICIBANK", qty: 3, avg: 528.6, price: 648.4, net: "+22.63", day: "+359.40" }
      ];
      
      userHoldings = await HoldingsModel.insertMany(defaultHoldings);
      console.log(`Created default holdings for user: ${user.name}`);
    }
    
    res.json(userHoldings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/allPositions", async (req, res) => {
  try {
    let allPositions = await PositionsModel.find({});
    res.json(allPositions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/newOrder", authMiddleware, async (req, res) => {
  try {
    let newOrder = new OrdersModel({
      userId: req.userId, // Associate order with authenticated user
      name: req.body.name,
      qty: req.body.qty,
      price: req.body.price,
      mode: req.body.mode,
    });

    await newOrder.save();
    
    // Update user's holdings if it's a BUY order
    if (req.body.mode === 'BUY') {
      const existingHolding = await HoldingsModel.findOne({
        userId: req.userId,
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
          userId: req.userId,
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
    
    res.json({ message: "Order saved successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get user-specific orders (protected route)
app.get("/allOrders", authMiddleware, async (req, res) => {
  try {
    // Get orders for the authenticated user only
    const userOrders = await OrdersModel.find({ userId: req.userId }).sort({ timestamp: -1 });
    res.json(userOrders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get user profile (protected route)
app.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await CustomUserModel.findById(req.userId).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Watchlist Endpoints
app.get("/custom/watchlist", authMiddleware, async (req, res) => {
  try {
    const watchlist = await WatchlistModel.find({ userId: req.userId });
    res.json(watchlist);
  } catch (error) {
    res.status(500).json({ message: "Error fetching watchlist", error: error.message });
  }
});

app.post("/custom/watchlist", authMiddleware, async (req, res) => {
  try {
    const { symbol, name } = req.body;
    
    if (!symbol || !name) {
      return res.status(400).json({ message: "Symbol and name are required" });
    }
    
    // Check if already in watchlist
    const existing = await WatchlistModel.findOne({ 
      userId: req.userId, 
      symbol: symbol.toUpperCase() 
    });
    
    if (existing) {
      return res.status(400).json({ message: "Symbol already in watchlist" });
    }
    
    // Get current price (mock implementation - in real app, fetch from market data API)
    const mockPrice = (Math.random() * 1000 + 100).toFixed(2);
    const mockChange = (Math.random() * 20 - 10).toFixed(2);
    
    const watchlistItem = new WatchlistModel({
      userId: req.userId,
      symbol: symbol.toUpperCase(),
      name: name,
      currentPrice: parseFloat(mockPrice),
      change: parseFloat(mockChange),
      changePercent: parseFloat((mockChange / mockPrice * 100).toFixed(2))
    });
    
    await watchlistItem.save();
    res.status(201).json(watchlistItem);
  } catch (error) {
    res.status(500).json({ message: "Error adding to watchlist", error: error.message });
  }
});

app.delete("/custom/watchlist/:symbol", authMiddleware, async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const result = await WatchlistModel.findOneAndDelete({ 
      userId: req.userId, 
      symbol: symbol.toUpperCase() 
    });
    
    if (!result) {
      return res.status(404).json({ message: "Symbol not found in watchlist" });
    }
    
    res.json({ message: "Symbol removed from watchlist" });
  } catch (error) {
    res.status(500).json({ message: "Error removing from watchlist", error: error.message });
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
