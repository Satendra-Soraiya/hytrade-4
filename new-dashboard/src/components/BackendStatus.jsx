import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const BackendStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Auto-detect development environment
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const API_URL = import.meta.env.VITE_API_URL || 
    (isDevelopment ? 'http://localhost:3002' : 'https://hytrade-backend.onrender.com');

  console.log('🚀 BackendStatus component rendered, API_URL:', API_URL);

  const fetchStatus = async () => {
    try {
      console.log('🔄 Fetching backend status from:', `${API_URL}/api/status`);
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/api/status`);
      console.log('📡 Response status:', response.status);
      
      const data = await response.json();
      console.log('📊 Backend status data:', data);
      
      if (response.ok) {
        setStatus(data);
        console.log('✅ Status updated successfully');
      } else {
        throw new Error(data.message || 'Failed to fetch status');
      }
    } catch (err) {
      setError(err.message);
      console.error('❌ Backend status error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Refresh status every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !status) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2">Checking backend connection...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        icon={<ErrorIcon />}
        sx={{ mb: 2 }}
        action={
          <RefreshIcon 
            sx={{ cursor: 'pointer' }} 
            onClick={fetchStatus}
          />
        }
      >
        <Typography variant="body2">
          Backend connection failed: {error}
        </Typography>
      </Alert>
    );
  }

  if (status) {
    return (
      <Card sx={{ mb: 2, border: '1px solid #4caf50' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <CheckCircleIcon sx={{ color: '#4caf50' }} />
            <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 600 }}>
              Backend Connected
            </Typography>
            <Chip 
              label="LIVE" 
              size="small" 
              sx={{ 
                bgcolor: '#4caf50', 
                color: 'white',
                animation: 'pulse 2s infinite'
              }} 
            />
          </Box>
          
          <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
            {status.message}
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip 
              label={`Server: ${status.server}`} 
              variant="outlined" 
              size="small" 
            />
            <Chip 
              label={`Environment: ${status.environment}`} 
              variant="outlined" 
              size="small" 
            />
            <Chip 
              label={status.database} 
              variant="outlined" 
              size="small" 
            />
            <Chip 
              label={`Uptime: ${Math.floor(status.uptime / 60)}m ${Math.floor(status.uptime % 60)}s`} 
              variant="outlined" 
              size="small" 
            />
          </Box>
          
          <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
            Last updated: {new Date(status.timestamp).toLocaleTimeString()}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default BackendStatus;
