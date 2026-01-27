// ===== AUTH =====

export interface LoginCredentials {
  email: string;
  password: string;
};

export interface SignupData {
  name: string;
  email: string;
  password: string;
  type: string;
};

export interface UsernameAvailability {
  available: boolean;
  reason?: string;
};

export interface AuthContext {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string, type: string) => Promise<void>
  logout: () => void
  isLoading: boolean
};

// ===== USER =====

export interface User {
  id: number
  name: string
  email: string
  type: string
  verified: number
};

// ===== DEMAND =====

export interface Demand {
  id: number;
  userId: number;
  content: string;
  schema: string;
  email?: string;
  phone?: string; 
  createdAt: number;
}

export interface DemandWithScore {
  demand: Demand;
  score: number;
}

export interface CreateDemandInput {
  content: string;
  email: string;
  phone?: string;
  userId: number;
}


// ===== SUPPLY =====

export interface Supply {
  id: number;
  demandId: number;
  userId: number;
  content: string;
  email: string;
  phone: string;
  paymentIntentId: string;
  createdAt: number;
}

export interface CreateSupplyInput {
  demandId: number;
  content: string;
  email: string;
  phone?: string;
  userId: number;
  paymentIntentId: string;
}