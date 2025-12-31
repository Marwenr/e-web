"use client";

import React, { useState, useEffect } from "react";
import { getProductVariants, ProductVariant } from "@/lib/api/product";
import VariantSelector from "./VariantSelector";
import { AddToCartButton } from "@/components/cart";
import { LoadingSpinner } from "@/components/patterns";

interface ProductAddToCartProps {
  productId: string;
  className?: string;
}

export default function ProductAddToCart({
  productId,
  className = "",
}: ProductAddToCartProps) {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVariants = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const productVariants = await getProductVariants(productId);
        setVariants(productVariants);

        // Auto-select default variant if available
        if (productVariants.length > 0) {
          const defaultVariant = productVariants.find((v) => v.isDefault);
          if (defaultVariant) {
            setSelectedVariantId(defaultVariant.id);
          } else {
            setSelectedVariantId(productVariants[0].id);
          }
        }
      } catch (err: any) {
        console.error("Failed to load variants:", err);
        setError(err.message || "Failed to load product variants");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVariants();
  }, [productId]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-4 ${className}`}>
        <LoadingSpinner size="md" variant="primary" />
      </div>
    );
  }

  // If product has variants, show variant selector
  if (variants.length > 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        <VariantSelector
          variants={variants}
          selectedVariantId={selectedVariantId}
          onVariantChange={setSelectedVariantId}
        />
        <div className="pt-4 border-t border-neutral-200">
          <AddToCartButton
            productId={productId}
            variantId={selectedVariantId}
            variantRequired={true}
            className="w-full sm:w-auto"
          />
        </div>
      </div>
    );
  }

  // If no variants, show error or just the add to cart button
  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="p-4 bg-error-50 border border-error-200 rounded-md">
          <p className="text-body-sm text-error-600">{error}</p>
        </div>
        <div className="pt-4 border-t border-neutral-200">
          <AddToCartButton
            productId={productId}
            variantRequired={false}
            className="w-full sm:w-auto"
          />
        </div>
      </div>
    );
  }

  // No variants - product doesn't require variant selection
  return (
    <div className={`pt-4 border-t border-neutral-200 ${className}`}>
      <AddToCartButton
        productId={productId}
        variantRequired={false}
        className="w-full sm:w-auto"
      />
    </div>
  );
}

