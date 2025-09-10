import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = import.meta.env.VITE_API_URL || 'https://hytrade-backend.onrender.com';

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
      const response = await fetch(`${API_URL}/auth/user/${authToken}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const { user: userData } = await response.json();
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
    setIsLoading(true);
    try {
      const isValid = await validateToken(authToken);
      if (isValid) {
        setToken(authToken);
        localStorage.setItem('token', authToken);
      }
      return isValid;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('Logging out...');
    setUser(null);
    setToken('');
    localStorage.removeItem('token');
    
    // Redirect to frontend with logout message
    window.location.href = 'https://hytrade-frontend-gqvf8c92x-satendra-soraiya-s-projects.vercel.app?message=' + 
      encodeURIComponent('You have been logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isLoading, 
      isAuthenticated: !!user,
      login, 
      logout 
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
