import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h2 font-bold text-foreground">Orders</h1>
        <p className="text-body text-foreground-secondary mt-2">
          View your order history and track shipments
        </p>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>
            Your recent orders will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-body text-foreground-secondary">
              No orders yet
            </p>
            <p className="text-body-sm text-foreground-tertiary mt-2">
              When you place an order, it will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

