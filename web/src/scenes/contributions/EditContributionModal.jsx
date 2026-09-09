import React, { useState, useEffect } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Grid } from '@mui/material'

import { toReal } from '../../helpers/utils'

const today = () => new Date().toISOString().slice(0, 10)

const emptyContribution = { assetId: '', quantity: '', unitPrice: '', contributionDate: today(), notes: '' }

// FII, ação e ETF são negociados em bolsa só em cotas/papéis inteiros. Tesouro Direto e
// fundos (CDB aqui representa o valor aplicado) admitem fração.
const WHOLE_UNIT_TYPES = ['FII', 'ACAO', 'ETF']

export function EditContributionModal({ contribution, assets, show, onCancel, onSave }) {
  const [form, setForm] = useState(emptyContribution)

  useEffect(() => {
    setForm(contribution ? { ...emptyContribution, ...contribution } : emptyContribution)
  }, [contribution, show])

  const selectedAsset = assets.find(a => a.id === Number(form.assetId))
  const wholeUnitsOnly = !!selectedAsset && WHOLE_UNIT_TYPES.includes(selectedAsset.assetType)

  const quantity = Number(form.quantity)
  const unitPrice = Number(form.unitPrice)
  const total = quantity > 0 && unitPrice > 0 ? quantity * unitPrice : 0

  const fractionError = wholeUnitsOnly && quantity > 0 && !Number.isInteger(quantity)
  const valid = !!form.assetId && quantity > 0 && unitPrice > 0 && !!form.contributionDate && !fractionError

  function change(field, value) {
    setForm({ ...form, [field]: value })
  }

  function save() {
    onSave({ ...form, assetId: Number(form.assetId), quantity, unitPrice })
  }

  return (
    <Dialog open={show} onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle>{form.id ? 'Editar Aporte' : 'Novo Aporte'}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          select
          label="Ativo"
          value={form.assetId}
          onChange={e => change('assetId', e.target.value)}
          sx={{ mt: 1, mb: 2 }}
        >
          {assets.map(a => <MenuItem key={a.id} value={a.id}>{a.ticker}</MenuItem>)}
        </TextField>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label={wholeUnitsOnly ? 'Quantidade de cotas' : 'Quantidade'}
              type="number"
              inputProps={{ step: wholeUnitsOnly ? '1' : '0.01', min: 0 }}
              value={form.quantity}
              onChange={e => change('quantity', e.target.value)}
              error={fractionError}
              helperText={fractionError ? 'Só é possível comprar cotas inteiras' : ' '}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Preço Unitário (R$)"
              type="number"
              inputProps={{ step: '0.01', min: 0 }}
              value={form.unitPrice}
              onChange={e => change('unitPrice', e.target.value)}
              helperText=" "
            />
          </Grid>
        </Grid>
        <TextField
          fullWidth
          label="Data do Aporte"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={form.contributionDate}
          onChange={e => change('contributionDate', e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Observações (opcional)"
          value={form.notes || ''}
          onChange={e => change('notes', e.target.value)}
          sx={{ mb: 1 }}
        />
        {total > 0 && <div style={{ textAlign: 'right', fontWeight: 'bold' }}>Total: {toReal(total)}</div>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancelar</Button>
        <Button disabled={!valid} variant="contained" onClick={save}>Salvar</Button>
      </DialogActions>
    </Dialog>
  )
}
