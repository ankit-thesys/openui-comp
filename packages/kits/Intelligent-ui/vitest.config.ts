import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: { jsx: "automatic" },
  test: {
    include: ["src/__tests__/*.test.{ts,tsx}"],
    exclude: ["dist/**", "node_modules/**"],
    // The library imports stylesheets from these packages, which plain Node can't load.
    server: { deps: { inline: [/katex/, /maplibre-gl/] } },
  },
});
