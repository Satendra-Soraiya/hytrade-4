import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://hytrade-backend.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (userData) => api.post('/api/auth/register', userData),
  getProfile: () => api.get('/api/auth/profile'),
};

export const portfolioAPI = {
  getHoldings: () => api.get('/api/trading/holdings'),
  getPositions: () => api.get('/api/trading/positions'),
  getOrders: () => api.get('/api/trading/orders'),
  getPortfolioSummary: () => api.get('/api/trading/portfolio/summary'),
  placeOrder: (orderData) => api.post('/api/trading/order', orderData),
};

export const marketAPI = {
  getWatchlist: () => api.get('/custom/watchlist'),
  searchInstruments: (query) => api.get(`/search?q=${query}`),
  addToWatchlist: (symbol) => api.post('/custom/watchlist', { symbol }),
  removeFromWatchlist: (symbol) => api.delete(`/custom/watchlist/${symbol}`),
};

export default api;
