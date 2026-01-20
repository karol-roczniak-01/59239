// ===== USER/AUTH =====

export interface User {
  id: number
  name: string
  email: string
  type: string
  verified: number
};

export interface AuthContext {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string, type: string) => Promise<void>
  logout: () => void
  isLoading: boolean
};