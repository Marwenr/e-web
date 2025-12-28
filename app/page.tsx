import { Button, Container, Section } from '@/components/ui';

export default function Home() {
  return (
    <Section>
      <Container>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-display-md font-bold text-foreground">
              E-commerce Project
            </h1>
            <p className="text-body-lg text-foreground-secondary max-w-2xl">
              Clean, scalable foundation ready for development.
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}