import { StorageService } from './storage.service'
import { mockDelay } from './mockDelay'

// MOCK — quando a API Java existir, isto vira:
//   httpService.postNotAuthenticated('/auth/login', { email, password })
// que no backend faz proxy para POST /api/token na API .NET do Cashflow.
// Ver docs/api-especificacao.md, seção 2.1. Assinatura da função não deve mudar.
const login = ({ email, password }) => {
  if (!email || !password)
    return Promise.reject({ message: 'Informe email e senha.' })

  const user = { id: 1, email }
  return mockDelay({ ...user, token: 'mock-jwt-token' }, 400).then(res => {
    StorageService.setToken(res.token)
    StorageService.setUser(user)
    return user
  })
}

const logout = () => {
  StorageService.setToken(null)
  StorageService.setUser(null)
}

const getCurrentUser = () => StorageService.getUser()

export default { login, logout, getCurrentUser }
