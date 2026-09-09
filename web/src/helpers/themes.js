import { createTheme } from '@mui/material/styles'

// Paleta copiada de Site/src/helpers/themes.js (Cashflow) para manter a identidade
// visual da suite entre os apps.
export const Colors = {
  AppGreen: '#4b9372',
  AppGreenLight: '#78ba9c',
  AppGreenDark: '#34664f',
  AppRed: '#d9605c',
  AppYellow: '#cc6'
}

export const AppTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'class'
  },
  breakpoints: {
    values: { xs: 0, sm: 600, md: 900, lg: 1024, xl: 1536 }
  },
  typography: {
    fontFamily: 'Roboto, Helvetica, Arial, sans-serif'
  },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: Colors.AppGreen, dark: Colors.AppGreenDark },
        secondary: { main: Colors.AppRed },
        success: { main: Colors.AppGreen, dark: Colors.AppGreenDark },
        error: { main: Colors.AppRed },
        warning: { main: Colors.AppYellow }
      }
    },
    dark: {
      palette: {
        primary: { main: Colors.AppGreen, dark: Colors.AppGreenDark },
        secondary: { main: Colors.AppRed },
        success: { main: Colors.AppGreenLight, dark: Colors.AppGreenDark },
        error: { main: Colors.AppRed },
        warning: { main: Colors.AppYellow },
        background: { default: '#121212', paper: '#1A2027' }
      }
    }
  }
})
