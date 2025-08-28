import api from './axios';

export interface HSAAccount {
  accountId: string;
  userId: string;
  balance: number;
  cardIssued: boolean;
  cardNumber: string | null;
  cardExpiryDate: string | null;
  cardCVV: string | null;
}

export interface DepositData {
  amount: number;
  routingNumber: string;
}

export interface CardData {
  cardNumber: string;
  cardExpiryDate: string;
  cardCVV: string;
}

export const createAccount = async (): Promise<{ account: HSAAccount }> => {
  const response = await api.post('/hsa');
  return response.data;
};

export const getAccount = async (): Promise<{ account: HSAAccount }> => {
  const response = await api.get('/hsa');
  return response.data;
};

export const deposit = async (data: DepositData): Promise<{ account: HSAAccount }> => {
  const response = await api.post('/hsa/deposit', data);
  return response.data;
};

export const issueCard = async (): Promise<{ card: CardData }> => {
  const response = await api.post('/hsa/issue-card');
  return response.data;
};

export const reissueCard = async (): Promise<{ card: CardData }> => {
  const response = await api.post('/hsa/reissue-card');
  return response.data;
};
