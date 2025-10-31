'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/authStore';

export function useAuthGuard(requiredRole?: 'user' | 'rider') {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
        return;
      }

      if (requiredRole && user?.role !== requiredRole) {
        // Redirect to correct dashboard
        if (user?.role === 'rider') {
          router.push('/agents');
        } else {
          router.push('/dashboard');
        }
      }
    }
  }, [isAuthenticated, user, requiredRole, isLoading, router]);

  return { isAuthenticated, user, isLoading };
}
