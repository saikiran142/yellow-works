import type { Metadata } from "next";

import { pageMeta } from "@/lib/seo";
import { GrowthScan } from "@/components/forms/growth-scan";
import { Container, Shell } from "@/components/site/shell";
import { SITE } from "@/content/site";

export const metadata: Metadata = pageMeta({ title: "Free Growth Scan", description: "A two-minute quiz. See your score, what slow replies may be costing you, and the three services that fit best.", path: "/growth-scan" });

export default function GrowthScanPage(): React.JSX.Element {
  return (
    <Shell>
      <Container className="max-w-3xl pt-16">
        <p className="mono mb-3 text-muted">Two minutes · free</p>
        <h1 className="mb-4 text-[length:var(--fs-h1)]">
          Your free <span className="em-serif">Growth Scan.</span>
        </h1>
        <p className="mb-10 text-muted">Answer six questions. You get a score, an estimate of the enquiry value at risk using your own numbers, and the three services that fit best. The formula is shown, so you can check it.</p>
        <GrowthScan whatsappNumber={SITE.whatsapp.value.replace(/\D/g, "") || "number"} />
      </Container>
    </Shell>
  );
}
