/**
 * Product State Examples
 * 
 * This file demonstrates all product visual states for reference.
 * Use this as a guide when implementing product states in your components.
 */

import React from "react";
import { ProductBadge } from "./ProductBadge";
import { ProductStockStatus, getStockStatus } from "./ProductStockStatus";
import { ProductStatusOverlay } from "./ProductStatusOverlay";

/**
 * Example: All Badge Types
 */
export function BadgeExamples() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h3 className="text-h4 font-bold">Product Badges</h3>
      <div className="flex gap-4 flex-wrap">
        <ProductBadge type="new" />
        <ProductBadge type="bestseller" />
        <ProductBadge type="sale" />
        <ProductBadge type="sale" discountPercent={25} />
        <ProductBadge type="sale" discountPercent={50} />
      </div>
    </div>
  );
}

/**
 * Example: All Stock Status Types
 */
export function StockStatusExamples() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h3 className="text-h4 font-bold">Stock Status</h3>
      <div className="flex gap-4 flex-wrap">
        <ProductStockStatus status="in_stock" />
        <ProductStockStatus status="low_stock" stockCount={5} />
        <ProductStockStatus status="low_stock" stockCount={8} threshold={10} />
        <ProductStockStatus status="out_of_stock" />
      </div>
    </div>
  );
}

/**
 * Example: Status Overlay Combinations
 */
export function OverlayExamples() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* New Product with Low Stock */}
      <div className="relative h-64 bg-neutral-100 rounded-lg">
        <ProductStatusOverlay
          badge="new"
          stockStatus="low_stock"
          stockCount={3}
          position="top-right"
        />
      </div>

      {/* Sale Product */}
      <div className="relative h-64 bg-neutral-100 rounded-lg">
        <ProductStatusOverlay
          badge="sale"
          discountPercent={30}
          position="top-right"
        />
      </div>

      {/* Best Seller with Out of Stock */}
      <div className="relative h-64 bg-neutral-100 rounded-lg">
        <ProductStatusOverlay
          badge="bestseller"
          stockStatus="out_of_stock"
          position="top-right"
        />
      </div>

      {/* Sale with Low Stock */}
      <div className="relative h-64 bg-neutral-100 rounded-lg">
        <ProductStatusOverlay
          badge="sale"
          discountPercent={20}
          stockStatus="low_stock"
          stockCount={7}
          position="top-right"
        />
      </div>
    </div>
  );
}

/**
 * Complete Example: Product Card with States
 */
export function ProductCardWithStatesExample() {
  // Example product data
  const exampleProducts = [
    {
      id: "1",
      name: "New Arrival",
      badge: "new" as const,
      stockCount: 15,
    },
    {
      id: "2",
      name: "Best Seller Sale",
      badge: "bestseller" as const,
      discountPercent: 25,
      stockCount: 5,
    },
    {
      id: "3",
      name: "Out of Stock",
      stockCount: 0,
    },
    {
      id: "4",
      name: "On Sale",
      badge: "sale" as const,
      discountPercent: 50,
      stockCount: 20,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      {exampleProducts.map((product) => {
        const stockStatus = getStockStatus(product.stockCount);

        return (
          <div
            key={product.id}
            className="relative bg-neutral-50 rounded-lg overflow-hidden"
          >
            {/* Product Image Placeholder */}
            <div className="aspect-square bg-neutral-200 flex items-center justify-center">
              <span className="text-foreground-secondary">{product.name}</span>
            </div>

            {/* Status Overlay */}
            <ProductStatusOverlay
              badge={product.badge}
              discountPercent={product.discountPercent}
              stockStatus={stockStatus}
              stockCount={product.stockCount}
              position="top-right"
            />
          </div>
        );
      })}
    </div>
  );
}

