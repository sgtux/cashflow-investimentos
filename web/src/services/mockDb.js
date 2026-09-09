import { StorageKeys } from '../helpers/storageKeys'
import { seedAssets, seedContributions, seedQuotes } from '../mocks/fixtures'

// "Banco de dados" falso, persistido no localStorage para sobreviver a um refresh da página.
// Isto existe só para o frontend mockado funcionar de forma crível sem uma API real por trás
// — quando a API Java existir (ver docs/api-especificacao.md), este arquivo inteiro deixa de
// ser necessário e os services passam a chamar HTTP de verdade.

// Sobe esta versão sempre que as fixtures mudarem de forma: o load descarta um mock antigo
// no localStorage e re-semeia, para o dev não precisar limpar o storage na mão.
const SEED_VERSION = 3

const persist = data => localStorage.setItem(StorageKeys.MOCK_DB, JSON.stringify(data))

const seed = () => {
  const initial = { seedVersion: SEED_VERSION, assets: seedAssets, contributions: seedContributions, quotes: seedQuotes }
  persist(initial)
  return initial
}

const load = () => {
  const raw = localStorage.getItem(StorageKeys.MOCK_DB)
  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      if (parsed.seedVersion === SEED_VERSION)
        return parsed
      // fixtures mudaram desde o último acesso: re-semeia com os dados novos
    } catch (e) {
      // dado corrompido no localStorage: cai para o reseed abaixo
    }
  }
  return seed()
}

let state = load()

const getState = () => state

const setState = updater => {
  state = updater(state)
  persist(state)
  return state
}

export const MockDb = { getState, setState }
