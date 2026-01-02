"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Button,
  Card,
  CardContent,
  Container,
  Section,
  Badge,
} from "@/components/ui";
import { getUserOrders, type Order, OrderStatus } from "@/lib/api/order";
import { LoadingState, EmptyState, Alert } from "@/components/patterns";
import { ShoppingBagIcon } from "@/components/svg";
import { useAuthStore } from "@/store/auth";

const getStatusBadgeVariant = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING:
      return "outline";
    case OrderStatus.CONFIRMED:
    case OrderStatus.PAID:
      return "primary";
    case OrderStatus.PROCESSING:
    case OrderStatus.SHIPPED:
      return "secondary";
    case OrderStatus.DELIVERED:
      return "primary";
    case OrderStatus.CANCELLED:
    case OrderStatus.REFUNDED:
      return "outline";
    default:
      return "outline";
  }
};

const getStatusLabel = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING:
      return "Pending";
    case OrderStatus.CONFIRMED:
      return "Confirmed";
    case OrderStatus.PAID:
      return "Paid";
    case OrderStatus.PROCESSING:
      return "Processing";
    case OrderStatus.SHIPPED:
      return "Shipped";
    case OrderStatus.DELIVERED:
      return "Delivered";
    case OrderStatus.CANCELLED:
      return "Cancelled";
    case OrderStatus.REFUNDED:
      return "Refunded";
    default:
      return status;
  }
};

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    loadOrders();
  }, [isAuthenticated]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getUserOrders();
      setOrders(data);
    } catch (err: unknown) {
      const errorMessage =
        (err instanceof Error ? err.message : undefined) ||
        "Failed to load orders";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <Section className="py-12">
        <Container>
          <LoadingState message="Loading your orders..." />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="py-8 md:py-12">
      <Container>
        <div className="mb-8">
          <h1 className="text-h1 font-bold text-foreground mb-2">My Orders</h1>
          <p className="text-body-md text-foreground-secondary">
            View and track your order history
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <Alert variant="error" message={error} />
          </div>
        )}

        {orders.length === 0 ? (
          <EmptyState
            icon={<ShoppingBagIcon className="h-16 w-16 text-neutral-400" />}
            title="No orders yet"
            description="You haven't placed any orders yet. Start shopping to see your orders here."
            action={
              <Link href="/products">
                <Button variant="primary">Start Shopping</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} variant="elevated">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-200">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-body-lg font-semibold text-foreground">
                            Order {order.orderNumber}
                          </h3>
                          <Badge variant={getStatusBadgeVariant(order.status)}>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </div>
                        <p className="text-body-sm text-foreground-secondary">
                          Placed on{" "}
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-h4 font-bold text-foreground">
                          ${order.total.toFixed(2)}
                        </p>
                        <p className="text-body-xs text-foreground-secondary">
                          {order.items.length} {order.items.length === 1 ? "item" : "items"}
                        </p>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="space-y-3">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex gap-4">
                          {item.image && (
                            <div className="relative w-16 h-16 bg-neutral-100 rounded-md overflow-hidden flex-shrink-0">
                              <Image
                                src={item.image}
                                alt={item.productName}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-body-sm font-medium text-foreground">
                              {item.productName}
                              {item.variantName && ` - ${item.variantName}`}
                            </p>
                            <p className="text-body-xs text-foreground-secondary">
                              Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-body-sm font-semibold text-foreground">
                              ${item.totalPrice.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-body-sm text-foreground-secondary">
                          +{order.items.length - 3} more item{order.items.length - 3 === 1 ? "" : "s"}
                        </p>
                      )}
                    </div>

                    {/* Order Actions */}
                    <div className="pt-4 border-t border-neutral-200 flex gap-3">
                      <Link href={`/orders/${order.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      </Link>
                      {order.trackingNumber && (
                        <div className="flex-1">
                          <p className="text-body-xs text-foreground-secondary mb-1">
                            Tracking Number
                          </p>
                          <p className="text-body-sm font-medium text-foreground">
                            {order.trackingNumber}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}

