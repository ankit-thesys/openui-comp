import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env["OPENUI_TEST_PORT"] ?? 5370);
const ci = !!process.env["CI"];

export default defineConfig({
  testDir: "test/browser",
  globalSetup: "./test/browser/build-fixtures.ts",
  forbidOnly: ci,
  reporter: ci ? "github" : "list",
  use: { baseURL: `http://localhost:${port}` },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node test/browser/serve.mjs",
    url: `http://localhost:${port}/smoke.html`,
    env: { PORT: String(port) },
    // Never attach to whatever else may be listening on the port.
    reuseExistingServer: false,
  },
});
