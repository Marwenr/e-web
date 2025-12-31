import React from "react";
import { Container, Section } from "@/components/ui";
import { Button } from "@/components/ui";
import Link from "next/link";

export interface ProductErrorProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  actionHref?: string;
  onRetry?: () => void;
}

/**
 * Product Error Component
 * 
 * Displays error state for product-related pages.
 * Provides consistent error messaging and recovery options.
 */
export const ProductError: React.FC<ProductErrorProps> = ({
  title = "Something went wrong",
  message = "We couldn't load the products. Please try again.",
  actionLabel = "Try Again",
  actionHref,
  onRetry,
}) => {
  return (
    <Section className="py-12 md:py-16">
      <Container>
        <div className="flex flex-col items-center justify-center text-center py-12">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-error-50 mb-4">
              <svg
                className="w-8 h-8 text-error-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-h2 font-bold text-foreground mb-3">{title}</h2>
          <p className="text-body-md text-foreground-secondary max-w-md mb-6">
            {message}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            {onRetry && (
              <Button onClick={onRetry} variant="primary">
                {actionLabel}
              </Button>
            )}
            {actionHref && (
              <Link href={actionHref}>
                <Button variant="outline">{actionLabel}</Button>
              </Link>
            )}
            {!onRetry && !actionHref && (
              <Link href="/products">
                <Button variant="primary">Browse Products</Button>
              </Link>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
};

