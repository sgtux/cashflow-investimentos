import React, { createContext, useContext, useReducer } from 'react'
import { StorageService } from '../services'

// Estado global simples via Context + useReducer. O Site do Cashflow usa Redux, mas esse app
// tem só 4 telas e um estado de sessão/tema/loader bem pequeno — Redux seria peso
// desnecessário aqui. Ver docs/api-especificacao.md / plano original para essa decisão.

const initialState = {
  user: StorageService.getUser(),
  themeMode: StorageService.getThemeMode(),
  globalLoader: 0
}

function reducer(state, action) {
  switch (action.type) {
    case 'USER_CHANGED':
      StorageService.setUser(action.user)
      return { ...state, user: action.user }
    case 'THEME_MODE_CHANGED':
      StorageService.setThemeMode(action.mode)
      return { ...state, themeMode: action.mode }
    case 'SHOW_GLOBAL_LOADER':
      return { ...state, globalLoader: state.globalLoader + 1 }
    case 'HIDE_GLOBAL_LOADER':
      return { ...state, globalLoader: Math.max(0, state.globalLoader - 1) }
    default:
      return state
  }
}

const AppStateContext = createContext(null)
const AppDispatchContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  )
}

export const useAppState = () => useContext(AppStateContext)
export const useAppDispatch = () => useContext(AppDispatchContext)

export const userChanged = user => ({ type: 'USER_CHANGED', user })
export const themeModeChanged = mode => ({ type: 'THEME_MODE_CHANGED', mode })
export const showGlobalLoader = () => ({ type: 'SHOW_GLOBAL_LOADER' })
export const hideGlobalLoader = () => ({ type: 'HIDE_GLOBAL_LOADER' })
