import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { getApiUrl } from '../utils/api';

const BackendStatus = () => {
  const [label, setLabel] = useState('Checking API…');
  const API_URL = getApiUrl();

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const res = await fetch(`${API_URL}/api/status`);
        const data = await res.json();
        if (!mounted) return;
        if (res.ok && data.success) {
          setLabel(`API ${data.version || 'v3'} · ${data.environment || 'online'}`);
        } else {
          setLabel('API unreachable');
        }
      } catch {
        if (mounted) setLabel('API unreachable');
      }
    };
    check();
    const id = setInterval(check, 60000);
    return () => { mounted = false; clearInterval(id); };
  }, [API_URL]);

  return (
    <Box sx={{ mb: 2, py: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Box>
  );
};

export default BackendStatus;
