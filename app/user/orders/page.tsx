"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
} from "@/components/ui";
import { getUserOrders, type Order, OrderStatus } from "@/lib/api/order";
import { LoadingSpinner, EmptyState, Alert } from "@/components/patterns";
import { ShoppingBagIcon } from "@/components/svg";

const getStatusBadgeVariant = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING:
      return "neutral";
    case OrderStatus.CONFIRMED:
    case OrderStatus.PAID:
      return "primary";
    case OrderStatus.PROCESSING:
    case OrderStatus.SHIPPED:
      return "secondary";
    case OrderStatus.DELIVERED:
      return "success";
    case OrderStatus.CANCELLED:
    case OrderStatus.REFUNDED:
      return "error";
    default:
      return "neutral";
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

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

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

  return (
    <div className="space-y-6">
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>
            Your recent orders will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" variant="primary" />
            </div>
          ) : error ? (
            <div className="py-12">
              <Alert variant="error" message={error} />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-body text-foreground-secondary">
                No orders yet
              </p>
              <p className="text-body-sm text-foreground-tertiary mt-2">
                When you place an order, it will appear here
              </p>
              <Link href="/products" className="mt-4">
                <Button variant="primary">Start Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 border border-neutral-200 rounded-lg hover:border-primary-300 transition-colors"
                >
                  <div className="space-y-4">
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-200">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <Link
                            href={`/orders/${order.id}`}
                            className="text-body-lg font-semibold text-foreground hover:text-primary-900 transition-colors"
                          >
                            Order {order.orderNumber}
                          </Link>
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
