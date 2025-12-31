import React from "react";

export interface ProductSectionErrorProps {
  title?: string;
  message?: string;
  className?: string;
}

/**
 * Product Section Error Component
 * 
 * Compact error display for product sections (e.g., in home page).
 * Less intrusive than full page errors.
 */
export const ProductSectionError: React.FC<ProductSectionErrorProps> = ({
  title = "Unable to load products",
  message = "Please try refreshing the page.",
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 text-center ${className}`}
    >
      <p className="text-body-md text-foreground-secondary mb-2">{title}</p>
      <p className="text-body-sm text-foreground-tertiary">{message}</p>
    </div>
  );
};

