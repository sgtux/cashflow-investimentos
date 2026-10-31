import React, { useState } from 'react'
import {
  Avatar, Card, Typography, Box, CircularProgress, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Button
} from '@mui/material'
import { HelpOutline } from '@mui/icons-material'

// Estrutura padrão das telas: cabeçalho (ícone, título, explicação curta) e conteúdo.
// plain = conteúdo sem o card em volta, para telas que já se dividem em vários cards.
export function MainContainer({ title, subtitle, icon, plain, loading, help, helpTitle, children }) {
  const [helpOpen, setHelpOpen] = useState(false)

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2.5, md: 4 }, maxWidth: 1100, mx: 'auto', position: 'relative' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
        <Avatar variant="rounded" sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', width: 52, height: 52, borderRadius: 3 }}>
          {icon}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h4" component="h1">{title}</Typography>
            {help &&
              <Tooltip title="Ajuda">
                <IconButton size="small" sx={{ ml: 0.5 }} onClick={() => setHelpOpen(true)} aria-label="Ajuda">
                  <HelpOutline fontSize="small" />
                </IconButton>
              </Tooltip>
            }
          </Box>
          <Typography sx={{ color: 'text.secondary', mt: 0.25 }}>{subtitle}</Typography>
        </Box>
      </Box>

      {loading &&
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', pt: 20, bgcolor: 'rgba(0,0,0,0.04)', zIndex: 2 }}>
          <CircularProgress />
        </Box>
      }
      {plain ? children : <Card sx={{ p: 2.5 }}>{children}</Card>}

      {help &&
        <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} maxWidth="sm" fullWidth scroll="paper">
          <DialogTitle>{helpTitle || `Ajuda — ${title}`}</DialogTitle>
          <DialogContent dividers>{help}</DialogContent>
          <DialogActions>
            <Button onClick={() => setHelpOpen(false)}>Fechar</Button>
          </DialogActions>
        </Dialog>
      }
    </Box>
  )
}
