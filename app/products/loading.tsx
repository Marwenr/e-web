import { Container, Section } from "@/components/ui";
import { ProductGridSkeleton } from "@/components/skeleton";

export default function ProductsLoading() {
  return (
    <main>
      <Section className="bg-neutral-50 py-8 md:py-12">
        <Container>
          <div className="mb-8">
            <div className="h-10 w-64 bg-neutral-200 rounded mb-2 animate-pulse" />
            <div className="h-6 w-96 bg-neutral-200 rounded animate-pulse" />
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <ProductGridSkeleton count={12} />
        </Container>
      </Section>
    </main>
  );
}

