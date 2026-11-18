import type { Metadata } from "next";

import { pageMeta } from "@/lib/seo";
import { BookDemoForm } from "@/components/forms/book-demo-form";
import { Container, Shell } from "@/components/site/shell";
import { SITE } from "@/content/site";

export const metadata: Metadata = pageMeta({ title: "Book a personalised demo", description: "Tell us about your business in a minute. We will show you the assistant answering as your business, free.", path: "/book-a-demo" });

export default function BookDemoPage(): React.JSX.Element {
  return (
    <Shell>
      <Container className="max-w-2xl pt-16">
        <p className="mono mb-3 text-muted">About a minute</p>
        <h1 className="mb-4 text-[length:var(--fs-h1)]">
          Book a <span className="em-serif">personalised demo.</span>
        </h1>
        <p className="mb-10 text-muted">Six quick questions. We will set up the assistant with your business details and show it to you, free.</p>
        <BookDemoForm whatsappNumber={SITE.whatsapp.value.replace(/\D/g, "") || "number"} calendarUrl={process.env.NEXT_PUBLIC_CALENDAR_URL} />
      </Container>
    </Shell>
  );
}
