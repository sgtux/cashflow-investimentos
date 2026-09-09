import React, { useState, useEffect } from 'react'
import {
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  IconButton, Tooltip, Fab, TextField, MenuItem, Typography
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material'
import { toast } from 'react-toastify'

import { MainContainer } from '../../components/layout/MainContainer'
import { ConfirmModal } from '../../components/layout/ConfirmModal'
import { EditContributionModal } from './EditContributionModal'
import { assetService, contributionService } from '../../services'
import { toReal, dateToString } from '../../helpers/utils'

const contributionsHelp = (
  <>
    <Typography variant="body2" sx={{ mb: 1 }}>
      Aporte é cada compra de um ativo que você registra aqui: <strong>quantidade</strong>,
      <strong> preço unitário</strong> e <strong>data</strong>. O total (quantidade ×
      preço) é o valor efetivamente investido naquele lançamento.
    </Typography>
    <Typography variant="body2">
      A soma de todos os aportes de um ativo forma o seu custo total e o preço médio,
      que servem de base para calcular o retorno da carteira no Dashboard. Fazer aportes
      recorrentes — por exemplo, um valor fixo todo mês — é a forma mais comum de
      investir com foco no longo prazo.
    </Typography>
  </>
)

export function Contributions() {
  const [contributions, setContributions] = useState([])
  const [assets, setAssets] = useState([])
  const [assetFilter, setAssetFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(null)
  const [removing, setRemoving] = useState(null)

  useEffect(() => { assetService.getAll().then(setAssets) }, [])
  useEffect(() => refresh(), [assetFilter])

  function refresh() {
    setLoading(true)
    contributionService.getAll(assetFilter ? { assetId: assetFilter } : {})
      .then(res => setContributions(res))
      .finally(() => setLoading(false))
  }

  function save(contribution) {
    setLoading(true)
    contributionService.save(contribution)
      .then(() => {
        toast.success('Aporte salvo com sucesso!')
        setEditing(null)
        refresh()
      })
      .finally(() => setLoading(false))
  }

  function remove() {
    setLoading(true)
    contributionService.remove(removing.id)
      .then(() => {
        toast.success('Aporte removido.')
        setRemoving(null)
        refresh()
      })
      .finally(() => setLoading(false))
  }

  return (
    <MainContainer title="Aportes" loading={loading} helpTitle="O que é um aporte?" help={contributionsHelp}>
      <TextField
        select
        size="small"
        label="Filtrar por ativo"
        value={assetFilter}
        onChange={e => setAssetFilter(e.target.value)}
        sx={{ mb: 2, minWidth: 200 }}
      >
        <MenuItem value="">Todos</MenuItem>
        {assets.map(a => <MenuItem key={a.id} value={a.id}>{a.ticker}</MenuItem>)}
      </TextField>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>Ativo</TableCell>
              <TableCell align="right">Quantidade</TableCell>
              <TableCell align="right">Preço Unit.</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contributions.map(c => (
              <TableRow key={c.id} hover>
                <TableCell>{dateToString(c.contributionDate)}</TableCell>
                <TableCell><strong>{c.ticker}</strong></TableCell>
                <TableCell align="right">{c.quantity}</TableCell>
                <TableCell align="right">{toReal(c.unitPrice)}</TableCell>
                <TableCell align="right">{toReal(c.totalValue)}</TableCell>
                <TableCell align="center">
                  <Tooltip title="Editar">
                    <IconButton color="primary" onClick={() => setEditing(c)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Remover">
                    <IconButton color="secondary" onClick={() => setRemoving(c)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {!contributions.length && !loading &&
              <TableRow><TableCell colSpan={6} align="center">Nenhum aporte lançado ainda.</TableCell></TableRow>
            }
          </TableBody>
        </Table>
      </TableContainer>

      <Fab
        color="primary"
        disabled={!assets.length}
        onClick={() => setEditing({})}
        sx={{ position: 'fixed', bottom: 32, right: 32 }}
      >
        <AddIcon />
      </Fab>

      <EditContributionModal
        contribution={editing}
        assets={assets}
        show={!!editing}
        onCancel={() => setEditing(null)}
        onSave={save}
      />
      <ConfirmModal
        show={!!removing}
        text={`Deseja realmente remover este aporte de ${(removing || {}).ticker}?`}
        onClose={() => setRemoving(null)}
        onConfirm={remove}
      />
    </MainContainer>
  )
}
