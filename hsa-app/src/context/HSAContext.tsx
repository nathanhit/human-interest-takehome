import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { hsaAPI, claimsAPI } from '../api';
import { useAuth } from './AuthContext';
import { ClaimStatus } from '../api/claims';

interface HSAAccount {
  accountId: string;
  userId: string;
  balance: number;
  cardIssued: boolean;
  cardNumber: string | null;
  cardExpiryDate: string | null;
  cardCVV: string | null;
}

interface Claim {
  claimId: string;
  userId: string;
  providerName: string;
  service: string;
  amount: number;
  date: string;
  status: ClaimStatus;
  notes?: string;
}

interface HSAContextProps {
  account: HSAAccount | null;
  claims: Claim[];
  loading: boolean;
  error: string | null;
  createAccount: () => Promise<boolean>;
  depositFunds: (amount: number, routingNumber: string) => Promise<boolean>;
  issueCard: () => Promise<boolean>;
  reissueCard: () => Promise<boolean>;
  createClaim: (providerName: string, service: string, amount: number, hasDocumentation?: boolean) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

const HSAContext = createContext<HSAContextProps | undefined>(undefined);

export const useHSA = () => {
  const context = useContext(HSAContext);
  if (context === undefined) {
    throw new Error('useHSA must be used within a HSAProvider');
  }
  return context;
};

interface HSAProviderProps {
  children: ReactNode;
}

export const HSAProvider: React.FC<HSAProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<HSAAccount | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isAuthenticated } = useAuth();

  // Load HSA account and claims when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    } else {
      setAccount(null);
      setClaims([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Refresh all HSA data
  const refreshData = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // Get account
      const accountResponse = await hsaAPI.getAccount();
      setAccount(accountResponse.account);
      
      // Get claims
      const claimsResponse = await claimsAPI.getClaims();
      setClaims(claimsResponse.claims);
    } catch (err: any) {
      // If 404, it means no account exists yet
      if (err.response?.status === 404) {
        setAccount(null);
      } else {
        setError(err.response?.data?.message || 'Failed to load HSA data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Create HSA account
  const createAccount = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await hsaAPI.createAccount();
      setAccount(response.account);
      setLoading(false);
      return true;
    } catch (err: any) {
      // If user already has an account, try to fetch it instead of showing error
      if (err.response?.data?.message === 'User already has an HSA account') {
        console.log('User already has HSA account, fetching existing account...');
        try {
          await refreshData(); // This will get the existing account
          return true;
        } catch (refreshErr) {
          setError('Unable to access your HSA account. Please try logging out and back in.');
          setLoading(false);
          return false;
        }
      } else {
        setError(err.response?.data?.message || 'Failed to create account');
        setLoading(false);
        return false;
      }
    }
  };

  // Deposit funds
  const depositFunds = async (amount: number, routingNumber: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await hsaAPI.deposit({ amount, routingNumber });
      setAccount(response.account);
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to deposit funds');
      setLoading(false);
      return false;
    }
  };

  // Issue card
  const issueCard = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await hsaAPI.issueCard(); // Not using the response directly
      await refreshData(); // Refresh account data to get updated card info
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to issue card');
      setLoading(false);
      return false;
    }
  };

  // Reissue card
  const reissueCard = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await hsaAPI.reissueCard(); // Not using the response directly
      await refreshData(); // Refresh account data to get updated card info
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reissue card');
      setLoading(false);
      return false;
    }
  };

  // Create claim
  const createClaim = async (
    providerName: string, 
    service: string, 
    amount: number,
    hasDocumentation: boolean = false
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await claimsAPI.createClaim({ 
        providerName, 
        service, 
        amount,
        hasDocumentation 
      });
      await refreshData(); // Refresh claims
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create claim');
      setLoading(false);
      return false;
    }
  };

  const value = {
    account,
    claims,
    loading,
    error,
    createAccount,
    depositFunds,
    issueCard,
    reissueCard,
    createClaim,
    refreshData
  };

  return <HSAContext.Provider value={value}>{children}</HSAContext.Provider>;
};

export default HSAContext;
