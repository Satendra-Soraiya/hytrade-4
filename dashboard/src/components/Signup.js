import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const Signup = ({ onLogin, onAuthSuccess }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [backendResponse, setBackendResponse] = useState('');
  const [validationMessages, setValidationMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setBackendResponse('');
    setValidationMessages([]);
    setIsLoading(true);

    // Frontend validation with detailed messages
    const validationErrors = [];
    
    if (!firstName.trim()) {
      validationErrors.push('First name is required');
    }
    
    if (!lastName.trim()) {
      validationErrors.push('Last name is required');
    }
    
    if (!email.trim()) {
      validationErrors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      validationErrors.push('Email format is invalid');
    }
    
    if (!password) {
      validationErrors.push('Password is required');
    } else if (password.length < 8) {
      validationErrors.push('Password must be at least 8 characters long (Backend Requirement)');
    }
    
    if (password !== confirmPassword) {
      validationErrors.push('Passwords do not match');
    }

    if (validationErrors.length > 0) {
      setValidationMessages(validationErrors);
      setError('Please fix the validation errors above');
      setIsLoading(false);
      return;
    }

    try {
      setBackendResponse('🔄 Sending signup request to backend...');
      
      const response = await fetch('http://localhost:3002/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          password: password
        }),
      });

      const data = await response.json();
      
      // Show detailed backend response
      setBackendResponse(`📡 Backend Response (${response.status}): ${JSON.stringify(data, null, 2)}`);

      if (response.ok && data.message === 'User registered successfully') {
        setSuccess('✅ Account created successfully! Logging you in...');
        setBackendResponse(prev => prev + '\n\n✅ SUCCESS: User account created in database');
        
        // Auto-login after successful signup
        setTimeout(async () => {
          try {
            const loginResponse = await fetch('http://localhost:3002/auth/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                email: email.trim().toLowerCase(),
                password: password
              }),
            });

            const loginData = await loginResponse.json();
            
            if (loginResponse.ok && loginData.message === 'Login successful') {
              // Verify session
              const sessionResponse = await fetch('http://localhost:3002/auth/verify-session', {
                method: 'GET',
                credentials: 'include'
              });
              
              const sessionData = await sessionResponse.json();
              
              if (sessionData.authenticated) {
                // Legacy onLogin callback for backward compatibility
                if (onLogin) {
                  onLogin({
                    user: sessionData.user,
                    authenticated: true
                  });
                }
                // Call the auth success callback to update App state
                if (onAuthSuccess) {
                  onAuthSuccess();
                }
                navigate('/');
              }
            }
          } catch (loginError) {
            setError('Account created but auto-login failed. Please login manually.');
          }
        }, 1000);
        
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
      setBackendResponse(`🚫 NETWORK ERROR: ${error.message}\n\nPlease check:\n- Backend server is running on localhost:3002\n- Internet connection is stable`);
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Create an Account</h2>
        
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
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              placeholder="Enter your first name"
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              placeholder="Enter your last name"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password (minimum 8 characters)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="8"
              placeholder="Enter at least 8 characters"
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="8"
              placeholder="Confirm your password"
            />
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <div className="auth-footer">
          Already have an account? <a href="/login">Login</a>
        </div>
      </div>
    </div>
  );
};

export default Signup;
