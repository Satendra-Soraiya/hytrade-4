import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

// Profile Dropdown Component
const ProfileDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  // Fallback for default avatar extensions if exact file type is unknown
  const [avatarExt, setAvatarExt] = useState('jpeg');
  const avatarFallbackOrder = ['jpeg', 'jpg', 'png', 'svg'];
  const [defaultAvatarMap, setDefaultAvatarMap] = useState(null);

  useEffect(() => {
    // Reset on user or avatar change
    // Start with 'jpeg' which matches our default avatar filenames
    setAvatarExt('jpeg');
  }, [user?.profilePicture, user?.profilePictureType]);

  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const API_URL = process.env.REACT_APP_API_URL || (isDevelopment ? 'http://localhost:3002' : 'https://hytrade-backend.onrender.com');
  // Fetch and cache default avatar options to resolve ids like "default-5" to exact filenames
  useEffect(() => {
    const needsDefaultMap = user?.profilePictureType === 'default' && !defaultAvatarMap;
    if (!needsDefaultMap) return;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/profile/default-options`);
        const data = await res.json();
        if (data && data.success && Array.isArray(data.options)) {
          const map = {};
          for (const opt of data.options) {
            if (opt?.id && opt?.url) map[opt.id] = opt.url;
          }
          setDefaultAvatarMap(map);
        }
      } catch (err) {
        console.error('Failed to load default avatar options:', err);
      }
    })();
  }, [API_URL, user?.profilePictureType, defaultAvatarMap]);

  // Normalize path and build image srcs reliably across environments
  const normalizePath = (p) => {
    if (!p) return '';
    if (!/^https?:\/\//.test(p) && !p.startsWith('/')) return `/${p}`;
    return p;
  };

  const getCustomAvatarSrc = () => {
    const pic = user?.profilePicture || '';
    if (!pic) return '';
    if (/^https?:\/\//.test(pic)) return pic;
    const normalized = normalizePath(pic);
    return `${API_URL}${normalized}`;
  };

  const getDefaultAvatarSrc = () => {
    const pic = user?.profilePicture || '';
    const isAbsolute = /^https?:\/\//.test(pic);
    if (isAbsolute) return pic; // Use provided URL directly

    // If a relative path with extension or known directory, prefix API_URL
    if (/^\//.test(pic) && /\.[a-zA-Z]+$/.test(pic)) {
      return `${API_URL}${pic}`;
    }
    if (pic.includes('/images/default-avatars/')) {
      return `${API_URL}${pic.startsWith('/') ? pic : `/${pic}`}`;
    }

    // If stored as an id like "default-5", resolve via backend options
    const match = pic.match(/^default-(\d+)$/);
    const idx = match ? match[1] : ((pic || 'default-1').split('-')[1] || '1');

    const id = `default-${idx}`;
    if (defaultAvatarMap && defaultAvatarMap[id]) {
      return defaultAvatarMap[id];
    }

    // Fallback to conventional filename pattern if options not available
    // Match backend filenames (e.g., AVATAR4.jpeg)
    return `${API_URL}/images/default-avatars/AVATAR${idx}.${avatarExt}`;
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Profile Button */}
      <div
        onClick={toggleDropdown}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          border: '1px solid #dee2e6',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#e9ecef';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#f8f9fa';
        }}
      >
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: '#007bff'
        }}>
          {(user?.profilePictureType === 'custom' || (user?.profilePicture && user.profilePicture.includes('/uploads/'))) ? (
            <img 
              src={getCustomAvatarSrc()}
              alt="Profile"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : user?.profilePicture && user?.profilePictureType === 'default' ? (
            <img 
              src={getDefaultAvatarSrc()}
              alt="Profile"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                // Try next extension; if exhausted, fallback to initials
                const nextIdx = avatarFallbackOrder.indexOf(avatarExt) + 1;
                if (nextIdx < avatarFallbackOrder.length) {
                  setAvatarExt(avatarFallbackOrder[nextIdx]);
                } else {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }
              }}
            />
          ) : null}
          <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#007bff',
            color: 'white',
            fontWeight: '600',
            fontSize: '0.875rem',
            display: user.profilePicture ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {user.firstName?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>
        <div>
          <div style={{
            color: '#212529',
            fontSize: '0.875rem',
            fontWeight: '500',
            lineHeight: '1.2'
          }}>
            {user.firstName || 'User'}
          </div>
          <div style={{
            color: '#6c757d',
            fontSize: '0.75rem',
            lineHeight: '1.2'
          }}>
            {user.email || 'user@example.com'}
          </div>
        </div>
        <div style={{
          color: '#6c757d',
          fontSize: '0.75rem',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease'
        }}>
          ▼
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          marginTop: '0.5rem',
          backgroundColor: 'white',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          minWidth: '280px',
          zIndex: 1000
        }}>
          {/* Profile Header */}
          <div style={{
            padding: '1rem',
            borderBottom: '1px solid #e9ecef'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.75rem'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                backgroundColor: '#007bff'
              }}>
                {(user?.profilePictureType === 'custom' || (user?.profilePicture && user.profilePicture.includes('/uploads/'))) ? (
                  <img 
                    src={getCustomAvatarSrc()}
                    alt="Profile"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : user?.profilePicture && user?.profilePictureType === 'default' ? (
                  <img 
                    src={getDefaultAvatarSrc()}
                    alt="Profile"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      const nextIdx = avatarFallbackOrder.indexOf(avatarExt) + 1;
                      if (nextIdx < avatarFallbackOrder.length) {
                        setAvatarExt(avatarFallbackOrder[nextIdx]);
                      } else {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#007bff',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '1.125rem',
                  display: user.profilePicture ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {user.firstName?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>
              <div>
                <div style={{
                  color: '#212529',
                  fontSize: '1rem',
                  fontWeight: '600',
                  lineHeight: '1.2'
                }}>
                  {user.firstName ? `${user.firstName} ${user.lastName}` : 'User'}
                </div>
                <div style={{
                  color: '#6c757d',
                  fontSize: '0.875rem',
                  lineHeight: '1.2'
                }}>
                  {user.email || 'user@example.com'}
                </div>
              </div>
            </div>
            
            {/* User Stats */}
            <div style={{
              display: 'flex',
              gap: '1rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#007bff'
                }}>
                  ${user.accountBalance?.toLocaleString() || '100,000'}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#6c757d'
                }}>
                  Balance
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#28a745'
                }}>
                  {user.riskTolerance || 'Medium'}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#6c757d'
                }}>
                  Risk Level
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#17a2b8'
                }}>
                  {user.tradingExperience || 'Beginner'}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#6c757d'
                }}>
                  Experience
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div style={{ padding: '0.5rem 0' }}>
            <div
              style={{
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              onClick={() => setIsOpen(false)}
            >
              <span style={{ fontSize: '1rem' }}>👤</span>
              <span style={{ color: '#495057', fontSize: '0.875rem' }}>View Profile</span>
            </div>
            <div
              style={{
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              onClick={() => setIsOpen(false)}
            >
              <span style={{ fontSize: '1rem' }}>⚙️</span>
              <span style={{ color: '#495057', fontSize: '0.875rem' }}>Account Settings</span>
            </div>
            <div
              style={{
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              onClick={() => setIsOpen(false)}
            >
              <span style={{ fontSize: '1rem' }}>📊</span>
              <span style={{ color: '#495057', fontSize: '0.875rem' }}>Trading History</span>
            </div>
            <div
              style={{
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              onClick={() => setIsOpen(false)}
            >
              <span style={{ fontSize: '1rem' }}>💳</span>
              <span style={{ color: '#495057', fontSize: '0.875rem' }}>Payment Methods</span>
            </div>
          </div>

          {/* Divider */}
          <div style={{
            borderTop: '1px solid #e9ecef',
            margin: '0.5rem 0'
          }}></div>

          {/* Logout Button */}
          <div
            style={{
              padding: '0.75rem 1rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f8d7da'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            onClick={handleLogout}
          >
            <span style={{ fontSize: '1rem' }}>🚪</span>
            <span style={{ color: '#dc3545', fontSize: '0.875rem', fontWeight: '500' }}>Logout</span>
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown when clicking outside */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

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
      const DASHBOARD_URL = process.env.REACT_APP_DASHBOARD_URL || 'https://hytrade-dashboard.vercel.app';
      window.location.href = `${DASHBOARD_URL}?token=${storedToken}`;
      return;
    }
    
    // User is not authenticated, redirect to login
    navigate('/login?message=' + encodeURIComponent('Please login to access your dashboard'));
  };

  // Function to check and update auth state - Session-based authentication
  const checkAuthState = useCallback(async () => {
    try {
      // Check for logout parameter in URL first
      const urlParams = new URLSearchParams(location.search);
      if (urlParams.get('logout') === 'true') {
        // Logout user by calling backend logout endpoint
        try {
          const token = localStorage.getItem('authToken');
          if (token) {
            const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const API_URL = process.env.REACT_APP_API_URL || (isDevelopment ? 'http://localhost:3002' : 'https://hytrade-backend.onrender.com');
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
        localStorage.removeItem('user');
        localStorage.removeItem('authenticated');
        localStorage.removeItem('authToken');
        localStorage.removeItem('sessionId');
        localStorage.removeItem('session');
        localStorage.removeItem('isLoggedIn');
        setUser(null);
        // Clean up URL
        navigate(location.pathname, { replace: true });
        return;
      }

      // Check for token from dashboard redirect
      const token = urlParams.get('token');
      if (token) {
        console.log('Token received from dashboard, validating...');
        // Store the token and validate it
        localStorage.setItem('authToken', token);
        // Clean up URL
        navigate(location.pathname, { replace: true });
        // The token validation will happen in the next part of the function
        return;
      }

      // Check for success message after login redirect
      const message = urlParams.get('message');
      if (message) {
        const decodedMessage = decodeURIComponent(message);
        console.log('URL message:', decodedMessage);
        
        // Check if it's a logout message
        if (decodedMessage.includes('logged out successfully')) {
          console.log('Logout detected from URL, clearing user state');
          // Clear all user data
          localStorage.removeItem('authToken');
          localStorage.removeItem('sessionId');
          localStorage.removeItem('user');
          localStorage.removeItem('session');
          localStorage.removeItem('isLoggedIn');
          setUser(null);
        }
        
        // Clean up URL
        navigate(location.pathname, { replace: true });
      }

      // Check JWT token-based authentication with backend
      const storedToken = localStorage.getItem('authToken');
      const storedSessionId = localStorage.getItem('sessionId');
      const storedUser = localStorage.getItem('user');
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      
      // Quick check: if we have all required data, set user immediately (and still refresh from backend below)
      if (storedToken && storedSessionId && storedUser && isLoggedIn) {
        try {
          const userData = JSON.parse(storedUser);
          console.log('Navbar: Setting user from localStorage:', userData.firstName);
          setUser(userData);
        } catch (error) {
          console.error('Error parsing stored user data:', error);
        }
      } else {
        console.log('Navbar: Missing session data:', {
          hasToken: !!storedToken,
          hasSessionId: !!storedSessionId,
          hasUser: !!storedUser,
          isLoggedIn: isLoggedIn
        });
        setUser(null);
        // Attempt backend verification if we at least have a token
        if (!storedToken) {
          return;
        }
      }
      
      if (!storedToken) {
        setUser(null);
        return;
      }

      try {
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const API_URL = process.env.REACT_APP_API_URL || (isDevelopment ? 'http://localhost:3002' : 'https://hytrade-backend.onrender.com');
        const response = await fetch(`${API_URL}/api/auth/verify`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${storedToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        // Backend verify returns { success: true, user: {...} }
        // Accept either "success" or legacy "authenticated" flags.
        if ((data.success || data.authenticated) && data.user) {
          // User is authenticated, update state and localStorage
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('authenticated', 'true');
          localStorage.setItem('isLoggedIn', 'true');
          // Prefer sessionId if present in response (not required by /verify)
          if (data.sessionId || (data.session && data.session.id)) {
            localStorage.setItem('sessionId', data.sessionId || data.session.id);
          }

          // Immediately fetch fresh profile from DB to ensure latest avatar fields
          try {
            const profileRes = await fetch(`${API_URL}/api/profile`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${storedToken}`,
                'Content-Type': 'application/json'
              }
            });
            const profileData = await profileRes.json();
            if (profileData && profileData.success && profileData.user) {
              setUser(profileData.user);
              localStorage.setItem('user', JSON.stringify(profileData.user));
            }
          } catch (profileErr) {
            console.warn('Profile fetch after verify failed, using verify user:', profileErr);
          }
        } else {
          // User is not authenticated, clear all session data
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('authenticated');
          localStorage.removeItem('authToken');
          localStorage.removeItem('sessionId');
          localStorage.removeItem('session');
          localStorage.removeItem('isLoggedIn');
        }
      } catch (error) {
        console.error('Error checking session:', error);
        // On error, clear all session data
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('authenticated');
        localStorage.removeItem('authToken');
        localStorage.removeItem('sessionId');
        localStorage.removeItem('session');
        localStorage.removeItem('isLoggedIn');
      }
    } catch (error) {
      console.error('Error in checkAuthState:', error);
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('authenticated');
    }
  }, [location, navigate]);

  // Check auth state on component mount and when location changes
  useEffect(() => {
    checkAuthState();
    
    // Also set up storage event listener to sync across tabs
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'authToken' || e.key === 'sessionId' || e.key === 'isLoggedIn' || e.key === null) {
        checkAuthState();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkAuthState]);

  // Handle logout - Session-based authentication
  const handleLogout = async () => {
    try {
      // Get the JWT token for backend session deactivation
      const token = localStorage.getItem('authToken');
      
      if (token) {
        // Call backend logout endpoint to destroy session server-side
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const API_URL = process.env.REACT_APP_API_URL || (isDevelopment ? 'http://localhost:3002' : 'https://hytrade-backend.onrender.com');
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('✅ Session deactivated on server');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
    
    // Clear local state and storage
    localStorage.removeItem('user');
    localStorage.removeItem('authenticated');
    localStorage.removeItem('authToken');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('session');
    localStorage.removeItem('isLoggedIn');
    setUser(null);
    
    // Redirect to home page with logout message
    navigate('/?message=' + encodeURIComponent('You have been logged out successfully'));
  };

  return (
    <nav className="navbar navbar-expand-lg" style={{
      backgroundColor: '#ffffff',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      borderBottom: '1px solid #e9ecef',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div className="container">
        {/* Logo - Clean and professional */}
        <Link className="navbar-brand" to="/" style={{textDecoration: 'none'}}>
          <img 
            src="media/Images/logo.png"
            style={{
              maxWidth: '180px',
              width: 'auto',
              height: '45px',
              objectFit: 'contain'
            }}
            alt="Hytrade Logo"
          />
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{
            border: '1px solid #dee2e6',
            borderRadius: '4px'
          }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          {/* Navigation Links - Clean and simple */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link 
                className="nav-link" 
                to="/about"
                style={{
                  color: '#495057',
                  fontWeight: '500',
                  padding: '0.75rem 1rem',
                  transition: 'color 0.2s ease',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => e.target.style.color = '#007bff'}
                onMouseLeave={(e) => e.target.style.color = '#495057'}
              >
                About
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className="nav-link" 
                to="/products"
                style={{
                  color: '#495057',
                  fontWeight: '500',
                  padding: '0.75rem 1rem',
                  transition: 'color 0.2s ease',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => e.target.style.color = '#007bff'}
                onMouseLeave={(e) => e.target.style.color = '#495057'}
              >
                Products
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className="nav-link" 
                to="/pricing"
                style={{
                  color: '#495057',
                  fontWeight: '500',
                  padding: '0.75rem 1rem',
                  transition: 'color 0.2s ease',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => e.target.style.color = '#007bff'}
                onMouseLeave={(e) => e.target.style.color = '#495057'}
              >
                Pricing
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className="nav-link" 
                to="/support"
                style={{
                  color: '#495057',
                  fontWeight: '500',
                  padding: '0.75rem 1rem',
                  transition: 'color 0.2s ease',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => e.target.style.color = '#007bff'}
                onMouseLeave={(e) => e.target.style.color = '#495057'}
              >
                Support
              </Link>
            </li>
          </ul>
          
          {/* Right Side Actions */}
          <div className="d-flex align-items-center gap-3">
            {/* Dashboard Button - Professional styling */}
            <button 
              onClick={handleDashboardClick}
              className={`btn ${user ? 'btn-success' : 'btn-primary'}`}
              style={{
                padding: '0.75rem 1.5rem',
                fontWeight: '600',
                fontSize: '0.9rem',
                borderRadius: '6px',
                border: 'none',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Dashboard
            </button>
            
            {user ? (
              // Logged in state - Profile Dropdown Component
              <ProfileDropdown user={user} onLogout={handleLogout} />
            ) : (
              // Not logged in state - Clean design
              <div className="d-flex gap-2">
                <Link 
                  to="/login" 
                  className="btn btn-outline-primary"
                  style={{
                    padding: '0.75rem 1.5rem',
                    fontWeight: '500',
                    fontSize: '0.9rem',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="btn btn-success"
                  style={{
                    padding: '0.75rem 1.5rem',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
