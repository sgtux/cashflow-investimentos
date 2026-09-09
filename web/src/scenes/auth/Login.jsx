import React, { useState } from 'react'
import { Card, CardContent, TextField, Button, Typography, Zoom, Alert } from '@mui/material'

import { useAppDispatch, userChanged, showGlobalLoader, hideGlobalLoader } from '../../context/AppContext'
import { authService } from '../../services'

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
    <Zoom in={true}>
      <Card sx={{ width: 320, margin: '150px auto 0', textAlign: 'center', p: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Cashflow Investimentos</Typography>
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
            <Button fullWidth type="submit" variant="contained" color="primary">Entrar</Button>
          </form>
          <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary' }}>
            Login mockado — qualquer email/senha entra. Ver docs/api-especificacao.md.
          </Typography>
        </CardContent>
      </Card>
    </Zoom>
  )
}
