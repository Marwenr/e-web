import React from "react";
import { Container, Section } from "@/components/ui";
import { Skeleton } from "./Skeleton";
import { ProductGridSkeleton } from "./ProductGridSkeleton";

export interface ProductSectionSkeletonProps {
  showTitle?: boolean;
  showSubtitle?: boolean;
  productCount?: number;
  className?: string;
}

/**
 * Product Section Skeleton
 * 
 * Skeleton loader for product sections (e.g., Best Sellers, New Arrivals).
 * Includes header section with title/subtitle and product grid.
 */
export const ProductSectionSkeleton: React.FC<ProductSectionSkeletonProps> = ({
  showTitle = true,
  showSubtitle = true,
  productCount = 6,
  className = "",
}) => {
  return (
    <Section className={className}>
      <Container>
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div className="space-y-3">
            {showTitle && <Skeleton variant="text" height={32} width={200} />}
            {showSubtitle && <Skeleton variant="text" height={20} width={300} />}
          </div>
          {/* View All Button Skeleton */}
          <Skeleton variant="rectangular" height={40} width={120} className="rounded-lg" />
        </div>

        {/* Product Grid Skeleton */}
        <ProductGridSkeleton count={productCount} showDescription={true} />
      </Container>
    </Section>
  );
};

