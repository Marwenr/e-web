import { Metadata } from "next";
import { ProductSection } from "@/components/product";
import { HeroSection } from "@/components/hero";
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

  const bestSellersData =
    bestSellers.status === "fulfilled" ? bestSellers.value.data : [];
  const bestSellersError = bestSellers.status === "rejected";

  const newArrivalsData =
    newArrivals.status === "fulfilled" ? newArrivals.value.data : [];
  const newArrivalsError = newArrivals.status === "rejected";

  const featuredData =
    featured.status === "fulfilled" ? featured.value.data : [];
  const featuredError = featured.status === "rejected";

  return (
    <main>
      {/* Hero Section */}
      <HeroSection
        backgroundImage="/landing.webp"
        title="Style Redefined, Effortlessly Yours"
        buttons={[
          {
            href: "/products",
            text: "Shop Collection",
            variant: "primary",
          },
          {
            href: "/products/featured",
            text: "Wear like a Pro",
            variant: "secondary",
          },
        ]}
      />

      {/* Best Sellers Section */}
      <ProductSection
        title="Best Sellers"
        subtitle="Shop our most popular items. Loved by customers worldwide."
        products={bestSellersData}
        hasError={bestSellersError}
        viewAllLink="/products/best-sellers"
        viewAllText="View All Best Sellers"
        className="container-custom"
      />

      {/* New Arrivals Section */}
      <ProductSection
        title="New Arrivals"
        subtitle="Shop the Latest Styles. Stay ahead of the curve with our newest arrivals."
        products={newArrivalsData}
        hasError={newArrivalsError}
        viewAllLink="/products/new-arrivals"
        viewAllText="View All New Arrivals"
        className="container-custom"
      />

      {/* Featured Section */}
      <ProductSection
        title="Featured Products"
        subtitle="Handpicked selections for your wardrobe. Discover our curated collection."
        products={featuredData}
        hasError={featuredError}
        viewAllLink="/products/featured"
        viewAllText="View All Featured"
        className="container-custom"
      />
    </main>
  );
}
