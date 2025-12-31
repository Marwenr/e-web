import React from "react";

export type ProductBadgeType = "new" | "bestseller" | "sale";

export interface ProductBadgeProps {
  type: ProductBadgeType;
  label?: string; // Optional custom label override
  discountPercent?: number; // For sale badge to show percentage
  className?: string;
}

/**
 * Product Badge Component
 * 
 * Displays consistent product badges (New, Best Seller, Sale) across the application.
 * Uses Tailwind config tokens for consistent styling.
 */
export const ProductBadge: React.FC<ProductBadgeProps> = ({
  type,
  label,
  discountPercent,
  className = "",
}) => {
  // Badge configuration based on type
  const badgeConfig = {
    new: {
      defaultLabel: "New",
      styles: "bg-success-500 text-white",
      ariaLabel: "New product",
    },
    bestseller: {
      defaultLabel: "Best Seller",
      styles: "bg-primary-900 text-white",
      ariaLabel: "Best seller product",
    },
    sale: {
      defaultLabel: discountPercent ? `${discountPercent}% OFF` : "Sale",
      styles: "bg-error-500 text-white",
      ariaLabel: "On sale",
    },
  };

  const config = badgeConfig[type];
  const displayLabel = label ?? config.defaultLabel;

  return (
    <div
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-label font-semibold shadow-sm ${config.styles} ${className}`}
      aria-label={config.ariaLabel}
    >
      {displayLabel}
    </div>
  );
};

