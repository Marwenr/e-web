"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Container,
  Section,
  Badge,
} from "@/components/ui";
import { getOrderById, type Order, OrderStatus, PaymentMethod } from "@/lib/api/order";
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

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (orderId) {
      loadOrder();
    }
  }, [orderId, isAuthenticated]);

  const loadOrder = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getOrderById(orderId);
      setOrder(data);
    } catch (err: unknown) {
      const errorMessage =
        (err instanceof Error ? err.message : undefined) ||
        "Failed to load order";
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
          <LoadingState message="Loading order details..." />
        </Container>
      </Section>
    );
  }

  if (error || !order) {
    return (
      <Section className="py-12">
        <Container>
          <EmptyState
            icon={<ShoppingBagIcon className="h-16 w-16 text-neutral-400" />}
            title="Order not found"
            description={error || "The order you're looking for doesn't exist"}
            action={
              <Link href="/orders">
                <Button variant="primary">Back to Orders</Button>
              </Link>
            }
          />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="py-8 md:py-12">
      <Container>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/orders">
                <Button variant="outline" size="sm">
                  ← Back to Orders
                </Button>
              </Link>
              <h1 className="text-h1 font-bold text-foreground mt-4">
                Order {order.orderNumber}
              </h1>
            </div>
            <Badge variant={getStatusBadgeVariant(order.status)}>
              {getStatusLabel(order.status)}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Info */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-body-sm text-foreground-secondary">Order Date</p>
                  <p className="text-body-md text-foreground">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-body-sm text-foreground-secondary">Payment Method</p>
                  <p className="text-body-md text-foreground capitalize">
                    {order.paymentMethod === PaymentMethod.CASH
                      ? "Cash on Delivery"
                      : "Credit Card"}
                  </p>
                </div>
                {order.trackingNumber && (
                  <div>
                    <p className="text-body-sm text-foreground-secondary">Tracking Number</p>
                    <p className="text-body-md font-medium text-foreground">
                      {order.trackingNumber}
                    </p>
                  </div>
                )}
                {order.shippedAt && (
                  <div>
                    <p className="text-body-sm text-foreground-secondary">Shipped At</p>
                    <p className="text-body-md text-foreground">
                      {new Date(order.shippedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {order.deliveredAt && (
                  <div>
                    <p className="text-body-sm text-foreground-secondary">Delivered At</p>
                    <p className="text-body-md text-foreground">
                      {new Date(order.deliveredAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-body-sm text-foreground">
                  <p className="font-semibold">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && (
                    <p>{order.shippingAddress.addressLine2}</p>
                  )}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingAddress.phoneNumber && (
                    <p className="mt-2">Phone: {order.shippingAddress.phoneNumber}</p>
                  )}
                  {order.shippingAddress.email && (
                    <p>Email: {order.shippingAddress.email}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Items */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 pb-4 border-b border-neutral-200 last:border-b-0 last:pb-0"
                  >
                    {item.image && (
                      <div className="relative w-20 h-20 bg-neutral-100 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-body-md font-semibold text-foreground">
                        {item.productName}
                        {item.variantName && ` - ${item.variantName}`}
                      </h3>
                      {item.attributes && item.attributes.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {item.attributes.map((attr, attrIndex) => (
                            <span
                              key={attrIndex}
                              className="inline-block text-body-xs text-foreground-secondary mr-2"
                            >
                              {attr.name}: {attr.value}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-body-sm text-foreground-secondary">
                          Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}
                        </span>
                        <span className="text-body-md font-semibold text-foreground">
                          ${item.totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-body-md text-foreground-secondary">Subtotal</span>
                  <span className="text-body-md font-medium text-foreground">
                    ${order.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-body-md text-foreground-secondary">Tax</span>
                  <span className="text-body-md font-medium text-foreground">
                    ${order.tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-body-md text-foreground-secondary">Shipping</span>
                  <span className="text-body-md font-medium text-foreground">
                    {order.shipping === 0 ? "Free" : `$${order.shipping.toFixed(2)}`}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-body-md text-foreground-secondary">Discount</span>
                    <span className="text-body-md font-medium text-error-500">
                      -${order.discount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="pt-4 border-t border-neutral-200">
                  <div className="flex items-center justify-between">
                    <span className="text-h4 font-bold text-foreground">Total</span>
                    <span className="text-h4 font-bold text-foreground">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Link href="/orders" className="flex-1">
              <Button variant="outline" size="lg" className="w-full">
                Back to Orders
              </Button>
            </Link>
            <Link href="/products" className="flex-1">
              <Button variant="primary" size="lg" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  );
}

