import { Container, Shell } from "@/components/site/shell";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound(): React.JSX.Element {
  return (
    <Shell>
      <Container className="flex min-h-[60vh] flex-col items-start justify-center gap-5">
        <p className="mono text-muted">404</p>
        <h1 className="text-[length:var(--fs-h1)]">We could not find <span className="em-serif">that page.</span></h1>
        <p className="text-muted">The link may be old. Here are the useful places to go.</p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/">Home</ButtonLink>
          <ButtonLink href="/services" variant="secondary">Services</ButtonLink>
          <ButtonLink href="/book-a-demo" variant="secondary">Book a demo</ButtonLink>
        </div>
      </Container>
    </Shell>
  );
}
