import React, { useState } from 'react'
import { Box, Card, TextField, Button, Typography, Alert } from '@mui/material'
import { TrendingUpRounded, ReceiptLongRounded, QueryStatsRounded } from '@mui/icons-material'

import { useAppDispatch, userChanged, showGlobalLoader, hideGlobalLoader } from '../../context/AppContext'
import { authService } from '../../services'
import { Palette } from '../../helpers/themes'
import { BrandMark } from '../../components/BrandMark'

const steps = [
  { icon: TrendingUpRounded, title: 'Escolha seus ativos', text: 'FIIs, ações, ETFs, Tesouro e CDB, explicados sem complicação.' },
  { icon: ReceiptLongRounded, title: 'Lance seus aportes', text: 'Registre cada compra, com quantidade e preço pago.' },
  { icon: QueryStatsRounded, title: 'Acompanhe a evolução', text: 'Veja mês a mês quanto investiu e quanto a carteira rendeu.' }
]

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const dispatch = useAppDispatch()

  function login(e) {
    e.preventDefault()
    setError('')
    dispatch(showGlobalLoader())
    authService.login({ email, password })
      .then(user => dispatch(userChanged(user)))
      .catch(err => setError(err.message || 'Não foi possível entrar.'))
      .finally(() => dispatch(hideGlobalLoader()))
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' }, bgcolor: 'background.default' }}>
      <Box sx={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        px: { xs: 3, sm: 6, lg: 10 }, py: { xs: 5, md: 8 },
        color: '#fff',
        background: `linear-gradient(150deg, ${Palette.greenDark} 0%, ${Palette.green} 60%, #2C8F6B 100%)`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
          <BrandMark size={48} />
          <Typography sx={{ fontWeight: 800, fontSize: 26 }}>Bê-a-bá da Grana</Typography>
        </Box>
        <Typography variant="h3" component="h1" sx={{ fontSize: { xs: 30, sm: 40 }, lineHeight: 1.15, maxWidth: 560 }}>
          Aprenda a investir, um passo de cada vez.
        </Typography>
        <Typography sx={{ mt: 1.5, fontSize: 20, fontWeight: 800, color: Palette.goldLight }}>
          cada tostão conta
        </Typography>
        <Box sx={{ display: 'grid', gap: 2, mt: 5, maxWidth: 520 }}>
          {steps.map((s, i) =>
            <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.10)' }}>
              <Box sx={{ width: 32, height: 32, flexShrink: 0, borderRadius: '50%', bgcolor: Palette.goldLight, color: '#1E2A27', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {i + 1}
              </Box>
              <s.icon sx={{ opacity: 0.9 }} />
              <Box>
                <Typography sx={{ fontWeight: 800 }}>{s.title}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.85 }}>{s.text}</Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, py: 5 }}>
        <Card sx={{ width: '100%', maxWidth: 420, p: { xs: 3, sm: 4 } }}>
          <Typography variant="h5" component="h2">Rende</Typography>
          <Typography sx={{ color: 'text.secondary', mb: 3 }}>Entre para ver a sua carteira.</Typography>
          <form onSubmit={login}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Senha"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            {error && <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>{error}</Alert>}
            <Button fullWidth type="submit" variant="contained" color="primary" size="large">Entrar</Button>
          </form>
          <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary', textAlign: 'center' }}>
            Login mockado — qualquer email/senha entra. Ver docs/api-especificacao.md.
          </Typography>
        </Card>
      </Box>
    </Box>
  )
}
