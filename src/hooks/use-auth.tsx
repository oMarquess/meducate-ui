'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI, User, SignUpData, SignInData, isAuthenticated, clearTokens } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
  signUp: (data: SignUpData) => Promise<any>;
  signIn: (data: SignInData) => Promise<void>;
  signOut: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<any>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isSignedIn = !!user && user.is_verified;

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      if (isAuthenticated()) {
        try {
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Failed to load user:', error);
          clearTokens();
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const signUp = async (data: SignUpData) => {
    const response = await authAPI.signUp(data);
    return response;
  };

  const signIn = async (data: SignInData) => {
    const response = await authAPI.signIn(data);
    console.log('Auth hook: Setting user data:', response.user);
    setUser(response.user);
    
    // Ensure the state is updated immediately
    return response;
  };

  const signOut = async () => {
    await authAPI.signOut();
    setUser(null);
  };

  const verifyEmail = async (token: string) => {
    const response = await authAPI.verifyEmail(token);
    setUser(response.user);
  };

  const resendVerification = async (email: string) => {
    return await authAPI.resendVerification(email);
  };

  const refreshUser = async () => {
    if (isAuthenticated()) {
      try {
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to refresh user:', error);
        clearTokens();
        setUser(null);
      }
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isSignedIn,
    signUp,
    signIn,
    signOut,
    verifyEmail,
    resendVerification,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 