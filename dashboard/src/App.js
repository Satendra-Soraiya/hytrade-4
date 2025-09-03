import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './components/Login';
import Signup from './components/Signup';
import './App.css';

// Create a wrapper component that handles the routes
const AppRoutes = ({ user, isAuthenticated, isLoading, onLogout, onAuthSuccess }) => {
  // Define all routes at the top level to avoid conditional hook calls
  const routes = useRoutes([
    // Authentication routes
    { path: '/login', element: <Login onAuthSuccess={onAuthSuccess} /> },
    { path: '/signup', element: <Signup onAuthSuccess={onAuthSuccess} /> },
    
    // Dashboard routes (protected)
    {
      path: '/',
      element: isAuthenticated ? <Dashboard user={user} onLogout={onLogout} /> : <Login onAuthSuccess={onAuthSuccess} />,
      children: [
        { index: true, element: null },
        { path: 'orders', element: null },
        { path: 'holdings', element: null },
        { path: 'positions', element: null },
        { path: 'funds', element: null },
      ],
    },
    {
      path: '/dashboard',
      element: isAuthenticated ? <Dashboard user={user} onLogout={onLogout} /> : <Login onAuthSuccess={onAuthSuccess} />,
      children: [
        { index: true, element: null },
        { path: 'orders', element: null },
        { path: 'holdings', element: null },
        { path: 'positions', element: null },
        { path: 'funds', element: null },
      ],
    },
    
    // Catch-all route
    { 
      path: '*', 
      element: isAuthenticated ? <Dashboard user={user} onLogout={onLogout} /> : <Login onAuthSuccess={onAuthSuccess} />
    },
  ]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  return routes;
};

// Main App component
function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    // First, check for authentication data in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    const urlUser = urlParams.get('user');
    const urlAuth = urlParams.get('authenticated');
    
    if (urlToken && urlUser && urlAuth === 'true') {
      // Store authentication data from URL parameters
      localStorage.setItem('token', urlToken);
      localStorage.setItem('user', urlUser);
      localStorage.setItem('authenticated', 'true');
      
      // Clean up URL parameters
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      
      console.log('Authentication data received from URL parameters');
    }
    
    checkAuthStatus();
  }, []);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

  const checkAuthStatus = async () => {
    console.log('Checking authentication status...');
    
    // First check localStorage for existing authentication
    const token = localStorage.getItem('token');
    const storedAuth = localStorage.getItem('authenticated');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedAuth === 'true' && storedUser) {
      console.log('Found valid authentication in localStorage');
      setIsAuthenticated(true);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user data:', e);
      }
      return;
    }
    
    // If no local auth, try to verify with backend using token
    if (token) {
      try {
        console.log('DEBUG: Attempting to verify token with backend');
        console.log('DEBUG: Token being sent:', token.substring(0, 50) + '...');
        console.log('DEBUG: API URL:', API_URL);
        
        const response = await fetch(`${API_URL}/auth/verify-token`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('DEBUG: Response status:', response.status);
        const data = await response.json();
        console.log('Auth check response:', data);
        
        if (response.ok && data.authenticated) {
          setIsAuthenticated(true);
          if (data.user) {
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
          }
          localStorage.setItem('authenticated', 'true');
          return;
        }
      } catch (error) {
        console.error('Token verification failed:', error);
      }
    }
    
    // No valid authentication found
    console.log('User not authenticated');
    setIsAuthenticated(false);
    setUser(null);
    // Clear invalid data
    localStorage.removeItem('token');
    localStorage.removeItem('authenticated');
    localStorage.removeItem('user');
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
    
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('authenticated');
    
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <AppRoutes 
            user={user} 
            isAuthenticated={isAuthenticated} 
            isLoading={isLoading}
            onLogout={handleLogout}
            onAuthSuccess={checkAuthStatus}
          />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
