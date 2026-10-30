import { playwright } from "@vitest/browser-playwright";
import type { Page } from "playwright";
import { defineConfig } from "vitest/config";
import { isolate } from "./src/__tests__/parity/driver";

/**
 * Computed styles, layout and clicks need a real browser: jsdom has no layout and doesn't apply CSS
 * specificity, and those are what these tests guard. Needs `pnpm exec playwright install chromium`.
 */
export default defineConfig({
  esbuild: { jsx: "automatic" },
  define: { "process.env": "{}" },
  resolve: {
    dedupe: ["react", "react-dom", "@openuidev/react-lang", "@openuidev/react-components"],
  },
  test: {
    include: ["src/__tests__/browser/*.test.tsx"],
    testTimeout: 30_000,
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({
        launchOptions: { args: ["--enable-unsafe-swiftshader", "--use-gl=angle", "--use-angle=swiftshader"] },
      }),
      instances: [{ browser: "chromium" }],
      viewport: { width: 1280, height: 900 },
      screenshotFailures: false,
      commands: {
        // Photos, map tiles and the host's routes are answered locally, so no test reaches the network.
        isolate: async ({ page }: { page: Page }) => {
          await isolate(page);
        },
      },
    },
  },
});
