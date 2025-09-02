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
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      console.log('Checking authentication status...');
      
      const response = await fetch('http://localhost:3002/auth/verify-session', {
        method: 'GET',
        credentials: 'include', // Include session cookies
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Auth check response:', data);

      if (data.authenticated && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        console.log('User authenticated:', data.user.firstName || data.user.name);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        console.log('User not authenticated');
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3002/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
    
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
