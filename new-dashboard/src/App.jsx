import { useState, useMemo, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RefreshProvider } from './contexts/RefreshContext';
import MainLayout from './layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import PortfolioPage from './pages/PortfolioPage';
import MarketsPage from './pages/MarketsPage';
import TradePage from './pages/TradePage';
import ProfilePage from './pages/ProfilePage';
import WatchlistPage from './pages/WatchlistPage';
import HistoryPage from './pages/HistoryPage';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { createHytradeTheme } from './theme/hytradeTheme';

const AppContent = () => {
  const [mode, setMode] = useState(() => {
    try {
      const saved = localStorage.getItem('hytrade_theme_mode');
      if (saved === 'light' || saved === 'dark') return saved;
      return 'light';
    } catch {
      return 'light';
    }
  });
  const { user, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token && !user && !isLoading) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location, user, isLoading]);

  const theme = useMemo(() => createHytradeTheme(mode), [mode]);

  useEffect(() => {
    try {
      localStorage.setItem('hytrade_theme_mode', mode);
    } catch {}
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }, [mode]);

  const toggleDarkMode = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout toggleDarkMode={toggleDarkMode} darkMode={mode === 'dark'} />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="markets" element={<MarketsPage />} />
          <Route path="trade" element={<TradePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="watchlist" element={<WatchlistPage />} />
          <Route path="history" element={<HistoryPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ThemeProvider>
  );
};

const App = () => (
  <AuthProvider>
    <RefreshProvider>
      <AppContent />
    </RefreshProvider>
  </AuthProvider>
);

export default App;
