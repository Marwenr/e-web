"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/product";
import { LoadingSpinner } from "@/components/patterns";
import {
  PaginatedProductsResponse,
  ProductQueryParams,
  getProducts,
  getBestSellers,
  getNewArrivals,
  getFeaturedProducts,
} from "@/lib/api/product";
import { ApiError } from "@/lib/api/config";
import { ProductError } from "@/components/product";
import { apiCache } from "@/lib/api/cache";

interface ProductsListClientProps {
  initialProducts: PaginatedProductsResponse;
  productType?: "all" | "best-sellers" | "new-arrivals" | "featured";
}

export function ProductsListClient({
  initialProducts,
  productType = "all",
}: ProductsListClientProps) {
  // Select the appropriate fetch function based on productType
  const getFetchFunction = () => {
    switch (productType) {
      case "best-sellers":
        return getBestSellers;
      case "new-arrivals":
        return getNewArrivals;
      case "featured":
        return getFeaturedProducts;
      default:
        return getProducts;
    }
  };
  const searchParams = useSearchParams();
  const [products, setProducts] = useState(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(initialProducts.meta.page);
  const prevParamsRef = useRef<string>("");
  const isInitialMount = useRef(true);
  const hasProductsRef = useRef(initialProducts.data.length > 0);
  const isLoadingMoreRef = useRef(false);

  // Watch for filter changes in URL and refetch products
  useEffect(() => {
    // Ensure we're on the client side
    if (typeof window === "undefined") {
      return;
    }

    // Get a stable string representation of search params for comparison
    const searchParamsString = searchParams.toString();

    // Skip if params haven't changed
    if (searchParamsString === prevParamsRef.current) {
      return;
    }

    // On initial mount, just set the ref and skip refetch (we already have initialProducts)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevParamsRef.current = searchParamsString;
      return;
    }

    prevParamsRef.current = searchParamsString;

    // Extract filter values from URL
    const categoryId = searchParams.get("categoryId");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const status = searchParams.get("status");
    const page = searchParams.get("page");

    // Build params from URL
    const params: ProductQueryParams = {
      page: page ? parseInt(page, 10) : 1,
      limit: initialProducts.meta.limit,
    };

    if (categoryId) {
      params.categoryId = categoryId;
    }

    if (minPrice) {
      params.minPrice = parseFloat(minPrice);
    }

    if (maxPrice) {
      params.maxPrice = parseFloat(maxPrice);
    }

    if (status) {
      params.status = status;
    }

    // Check cache first for instant response
    const cacheKey = apiCache.generateKey("products", params);
    const cachedProducts = apiCache.get<PaginatedProductsResponse>(cacheKey);

    if (cachedProducts) {
      // Use cached data immediately for instant UI update
      setProducts(cachedProducts);
      setCurrentPage(cachedProducts.meta.page);
      setError(null);
      hasProductsRef.current = cachedProducts.data.length > 0;
      setIsLoading(false);

      // Optionally refresh in background (stale-while-revalidate pattern)
      // This ensures data is fresh but UI is instant
      const fetchFn = getFetchFunction();
      fetchFn(params)
        .then((newProducts) => {
          // Only update if data actually changed
          if (JSON.stringify(newProducts) !== JSON.stringify(cachedProducts)) {
            setProducts(newProducts);
            setCurrentPage(newProducts.meta.page);
          }
          hasProductsRef.current = newProducts.data.length > 0;
        })
        .catch((err) => {
          // Silently fail - we already have cached data
          console.warn("Background refresh failed, using cached data:", err);
        });

      return; // Exit early, we have cached data
    }

    // No cache available, fetch from API
    setIsLoading(true);
    setError(null);

    // Fetch in background without blocking UI
    const fetchFn = getFetchFunction();
    fetchFn(params)
      .then((newProducts) => {
        setProducts(newProducts);
        setCurrentPage(newProducts.meta.page);
        setError(null);
        hasProductsRef.current = newProducts.data.length > 0;
      })
      .catch((err) => {
        console.error("Error in ProductsListClient fetchFunction:", err);

        const errorMessage =
          err instanceof ApiError
            ? err.message
            : "Failed to load products. Please try again.";

        if (!hasProductsRef.current) {
          setError(errorMessage);
        } else {
          console.warn(
            "Failed to refetch products, but using existing data:",
            err
          );
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [searchParams, productType, initialProducts.meta.limit]);

  // Also update when initialProducts change (server-side updates)
  useEffect(() => {
    setProducts(initialProducts);
    setCurrentPage(initialProducts.meta.page);
    setError(null);
    hasProductsRef.current = initialProducts.data.length > 0;
  }, [initialProducts]);

  const loadMore = useCallback(async () => {
    if (
      isLoading ||
      isLoadingMoreRef.current ||
      currentPage >= products.meta.totalPages
    ) {
      return;
    }

    isLoadingMoreRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const nextPage = currentPage + 1;

      // Include current filters from URL params
      const params: ProductQueryParams = {
        page: nextPage,
        limit: products.meta.limit,
      };

      const categoryId = searchParams.get("categoryId");
      if (categoryId) {
        params.categoryId = categoryId;
      }

      const minPrice = searchParams.get("minPrice");
      if (minPrice) {
        params.minPrice = parseFloat(minPrice);
      }

      const maxPrice = searchParams.get("maxPrice");
      if (maxPrice) {
        params.maxPrice = parseFloat(maxPrice);
      }

      const status = searchParams.get("status");
      if (status) {
        params.status = status;
      }

      const fetchFn = getFetchFunction();
      const newProducts = await fetchFn(params);

      setProducts({
        ...newProducts,
        data: [...products.data, ...newProducts.data],
      });
      setCurrentPage(nextPage);
    } catch (err) {
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : "Failed to load more products. Please try again.";
      setError(errorMessage);
      console.error("Failed to load more products:", err);
    } finally {
      setIsLoading(false);
      isLoadingMoreRef.current = false;
    }
  }, [
    isLoading,
    currentPage,
    products.meta.totalPages,
    products.meta.limit,
    products.data,
    searchParams,
    productType,
  ]);

  const hasMore = currentPage < products.meta.totalPages;

  // Show error state if initial load failed and no products
  if (products.data.length === 0 && products.meta.total === 0 && !isLoading) {
    return (
      <ProductError
        title="No products found"
        message="We couldn't find any products matching your criteria."
        actionHref="/products"
        actionLabel="Browse All Products"
      />
    );
  }

  return (
    <div className="space-y-8">
      <ProductGrid products={products.data} isLoading={isLoading} />

      {error && products.data.length === 0 && (
        <div className="text-center py-4">
          <p className="text-body-sm text-error-500 mb-4">{error}</p>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="flex flex-col items-center gap-4 py-8">
          <button
            onClick={() => loadMore()}
            disabled={isLoading || isLoadingMoreRef.current}
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 active:bg-blue-800 disabled:bg-neutral-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 min-w-[200px] justify-center shadow-sm hover:shadow-md"
          >
            {isLoading || isLoadingMoreRef.current ? (
              <>
                <LoadingSpinner />
                <span>Loading...</span>
              </>
            ) : (
              <span>Load More Products</span>
            )}
          </button>
          {hasMore && products.meta.total > 0 && (
            <p className="text-body-sm text-foreground-secondary">
              Showing {products.data.length} of {products.meta.total} products
            </p>
          )}
        </div>
      )}

      {/* Show message when all products are loaded */}
      {!hasMore && products.data.length > 0 && (
        <div className="text-center text-body-sm text-foreground-secondary pt-4 pb-8">
          Showing all {products.meta.total} products
        </div>
      )}
    </div>
  );
}
