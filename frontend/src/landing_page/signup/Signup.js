import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [backendStatus, setBackendStatus] = useState('');
  const [validationMessages, setValidationMessages] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear all messages when user types
    setError('');
    setSuccess('');
    setBackendStatus('');
    setValidationMessages([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setBackendStatus('');
    setValidationMessages([]);

    // Frontend validation
    const validationErrors = [];
    
    if (!formData.firstName.trim()) {
      validationErrors.push('First name is required');
    }
    
    if (!formData.lastName.trim()) {
      validationErrors.push('Last name is required');
    }
    
    if (!formData.email.trim()) {
      validationErrors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      validationErrors.push('Please enter a valid email address');
    }
    
    if (!formData.password) {
      validationErrors.push('Password is required');
    } else if (formData.password.length < 8) {
      validationErrors.push('Password must be at least 8 characters long');
    }
    
    if (formData.password !== formData.confirmPassword) {
      validationErrors.push('Passwords do not match');
    }

    if (validationErrors.length > 0) {
      setValidationMessages(validationErrors);
      setLoading(false);
      return;
    }

    try {
      setBackendStatus('🔄 Connecting to server...');
      
      const response = await fetch('http://localhost:3002/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password
        })
      });

      const data = await response.json();
      setBackendStatus('✅ Server response received');

      if (response.ok && data.success && data.message === 'Account created successfully') {
        setError('');
        setBackendStatus('');
        setValidationMessages([]);
        
        // Store session data for automatic login
        if (data.token && data.user && data.session) {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('sessionId', data.sessionId);
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('session', JSON.stringify(data.session));
          localStorage.setItem('isLoggedIn', 'true');
          
          setSuccess('🎉 Welcome to Hytrade! Your account has been created successfully!');
          setBackendStatus('✅ Account created | ✅ Session established | ✅ Auto-login enabled');
          
          // Redirect after 3 seconds
          setTimeout(() => {
            navigate('/?message=' + encodeURIComponent('Welcome to Hytrade! Your account has been created successfully. Click the Dashboard button to start trading!'));
          }, 3000);
        } else {
          setSuccess('✅ Account created successfully! Please login to continue.');
          setBackendStatus('✅ Account created | ⚠️ Manual login required');
          setTimeout(() => {
            navigate('/login?message=Account created successfully. Please login.');
          }, 2000);
        }
        
      } else {
        const errorMessage = data.error || data.message || 'Registration failed';
        setError(`Registration failed: ${errorMessage}`);
        
        if (response.status === 400) {
          if (errorMessage.includes('Email already registered')) {
            setBackendStatus('❌ Email already exists | 💡 Try logging in instead');
          } else if (errorMessage.includes('Password must be at least 8 characters')) {
            setBackendStatus('❌ Password too short | 💡 Minimum 8 characters required');
          } else if (errorMessage.includes('Invalid email format')) {
            setBackendStatus('❌ Invalid email format | 💡 Check email address');
          } else {
            setBackendStatus(`❌ Validation failed | 💡 ${errorMessage}`);
          }
        } else if (response.status === 500) {
          setBackendStatus('❌ Server error | 💡 Please try again later');
        } else {
          setBackendStatus(`❌ Request failed | 💡 ${errorMessage}`);
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('Unable to connect to server. Please check your internet connection and try again.');
      setBackendStatus('❌ Connection failed | 💡 Check internet connection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container" style={{
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
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite',
        filter: 'blur(1px)'
      }}></div>
      
      <div style={{
        position: 'absolute',
        top: '60%',
        right: '10%',
        width: '150px',
        height: '150px',
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite reverse',
        filter: 'blur(1px)'
      }}></div>
      
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '20%',
        width: '100px',
        height: '100px',
        background: 'rgba(255, 255, 255, 0.06)',
        borderRadius: '50%',
        animation: 'float 10s ease-in-out infinite',
        filter: 'blur(1px)'
      }}></div>

      <div className="signup-card" style={{
        background: 'white',
        borderRadius: '24px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
        padding: '40px',
        width: '100%',
        maxWidth: '500px'
      }}>
        {/* Header with Logo */}
        <div className="signup-header" style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ marginBottom: '10px' }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <img 
                src="media/Images/logo.png"
                style={{
                  width: '120px',
                  height: '120px',
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

        {/* Success Message */}
        {success && (
          <div style={{
            background: 'linear-gradient(135deg, #48bb78, #38a169)',
            color: 'white',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px',
            textAlign: 'center',
            boxShadow: '0 8px 16px rgba(72, 187, 120, 0.3)'
          }}>
            <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>
              {success}
            </div>
            <div style={{ fontSize: '14px', opacity: '0.9' }}>
              💡 Look for the "Dashboard" button in the navigation bar above!
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div style={{
            background: 'linear-gradient(135deg, #f56565, #e53e3e)',
            color: 'white',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '20px',
            textAlign: 'center',
            boxShadow: '0 8px 16px rgba(245, 101, 101, 0.3)'
          }}>
            {error}
          </div>
        )}
        
        {/* Backend Status */}
        {backendStatus && (
          <div style={{
            background: 'rgba(45, 55, 72, 0.05)',
            border: '1px solid rgba(45, 55, 72, 0.1)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            fontSize: '14px',
            color: '#4a5568',
            textAlign: 'center',
            fontFamily: 'SF Mono, Monaco, monospace'
          }}>
            {backendStatus}
          </div>
        )}
        
        {/* Validation Messages */}
        {validationMessages.length > 0 && (
          <div style={{
            background: 'rgba(245, 101, 101, 0.1)',
            border: '1px solid rgba(245, 101, 101, 0.2)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px'
          }}>
            {validationMessages.map((message, index) => (
              <div key={index} style={{ color: '#e53e3e', fontSize: '14px', marginBottom: '4px' }}>
                • {message}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group">
              <label style={{
                display: 'block',
                color: '#374151',
                fontSize: '14px',
                fontWeight: '700',
                marginBottom: '8px'
              }}>
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
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
              />
            </div>
            
            <div className="form-group">
              <label style={{
                display: 'block',
                color: '#374151',
                fontSize: '14px',
                fontWeight: '700',
                marginBottom: '8px'
              }}>
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
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
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              color: '#4a5568',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px'
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
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px',
                transition: 'all 0.2s ease',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              color: '#4a5568',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px'
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
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px',
                transition: 'all 0.2s ease',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
            <div style={{ fontSize: '12px', color: '#718096', marginTop: '4px' }}>
              Minimum 8 characters
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: '#4a5568',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px',
                transition: 'all 0.2s ease',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#a0aec0' : 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
              marginBottom: '20px'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
              }
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '0' }}>
            Already have an account?{' '}
            <Link 
              to="/login" 
              style={{
                color: '#667eea',
                textDecoration: 'none',
                fontWeight: '700',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = '#5a67d8'}
              onMouseLeave={(e) => e.target.style.color = '#667eea'}
            >
              Log in here
            </Link>
          </p>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
}

export default Signup;