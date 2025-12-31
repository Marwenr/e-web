import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 font-bold text-foreground">Users</h1>
        <p className="text-body text-foreground-secondary mt-2">
          View and manage user accounts (read-only)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-body-sm text-foreground-secondary">
            User management interface will be implemented here. This is a read-only view.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

