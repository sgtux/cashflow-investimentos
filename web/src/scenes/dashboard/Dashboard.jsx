import React, { useState, useEffect } from 'react'
import { Box, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Typography } from '@mui/material'
import { LineChart } from '@mui/x-charts/LineChart'
import { useColorScheme } from '@mui/material/styles'

import { MainContainer } from '../../components/layout/MainContainer'
import { StatTile } from '../../components/StatTile'
import { dashboardService } from '../../services'
import { toReal, toPercent, yearMonthLabel } from '../../helpers/utils'

// Cores validadas com a skill dataviz (scripts/validate_palette.js) para o par categórico
// "Valor Investido" x "Valor de Mercado" — slots 1 (azul) e 2 (laranja) da paleta de
// referência, selecionados por modo (claro/escuro), nunca um flip automático.
const SERIES_COLORS = {
  light: { invested: '#2a78d6', market: '#eb6834' },
  dark: { invested: '#3987e5', market: '#d95926' }
}

export function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const { mode } = useColorScheme()
  const colors = SERIES_COLORS[mode === 'dark' ? 'dark' : 'light']

  useEffect(() => {
    setLoading(true)
    dashboardService.getSummary()
      .then(setSummary)
      .finally(() => setLoading(false))
  }, [])

  const returnIsGood = (summary?.totalReturn ?? 0) >= 0

  return (
    <MainContainer title="Dashboard" loading={loading}>
      {summary &&
        <>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <StatTile label="Total Investido" value={toReal(summary.totalInvested)} />
            <StatTile
              label="Valor de Mercado Atual"
              value={toReal(summary.currentMarketValue)}
              delta={`${returnIsGood ? '+' : ''}${toReal(summary.totalReturn)}`}
              deltaIsGood={returnIsGood}
            />
            <StatTile
              label="Retorno"
              value={`${returnIsGood ? '+' : ''}${toPercent(summary.totalReturnPercent)}`}
              delta={returnIsGood ? 'Acima do investido' : 'Abaixo do investido'}
              deltaIsGood={returnIsGood}
            />
          </Box>

          {summary.monthlyEvolution.length > 0 &&
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                Evolução Mensal
              </Typography>
              <LineChart
                height={320}
                dataset={summary.monthlyEvolution}
                xAxis={[{
                  dataKey: 'yearMonth',
                  scaleType: 'point',
                  valueFormatter: yearMonthLabel
                }]}
                yAxis={[{ valueFormatter: v => `R$ ${Math.round(v)}` }]}
                series={[
                  {
                    dataKey: 'invested',
                    label: 'Valor Investido',
                    color: colors.invested,
                    showMark: true,
                    valueFormatter: v => toReal(v)
                  },
                  {
                    dataKey: 'marketValue',
                    label: 'Valor de Mercado',
                    color: colors.market,
                    showMark: true,
                    valueFormatter: v => toReal(v)
                  }
                ]}
                grid={{ horizontal: true }}
                margin={{ left: 70 }}
              />
            </Box>
          }

          {summary.monthlyEvolution.length > 0 &&
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                Histórico Mensal
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Mês</TableCell>
                      <TableCell align="right">Aporte do mês</TableCell>
                      <TableCell align="right">Total Investido</TableCell>
                      <TableCell align="right">Valor de Mercado</TableCell>
                      <TableCell align="right">Retorno</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {summary.monthlyEvolution.map(m => {
                      const ret = m.invested ? ((m.marketValue - m.invested) / m.invested) * 100 : 0
                      return (
                        <TableRow key={m.yearMonth} hover>
                          <TableCell>{yearMonthLabel(m.yearMonth)}</TableCell>
                          <TableCell align="right">{toReal(m.contributed)}</TableCell>
                          <TableCell align="right">{toReal(m.invested)}</TableCell>
                          <TableCell align="right">{toReal(m.marketValue)}</TableCell>
                          <TableCell align="right" sx={{ color: ret >= 0 ? 'success.main' : 'error.main' }}>
                            {ret >= 0 ? '+' : ''}{toPercent(ret)}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          }

          <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
            Composição por Ativo
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Ticker</TableCell>
                  <TableCell align="right">Quantidade</TableCell>
                  <TableCell align="right">Investido</TableCell>
                  <TableCell align="right">Valor Atual</TableCell>
                  <TableCell align="right">Retorno</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {summary.byAsset.map(a => (
                  <TableRow key={a.assetId} hover>
                    <TableCell><strong>{a.ticker}</strong></TableCell>
                    <TableCell align="right">{a.quantity}</TableCell>
                    <TableCell align="right">{toReal(a.invested)}</TableCell>
                    <TableCell align="right">{toReal(a.currentValue)}</TableCell>
                    <TableCell align="right" sx={{ color: a.returnPercent >= 0 ? 'success.main' : 'error.main' }}>
                      {a.returnPercent >= 0 ? '+' : ''}{toPercent(a.returnPercent)}
                    </TableCell>
                  </TableRow>
                ))}
                {!summary.byAsset.length &&
                  <TableRow><TableCell colSpan={5} align="center">Nenhum aporte lançado ainda.</TableCell></TableRow>
                }
              </TableBody>
            </Table>
          </TableContainer>
        </>
      }
    </MainContainer>
  )
}
