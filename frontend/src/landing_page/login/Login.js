import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [backendResponse, setBackendResponse] = useState('');
  const [validationMessages, setValidationMessages] = useState([]);
  const [infoMessage, setInfoMessage] = useState('');
  const navigate = useNavigate();

  // Check for URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    if (message) {
      setInfoMessage(decodeURIComponent(message));
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear all messages when user types
    setError('');
    setSuccess('');
    setBackendResponse('');
    setValidationMessages([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with credentials:', { email: formData.email });
      
      // Use environment variable for API URL (production/development) and force HTTPS on HTTPS pages
      let API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';
      try {
        if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
          const u = new URL(API_URL);
          if (u.protocol === 'http:') {
            u.protocol = 'https:';
            API_URL = u.toString().replace(/\/$/, '');
          }
        }
      } catch (_) {}
      
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: formData.email.trim().toLowerCase(), 
          password: formData.password 
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseErr) {
        data = { success: false, message: `Login failed (invalid response). Status: ${response.status}` };
      }
      console.log('Login response:', data);

      if (data.success && data.token) {
        // Store token, session, and user info in localStorage for frontend navigation
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('sessionId', data.sessionId);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('session', JSON.stringify(data.session));
        localStorage.setItem('isLoggedIn', 'true');
        
        // Redirect to dashboard with token in URL
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const envDashboard = process.env.REACT_APP_DASHBOARD_URL;
        const fallbackDashboard = isLocal ? 'http://localhost:5173' : 'https://hytrade-dashboard.vercel.app';
        const DASHBOARD_URL = envDashboard || fallbackDashboard;
        window.location.href = `${DASHBOARD_URL}?token=${data.token}`;
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Unable to connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '200px',
        height: '200px',
        background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite',
        filter: 'blur(1px)'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '15%',
        width: '150px',
        height: '150px',
        background: 'linear-gradient(45deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite reverse',
        filter: 'blur(1px)'
      }}></div>
      <div style={{
        position: 'absolute',
        top: '60%',
        left: '5%',
        width: '100px',
        height: '100px',
        background: 'linear-gradient(45deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
        borderRadius: '50%',
        animation: 'float 10s ease-in-out infinite',
        filter: 'blur(1px)'
      }}></div>

      <div className="login-card" style={{
        background: 'white',
        borderRadius: '24px',
        padding: '40px',
        width: '100%',
        maxWidth: '450px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Header with Logo */}
        <div className="login-header" style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ marginBottom: '20px' }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <img 
                src="media/Images/logo.png" 
                style={{
                  width: '150px',
                  height: '150px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease'
                }} 
                alt="Hytrade Logo"
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              />
            </Link>
          </div>
        </div>

        {/* Info Message */}
        {infoMessage && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 197, 253, 0.1))',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            color: '#1e40af',
            fontSize: '14px',
            fontWeight: '500',
            backdropFilter: 'blur(10px)'
          }}>
            <span style={{ marginRight: '8px' }}>ℹ️</span>
            {infoMessage}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(134, 239, 172, 0.1))',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            color: '#15803d',
            fontSize: '14px',
            fontWeight: '500',
            backdropFilter: 'blur(10px)'
          }}>
            <span style={{ marginRight: '8px' }}>✅</span>
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(252, 165, 165, 0.1))',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            color: '#dc2626',
            fontSize: '14px',
            fontWeight: '500',
            backdropFilter: 'blur(10px)'
          }}>
            <span style={{ marginRight: '8px' }}>❌</span>
            {error}
          </div>
        )}

        {/* Backend Response */}
        {backendResponse && (
          <div style={{
            background: 'rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            fontFamily: 'Monaco, Consolas, monospace',
            fontSize: '12px',
            color: '#374151',
            maxHeight: '200px',
            overflowY: 'auto',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ marginBottom: '8px', fontWeight: '600', color: '#1f2937' }}>🔍 Backend Details:</div>
            {backendResponse}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#374151',
              fontSize: '14px',
              fontWeight: '700'
            }}>
              Email Address
            </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  background: '#f9fafb',
                  color: '#1f2937',
                  fontSize: '16px',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontWeight: '500'
                }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.background = 'white';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.background = '#f9fafb';
              }}
              placeholder="Enter your email"
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#374151',
              fontSize: '14px',
              fontWeight: '700'
            }}>
              Password
            </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  background: '#f9fafb',
                  color: '#1f2937',
                  fontSize: '16px',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontWeight: '500'
                }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.background = 'white';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.background = '#f9fafb';
              }}
              placeholder="Enter your password"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              background: loading 
                ? 'linear-gradient(135deg, #9ca3af, #6b7280)' 
                : 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
              }
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginRight: '8px'
                }}></span>
                Logging in...
              </span>
            ) : (
              'Log In'
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
            <p style={{
              color: '#6b7280',
              fontSize: '14px',
              margin: '0'
            }}>
            Don't have an account?{' '}
            <Link 
              to="/signup" 
              style={{ 
                color: '#667eea', 
                textDecoration: 'none', 
                fontWeight: '700', 
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = '#5a67d8'}
              onMouseLeave={(e) => e.target.style.color = '#667eea'}
            >
              Create one here
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Login;
