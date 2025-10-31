import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ConfirmationResult } from 'firebase/auth';

interface User {
  uid: string;
  phoneNumber: string;
  role: 'user' | 'rider';
  userId?: number; // Blockchain/DB user ID
  riderId?: number; // For riders
  name?: string;
  email?: string;
}

interface AuthStore {
  // Firebase auth
  confirmationResult: ConfirmationResult | null;
  setConfirmationResult: (val: ConfirmationResult | null) => void;

  // User data
  user: User | null;
  setUser: (user: User | null) => void;

  // Auth state
  isAuthenticated: boolean;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Actions
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      confirmationResult: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setConfirmationResult: (val) => set({ confirmationResult: val }),
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setIsLoading: (isLoading) => set({ isLoading }),

      login: (user) => set({ user, isAuthenticated: true }),
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          confirmationResult: null,
        }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
