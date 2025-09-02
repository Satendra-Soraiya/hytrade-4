import axios from 'axios';

const API_BASE_URL = 'http://localhost:3002';

const api = axios.create({
  baseURL: API_BASE_URL,
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
  login: (email, password) => api.post('/login', { email, password }),
  register: (userData) => api.post('/register', userData),
  getProfile: () => api.get('/profile'),
};

export const portfolioAPI = {
  getHoldings: () => api.get('/allHoldings'),
  getPositions: () => api.get('/allPositions'),
  getOrders: () => api.get('/allOrders'),
  getFunds: () => api.get('/funds'),
};

export const marketAPI = {
  getWatchlist: () => api.get('/custom/watchlist'),
  searchInstruments: (query) => api.get(`/search?q=${query}`),
  addToWatchlist: (symbol) => api.post('/custom/watchlist', { symbol }),
  removeFromWatchlist: (symbol) => api.delete(`/custom/watchlist/${symbol}`),
};

export default api;
