import { API_BASE_URL, handleApiResponse, apiFetch, ApiError } from './config';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PAID = 'paid',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface OrderAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
  email?: string;
}

export interface OrderItem {
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image?: string;
  attributes?: Array<{ name: string; value: string }>;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  sessionId?: string;
  items: OrderItem[];
  shippingAddress: OrderAddress;
  billingAddress?: OrderAddress;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  notes?: string;
  internalNotes?: string;
  cancelledAt?: string;
  cancelledReason?: string;
  refundedAt?: string;
  refundedAmount?: number;
  shippedAt?: string;
  trackingNumber?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  shippingAddress: OrderAddress;
  billingAddress?: OrderAddress;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface UpdateOrderStatusData {
  status: OrderStatus;
  internalNotes?: string;
  trackingNumber?: string;
  cancelledReason?: string;
}

export interface RefundOrderData {
  amount?: number;
  reason?: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface OrdersListResponse {
  orders: Order[];
  total: number;
}

/**
 * Create order from cart
 */
export async function createOrder(
  data: CreateOrderData,
  sessionId?: string
): Promise<Order> {
  try {
    const url = sessionId
      ? `${API_BASE_URL}/orders?sessionId=${encodeURIComponent(sessionId)}`
      : `${API_BASE_URL}/orders`;

    const response = await apiFetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return await handleApiResponse<Order>(response);
  } catch (error) {
    if (error instanceof Error) {
      throw new ApiError(error.message, 'CREATE_ORDER_ERROR');
    }
    throw error;
  }
}

/**
 * Get order by ID
 */
export async function getOrderById(id: string): Promise<Order> {
  try {
    const response = await apiFetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'GET',
    });

    return await handleApiResponse<Order>(response);
  } catch (error) {
    if (error instanceof Error) {
      throw new ApiError(error.message, 'GET_ORDER_ERROR');
    }
    throw error;
  }
}

/**
 * Get order by order number
 */
export async function getOrderByNumber(orderNumber: string): Promise<Order> {
  try {
    const response = await apiFetch(
      `${API_BASE_URL}/orders/number/${encodeURIComponent(orderNumber)}`,
      {
        method: 'GET',
      }
    );

    return await handleApiResponse<Order>(response);
  } catch (error) {
    if (error instanceof Error) {
      throw new ApiError(error.message, 'GET_ORDER_ERROR');
    }
    throw error;
  }
}

/**
 * Get user's orders
 */
export async function getUserOrders(): Promise<Order[]> {
  try {
    const response = await apiFetch(`${API_BASE_URL}/orders`, {
      method: 'GET',
    });

    return await handleApiResponse<Order[]>(response);
  } catch (error) {
    if (error instanceof Error) {
      throw new ApiError(error.message, 'GET_ORDERS_ERROR');
    }
    throw error;
  }
}

/**
 * Get all orders (admin only)
 */
export async function getAllOrders(filters?: OrderFilters): Promise<OrdersListResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.paymentStatus) queryParams.append('paymentStatus', filters.paymentStatus);
    if (filters?.paymentMethod) queryParams.append('paymentMethod', filters.paymentMethod);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.offset) queryParams.append('offset', filters.offset.toString());

    const url = `${API_BASE_URL}/orders/admin${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await apiFetch(url, {
      method: 'GET',
    });

    return await handleApiResponse<OrdersListResponse>(response);
  } catch (error) {
    if (error instanceof Error) {
      throw new ApiError(error.message, 'GET_ORDERS_ERROR');
    }
    throw error;
  }
}

/**
 * Update order status (admin only)
 */
export async function updateOrderStatus(
  id: string,
  data: UpdateOrderStatusData
): Promise<Order> {
  try {
    const response = await apiFetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    return await handleApiResponse<Order>(response);
  } catch (error) {
    if (error instanceof Error) {
      throw new ApiError(error.message, 'UPDATE_ORDER_ERROR');
    }
    throw error;
  }
}

/**
 * Refund order (admin only)
 */
export async function refundOrder(id: string, data: RefundOrderData): Promise<Order> {
  try {
    const response = await apiFetch(`${API_BASE_URL}/orders/${id}/refund`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return await handleApiResponse<Order>(response);
  } catch (error) {
    if (error instanceof Error) {
      throw new ApiError(error.message, 'REFUND_ORDER_ERROR');
    }
    throw error;
  }
}

