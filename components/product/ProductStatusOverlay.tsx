import React from "react";
import { ProductBadge, ProductBadgeType } from "./ProductBadge";
import { ProductStockStatus, StockStatus } from "./ProductStockStatus";

export interface ProductStatusOverlayProps {
  // Badge props
  badge?: ProductBadgeType;
  badgeLabel?: string;
  discountPercent?: number;

  // Stock status props
  stockStatus?: StockStatus;
  stockCount?: number;
  lowStockThreshold?: number;

  // Positioning
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
}

/**
 * Product Status Overlay Component
 * 
 * Combines badges and stock status for use in product cards/grids.
 * Provides consistent positioning and styling.
 */
export const ProductStatusOverlay: React.FC<ProductStatusOverlayProps> = ({
  badge,
  badgeLabel,
  discountPercent,
  stockStatus,
  stockCount,
  lowStockThreshold = 10,
  position = "top-right",
  className = "",
}) => {
  const positionClasses = {
    "top-left": "top-3 left-3",
    "top-right": "top-3 right-3",
    "bottom-left": "bottom-3 left-3",
    "bottom-right": "bottom-3 right-3",
  };

  return (
    <div
      className={`absolute ${positionClasses[position]} flex flex-col gap-2 ${className}`}
    >
      {/* Badge */}
      {badge && (
        <ProductBadge
          type={badge}
          label={badgeLabel}
          discountPercent={discountPercent}
        />
      )}

      {/* Stock Status */}
      {stockStatus && stockStatus !== "in_stock" && (
        <ProductStockStatus
          status={stockStatus}
          stockCount={stockCount}
          threshold={lowStockThreshold}
        />
      )}
    </div>
  );
};

