import { describe, expect, it } from "vitest";

import { AD_LEADS, autopilotRequest, buildAutopilot, scoreEnquiry } from "./engine";

describe("scoreEnquiry", () => {
  it("scores a specific booking enquiry as Hot and explains why", () => {
    const r = scoreEnquiry("Need a table for 6 on Saturday night. Is it available? Urgent.");
    expect(r.tier).toBe("Hot");
    expect(r.factors.length).toBeGreaterThan(2);
  });
  it("scores a vague message low", () => {
    const r = scoreEnquiry("hi");
    expect(r.tier).toBe("Cool");
    expect(r.score).toBeLessThan(55);
  });
  it("stays within 5..99", () => {
    expect(scoreEnquiry("book visit price urgent today 5 lakh 3 slots").score).toBeLessThanOrEqual(99);
  });
});

describe("buildAutopilot", () => {
  it("produces matching autopilot and manual illustrations with a reply under 5 s", () => {
    const r = buildAutopilot({ text: AD_LEADS.clinic, businessType: "clinic", source: "ad" });
    expect(r.auto.steps).toHaveLength(7);
    expect(r.manual.steps).toHaveLength(7);
    expect(r.auto.firstReplyMs).toBeLessThan(5000);
    expect(r.previews.followups.map((f) => f.day)).toEqual(["Day 1", "Day 3", "Day 7"]);
    expect(r.previews.whatsapp).toContain("Sunrise Dental");
  });
  it("matches a service and quotes its price", () => {
    const r = buildAutopilot({ text: "How much is teeth cleaning?", businessType: "clinic", source: "form" });
    expect(r.enrichment.service).toBe("Teeth cleaning");
    expect(r.previews.whatsapp).toContain("₹1,200");
  });
  it("uses the personalised business name", () => {
    const r = buildAutopilot({ text: "price?", businessType: "store", businessName: "Raju Mobiles", source: "form" });
    expect(r.previews.whatsapp).toContain("Raju Mobiles");
  });
});

describe("autopilotRequest", () => {
  it("rejects over-long and empty input", () => {
    const base = { businessType: "clinic", source: "form", sessionId: "session-12345" };
    expect(autopilotRequest.safeParse({ ...base, text: "x".repeat(301) }).success).toBe(false);
    expect(autopilotRequest.safeParse({ ...base, text: " " }).success).toBe(false);
    expect(autopilotRequest.safeParse({ ...base, text: "Price for cleaning?" }).success).toBe(true);
  });
});
