'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { XIcon, MenuIcon } from '@/components/svg';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Products', href: '/admin/products' },
  { label: 'Categories', href: '/admin/categories' },
  { label: 'Inventory', href: '/admin/inventory' },
  { label: 'Orders', href: '/admin/orders' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Settings', href: '/admin/settings' },
];

export const AdminSidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900 bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-background border-r border-neutral-200 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
            <Link href="/admin" className="text-h3 font-bold text-primary-900">
              Admin
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-foreground-secondary hover:text-foreground hover:bg-neutral-100 rounded-md transition-colors"
              aria-label="Close sidebar"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center px-4 py-3 text-body-sm font-medium rounded-md transition-colors
                    ${
                      isActive
                        ? 'bg-primary-50 text-primary-900'
                        : 'text-foreground-secondary hover:bg-neutral-100 hover:text-foreground'
                    }
                  `}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-neutral-200">
            <Link
              href="/"
              className="flex items-center px-4 py-2 text-body-sm text-foreground-secondary hover:text-foreground hover:bg-neutral-100 rounded-md transition-colors"
            >
              ← Back to Shop
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export const AdminSidebarToggle: React.FC<{ onToggle: () => void }> = ({ onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="lg:hidden p-2 text-foreground-secondary hover:text-foreground hover:bg-neutral-100 rounded-md transition-colors"
      aria-label="Toggle sidebar"
    >
      <MenuIcon className="h-6 w-6" />
    </button>
  );
};

