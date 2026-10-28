import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Browser specs under test/browser run with Playwright, not vitest.
    include: ["test/unit/**/*.test.{ts,tsx}"],
  },
});
