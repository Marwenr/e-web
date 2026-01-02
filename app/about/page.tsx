import { Metadata } from "next";
import { Container, Section } from "@/components/ui";
import { HeroSection } from "@/components/hero";

export const metadata: Metadata = {
  title: "About Us - MeubleTN",
  description:
    "Since 1963, we've pioneered the creation of beautiful clothing and footwear for all the family. Discover our story and mission.",
  keywords: [
    "MeubleTN",
    "about",
    "fashion",
    "clothing",
    "story",
    "mission",
    "since 1963",
  ],
  openGraph: {
    title: "About Us - MeubleTN",
    description:
      "Since 1963, we've pioneered the creation of beautiful clothing and footwear for all the family.",
    type: "website",
    url: process.env.NEXT_PUBLIC_BASE_URL
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/about`
      : "https://meubletn.com/about",
  },
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <main>
      {/* Hero Section */}
      <HeroSection
        backgroundImage="/landing2.webp"
        title="A story about two lovers"
        description="Since 1963, we've pioneered the creation of beautiful clothing and footwear for all the family."
      />

      {/* Brand Name Section */}
      <Section>
        <Container>
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-h1 font-bold text-foreground mb-8">MeubleTN</h2>
            <p className="text-h3 md:text-h2 font-medium text-foreground-secondary max-w-3xl mx-auto">
              Our prime aim: to conceive commodities that will delight you and
              accompany you for numerous years.
            </p>
          </div>
        </Container>
      </Section>

      {/* Who We Are Section */}
      <Section variant="muted">
        <Container>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Image 1 - Left */}
              <div className="order-2 lg:order-1">
                <div className="relative w-full aspect-[4/5] bg-neutral-200 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                    <div className="text-center p-8">
                      <div className="w-32 h-32 mx-auto mb-4 bg-neutral-300 rounded-full flex items-center justify-center">
                        <svg
                          className="w-16 h-16 text-neutral-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <p className="text-body text-foreground-secondary">
                        Our Story
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Content - Right */}
              <div className="order-1 lg:order-2">
                <h3 className="text-h2 font-bold text-foreground mb-6">
                  Who we are?
                </h3>
                <div className="space-y-4 text-body-lg text-foreground-secondary">
                  <p>
                    We are committed to creating exceptional e-commerce
                    experiences through thoughtful design and meticulous
                    attention to detail. Our template is crafted to empower
                    businesses with a platform that not only looks beautiful but
                    also performs seamlessly.
                  </p>
                  <p>
                    Our mission extends beyond just selling products. We aim to
                    create lasting relationships with our customers by
                    delivering quality items that become cherished parts of
                    their lives. Every piece we create is designed with care,
                    ensuring it will bring joy and serve you well for years to
                    come.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Image Gallery Section */}
      <Section>
        <Container>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Image 2 */}
              <div className="relative w-full aspect-square bg-neutral-200 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                  <div className="text-center p-8">
                    <div className="w-24 h-24 mx-auto mb-4 bg-neutral-300 rounded-full flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-neutral-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-body text-foreground-secondary">LOVE</p>
                  </div>
                </div>
              </div>

              {/* Image 3 */}
              <div className="relative w-full aspect-square bg-neutral-200 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                  <div className="text-center p-8">
                    <div className="w-24 h-24 mx-auto mb-4 bg-neutral-300 rounded-full flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-neutral-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        />
                      </svg>
                    </div>
                    <p className="text-body text-foreground-secondary">
                      Quality & Craft
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
