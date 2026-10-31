import React from 'react'
import { Box, Card, Typography } from '@mui/material'

export function SectionCard({ title, children, sx }) {
  return (
    <Card sx={sx}>
      <Typography variant="h6" sx={{ fontSize: '1.05rem', px: 2.5, pt: 2, pb: 1 }}>{title}</Typography>
      <Box sx={{ px: 2.5, pb: 2.5, pt: 0.5 }}>
        {children}
      </Box>
    </Card>
  )
}
