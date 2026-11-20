import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

/**
 * Browser fixture server for the chart baseline.
 *
 * `validation/` is not a pnpm workspace member (pnpm-workspace.yaml lists only
 * `packages/*` and `docs/`), so this directory has no node_modules of its own.
 * Rather than touch any shared config, the aliases below point react /
 * react-dom at packages/react-ui's installed copies, and `server.fs.allow`
 * lets vite read the component sources that live above this directory.
 *
 * No `@vitejs/plugin-react`: it is not installed in this workspace, and it is
 * not needed — vite's built-in esbuild transform handles .tsx, and
 * `esbuild.jsx: "automatic"` supplies the JSX runtime. The cost is no React
 * fast-refresh, which a screenshot fixture does not use.
 */
const here = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const nm = (p: string) => `${repoRoot}packages/react-ui/node_modules/${p}`;

export default defineConfig({
  root: `${here}fixtures/browser`,
  cacheDir: `${here}.vite-cache`,
  esbuild: { jsx: "automatic" },
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      "react-dom/client": nm("react-dom/client"),
      "react-dom": nm("react-dom"),
      "react/jsx-runtime": nm("react/jsx-runtime"),
      react: nm("react"),
    },
  },
  server: {
    port: 5199,
    strictPort: true,
    fs: { allow: [repoRoot] },
  },
});
