import React from 'react'
import { AppBar, Toolbar, Typography, IconButton, Button } from '@mui/material'
import { Menu as MenuIcon, LightMode, DarkMode, Logout } from '@mui/icons-material'
import { useColorScheme } from '@mui/material/styles'

import { useAppDispatch, userChanged, themeModeChanged } from '../../context/AppContext'
import { authService } from '../../services'

export function AppToolbar({ openSideBar, dockedMenu }) {
  const { mode } = useColorScheme()
  const dispatch = useAppDispatch()

  function logout() {
    authService.logout()
    dispatch(userChanged(null))
  }

  function toggleThemeMode() {
    dispatch(themeModeChanged(mode === 'dark' ? 'light' : 'dark'))
  }

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        {!dockedMenu &&
          <IconButton style={{ marginRight: 16 }} color="inherit" aria-label="Menu" onClick={openSideBar}>
            <MenuIcon />
          </IconButton>
        }
        <Typography variant="h6" color="inherit" sx={{ flexGrow: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Cashflow Investimentos
        </Typography>
        <IconButton color="inherit" aria-label="Alternar tema" onClick={toggleThemeMode}>
          {mode === 'dark' ? <LightMode /> : <DarkMode />}
        </IconButton>
        <Button color="inherit" startIcon={<Logout />} onClick={logout}>Sair</Button>
      </Toolbar>
    </AppBar>
  )
}
