// Bundles each fixture app against the built package, the way a consumer's bundler would.
// Runs once as Playwright's global setup; `serve.mjs` serves the output.
import { fileURLToPath } from "node:url";
import { build } from "tsdown";

const fixturesOut = fileURLToPath(new URL("./.fixtures/", import.meta.url));

// The package's lazy math renderer imports KaTeX's stylesheet. A consumer's bundler would emit it;
// tsdown cannot without @tsdown/css, and no fixture renders math, so CSS imports become empty modules.
const skipStylesheets = {
  name: "skip-stylesheets",
  resolveId: (id: string) => (id.endsWith(".css") ? "\0empty-stylesheet" : null),
  load: (id: string) => (id === "\0empty-stylesheet" ? "" : null),
};

export default async function buildFixtures() {
  await build({
    config: false,
    entry: { smoke: fileURLToPath(new URL("./fixtures/smoke.tsx", import.meta.url)) },
    outDir: fixturesOut,
    format: "esm",
    platform: "browser",
    dts: false,
    clean: true,
    logLevel: "warn",
    define: { "process.env.NODE_ENV": JSON.stringify("production") },
    deps: { alwaysBundle: [/.*/], onlyBundle: false },
    plugins: [skipStylesheets],
  });
}
