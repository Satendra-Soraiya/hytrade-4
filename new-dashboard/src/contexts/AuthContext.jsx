import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for token in URL on initial load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get('token');
    
    if (urlToken) {
      // Remove token from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Store token and validate it
      validateToken(urlToken);
    } else if (token) {
      // Validate existing token
      validateToken(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const validateToken = async (authToken) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/user/${authToken}`);

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('token', authToken);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = (authToken) => {
    setToken(authToken);
    localStorage.setItem('token', authToken);
    return validateToken(authToken);
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
