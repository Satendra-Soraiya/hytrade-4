import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountBalanceWallet as WalletIcon,
  ShowChart as ChartIcon,
  SwapHoriz as TradeIcon,
  Person as ProfileIcon,
  StarBorder as WatchlistIcon,
  Receipt as HistoryIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { layoutTokens } from '../theme/hytradeTheme';
import { getLandingUrl } from '../utils/landing';

const NAV = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon fontSize="small" /> },
  { label: 'Portfolio', path: '/portfolio', icon: <WalletIcon fontSize="small" /> },
  { label: 'Markets', path: '/markets', icon: <ChartIcon fontSize="small" /> },
  { label: 'Trade', path: '/trade', icon: <TradeIcon fontSize="small" /> },
  { label: 'Watchlist', path: '/watchlist', icon: <WatchlistIcon fontSize="small" /> },
  { label: 'History', path: '/history', icon: <HistoryIcon fontSize="small" /> },
  { label: 'Profile', path: '/profile', icon: <ProfileIcon fontSize="small" /> },
];

const Sidebar = ({ isMobile, mobileOpen, handleDrawerClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [active, setActive] = useState('/');

  useEffect(() => {
    setActive(location.pathname);
  }, [location.pathname]);

  const go = (path) => {
    navigate(path);
    if (isMobile) handleDrawerClose?.();
  };

  const content = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper' }}>
      <Box
        sx={{
          height: layoutTokens.topBarHeight,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
          px: 1,
        }}
      >
        <Box
          component="a"
          href={getLandingUrl()}
          aria-label="Hytrade home"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            transition: 'opacity 0.2s ease, transform 0.2s ease',
            '&:hover': { opacity: 0.88, transform: 'scale(1.02)' },
          }}
        >
          <Box
            component="img"
            src="/media/Images/logo.png"
            alt="Hytrade"
            sx={{
              height: 54,
              width: 'auto',
              maxWidth: `calc(${layoutTokens.drawerWidth}px - 20px)`,
              display: 'block',
              objectFit: 'contain',
            }}
          />
        </Box>
        {isMobile && (
          <IconButton
            size="small"
            onClick={handleDrawerClose}
            aria-label="close menu"
            sx={{
              position: 'absolute',
              right: 4,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <List sx={{ flex: 1, py: 1.5, px: 1, overflowY: 'auto' }}>
        {NAV.map((item) => {
          const selected = active === item.path || (item.path !== '/' && active.startsWith(item.path));
          return (
            <ListItemButton
              key={item.path}
              selected={selected}
              onClick={() => go(item.path)}
              sx={{
                borderRadius: 1.5,
                mb: 0.5,
                minHeight: 44,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                  '&:hover': { bgcolor: 'primary.dark' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: selected ? 'inherit' : 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }} />
            </ListItemButton>
          );
        })}
      </List>

      <Divider />
      <Box sx={{ p: 1.5, flexShrink: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ px: 1, display: 'block', mb: 1 }}>
          {user?.email}
        </Typography>
        <ListItemButton
          onClick={() => { logout(); navigate('/login'); }}
          sx={{ borderRadius: 1.5, minHeight: 44 }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}><LogoutIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.875rem' }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  const drawerPaperSx = {
    width: layoutTokens.drawerWidth,
    boxSizing: 'border-box',
    border: 'none',
    borderRight: '1px solid',
    borderColor: 'divider',
  };

  return (
    <Box
      component="nav"
      sx={{
        width: { md: layoutTokens.drawerWidth },
        flexShrink: { md: 0 },
      }}
    >
      <Drawer
        variant="temporary"
        open={Boolean(mobileOpen) && isMobile}
        onClose={handleDrawerClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': drawerPaperSx,
        }}
      >
        {content}
      </Drawer>
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            ...drawerPaperSx,
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            overflow: 'hidden',
          },
        }}
      >
        {content}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
