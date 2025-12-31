'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuthStore } from '@/store/auth';

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');
  const isAdminPage = pathname?.startsWith('/admin');
  const { initialize } = useAuthStore();

  // Initialize auth store on app load
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <>
      {!isAuthPage && !isAdminPage && <Navbar />}
      {children}
      {!isAuthPage && !isAdminPage && <Footer />}
    </>
  );
}

