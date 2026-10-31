import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material'

export function ConfirmModal({ show, text, onClose, onConfirm }) {
  return (
    <Dialog open={show} onClose={onClose}>
      <DialogTitle>Confirmar</DialogTitle>
      <DialogContent>{text}</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={onConfirm} color="error" variant="contained">Remover</Button>
      </DialogActions>
    </Dialog>
  )
}
