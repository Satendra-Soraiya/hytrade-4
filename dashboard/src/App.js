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

  useEffect(() => {
    const authenticateUser = async () => {
      console.log('Dashboard: Starting authentication check...');
      setIsLoading(true);
      
      // Check URL for token first
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      
      if (token) {
        console.log('Dashboard: Token found in URL, validating...');
        try {
          const API_URL = process.env.REACT_APP_API_URL || 'https://hytrade-backend.onrender.com';
          const response = await fetch(`${API_URL}/auth/user/${token}`);
          const data = await response.json();
          
          console.log('Dashboard: Token validation response:', data);
          
          if (data.success && data.authenticated) {
            // Store token and user data
            localStorage.setItem('authToken', token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('authenticated', 'true');
            
            // Set authentication state
            setIsAuthenticated(true);
            setUser(data.user);
            setIsLoading(false);
            
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            console.log('Dashboard: Authentication successful via URL token');
            return;
          } else {
            console.log('Dashboard: Token validation failed');
          }
        } catch (error) {
          console.error('Dashboard: Token validation error:', error);
        }
      }
      
      // Check localStorage for existing token
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        console.log('Dashboard: Checking stored token...');
        try {
          const API_URL = process.env.REACT_APP_API_URL || 'https://hytrade-backend.onrender.com';
          const response = await fetch(`${API_URL}/auth/user/${storedToken}`);
          const data = await response.json();
          
          console.log('Dashboard: Stored token validation response:', data);
          
          if (data.success && data.authenticated) {
            setIsAuthenticated(true);
            setUser(data.user);
            setIsLoading(false);
            console.log('Dashboard: Authentication successful via stored token');
            return;
          } else {
            // Clear invalid token
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            localStorage.removeItem('authenticated');
            console.log('Dashboard: Stored token invalid, cleared localStorage');
          }
        } catch (error) {
          console.error('Dashboard: Stored token validation error:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          localStorage.removeItem('authenticated');
        }
      }
      
      // No valid authentication found
      console.log('Dashboard: No valid authentication found');
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
    };

    authenticateUser();
  }, []);

  const handleLogout = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'https://hytrade-backend.onrender.com';
      const token = localStorage.getItem('authToken');
      
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear all authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('authenticated');
    
    // Reset state
    setIsAuthenticated(false);
    setUser(null);
    
    // Redirect to login
    window.location.href = 'https://hytrade-frontend-gqvf8c92x-satendra-soraiya-s-projects.vercel.app/login';
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
            onAuthSuccess={() => {}}
          />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
