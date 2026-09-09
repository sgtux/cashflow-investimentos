import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { List, Divider, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import { Dashboard as DashboardIcon, TrendingUp, ReceiptLong } from '@mui/icons-material'

const items = [
  { to: '/', text: 'Dashboard', icon: DashboardIcon },
  { to: '/assets', text: 'Ativos', icon: TrendingUp },
  { to: '/contributions', text: 'Aportes', icon: ReceiptLong }
]

export function Sidebar({ closeSidebar }) {
  const location = useLocation()

  return (
    <div>
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <img src="favicon.ico" height="60" width="60" />
      </div>
      <List>
        <Divider />
        {items.map(item => (
          <React.Fragment key={item.to}>
            <Link to={item.to} onClick={closeSidebar} style={{ textDecoration: 'none', color: 'inherit' }}>
              <ListItemButton selected={location.pathname === item.to}>
                <ListItemIcon sx={{ color: 'inherit' }}>
                  <item.icon />
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </Link>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </div>
  )
}
