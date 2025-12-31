'use client';

import React, { useState } from 'react';
import { AdminGuard } from '@/components/admin';
import { AdminSidebar, AdminSidebarToggle } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminGuard>
      <div className="flex h-screen overflow-hidden bg-background-secondary">
        {/* Sidebar */}
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <AdminHeader />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 lg:p-6">
              {children}
            </div>
          </main>
        </div>

        {/* Sidebar toggle button (mobile) */}
        <div className="fixed bottom-4 right-4 z-40 lg:hidden">
          <AdminSidebarToggle onToggle={() => setSidebarOpen(!sidebarOpen)} />
        </div>
      </div>
    </AdminGuard>
  );
}

