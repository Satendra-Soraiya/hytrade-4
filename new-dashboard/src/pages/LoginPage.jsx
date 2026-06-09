import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createHytradeTheme } from '../theme/hytradeTheme';
import { getApiUrl } from '../utils/api';
import { getLandingUrl } from '../utils/landing';
import { Panel } from '../components/layout/PageShell';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from?.pathname || '/';
  const theme = createHytradeTheme('light');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch(`${getApiUrl()}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');
      if (!data.token) throw new Error('No authentication token received');
      const ok = await login(data.token);
      if (!ok) throw new Error('Session could not be established');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          px: 2,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box component="img" src="/media/Images/logo.png" alt="Hytrade" sx={{ height: 48, mb: 2 }} />
            <Typography variant="h5" fontWeight={700}>Sign in to Hytrade</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Indian paper trading dashboard
            </Typography>
          </Box>

          <Panel title="Account login">
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="dense"
                required
                fullWidth
                label="Email"
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                required
                fullWidth
                label="Password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                sx={{ mb: 2 }}
              />
              <Button type="submit" fullWidth variant="contained" disabled={isLoading} sx={{ mt: 1 }}>
                {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Sign in'}
              </Button>
            </Box>
          </Panel>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
            New user?{' '}
            <Box
              component="a"
              href={getLandingUrl() + '/signup'}
              sx={{ color: 'primary.main', textDecoration: 'none', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
            >
              Register on the Hytrade site
            </Box>
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default LoginPage;
