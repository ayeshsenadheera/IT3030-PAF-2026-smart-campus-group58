import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '@/api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const res = await api.get('/auth/me')
      if (res.data?.data) {
        setUser(res.data.data)
      } else {
        localStorage.removeItem('token')
        setUser(null)
      }
    } catch (err) {
      console.error('loadUser failed:', err?.response?.status, err?.response?.data?.message)
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = useCallback((token) => {
    localStorage.setItem('token', token)
    loadUser()
  }, [loadUser])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setUser(null)
  }, [])

  const hasRole      = useCallback((role) => user?.roles?.includes(role) ?? false, [user])
  const isAdmin      = useCallback(() => hasRole('ADMIN'),      [hasRole])
  const isTechnician = useCallback(() => hasRole('TECHNICIAN'), [hasRole])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole, isAdmin, isTechnician }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
