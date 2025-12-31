"use client";

import { create } from "zustand";
import type { CartDetails, CartItem } from "@/lib/api/cart";
import * as cartApi from "@/lib/api/cart";
import { getOrCreateSessionId } from "@/lib/api/cart";

interface CartState {
  cart: CartDetails | null;
  isLoading: boolean;
  error: string | null;
  sessionId: string | null;
  setCart: (cart: CartDetails | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initialize: () => Promise<void>;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, variantId: string | undefined, quantity: number) => Promise<void>;
  updateQuantity: (itemIndex: number, quantity: number) => Promise<void>;
  removeItem: (itemIndex: number) => Promise<void>;
  clearCart: () => Promise<void>;
  mergeCart: (sessionId: string) => Promise<void>;
  recalculateCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,
  error: null,
  sessionId: null,

  setCart: (cart) => set({ cart, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  initialize: async () => {
    if (typeof window === "undefined") return;

    // Check if user is authenticated
    const { useAuthStore } = await import("@/store/auth");
    const isAuthenticated = useAuthStore.getState().isAuthenticated;

    if (isAuthenticated) {
      // For authenticated users, fetch cart without sessionId
      set({ sessionId: null });
    } else {
      // For guests, create/get sessionId
      const sessionId = getOrCreateSessionId();
      set({ sessionId });
    }

    // Try to fetch cart
    try {
      await get().fetchCart();
    } catch (error) {
      // Silently fail on initialization
      console.error("Failed to initialize cart:", error);
    }
  },

  fetchCart: async () => {
    const state = get();
    set({ isLoading: true, error: null });

    try {
      // Check if user is authenticated
      const { useAuthStore } = await import("@/store/auth");
      const isAuthenticated = useAuthStore.getState().isAuthenticated;

      // For authenticated users, don't pass sessionId (backend uses userId from token)
      // For guests, use sessionId
      const sessionId = isAuthenticated ? undefined : (state.sessionId || getOrCreateSessionId());
      const cart = await cartApi.getCart(sessionId);

      set({ cart, isLoading: false, error: null, sessionId: sessionId || null });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch cart",
        isLoading: false,
      });
    }
  },

  addToCart: async (productId: string, variantId: string | undefined, quantity: number) => {
    const state = get();
    set({ isLoading: true, error: null });

    try {
      // Check if user is authenticated
      const { useAuthStore } = await import("@/store/auth");
      const isAuthenticated = useAuthStore.getState().isAuthenticated;

      // For authenticated users, don't pass sessionId (backend uses userId from token)
      // For guests, use sessionId
      const sessionId = isAuthenticated ? undefined : (state.sessionId || getOrCreateSessionId());
      const cart = await cartApi.addToCart(
        { productId, variantId, quantity },
        sessionId
      );

      set({ cart, isLoading: false, error: null, sessionId: sessionId || null });
    } catch (error: any) {
      set({
        error: error.message || "Failed to add item to cart",
        isLoading: false,
      });
      throw error;
    }
  },

  updateQuantity: async (itemIndex: number, quantity: number) => {
    const state = get();
    set({ isLoading: true, error: null });

    try {
      // Check if user is authenticated
      const { useAuthStore } = await import("@/store/auth");
      const isAuthenticated = useAuthStore.getState().isAuthenticated;

      // For authenticated users, don't pass sessionId (backend uses userId from token)
      // For guests, use sessionId
      const sessionId = isAuthenticated ? undefined : (state.sessionId || getOrCreateSessionId());
      const cart = await cartApi.updateCartItem(
        { itemIndex, quantity },
        sessionId
      );

      set({ cart, isLoading: false, error: null });
    } catch (error: any) {
      set({
        error: error.message || "Failed to update cart item",
        isLoading: false,
      });
      throw error;
    }
  },

  removeItem: async (itemIndex: number) => {
    const state = get();
    set({ isLoading: true, error: null });

    try {
      // Check if user is authenticated
      const { useAuthStore } = await import("@/store/auth");
      const isAuthenticated = useAuthStore.getState().isAuthenticated;

      // For authenticated users, don't pass sessionId (backend uses userId from token)
      // For guests, use sessionId
      const sessionId = isAuthenticated ? undefined : (state.sessionId || getOrCreateSessionId());
      const cart = await cartApi.removeCartItem(
        { itemIndex },
        sessionId
      );

      set({ cart, isLoading: false, error: null });
    } catch (error: any) {
      set({
        error: error.message || "Failed to remove item from cart",
        isLoading: false,
      });
      throw error;
    }
  },

  clearCart: async () => {
    const state = get();
    set({ isLoading: true, error: null });

    try {
      // Check if user is authenticated
      const { useAuthStore } = await import("@/store/auth");
      const isAuthenticated = useAuthStore.getState().isAuthenticated;

      // For authenticated users, don't pass sessionId (backend uses userId from token)
      // For guests, use sessionId
      const sessionId = isAuthenticated ? undefined : (state.sessionId || getOrCreateSessionId());
      await cartApi.clearCart(sessionId);

      set({ cart: null, isLoading: false, error: null });
    } catch (error: any) {
      set({
        error: error.message || "Failed to clear cart",
        isLoading: false,
      });
      throw error;
    }
  },

  mergeCart: async (sessionId: string) => {
    const state = get();
    set({ isLoading: true, error: null });

    try {
      const cart = await cartApi.mergeCart(sessionId);
      set({ cart, isLoading: false, error: null, sessionId: null });
    } catch (error: any) {
      set({
        error: error.message || "Failed to merge cart",
        isLoading: false,
      });
      throw error;
    }
  },

  recalculateCart: async () => {
    const state = get();
    set({ isLoading: true, error: null });

    try {
      // Check if user is authenticated
      const { useAuthStore } = await import("@/store/auth");
      const isAuthenticated = useAuthStore.getState().isAuthenticated;

      // For authenticated users, don't pass sessionId (backend uses userId from token)
      // For guests, use sessionId
      const sessionId = isAuthenticated ? undefined : (state.sessionId || getOrCreateSessionId());
      const cart = await cartApi.recalculateCart(sessionId);

      set({ cart, isLoading: false, error: null });
    } catch (error: any) {
      set({
        error: error.message || "Failed to recalculate cart",
        isLoading: false,
      });
      throw error;
    }
  },
}));

