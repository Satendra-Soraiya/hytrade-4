import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle dashboard button click - Check authentication first
  const handleDashboardClick = async (e) => {
    e.preventDefault();
    
    // Check if user has a stored token (from successful login)
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      // User has token, redirect to dashboard with token
      window.location.href = `https://new-dashboard-8gb7pxajw-satendra-soraiya-s-projects.vercel.app?token=${storedToken}`;
      return;
    }
    
    // User is not authenticated, redirect to login
    navigate('/login?message=' + encodeURIComponent('Please login to access your dashboard'));
  };

  // Function to check and update auth state - Session-based authentication
  const checkAuthState = async () => {
    try {
      // Check for logout parameter in URL first
      const urlParams = new URLSearchParams(location.search);
      if (urlParams.get('logout') === 'true') {
        // Logout user by calling backend logout endpoint
        try {
          await fetch('https://hytrade-backend.onrender.com/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
          });
        } catch (error) {
          console.error('Error during logout:', error);
        }
        localStorage.removeItem('user');
        localStorage.removeItem('authenticated');
        localStorage.removeItem('authToken');
        setUser(null);
        // Clean up URL
        navigate(location.pathname, { replace: true });
        return;
      }

      // Check for success message after login redirect
      const message = urlParams.get('message');
      if (message) {
        console.log('Login message:', decodeURIComponent(message));
        // Clean up URL
        navigate(location.pathname, { replace: true });
      }

      // Check session-based authentication with backend
      try {
        const response = await fetch('https://hytrade-backend.onrender.com/api/auth/verify', {
          method: 'GET',
          credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.authenticated && data.user) {
          // User is authenticated, update state and localStorage
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('authenticated', 'true');
        } else {
          // User is not authenticated, clear state
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('authenticated');
        }
      } catch (error) {
        console.error('Error checking session:', error);
        // On error, assume not authenticated
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('authenticated');
      }
    } catch (error) {
      console.error('Error in checkAuthState:', error);
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('authenticated');
    }
  };

  // Check auth state on component mount and when location changes
  useEffect(() => {
    checkAuthState();
    
    // Also set up storage event listener to sync across tabs
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'token' || e.key === null) {
        checkAuthState();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [location, navigate]);

  // Handle logout - Session-based authentication
  const handleLogout = async () => {
    try {
      // Call backend logout endpoint to destroy session
      await fetch('https://hytrade-backend.onrender.com/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
    
    // Clear local state and storage
    localStorage.removeItem('user');
    localStorage.removeItem('authenticated');
    localStorage.removeItem('authToken');
    setUser(null);
    navigate('/');
  };

  return (
    <div className="container">
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container p-2">
          {/* Logo - Always visible */}
          <Link className="navbar-brand" to="/">
            <img 
              src="media/Images/logo.png"
              style={{
                maxWidth: '200px',
                width: 'auto',
                height: '50px',
                objectFit: 'contain'
              }}
              alt="Logo"
            />
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link" to="/about">
                  About
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/pricing">
                  Pricing
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/support">
                  Support
                </Link>
              </li>
            </ul>
            
            <div className="d-flex align-items-center">
              {/* Dashboard Button - Always visible */}
              <button 
                onClick={handleDashboardClick}
                className="btn btn-primary me-2"
                title="Go to trading dashboard"
              >
                Dashboard
              </button>
              
              {user ? (
                // Logged in state
                <div className="d-flex align-items-center gap-3">
                  <span className="text-muted me-2">
                    Welcome, {user.firstName || user.name || 'User'}
                  </span>
                  
                  {/* Logout Button */}
                  <button 
                    onClick={handleLogout}
                    className="btn btn-outline-secondary"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                // Not logged in state
                <div className="d-flex">
                  <Link to="/login" className="btn btn-outline-primary me-2">
                    Login
                  </Link>
                  <Link to="/signup" className="btn btn-success">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
