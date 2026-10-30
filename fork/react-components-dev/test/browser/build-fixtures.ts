// Bundles each fixture app against the built package, the way a consumer's bundler would.
// Runs once as Playwright's global setup; `serve.mjs` serves the output.
import { library, reactUi } from "#paths";
import { execFileSync } from "node:child_process";
import { existsSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { build, type TsdownPlugin } from "tsdown";

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));
const fixturesOut = here("./.fixtures/");
const baselineSource = here("./.baseline/src/");
const baselineEntry = `${baselineSource}index.ts`;
const reactUiEntry = reactUi("dist/index.mjs");

// Fixtures import the package under test as "openui-under-test", and the react-ui benches import
// react-ui as "react-ui-under-test". Parity fixtures also get a "-baseline" bundle against the #72
// source, which `parity/extract-baseline.mjs` extracts.
const fixtures = [
  "card-blocks",
  "parity-card-block-layout",
  "parity-composite-card-block",
  "parity-context-card-block",
  "parity-visual-card-block",
  "parity-overview-card-block",
  "parity-snippet-card-block",
  "parity-option-cards",
  "parity-image-gallery-mobile",
  "parity-image-gallery-modal-mobile",
  "parity-carousel-mobile",
  "media",
  "parity-image",
  "parity-image-block",
  "parity-image-text",
  "parity-image-text-large",
  "parity-image-gallery",
  "parity-image-gallery-modal",
  "parity-carousel",

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
  "ssr-hydrate",
  "document-hydrate",
  "streaming",
  "sheet",
  "import-registration",
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
  "choice-controls",
  "parity-check-box",
  "parity-radio",
  "parity-switch",
  "parity-toggle",
  "parity-chips",
  "select-calendar",
  "slider",
  "parity-slider",
  "parity-slider-block",
  "parity-select",
  "parity-calendar",
  "parity-date-picker",
  "loading-code",
  "parity-skeleton",
  "parity-dot-matrix-loader",
  "parity-code-block",
  "cartesian-charts",
  "parity-area-chart",
  "parity-bar-chart",
  "parity-horizontal-bar-chart",
  "parity-line-chart",
  "parity-scatter-chart",
  "other-charts",
  "parity-pie-chart",
  "parity-radar-chart",
  "parity-radial-chart",
  "parity-funnel-chart",
  "parity-heatmap-chart",
  "parity-calendar-heatmap",
  "parity-segmented-bar",
  "chart-foundations",
  "parity-chart-foundations",
  "parity-mini-charts",
  "parity-chart-tooltip",
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

// The #72 source extracted under .baseline has no node_modules of its own, and this package does not
// depend on the library's dependencies: resolve its packages as the library's own source would.
const baselineDependencies: TsdownPlugin = {
  name: "baseline-dependencies",
  resolveId(id, importer) {
    if (!importer?.startsWith(baselineSource) || /^[.\0/]/.test(id)) return null;
    return this.resolve(id, library("src/index.ts"), { skipSelf: true });
  },
};

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
  environment = "production",
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
    alias: {
      "openui-under-test": packageUnderTest,
      "react-ui-under-test": reactUiEntry,
      "goober-under-test": createRequire(library("package.json"))
        .resolve("goober")
        .replace("goober.cjs", "goober.modern.js"),
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(environment),
      __PARITY_BASELINE__: String(baseline),
    },
    deps: { alwaysBundle: [/.*/], onlyBundle: false },
    plugins: [
      skipStylesheets,
      baselineDependencies,
      selectorReferencePlugin(platform, await stableNames()),
    ],
  });

export default async function buildFixtures() {
  rmSync(fixturesOut, { recursive: true, force: true });
  await bundle(entries(fixtures), "@openuidev/react-components", false);
  await bundle(
    entries(["layers"], "-development"),
    "@openuidev/react-components",
    false,
    "browser",
    "development",
  );
  // The react-ui benches compare against the workspace's built @openuidev/react-ui.
  if (!existsSync(reactUiEntry))
    throw new Error("Build @openuidev/react-ui first: pnpm --filter @openuidev/react-ui... build");
  await bundle(entries(["bench-react-ui"]), "@openuidev/react-components", false);
  await bundle(
    entries(["bench-server", "migrated-server", "streaming-server"]),
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
  // Specs such as card-blocks.parity-details compare live against the "-baseline" pages, so
  // extract the #72 source when a fresh checkout has none.
  if (!existsSync(baselineEntry)) {
    try {
      execFileSync("node", [here("./parity/extract-baseline.mjs")], { stdio: "inherit" });
    } catch (error) {
      throw new Error(
        "Extract the #72 parity baseline first (needs the flat-styles-parity-baseline tag): " +
          "node test/browser/parity/extract-baseline.mjs",
        { cause: error },
      );
    }
  }
  await bundle(entries(parityFixtures, "-baseline"), baselineEntry, true);
}
