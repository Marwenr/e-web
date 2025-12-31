'use client';

import React, { useEffect } from 'react';
import { XIcon } from '../svg';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  side = 'right',
  size = 'md',
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'w-full sm:w-80',
    md: 'w-full sm:w-96',
    lg: 'w-full sm:w-[32rem]',
    xl: 'w-full sm:w-[40rem]',
  };

  const sideStyles = {
    left: 'left-0',
    right: 'right-0',
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'drawer-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900 bg-opacity-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Content */}
      <div
        className={`
          fixed top-0 ${sideStyles[side]} h-full
          ${sizeStyles[size]}
          bg-background
          shadow-2xl
          transform
          transition-transform
          duration-300
          ease-in-out
          flex flex-col
        `}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
            <h2
              id="drawer-title"
              className="text-h4 font-semibold text-foreground"
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-foreground-secondary hover:text-foreground hover:bg-neutral-100 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              aria-label="Close drawer"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Drawer;

