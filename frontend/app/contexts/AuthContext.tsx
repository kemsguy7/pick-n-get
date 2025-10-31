/* eslint-disable react-refresh/only-export-components */
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { checkWalletRoles } from '../apis/backendApi';

export interface UserData {
  userId: number;
  name: string;
  profileImage?: string;
}

export interface RiderData {
  riderId: number;
  approvalStatus: string;
  riderStatus: string;
}

export interface AuthUser {
  walletAddress: string;
  roles: string[];
  primaryRole: string;
  userData?: UserData;
  riderData?: RiderData;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (walletAddress: string) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  hasRole: (role: string) => boolean;
  isPrimaryRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'PICK_N_GET_AUTH';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load auth from localStorage on mount
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
        if (savedAuth) {
          const parsedAuth = JSON.parse(savedAuth);
          console.log('📦 Loaded auth from storage:', parsedAuth.walletAddress);

          // Verify auth is still valid by checking backend
          await refreshAuthSilent(parsedAuth.walletAddress);
        }
      } catch (error) {
        console.error('❌ Failed to load auth:', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuth();
  }, []);

  // Silent refresh (no loading state)
  const refreshAuthSilent = async (walletAddress: string) => {
    try {
      const response = await checkWalletRoles(walletAddress);

      if (response.status === 'success' && response.data) {
        const authUser: AuthUser = {
          walletAddress: response.data.walletAddress,
          roles: response.data.roles,
          primaryRole: response.data.primaryRole,
          userData: response.data.userData,
          riderData: response.data.riderData,
        };

        setUser(authUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      } else {
        throw new Error('Invalid auth response');
      }
    } catch (error) {
      console.error('❌ Silent auth refresh failed:', error);
      setUser(null);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  // Login function (called when wallet connects)
  const login = async (walletAddress: string) => {
    setIsLoading(true);
    console.log('🔐 Logging in with wallet:', walletAddress);

    try {
      const response = await checkWalletRoles(walletAddress);

      if (response.status === 'error') {
        throw new Error('Failed to fetch user roles');
      }

      const authUser: AuthUser = {
        walletAddress: response.data.walletAddress,
        roles: response.data.roles,
        primaryRole: response.data.primaryRole,
        userData: response.data.userData,
        riderData: response.data.riderData,
      };

      setUser(authUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));

      console.log('✅ Login successful:', {
        primaryRole: authUser.primaryRole,
        roles: authUser.roles,
      });

      // Redirect based on primary role
      redirectToDashboard(authUser.primaryRole);
    } catch (error) {
      console.error('❌ Login failed:', error);
      setUser(null);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    console.log('👋 Logging out');
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    router.push('/');
  };

  // Refresh auth (manual refresh with loading state)
  const refreshAuth = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      await refreshAuthSilent(user.walletAddress);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has a specific role
  const hasRole = (role: string): boolean => {
    return user?.roles.includes(role) ?? false;
  };

  // Check if role is primary
  const isPrimaryRole = (role: string): boolean => {
    return user?.primaryRole === role;
  };

  // Redirect based on role
  const redirectToDashboard = (primaryRole: string) => {
    const roleRoutes: Record<string, string> = {
      SuperAdmin: '/admin',
      Admin: '/admin',
      Rider: '/agents',
      Recycler: '/dashboard',
      Guest: '/',
    };

    const targetRoute = roleRoutes[primaryRole] || '/dashboard';
    console.log(`🚀 Redirecting to: ${targetRoute}`);

    // Small delay to ensure state is updated
    setTimeout(() => {
      router.push(targetRoute);
    }, 100);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshAuth,
    hasRole,
    isPrimaryRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
