import React, { useState, useEffect } from 'react'
import {
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  IconButton, Tooltip, Fab, Chip, Box, Typography
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, TrendingUpRounded } from '@mui/icons-material'
import { toast } from 'react-toastify'

import { MainContainer } from '../../components/layout/MainContainer'
import { ConfirmModal } from '../../components/layout/ConfirmModal'
import { EditAssetModal } from './EditAssetModal'
import { assetService, contributionService } from '../../services'

const formatQuantity = q => q.toLocaleString('pt-BR', { maximumFractionDigits: 2 })

function Term({ label, children }) {
  return (
    <Typography variant="body2" sx={{ mb: 1.25 }}>
      <Box component="span" sx={{ fontWeight: 700 }}>{label} — </Box>
      {children}
    </Typography>
  )
}

const assetsHelp = (
  <>
    <Term label="Ativo">
      qualquer papel negociado na bolsa que você acompanha na carteira. Aqui você
      cadastra o <em>ticker</em> (código de negociação, ex.: MXRF11) e o tipo. Todo
      aporte é sempre lançado sobre um ativo já cadastrado.
    </Term>
    <Term label="FII (Fundo de Investimento Imobiliário)">
      fundo que reúne o dinheiro de vários investidores para aplicar em imóveis físicos
      (shoppings, galpões, lajes corporativas) ou em títulos do setor imobiliário (CRI,
      LCI). É negociado em cotas na bolsa, costuma distribuir rendimentos mensais
      (isentos de IR para pessoa física, dentro das regras atuais) e o ticker termina
      em <strong>11</strong> — ex.: MXRF11, HGLG11.
    </Term>
    <Term label="Ação">
      uma fração do capital de uma empresa; quem compra vira sócio e participa dos
      resultados por dividendos, JCP e valorização do papel. O tipo aparece no final do
      ticker:
    </Term>
    <Box sx={{ pl: 2 }}>
      <Term label="ON — Ordinária (final 3)">
        dá direito a voto nas assembleias e a <em>tag along</em> mínimo de 80% na venda
        de controle. Ex.: BBAS3, VALE3.
      </Term>
      <Term label="PN — Preferencial (final 4)">
        em geral não vota, mas tem prioridade no recebimento de dividendos e no
        reembolso de capital. Ex.: PETR4, ITUB4.
      </Term>
      <Term label="Unit (final 11)">
        um pacote que junta ações ON e PN num único papel. Ex.: SANB11, KLBN11. Como o
        FII também termina em 11, é o tipo cadastrado aqui que diferencia os dois.
      </Term>
    </Box>
    <Term label="ETF">
      fundo de índice negociado em bolsa: replica uma cesta de ativos, como o BOVA11,
      que acompanha o Ibovespa. Também termina em 11.
    </Term>
    <Term label="Tesouro Direto">
      títulos públicos emitidos pelo Governo Federal (renda fixa). Você compra frações
      de título e o valor é marcado a mercado todo dia. Ex.: <em>Tesouro Selic</em>
      {' '}(pós-fixado, acompanha a taxa Selic), <em>Tesouro Prefixado</em> e
      {' '}<em>Tesouro IPCA+</em> (híbrido, inflação + juro real).
    </Term>
    <Term label="CDB (Certificado de Depósito Bancário)">
      título de renda fixa emitido por um banco para captar recursos; em troca ele paga
      juros, normalmente um percentual do CDI (ex.: 110% do CDI). Tem proteção do FGC
      até o limite vigente e não é negociado em bolsa — a “quantidade” aqui representa o
      valor aplicado em cada aporte.
    </Term>
  </>
)

export function Assets() {
  const [assets, setAssets] = useState([])
  const [quantityByAsset, setQuantityByAsset] = useState({})
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(null)
  const [removing, setRemoving] = useState(null)

  useEffect(() => refresh(), [])

  function refresh() {
    setLoading(true)
    Promise.all([assetService.getAll(), contributionService.getAll()])
      .then(([assetsRes, contributionsRes]) => {
        setAssets(assetsRes)
        const totals = {}
        contributionsRes.forEach(c => { totals[c.assetId] = (totals[c.assetId] || 0) + c.quantity })
        setQuantityByAsset(totals)
      })
      .finally(() => setLoading(false))
  }

  function save(asset) {
    setLoading(true)
    assetService.save(asset)
      .then(() => {
        toast.success('Ativo salvo com sucesso!')
        setEditing(null)
        refresh()
      })
      .finally(() => setLoading(false))
  }

  function remove() {
    setLoading(true)
    assetService.remove(removing.id)
      .then(() => {
        toast.success('Ativo removido.')
        setRemoving(null)
        refresh()
      })
      .finally(() => setLoading(false))
  }

  return (
    <MainContainer
      title="Ativos"
      subtitle="Os investimentos que você acompanha."
      icon={<TrendingUpRounded />}
      loading={loading}
      helpTitle="O que é um ativo? E o que diferencia FII de ação?"
      help={assetsHelp}
    >
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ticker</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell align="center">Tipo</TableCell>
              <TableCell align="right">Cotas / qtde. comprada</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assets.map(a => (
              <TableRow key={a.id} hover>
                <TableCell><strong>{a.ticker}</strong></TableCell>
                <TableCell>{a.name}</TableCell>
                <TableCell align="center"><Chip size="small" label={a.assetType} /></TableCell>
                <TableCell align="right">
                  {quantityByAsset[a.id] ? formatQuantity(quantityByAsset[a.id]) : '—'}
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Editar">
                    <IconButton color="primary" onClick={() => setEditing(a)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Remover">
                    <IconButton color="error" onClick={() => setRemoving(a)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {!assets.length && !loading &&
              <TableRow><TableCell colSpan={5} align="center">Nenhum ativo cadastrado ainda.</TableCell></TableRow>
            }
          </TableBody>
        </Table>
      </TableContainer>

      <Fab color="primary" onClick={() => setEditing({})} sx={{ position: 'fixed', bottom: 32, right: 32 }}>
        <AddIcon />
      </Fab>

      <EditAssetModal
        asset={editing}
        show={!!editing}
        onCancel={() => setEditing(null)}
        onSave={save}
      />
      <ConfirmModal
        show={!!removing}
        text={`Deseja realmente remover o ativo ${(removing || {}).ticker}?`}
        onClose={() => setRemoving(null)}
        onConfirm={remove}
      />
    </MainContainer>
  )
}
