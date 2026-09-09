import React, { useState, useEffect } from 'react'
import { HashRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { Box, Drawer, LinearProgress } from '@mui/material'
import { useTheme, useColorScheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import { useAppState } from '../../context/AppContext'
import { AppToolbar } from './Toolbar'
import { Sidebar } from './Sidebar'
import { AppRouter } from './AppRouter'
import { Login } from '../../scenes/auth/Login'

const DRAWER_WIDTH = 240

export function MainComponent() {
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false)

  const theme = useTheme()
  const { setMode } = useColorScheme()
  const sidebarDocked = useMediaQuery(theme.breakpoints.up('lg'))

  const { user, globalLoader, themeMode } = useAppState()

  useEffect(() => {
    setMode(user ? themeMode : 'dark')
  }, [themeMode, user])

  if (!user)
    return (
      <>
        <Login />
        <ToastContainer />
      </>
    )

  return (
    <div>
      <HashRouter>
        <Box sx={{ display: 'flex' }}>
          <Drawer
            variant={sidebarDocked ? 'permanent' : 'temporary'}
            open={sidebarDocked || sidebarIsOpen}
            onClose={() => setSidebarIsOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={theme => ({
              width: sidebarDocked ? DRAWER_WIDTH : 0,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH,
                boxSizing: 'border-box',
                backgroundColor: theme.palette.primary.main,
                ...theme.applyStyles('dark', {
                  backgroundColor: theme.palette.background.paper
                })
              }
            })}>
            <Sidebar closeSidebar={() => setSidebarIsOpen(false)} />
          </Drawer>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <AppToolbar dockedMenu={sidebarDocked} openSideBar={() => setSidebarIsOpen(true)} />
            <AppRouter />
          </Box>
        </Box>
      </HashRouter>
      <ToastContainer />
      {globalLoader > 0 &&
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2000 }}>
          <LinearProgress />
        </Box>
      }
    </div>
  )
}
