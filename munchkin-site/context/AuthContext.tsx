'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { pb } from '@/lib/pocketbase';

type User = {
  id: string;
  email: string;
  name: string;
} | null;

type AuthContextType = {
  user: User;
  register: (email: string, password: string, username: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing authentication
    const loadUser = () => {
      if (pb.authStore.isValid) {
        setUser(pb.authStore.model as User);
      }
      setIsLoading(false);
    };
    
    loadUser();
    
    // Subscribe to auth state changes
    pb.authStore.onChange(() => {
      if (pb.authStore.isValid) {
        setUser(pb.authStore.model as User);
      } else {
        setUser(null);
      }
    });
  }, []);

  const register = async (email: string, password: string, username: string) => {
    setError(null);
    try {
      const data = {
        email,
        password,
        passwordConfirm: password,
        username
      };
      await pb.collection('users').create(data);
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      await pb.collection('users').authWithPassword(email, password);
      setUser(pb.authStore.model as User);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const logout = () => {
    pb.authStore.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
