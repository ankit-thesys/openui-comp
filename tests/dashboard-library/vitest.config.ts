import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      { test: { name: "node", environment: "node", include: ["*.test.ts"] } },
      {
        test: {
          name: "browser",
          include: ["*.browser.test.tsx"],
          browser: {
            enabled: true,
            provider: "playwright",
            instances: [{ browser: "chromium" }],
            headless: true,
          },
        },
      },
    ],
  },
});
