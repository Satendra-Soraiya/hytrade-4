import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  // Auto-detect development environment
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const API_URL = import.meta.env.VITE_API_URL || 
    (isDevelopment ? 'http://localhost:3002' : 'https://hytrade-backend.onrender.com');

  // Check for token in URL on initial load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get('token');
    
    const initializeAuth = async () => {
      try {
        if (urlToken) {
          // Remove token from URL
          window.history.replaceState({}, document.title, window.location.pathname);
          await validateToken(urlToken);
        } else if (token) {
          await validateToken(token);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const validateToken = async (authToken) => {
    try {
      console.log('Validating token...');
      const response = await fetch(`${API_URL}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const { user: userData } = data;
        if (userData) {
          console.log('Token valid for user:', userData.email);
          setUser(userData);
          setToken(authToken);
          localStorage.setItem('token', authToken);
          return true;
        }
      }
      throw new Error('Invalid or expired token');
    } catch (error) {
      console.error('Token validation failed:', error);
      logout();
      return false;
    }
  };

  const login = async (authToken) => {
    try {
      const isValid = await validateToken(authToken);
      if (isValid) {
        // Wait a bit more to ensure state is fully updated
        await new Promise(resolve => setTimeout(resolve, 100));
        return true;
      }
      return false;
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    console.log('Logging out...');
    
    // Call backend logout to deactivate session
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
    
    // Clear all session data
    setUser(null);
    setToken('');
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('session');
    localStorage.removeItem('isLoggedIn');
    
    // Redirect to frontend with logout message
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const envFrontend = import.meta.env.VITE_FRONTEND_URL;
    // Point to landing (frontend2). Local: Next dev on 3000. Prod: Vercel app.
    const fallbackFrontend = isLocal ? 'http://localhost:3000' : 'https://www.hytrade.in';
    const FRONTEND_URL = envFrontend || fallbackFrontend;
    window.location.href = FRONTEND_URL + '?message=' + 
      encodeURIComponent('You have been logged out successfully');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isLoading, 
      isAuthenticated: !!user,
      login, 
      logout,
      updateUser
    }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
