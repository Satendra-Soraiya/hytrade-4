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
    
    if (!formData.firstName.trim()) {
      validationErrors.push('First name is required');
    }
    
    if (!formData.lastName.trim()) {
      validationErrors.push('Last name is required');
    }
    
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
    
    if (formData.password !== formData.confirmPassword) {
      validationErrors.push('Passwords do not match');
    }

    if (validationErrors.length > 0) {
      setValidationMessages(validationErrors);
      setError('Please fix the validation errors above');
      setLoading(false);
      return;
    }

    try {
      setBackendResponse('🔄 Sending signup request to backend...');
      
      const response = await fetch('https://hytrade-backend.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session-based auth
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password
        }),
      });

      const data = await response.json();
      
      // Show detailed backend response
      setBackendResponse(`📡 Backend Response (${response.status}): ${JSON.stringify(data, null, 2)}`);

      if (response.ok && data.message === 'User registered successfully') {
        setSuccess('✅ Account created successfully! You can now login.');
        setBackendResponse(prev => prev + '\n\n✅ SUCCESS: User account created in database');
        
        // Redirect to login page after successful signup
        setTimeout(() => {
          navigate('/login?message=Account created successfully. Please login.');
        }, 2000);
        
      } else {
        // Show detailed error information
        const errorMessage = data.error || data.message || 'Registration failed';
        setError(`❌ Signup Failed: ${errorMessage}`);
        
        if (response.status === 400) {
          if (errorMessage.includes('Email already registered')) {
            setBackendResponse(prev => prev + '\n\n❌ ERROR: This email is already registered. Try logging in instead.');
          } else if (errorMessage.includes('Password must be at least 8 characters')) {
            setBackendResponse(prev => prev + '\n\n❌ ERROR: Backend requires minimum 8 characters for password');
          } else if (errorMessage.includes('Invalid email format')) {
            setBackendResponse(prev => prev + '\n\n❌ ERROR: Backend rejected email format');
          } else {
            setBackendResponse(prev => prev + `\n\n❌ ERROR: ${errorMessage}`);
          }
        } else {
          setBackendResponse(prev => prev + `\n\n❌ ERROR: HTTP ${response.status} - ${errorMessage}`);
        }
      }
    } catch (error) {
      setError('❌ Network Error: Could not connect to backend server');
      setBackendResponse(`🚫 NETWORK ERROR: ${error.message}\n\nPlease check:\n- Backend server is running on https://hytrade-backend.onrender.com\n- Internet connection is stable`);
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Sign up for Hytrade</h2>
        
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
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>

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
          <label htmlFor="password">Password (minimum 8 characters)</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="8"
            placeholder="Enter at least 8 characters"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            minLength="8"
            placeholder="Confirm your password"
          />
        </div>

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>

        <div className="auth-link">
          <p>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
      </form>
    </div>
  );
}

export default Signup;