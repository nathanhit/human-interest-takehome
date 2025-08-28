import api from './axios';

export enum ClaimStatus {
  PENDING = 'pending',
  COVERED = 'covered',
  NOT_COVERED = 'not_covered',
  MORE_INFO_NEEDED = 'more_information_needed'
}

export interface Claim {
  claimId: string;
  userId: string;
  providerName: string;
  service: string;
  amount: number;
  date: string;
  status: ClaimStatus;
  notes?: string;
}

export interface NewClaimData {
  providerName: string;
  service: string;
  amount: number;
  hasDocumentation?: boolean;
  documentCount?: number;
}

export interface UpdateClaimData {
  status?: ClaimStatus;
  notes?: string;
}

export interface HSAEligibleService {
  name: string;
  category: string;
  irsQualified: boolean;
  requiresPrescription?: boolean;
  requiresLetterOfMedicalNecessity?: boolean;
  description?: string;
}

export interface EligibilityResponse {
  eligible: boolean;
  confidence: number;
  service?: HSAEligibleService;
  message?: string;
  explanation?: string;
  suggestedServices?: string[];
  suggestedAlternative?: string;
  requiresReview?: boolean;
  exactMatch?: boolean;
  requiresPrescription?: boolean;
  requiresLetterOfMedicalNecessity?: boolean;
}

export const createClaim = async (data: NewClaimData): Promise<{ claim: Claim }> => {
  const response = await api.post('/claims', data);
  return response.data;
};

export const getClaims = async (): Promise<{ claims: Claim[] }> => {
  const response = await api.get('/claims');
  return response.data;
};

export const getClaim = async (id: string): Promise<{ claim: Claim }> => {
  const response = await api.get(`/claims/${id}`);
  return response.data;
};

export const updateClaim = async (id: string, data: UpdateClaimData): Promise<{ claim: Claim }> => {
  const response = await api.put(`/claims/${id}`, data);
  return response.data;
};

export const checkEligibility = async (service: string): Promise<EligibilityResponse> => {
  const response = await api.post('/claims/check-eligibility', { service });
  return response.data;
};

export const checkEligibilityPublic = async (service: string): Promise<EligibilityResponse> => {
  const response = await api.post('/public/check-eligibility', { service });
  return response.data;
};

export interface CardTransactionData {
  cardNumber: string;
  providerName: string;
  service: string;
  amount: number;
  hasDocumentation?: boolean;
  documentCount?: number;
}

export interface CardTransactionResponse {
  message: string;
  status: ClaimStatus;
  notes: string;
  claim: {
    service: string;
    amount: number;
    date: string;
    status: ClaimStatus;
  };
}

export const submitCardTransaction = async (data: CardTransactionData): Promise<CardTransactionResponse> => {
  const response = await api.post('/public/card-transaction', data);
  return response.data;
};
