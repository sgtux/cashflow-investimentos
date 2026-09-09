import { MockDb } from './mockDb'
import { mockDelay } from './mockDelay'

// MOCK — API real: GET/POST/PUT/DELETE /api/assets (docs/api-especificacao.md, seção 4).

const nextId = list => list.length ? Math.max(...list.map(a => a.id)) + 1 : 1

const getAll = (active = true) => {
  const { assets } = MockDb.getState()
  const result = active ? assets.filter(a => !a.inactiveAt) : assets
  return mockDelay(result.map(a => ({ ...a })))
}

const getById = id => {
  const { assets } = MockDb.getState()
  const asset = assets.find(a => a.id === Number(id))
  return mockDelay(asset ? { ...asset } : null)
}

const save = asset => mockDelay(null, 200).then(() => {
  const { assets } = MockDb.getState()

  if (asset.id) {
    MockDb.setState(state => ({
      ...state,
      assets: state.assets.map(a => a.id === asset.id ? { ...a, ...asset } : a)
    }))
    return { ...asset }
  }

  const created = { ...asset, id: nextId(assets), inactiveAt: null }
  MockDb.setState(state => ({ ...state, assets: [...state.assets, created] }))
  return created
})

const remove = id => mockDelay(null, 200).then(() => {
  MockDb.setState(state => ({
    ...state,
    assets: state.assets.map(a => a.id === id ? { ...a, inactiveAt: new Date().toISOString() } : a)
  }))
})

export default { getAll, getById, save, remove }
