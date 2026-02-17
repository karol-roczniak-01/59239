import { queryOptions } from '@tanstack/react-query'
import type { User } from '../utils/types'

// ===== API FUNCTIONS ======

export const fetchUserByName = async (name: string): Promise<User> => {
  const res = await fetch(`/api/me/user/${encodeURIComponent(name)}`)
  if (!res.ok) throw new Error('Failed to fetch user')
  const data = await res.json()
  return data.user
}

export const fetchHumansByName = async (name: string): Promise<Array<User>> => {
  const res = await fetch(
    `/api/users/humans/search?name=${encodeURIComponent(name)}`,
  )
  if (!res.ok) throw new Error('Failed to search humans')
  const data = await res.json()
  return data.users
}

export const fetchOrganizationsByName = async (
  name: string,
): Promise<Array<User>> => {
  const res = await fetch(
    `/api/users/organizations/search?name=${encodeURIComponent(name)}`,
  )
  if (!res.ok) throw new Error('Failed to search humans')
  const data = await res.json()
  return data.users
}

// ===== QUERIES =====

export const userByNameQueryOptions = (name: string) =>
  queryOptions({
    queryKey: ['users', 'by-name', name],
    queryFn: () => fetchUserByName(name),
    staleTime: 5 * 60 * 1000, // 5 minutes (user data changes infrequently)
    gcTime: 10 * 60 * 1000,
  })

export const humansByNameQueryOptions = (name: string) =>
  queryOptions({
    queryKey: ['users', 'humans', 'search', name],
    queryFn: () => fetchHumansByName(name),
    staleTime: 30 * 1000, // 30 seconds (search results change frequently)
    gcTime: 5 * 60 * 1000,
    enabled: !!name && name.length > 1,
  })

export const organizationsByNameQueryOptions = (name: string) =>
  queryOptions({
    queryKey: ['users', 'organizations', 'search', name],
    queryFn: () => fetchOrganizationsByName(name),
    staleTime: 30 * 1000, // 30 seconds (search results change frequently)
    gcTime: 5 * 60 * 1000,
    enabled: !!name && name.length > 1,
  })
