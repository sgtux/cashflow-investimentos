import { MockDb } from './mockDb'
import { mockDelay } from './mockDelay'

// MOCK — API real: GET/POST/PUT/DELETE /api/contributions (docs/api-especificacao.md, seção 4).

const nextId = list => list.length ? Math.max(...list.map(c => c.id)) + 1 : 1

const withTicker = (contribution, assets) => ({
  ...contribution,
  ticker: (assets.find(a => a.id === contribution.assetId) || {}).ticker
})

const getAll = (filters = {}) => {
  const { contributions, assets } = MockDb.getState()
  let result = contributions

  if (filters.assetId)
    result = result.filter(c => c.assetId === Number(filters.assetId))
  if (filters.from)
    result = result.filter(c => c.contributionDate >= filters.from)
  if (filters.to)
    result = result.filter(c => c.contributionDate <= filters.to)

  result = [...result].sort((a, b) => b.contributionDate.localeCompare(a.contributionDate))
  return mockDelay(result.map(c => withTicker(c, assets)))
}

const getByAsset = assetId => getAll({ assetId })

const save = contribution => mockDelay(null, 200).then(() => {
  const { contributions } = MockDb.getState()
  const totalValue = Number((contribution.quantity * contribution.unitPrice).toFixed(2))

  if (contribution.id) {
    MockDb.setState(state => ({
      ...state,
      contributions: state.contributions.map(c => c.id === contribution.id ? { ...c, ...contribution, totalValue } : c)
    }))
    return { ...contribution, totalValue }
  }

  const created = { ...contribution, totalValue, id: nextId(contributions) }
  MockDb.setState(state => ({ ...state, contributions: [...state.contributions, created] }))
  return created
})

const remove = id => mockDelay(null, 200).then(() => {
  MockDb.setState(state => ({ ...state, contributions: state.contributions.filter(c => c.id !== id) }))
})

export default { getAll, getByAsset, save, remove }
