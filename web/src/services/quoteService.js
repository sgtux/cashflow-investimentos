import { MockDb } from './mockDb'
import { mockDelay } from './mockDelay'

// MOCK — API real busca isto na brapi.dev com cache (docs/api-especificacao.md, seção 5).

const getQuote = ticker => {
  const { quotes } = MockDb.getState()
  return mockDelay(quotes[ticker] ?? null, 300)
}

const getQuotes = tickers => {
  const { quotes } = MockDb.getState()
  const result = {}
  tickers.forEach(t => { result[t] = quotes[t] ?? null })
  return mockDelay(result, 300)
}

export default { getQuote, getQuotes }
