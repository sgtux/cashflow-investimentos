import { createTheme } from '@mui/material/styles'

// Paleta "caderno de finanças" copiada de SiteV2/src/theme.js (Cashflow) para manter a identidade
// visual do ecossistema Bê-a-bá da Grana entre os apps.
export const Palette = {
  green: '#1F7A5A',
  greenDark: '#155A42',
  greenLight: '#4CC59A',
  gold: '#D99A1E',
  goldLight: '#F2C14E',
  coral: '#D1495B',
  coralLight: '#F07C8A',
  blue: '#2F6FB2',
  blueLight: '#7FB2EA'
}

export const MONEY_FONT = '"Roboto Mono", ui-monospace, monospace'

export const AppTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'class'
  },
  breakpoints: {
    values: { xs: 0, sm: 600, md: 900, lg: 1100, xl: 1536 }
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: 'Nunito, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 800 },
    h4: { fontWeight: 800, fontSize: '1.75rem' },
    h5: { fontWeight: 800 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 700, fontSize: '0.95rem' },
    overline: { fontWeight: 800, letterSpacing: '0.08em' }
  },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: Palette.green, dark: Palette.greenDark, contrastText: '#fff' },
        secondary: { main: Palette.gold, contrastText: '#1E2A27' },
        success: { main: Palette.green, dark: Palette.greenDark },
        error: { main: Palette.coral },
        warning: { main: Palette.gold },
        info: { main: Palette.blue },
        background: { default: '#F5F3EC', paper: '#FFFFFF' },
        text: { primary: '#1E2A27', secondary: '#55625E' },
        divider: 'rgba(30, 42, 39, 0.10)'
      }
    },
    dark: {
      palette: {
        primary: { main: Palette.greenLight, dark: Palette.green, contrastText: '#0D1A15' },
        secondary: { main: Palette.goldLight, contrastText: '#1E2A27' },
        success: { main: Palette.greenLight, dark: Palette.green },
        error: { main: Palette.coralLight },
        warning: { main: Palette.goldLight },
        info: { main: Palette.blueLight },
        background: { default: '#0E1714', paper: '#15211C' },
        text: { primary: '#E7EFEC', secondary: '#A3B2AD' },
        divider: 'rgba(231, 239, 236, 0.12)'
      }
    }
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 10, paddingInline: 18 } }
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } }
    },
    MuiCard: {
      defaultProps: { variant: 'outlined' }
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 18 } }
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 700 } }
    }
  }
})
