// Bundles each fixture app against the built package, the way a consumer's bundler would.
// Runs once as Playwright's global setup; `serve.mjs` serves the output.
import { existsSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { build } from "tsdown";

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));
const fixturesOut = here("./.fixtures/");
const baselineEntry = here("./.baseline/src/index.ts");

// Fixtures import the package under test as "openui-under-test". Parity fixtures also get a
// "-baseline" bundle against the #72 source once `parity/extract-baseline.mjs` has run.
const fixtures = [
  "smoke",
  "button",
  "layers",
  "parity-button",
  "icon-button",
  "parity-icon-button",
  "markdown",
  "parity-markdown",
  "tabs",
  "parity-tabs",
];
const parityFixtures = fixtures.filter((name) => name.startsWith("parity-"));

// The package's lazy math renderer imports KaTeX's stylesheet. A consumer's bundler would emit it;
// tsdown cannot without @tsdown/css, and no fixture renders math, so CSS imports become empty modules.
const skipStylesheets = {
  name: "skip-stylesheets",
  resolveId: (id: string) => (id.endsWith(".css") ? "\0empty-stylesheet" : null),
  load: (id: string) => (id === "\0empty-stylesheet" ? "" : null),
};

const entries = (names: string[], suffix = "") =>
  Object.fromEntries(names.map((name) => [`${name}${suffix}`, here(`./fixtures/${name}.tsx`)]));

const bundle = (entry: Record<string, string>, packageUnderTest: string, baseline: boolean) =>
  build({
    config: false,
    entry,
    outDir: fixturesOut,
    format: "esm",
    platform: "browser",
    dts: false,
    clean: false,
    logLevel: "warn",
    alias: { "openui-under-test": packageUnderTest },
    define: {
      "process.env.NODE_ENV": JSON.stringify("production"),
      __PARITY_BASELINE__: String(baseline),
    },
    deps: { alwaysBundle: [/.*/], onlyBundle: false },
    plugins: [skipStylesheets],
  });

export default async function buildFixtures() {
  rmSync(fixturesOut, { recursive: true, force: true });
  await bundle(entries(fixtures), "@openuidev/react-components", false);
  if (existsSync(baselineEntry)) {
    await bundle(entries(parityFixtures, "-baseline"), baselineEntry, true);
  }
}
