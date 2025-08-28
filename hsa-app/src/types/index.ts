// User types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
}

// Authentication types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

// HSA types
export interface HSAAccount {
  id: string;
  userId: string;
  balance: number;
  cardIssued: boolean;
  cardNumber?: string;
}

// Transaction types
export enum ClaimStatus {
  PENDING = 'pending',
  COVERED = 'covered',
  NOT_COVERED = 'not_covered',
  MORE_INFO_NEEDED = 'more_information_needed'
}

export interface Claim {
  id: string;
  userId: string;
  providerName: string;
  service: string;
  amount: number;
  date: string;
  status: ClaimStatus;
}
