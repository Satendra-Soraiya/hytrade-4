import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import resolveAvatarSrc from '../utils/avatar';
import { formatInr } from '../utils/currency';
import { layoutTokens } from '../theme/hytradeTheme';

const TopBar = ({ drawerWidth, handleDrawerToggle, isMobile, toggleDarkMode, darkMode }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        height: layoutTokens.topBarHeight,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ minHeight: `${layoutTokens.topBarHeight}px !important`, px: { xs: 2, sm: 3 }, gap: 2 }}>
        {isMobile && (
          <IconButton edge="start" onClick={handleDrawerToggle} aria-label="menu">
            <MenuIcon />
          </IconButton>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
          Balance
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
          {formatInr(user?.accountBalance)}
        </Typography>

        <IconButton onClick={toggleDarkMode} size="small" aria-label="toggle theme">
          {darkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
        </IconButton>

        <Box
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            py: 0.5,
            px: 1,
            borderRadius: 1.5,
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Avatar
            src={resolveAvatarSrc(user) || undefined}
            imgProps={{ crossOrigin: 'anonymous' }}
            sx={{ width: 32, height: 32, borderRadius: 1.5, fontSize: 14 }}
          >
            {user?.firstName?.[0] || 'U'}
          </Avatar>
          <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'left' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
              {user?.email}
            </Typography>
          </Box>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          slotProps={{ paper: { sx: { minWidth: 200, mt: 1, borderRadius: 2 } } }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="caption" color="text.secondary">Paper balance</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{formatInr(user?.accountBalance)}</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }}>Profile</MenuItem>
          <MenuItem onClick={() => { setAnchorEl(null); logout(); }}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
