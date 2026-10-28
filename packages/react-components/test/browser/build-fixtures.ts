// Bundles each fixture app against the built package, the way a consumer's bundler would.
// Runs once as Playwright's global setup; `serve.mjs` serves the output.
import { existsSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { build } from "tsdown";

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));
const fixturesOut = here("./.fixtures/");
const baselineEntry = here("./.baseline/src/index.ts");
const reactUi = here("../../../react-ui/dist/index.mjs");

// Fixtures import the package under test as "openui-under-test". Parity fixtures also get a
// "-baseline" bundle against the #72 source once `parity/extract-baseline.mjs` has run.
const fixtures = [
  "card-blocks",
  "parity-card-block-layout",
  "parity-composite-card-block",
  "parity-context-card-block",
  "parity-visual-card-block",
  "parity-overview-card-block",
  "parity-snippet-card-block",
  "parity-option-cards",

  "text-blocks",
  "parity-text-block",
  "parity-text-callout",
  "parity-callout",
  "parity-text-content",
  "parity-text-content-wrapper",
  "parity-inline-header",
  "parity-icon-text",
  "parity-icon-tag",
  "parity-tag",
  "parity-tag-block",
  "parity-separator",
  "smoke",
  "button",
  "layers",
  "elements",
  "bench",
  "parity-button",
  "icon-button",
  "parity-icon-button",
  "markdown",
  "parity-markdown",
  "tabs",
  "parity-tabs",
  "lists-tables",
  "parity-list-item",
  "parity-list-block",
  "parity-entity-list",
  "parity-metric-indicator",
  "parity-table",
  "parity-scrollable-table",
  "parity-editable-table",
  "parity-editable-table-selected",
  "parity-editable-table-editing",
  "parity-editable-table-select",
  "citations-sources",
  "parity-inline-markdown",
  "parity-citation",
  "parity-citation-tooltip",
  "parity-sources",
  "parity-source-favicon-image",
  "shared-base",
  "parity-shared-base",
  "parity-skeleton-pulse",
  "parity-card",
  "parity-card-header",
  "parity-steps",
  "parity-accordion",
  "parity-section-block",
  "parity-modal-sm",
  "parity-modal-md",
  "parity-modal-lg",
  "parity-tooltip-wrapper",
  "disclosure",
  "form-controls",
  "parity-input",
  "parity-text-area",
  "parity-label",
  "parity-hint",
  "parity-form-control",
  "parity-buttons",
];
const parityFixtures = fixtures.filter((name) => name.startsWith("parity-"));

// The package's lazy math renderer imports KaTeX's stylesheet. A consumer's bundler would emit it;
// tsdown cannot without @tsdown/css, and no fixture renders math, so CSS imports become empty modules.
const skipStylesheets = {
  name: "skip-stylesheets",
  resolveId: (id: string) => (id.endsWith(".css") ? "\0empty-stylesheet" : null),
  load: (id: string) => (id === "\0empty-stylesheet" ? "" : null),
};

// The contract's component list (test/unit/contract/components.tsx) reads stable names from the
// built package with node:fs, relative to its own location. Node bundles import that script where
// it is; browser bundles get its result, read once here, so the list itself runs in the browser.
const selectorReference = new URL("../../scripts/selector-reference.mjs", import.meta.url).href;
const selectorReferencePlugin = (platform: "browser" | "node", stableNames: unknown) => ({
  name: "selector-reference",
  resolveId: (id: string) =>
    id.endsWith("/selector-reference.mjs")
      ? platform === "node"
        ? { id: selectorReference, external: true }
        : "\0stable-names"
      : null,
  load: (id: string) =>
    id === "\0stable-names"
      ? `const names = ${JSON.stringify(stableNames)};\nexport const readStableNames = async () => names;`
      : null,
});

const stableNames = async () => {
  const { readStableNames } = (await import(selectorReference)) as {
    readStableNames: () => Promise<unknown>;
  };
  return readStableNames();
};

const entries = (names: string[], suffix = "") =>
  Object.fromEntries(names.map((name) => [`${name}${suffix}`, here(`./fixtures/${name}.tsx`)]));

const bundle = async (
  entry: Record<string, string>,
  packageUnderTest: string,
  baseline: boolean,
  platform: "browser" | "node" = "browser",
) =>
  build({
    config: false,
    entry,
    // Node bundles get their own directory, so their chunks never mix with the served ones.
    outDir: platform === "node" ? `${fixturesOut}server/` : fixturesOut,
    format: "esm",
    platform,
    dts: false,
    clean: false,
    logLevel: "warn",
    alias: { "openui-under-test": packageUnderTest },
    define: {
      "process.env.NODE_ENV": JSON.stringify("production"),
      __PARITY_BASELINE__: String(baseline),
    },
    deps: { alwaysBundle: [/.*/], onlyBundle: false },
    plugins: [skipStylesheets, selectorReferencePlugin(platform, await stableNames())],
  });

export default async function buildFixtures() {
  rmSync(fixturesOut, { recursive: true, force: true });
  await bundle(entries(fixtures), "@openuidev/react-components", false);
  // The react-ui benches compare against the workspace's built @openuidev/react-ui.
  if (!existsSync(reactUi))
    throw new Error("Build @openuidev/react-ui first: pnpm --filter @openuidev/react-ui... build");
  await bundle(entries(["bench-react-ui"]), "@openuidev/react-components", false);
  await bundle(
    entries(["bench-server", "migrated-server"]),
    "@openuidev/react-components",
    false,
    "node",
  );
  // Render the four SSR documents during setup. Importing these large generated server
  // bundles inside a test makes Playwright transform them in each cold worker, consuming
  // the hydration/interaction timeout before a page can even open.
  const { serverPage } = (await import(
    new URL("./.fixtures/server/bench-server.mjs", import.meta.url).href
  )) as typeof import("./fixtures/bench-server");
  for (const pkg of ["react-components", "react-ui"] as const)
    for (const mode of ["light", "dark"] as const)
      writeFileSync(here(`./.fixtures/server/bench-${pkg}-${mode}.html`), serverPage(pkg, mode));
  if (existsSync(baselineEntry)) {
    await bundle(entries(parityFixtures, "-baseline"), baselineEntry, true);
  }
}
