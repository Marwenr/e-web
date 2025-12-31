'use client';

import React from 'react';
import { ProductCard } from './ProductCard';
import { ProductListItem } from '@/lib/api/product';
import { ProductGridSkeleton } from '../skeleton';

export interface ProductGridProps {
  products: ProductListItem[];
  isLoading?: boolean;
  className?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  isLoading = false,
  className = '' 
}) => {
  if (isLoading) {
    return <ProductGridSkeleton count={8} className={className} />;
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-body-md text-foreground-secondary">No products found.</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

