import { createRequire } from "node:module";
import path from "node:path";
import { defineConfig } from "vitest/config";

// ---------------------------------------------------------------------------
// Local, self-contained harness config for issue #19 (form-control baseline).
//
// Constraints this works around, all verified on the baseline commit:
//   * `validation/*` is NOT a pnpm workspace member (pnpm-workspace.yaml only
//     lists `packages/*` and `docs/`), so this directory gets no node_modules
//     and bare imports here cannot resolve by directory walk-up.
//   * `packages/react-ui` has no vitest config of its own and no jsdom
//     dependency; every pre-existing react-ui test is a node-environment SSR
//     test. jsdom 26.1.0 is, however, resolvable from vitest's own context.
//   * `@testing-library/react` is not in the lockfile at all. DOM queries and
//     user-style interactions come from `@storybook/test`, which already is a
//     devDependency of packages/react-ui.
//
// Rather than editing pnpm-workspace.yaml, the root package.json or the
// lockfile, every bare specifier used by *our own* files is aliased to the
// copy that `packages/react-ui` already has installed. Files under
// packages/react-ui/src keep resolving their own deps (radix, clsx, …)
// normally, because they are physically inside that package.
// ---------------------------------------------------------------------------

const reactUiDir = path.resolve(__dirname, "../../packages/react-ui");
const fromReactUi = createRequire(path.join(reactUiDir, "package.json"));

/** Resolve a specifier as `packages/react-ui` itself would. */
const asReactUi = (specifier: string) => {
  try {
    return fromReactUi.resolve(specifier);
  } catch {
    throw new Error(
      `[friend-controls-baseline] Cannot resolve "${specifier}" from packages/react-ui.\n` +
        `Run \`pnpm install --frozen-lockfile\` at the repository root first.`,
    );
  }
};

// Aliased as exact file paths so React stays a single instance shared with the
// legacy components under test (two instances would break hooks and context).
//
// The array form with anchored regexes is required: vite's object form does
// PREFIX matching, so a bare `react` key would also swallow
// `react/jsx-dev-runtime` and rewrite it to a path that does not exist.
const alias = [
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
  "react-dom/client",
  "react-dom/server",
  "react-dom/test-utils",
  "@storybook/test",
  "react-dom",
  "react",
].map((specifier) => ({
  find: new RegExp(`^${specifier.replace(/[/\\^$*+?.()|[\]{}]/g, "\\$&")}$`),
  replacement: asReactUi(specifier),
}));

/**
 * Resolve any *other* bare specifier our own files use (e.g. a Radix package
 * imported deliberately as a control group, to tell "our wrapper changed this"
 * apart from "the primitive behaves this way") through the copy that
 * packages/react-ui already has installed.
 *
 * Scoped narrowly: it only fires for bare ids, only for importers inside this
 * directory, and only when react-ui can actually resolve the id. Files under
 * packages/react-ui keep vite's normal resolution.
 */
const RUNNER_OWNED = /^(vitest|@vitest\/|vite$|vite\/)/;

const resolveViaReactUi = {
  name: "friend-controls-baseline:resolve-via-react-ui",
  enforce: "pre" as const,
  resolveId(id: string, importer: string | undefined) {
    if (!importer?.startsWith(__dirname)) return null;
    if (id.startsWith(".") || id.startsWith("/") || id.startsWith("\0")) return null;
    if (id.startsWith("node:")) return null;
    // The runner's own modules must keep vitest's ESM resolution: resolving
    // `vitest` through createRequire yields its CommonJS entry, which the
    // runner refuses to load.
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
  // This directory has no tsconfig of its own; state the JSX transform
  // explicitly so the config does not depend on ambient tsconfig discovery.
  esbuild: { jsx: "automatic", jsxImportSource: "react" },
  test: {
    name: "friend-controls-baseline",
    root: __dirname,
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    environment: "jsdom",
    globals: false,
    setupFiles: [path.join(__dirname, "setup/vitest.setup.ts")],
    sequence: { shuffle: false, concurrent: false },
    restoreMocks: true,
    // Legacy popup controls animate; keep the ceiling low so a missing
    // interaction fails fast instead of hanging the suite.
    testTimeout: 15_000,
  },
});
