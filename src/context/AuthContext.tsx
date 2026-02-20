import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

interface AuthContextType {
  isUnlocked: boolean;
  isLoading: boolean;
  error: string;
  login: (pin: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if user is already authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const token = localStorage.getItem('auth_token');
      const tokenExpiry = localStorage.getItem('auth_token_expiry');
      
      if (token && tokenExpiry) {
        const expiryTime = parseInt(tokenExpiry);
        const now = Date.now();
        
        // Token is valid if not expired
        if (expiryTime > now) {
          setIsUnlocked(true);
          // Set up axios default header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
          // Token expired, clear it
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_token_expiry');
          setIsUnlocked(false);
        }
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setIsUnlocked(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (pin: string) => {
    try {
      setError('');
      setIsLoading(true);
      
      const response = await axios.post(`${API_BASE}/auth/login`, { pin });
      const { token, expiresIn = 3600 } = response.data;
      
      if (token) {
        // Store token and expiry time (default 1 hour)
        const expiryTime = Date.now() + (expiresIn * 1000);
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_token_expiry', expiryTime.toString());
        
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setIsUnlocked(true);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Invalid PIN';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_token_expiry');
    delete axios.defaults.headers.common['Authorization'];
    setIsUnlocked(false);
    setError('');
  };

  return (
    <AuthContext.Provider value={{ isUnlocked, isLoading, error, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
