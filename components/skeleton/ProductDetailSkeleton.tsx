import React from "react";
import { Container, Section } from "@/components/ui";
import { Skeleton } from "./Skeleton";

export interface ProductDetailSkeletonProps {
  className?: string;
}

/**
 * Product Detail Skeleton
 * 
 * Skeleton loader for product detail pages.
 * Matches the product detail page layout with images, info, and description.
 */
export const ProductDetailSkeleton: React.FC<ProductDetailSkeletonProps> = ({
  className = "",
}) => {
  return (
    <main className={className}>
      {/* Breadcrumbs Skeleton */}
      <Section className="bg-neutral-50 py-4">
        <Container>
          <Skeleton variant="text" height={16} width={200} />
        </Container>
      </Section>

      {/* Main Product Detail */}
      <Section className="py-8 md:py-12">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery Skeleton */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square bg-neutral-100 rounded-lg overflow-hidden">
                <Skeleton variant="rectangular" className="w-full h-full" />
              </div>

              {/* Thumbnail Images */}
              <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="relative aspect-square bg-neutral-100 rounded-lg overflow-hidden"
                  >
                    <Skeleton variant="rectangular" className="w-full h-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Information Skeleton */}
            <div className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Skeleton variant="text" height={36} width="80%" />
                <Skeleton variant="text" height={20} width={120} />
              </div>

              {/* Price */}
              <div className="flex items-center gap-4">
                <Skeleton variant="text" height={32} width={120} />
                <Skeleton variant="text" height={24} width={100} />
              </div>

              {/* Description */}
              <div className="space-y-3">
                <Skeleton variant="text" height={20} width="100%" />
                <Skeleton variant="text" height={20} width="95%" />
                <Skeleton variant="text" height={20} width="90%" />
                <Skeleton variant="text" height={20} width="85%" />
              </div>

              {/* Details List */}
              <div className="space-y-2">
                <Skeleton variant="text" height={20} width={100} />
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex gap-2">
                    <Skeleton variant="text" height={16} width={100} />
                    <Skeleton variant="text" height={16} width={150} />
                  </div>
                ))}
              </div>

              {/* Add to Cart Button */}
              <div className="pt-4 border-t border-neutral-200">
                <Skeleton variant="rectangular" height={48} width="100%" className="rounded-lg sm:w-auto sm:min-w-[200px]" />
              </div>

              {/* Feature Icons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-neutral-200">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="text-center space-y-2">
                    <Skeleton variant="circular" height={24} width={24} className="mx-auto" />
                    <Skeleton variant="text" height={16} width={80} className="mx-auto" />
                    <Skeleton variant="text" height={14} width={100} className="mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Related Products Skeleton */}
      <Section className="bg-neutral-50 py-12">
        <Container>
          <div className="mb-8">
            <Skeleton variant="text" height={32} width={200} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <div className="relative aspect-square bg-neutral-100 rounded-lg overflow-hidden">
                  <Skeleton variant="rectangular" className="w-full h-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton variant="text" height={20} width="80%" />
                  <Skeleton variant="text" height={24} width={100} />
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </main>
  );
};

