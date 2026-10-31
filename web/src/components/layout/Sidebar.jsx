import React from 'react'
import { NavLink } from 'react-router-dom'
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material'
import { HomeRounded, TrendingUpRounded, ReceiptLongRounded } from '@mui/icons-material'

import { BrandMark } from '../BrandMark'

const items = [
  { to: '/', label: 'Início', hint: 'Resumo da sua carteira', icon: HomeRounded },
  { to: '/assets', label: 'Ativos', hint: 'FIIs, ações, Tesouro, CDB', icon: TrendingUpRounded },
  { to: '/contributions', label: 'Aportes', hint: 'Cada compra que você fez', icon: ReceiptLongRounded }
]

export function Sidebar({ closeSidebar }) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 2.5 }}>
        <BrandMark size={42} />
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: 18, lineHeight: 1.1 }}>Bê-a-bá da Grana</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Rende · faça a grana crescer</Typography>
        </Box>
      </Box>
      <List dense disablePadding sx={{ px: 1.5, pb: 2 }}>
        {items.map(item => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            end={item.to === '/'}
            onClick={closeSidebar}
            sx={{
              borderRadius: 2.5,
              mb: 0.25,
              '&.active': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '& .MuiListItemIcon-root, & .MuiListItemText-secondary': { color: 'inherit' }
              },
              '&.active:hover': { bgcolor: 'primary.dark' }
            }}>
            <ListItemIcon sx={{ minWidth: 38 }}>
              <item.icon />
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              secondary={item.hint}
              slotProps={{
                primary: { sx: { fontWeight: 700 } },
                secondary: { sx: { fontSize: 11.5, opacity: 0.85 } }
              }} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  )
}
