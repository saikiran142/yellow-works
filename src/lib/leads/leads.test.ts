import { describe, expect, it } from "vitest";

import { csvCell, leadsToCsv } from "@/lib/admin/csv";
import type { Lead } from "@/lib/db/types";

import { demoToNewLead, scanToNewLead } from "./map";
import { demoLeadSchema, maskPhone, normaliseIndianMobile, scanLeadSchema } from "./schema";

const demo = {
  kind: "demo" as const,
  idempotencyKey: "key-12345678",
  name: "Test Owner",
  business: "Test Clinic",
  industry: "clinic" as const,
  channel: "whatsapp" as const,
  headache: "slow-replies" as const,
  whatsapp: "+91 98765 43210",
  preferredTime: "evening" as const,
  consent: true as const,
  attribution: { source: "instagram", campaign: "launch" },
};

describe("phone", () => {
  it("normalises Indian mobiles", () => {
    expect(normaliseIndianMobile("98765 43210")).toBe("+919876543210");
    expect(normaliseIndianMobile("+91-98765-43210")).toBe("+919876543210");
    expect(normaliseIndianMobile("09876543210")).toBe("+919876543210");
    expect(normaliseIndianMobile("12345")).toBeNull();
    expect(normaliseIndianMobile("5876543210")).toBeNull();
  });
  it("masks all but the last 4", () => {
    expect(maskPhone("+919876543210")).toMatch(/^•+3210$/);
  });
});

describe("demo lead", () => {
  it("accepts a valid request and maps UTM fields", () => {
    const p = demoLeadSchema.safeParse(demo);
    expect(p.success).toBe(true);
    const n = demoToNewLead(demo);
    expect(n.whatsapp).toBe("+919876543210");
    expect(n.source).toBe("instagram");
    expect(n.campaign).toBe("launch");
  });
  it("requires consent and a valid number", () => {
    expect(demoLeadSchema.safeParse({ ...demo, consent: false }).success).toBe(false);
    expect(demoLeadSchema.safeParse({ ...demo, whatsapp: "123" }).success).toBe(false);
  });
  it("defaults source to direct without attribution", () => {
    expect(demoToNewLead({ ...demo, attribution: undefined }).source).toBe("direct");
  });
});

describe("scan lead", () => {
  const answers = { sources: ["google" as const], speed: "same-day" as const, tools: ["none" as const], headache: "slow-replies" as const, monthlyEnquiries: 50, avgValue: 1000 };
  const scan = { kind: "scan" as const, idempotencyKey: "key-87654321", name: "Owner", delivery: "email" as const, email: "a@b.co", consent: true as const, answers };
  it("needs the contact for the chosen delivery", () => {
    expect(scanLeadSchema.safeParse(scan).success).toBe(true);
    expect(scanLeadSchema.safeParse({ ...scan, email: "" }).success).toBe(false);
    expect(scanLeadSchema.safeParse({ ...scan, delivery: "whatsapp" }).success).toBe(false);
  });
  it("recomputes the score server-side", () => {
    const n = scanToNewLead(scanLeadSchema.parse(scan));
    expect(typeof n.score).toBe("number");
    expect(JSON.parse(n.scan ?? "{}").valueAtRiskMonthly).toBe(15000);
  });
});

describe("csv", () => {
  it("neutralises formula injection and escapes quotes", () => {
    expect(csvCell("=HYPERLINK(1)")).toBe(`"'=HYPERLINK(1)"`);
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell(null)).toBe('""');
    expect(csvCell("+919876543210")).toBe('"+919876543210"');
    expect(csvCell("+1+2")).toBe(`"'+1+2"`);
  });
  it("emits a header and one row per lead", () => {
    const lead = { id: "1", createdAt: "2026-01-01", kind: "demo", status: "new", name: "+evil", notes: "", whatsapp: "+919876543210" } as unknown as Lead;
    const rows = leadsToCsv([lead]).split("\r\n");
    expect(rows).toHaveLength(2);
    expect(rows[1]).toContain(`"'+evil"`);
  });
});
