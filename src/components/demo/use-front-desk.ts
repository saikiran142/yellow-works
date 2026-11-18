"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { usePersona } from "@/components/persona-context";
import { track } from "@/lib/analytics";
import { greeting, resolveBusiness, scriptedReply } from "@/lib/demo/scripted";
import { chatResult, MAX_INPUT_CHARS, MAX_USER_MESSAGES, type BusinessType, type ChatMessage, type ChatResult, type Lang } from "@/lib/demo/types";

export interface UiMessage extends ChatMessage {
  id: number;
}

export type LeadStatus = "replying" | "new" | "booked" | "needs_staff";

export interface Lead {
  name: string;
  interest: string;
  status: LeadStatus;
  handoverReason?: "urgent" | "complaint" | "unsure";
  time: string;
}

export interface Appointment {
  day: string;
  time: string;
  label: string;
}

const AFTER_HOURS = "9:42 pm";
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const newSession = (): string => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `s-${Math.random().toString(36).slice(2)}-${Date.now()}`);

async function readStream(res: Response, onDelta: (t: string) => void): Promise<ChatResult> {
  if (!res.body) throw new Error("no stream");
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let final: ChatResult | null = null;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i: number;
    while ((i = buf.indexOf("\n")) >= 0) {
      const raw = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (!raw) continue;
      const evt = JSON.parse(raw) as { t: string; text?: string; result?: unknown };
      if (evt.t === "delta" && evt.text) onDelta(evt.text);
      if (evt.t === "final") final = chatResult.parse(evt.result);
    }
  }
  if (!final) throw new Error("stream ended without a result");
  return final;
}

export function useFrontDesk(defaultType: BusinessType = "clinic") {
  const { persona } = usePersona();
  const [type, setType] = useState<BusinessType>(defaultType);
  const [lang, setLang] = useState<Lang>("en");
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [repliedMs, setRepliedMs] = useState<number | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const session = useRef(newSession());
  const nextId = useRef(1);
  const started = useRef(false);
  const completed = useRef(false);

  // The personalised hero overrides the name only for its own business type.
  const nameOverride = persona && persona.type === type ? persona.businessName : undefined;
  const business = useMemo(() => resolveBusiness(type, nameOverride), [type, nameOverride]);
  const userCount = messages.filter((m) => m.role === "user").length;
  const capped = userCount >= MAX_USER_MESSAGES;

  const reset = useCallback(
    (t: BusinessType, l: Lang, name?: string) => {
      session.current = newSession();
      nextId.current = 2;
      started.current = false;
      completed.current = false;
      setMessages([{ id: 1, role: "assistant", text: greeting(resolveBusiness(t, name), l), intent: "greeting" }]);
      setPending(false);
      setRepliedMs(null);
      setLead(null);
      setAppointment(null);
      setSuggestions(null);
      setDemoMode(false);
      setNotice(null);
    },
    [],
  );

  // Initial greeting, and follow the personalised hero when it arrives.
  useEffect(() => {
    if (persona) setType(persona.type);
  }, [persona]);

  useEffect(() => {
    reset(type, lang, nameOverride);
    // Greeting must reflect type / name; language changes are handled separately below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, nameOverride, reset]);

  const changeType = useCallback((t: BusinessType) => {
    if (t === type) return;
    track("industry_switched", { to: t });
    setType(t);
  }, [type]);

  const changeLang = useCallback(
    (l: Lang) => {
      setLang(l);
      // Before the visitor has said anything, re-issue the greeting in the new language.
      if (messages.length <= 1) setMessages([{ id: 1, role: "assistant", text: greeting(business, l), intent: "greeting" }]);
    },
    [messages.length, business],
  );

  const applyResult = useCallback((result: ChatResult, elapsed: number | null, fallbackNow: string) => {
    if (elapsed !== null) setRepliedMs((prev) => prev ?? elapsed);
    setSuggestions(result.suggestions ?? null);
    if (result.appointment) setAppointment(result.appointment);
    setLead((prev) => {
      const base: Lead = prev ?? { name: "New visitor", interest: "Enquiry", status: "new", time: fallbackNow };
      const status: LeadStatus = result.handover ? "needs_staff" : result.appointment || base.status === "booked" || result.intent === "lead_captured" ? "booked" : "new";
      return {
        ...base,
        name: result.lead?.name ?? base.name,
        interest: result.lead?.interest ?? base.interest,
        status: base.status === "needs_staff" && !result.handover ? "needs_staff" : status,
        handoverReason: result.handover?.reason ?? base.handoverReason,
      };
    });
    if ((result.appointment || result.handover) && !completed.current) {
      completed.current = true;
      track("demo_completed", { intent: result.intent });
    }
  }, []);

  const send = useCallback(
    async (raw: string): Promise<void> => {
      const text = raw.trim().slice(0, MAX_INPUT_CHARS);
      if (!text || pending || capped) return;
      if (!started.current) {
        started.current = true;
        track("demo_started", { type });
      }
      const history: ChatMessage[] = [...messages.map(({ role, text: t, intent }) => ({ role, text: t, intent })), { role: "user", text }];
      const userMsg: UiMessage = { id: nextId.current++, role: "user", text };
      const botId = nextId.current++;
      setMessages((m) => [...m, userMsg]);
      setSuggestions(null);
      setPending(true);
      setNotice(null);
      // Optimistic: the lead row appears the moment the visitor sends.
      const now = AFTER_HOURS;
      setLead((l) => l ?? { name: "New visitor", interest: "Replying…", status: "replying", time: now });

      const t0 = performance.now();
      let firstDelta: number | null = null;
      let acc = "";
      const showDelta = (d: string): void => {
        firstDelta ??= performance.now() - t0;
        acc += d;
        setMessages((m) => (m.some((x) => x.id === botId) ? m.map((x) => (x.id === botId ? { ...x, text: acc } : x)) : [...m, { id: botId, role: "assistant", text: acc }]));
      };

      let result: ChatResult;
      try {
        const res = await fetch("/api/demo/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ businessType: type, businessName: nameOverride, lang, sessionId: session.current, messages: history }),
        });
        if (!res.ok) throw new Error(String(res.status));
        result = await readStream(res, showDelta);
      } catch {
        // Scripted fallback in the browser: the demo never appears broken.
        setDemoMode(true);
        setNotice("Live replies are busy, so this is a scripted example.");
        await sleep(500);
        result = scriptedReply({ businessType: type, businessName: nameOverride, lang, messages: history });
        acc = "";
        for (const w of result.reply.split(/(?<=\s)/u)) {
          showDelta(w);
          await sleep(25);
        }
      }

      setMessages((m) => m.map((x) => (x.id === botId ? { ...x, text: result.reply, intent: result.intent } : x)));
      applyResult(result, firstDelta === null ? null : firstDelta, now);
      setPending(false);
    },
    [messages, pending, capped, type, lang, nameOverride, applyResult],
  );

  return { type, lang, business, messages, pending, repliedMs, lead, appointment, suggestions, demoMode, notice, capped, userCount, changeType, changeLang, send, restart: () => reset(type, lang, nameOverride) };
}
