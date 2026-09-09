import React, { useState, useEffect } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from '@mui/material'

const ASSET_TYPES = [
  { value: 'FII', label: 'Fundo Imobiliário (FII)' },
  { value: 'ACAO', label: 'Ação' },
  { value: 'ETF', label: 'ETF' },
  { value: 'TESOURO', label: 'Tesouro Direto' },
  { value: 'CDB', label: 'CDB' }
]

const emptyAsset = { ticker: '', name: '', assetType: 'FII' }

export function EditAssetModal({ asset, show, onCancel, onSave }) {
  const [form, setForm] = useState(emptyAsset)

  useEffect(() => {
    setForm(asset ? { ...emptyAsset, ...asset } : emptyAsset)
  }, [asset, show])

  const valid = !!form.ticker && !!form.assetType

  function change(field, value) {
    setForm({ ...form, [field]: value })
  }

  return (
    <Dialog open={show} onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle>{form.id ? 'Editar Ativo' : 'Novo Ativo'}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          autoFocus
          label="Ticker"
          placeholder="Ex: MXRF11"
          value={form.ticker}
          onChange={e => change('ticker', e.target.value.toUpperCase())}
          sx={{ mt: 1, mb: 2 }}
        />
        <TextField
          fullWidth
          label="Nome (opcional)"
          value={form.name || ''}
          onChange={e => change('name', e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          select
          label="Tipo"
          value={form.assetType}
          onChange={e => change('assetType', e.target.value)}
        >
          {ASSET_TYPES.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancelar</Button>
        <Button disabled={!valid} variant="contained" onClick={() => onSave(form)}>Salvar</Button>
      </DialogActions>
    </Dialog>
  )
}
