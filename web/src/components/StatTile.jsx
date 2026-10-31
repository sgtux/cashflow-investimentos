import React from 'react'
import { Card, Typography, Box } from '@mui/material'
import { TrendingUp, TrendingDown } from '@mui/icons-material'

import { MONEY_FONT } from '../helpers/themes'

// Stat tile: label + value + delta opcional (cor = direção, nunca a cor de série de um
// gráfico — ver skill dataviz: cor de status é reservada e não deve ser reaproveitada
// como cor categórica).
export function StatTile({ label, value, delta, deltaIsGood }) {
  const accent = delta == null ? 'info.main' : deltaIsGood ? 'success.main' : 'error.main'

  return (
    <Card sx={{ p: 2.5, flex: 1, minWidth: 200, borderTop: 4, borderTopColor: accent }}>
      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 1 }}>{label}</Typography>
      <Typography variant="h5" sx={{ fontFamily: MONEY_FONT, fontWeight: 700 }}>{value}</Typography>
      {delta != null &&
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, color: accent }}>
          {deltaIsGood ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
          <Typography variant="body2">{delta}</Typography>
        </Box>
      }
    </Card>
  )
}
