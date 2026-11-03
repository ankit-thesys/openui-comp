import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const here = path.dirname(fileURLToPath(import.meta.url));

/**
 * The test host, built and served the way an app would ship it. The library is a plain workspace
 * dependency, so it resolves through its package.json `exports` to `dist`: a deep import, or a
 * stale build, fails here as it would for an app.
 */
export default defineConfig({
  root: here,
  esbuild: { jsx: "automatic" },
  resolve: {
    // One copy of React and the runtime, as an app with a single install has.
    dedupe: ["react", "react-dom", "@openuidev/react-lang", "@openuidev/react-components"],
  },
  build: {
    outDir: path.join(here, "../.host-dist/react-19"),
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
