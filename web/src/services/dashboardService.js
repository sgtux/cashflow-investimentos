import { MockDb } from './mockDb'
import { mockDelay } from './mockDelay'

// MOCK — API real: GET /api/dashboard/summary (docs/api-especificacao.md, seção 4).
// A agregação abaixo é o contrato exato que esse endpoint precisa devolver.

const round2 = n => Math.round(n * 100) / 100

const yearMonthOf = dateStr => dateStr.slice(0, 7)

const currentYearMonth = () => new Date().toISOString().slice(0, 7)

const getSummary = () => {
  const { assets, contributions, quotes } = MockDb.getState()
  const activeAssets = assets.filter(a => !a.inactiveAt)
  const nowYearMonth = currentYearMonth()

  const byAsset = activeAssets.map(asset => {
    const assetContributions = contributions.filter(c => c.assetId === asset.id)

    const quantity = assetContributions.reduce((sum, c) => sum + c.quantity, 0)
    const invested = round2(assetContributions.reduce((sum, c) => sum + c.totalValue, 0))
    const currentPrice = quotes[asset.ticker] ?? 0
    const currentValue = round2(quantity * currentPrice)
    const returnValue = round2(currentValue - invested)
    const returnPercent = invested ? round2((returnValue / invested) * 100) : 0

    return {
      assetId: asset.id,
      ticker: asset.ticker,
      quantity: round2(quantity),
      invested,
      currentValue,
      returnPercent
    }
  }).filter(a => a.quantity > 0)

  const totalInvested = round2(byAsset.reduce((sum, a) => sum + a.invested, 0))
  const currentMarketValue = round2(byAsset.reduce((sum, a) => sum + a.currentValue, 0))
  const totalReturn = round2(currentMarketValue - totalInvested)
  const totalReturnPercent = totalInvested ? round2((totalReturn / totalInvested) * 100) : 0

  return mockDelay({
    totalInvested,
    currentMarketValue,
    totalReturn,
    totalReturnPercent,
    byAsset,
    monthlyEvolution: buildMonthlyEvolution(activeAssets, contributions, quotes, nowYearMonth)
  }, 350)
}

// Aproximação para fins de demonstração: usa o preço do último aporte conhecido até cada mês
// como "preço de mercado" daquele mês, exceto no mês corrente, que usa a cotação atual. Uma
// API real deveria usar o histórico de fechamento de verdade do ativo por mês.
function buildMonthlyEvolution(assets, contributions, quotes, nowYearMonth) {
  const assetIds = new Set(assets.map(a => a.id))
  const scoped = contributions.filter(c => assetIds.has(c.assetId))
  const months = [...new Set(scoped.map(c => yearMonthOf(c.contributionDate)))].sort()

  return months.map(month => {
    let invested = 0
    let marketValue = 0

    // Aportado só neste mês (valor novo colocado), separado do total investido acumulado.
    const contributed = round2(scoped
      .filter(c => yearMonthOf(c.contributionDate) === month)
      .reduce((sum, c) => sum + c.totalValue, 0))

    assets.forEach(asset => {
      const upToMonth = contributions
        .filter(c => c.assetId === asset.id && yearMonthOf(c.contributionDate) <= month)
        .sort((a, b) => a.contributionDate.localeCompare(b.contributionDate))

      if (!upToMonth.length)
        return

      const quantity = upToMonth.reduce((sum, c) => sum + c.quantity, 0)
      const assetInvested = upToMonth.reduce((sum, c) => sum + c.totalValue, 0)
      const lastKnownPrice = upToMonth[upToMonth.length - 1].unitPrice
      const priceAtMonth = month === nowYearMonth ? (quotes[asset.ticker] ?? lastKnownPrice) : lastKnownPrice

      invested += assetInvested
      marketValue += quantity * priceAtMonth
    })

    return { yearMonth: month, contributed, invested: round2(invested), marketValue: round2(marketValue) }
  })
}

export default { getSummary }
