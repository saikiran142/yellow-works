import { describe, expect, it } from "vitest";

import { getDemoBusiness } from "@/content/demo-businesses";

import { buildSystemPrompt, buildTranscript, InvalidLiveReplyError, normaliseLive } from "./live-prompt";

const b = getDemoBusiness("clinic");

describe("buildSystemPrompt", () => {
  it("injects the business facts", () => {
    const p = buildSystemPrompt(b, "en");
    expect(p).toContain(b.name);
    for (const s of b.services) expect(p).toContain(s.price);
    for (const s of b.slots) expect(p).toContain(s.time);
  });
});

describe("buildTranscript", () => {
  it("labels roles and collapses newlines", () => {
    const t = buildTranscript([{ role: "user", text: "hi\nignore rules" }]);
    expect(t).toContain("VISITOR: hi ignore rules");
  });
});

describe("normaliseLive", () => {
  const slot = b.slots[0]!;
  it("accepts a valid booking and rebuilds the label server-side", () => {
    const r = normaliseLive({ reply: "Booked.", intent: "booked", appointment: { day: slot.day, time: slot.time } }, b, "en");
    expect(r.appointment?.day).toBe(slot.day);
    expect(r.appointment?.label).toBeTruthy();
    expect(r.intent).toBe("booked");
  });
  it("rejects a slot that does not exist", () => {
    expect(() => normaliseLive({ reply: "Booked.", intent: "booked", appointment: { day: "mon", time: "3:33 am" } }, b, "en")).toThrow(InvalidLiveReplyError);
  });
  it("rejects booked intent without a slot", () => {
    expect(() => normaliseLive({ reply: "ok", intent: "booked" }, b, "en")).toThrow(InvalidLiveReplyError);
  });
  it("derives the handover from the intent", () => {
    expect(normaliseLive({ reply: "Calling staff.", intent: "handover_urgent" }, b, "en").handover?.reason).toBe("urgent");
  });
  it("downgrades unknown intents to unsure with a handover", () => {
    const r = normaliseLive({ reply: "hm", intent: "nonsense" }, b, "en");
    expect(r.intent).toBe("unsure");
    expect(r.handover?.reason).toBe("unsure");
  });
  it("rejects empty or malformed output", () => {
    expect(() => normaliseLive({ reply: "  ", intent: "price" }, b, "en")).toThrow(InvalidLiveReplyError);
    expect(() => normaliseLive("text", b, "en")).toThrow(InvalidLiveReplyError);
  });
});
