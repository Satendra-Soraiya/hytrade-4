import { createTheme, alpha } from '@mui/material/styles';

const BRAND = {
  blue: '#1d4ed8',
  blueLight: '#2563eb',
  slate50: '#f8fafc',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  slate700: '#334155',
  slate800: '#1e293b',
  slate900: '#0f172a',
  green: '#15803d',
  red: '#b91c1c',
};

export function createHytradeTheme(mode = 'light') {
  const isLight = mode === 'light';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: BRAND.blueLight,
        dark: BRAND.blue,
        contrastText: '#ffffff',
      },
      secondary: {
        main: isLight ? BRAND.slate700 : BRAND.slate200,
      },
      success: { main: BRAND.green },
      error: { main: BRAND.red },
      background: {
        default: isLight ? BRAND.slate50 : BRAND.slate900,
        paper: isLight ? '#ffffff' : BRAND.slate800,
      },
      text: {
        primary: isLight ? BRAND.slate900 : '#f8fafc',
        secondary: isLight ? '#64748b' : '#94a3b8',
      },
      divider: isLight ? BRAND.slate200 : alpha('#fff', 0.08),
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h4: { fontSize: '1.375rem', fontWeight: 600, lineHeight: 1.3 },
      h5: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.35 },
      h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.4 },
      subtitle1: { fontSize: '0.9375rem', fontWeight: 600 },
      subtitle2: { fontSize: '0.8125rem', fontWeight: 600 },
      body1: { fontSize: '0.9375rem' },
      body2: { fontSize: '0.8125rem' },
      caption: { fontSize: '0.75rem' },
      overline: { fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.06em' },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    spacing: 8,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isLight ? BRAND.slate50 : BRAND.slate900,
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 16px',
            minHeight: 40,
          },
          containedPrimary: {
            '&:hover': { backgroundColor: BRAND.blue },
          },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            border: `1px solid ${isLight ? BRAND.slate200 : alpha('#fff', 0.08)}`,
            borderRadius: 12,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 600,
            fontSize: '0.75rem',
            color: isLight ? '#64748b' : '#94a3b8',
            backgroundColor: isLight ? BRAND.slate50 : BRAND.slate800,
            borderBottom: `1px solid ${isLight ? BRAND.slate200 : alpha('#fff', 0.08)}`,
          },
          body: {
            fontSize: '0.8125rem',
            borderBottom: `1px solid ${isLight ? BRAND.slate100 : alpha('#fff', 0.06)}`,
          },
        },
      },
      MuiTextField: {
        defaultProps: { size: 'small' },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 12,
            border: `1px solid ${isLight ? BRAND.slate200 : alpha('#fff', 0.08)}`,
          },
        },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0 },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: `1px solid ${isLight ? BRAND.slate200 : alpha('#fff', 0.08)}`,
          },
        },
      },
    },
  });
}

export const layoutTokens = {
  drawerWidth: 248,
  topBarHeight: 64,
  pagePadding: { xs: 2, sm: 2.5, lg: 3 },
};
