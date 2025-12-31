'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Container, Section } from '@/components/ui';
import { UserIcon, LockIcon, ShoppingBagIcon, MapPinIcon, LogoutIcon, MenuIcon, XIcon } from '@/components/svg';
import { LogoutModal } from '@/components/auth';

export interface AccountNavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export interface AccountLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const accountNavItems: AccountNavItem[] = [
  {
    href: '/user/settings',
    label: 'Profile Settings',
    icon: <UserIcon className="h-5 w-5" />,
  },
  {
    href: '/user/security',
    label: 'Security',
    icon: <LockIcon className="h-5 w-5" />,
  },
  {
    href: '/user/orders',
    label: 'Orders',
    icon: <ShoppingBagIcon className="h-5 w-5" />,
  },
  {
    href: '/user/addresses',
    label: 'Addresses',
    icon: <MapPinIcon className="h-5 w-5" />,
  },
];

export default function AccountLayout({
  children,
  title,
  description,
}: AccountLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/');
  };

  return (
    <Section>
      <Container size="lg">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              type="button"
              onClick={toggleDrawer}
              className="flex items-center gap-2 px-4 py-2 text-body font-medium text-foreground hover:bg-neutral-100 rounded-md transition-colors"
              aria-label="Open account menu"
              aria-expanded={isDrawerOpen}
            >
              <MenuIcon className="h-5 w-5" />
              <span>Account Menu</span>
            </button>
          </div>

          {/* Mobile Drawer Overlay */}
          {isDrawerOpen && (
            <div
              className="fixed inset-0 bg-neutral-900 bg-opacity-50 z-40 lg:hidden"
              onClick={closeDrawer}
              aria-hidden="true"
            />
          )}

          {/* Sidebar Navigation */}
          <aside
            className={`
              fixed lg:static
              top-0 left-0
              h-full lg:h-auto
              w-64 lg:w-56
              bg-background lg:bg-transparent
              border-r border-neutral-200 lg:border-0
              z-50 lg:z-auto
              transform transition-transform duration-300 ease-in-out
              ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}
          >
            <div className="p-4 lg:p-0">
              {/* Mobile Drawer Header */}
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <h2 className="text-h4 font-bold text-foreground">Account</h2>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="p-2 text-foreground-secondary hover:text-foreground hover:bg-neutral-100 rounded-md transition-colors"
                  aria-label="Close menu"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-1">
                {accountNavItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeDrawer}
                      className={`
                        flex items-center gap-3
                        px-4 py-3
                        text-body
                        rounded-md
                        transition-colors
                        ${
                          active
                            ? 'bg-primary-50 text-primary-900 font-medium'
                            : 'text-foreground-secondary hover:bg-neutral-100 hover:text-foreground'
                        }
                      `}
                      aria-current={active ? 'page' : undefined}
                    >
                      <span className={active ? 'text-primary-900' : 'text-foreground-tertiary'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <span className="ml-auto px-2 py-0.5 text-label font-medium bg-primary-900 text-white rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}

                {/* Logout Separator */}
                <div className="my-4 border-t border-neutral-200" />

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogoutModalOpen(true);
                    closeDrawer();
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-body text-error-600 hover:bg-error-50 rounded-md transition-colors w-full text-left"
                >
                  <LogoutIcon className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {/* Page Title / Breadcrumb */}
            {(title || description) && (
              <div className="mb-6">
                {title && (
                  <h1 className="text-h2 font-bold text-foreground mb-2">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="text-body text-foreground-secondary">
                    {description}
                  </p>
                )}
              </div>
            )}

            {/* Page Content */}
            {children}
          </main>
        </div>
      </Container>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          setIsLogoutModalOpen(false);
        }}
      />
    </Section>
  );
}

