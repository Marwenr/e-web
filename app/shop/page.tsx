import { Metadata } from "next";
import { Suspense } from "react";
import { Section } from "@/components/ui";
import { LoadingSpinner } from "@/components/patterns";
import { HeroSection } from "@/components/hero";
import { getProducts, ProductQueryParams } from "@/lib/api/product";
import { getCategories, Category } from "@/lib/api/category";
import { ProductsListClient } from "../products/ProductsListClient";
import { CategoryFilter } from "@/components/shop/CategoryFilter";

// Force dynamic rendering to ensure searchParams are always fresh
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop - MeubleTN",
  description:
    "Browse our complete collection of products. Find your perfect style.",
  openGraph: {
    title: "Shop - MeubleTN",
    description: "Browse our complete collection of products.",
    type: "website",
  },
};

interface ShopPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    categoryId?: string;
    minPrice?: string;
    maxPrice?: string;
    status?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  // Await searchParams (Next.js 15+ requires this)
  const resolvedSearchParams = await searchParams;

  const params: ProductQueryParams = {
    page: resolvedSearchParams.page
      ? parseInt(resolvedSearchParams.page, 10)
      : 1,
    limit: resolvedSearchParams.limit
      ? parseInt(resolvedSearchParams.limit, 10)
      : 12,
    categoryId: resolvedSearchParams.categoryId,
    minPrice: resolvedSearchParams.minPrice
      ? parseFloat(resolvedSearchParams.minPrice)
      : undefined,
    maxPrice: resolvedSearchParams.maxPrice
      ? parseFloat(resolvedSearchParams.maxPrice)
      : undefined,
    status: resolvedSearchParams.status,
  };

  // Fetch initial products server-side
  let initialProducts;
  try {
    initialProducts = await getProducts(params);
  } catch {
    initialProducts = {
      data: [],
      meta: { page: 1, limit: 12, total: 0, totalPages: 0 },
    };
  }

  // Fetch all active categories from backend
  let categories: Category[] = [];
  try {
    categories = await getCategories({ isActive: true });
  } catch {
    // Fallback to empty array if fetch fails
    categories = [];
  }

  return (
    <main>
      <HeroSection
        backgroundImage="/landing3.webp"
        title="Made for you."
        description="Since 1963, we've pioneered the creation of beautiful clothing and footwear for all the family."
      />

      <Section className="container-custom">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Sidebar with category filters */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                </div>
              }
            >
              <CategoryFilter
                categories={categories}
                selectedCategoryId={params.categoryId}
              />
            </Suspense>
          </aside>

          {/* Main products grid */}
          <div className="flex-1">
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner />
                </div>
              }
            >
              <ProductsListClient initialProducts={initialProducts} />
            </Suspense>
          </div>
        </div>
      </Section>
    </main>
  );
}
