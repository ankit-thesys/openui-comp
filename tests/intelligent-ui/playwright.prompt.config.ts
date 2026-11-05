import { defineConfig } from "@playwright/test";

/**
 * The prompt seam (#202) and the package checks (#199 stories 6–9). These run in Node, with no
 * browser and no host: they drive the CLI, plain Node and the package tools against the built
 * library. One worker, because `attw --pack` rebuilds `dist` through the package's `prepare`.
 */
export default defineConfig({
  testDir: "prompt",
  outputDir: "test-results/prompt",
  snapshotPathTemplate: "{testDir}/__snapshots__/{arg}{ext}",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env["CI"],
  retries: 0,
  reporter: "list",
  timeout: 180_000,
  projects: [{ name: "node" }],
});
