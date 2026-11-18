import { defineConfig, devices } from "@playwright/test";

const PORT = 3120;
// A fresh database file per run (the server opens it before any global setup could clear it).
const DB = `./data/e2e-${Date.now()}.db`;

/**
 * End-to-end tests run against a production build (`npm run build` first).
 * The server uses a throwaway SQLite file and test-only admin credentials; no LLM key, so the
 * scripted engines are exercised.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  projects: [{ name: "desktop", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      SQLITE_PATH: DB,
      ADMIN_PASSWORD: "e2e-admin-password",
      ADMIN_SESSION_SECRET: "e2e-session-secret-0123456789abcdef",
      LLM_API_KEY: "",
      DATABASE_URL: "",
      LEAD_WEBHOOK_URL: "",
    },
  },
});
