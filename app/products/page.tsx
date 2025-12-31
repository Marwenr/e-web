import { Metadata } from "next";
import { Suspense } from "react";
import { Container, Section } from "@/components/ui";
import { ProductGridSkeleton } from "@/components/skeleton";
import { ProductError } from "@/components/product";
import { getProducts, ProductQueryParams } from "@/lib/api/product";
import { ProductsListClient } from "./ProductsListClient";

// ISR: Revalidate every 5 minutes for product listing
export const revalidate = 300;

export const metadata: Metadata = {
  title: "All Products - MeubleTN",
  description:
    "Browse our complete collection of products. Find your perfect style.",
  keywords: ["products", "fashion", "clothing", "MeubleTN", "shop"],
  openGraph: {
    title: "All Products - MeubleTN",
    description: "Browse our complete collection of products.",
    type: "website",
    url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://meubletn.com"}/products`,
  },
  alternates: {
    canonical: "/products",
  },
};

interface ProductsPageProps {
  searchParams: {
    page?: string;
    limit?: string;
    categoryId?: string;
    minPrice?: string;
    maxPrice?: string;
    status?: string;
  };
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params: ProductQueryParams = {
    page: searchParams.page ? parseInt(searchParams.page, 10) : 1,
    limit: searchParams.limit ? parseInt(searchParams.limit, 10) : 12,
    categoryId: searchParams.categoryId,
    minPrice: searchParams.minPrice
      ? parseFloat(searchParams.minPrice)
      : undefined,
    maxPrice: searchParams.maxPrice
      ? parseFloat(searchParams.maxPrice)
      : undefined,
    status: searchParams.status,
  };

  // Fetch initial products server-side
  let initialProducts;
  let hasError = false;

  try {
    initialProducts = await getProducts(params);
  } catch (error) {
    hasError = true;
    initialProducts = {
      data: [],
      meta: { page: 1, limit: 12, total: 0, totalPages: 0 },
    };
  }

  return (
    <main>
      <Section className="bg-neutral-50 py-8 md:py-12">
        <Container>
          <div className="mb-8">
            <h1 className="text-h1 font-bold text-foreground mb-2">All Products</h1>
            <p className="text-body-md text-foreground-secondary">
              Shop now, not later. Browse the best of our favorite sale styles and brands.
            </p>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          {hasError ? (
            <ProductError
              title="Failed to load products"
              message="We couldn't load the products. Please try again later."
              actionHref="/products"
              actionLabel="Refresh Page"
            />
          ) : (
            <Suspense fallback={<ProductGridSkeleton count={12} />}>
              <ProductsListClient initialProducts={initialProducts} />
            </Suspense>
          )}
        </Container>
      </Section>
    </main>
  );
}

