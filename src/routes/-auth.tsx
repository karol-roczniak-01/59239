import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import Layout from '@/components/Layout'
import Loader from '@/components/Loader'
import type { AuthContext, LoginCredentials, SignupData, User } from '../utils/types'
import { 
  fetchCurrentUser, 
  loginUser, 
  signupUser, 
  logoutUser,
} from '../hooks/useAuth'

const Auth = createContext<AuthContext | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    fetchCurrentUser()
      .then(user => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const credentials: LoginCredentials = { email, password }
    const user = await loginUser(credentials)
    setUser(user)
    // Force a full page reload to ensure all route loaders run with new auth state
    window.location.href = '/'
  }

  const signup = async (name: string, email: string, password: string, type: string) => {
    const signupData: SignupData = { name, email, password, type }
    const user = await signupUser(signupData)
    setUser(user)
    // Force a full page reload to ensure all route loaders run with new auth state
    window.location.href = '/'
  }

  const logout = async () => {
    try {
      await logoutUser()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      // Force a full page reload to ensure all route loaders run with cleared auth state
      window.location.href = '/'
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
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
  }
}