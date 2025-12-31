import { API_BASE_URL, apiFetch, handleApiResponse, ApiError } from "./config";

export interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  addedAt: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    images: Array<{ url: string; alt?: string; isPrimary?: boolean }>;
    basePrice: number;
    discountPrice?: number;
    status: string;
  };
  variant?: {
    id: string;
    sku: string;
    name?: string;
    basePrice: number;
    discountPrice?: number;
    stock: number;
    attributes: Array<{ name: string; value: string }>;
  };
}

export interface CartDetails {
  id: string;
  userId?: string;
  sessionId?: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartInput {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface UpdateCartItemInput {
  itemIndex: number;
  quantity: number;
}

export interface RemoveCartItemInput {
  itemIndex: number;
}

/**
 * Get cart
 */
export async function getCart(sessionId?: string): Promise<CartDetails | null> {
  try {
    const url = new URL(`${API_BASE_URL}/cart`);
    if (sessionId) {
      url.searchParams.append("sessionId", sessionId);
    }

    const response = await apiFetch(url.toString(), {
      method: "GET",
      credentials: "include",
    });

    const data = await handleApiResponse<{ cart: CartDetails | null }>(response);
    return data.cart;
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Add item to cart
 */
export async function addToCart(
  input: AddToCartInput,
  sessionId?: string
): Promise<CartDetails> {
  try {
    const url = new URL(`${API_BASE_URL}/cart/add`);
    if (sessionId) {
      url.searchParams.append("sessionId", sessionId);
    }

    const response = await apiFetch(url.toString(), {
      method: "POST",
      body: JSON.stringify(input),
      credentials: "include",
    });

    const data = await handleApiResponse<{ cart: CartDetails }>(response);
    return data.cart;
  } catch (error) {
    throw error;
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(
  input: UpdateCartItemInput,
  sessionId?: string
): Promise<CartDetails> {
  try {
    const url = new URL(`${API_BASE_URL}/cart/update`);
    if (sessionId) {
      url.searchParams.append("sessionId", sessionId);
    }

    const response = await apiFetch(url.toString(), {
      method: "PUT",
      body: JSON.stringify(input),
      credentials: "include",
    });

    const data = await handleApiResponse<{ cart: CartDetails }>(response);
    return data.cart;
  } catch (error) {
    throw error;
  }
}

/**
 * Remove item from cart
 */
export async function removeCartItem(
  input: RemoveCartItemInput,
  sessionId?: string
): Promise<CartDetails> {
  try {
    const url = new URL(`${API_BASE_URL}/cart/remove`);
    url.searchParams.append("itemIndex", input.itemIndex.toString());
    if (sessionId) {
      url.searchParams.append("sessionId", sessionId);
    }

    const response = await apiFetch(url.toString(), {
      method: "DELETE",
      credentials: "include",
    });

    const data = await handleApiResponse<{ cart: CartDetails }>(response);
    return data.cart;
  } catch (error) {
    throw error;
  }
}

/**
 * Clear cart
 */
export async function clearCart(sessionId?: string): Promise<void> {
  try {
    const url = new URL(`${API_BASE_URL}/cart/clear`);
    if (sessionId) {
      url.searchParams.append("sessionId", sessionId);
    }

    const response = await apiFetch(url.toString(), {
      method: "DELETE",
      credentials: "include",
    });

    await handleApiResponse(response);
  } catch (error) {
    throw error;
  }
}

/**
 * Merge guest cart into user cart
 */
export async function mergeCart(sessionId: string): Promise<CartDetails> {
  try {
    const response = await apiFetch(`${API_BASE_URL}/cart/merge`, {
      method: "POST",
      body: JSON.stringify({ sessionId }),
      credentials: "include",
    });

    const data = await handleApiResponse<{ cart: CartDetails }>(response);
    return data.cart;
  } catch (error) {
    throw error;
  }
}

/**
 * Recalculate cart (validate stock, update prices)
 */
export async function recalculateCart(sessionId?: string): Promise<CartDetails> {
  try {
    const url = new URL(`${API_BASE_URL}/cart/recalculate`);
    if (sessionId) {
      url.searchParams.append("sessionId", sessionId);
    }

    const response = await apiFetch(url.toString(), {
      method: "POST",
      credentials: "include",
    });

    const data = await handleApiResponse<{ cart: CartDetails }>(response);
    return data.cart;
  } catch (error) {
    throw error;
  }
}

/**
 * Generate or get session ID for guest cart
 */
export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  const STORAGE_KEY = "cart_session_id";
  let sessionId = localStorage.getItem(STORAGE_KEY);

  if (!sessionId) {
    // Generate a unique session ID
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(STORAGE_KEY, sessionId);
  }

  return sessionId;
}

