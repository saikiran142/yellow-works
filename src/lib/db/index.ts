import "server-only";

import { createPostgresStore } from "./postgres";
import { createSqliteStore } from "./sqlite";
import type { LeadStore } from "./types";

let store: LeadStore | null = null;

/** Postgres (Neon) when DATABASE_URL is set, otherwise a local SQLite file. */
export function getLeadStore(): LeadStore {
  if (store) return store;
  const url = process.env.DATABASE_URL;
  store = url ? createPostgresStore(url) : createSqliteStore();
  return store;
}
