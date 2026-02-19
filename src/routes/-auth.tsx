import {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react'
import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
} from '../hooks/useAuth'
import type {ReactNode} from 'react';
import type {
  AuthContext,
  LoginCredentials,
  User,
} from '../utils/types'
import Loader from '@/components/Loader'

const Auth = createContext<AuthContext | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    fetchCurrentUser()
      .then((currentUser) => setUser(currentUser))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const credentials: LoginCredentials = { email, password }
    const loggedInUser = await loginUser(credentials)
    setUser(loggedInUser)
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
    <Auth.Provider value={{ user, login, logout, isLoading }}>
      {isLoading ? (
        <div className='h-dvh w-full flex items-center justify-center'>
          <Loader />
        </div>
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
        ...options.headers,
      },
    })
  }
}
