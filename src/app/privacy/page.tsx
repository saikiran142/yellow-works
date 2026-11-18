import type { Metadata } from "next";

import { pageMeta } from "@/lib/seo";
import { LegalPage } from "@/components/site/legal-page";
import { PRIVACY } from "@/content/legal";

export const metadata: Metadata = pageMeta({ title: "Privacy policy", description: "What we collect, what we do not store, and your rights.", path: "/privacy" });

export default function PrivacyPage(): React.JSX.Element {
  return <LegalPage title="Privacy policy" sections={PRIVACY} />;
}
