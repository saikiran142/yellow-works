import "server-only";

import { createMemoryStore } from "./memory";
import { createPostgresStore } from "./postgres";
import { createSqliteStore } from "./sqlite";
import type { LeadStore } from "./types";

let store: LeadStore | null = null;

/**
 * Postgres (Neon) when DATABASE_URL is set. Otherwise a local SQLite file, or, on Vercel / any
 * read-only filesystem, a non-persistent in-memory demo store.
 */
export function getLeadStore(): LeadStore {
  if (store) return store;
  const url = process.env.DATABASE_URL;
  if (url) {
    store = createPostgresStore(url);
  } else if (process.env.VERCEL) {
    store = createMemoryStore();
  } else {
    try {
      store = createSqliteStore();
    } catch {
      store = createMemoryStore();
    }
  }
  return store;
}
