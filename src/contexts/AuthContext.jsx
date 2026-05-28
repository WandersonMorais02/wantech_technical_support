import { createContext, useContext, useMemo, useState } from 'react'
import { authStorage } from '../utils/authStorage'
import { login as loginRequest } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(authStorage.getToken())
  const [user, setUser] = useState(authStorage.getUser())

  const isAuthenticated = Boolean(token)

  async function login(credentials) {
    const data = await loginRequest(credentials)

    const receivedToken =
      data.token ||
      data.accessToken ||
      data.data?.token ||
      data.data?.accessToken

    const receivedUser =
      data.user ||
      data.data?.user ||
      null

    if (!receivedToken) {
      throw new Error('Token não retornado pela API.')
    }

    authStorage.setToken(receivedToken)

    if (receivedUser) {
      authStorage.setUser(receivedUser)
    }

    setToken(receivedToken)
    setUser(receivedUser)

    return data
  }

  function logout() {
    authStorage.clear()
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated,
      login,
      logout,
    }),
    [token, user, isAuthenticated],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth precisa estar dentro de AuthProvider.')
  }

  return context
}
