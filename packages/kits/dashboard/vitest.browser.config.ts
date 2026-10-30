import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

/**
 * Computed styles, layout and clicks need a real browser: jsdom has no layout and doesn't apply CSS
 * specificity, and those are what these tests guard. Needs `pnpm exec playwright install chromium`.
 */
export default defineConfig({
  esbuild: { jsx: "automatic" },
  resolve: {
    dedupe: ["react", "react-dom", "@openuidev/react-lang", "@openuidev/react-components"],
  },
  test: {
    include: ["src/__tests__/browser/*.test.tsx"],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
      viewport: { width: 1400, height: 900 },
      screenshotFailures: false,
    },
  },
});
