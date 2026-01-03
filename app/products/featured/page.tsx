import { Metadata } from "next";
import { Suspense } from "react";
import { Container, Section } from "@/components/ui";
import { ProductGridSkeleton } from "@/components/skeleton";
import { ProductError } from "@/components/product";
import { getFeaturedProducts, ProductQueryParams } from "@/lib/api/product";
import { ProductsListClient } from "../ProductsListClient";

// ISR: Revalidate every 10 minutes for featured products
export const revalidate = 600;

export const metadata: Metadata = {
  title: "Featured Products - MeubleTN",
  description:
    "Handpicked selections for your wardrobe. Discover our curated collection.",
  keywords: ["featured", "curated", "handpicked", "MeubleTN", "fashion"],
  openGraph: {
    title: "Featured Products - MeubleTN",
    description: "Handpicked selections for your wardrobe.",
    type: "website",
    url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://meubletn.com"}/products/featured`,
  },
  alternates: {
    canonical: "/products/featured",
  },
};

interface FeaturedProductsPageProps {
  searchParams: {
    page?: string;
    limit?: string;
    categoryId?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

export default async function FeaturedProductsPage({
  searchParams,
}: FeaturedProductsPageProps) {
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
  };

  // Fetch featured products server-side
  let initialProducts;
  let hasError = false;

  try {
    initialProducts = await getFeaturedProducts(params);
  } catch (error) {
    hasError = true;
    initialProducts = {
      data: [],
      meta: { page: 1, limit: 12, total: 0, totalPages: 0 },
    };
  }

  if (hasError) {
    return (
      <main>
        <Section className="bg-neutral-50 py-8 md:py-12">
          <Container>
            <div className="mb-8">
              <h1 className="text-h1 font-bold text-foreground mb-2">
                Featured Products
              </h1>
            </div>
          </Container>
        </Section>
        <ProductError
          title="Failed to load featured products"
          message="We couldn't load the featured products. Please try again later."
          actionHref="/products"
          actionLabel="Browse All Products"
        />
      </main>
    );
  }

  return (
    <main>
      <Section className="bg-neutral-50 py-8 md:py-12">
        <Container>
          <div className="mb-8">
            <h1 className="text-h1 font-bold text-foreground mb-2">
              Featured Products
            </h1>
            <p className="text-body-md text-foreground-secondary">
              Handpicked selections for your wardrobe. Discover our curated
              collection.
            </p>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <Suspense fallback={<ProductGridSkeleton count={12} />}>
            <ProductsListClient 
              initialProducts={initialProducts} 
              productType="featured"
            />
          </Suspense>
        </Container>
      </Section>
    </main>
  );
}

