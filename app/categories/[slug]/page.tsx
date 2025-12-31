import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container, Section } from '@/components/ui';
import { ProductGrid } from '@/components/product';
import { getProducts } from '@/lib/api/product';

interface CategoryPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    page?: string;
    limit?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

// Note: You'll need to implement getCategoryBySlug or get category info from products
// For now, this is a simplified version
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  return {
    title: `${params.slug.charAt(0).toUpperCase() + params.slug.slice(1)} - MeubleTN`,
    description: `Browse products in ${params.slug} category at MeubleTN`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  // For now, we'll filter by category name/slug
  // In a full implementation, you'd fetch the category first to get its ID
  // This is a simplified version - you'd need a Category API endpoint
  
  const params_parsed = {
    page: searchParams.page ? parseInt(searchParams.page, 10) : 1,
    limit: searchParams.limit ? parseInt(searchParams.limit, 10) : 12,
    minPrice: searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined,
    // categoryId would be fetched from category slug
    // For now, we'll show all products and filter client-side or via a category service
  };

  let products;
  try {
    products = await getProducts(params_parsed);
    // Filter by category slug if you have category information in products
    // This is a simplified version - ideally you'd pass categoryId to the API
  } catch (error) {
    products = { data: [], meta: { page: 1, limit: 12, total: 0, totalPages: 0 } };
  }

  const categoryName = params.slug.charAt(0).toUpperCase() + params.slug.slice(1).replace(/-/g, ' ');

  return (
    <main>
      <Section className="bg-neutral-50 py-8 md:py-12">
        <Container>
          <div className="mb-8">
            <h1 className="text-h1 font-bold text-foreground mb-2">{categoryName}</h1>
            <p className="text-body-md text-foreground-secondary">
              Browse our {categoryName.toLowerCase()} collection
            </p>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <ProductGrid products={products.data} />
          
          {products.meta.total > 0 && (
            <div className="text-center text-body-sm text-foreground-secondary pt-8">
              Showing {products.data.length} of {products.meta.total} products
            </div>
          )}
        </Container>
      </Section>
    </main>
  );
}

