import { Metadata } from "next";
import { Suspense } from "react";
import { Container, Section } from "@/components/ui";
import { ProductGridSkeleton } from "@/components/skeleton";
import { ProductError } from "@/components/product";
import { getBestSellers, ProductQueryParams } from "@/lib/api/product";
import { ProductsListClient } from "../ProductsListClient";

// ISR: Revalidate every 10 minutes for best sellers (updated more frequently)
export const revalidate = 600;

export const metadata: Metadata = {
  title: "Best Sellers - MeubleTN",
  description:
    "Shop our most popular products. Best sellers loved by customers worldwide.",
  keywords: ["best sellers", "popular", "trending", "MeubleTN", "fashion"],
  openGraph: {
    title: "Best Sellers - MeubleTN",
    description: "Shop our most popular products.",
    type: "website",
    url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://meubletn.com"}/products/best-sellers`,
  },
  alternates: {
    canonical: "/products/best-sellers",
  },
};

interface BestSellersPageProps {
  searchParams: {
    page?: string;
    limit?: string;
    categoryId?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

export default async function BestSellersPage({
  searchParams,
}: BestSellersPageProps) {
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

  // Fetch best sellers server-side
  let initialProducts;
  let hasError = false;

  try {
    initialProducts = await getBestSellers(params);
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
                Best Sellers
              </h1>
            </div>
          </Container>
        </Section>
        <ProductError
          title="Failed to load best sellers"
          message="We couldn't load the best selling products. Please try again later."
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
              Best Sellers
            </h1>
            <p className="text-body-md text-foreground-secondary">
              Shop our most popular products. Loved by customers worldwide.
            </p>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <Suspense fallback={<ProductGridSkeleton count={12} />}>
            <ProductsListClient 
              initialProducts={initialProducts} 
              productType="best-sellers"
            />
          </Suspense>
        </Container>
      </Section>
    </main>
  );
}

