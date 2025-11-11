import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, CssBaseline, useMediaQuery, useTheme, styled, Alert, Typography } from '@mui/material';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 260;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: 0,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
      [theme.breakpoints.up('md')]: {
        marginLeft: `${drawerWidth}px`,
      },
    }),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  })
);

const MainLayout = ({ toggleDarkMode, darkMode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);

  // Close mobile drawer when route changes
  useEffect(() => {
    if (mobileOpen && isMobile) {
      handleDrawerClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const handleDrawerToggle = () => {
    if (!isMobile) {
      setMobileOpen((prev) => !prev);
    } else {
      if (isClosing) return;
      setIsClosing(true);
      setMobileOpen(false);
    }
  };

  const handleDrawerClose = () => {
    if (isMobile) {
      setIsClosing(true);
      setMobileOpen(false);
    }
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  // If arriving with a token in URL, show welcome immediately once per tab
  useEffect(() => {
    try {
      const hasToken = new URLSearchParams(location.search).get('token');
      if (hasToken && !sessionStorage.getItem('hytrade_welcome_shown')) {
        setShowWelcome(true);
        sessionStorage.setItem('hytrade_welcome_shown', '1');
        const t = window.setTimeout(() => setShowWelcome(false), 4000);
        return () => window.clearTimeout(t);
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show welcome message once after login per tab session
  useEffect(() => {
    try {
      if (isAuthenticated && !sessionStorage.getItem('hytrade_welcome_shown')) {
        setShowWelcome(true);
        sessionStorage.setItem('hytrade_welcome_shown', '1');
        const t = window.setTimeout(() => setShowWelcome(false), 4000);
        return () => window.clearTimeout(t);
      }
      if (!isAuthenticated) {
        setShowWelcome(false);
      }
    } catch {}
  }, [isAuthenticated]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* Top Bar */}
      <TopBar 
        drawerWidth={drawerWidth} 
        handleDrawerToggle={handleDrawerToggle} 
        isMobile={isMobile}
        toggleDarkMode={toggleDarkMode}
        darkMode={darkMode}
      />
      
      {/* Sidebar */}
      <Sidebar 
        drawerWidth={drawerWidth}
        mobileOpen={mobileOpen}
        handleDrawerClose={handleDrawerClose}
        handleDrawerTransitionEnd={handleDrawerTransitionEnd}
        isMobile={isMobile}
      />
      
      {/* Main Content */}
      <Main 
        open={mobileOpen}
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          minHeight: '100vh',
          backgroundColor: 'background.default',
          pt: { xs: 8, sm: 10 },
          pb: { xs: 8, sm: 4 },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(mobileOpen && !isMobile && {
            width: `calc(100% - ${drawerWidth}px)`,
            marginLeft: `${drawerWidth}px`,
            transition: theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        <Box 
          sx={{
            maxWidth: '100%',
            mx: 'auto',
            [theme.breakpoints.up('lg')]: {
              maxWidth: '90%',
            },
            [theme.breakpoints.up('xl')]: {
              maxWidth: '85%',
            },
          }}
        >
          {showWelcome && (
            <Alert
              severity="success"
              variant="filled"
              sx={{ mb: 2, borderRadius: 2 }}
            >
              {`hey ${user?.firstName || user?.name || 'there'} welcome to hytrade`}
            </Alert>
          )}
               {/* System Status */}
               <Alert
                 severity="success"
                 variant="outlined"
                 sx={{
                   mb: 2,
                   borderRadius: 2,
                   '& .MuiAlert-message': {
                     width: '100%'
                   }
                 }}
               >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                🟢 System Status: All services operational
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Backend • Database • Real-time data
              </Typography>
            </Box>
          </Alert>
          
          <Outlet />
        </Box>
      </Main>
    </Box>
  );
};

export default MainLayout;
