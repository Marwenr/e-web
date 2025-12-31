"use client";

import React, { useEffect } from "react";
import { ProductVariant } from "@/lib/api/product";

export interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariantId?: string;
  onVariantChange: (variantId: string) => void;
  className?: string;
}

export default function VariantSelector({
  variants,
  selectedVariantId,
  onVariantChange,
  className = "",
}: VariantSelectorProps) {
  if (variants.length === 0) {
    return null;
  }

  // Group variants by attribute name (e.g., "Color", "Size")
  const attributeGroups: Record<string, Array<{ value: string; variant: ProductVariant }>> = {};

  variants.forEach((variant) => {
    variant.attributes.forEach((attr) => {
      if (!attributeGroups[attr.name]) {
        attributeGroups[attr.name] = [];
      }
      // Check if this value already exists for this attribute
      const exists = attributeGroups[attr.name].some(
        (item) => item.value === attr.value
      );
      if (!exists) {
        attributeGroups[attr.name].push({ value: attr.value, variant });
      }
    });
  });

  // If no default variant is selected and there's a default variant, select it
  useEffect(() => {
    if (!selectedVariantId) {
      const defaultVariant = variants.find((v) => v.isDefault);
      if (defaultVariant) {
        onVariantChange(defaultVariant.id);
      } else if (variants.length > 0) {
        onVariantChange(variants[0].id);
      }
    }
  }, [variants, selectedVariantId, onVariantChange]);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);

  return (
    <div className={`space-y-4 ${className}`}>
      {Object.entries(attributeGroups).map(([attributeName, values]) => (
        <div key={attributeName}>
          <label className="block text-body-sm font-medium text-foreground mb-2">
            {attributeName}:
            {selectedVariant && (
              <span className="ml-2 text-body-sm font-normal text-foreground-secondary">
                {selectedVariant.attributes.find((a) => a.name === attributeName)?.value}
              </span>
            )}
          </label>
          <div className="flex flex-wrap gap-2">
            {values.map(({ value, variant }) => {
              const isSelected = selectedVariantId === variant.id;
              const isOutOfStock = variant.stock === 0;

              return (
                <button
                  key={`${attributeName}-${value}-${variant.id}`}
                  type="button"
                  onClick={() => !isOutOfStock && onVariantChange(variant.id)}
                  disabled={isOutOfStock}
                  className={`
                    px-4 py-2 rounded-md border-2 transition-all
                    text-body-sm font-medium
                    ${
                      isSelected
                        ? "border-primary-900 bg-primary-900 text-white"
                        : "border-neutral-300 bg-background text-foreground hover:border-primary-500"
                    }
                    ${isOutOfStock ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  `}
                  aria-label={`Select ${attributeName} ${value}`}
                >
                  {value}
                  {isOutOfStock && (
                    <span className="ml-1 text-body-xs">(Out of stock)</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Selected Variant Info */}
      {selectedVariant && (
        <div className="pt-2 border-t border-neutral-200">
          <div className="flex items-center justify-between">
            <span className="text-body-sm text-foreground-secondary">Price:</span>
            <div className="flex items-center gap-2">
              <span className="text-body-lg font-semibold text-foreground">
                ${(selectedVariant.discountPrice ?? selectedVariant.basePrice).toFixed(2)}
              </span>
              {selectedVariant.discountPrice && (
                <span className="text-body-sm text-foreground-secondary line-through">
                  ${selectedVariant.basePrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-body-sm text-foreground-secondary">Stock:</span>
            <span
              className={`text-body-sm font-medium ${
                selectedVariant.stock > 5
                  ? "text-success-600"
                  : selectedVariant.stock > 0
                  ? "text-warning-600"
                  : "text-error-500"
              }`}
            >
              {selectedVariant.stock > 0
                ? `${selectedVariant.stock} available`
                : "Out of stock"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

