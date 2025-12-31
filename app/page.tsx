import { Metadata } from "next";
import { ProductSection } from "@/components/product";
import { Container, Section } from "@/components/ui";
import {
  getBestSellers,
  getNewArrivals,
  getFeaturedProducts,
} from "@/lib/api/product";

// ISR: Revalidate home page every 5 minutes
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Home - MeubleTN",
  description:
    "Discover timeless pieces for effortless style. Shop best sellers, new arrivals, and featured products.",
  keywords: [
    "MeubleTN",
    "fashion",
    "clothing",
    "style",
    "best sellers",
    "new arrivals",
  ],
  openGraph: {
    title: "MeubleTN - Discover Timeless Style",
    description: "Discover timeless pieces for effortless style.",
    type: "website",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://meubletn.com",
  },
  alternates: {
    canonical: "/",
  },
};

export default async function HomePage() {
  // Fetch all product sections in parallel
  const [bestSellers, newArrivals, featured] = await Promise.allSettled([
    getBestSellers({ limit: 6 }),
    getNewArrivals({ limit: 6 }),
    getFeaturedProducts({ limit: 6 }),
  ]);

  const bestSellersData = bestSellers.status === 'fulfilled' ? bestSellers.value.data : [];
  const bestSellersError = bestSellers.status === 'rejected';
  
  const newArrivalsData = newArrivals.status === 'fulfilled' ? newArrivals.value.data : [];
  const newArrivalsError = newArrivals.status === 'rejected';
  
  const featuredData = featured.status === 'fulfilled' ? featured.value.data : [];
  const featuredError = featured.status === 'rejected';

  return (
    <main>
      {/* Hero Section */}
      <section className="relative bg-neutral-50 py-16 md:py-24">
        <div className="container-custom mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-display-md md:text-display-lg font-bold text-foreground mb-6">
              Style Redefined, Effortlessly Yours
            </h1>
            <p className="text-body-lg text-foreground-secondary mb-8 max-w-2xl mx-auto">
              Discover timeless pieces for effortless style. Since 1963, we&apos;ve pioneered the creation of beautiful clothing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/products"
                className="inline-flex items-center justify-center px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:bg-foreground-secondary transition-colors"
              >
                Shop Collection
              </a>
              <a
                href="/products/featured"
                className="inline-flex items-center justify-center px-6 py-3 border border-foreground text-foreground rounded-lg font-medium hover:bg-neutral-100 transition-colors"
              >
                Wear like a Pro
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <ProductSection
        title="Best Sellers"
        subtitle="Shop our most popular items. Loved by customers worldwide."
        products={bestSellersData}
        hasError={bestSellersError}
        viewAllLink="/products/best-sellers"
        viewAllText="View All Best Sellers"
      />

      {/* New Arrivals Section */}
      <ProductSection
        title="New Arrivals"
        subtitle="Shop the Latest Styles. Stay ahead of the curve with our newest arrivals."
        products={newArrivalsData}
        hasError={newArrivalsError}
        viewAllLink="/products/new-arrivals"
        viewAllText="View All New Arrivals"
      />

      {/* Featured Section */}
      <ProductSection
        title="Featured Products"
        subtitle="Handpicked selections for your wardrobe. Discover our curated collection."
        products={featuredData}
        hasError={featuredError}
        viewAllLink="/products/featured"
        viewAllText="View All Featured"
        className="bg-neutral-50"
      />
    </main>
  );
}
