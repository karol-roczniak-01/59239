import { queryOptions } from "@tanstack/react-query";
import type { LoginCredentials, SignupData, User, UsernameAvailability } from "../utils/types";

// ===== API FUNCTIONS =====

export const fetchCurrentUser = async (): Promise<User> => {
  const res = await fetch('/api/users/me', {
    credentials: 'include'
  });
  
  if (!res.ok) {
    throw new Error('Not authenticated');
  }
  
  const data = await res.json();
  return data.user;
};

export const loginUser = async (credentials: LoginCredentials): Promise<User> => {
  const res = await fetch('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(credentials)
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Login failed');
  }

  const data = await res.json();
  return data.user;
};

export const signupUser = async (signupData: SignupData): Promise<User> => {
  const res = await fetch('/api/users/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(signupData)
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Signup failed');
  }

  const data = await res.json();
  return data.user;
};

export const logoutUser = async (): Promise<void> => {
  const res = await fetch('/api/users/signout', {
    method: 'POST',
    credentials: 'include'
  });

  if (!res.ok) {
    throw new Error('Logout failed');
  }
};

export const checkUsernameAvailability = async (username: string): Promise<UsernameAvailability> => {
  const res = await fetch(`/api/users/check-username/${encodeURIComponent(username)}`);
  
  if (!res.ok) {
    throw new Error('Failed to check username availability');
  }
  
  return res.json();
};

// ===== QUERY OPTIONS =====

export const currentUserQueryOptions = () =>
  queryOptions({
    queryKey: ['auth', 'current-user'],
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    retry: false, // Don't retry on auth failures
  });

export const usernameAvailabilityQueryOptions = (username: string) =>
  queryOptions({
    queryKey: ['auth', 'username-availability', username],
    queryFn: () => checkUsernameAvailability(username),
    staleTime: 0, // Always check fresh
    gcTime: 1 * 60 * 1000,
    enabled: !!username && username.length >= 3,
  });