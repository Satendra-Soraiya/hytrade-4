import { useState, useMemo, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light mode - Inspired by Notion, Linear, and Vercel
          primary: {
            main: '#2563eb', // Vibrant blue
            light: '#3b82f6',
            dark: '#1d4ed8',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#7c3aed', // Purple
            light: '#8b5cf6',
            dark: '#6d28d9',
            contrastText: '#ffffff',
          },
          error: {
            main: '#dc2626', // Red
          },
          success: {
            main: '#16a34a', // Green
          },
          warning: {
            main: '#d97706', // Amber
          },
          info: {
            main: '#0284c7', // Sky blue
          },
          background: {
            default: '#f8fafc', // Light gray
            paper: '#ffffff',
          },
          text: {
            primary: '#0f172a', // Almost black
            secondary: '#475569', // Dark gray
            disabled: '#94a3b8', // Medium gray
          },
          divider: 'rgba(0, 0, 0, 0.06)',
        }
      : {
          // Dark mode - Inspired by Linear, Vercel, and GitHub
          primary: {
            main: '#3b82f6', // Bright blue
            light: '#60a5fa',
            dark: '#2563eb',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#8b5cf6', // Purple
            light: '#a78bfa',
            dark: '#7c3aed',
            contrastText: '#ffffff',
          },
          error: {
            main: '#ef4444',
          },
          success: {
            main: '#22c55e',
          },
          warning: {
            main: '#f59e0b',
          },
          info: {
            main: '#0ea5e9',
          },
          background: {
            default: '#0f172a', // Dark blue-gray
            paper: '#1e293b', // Slightly lighter blue-gray
          },
          text: {
            primary: '#f8fafc', // Off-white
            secondary: '#cbd5e1', // Light gray
            disabled: '#64748b', // Medium gray
          },
          divider: 'rgba(255, 255, 255, 0.08)',
        }),
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: { 
      fontSize: '2.5rem', 
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h2: { 
      fontSize: '2rem', 
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h3: { 
      fontSize: '1.5rem', 
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
    h4: { 
      fontSize: '1.25rem', 
      fontWeight: 600,
    },
    h5: { 
      fontSize: '1.125rem', 
      fontWeight: 600,
    },
    h6: { 
      fontSize: '1rem', 
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      letterSpacing: '0.01em',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          borderBottom: mode === 'dark' 
            ? '1px solid rgba(255, 255, 255, 0.08)' 
            : '1px solid rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

const AppContent = () => {
  const [mode, setMode] = useState('light');
  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);
  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout toggleDarkMode={toggleColorMode} darkMode={mode === 'dark'}>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </ThemeProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
