import React from 'react'
import { Paper, Typography, Box } from '@mui/material'
import { TrendingUp, TrendingDown } from '@mui/icons-material'

// Stat tile: label + value + delta opcional (cor = direção, nunca a cor de série de um
// gráfico — ver skill dataviz: cor de status é reservada e não deve ser reaproveitada
// como cor categórica).
export function StatTile({ label, value, delta, deltaIsGood }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, flex: 1, minWidth: 200 }}>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>{label}</Typography>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>{value}</Typography>
      {delta != null &&
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          mt: 0.5,
          color: deltaIsGood ? 'success.main' : 'error.main'
        }}>
          {deltaIsGood ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
          <Typography variant="body2">{delta}</Typography>
        </Box>
      }
    </Paper>
  )
}
