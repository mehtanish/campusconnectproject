'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted auth state
  useEffect(() => {
    const savedToken = localStorage.getItem('campuspulse_token');
    const savedUser = localStorage.getItem('campuspulse_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const persistAuth = useCallback((authResponse: AuthResponse) => {
    const userData: User = {
      userId: authResponse.userId,
      name: authResponse.name,
      email: authResponse.email,
      rollNo: authResponse.rollNo,
      role: authResponse.role,
    };

    setToken(authResponse.token);
    setUser(userData);
    localStorage.setItem('campuspulse_token', authResponse.token);
    localStorage.setItem('campuspulse_user', JSON.stringify(userData));
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const response = await api.post<AuthResponse>('/api/auth/login', data);
    persistAuth(response.data);
  }, [persistAuth]);

  const register = useCallback(async (data: RegisterRequest) => {
    const response = await api.post<AuthResponse>('/api/auth/register', data);
    persistAuth(response.data);
  }, [persistAuth]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('campuspulse_token');
    localStorage.removeItem('campuspulse_user');
  }, []);

  const isAdmin = !!user && user.role !== 'STUDENT';
  const isSuperAdmin = !!user && user.role === 'SUPER_ADMIN';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      isAuthenticated: !!token && !!user,
      login,
      register,
      logout,
      isAdmin,
      isSuperAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
