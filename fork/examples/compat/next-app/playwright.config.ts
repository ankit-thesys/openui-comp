import { defineConfig, devices } from "@playwright/test";
import manifest from "./package.json" with { type: "json" };
const servers = manifest.compat.servers;
export default defineConfig({
  testDir: "./tests",
  timeout: 120_000,
  expect: { timeout: 20_000 },
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: { trace: "retain-on-failure" },
  projects: servers.map(({ name, port }) => ({
    name,
    use: { ...devices["Desktop Chrome"], baseURL: `http://127.0.0.1:${port}` },
  })),
  // The harness and the local supervisor own all servers. --list has no side effects.
});
