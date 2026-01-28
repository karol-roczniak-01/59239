// ===== AUTH =====

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  id: string; // UUID
  name: string;
  email: string;
  password: string;
  type: string;
}

export interface UsernameAvailability {
  available: boolean;
  reason?: string;
}

export interface AuthContext {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (id: string, name: string, email: string, password: string, type: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

// ===== USER =====

export interface User {
  id: string // UUID
  name: string
  email: string
  type: string
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