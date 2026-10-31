import React from 'react'
import { AppBar, Avatar, Box, Toolbar, Tooltip, Typography, IconButton } from '@mui/material'
import { MenuRounded, LightModeRounded, DarkModeRounded, LogoutRounded } from '@mui/icons-material'
import { useColorScheme } from '@mui/material/styles'

import { useAppDispatch, useAppState, userChanged, themeModeChanged } from '../../context/AppContext'
import { authService } from '../../services'

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function AppToolbar({ openSideBar, dockedMenu }) {
  const { mode } = useColorScheme()
  const { user } = useAppState()
  const dispatch = useAppDispatch()

  const name = (user?.email || '').split('@')[0]

  function logout() {
    authService.logout()
    dispatch(userChanged(null))
  }

  function toggleThemeMode() {
    dispatch(themeModeChanged(mode === 'dark' ? 'light' : 'dark'))
  }

  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
      <Toolbar sx={{ gap: 1 }}>
        {!dockedMenu &&
          <IconButton edge="start" aria-label="Abrir menu" onClick={openSideBar}>
            <MenuRounded />
          </IconButton>
        }
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {greeting()}{name ? `, ${name}` : ''}!
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}>
            Um passo de cada vez: escolher, aportar e acompanhar.
          </Typography>
        </Box>
        <Tooltip title={mode === 'dark' ? 'Usar tema claro' : 'Usar tema escuro'}>
          <IconButton aria-label="Alternar tema" onClick={toggleThemeMode}>
            {mode === 'dark' ? <LightModeRounded /> : <DarkModeRounded />}
          </IconButton>
        </Tooltip>
        <Tooltip title={user?.email || ''}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
            {(name[0] || '?').toUpperCase()}
          </Avatar>
        </Tooltip>
        <Tooltip title="Sair">
          <IconButton aria-label="Sair" onClick={logout}>
            <LogoutRounded />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  )
}
