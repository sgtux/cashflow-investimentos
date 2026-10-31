import { StorageKeys } from '../helpers/storageKeys'

const getUser = () => JSON.parse(localStorage.getItem(StorageKeys.USER))

const setUser = user => user ? localStorage.setItem(StorageKeys.USER, JSON.stringify(user)) : localStorage.removeItem(StorageKeys.USER)

const getToken = () => localStorage.getItem(StorageKeys.TOKEN)

const setToken = token => token ? localStorage.setItem(StorageKeys.TOKEN, token) : localStorage.removeItem(StorageKeys.TOKEN)

const getThemeMode = () => localStorage.getItem(StorageKeys.THEME_MODE) || 'light'

const setThemeMode = mode => mode ? localStorage.setItem(StorageKeys.THEME_MODE, mode) : localStorage.removeItem(StorageKeys.THEME_MODE)

export const StorageService = {
  getUser,
  setUser,
  getToken,
  setToken,
  getThemeMode,
  setThemeMode
}
