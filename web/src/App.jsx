import React from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

import { AppProvider } from './context/AppContext'
import { MainComponent } from './components/layout/MainComponent'
import { AppTheme } from './helpers/themes'

import 'react-toastify/dist/ReactToastify.css'

function App() {
  return (
    <AppProvider>
      <ThemeProvider theme={AppTheme}>
        <CssBaseline />
        <MainComponent />
      </ThemeProvider>
    </AppProvider>
  )
}

const domNode = document.getElementById('app')
const root = createRoot(domNode)
root.render(<App />)
