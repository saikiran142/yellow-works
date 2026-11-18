import type { Metadata } from "next";

import { pageMeta } from "@/lib/seo";
import { LegalPage } from "@/components/site/legal-page";
import { TERMS } from "@/content/legal";

export const metadata: Metadata = pageMeta({ title: "Terms", description: "Terms for using this website, the demos and the Growth Scan.", path: "/terms" });

export default function TermsPage(): React.JSX.Element {
  return <LegalPage title="Terms" sections={TERMS} />;
}
