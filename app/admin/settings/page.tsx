import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 font-bold text-foreground">Settings</h1>
        <p className="text-body text-foreground-secondary mt-2">
          Configure admin settings and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-body-sm text-foreground-secondary">
            Settings interface will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

