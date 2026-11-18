import { describe, expect, it } from "vitest";

import { greeting, resolveBusiness, scriptedReply } from "./scripted";
import type { ChatMessage, Lang } from "./types";

const biz = resolveBusiness("clinic");

function run(texts: string[], lang: Lang = "en"): ReturnType<typeof scriptedReply> {
  const messages: ChatMessage[] = [{ role: "assistant", text: greeting(biz, lang), intent: "greeting" }];
  let last = scriptedReply({ businessType: "clinic", lang, messages });
  for (const t of texts) {
    messages.push({ role: "user", text: t });
    last = scriptedReply({ businessType: "clinic", lang, messages });
    messages.push({ role: "assistant", text: last.reply, intent: last.intent });
  }
  return last;
}

describe("scripted front desk", () => {
  it("identifies as automated in the greeting", () => {
    expect(greeting(biz, "en").toLowerCase()).toContain("automated assistant");
  });
  it("answers price from business knowledge", () => {
    const r = run(["What are your prices?"]);
    expect(r.intent).toBe("price");
    expect(r.reply).toContain("₹500");
  });
  it("books a slot and then captures the name", () => {
    expect(run(["I want to book"]).intent).toBe("booking_ask");
    const booked = run(["I want to book", "Sat 5:00 pm"]);
    expect(booked.intent).toBe("booked");
    expect(booked.appointment?.day).toBe("sat");
    const named = run(["I want to book", "Sat 5:00 pm", "Ravi"]);
    expect(named.intent).toBe("lead_captured");
    expect(named.lead?.name).toBe("Ravi");
  });
  it("rejects an unavailable slot", () => {
    expect(run(["book Tue 3pm"]).intent).toBe("slot_unavailable");
  });
  it("hands over emergencies and complaints", () => {
    expect(run(["there is bleeding, emergency"]).handover?.reason).toBe("urgent");
    expect(run(["I want a refund, worst service"]).handover?.reason).toBe("complaint");
  });
  it("declines advice and off-topic questions", () => {
    expect(run(["what medicine should I take"]).intent).toBe("declined_advice");
    expect(run(["tell me a joke"]).intent).toBe("declined_offtopic");
  });
  it("says when unsure and hands over", () => {
    const r = run(["do you have a parking lot for trucks"]);
    expect(r.intent).toBe("unsure");
    expect(r.handover?.reason).toBe("unsure");
  });
  it("works in Telugu and Hindi", () => {
    expect(run(["ధర ఎంత?"], "te").intent).toBe("price");
    expect(run(["कीमत क्या है?"], "hi").intent).toBe("price");
    expect(run(["बुक करना है", "शनि 5:00 pm"], "hi").intent).toBe("booked");
  });
});
