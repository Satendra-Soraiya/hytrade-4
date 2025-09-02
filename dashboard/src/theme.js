import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#ff3131', // Red color
      light: 'rgba(255, 49, 49, 0.08)',
      dark: '#cc0000',
      contrastText: '#fff',
    },
    secondary: {
      main: '#f5f7fa',
      light: '#ffffff',
      dark: '#c2c4c7',
      contrastText: '#000',
    },
    error: {
      main: '#ff3131', // Using the same red for errors
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 4,
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#e60000',
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: '#ff3131',
          },
        },
      },
    },
  },
});

export default theme;
