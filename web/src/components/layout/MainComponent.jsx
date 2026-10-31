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

const DRAWER_WIDTH = 280

export function MainComponent() {
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false)

  const theme = useTheme()
  const { setMode } = useColorScheme()
  const sidebarDocked = useMediaQuery(theme.breakpoints.up('lg'))

  const { user, globalLoader, themeMode } = useAppState()

  useEffect(() => {
    setMode(themeMode)
  }, [themeMode])

  const toastContainer = <ToastContainer position="bottom-right" theme={themeMode === 'dark' ? 'dark' : 'light'} />

  if (!user)
    return (
      <>
        <Login />
        {toastContainer}
      </>
    )

  return (
    <div>
      <HashRouter>
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
          <Drawer
            variant={sidebarDocked ? 'permanent' : 'temporary'}
            open={sidebarDocked || sidebarIsOpen}
            onClose={() => setSidebarIsOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              width: sidebarDocked ? DRAWER_WIDTH : 0,
              flexShrink: 0,
              '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', borderRight: 1, borderColor: 'divider', bgcolor: 'background.paper' }
            }}>
            <Sidebar closeSidebar={() => setSidebarIsOpen(false)} />
          </Drawer>
          <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
            <AppToolbar dockedMenu={sidebarDocked} openSideBar={() => setSidebarIsOpen(true)} />
            <AppRouter />
          </Box>
        </Box>
      </HashRouter>
      {toastContainer}
      {globalLoader > 0 &&
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2000 }}>
          <LinearProgress color="secondary" sx={{ height: 4 }} />
        </Box>
      }
    </div>
  )
}
