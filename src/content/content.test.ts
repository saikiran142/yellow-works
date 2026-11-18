import { describe, expect, it } from "vitest";

import { DEMO_BUSINESSES } from "./demo-businesses";
import { INDUSTRIES } from "./industries";
import { PACKAGES } from "./packages";
import { SERVICES } from "./services";

const ids = new Set(SERVICES.map((s) => s.id));

describe("content integrity", () => {
  it("service ids are unique", () => expect(ids.size).toBe(SERVICES.length));
  it("package services all exist, and each service is in at most one package", () => {
    const seen = new Set<string>();
    for (const p of PACKAGES) for (const id of p.services) {
      expect(ids.has(id), `${p.id} -> ${id}`).toBe(true);
      expect(seen.has(id), `duplicate ${id}`).toBe(false);
      seen.add(id);
    }
    PACKAGES.forEach((p) => p.includes && expect(PACKAGES.some((q) => q.id === p.includes)).toBe(true));
  });
  it("industries reference real services and have a demo business", () => {
    for (const i of INDUSTRIES) {
      i.services.forEach((id) => expect(ids.has(id), `${i.slug} -> ${id}`).toBe(true));
      expect(DEMO_BUSINESSES.some((b) => b.type === i.slug)).toBe(true);
    }
  });
  it("every package price starts unconfirmed, so nothing unapproved renders as final", () => {
    PACKAGES.forEach((p) => {
      expect(p.setup.confirmed).toBe(false);
      if (p.monthly) expect(p.monthly.confirmed).toBe(false);
    });
  });
});
