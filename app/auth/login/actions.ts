'use server';

import { login } from '@/lib/api/auth';
import { redirect } from 'next/navigation';
import type { ApiError } from '@/lib/api/config';

export async function loginAction(formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return {
        error: 'Email and password are required',
      };
    }

    const result = await login({ email, password });
    
    // Redirect to user settings after successful login
    redirect('/user/settings');
  } catch (error: any) {
    return {
      error: error.message || 'Login failed. Please check your credentials.',
    };
  }
}

