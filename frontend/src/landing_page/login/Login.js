import React, { useState } from 'react';
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
  const navigate = useNavigate();

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
    setSuccess('');
    setBackendResponse('');
    setValidationMessages([]);

    // Frontend validation with detailed messages
    const validationErrors = [];
    
    if (!formData.email.trim()) {
      validationErrors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      validationErrors.push('Email format is invalid');
    }
    
    if (!formData.password) {
      validationErrors.push('Password is required');
    } else if (formData.password.length < 8) {
      validationErrors.push('Password must be at least 8 characters long (Backend Requirement)');
    }

    if (validationErrors.length > 0) {
      setValidationMessages(validationErrors);
      setError('Please fix the validation errors above');
      setLoading(false);
      return;
    }

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';
      
      setBackendResponse('🔄 Sending login request to backend...');
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: Include cookies for session-based auth
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password
        }),
      });

      const data = await response.json();
      
      // Show detailed backend response
      setBackendResponse(`📡 Backend Response (${response.status}): ${JSON.stringify(data, null, 2)}`);

      if (response.ok && (data.message === 'Login successful' || data.token)) {
        setSuccess('✅ Login successful! Verifying session...');
        setBackendResponse(prev => prev + '\n\n✅ SUCCESS: Login successful, creating session');
        
        // Debug: Log token presence
        console.log('DEBUG: Token present?', !!data.token);
        console.log('DEBUG: Token value:', data.token);
        console.log('DEBUG: User data:', data.user);
        
        // If JWT token is provided, use it
        if (data.token) {
          console.log('DEBUG: Taking JWT token path');
          localStorage.setItem('token', data.token);
          localStorage.setItem('authenticated', 'true');
          if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
          }
          
          setSuccess('✅ Login successful! Redirecting to dashboard...');
          setBackendResponse(prev => prev + '\n\n✅ SUCCESS: JWT token received, user authenticated');
          
          // Get the returnTo URL from query parameters or default to dashboard
          const urlParams = new URLSearchParams(window.location.search);
          let returnTo = urlParams.get('returnTo');
          
          // If no returnTo URL is specified, default to the dashboard
          if (!returnTo) {
            returnTo = process.env.REACT_APP_DASHBOARD_URL || 'http://localhost:3001';
          }
          
          // Pass authentication data via URL parameters to dashboard
          const dashboardUrl = new URL(returnTo);
          dashboardUrl.searchParams.set('token', data.token);
          dashboardUrl.searchParams.set('user', JSON.stringify(data.user));
          dashboardUrl.searchParams.set('authenticated', 'true');
          
          // Navigate to the dashboard with authentication parameters
          setTimeout(() => {
            window.location.href = dashboardUrl.toString();
          }, 1500);
          return;
        }
        
        console.log('DEBUG: No token found, falling back to session verification');
        
        // Fallback to session verification
        const sessionResponse = await fetch(`${API_URL}/auth/verify-session`, {
          method: 'GET',
          credentials: 'include'
        });
        
        const sessionData = await sessionResponse.json();
        
        setBackendResponse(prev => prev + `\n\n📡 Session Verification (${sessionResponse.status}): ${JSON.stringify(sessionData, null, 2)}`);
        
        if (sessionData.authenticated) {
          setSuccess('✅ Login successful! Redirecting to dashboard...');
          setBackendResponse(prev => prev + '\n\n✅ SUCCESS: Session verified, user authenticated');
          
          // Store user data in localStorage for UI purposes (session is handled by cookies)
          localStorage.setItem('user', JSON.stringify(sessionData.user));
          localStorage.setItem('authenticated', 'true');
          
          // Get the returnTo URL from query parameters or default to dashboard
          const urlParams = new URLSearchParams(window.location.search);
          let returnTo = urlParams.get('returnTo');
          
          // If no returnTo URL is specified, default to the dashboard
          if (!returnTo) {
            returnTo = process.env.REACT_APP_DASHBOARD_URL || 'http://localhost:3001';
          }
          
          // Navigate to the specified destination after successful login
          setTimeout(() => {
            window.location.href = returnTo;
          }, 1500);
        } else {
          setError('❌ Session verification failed. Please try again.');
          setBackendResponse(prev => prev + '\n\n❌ ERROR: Session verification failed after login');
        }
      } else {
        // Show detailed error information
        const errorMessage = data.error || data.message || 'Login failed';
        setError(`❌ Login Failed: ${errorMessage}`);
        
        if (response.status === 401) {
          if (errorMessage.includes('Invalid email or password')) {
            setBackendResponse(prev => prev + '\n\n❌ ERROR: Invalid credentials - check email and password');
          } else if (errorMessage.includes('Too many login attempts')) {
            setBackendResponse(prev => prev + '\n\n❌ ERROR: Rate limited - too many login attempts, wait 15 minutes');
          } else {
            setBackendResponse(prev => prev + `\n\n❌ ERROR: ${errorMessage}`);
          }
        } else {
          setBackendResponse(prev => prev + `\n\n❌ ERROR: HTTP ${response.status} - ${errorMessage}`);
        }
      }
    } catch (error) {
      setError('❌ Network Error: Could not connect to backend server');
      setBackendResponse(`🚫 NETWORK ERROR: ${error.message}\n\nPlease check:\n- Backend server is running on ${process.env.REACT_APP_API_URL || 'http://localhost:3002'}\n- Internet connection is stable`);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Login to Hytrade</h2>
        
        {/* Validation Messages */}
        {validationMessages.length > 0 && (
          <div className="validation-messages" style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '4px',
            padding: '10px',
            marginBottom: '15px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>⚠️ Validation Errors:</h4>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {validationMessages.map((msg, index) => (
                <li key={index} style={{ color: '#856404', marginBottom: '5px' }}>{msg}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Success Message */}
        {success && (
          <div className="success-message" style={{
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '4px',
            padding: '10px',
            marginBottom: '15px',
            color: '#155724'
          }}>
            {success}
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="error-message" style={{
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            padding: '10px',
            marginBottom: '15px',
            color: '#721c24'
          }}>
            {error}
          </div>
        )}
        
        {/* Backend Response Details */}
        {backendResponse && (
          <div className="backend-response" style={{
            backgroundColor: '#e2e3e5',
            border: '1px solid #d6d8db',
            borderRadius: '4px',
            padding: '10px',
            marginBottom: '15px',
            fontFamily: 'monospace',
            fontSize: '12px',
            whiteSpace: 'pre-wrap',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            <h4 style={{ margin: '0 0 10px 0', fontFamily: 'sans-serif' }}>🔍 Backend Details:</h4>
            {backendResponse}
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <div className="auth-link">
          <p>Don't have an account? <Link to="/signup">Sign up here</Link></p>
        </div>
      </form>
    </div>
  );
}

export default Login;
