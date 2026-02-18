import type { LoginCredentials, User } from '../utils/types'

const API_BASE = '/api/users'

export async function fetchCurrentUser(): Promise<User> {
  const response = await fetch(`${API_BASE}/me`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Not authenticated')
  }

  const data = await response.json()
  return data.user
}

export async function loginUser(credentials: LoginCredentials): Promise<User> {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Login failed')
  }

  const data = await response.json()
  return data.user
}

export async function logoutUser(): Promise<void> {
  const response = await fetch(`${API_BASE}/signout`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Logout failed')
  }
}
