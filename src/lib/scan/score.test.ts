import { describe, expect, it } from "vitest";

import { recommendServices, scanAnswers, scoreScan, valueAtRisk, type ScanAnswers } from "./score";

const slow: ScanAnswers = { sources: ["google"], speed: "next-day-or-later", tools: ["none"], headache: "slow-replies", monthlyEnquiries: 100, avgValue: 2000 };
const strong: ScanAnswers = { sources: ["google", "instagram", "whatsapp", "referrals", "website"], speed: "under-5-min", tools: ["crm", "chatbot", "booking-software"], headache: "few-reviews", monthlyEnquiries: 100, avgValue: 2000 };

describe("scoreScan", () => {
  it("rewards fast replies and systems", () => {
    expect(scoreScan(strong).total).toBeGreaterThan(scoreScan(slow).total);
    expect(scoreScan(strong).total).toBe(100);
  });
  it("parts sum to total and stay within max", () => {
    const s = scoreScan(slow);
    expect(s.parts.reduce((a, p) => a + p.points, 0)).toBe(s.total);
    s.parts.forEach((p) => expect(p.points).toBeLessThanOrEqual(p.max));
  });
});

describe("valueAtRisk", () => {
  it("applies the formula to the visitor's numbers", () => {
    const v = valueAtRisk(slow);
    expect(v.monthly).toBe(Math.round((100 * 45 * 2000) / 100));
    expect(v.formula).toContain("100 enquiries × 45% × ₹2,000 = ₹90,000");
  });
  it("respects an overridden assumption and clamps it", () => {
    expect(valueAtRisk(slow, 10).monthly).toBe(20000);
    expect(valueAtRisk(slow, 500).pct).toBe(100);
  });
  it("is zero with no enquiries", () => {
    expect(valueAtRisk({ ...slow, monthlyEnquiries: 0 }).monthly).toBe(0);
  });
});

describe("recommendServices", () => {
  it("returns three distinct services that match the headache", () => {
    const r = recommendServices(slow);
    expect(r).toHaveLength(3);
    expect(new Set(r.map((s) => s.id)).size).toBe(3);
    expect(r.map((s) => s.id)).toContain("whatsapp-assistant");
  });
  it("suggests booking for no-shows", () => {
    expect(recommendServices({ ...strong, headache: "no-shows" }).map((s) => s.id)).toContain("booking");
  });
});

describe("scanAnswers", () => {
  it("rejects out-of-range numbers", () => {
    expect(scanAnswers.safeParse({ ...slow, monthlyEnquiries: -1 }).success).toBe(false);
    expect(scanAnswers.safeParse({ ...slow, avgValue: 99_999_999 }).success).toBe(false);
  });
});
