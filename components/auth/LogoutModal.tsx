'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, Button } from '@/components/ui';
import { LogoutIcon } from '@/components/svg';
import { LoadingState } from '@/components/patterns';
import { logout } from '@/lib/api/auth';
import { useAuthStore } from '@/store/auth';

export interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
}: LogoutModalProps) {
  const router = useRouter();
  const { logout: logoutStore } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    
    try {
      // Call logout API
      await logout();
      
      // Update store
      logoutStore();
      
      setIsLoading(false);
      setIsRedirecting(true);
      
      // Redirect after short delay
      setTimeout(() => {
        onConfirm();
        router.push('/auth/login');
      }, 1000);
    } catch (error) {
      // Even if API fails, clear local state and redirect
      logoutStore();
      setIsLoading(false);
      setIsRedirecting(true);
      setTimeout(() => {
        onConfirm();
        router.push('/auth/login');
      }, 1000);
    }
  };

  const handleCancel = () => {
    if (!isLoading && !isRedirecting) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Sign Out"
      description="Are you sure you want to sign out of your account?"
      size="sm"
    >
      <div className="space-y-6">
        {/* Confirmation Message */}
        {!isRedirecting && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-md bg-neutral-50 border border-neutral-200">
              <LogoutIcon className="h-5 w-5 text-foreground-secondary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-body-sm text-foreground">
                  You will be signed out of your account and redirected to the login page.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <LoadingState
            message="Signing out..."
            description="Please wait while we sign you out"
            size="lg"
            variant="primary"
          />
        )}

        {/* Redirecting State */}
        {isRedirecting && (
          <LoadingState
            message="Redirecting..."
            description="Taking you to the login page"
            size="lg"
            variant="success"
          />
        )}

        {/* Action Buttons */}
        {!isLoading && !isRedirecting && (
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleConfirm}
              className="w-full sm:w-auto"
            >
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}

