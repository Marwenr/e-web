import React from "react";

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface ProductStockStatusProps {
  status: StockStatus;
  stockCount?: number; // Optional stock count for display
  threshold?: number; // Low stock threshold (default: 10)
  className?: string;
}

/**
 * Product Stock Status Component
 * 
 * Displays stock status indicators (In Stock, Low Stock, Out of Stock) consistently.
 * Uses Tailwind config tokens for consistent styling.
 */
export const ProductStockStatus: React.FC<ProductStockStatusProps> = ({
  status,
  stockCount,
  threshold = 10,
  className = "",
}) => {
  // Stock status configuration
  const statusConfig = {
    in_stock: {
      label: "In Stock",
      styles: "bg-success-50 text-success-700 border-success-200",
      icon: "✓",
      ariaLabel: "In stock",
    },
    low_stock: {
      label: stockCount !== undefined ? `Only ${stockCount} left` : "Low Stock",
      styles: "bg-warning-50 text-warning-700 border-warning-200",
      icon: "⚠",
      ariaLabel: "Low stock",
    },
    out_of_stock: {
      label: "Out of Stock",
      styles: "bg-error-50 text-error-700 border-error-200",
      icon: "✕",
      ariaLabel: "Out of stock",
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-label font-medium border ${config.styles} ${className}`}
      aria-label={config.ariaLabel}
      role="status"
    >
      <span className="text-body-sm" aria-hidden="true">
        {config.icon}
      </span>
      <span>{config.label}</span>
    </div>
  );
};

/**
 * Helper function to determine stock status from count
 */
export function getStockStatus(
  stockCount: number | undefined,
  threshold: number = 10
): StockStatus {
  if (stockCount === undefined || stockCount === null) {
    return "in_stock"; // Default to in stock if count not available
  }

  if (stockCount === 0) {
    return "out_of_stock";
  }

  if (stockCount <= threshold) {
    return "low_stock";
  }

  return "in_stock";
}

