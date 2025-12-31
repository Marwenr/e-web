import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 font-bold text-foreground">Dashboard</h1>
        <p className="text-body text-foreground-secondary mt-2">
          Welcome to the admin dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-body-lg">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-h2 font-bold text-foreground">0</div>
            <p className="text-body-sm text-foreground-secondary mt-1">Active products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-body-lg">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-h2 font-bold text-foreground">0</div>
            <p className="text-body-sm text-foreground-secondary mt-1">All time orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-body-lg">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-h2 font-bold text-warning-600">0</div>
            <p className="text-body-sm text-foreground-secondary mt-1">Items need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-body-lg">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-h2 font-bold text-foreground">$0</div>
            <p className="text-body-sm text-foreground-secondary mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-body-sm text-foreground-secondary">
            No recent activity to display.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

