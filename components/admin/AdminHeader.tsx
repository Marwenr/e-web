'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { logout as apiLogout } from '@/lib/api/auth';
import { LogoutIcon, UserIcon } from '@/components/svg';

export const AdminHeader: React.FC = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      window.location.href = '/auth/login';
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-background border-b border-neutral-200">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          {/* Breadcrumb will be added here if needed */}
        </div>

        <div className="flex items-center gap-4">
          {/* User menu */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-body-sm">
              <UserIcon className="h-5 w-5 text-foreground-secondary" />
              <span className="text-foreground">
                {user?.firstName || user?.email || 'Admin'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-body-sm text-foreground-secondary hover:text-foreground hover:bg-neutral-100 rounded-md transition-colors"
              aria-label="Logout"
            >
              <LogoutIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

