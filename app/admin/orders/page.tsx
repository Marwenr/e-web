import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 font-bold text-foreground">Orders</h1>
        <p className="text-body text-foreground-secondary mt-2">
          Manage and track customer orders
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-body-sm text-foreground-secondary">
            Order management interface will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

