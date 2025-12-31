"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui";
import { ButtonLoading } from "@/components/patterns";
import { useCartStore } from "@/store/cart";
import { Alert } from "@/components/patterns";

export interface AddToCartButtonProps {
  productId: string;
  variantId?: string;
  variantRequired?: boolean;
  quantity?: number;
  disabled?: boolean;
  className?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function AddToCartButton({
  productId,
  variantId,
  variantRequired = false,
  quantity = 1,
  disabled = false,
  className = "",
  onSuccess,
  onError,
}: AddToCartButtonProps) {
  const [localQuantity, setLocalQuantity] = useState(quantity);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCartStore();

  const handleAddToCart = async () => {
    if (disabled || isAdding) return;

    // Check if variant is required but not selected
    if (variantId === undefined && variantRequired) {
      setError("Please select a variant before adding to cart");
      return;
    }

    setIsAdding(true);
    setError(null);

    try {
      await addToCart(productId, variantId, localQuantity);
      onSuccess?.();
    } catch (err: any) {
      const errorMessage = err.message || "Failed to add item to cart";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsAdding(false);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > 100) return; // Reasonable max
    setLocalQuantity(newQuantity);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <label htmlFor="quantity" className="text-body-sm font-medium text-foreground">
          Quantity:
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleQuantityChange(localQuantity - 1)}
            disabled={localQuantity <= 1 || disabled || isAdding}
            className="flex items-center justify-center w-10 h-10 border-2 border-neutral-300 rounded-md text-foreground hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <input
            id="quantity"
            type="number"
            min="1"
            max="100"
            value={localQuantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
            disabled={disabled || isAdding}
            className="w-16 h-10 text-center border-2 border-neutral-300 rounded-md text-body font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={() => handleQuantityChange(localQuantity + 1)}
            disabled={localQuantity >= 100 || disabled || isAdding}
            className="flex items-center justify-center w-10 h-10 border-2 border-neutral-300 rounded-md text-foreground hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="error" message={error} />
      )}

      {/* Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        disabled={disabled || isAdding || (variantRequired && !variantId)}
        size="lg"
        className="w-full"
      >
        {isAdding ? (
          <ButtonLoading loadingText="Adding...">Add to Cart</ButtonLoading>
        ) : (
          "Add to Cart"
        )}
      </Button>
    </div>
  );
}

