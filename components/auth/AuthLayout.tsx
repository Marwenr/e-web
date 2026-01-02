import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui';

export interface AuthLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  footerLinks?: {
    text: string;
    href: string;
    label: string;
  }[];
}

export default function AuthLayout({
  title,
  description,
  children,
  footerLinks = [],
}: AuthLayoutProps) {
  return (
    <div className="w-full">
      {/* Card Container */}
      <Card variant="elevated">
        {/* Page Title */}
        <div className="px-4 pt-6 pb-4 sm:px-6">
          <h1 className="text-h4 sm:text-h3 font-bold text-foreground mb-2">
            {title}
          </h1>
          {description && (
            <p className="text-body-sm text-foreground-secondary">
              {description}
            </p>
          )}
        </div>

        {/* Form Container */}
        <CardContent className="px-4 sm:px-6">
          {children}
        </CardContent>

        {/* Footer Links */}
        {footerLinks.length > 0 && (
          <CardFooter className="flex flex-col items-center space-y-3 px-4 pb-6 pt-0 sm:px-6">
            {footerLinks.map((link, index) => {
              // Parse text to extract prefix and link text (format: "prefix? linkText" or "prefix: linkText")
              const match = link.text.match(/^(.+?)(\?|:)\s*(.+)$/);
              if (match) {
                const [, prefix, separator, linkText] = match;
                return (
                  <div
                    key={index}
                    className="text-center text-body-sm text-foreground-secondary"
                  >
                    {prefix}
                    {separator}{' '}
                    <Link
                      href={link.href}
                      className="text-primary-900 hover:text-primary-800 font-medium transition-colors"
                      aria-label={link.label}
                    >
                      {linkText}
                    </Link>
                  </div>
                );
              }
              // Simple link without prefix
              return (
                <div
                  key={index}
                  className="text-center text-body-sm text-foreground-secondary"
                >
                  <Link
                    href={link.href}
                    className="text-primary-900 hover:text-primary-800 font-medium transition-colors"
                    aria-label={link.label}
                  >
                    {link.text}
                  </Link>
                </div>
              );
            })}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

