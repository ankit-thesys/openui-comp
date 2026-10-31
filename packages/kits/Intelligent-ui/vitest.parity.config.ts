import { defineConfig } from "vitest/config";

/**
 * Compares the kit with the real open-intelligent-ui app, in a real browser. Slow, so it isn't part of
 * `pnpm test`. Needs `pnpm exec playwright install chromium`.
 */
export default defineConfig({
  test: {
    include: ["src/__tests__/parity/*.test.ts"],
    environment: "node",
    testTimeout: 60_000,
    hookTimeout: 900_000,
    pool: "forks",
  },
});
