'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { getTokens, refreshToken } from '@/lib/api/auth';

/**
 * Hook to initialize and manage authentication state
 */
export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, initialize, setAuthData } = useAuthStore();

  useEffect(() => {
    // Initialize auth state on mount
    initialize();

    // Check if we have tokens and refresh if needed
    const checkAuth = async () => {
      const { accessToken, refreshToken: storedRefreshToken } = getTokens();
      
      if (storedRefreshToken && !accessToken) {
        // Try to refresh token
        try {
          const result = await refreshToken();
          // Token refreshed, user should be authenticated
        } catch (error) {
          // Refresh failed, user needs to login
          console.error('Token refresh failed:', error);
        }
      }
    };

    checkAuth();
  }, [initialize]);

  return {
    user,
    isAuthenticated,
  };
}

/**
 * Hook to protect routes - redirects to login if not authenticated
 */
export function useRequireAuth() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
}

