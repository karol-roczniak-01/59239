import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import Layout from '@/components/Layout'
import Loader from '@/components/Loader'
import type { AuthContext, User } from '../../utils/types'

const Auth = createContext<AuthContext | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    // Cookie is automatically sent with fetch (credentials: 'include')
    fetch('/api/users/me', {
      credentials: 'include' // Critical: sends httpOnly cookies
    })
      .then(res => {
        if (!res.ok) throw new Error('Not authenticated')
        return res.json()
      })
      .then(data => {
        if (data.user) {
          setUser(data.user)
        }
      })
      .catch(() => {
        // No valid session, user stays null
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Critical: allows server to set cookies
      body: JSON.stringify({ email, password })
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Login failed')
    }

    const data = await res.json()
    setUser(data.user)
    window.location.href = '/'  // Simple reload, or use router.invalidate()

    // No need to manually store token - it's in httpOnly cookie
  }

  const signup = async (name: string, email: string, password: string, type: string) => {
    const res = await fetch('/api/users/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Critical: allows server to set cookies
      body: JSON.stringify({ name, email, password, type })
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Signup failed')
    }

    const data = await res.json()
    setUser(data.user)
    window.location.href = '/'  // Simple reload, or use router.invalidate()
    // No need to manually store token - it's in httpOnly cookie
  }

  const logout = async () => {
    try {
      await fetch('/api/users/signout', {
        method: 'POST',
        credentials: 'include' // Critical: sends cookie to be cleared
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      window.location.href = '/'  // Simple reload, or use router.invalidate()
      // Cookie is cleared by server
    }
  }

  return (
    <Auth.Provider value={{ user, login, signup, logout, isLoading }}>
      {isLoading ? (
        <Layout>
          <Loader />
        </Layout>
      ) : (
        children
      )}
    </Auth.Provider>
  )
}

export function useAuth() {
  const context = useContext(Auth)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

// Utility hook for making authenticated requests
export function useAuthFetch() {
  return async (url: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      credentials: 'include', // Always include cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
  }
}