import { defineConfig, devices } from "@playwright/test";
import manifest from "./package.json" with { type: "json" };

export default defineConfig({
  testDir: "./tests",
  forbidOnly: !!process.env["CI"],
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: `http://127.0.0.1:${manifest.compat.port}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // The shared runner owns the production server; --list never builds or starts anything.
});
