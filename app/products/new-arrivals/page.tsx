import { Metadata } from "next";
import { Suspense } from "react";
import { Container, Section } from "@/components/ui";
import { ProductGridSkeleton } from "@/components/skeleton";
import { ProductError } from "@/components/product";
import { getNewArrivals, ProductQueryParams } from "@/lib/api/product";
import { ProductsListClient } from "../ProductsListClient";

// ISR: Revalidate every 15 minutes for new arrivals
export const revalidate = 900;

export const metadata: Metadata = {
  title: "New Arrivals - MeubleTN",
  description:
    "Shop the latest styles. Stay ahead of the curve with our newest arrivals.",
  keywords: ["new arrivals", "latest", "new", "MeubleTN", "fashion"],
  openGraph: {
    title: "New Arrivals - MeubleTN",
    description: "Shop the latest styles.",
    type: "website",
    url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://meubletn.com"}/products/new-arrivals`,
  },
  alternates: {
    canonical: "/products/new-arrivals",
  },
};

interface NewArrivalsPageProps {
  searchParams: {
    page?: string;
    limit?: string;
    categoryId?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

export default async function NewArrivalsPage({
  searchParams,
}: NewArrivalsPageProps) {
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

  // Fetch new arrivals server-side
  let initialProducts;
  let hasError = false;

  try {
    initialProducts = await getNewArrivals(params);
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
                New Arrivals
              </h1>
            </div>
          </Container>
        </Section>
        <ProductError
          title="Failed to load new arrivals"
          message="We couldn't load the new arrival products. Please try again later."
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
              New Arrivals
            </h1>
            <p className="text-body-md text-foreground-secondary">
              Shop the Latest Styles. Stay ahead of the curve with our newest
              arrivals.
            </p>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <Suspense fallback={<ProductGridSkeleton count={12} />}>
            <ProductsListClient 
              initialProducts={initialProducts} 
              productType="new-arrivals"
            />
          </Suspense>
        </Container>
      </Section>
    </main>
  );
}

