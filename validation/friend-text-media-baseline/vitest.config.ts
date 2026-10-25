import { createRequire } from "node:module";
import path from "node:path";
import { defineConfig } from "vitest/config";

// ---------------------------------------------------------------------------
// Self-contained harness config for issue #31 (text / media / Table baseline).
//
// Constraints, all re-verified on this base commit (433a0e31d) rather than
// inherited on trust:
//   * `validation/*` is not a pnpm workspace member (pnpm-workspace.yaml lists
//     only `packages/*` and `docs/`), so this directory gets no node_modules and
//     bare imports here cannot resolve by directory walk-up.
//   * `packages/react-ui` declares no jsdom and has no vitest config of its own;
//     its own tests are node-environment SSR tests. jsdom IS resolvable from
//     vitest's own context, which is why `environment: "jsdom"` works here
//     without adding a dependency. The setup file asserts this rather than
//     assuming it.
//   * `@testing-library/react` is absent from the lockfile. Queries, user-style
//     interaction and jest-dom matchers come from `@storybook/test`, which is
//     already a devDependency of packages/react-ui.
//
// The approach (aliasing our own bare specifiers to packages/react-ui's installed
// copies) follows the pattern established by validation/friend-controls-baseline,
// which #31 permits reading as an example. No dependency, lockfile or
// shared-config change is made.
// ---------------------------------------------------------------------------

const reactUiDir = path.resolve(__dirname, "../../packages/react-ui");
const fromReactUi = createRequire(path.join(reactUiDir, "package.json"));

/** Resolve a specifier exactly as `packages/react-ui` would. */
const asReactUi = (specifier: string) => {
  try {
    return fromReactUi.resolve(specifier);
  } catch {
    throw new Error(
      `[friend-text-media-baseline] Cannot resolve "${specifier}" from packages/react-ui.\n` +
        `Run \`pnpm install --frozen-lockfile\` at the repository root first.`,
    );
  }
};

// Exact file paths, so React stays a single instance shared with the legacy
// components under test; two instances would break hooks and context.
//
// The anchored-regex array form is required: vite's object form does PREFIX
// matching, so a bare `react` key would also swallow `react/jsx-dev-runtime`.
const alias = [
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
  "react-dom/client",
  "react-dom/server",
  "@storybook/test",
  "react-dom",
  "react",
].map((specifier) => ({
  find: new RegExp(`^${specifier.replace(/[/\\^$*+?.()|[\]{}]/g, "\\$&")}$`),
  replacement: asReactUi(specifier),
}));

/**
 * Resolve any other bare specifier used by OUR files through packages/react-ui's
 * install. Scoped narrowly: bare ids only, importers inside this directory only,
 * and only when react-ui can actually resolve the id. Files physically inside
 * packages/react-ui keep vite's normal resolution.
 */
const RUNNER_OWNED = /^(vitest|@vitest\/|vite$|vite\/)/;

const resolveViaReactUi = {
  name: "friend-text-media-baseline:resolve-via-react-ui",
  enforce: "pre" as const,
  resolveId(id: string, importer: string | undefined) {
    if (!importer?.startsWith(__dirname)) return null;
    if (id.startsWith(".") || id.startsWith("/") || id.startsWith("\0")) return null;
    if (id.startsWith("node:")) return null;
    // The runner's own modules must keep vitest's ESM resolution; resolving
    // `vitest` via createRequire yields a CommonJS entry the runner refuses.
    if (RUNNER_OWNED.test(id)) return null;
    try {
      return fromReactUi.resolve(id);
    } catch {
      return null;
    }
  },
};

export default defineConfig({
  plugins: [resolveViaReactUi],
  resolve: {
    alias,
    dedupe: ["react", "react-dom"],
  },
  // This directory has its own tsconfig.json, but state the JSX transform
  // explicitly so the config does not depend on ambient tsconfig discovery.
  esbuild: { jsx: "automatic", jsxImportSource: "react" },
  test: {
    name: "friend-text-media-baseline",
    root: __dirname,
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    environment: "jsdom",
    globals: false,
    setupFiles: [path.join(__dirname, "setup/vitest.setup.ts")],
    sequence: { shuffle: false, concurrent: false },
    restoreMocks: true,
    testTimeout: 15_000,
  },
});
