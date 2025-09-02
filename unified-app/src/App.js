import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import frontend components
import Navbar from './components/frontend/Navbar';
import HomePage from './components/frontend/HomePage';
import AboutPage from './components/frontend/AboutPage';
import ProductsPage from './components/frontend/ProductsPage';
import PricingPage from './components/frontend/PricingPage';
import SupportPage from './components/frontend/SupportPage';
import LoginPage from './components/frontend/LoginPage';
import SignupPage from './components/frontend/SignupPage';

// Import dashboard components
import Dashboard from './components/dashboard/Dashboard';
import TopBar from './components/dashboard/TopBar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication on app load
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <>
              <Navbar isAuthenticated={isAuthenticated} />
              <HomePage />
            </>
          } />
          <Route path="/about" element={
            <>
              <Navbar isAuthenticated={isAuthenticated} />
              <AboutPage />
            </>
          } />
          <Route path="/products" element={
            <>
              <Navbar isAuthenticated={isAuthenticated} />
              <ProductsPage />
            </>
          } />
          <Route path="/pricing" element={
            <>
              <Navbar isAuthenticated={isAuthenticated} />
              <PricingPage />
            </>
          } />
          <Route path="/support" element={
            <>
              <Navbar isAuthenticated={isAuthenticated} />
              <SupportPage />
            </>
          } />
          
          {/* Authentication Routes */}
          <Route path="/login" element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <LoginPage onLogin={handleLogin} />
          } />
          <Route path="/signup" element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <SignupPage onLogin={handleLogin} />
          } />
          
          {/* Protected Dashboard Route */}
          <Route path="/dashboard/*" element={
            isAuthenticated ? 
            <>
              <TopBar user={user} onLogout={handleLogout} />
              <Dashboard user={user} onLogout={handleLogout} />
            </> :
            <Navigate to="/login" replace />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
