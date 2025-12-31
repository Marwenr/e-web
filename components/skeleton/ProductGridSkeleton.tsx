import React from "react";
import { ProductCardSkeleton } from "./ProductCardSkeleton";

export interface ProductGridSkeletonProps {
  count?: number;
  className?: string;
  showDescription?: boolean;
}

/**
 * Product Grid Skeleton
 * 
 * Displays multiple ProductCardSkeleton components in a grid layout.
 * Matches the ProductGrid component structure.
 */
export const ProductGridSkeleton: React.FC<ProductGridSkeletonProps> = ({
  count = 8,
  className = "",
  showDescription = true,
}) => {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}
    >
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} showDescription={showDescription} />
      ))}
    </div>
  );
};

