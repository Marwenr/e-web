import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container, Section, Button } from "@/components/ui";
import { getProductBySlug, getFeaturedProducts } from "@/lib/api/product";
import { ProductCard } from "@/components/product";
import { ProductDetailSkeleton } from "@/components/skeleton";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// ISR: Revalidate every 60 seconds for product pages
export const revalidate = 60;

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    const primaryImage =
      product.images?.find((img) => img.isPrimary) || product.images?.[0];
    const displayPrice = product.discountPrice ?? product.basePrice ?? 0;
    const category =
      typeof product.category === "object" ? product.category : null;

    const metadata: Metadata = {
      title: `${product.name} - MeubleTN`,
      description:
        product.shortDescription ||
        product.description ||
        `Shop ${product.name} at MeubleTN`,
      keywords: product.seoKeywords || [
        product.name,
        "MeubleTN",
        ...(category ? [category.name] : []),
        "fashion",
        "clothing",
      ],
      openGraph: {
        title: product.name,
        description:
          product.shortDescription || product.description || product.name,
        type: "website",
        url: `${
          process.env.NEXT_PUBLIC_BASE_URL || "https://meubletn.com"
        }/products/${product.slug}`,
        images:
          product.images?.map((img) => ({
            url: img.url,
            alt: img.alt || product.name,
            width: 1200,
            height: 1200,
          })) || [],
      },
      twitter: {
        card: "summary_large_image",
        title: product.name,
        description:
          product.shortDescription || product.description || product.name,
        images: primaryImage ? [primaryImage.url] : [],
      },
      alternates: {
        canonical: `/products/${product.slug}`,
      },
      other: {
        "product:price:amount": (displayPrice ?? 0).toString(),
        "product:price:currency": "USD",
        ...(product.discountPrice &&
          product.basePrice && {
            "product:original_price:amount": product.basePrice.toString(),
            "product:original_price:currency": "USD",
          }),
        ...(category && {
          "product:category": category.name,
        }),
      },
    };

    return metadata;
  } catch {
    return {
      title: "Product Not Found - MeubleTN",
    };
  }
}

// Structured Data (JSON-LD) for SEO
function ProductStructuredData({ product }: { product: any }) {
  const primaryImage =
    product.images?.find((img: any) => img.isPrimary) || product.images?.[0];
  const displayPrice = product.discountPrice ?? product.basePrice ?? 0;
  const originalPrice =
    product.discountPrice && product.basePrice ? product.basePrice : null;
  const category =
    typeof product.category === "object" ? product.category : null;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://meubletn.com";

  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    description:
      product.description || product.shortDescription || product.name,
    image: product.images?.map((img: any) => img.url) || [],
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: "MeubleTN",
    },
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/products/${product.slug}`,
      priceCurrency: "USD",
      price: displayPrice,
      priceValidUntil: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000
      ).toISOString(),
      availability:
        product.status === "active"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      ...(originalPrice && {
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: displayPrice,
          priceCurrency: "USD",
        },
      }),
    },
    ...(category && {
      category: category.name,
    }),
    aggregateRating:
      product.soldCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: "4.5",
            reviewCount: Math.floor(product.soldCount / 10),
          }
        : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// Breadcrumb Structured Data
function BreadcrumbStructuredData({
  category,
  productName,
  productSlug,
}: {
  category: any;
  productName: string;
  productSlug: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://meubletn.com";

  const breadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: baseUrl,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Products",
      item: `${baseUrl}/products`,
    },
    ...(category
      ? [
          {
            "@type": "ListItem",
            position: 3,
            name: category.name,
            item: `${baseUrl}/categories/${category.slug}`,
          },
        ]
      : []),
    {
      "@type": "ListItem",
      position: category ? 4 : 3,
      name: productName,
      item: `${baseUrl}/products/${productSlug}`,
    },
  ];

  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  let product;
  try {
    product = await getProductBySlug(slug);
  } catch (error) {
    notFound();
  }

  // Fetch related/featured products in parallel (not critical, can fail silently)
  let relatedProducts: Awaited<ReturnType<typeof getFeaturedProducts>>["data"] =
    [];
  try {
    const featured = await getFeaturedProducts({ limit: 4 });
    relatedProducts = featured.data
      .filter((p) => p.id !== product.id)
      .slice(0, 3);
  } catch (error) {
    // Ignore error for related products - they're not critical
    console.error("Failed to load related products:", error);
  }

  const primaryImage =
    product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const otherImages =
    product.images?.filter((img) => img !== primaryImage) || [];
  const displayPrice = product.discountPrice ?? product.basePrice ?? 0;
  const originalPrice =
    product.discountPrice && product.basePrice ? product.basePrice : null;
  const category =
    typeof product.category === "object" ? product.category : null;

  return (
    <>
      {/* Structured Data for SEO */}
      <ProductStructuredData product={product} />
      <BreadcrumbStructuredData
        category={category}
        productName={product.name}
        productSlug={product.slug}
      />

      <main>
        {/* Breadcrumbs */}
        <Section className="bg-neutral-50 py-4">
          <Container>
            <nav
              className="text-body-sm text-foreground-secondary"
              aria-label="Breadcrumb"
            >
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="hover:text-foreground">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">›</li>
                <li>
                  <Link href="/products" className="hover:text-foreground">
                    Products
                  </Link>
                </li>
                {category && (
                  <>
                    <li aria-hidden="true">›</li>
                    <li>
                      <Link
                        href={`/categories/${category.slug}`}
                        className="hover:text-foreground"
                      >
                        {category.name}
                      </Link>
                    </li>
                  </>
                )}
                <li aria-hidden="true">›</li>
                <li className="text-foreground" aria-current="page">
                  {product.name}
                </li>
              </ol>
            </nav>
          </Container>
        </Section>

        {/* Product Details */}
        <Section className="py-8 md:py-12">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Product Images */}
              <div className="space-y-4">
                {primaryImage && (
                  <div className="relative aspect-square bg-neutral-100 rounded-lg overflow-hidden">
                    <Image
                      src={primaryImage.url}
                      alt={primaryImage.alt || product.name}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      quality={90}
                    />
                    {product.discountPrice && (
                      <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded text-body-sm font-medium">
                        {product.discountPercent
                          ? `${product.discountPercent}% OFF`
                          : "Sale"}
                      </div>
                    )}
                  </div>
                )}

                {otherImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-4">
                    {otherImages.slice(0, 4).map((image, index) => (
                      <div
                        key={index}
                        className="relative aspect-square bg-neutral-100 rounded-lg overflow-hidden"
                      >
                        <Image
                          src={image.url}
                          alt={image.alt || `${product.name} ${index + 2}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 25vw, 12.5vw"
                          loading="lazy"
                          quality={85}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Information */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-h1 font-bold text-foreground mb-2">
                    {product.name}
                  </h1>
                  {category && (
                    <Link
                      href={`/categories/${category.slug}`}
                      className="text-body-sm text-foreground-secondary hover:text-foreground"
                    >
                      {category.name}
                    </Link>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-h2 font-bold text-foreground">
                    $
                    {typeof displayPrice === "number"
                      ? displayPrice.toFixed(2)
                      : "0.00"}
                  </span>
                  {originalPrice && typeof originalPrice === "number" && (
                    <span className="text-body-lg text-foreground-secondary line-through">
                      ${originalPrice.toFixed(2)}
                    </span>
                  )}
                  {product.discountPercent && (
                    <span className="text-body-sm text-primary font-medium">
                      {product.discountPercent}% OFF
                    </span>
                  )}
                </div>

                {product.shortDescription && (
                  <p className="text-body-lg text-foreground-secondary">
                    {product.shortDescription}
                  </p>
                )}

                {product.description && (
                  <div className="prose max-w-none">
                    <p className="text-body-md text-foreground-secondary whitespace-pre-line">
                      {product.description}
                    </p>
                  </div>
                )}

                {product.attributes && product.attributes.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-body-md font-semibold text-foreground">
                      Details
                    </h3>
                    <ul className="space-y-1">
                      {product.attributes.map((attr, index) => (
                        <li
                          key={index}
                          className="text-body-sm text-foreground-secondary"
                        >
                          <span className="font-medium">{attr.name}:</span>{" "}
                          {attr.value}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-4 border-t border-neutral-200">
                  <Button size="lg" className="w-full sm:w-auto">
                    Add to Cart
                  </Button>
                </div>

                {/* Product Features */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-neutral-200">
                  <div className="text-center">
                    <div className="text-body-sm font-medium text-foreground mb-1">
                      Fast & Free Delivery
                    </div>
                    <div className="text-body-xs text-foreground-secondary">
                      Orders above $200
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-body-sm font-medium text-foreground mb-1">
                      30 Day Guarantee
                    </div>
                    <div className="text-body-xs text-foreground-secondary">
                      Money-back guarantee
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-body-sm font-medium text-foreground mb-1">
                      Secure Payments
                    </div>
                    <div className="text-body-xs text-foreground-secondary">
                      Secured by Stripe
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <Section className="bg-neutral-50 py-12">
            <Container>
              <div className="mb-8">
                <h2 className="text-h2 font-bold text-foreground mb-2">
                  You might also like
                </h2>
                <Link
                  href="/products"
                  className="text-body-md text-foreground-secondary hover:text-foreground"
                >
                  View all products
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard
                    key={relatedProduct.id}
                    product={relatedProduct}
                  />
                ))}
              </div>
            </Container>
          </Section>
        )}
      </main>
    </>
  );
}
