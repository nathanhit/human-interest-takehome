import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';

interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
}

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (firstName: string, lastName: string, email: string, password: string, dateOfBirth: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  // Login user
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.login({ email, password });
      
      // Store token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Update state
      setUser(response.user);
      setLoading(false);
      return true;
    } catch (err: any) {
      // Extract detailed error message from API response or provide a more descriptive fallback
      let errorMessage = 'Failed to login. Please check your credentials and try again.';
      
      if (err.response?.status === 400) {
        if (err.response?.data?.message) {
          // Handle specific error cases
          const serverMessage = err.response.data.message;
          
          if (serverMessage === 'Invalid email or password') {
            errorMessage = 'The email or password you entered is incorrect. Please try again.';
          } else {
            errorMessage = serverMessage;
          }
        }
      } else if (err.response?.status === 429) {
        errorMessage = 'Too many login attempts. Please try again later.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.message) {
        // If there's an error message but not from the server
        errorMessage = err.message;
      } else {
        // Check for common error cases
        if (!navigator.onLine) {
          errorMessage = 'No internet connection. Please check your network and try again.';
        } else if (err.code === 'ECONNABORTED') {
          errorMessage = 'The request timed out. Please try again.';
        }
      }
      
      console.error('Login error:', err);
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  };

  // Register user
  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    dateOfBirth: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.register({
        firstName,
        lastName,
        email,
        password,
        dateOfBirth
      });
      
      // Store token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Update state
      setUser(response.user);
      setLoading(false);
      return true;
    } catch (err: any) {
      // Extract detailed error message from API response or provide a more descriptive fallback
      let errorMessage = 'Failed to register. Please try again.';
      
      if (err.response?.status === 400) {
        if (err.response?.data?.message) {
          // Handle specific error cases
          const serverMessage = err.response.data.message;
          
          if (serverMessage === 'A user with this email already exists') {
            errorMessage = 'This email is already registered. Please use a different email or try logging in.';
          } else if (serverMessage.includes('Password must be')) {
            errorMessage = serverMessage;
          } else if (serverMessage.includes('email')) {
            errorMessage = 'Please enter a valid email address.';
          } else if (serverMessage.includes('date of birth')) {
            errorMessage = 'Please enter a valid date of birth.';
          } else {
            errorMessage = serverMessage;
          }
        }
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.message) {
        // If there's an error message but not from the server
        errorMessage = err.message;
      } else {
        // Check for common error cases
        if (!navigator.onLine) {
          errorMessage = 'No internet connection. Please check your network and try again.';
        } else if (err.code === 'ECONNABORTED') {
          errorMessage = 'The request timed out. Please try again.';
        }
      }
      
      console.error('Registration error:', err);
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
