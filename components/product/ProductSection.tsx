"use client";

import React from "react";
import Link from "next/link";
import { ProductGrid } from "./ProductGrid";
import { ProductListItem } from "@/lib/api/product";
import { Section, Button } from "../ui";
import { ProductSectionError } from "./ProductSectionError";

export interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: ProductListItem[];
  isLoading?: boolean;
  hasError?: boolean;
  viewAllLink?: string;
  viewAllText?: string;
  className?: string;
}

export const ProductSection: React.FC<ProductSectionProps> = ({
  title,
  subtitle,
  products,
  isLoading = false,
  hasError = false,
  viewAllLink,
  viewAllText = "View All",
  className = "",
}) => {
  return (
    <Section className={className}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-h2 font-bold text-foreground mb-2">{title}</h2>
          {subtitle && (
            <p className="text-body-md text-foreground-secondary">{subtitle}</p>
          )}
        </div>
        {viewAllLink && (
          <Link href={viewAllLink}>
            <Button variant="outline">{viewAllText}</Button>
          </Link>
        )}
      </div>
      {hasError ? (
        <ProductSectionError />
      ) : (
        <ProductGrid products={products} isLoading={isLoading} />
      )}
    </Section>
  );
};
