"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input, Badge, Select } from "@/components/ui";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui";
import {
  getAllOrders,
  updateOrderStatus,
  refundOrder,
  type Order,
  type OrderFilters,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from "@/lib/api/order";
import { LoadingSpinner, Alert } from "@/components/patterns";
import { SearchIcon } from "@/components/svg";

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

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filters, setFilters] = useState<OrderFilters>({
    limit: 50,
    offset: 0,
  });
  const [total, setTotal] = useState(0);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus | "">("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllOrders(filters);
      setOrders(response.orders || []);
      setTotal(response.total || 0);
    } catch (err: unknown) {
      const errorMessage =
        (err instanceof Error ? err.message : undefined) ||
        "Failed to load orders";
      setError(errorMessage);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleStatusFilter = (status: OrderStatus | "all") => {
    if (status === "all") {
      const { status: _, ...rest } = filters;
      setFilters({ ...rest, offset: 0 });
    } else {
      setFilters({ ...filters, status, offset: 0 });
    }
  };

  const handlePaymentStatusFilter = (paymentStatus: PaymentStatus | "all") => {
    if (paymentStatus === "all") {
      const { paymentStatus: _, ...rest } = filters;
      setFilters({ ...rest, offset: 0 });
    } else {
      setFilters({ ...filters, paymentStatus, offset: 0 });
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrderId || !newStatus) return;

    try {
      setError(null);
      setSuccess(null);
      await updateOrderStatus(selectedOrderId, {
        status: newStatus,
        trackingNumber: trackingNumber || undefined,
      });
      setSuccess("Order status updated successfully");
      setShowStatusModal(false);
      setSelectedOrderId(null);
      setNewStatus("");
      setTrackingNumber("");
      loadOrders();
    } catch (err: unknown) {
      const errorMessage =
        (err instanceof Error ? err.message : undefined) ||
        "Failed to update order status";
      setError(errorMessage);
    }
  };

  const handleRefund = async (orderId: string) => {
    if (!confirm("Are you sure you want to refund this order?")) return;

    try {
      setError(null);
      setSuccess(null);
      await refundOrder(orderId, {});
      setSuccess("Order refunded successfully");
      loadOrders();
    } catch (err: unknown) {
      const errorMessage =
        (err instanceof Error ? err.message : undefined) ||
        "Failed to refund order";
      setError(errorMessage);
    }
  };

  const openStatusModal = (orderId: string, currentStatus: OrderStatus) => {
    setSelectedOrderId(orderId);
    setNewStatus(currentStatus);
    setTrackingNumber("");
    setShowStatusModal(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 font-bold text-foreground">Orders</h1>
        <p className="text-body text-foreground-secondary mt-2">
          Manage and track customer orders
        </p>
      </div>

      {error && (
        <Alert variant="error" message={error} />
      )}

      {success && (
        <Alert variant="success" message={success} />
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-neutral-50 rounded-lg">
        <div className="flex-1">
          <label className="block text-body-sm font-medium text-foreground mb-2">
            Status
          </label>
          <Select
            value={filters.status || "all"}
            onChange={(e) =>
              handleStatusFilter(e.target.value as OrderStatus | "all")
            }
            className="w-full"
          >
            <option value="all">All Statuses</option>
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
        <div className="flex-1">
          <label className="block text-body-sm font-medium text-foreground mb-2">
            Payment Status
          </label>
          <Select
            value={filters.paymentStatus || "all"}
            onChange={(e) =>
              handlePaymentStatusFilter(e.target.value as PaymentStatus | "all")
            }
            className="w-full"
          >
            <option value="all">All Payment Statuses</option>
            <option value={PaymentStatus.PENDING}>Pending</option>
            <option value={PaymentStatus.PAID}>Paid</option>
            <option value={PaymentStatus.FAILED}>Failed</option>
            <option value={PaymentStatus.REFUNDED}>Refunded</option>
          </Select>
        </div>
        <div className="flex-1">
          <label className="block text-body-sm font-medium text-foreground mb-2">
            Payment Method
          </label>
          <Select
            value={filters.paymentMethod || "all"}
            onChange={(e) => {
              if (e.target.value === "all") {
                const { paymentMethod: _, ...rest } = filters;
                setFilters({ ...rest, offset: 0 });
              } else {
                setFilters({
                  ...filters,
                  paymentMethod: e.target.value as PaymentMethod,
                  offset: 0,
                });
              }
            }}
            className="w-full"
          >
            <option value="all">All Methods</option>
            <option value={PaymentMethod.CASH}>Cash on Delivery</option>
            <option value={PaymentMethod.CARD}>Credit Card</option>
          </Select>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" variant="primary" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-body text-foreground-secondary">No orders found</p>
        </div>
      ) : (
        <div className="bg-background rounded-lg border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-primary-900 hover:underline font-medium"
                      >
                        {order.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-body-sm font-medium text-foreground">
                          {order.shippingAddress.fullName}
                        </p>
                        <p className="text-body-xs text-foreground-secondary">
                          {order.shippingAddress.email || "No email"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{order.items.length} items</TableCell>
                    <TableCell className="font-semibold">
                      ${order.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Badge
                          variant={
                            order.paymentStatus === PaymentStatus.PAID
                              ? "primary"
                              : order.paymentStatus === PaymentStatus.FAILED
                              ? "error"
                              : "warning"
                          }
                        >
                          {order.paymentStatus}
                        </Badge>
                        <p className="text-body-xs text-foreground-secondary mt-1">
                          {order.paymentMethod === PaymentMethod.CASH
                            ? "Cash"
                            : "Card"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openStatusModal(order.id, order.status)}
                        >
                          Update
                        </Button>
                        {order.status !== OrderStatus.REFUNDED &&
                          order.status !== OrderStatus.CANCELLED && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRefund(order.id)}
                            >
                              Refund
                            </Button>
                          )}
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {total > (filters.limit || 50) && (
        <div className="flex items-center justify-between">
          <p className="text-body-sm text-foreground-secondary">
            Showing {filters.offset || 0 + 1} to{" "}
            {Math.min((filters.offset || 0) + (filters.limit || 50), total)} of{" "}
            {total} orders
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={(filters.offset || 0) === 0}
              onClick={() =>
                setFilters({
                  ...filters,
                  offset: Math.max(0, (filters.offset || 0) - (filters.limit || 50)),
                })
              }
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={(filters.offset || 0) + (filters.limit || 50) >= total}
              onClick={() =>
                setFilters({
                  ...filters,
                  offset: (filters.offset || 0) + (filters.limit || 50),
                })
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-h3 font-bold text-foreground mb-4">
              Update Order Status
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-body-sm font-medium text-foreground mb-2">
                  New Status
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
                  Tracking Number (optional)
                </label>
                <Input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedOrderId(null);
                    setNewStatus("");
                    setTrackingNumber("");
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleUpdateStatus}
                  className="flex-1"
                >
                  Update Status
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
