import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Resolution root is packages/react-ui: `validation/` is not a pnpm workspace
// member (pnpm-workspace.yaml covers only `packages/*` and `docs/`), so it has
// no node_modules of its own. Rooting here lets the fixtures resolve react,
// react-dom and vitest from react-ui's own installed toolchain without
// touching any shared config, the root package.json or the lockfile.
const reactUiRoot = fileURLToPath(new URL("../../packages/react-ui", import.meta.url));
const baselineRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root: reactUiRoot,
  test: {
    // `node` is the only option: react-ui does not depend on jsdom, and adding
    // it would be a dependency change this ticket forbids. Evidence is captured
    // via react-dom/server, matching the repo's existing *.ssr.test.tsx convention.
    environment: "node",
    dir: baselineRoot,
    include: ["**/*.baseline.test.tsx", "**/*.baseline.test.ts"],
  },
});
