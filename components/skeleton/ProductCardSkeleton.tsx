import React from "react";
import { Skeleton } from "./Skeleton";

export interface ProductCardSkeletonProps {
  className?: string;
  showDescription?: boolean;
}

/**
 * Product Card Skeleton
 * 
 * Skeleton loader that matches the ProductCard component structure.
 * Provides smooth loading UX for product grids and lists.
 */
export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({
  className = "",
  showDescription = true,
}) => {
  return (
    <article className={`flex flex-col ${className}`}>
      {/* Image Skeleton */}
      <div className="relative overflow-hidden rounded-lg bg-neutral-100 aspect-square mb-4">
        <Skeleton variant="rectangular" className="w-full h-full" />
      </div>

      {/* Content Skeleton */}
      <div className="flex flex-col flex-1 space-y-2">
        {/* Product Name - 2 lines */}
        <div className="space-y-2">
          <Skeleton variant="text" height={20} width="85%" />
          <Skeleton variant="text" height={20} width="60%" />
        </div>

        {/* Description - Optional */}
        {showDescription && (
          <div className="space-y-1.5">
            <Skeleton variant="text" height={16} width="100%" />
            <Skeleton variant="text" height={16} width="75%" />
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 pt-1">
          <Skeleton variant="text" height={24} width={80} />
        </div>
      </div>
    </article>
  );
};

