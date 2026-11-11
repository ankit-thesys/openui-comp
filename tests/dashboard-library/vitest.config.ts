import { createRequire } from "node:module";
import path from "node:path";
import { defineConfig } from "vitest/config";

const require = createRequire(import.meta.url);
const dir = (name: string) => path.dirname(require.resolve(`${name}/package.json`));

/**
 * The browser tests run twice: on React 19 (the workspace copy) and on React 18, from the
 * `react-18` and `react-dom-18` aliases in package.json. Every `react` and `react-dom` import,
 * the library's and react-lang's included, resolves to that copy, as in an app that installed
 * React 18. The same approach as tests/intelligent-ui's host.
 */
const react18: { find: RegExp; replacement: string }[] = [
  { find: /^react-dom(\/.*)?$/, replacement: `${dir("react-dom-18")}$1` },
  { find: /^react(\/.*)?$/, replacement: `${dir("react-18")}$1` },
];

const browser = (react: "18" | "19") => ({
  // Each React gets its own pre-bundled deps; a shared cache would mix the two copies.
  cacheDir: `node_modules/.vite/react-${react}`,
  // Which React the project runs, so a test can check the alias took effect.
  define: { __REACT_MAJOR__: JSON.stringify(react) },
  resolve: {
    alias: react === "18" ? react18 : [],
    // One copy of React and the runtime, as an app with a single install has.
    dedupe: ["react", "react-dom", "@openuidev/react-lang", "@openuidev/react-components"],
  },
  // Pre-bundled up front, so Vite doesn't discover them mid-run and reload the page.
  optimizeDeps: {
    include: [
      "react",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "react-dom",
      "react-dom/client",
      "react-dom/server.browser",
    ],
  },
  test: {
    name: `browser-react-${react}`,
    include: ["*.browser.test.tsx"],
    browser: {
      enabled: true,
      provider: "playwright" as const,
      instances: [{ browser: "chromium" as const }],
      headless: true,
    },
  },
});

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "node",
          environment: "node",
          include: ["*.test.ts", "*.test.tsx"],
          exclude: ["*.browser.test.tsx"],
        },
      },
      browser("19"),
      browser("18"),
    ],
  },
});
