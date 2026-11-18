"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import type { Personalisation } from "@/lib/personalise/rules";

interface PersonaCtx {
  persona: Personalisation | null;
  setPersona: (p: Personalisation | null) => void;
}

const Ctx = createContext<PersonaCtx>({ persona: null, setPersona: () => undefined });

/** Holds the hero personalisation in memory only. Never written to storage. */
export function PersonaProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [persona, setPersona] = useState<Personalisation | null>(null);
  const value = useMemo(() => ({ persona, setPersona }), [persona]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePersona(): PersonaCtx {
  return useContext(Ctx);
}
