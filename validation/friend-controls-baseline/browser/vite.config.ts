import { createRequire } from "node:module";
import path from "node:path";
import { defineConfig } from "vite";

// Build config for the issue #23 browser verification fixture. Same resolution strategy
// as ../vitest.config.ts: `validation/` is not a pnpm workspace member, so every
// bare specifier our own files use is resolved through the copy that
// packages/react-ui already has installed. No shared config or lockfile change.
const baselineDir = path.resolve(__dirname, "..");
const reactUiDir = path.resolve(__dirname, "../../../packages/react-ui");
const fromReactUi = createRequire(path.join(reactUiDir, "package.json"));

const asReactUi = (specifier: string) => {
  try {
    return fromReactUi.resolve(specifier);
  } catch {
    throw new Error(
      `[friend-controls-baseline] Cannot resolve "${specifier}" from packages/react-ui. ` +
        "Run `pnpm install --frozen-lockfile` at the repository root first.",
    );
  }
};

// Anchored regexes, in specific-first order: vite's object alias form does
// PREFIX matching and would rewrite "react/jsx-runtime" via the "react" key.
const alias = [
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
  "react-dom/client",
  "react-dom",
  "react",
].map((specifier) => ({
  find: new RegExp(`^${specifier.replace(/[/\\^$*+?.()|[\]{}]/g, "\\$&")}$`),
  replacement: asReactUi(specifier),
}));

const resolveViaReactUi = {
  name: "friend-controls-baseline:resolve-via-react-ui",
  enforce: "pre" as const,
  resolveId(id: string, importer: string | undefined) {
    if (!importer?.startsWith(baselineDir)) return null;
    if (id.startsWith(".") || id.startsWith("/") || id.startsWith("\0")) return null;
    if (id.startsWith("node:") || /^vite(\/|$)/.test(id)) return null;
    try {
      return fromReactUi.resolve(id);
    } catch {
      return null;
    }
  },
};

export default defineConfig({
  root: path.join(__dirname, "fixture"),
  plugins: [resolveViaReactUi],
  resolve: { alias, dedupe: ["react", "react-dom"] },
  esbuild: { jsx: "automatic", jsxImportSource: "react" },
  css: {
    preprocessorOptions: {
      // The legacy SCSS uses @use/@forward with package-relative paths.
      scss: { loadPaths: [path.join(reactUiDir, "src"), path.join(reactUiDir, "node_modules")] },
    },
  },
  server: { port: 4320, open: false },
  build: { outDir: path.join(__dirname, "dist"), emptyOutDir: true },
});
