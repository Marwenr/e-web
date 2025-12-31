"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ProductListItem } from "@/lib/api/product";
import { Button } from "@/components/ui";

export type ProductBadge = "new" | "bestseller" | "sale" | null;

export interface ProductCardProps {
  product: ProductListItem;
  badge?: ProductBadge; // Optional badge override
  showAddToCart?: boolean; // Show add to cart button
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  badge,
  showAddToCart = false,
  className = "",
}) => {
  const primaryImage =
    product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const displayPrice = product.discountPrice || product.basePrice;
  const originalPrice = product.discountPrice ? product.basePrice : null;
  const hasDiscount = !!product.discountPrice;

  // Check if product is new (published within last 30 days) - memoized to avoid impure render
  const isNew = useMemo(() => {
    if (!product.publishedAt) return false;
    const now = new Date().getTime();
    const publishedTime = new Date(product.publishedAt).getTime();
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    return now - publishedTime < thirtyDaysInMs;
  }, [product.publishedAt]);

  // Determine badge if not provided
  const productBadge: ProductBadge = badge ?? (hasDiscount ? "sale" : null);

  // Final badge priority: explicit badge > new > sale
  const finalBadge: ProductBadge = badge ?? (isNew ? "new" : productBadge);

  const badgeConfig = {
    new: {
      label: "New",
      className: "bg-success-500 text-white",
    },
    bestseller: {
      label: "Best Seller",
      className: "bg-primary-900 text-white",
    },
    sale: {
      label: product.discountPercent
        ? `${product.discountPercent}% OFF`
        : "Sale",
      className: "bg-error-500 text-white",
    },
  };

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // UI only - no actual cart logic
    console.log("Add to cart:", product.id);
  };

  return (
    <article className={`group flex flex-col ${className}`}>
      <Link
        href={`/products/${product.slug}`}
        className="flex flex-col flex-1 cursor-pointer"
        aria-label={`View ${product.name} product details`}
      >
        {/* Image Container with Badge */}
        <div className="relative overflow-hidden rounded-lg bg-neutral-100 aspect-square mb-4 transition-all duration-300 group-hover:shadow-md">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              loading="lazy"
              quality={85}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-200">
              <span className="text-neutral-400 text-body-sm">No Image</span>
            </div>
          )}

          {/* Badge */}
          {finalBadge && (
            <div
              className={`absolute top-3 right-3 px-2.5 py-1 rounded-md text-label font-semibold shadow-sm transition-opacity duration-200 group-hover:opacity-90 ${badgeConfig[finalBadge].className}`}
              aria-label={badgeConfig[finalBadge].label}
            >
              {badgeConfig[finalBadge].label}
            </div>
          )}

          {/* Add to Cart Button - Shows on Hover */}
          {showAddToCart && (
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                onClick={handleAddToCart}
                variant="primary"
                size="sm"
                className="w-full bg-background text-foreground hover:bg-neutral-100"
                aria-label={`Add ${product.name} to cart`}
              >
                Add to Cart
              </Button>
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="flex flex-col flex-1 space-y-2">
          <h3 className="text-body-md font-medium text-foreground group-hover:text-foreground-secondary transition-colors duration-200 line-clamp-2">
            {product.name}
          </h3>

          {product.shortDescription && (
            <p className="text-body-sm text-foreground-secondary line-clamp-2 flex-1">
              {product.shortDescription}
            </p>
          )}

          {/* Price Section */}
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-body-lg font-semibold text-foreground"
                aria-label={`Price ${displayPrice.toFixed(2)}`}
              >
                ${displayPrice.toFixed(2)}
              </span>
              {originalPrice && (
                <span
                  className="text-body-sm text-foreground-tertiary line-through"
                  aria-label={`Original price ${originalPrice.toFixed(2)}`}
                >
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Add to Cart Button - Below Product Info (Mobile/Always Visible Option) */}
      {showAddToCart && (
        <div className="mt-3 md:hidden">
          <Button
            onClick={handleAddToCart}
            variant="outline"
            size="sm"
            className="w-full"
            aria-label={`Add ${product.name} to cart`}
          >
            Add to Cart
          </Button>
        </div>
      )}
    </article>
  );
};
