import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: { jsx: "automatic" },
  test: {
    // The library's @functions are tested here too, against the source app's expectations.
    include: ["src/__tests__/*.test.{ts,tsx}", "src/__tests__/functions/*.test.ts"],
    // Dates format in UTC, so the date tests give the same answer on any machine.
    env: { TZ: "UTC" },
    exclude: ["dist/**", "node_modules/**"],
  },
});
