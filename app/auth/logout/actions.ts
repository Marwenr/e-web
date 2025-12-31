'use server';

import { logout, clearTokens } from '@/lib/api/auth';
import { redirect } from 'next/navigation';

export async function logoutAction() {
  try {
    // Call logout API to revoke refresh token
    await logout();
  } catch (error) {
    // Continue with logout even if API call fails
    console.error('Logout error:', error);
  } finally {
    // Always clear tokens
    clearTokens();
  }
  
  redirect('/auth/login');
}

