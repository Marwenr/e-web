import React from "react";
import { Container, Section } from "@/components/ui";
import { Skeleton } from "./Skeleton";
import { ProductGridSkeleton } from "./ProductGridSkeleton";
import { ProductSectionSkeleton } from "./ProductSectionSkeleton";

export interface HomeSectionSkeletonProps {
  showHero?: boolean;
  sectionCount?: number;
  className?: string;
}

/**
 * Home Page Skeleton
 * 
 * Complete skeleton loader for the home page including hero section
 * and multiple product sections.
 */
export const HomeSectionSkeleton: React.FC<HomeSectionSkeletonProps> = ({
  showHero = true,
  sectionCount = 3,
  className = "",
}) => {
  return (
    <main className={className}>
      {/* Hero Section Skeleton */}
      {showHero && (
        <Section className="relative bg-neutral-50 py-16 md:py-24">
          <Container>
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <Skeleton variant="text" height={48} width="70%" className="mx-auto" />
              <Skeleton variant="text" height={24} width="90%" className="mx-auto" />
              <Skeleton variant="text" height={24} width="80%" className="mx-auto" />
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Skeleton variant="rectangular" height={48} width={180} className="rounded-lg mx-auto sm:mx-0" />
                <Skeleton variant="rectangular" height={48} width={180} className="rounded-lg mx-auto sm:mx-0" />
              </div>
            </div>
          </Container>
        </Section>
      )}

      {/* Product Sections Skeleton */}
      {Array.from({ length: sectionCount }).map((_, index) => (
        <ProductSectionSkeleton
          key={index}
          showTitle={true}
          showSubtitle={true}
          productCount={6}
          className={index % 2 === 1 ? "bg-neutral-50" : ""}
        />
      ))}
    </main>
  );
};

