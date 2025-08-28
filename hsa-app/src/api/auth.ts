import api from './axios';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dateOfBirth: string;
}

export interface AuthResponse {
  token: string;
  user: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
  };
}

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', data);
  return response.data;
};
