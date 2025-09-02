import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const Login = ({ onLogin, onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3002/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: Include cookies for session-based auth
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok && data.message === 'Login successful') {
        // Verify session after login
        const sessionResponse = await fetch('http://localhost:3002/auth/verify-session', {
          method: 'GET',
          credentials: 'include'
        });
        
        const sessionData = await sessionResponse.json();
        
        if (sessionData.authenticated) {
          // Call the auth success callback to update App state
          if (onAuthSuccess) {
            onAuthSuccess();
          }
          // Legacy onLogin callback for backward compatibility
          if (onLogin) {
            onLogin({
              user: sessionData.user,
              authenticated: true
            });
          }
          navigate('/');
        } else {
          setError('Session verification failed. Please try again.');
        }
      } else {
        setError(data.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Login to Dashboard</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
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
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="auth-footer">
          Don't have an account? <a href="/signup">Sign up</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
