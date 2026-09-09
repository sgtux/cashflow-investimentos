import React, { useState } from 'react'
import {
  Paper, Typography, Box, CircularProgress, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Button
} from '@mui/material'
import { HelpOutline } from '@mui/icons-material'

export function MainContainer({ title, loading, help, helpTitle, children }) {
  const [helpOpen, setHelpOpen] = useState(false)

  return (
    <Paper variant="outlined" sx={{ mt: 2.5, mb: 6, mx: 2.5, p: 2, position: 'relative' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
          {title}
        </Typography>
        {help &&
          <Tooltip title="Ajuda">
            <IconButton size="small" sx={{ ml: 0.5 }} onClick={() => setHelpOpen(true)} aria-label="Ajuda">
              <HelpOutline fontSize="small" />
            </IconButton>
          </Tooltip>
        }
      </Box>

      {loading &&
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.05)', zIndex: 10 }}>
          <CircularProgress size={40} />
        </Box>
      }
      {children}

      {help &&
        <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} maxWidth="sm" fullWidth scroll="paper">
          <DialogTitle>{helpTitle || `Ajuda — ${title}`}</DialogTitle>
          <DialogContent dividers>{help}</DialogContent>
          <DialogActions>
            <Button onClick={() => setHelpOpen(false)}>Fechar</Button>
          </DialogActions>
        </Dialog>
      }
    </Paper>
  )
}
