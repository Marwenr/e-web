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
  Badge,
  Input,
  Select,
} from "@/components/ui";
import {
  getOrderById,
  updateOrderStatus,
  refundOrder,
  type Order,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from "@/lib/api/order";
import { LoadingState, EmptyState, Alert } from "@/components/patterns";
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
      return "primary";
    case OrderStatus.CANCELLED:
    case OrderStatus.REFUNDED:
      return "neutral";
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

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus | "">("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getOrderById(orderId);
      setOrder(data);
      setNewStatus(data.status);
      setTrackingNumber(data.trackingNumber || "");
      setInternalNotes(data.internalNotes || "");
    } catch (err: unknown) {
      const errorMessage =
        (err instanceof Error ? err.message : undefined) ||
        "Failed to load order";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!order || !newStatus) return;

    try {
      setError(null);
      setSuccess(null);
      await updateOrderStatus(order.id, {
        status: newStatus,
        trackingNumber: trackingNumber || undefined,
        internalNotes: internalNotes || undefined,
      });
      setSuccess("Order status updated successfully");
      loadOrder();
    } catch (err: unknown) {
      const errorMessage =
        (err instanceof Error ? err.message : undefined) ||
        "Failed to update order status";
      setError(errorMessage);
    }
  };

  const handleRefund = async () => {
    if (!order) return;
    if (!confirm("Are you sure you want to refund this order?")) return;

    try {
      setError(null);
      setSuccess(null);
      await refundOrder(order.id, {});
      setSuccess("Order refunded successfully");
      loadOrder();
    } catch (err: unknown) {
      const errorMessage =
        (err instanceof Error ? err.message : undefined) ||
        "Failed to refund order";
      setError(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingState message="Loading order details..." />
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="space-y-6">
        <EmptyState
          icon={<ShoppingBagIcon className="h-16 w-16 text-neutral-400" />}
          title="Order not found"
          description={error}
          action={
            <Link href="/admin/orders">
              <Button variant="primary">Back to Orders</Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/orders">
            <Button variant="outline" size="sm">
              ← Back to Orders
            </Button>
          </Link>
          <h1 className="text-h1 font-bold text-foreground mt-4">
            Order {order.orderNumber}
          </h1>
        </div>
        <div className="flex gap-2">
          <Badge variant={getStatusBadgeVariant(order.status)}>
            {getStatusLabel(order.status)}
          </Badge>
          <Badge
            variant={
              order.paymentStatus === PaymentStatus.PAID ? "primary" : "neutral"
            }
          >
            {order.paymentStatus}
          </Badge>
        </div>
      </div>

      {error && <Alert variant="error" message={error} />}
      {success && <Alert variant="success" message={success} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
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
                      <p className="text-body-xs text-foreground-secondary mt-1">
                        SKU: {item.sku}
                      </p>
                      {item.attributes && item.attributes.length > 0 && (
                        <div className="mt-2 space-y-1">
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

          {/* Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-body-sm text-foreground">
                  <p className="font-semibold">
                    {order.shippingAddress.fullName}
                  </p>
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
                    <p className="mt-2">
                      Phone: {order.shippingAddress.phoneNumber}
                    </p>
                  )}
                  {order.shippingAddress.email && (
                    <p>Email: {order.shippingAddress.email}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {order.billingAddress && (
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Billing Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-body-sm text-foreground">
                    <p className="font-semibold">
                      {order.billingAddress.fullName}
                    </p>
                    <p>{order.billingAddress.addressLine1}</p>
                    {order.billingAddress.addressLine2 && (
                      <p>{order.billingAddress.addressLine2}</p>
                    )}
                    <p>
                      {order.billingAddress.city}, {order.billingAddress.state}{" "}
                      {order.billingAddress.postalCode}
                    </p>
                    <p>{order.billingAddress.country}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-body-md text-foreground-secondary">
                  Subtotal
                </span>
                <span className="text-body-md font-medium text-foreground">
                  ${order.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-md text-foreground-secondary">
                  Tax
                </span>
                <span className="text-body-md font-medium text-foreground">
                  ${order.tax.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-md text-foreground-secondary">
                  Shipping
                </span>
                <span className="text-body-md font-medium text-foreground">
                  {order.shipping === 0
                    ? "Free"
                    : `$${order.shipping.toFixed(2)}`}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-body-md text-foreground-secondary">
                    Discount
                  </span>
                  <span className="text-body-md font-medium text-error-500">
                    -${order.discount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="pt-4 border-t border-neutral-200">
                <div className="flex items-center justify-between">
                  <span className="text-h4 font-bold text-foreground">
                    Total
                  </span>
                  <span className="text-h4 font-bold text-foreground">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Info */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-body-sm text-foreground-secondary">
                  Order Date
                </p>
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
                <p className="text-body-sm text-foreground-secondary">
                  Payment Method
                </p>
                <p className="text-body-md text-foreground capitalize">
                  {order.paymentMethod === PaymentMethod.CASH
                    ? "Cash on Delivery"
                    : "Credit Card"}
                </p>
              </div>
              {order.trackingNumber && (
                <div>
                  <p className="text-body-sm text-foreground-secondary">
                    Tracking Number
                  </p>
                  <p className="text-body-md font-medium text-foreground">
                    {order.trackingNumber}
                  </p>
                </div>
              )}
              {order.shippedAt && (
                <div>
                  <p className="text-body-sm text-foreground-secondary">
                    Shipped At
                  </p>
                  <p className="text-body-md text-foreground">
                    {new Date(order.shippedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
              {order.deliveredAt && (
                <div>
                  <p className="text-body-sm text-foreground-secondary">
                    Delivered At
                  </p>
                  <p className="text-body-md text-foreground">
                    {new Date(order.deliveredAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Update Status */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Update Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-2">
                  Status
                </label>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full"
                >
                  <option value={OrderStatus.PENDING}>Pending</option>
                  <option value={OrderStatus.CONFIRMED}>Confirmed</option>
                  <option value={OrderStatus.PAID}>Paid</option>
                  <option value={OrderStatus.PROCESSING}>Processing</option>
                  <option value={OrderStatus.SHIPPED}>Shipped</option>
                  <option value={OrderStatus.DELIVERED}>Delivered</option>
                  <option value={OrderStatus.CANCELLED}>Cancelled</option>
                  <option value={OrderStatus.REFUNDED}>Refunded</option>
                </Select>
              </div>
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-2">
                  Tracking Number
                </label>
                <Input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                />
              </div>
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-2">
                  Internal Notes
                </label>
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  className="w-full h-24 px-3 py-2 border border-neutral-300 rounded-md text-body-sm"
                  placeholder="Add internal notes..."
                />
              </div>
              <Button
                variant="primary"
                onClick={handleUpdateStatus}
                className="w-full"
              >
                Update Status
              </Button>
              {order.status !== OrderStatus.REFUNDED &&
                order.status !== OrderStatus.CANCELLED && (
                  <Button
                    variant="outline"
                    onClick={handleRefund}
                    className="w-full"
                  >
                    Process Refund
                  </Button>
                )}
            </CardContent>
          </Card>

          {/* Customer Notes */}
          {order.notes && (
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Customer Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-body-sm text-foreground">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
