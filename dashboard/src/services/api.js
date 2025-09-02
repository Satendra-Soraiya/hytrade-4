import axios from 'axios';

const API_BASE_URL = 'http://localhost:3002';

// Create axios instance with base URL and common headers
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method.toUpperCase()} ${config.url}`, {
      data: config.data,
      params: config.params,
      headers: config.headers
    });
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log(`[API] Response ${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('[API] Response error:', {
      message: error.message,
      config: error.config,
      response: error.response?.data,
      status: error.response?.status
    });
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  register: (userData) => api.post('/register', userData),
  getProfile: () => api.get('/profile'),
};

// Market data API
export const marketAPI = {
  // Get user's watchlist from backend
  getWatchlist: () => api.get('/custom/watchlist'),
  // Add stock to watchlist
  addToWatchlist: (symbol) => api.post('/custom/watchlist', { symbol }),
  // Remove stock from watchlist
  removeFromWatchlist: (symbol) => api.delete(`/custom/watchlist/${symbol}`),
  
  // Mock quotes data
  getQuotes: (symbols) => {
    const mockQuotes = {
      'RELIANCE,NIFTY50,NIFTYBANK': {
        'RELIANCE': { price: 2456.50, change: '+12.50', changePercent: '+0.51%' },
        'NIFTY50': { price: 18181.75, change: '-104.75', changePercent: '-0.57%' },
        'NIFTYBANK': { price: 42650.80, change: '-320.45', changePercent: '-0.75%' }
      }
    };
    return Promise.resolve({ data: mockQuotes[symbols] || {} });
  },
  
  // Mock historical data
  getHistoricalData: (symbol, interval = '1d', range = '1mo') => {
    // Generate mock historical data
    const data = [];
    let price = 1000;
    const now = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      price += (Math.random() - 0.5) * 20;
      if (price < 900) price = 900 + Math.random() * 50;
      if (price > 1100) price = 1100 - Math.random() * 50;
      
      data.push({
        date: date.toISOString().split('T')[0],
        open: price - 10 + Math.random() * 20,
        high: price + 5 + Math.random() * 10,
        low: price - 15 - Math.random() * 10,
        close: price,
        volume: Math.floor(1000000 + Math.random() * 5000000)
      });
    }
    
    return Promise.resolve({ data });
  }
};

export const portfolioAPI = {
  getHoldings: () => api.get('/allHoldings'),
  getPositions: () => api.get('/allPositions'),
  getOrders: () => api.get('/allOrders'),
  placeOrder: (orderData) => api.post('/newOrder', orderData),
  cancelOrder: (orderId) => api.delete(`/cancelOrder/${orderId}`),
};

export const fundsAPI = {
  // Get user's funds/balance
  getFunds: () => api.get('/funds'),
  // Add funds to user's account
  addFunds: (amount) => api.post('/funds/deposit', { amount }),
  // Withdraw funds from user's account
  withdrawFunds: (amount) => api.post('/funds/withdraw', { amount }),
  // Get transaction history
  getTransactions: () => api.get('/funds/transactions'),
};

export default api;
