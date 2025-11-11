import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Badge, 
  Avatar, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Tooltip,
  Box,
  Divider,
  Chip
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Search as SearchIcon, 
  Notifications as NotificationsIcon, 
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import resolveAvatarSrc from '../utils/avatar';

const TopBar = ({ drawerWidth, handleDrawerToggle, isMobile, toggleDarkMode, darkMode }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  return (
    <AppBar 
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        boxShadow: 'none',
        backgroundColor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar>
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* App title and environment chip */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            component="a"
            href={`${(() => {
              // Compute landing URL from env with sensible fallbacks
              const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
              const envFrontend = import.meta.env.VITE_FRONTEND_URL;
              const frontendUrl = envFrontend || (isLocal ? 'http://localhost:3001' : 'https://www.hytrade.in');

              // Get token from localStorage
              const token = localStorage.getItem('token') || localStorage.getItem('authToken');

              // Add token to URL if it exists
              if (token) {
                const url = new URL(frontendUrl);
                url.searchParams.set('token', token);
                return url.toString();
              }

              return frontendUrl;
            })()}`}
            target="_self"
            rel="noopener noreferrer"
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              '&:hover': { textDecoration: 'underline' },
              cursor: 'pointer'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Hytrade Dashboard
            </Typography>
          </Box>
          {isDevelopment && (
            <Chip 
              label="LOCAL DEV"
              size="small"
              sx={{ bgcolor: 'success.main', color: 'success.contrastText' }}
            />
          )}
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={darkMode ? 'Light mode' : 'Dark mode'}>
            <IconButton onClick={toggleDarkMode} color="inherit">
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Notifications">
            <IconButton color="inherit">
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
            <Tooltip title="Account settings">
              <Box
                onClick={handleProfileMenuOpen}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  p: 1,
                  borderRadius: 2,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  }
                }}
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
              >
                <Avatar 
                  src={resolveAvatarSrc(user) || null}
                  imgProps={{ crossOrigin: 'anonymous' }}
                  sx={{ 
                    width: 36, 
                    height: 36,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    mr: 1.5,
                    border: '2px solid',
                    borderColor: 'background.paper',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {user?.firstName?.[0]?.toUpperCase() || 'U'}
                </Avatar>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography 
                    variant="body2" 
                    color="text.primary"
                    sx={{ 
                      fontWeight: 500,
                      lineHeight: 1.2
                    }}
                  >
                    {user?.firstName ? `${user.firstName} ${user.lastName}` : 'User'}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ 
                      lineHeight: 1.2,
                      fontSize: '0.75rem'
                    }}
                  >
                    {user?.email || 'user@example.com'}
                  </Typography>
                </Box>
              </Box>
            </Tooltip>
          </Box>
        </Box>

        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleMenuClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 4px 20px rgba(0,0,0,0.15))',
              mt: 1.5,
              minWidth: 280,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              '& .MuiAvatar-root': {
                width: 40,
                height: 40,
                ml: -0.5,
                mr: 1.5,
                border: '2px solid',
                borderColor: 'background.paper',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              },
              '& .MuiMenuItem-root': {
                px: 2,
                py: 1.5,
                '&:hover': {
                  backgroundColor: 'action.hover',
                }
              }
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {/* User Profile Header */}
          <Box sx={{ px: 2, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar 
                src={resolveAvatarSrc(user) || null}
                imgProps={{ crossOrigin: 'anonymous' }}
                sx={{ 
                  width: 48, 
                  height: 48, 
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  mr: 2,
                  border: '2px solid',
                  borderColor: 'background.paper',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {user?.firstName?.[0]?.toUpperCase() || 'U'}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  {user?.firstName ? `${user.firstName} ${user.lastName}` : 'User'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                  {user?.email || 'user@example.com'}
                </Typography>
              </Box>
            </Box>
            
            {/* User Stats */}
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  ${user?.accountBalance?.toLocaleString() || '100,000'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Balance
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                  {user?.riskTolerance || 'Medium'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Risk Level
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'info.main' }}>
                  {user?.tradingExperience || 'Beginner'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Experience
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Menu Items */}
          <MenuItem onClick={() => {
            handleMenuClose();
            navigate('/profile');
          }}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="View Profile" />
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Account Settings" />
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
