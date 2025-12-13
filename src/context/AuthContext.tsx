import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { apiGet, apiPost } from '../lib/api'
import type { ApiMeResponse, ApiUser } from '../lib/api-types'

interface AuthContextValue {
  user: ApiUser | null
  loading: boolean
  refresh: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({
  initialUser,
  children,
}: {
  initialUser: ApiUser | null
  children: React.ReactNode
}) {
  const [user, setUser] = useState<ApiUser | null>(initialUser)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setUser(initialUser)
  }, [initialUser])

  const refresh = async () => {
    setLoading(true)
    try {
      const res = await apiGet<ApiMeResponse>('/api/me')
      setUser(res.user)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await apiPost<{ ok: true }>('/api/auth/sign-out')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const value = useMemo<AuthContextValue>(() => ({ user, loading, refresh, signOut }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
