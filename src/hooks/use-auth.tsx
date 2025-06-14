'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI, User, SignUpData, SignInData, isAuthenticated, clearTokens, checkAndRefreshToken } from '@/lib/auth';

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

  // Load user on mount and set up proactive token refresh
  useEffect(() => {
    const loadUser = async () => {
      if (isAuthenticated()) {
        try {
          await checkAndRefreshToken(); // Check and refresh token if needed
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

    // Set up interval for proactive token refresh (check every 4 minutes)
    const tokenCheckInterval = setInterval(async () => {
      if (isAuthenticated()) {
        await checkAndRefreshToken();
      }
    }, 4 * 60 * 1000); // 4 minutes

    return () => clearInterval(tokenCheckInterval);
  }, []);

  const signUp = async (data: SignUpData) => {
    const response = await authAPI.signUp(data);
    return response;
  };

  const signIn = async (data: SignInData) => {
    const response = await authAPI.signIn(data);
    setUser(response.user);
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