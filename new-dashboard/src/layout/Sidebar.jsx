import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountBalanceWallet as WalletIcon,
  ShowChart as ChartIcon,
  SwapHoriz as TradeIcon,
  Person as ProfileIcon,
  StarBorder as WatchlistIcon,
  Receipt as HistoryIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 260;

const Sidebar = ({ open, onClose, isMobile }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [activeItem, setActiveItem] = useState('dashboard');

  useEffect(() => {
    // Update active item based on current route
    const path = location.pathname.split('/')[1] || 'dashboard';
    setActiveItem(path);
  }, [location]);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: 'dashboard' },
    { text: 'Portfolio', icon: <WalletIcon />, path: 'portfolio' },
    { text: 'Markets', icon: <ChartIcon />, path: 'markets' },
    { text: 'Trade', icon: <TradeIcon />, path: 'trade' },
    { text: 'Profile', icon: <ProfileIcon />, path: 'profile' },
    { text: 'Watchlist', icon: <WatchlistIcon />, path: 'watchlist' },
    { text: 'History', icon: <HistoryIcon />, path: 'history' },
    { text: 'Settings', icon: <SettingsIcon />, path: 'settings' },
  ];

  const handleNavigation = (path) => {
    if (path === 'dashboard') {
      navigate('/');
    } else {
      navigate(`/${path}`);
    }
    if (isMobile) {
      onClose();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawer = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'background.paper',
      }}
    >
      {/* Logo and Close Button */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isMobile ? 'space-between' : 'center',
          p: 2.5,
          height: 80,
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60%',
            height: '2px',
            background: 'linear-gradient(90deg, transparent 0%, primary.main 50%, transparent 100%)',
            opacity: 0.3
          }
        }}
      >
        <Box 
          component="a"
          href={`${import.meta.env.VITE_FRONTEND_URL || 'https://hytrade-frontend.vercel.app'}?token=${localStorage.getItem('token') || ''}`}
          target="_self"
          rel="noopener noreferrer"
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            position: 'relative',
            textDecoration: 'none',
            cursor: 'pointer',
            '&:hover': {
              transform: 'scale(1.05)',
              transition: 'transform 0.2s ease-in-out'
            }
          }}
        >
          <img 
            src="/media/Images/logo.png" 
            alt="Hytrade" 
            style={{ 
              height: 56,
              width: 'auto',
              maxWidth: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))'
            }} 
          />
        </Box>
        {isMobile && (
          <IconButton 
            onClick={onClose}
            sx={{
              '&:hover': {
                backgroundColor: 'action.hover',
                transform: 'scale(1.1)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        )}
      </Box>


      {/* Navigation Items */}
      <List sx={{ flex: 1, overflowY: 'auto' }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={activeItem === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'action.selected',
                  '&:hover': {
                    backgroundColor: 'action.selected',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Logout Button */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <ListItemButton onClick={handleLogout}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      aria-label="mailbox folders"
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={open && isMobile}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: 'none',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: 'none',
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
