// ===== AUTH =====

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  id: string; // UUID
  username: string;
  fullName: string;
  email: string;
  password: string;
}

export interface UsernameAvailability {
  available: boolean;
  reason?: string;
}

export interface AuthContext {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (id: string, username: string, fullName: string, email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

// ===== USER =====

export interface User {
  id: string // UUID
  username: string
  fullName: string
  email: string
  verified: boolean
}

// ===== DEMAND =====

export interface Demand {
  id: string; // UUID
  userId: string; // UUID
  content: string;
  schema: string;
  email?: string;
  phone?: string; 
  createdAt: number;
  endingAt: number;
}

export interface DemandWithScore {
  demand: Demand;
  score: number;
}

export interface CreateDemandInput {
  content: string;
  email: string;
  phone?: string;
  userId: string; // UUID
  days: number;
}

export interface DemandWithSupplyDetails {
  // Demand fields
  id: string;
  userId: string;
  content: string;
  schema: string;
  email: string;
  phone: string;
  createdAt: number;
  endingAt: number;
  // Supply fields
  supplyId: string;
  supplyContent: string;
  appliedAt: number;
};

export interface RateLimitInfo {
  remaining: number;
  total: number;
  resetAt: string;
}

export interface SearchResponse {
  demand: DemandWithScore[];
  count: number;
  rateLimit: RateLimitInfo;
}

// ===== SUPPLY =====

export interface Supply {
  id: string; // UUID
  demandId: string; // UUID
  userId: string; // UUID
  content: string;
  email: string;
  phone: string;
  paymentIntentId: string;
  createdAt: number;
}

export interface CreateSupplyInput {
  demandId: string; // UUID
  content: string;
  email: string;
  phone?: string;
  userId: string; // UUID
  paymentIntentId: string;
}