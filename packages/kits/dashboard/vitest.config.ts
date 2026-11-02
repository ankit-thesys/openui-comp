import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: { jsx: "automatic" },
  test: {
    // The browser suite runs through vitest.browser.config.ts.
    exclude: [...configDefaults.exclude, "src/__tests__/browser/**"],
  },
});
