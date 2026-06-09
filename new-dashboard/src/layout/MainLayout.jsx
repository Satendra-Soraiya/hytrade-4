import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { layoutTokens } from '../theme/hytradeTheme';

const MainLayout = ({ toggleDarkMode, darkMode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (isMobile) setMobileOpen(false);
  }, [location.pathname, isMobile]);

  const handleDrawerToggle = () => {
    if (isMobile) setMobileOpen((prev) => !prev);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      <TopBar
        drawerWidth={layoutTokens.drawerWidth}
        handleDrawerToggle={handleDrawerToggle}
        isMobile={isMobile}
        toggleDarkMode={toggleDarkMode}
        darkMode={darkMode}
      />
      <Sidebar
        mobileOpen={mobileOpen}
        handleDrawerClose={() => setMobileOpen(false)}
        isMobile={isMobile}
      />
      <Box
        component="main"
        className="hytrade-scroll"
        sx={{
          flex: '1 1 auto',
          minWidth: 0,
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          pt: `${layoutTokens.topBarHeight + 16}px`,
          pb: 3,
          px: layoutTokens.pagePadding,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
