import { createTheme } from '@mui/material/styles';

const baseColors = {
  primary: '#B4FF00',
  secondary: 'rgba(180, 255, 0, 0.20)',
  success: '#B4FF00',
  warning: '#FFE45C',
  error: '#FF5C5C',
  info: '#DDDDDD',
  white: '#ffffff',
  black: '#000000',
  lightBg: 'rgba(63, 65, 71, 0.71)',
  darkBg: '#0F0F0F',
  '#3F4147/80': 'rgba(63,65,71,0.8)',
  '#DDE1E7': '#DDE1E7',
};

const theme = createTheme({
  typography: {
    fontFamily: ['Regular', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(
      ',',
    ),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) =>
          theme.unstable_sx({
            textTransform: 'none',
            boxShadow: 'none!important',
          }),
        outlined: ({ theme }) =>
          theme.unstable_sx({
            color: baseColors.white,
            backgroundColor: 'secondary.main',
            ':hover': {
              backgroundColor: 'secondary.main',
            },
          }),
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: ({ theme }) =>
          theme.unstable_sx({
            fontWeight: 500,
            'input::-webkit-outer-spin-button, input::-webkit-inner-spin-button':
              {
                WebkitAppearance: 'none',
                margin: 0,
              },
            'input[type=number]': {
              MozAppearance: 'textfield',
            },
          }),
      },
    },
  },
  palette: {
    mode: 'dark',
    primary: {
      main: baseColors.primary,
      contrastText: baseColors.black,
    },
    secondary: {
      main: baseColors.secondary,
    },
    success: {
      main: baseColors.success,
    },
    warning: {
      main: baseColors.warning,
    },
    error: {
      main: baseColors.error,
    },
    //@ts-ignore
    color: {
      ...baseColors,
    },
    // background: {
    //   default:"",
    //   paper:""
    // },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

export default theme;
