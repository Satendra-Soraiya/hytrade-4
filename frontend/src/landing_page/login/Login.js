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

    try {
      console.log('Attempting login with new auth system...');
      
      const API_URL = process.env.REACT_APP_API_URL || 'https://hytrade-backend.onrender.com';
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (data.success) {
        console.log('Login successful, redirecting to dashboard with token:', data.authToken);
        
        // Redirect to dashboard with auth token
        const dashboardUrl = `https://hytrade-dashboard-88t9jtiu5-satendra-soraiya-s-projects.vercel.app?token=${data.authToken}`;
        window.location.href = dashboardUrl;
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
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
