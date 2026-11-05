import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Alias } from "vite";

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

/**
 * `IU_REACT=18` builds the host with React 18, from the `react-18` and `react-dom-18` aliases in
 * package.json. Every `react` and `react-dom` import, the library's and react-lang's included,
 * resolves to that copy, as it would in an app that installed React 18.
 */
const react = process.env["IU_REACT"] === "18" ? "18" : "19";
const dir = (name: string) => path.dirname(require.resolve(`${name}/package.json`));
const react18: Alias[] = [
  { find: /^react-dom(\/.*)?$/, replacement: `${dir("react-dom-18")}$1` },
  { find: /^react(\/.*)?$/, replacement: `${dir("react-18")}$1` },
];

/**
 * The test host, built and served the way an app would ship it. The library is a plain workspace
 * dependency, so it resolves through its package.json `exports` to `dist`: a deep import, or a
 * stale build, fails here as it would for an app.
 */
export default defineConfig({
  root: here,
  esbuild: { jsx: "automatic" },
  resolve: {
    alias: react === "18" ? react18 : [],
    // One copy of React and the runtime, as an app with a single install has.
    dedupe: ["react", "react-dom", "@openuidev/react-lang", "@openuidev/react-components"],
  },
  build: {
    outDir: path.join(here, `../.host-dist/react-${react}`),
    emptyOutDir: true,
    // Reports name the library's own files, not minified chunks.
    minify: false,
    sourcemap: true,
    rollupOptions: {
      // react-components and the library mark client files with "use client", which a SPA doesn't need.
      onwarn(warning, warn) {
        if (warning.code !== "MODULE_LEVEL_DIRECTIVE") warn(warning);
      },
    },
  },
});
