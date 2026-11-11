// One command for the preview comparison (#230):
//
//   pnpm --filter @openuidev/dashboard-library-tests compare [--only <page>,…] [--theme light|dark]
//                                                           [--save-baseline] [--from <run dir>]
//
// It measures every example and building-block page of the dashboards-ui-library live preview and
// the same programs rendered by our library, compares them, prints a summary and writes the raw
// results to .workspace/dashboard-compare/<time>/. --save-baseline also writes baseline.md and
// baseline.json beside this script; a run without it lists any difference the baseline doesn't
// have, and fails if there is one. --from recomputes the comparison from a saved run's raw JSON.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { compare, summarize } from "./diff.mjs";
import { listPages, runPreview } from "./his.mjs";
import { runOurs, startHost } from "./ours.mjs";

const { values: args } = parseArgs({
  options: {
    only: { type: "string" },
    theme: { type: "string" },
    "save-baseline": { type: "boolean", default: false },
    from: { type: "string" },
  },
});
const here = (path) => fileURLToPath(new URL(path, import.meta.url));

/** Both sides, measured in a browser: { his, ours }, each { [theme]: { entries, styles? } }. */
async function measureBoth() {
  const { chromium } = createRequire(import.meta.url)("playwright");
  const themes = args.theme ? [args.theme] : ["light", "dark"];
  const browser = await chromium.launch();
  const server = await startHost();
  try {
    let pages = await listPages(await (await browser.newContext()).newPage());
    if (args.only) {
      const wanted = args.only.split(",").map((s) => s.trim().toLowerCase());
      pages = pages.filter((p) =>
        wanted.some((w) => p.name.toLowerCase().includes(w) || p.slug === w),
      );
    }
    console.log(`Pages: ${pages.map((p) => p.name).join(", ")}`);
    const log = (line) => console.log(line);
    const his = {};
    const ours = {};
    // The themes run side by side, each in its own browser context.
    await Promise.all(
      themes.map(async (theme) => {
        his[theme] = await runPreview(browser, theme, pages, log);
        ours[theme] = await runOurs(
          browser,
          server,
          theme,
          his[theme].entries,
          his[theme].styles,
          log,
        );
      }),
    );
    return { his, ours };
  } finally {
    await server.close();
    await browser.close();
  }
}

const out = args.from
  ? `${args.from.replace(/\/?$/, "/")}`
  : here(
      `../../../.workspace/dashboard-compare/${new Date().toISOString().replace(/[:.]/g, "-")}/`,
    );
mkdirSync(out, { recursive: true });
let his;
let ours;
if (args.from) {
  his = JSON.parse(readFileSync(`${out}his.json`, "utf8"));
  ours = JSON.parse(readFileSync(`${out}ours.json`, "utf8"));
} else {
  ({ his, ours } = await measureBoth());
  writeFileSync(`${out}his.json`, JSON.stringify(his));
  writeFileSync(`${out}ours.json`, JSON.stringify(ours));
}

const result = compare(his, ours);
writeFileSync(`${out}diff.json`, JSON.stringify(result, null, 1));
const summary = summarize(result, {
  title: "Preview comparison: dashboards-ui-library preview vs @openuidev/dashboard-library",
});
writeFileSync(`${out}summary.md`, summary);

// Every difference by path, kind and cause, without the values (which would carry the preview's
// programs), plus the counts per program.
const flat = Object.entries(result).flatMap(([theme, entries]) =>
  Object.entries(entries).flatMap(([key, e]) =>
    e.differences.map((d) => ({ theme, key, path: d.path, kind: d.kind, cause: d.cause })),
  ),
);
const totals = Object.fromEntries(
  Object.entries(result).map(([theme, entries]) => [
    theme,
    Object.fromEntries(
      Object.entries(entries).map(([key, e]) => [
        key,
        {
          units: e.units,
          compared: e.compared,
          different: e.differences.length,
          skipped: e.skipped,
        },
      ]),
    ),
  ]),
);

for (const [theme, entries] of Object.entries(result)) {
  const list = Object.values(entries);
  const compared = list.reduce((s, e) => s + e.compared, 0);
  const units = list.reduce((s, e) => s + (e.units ?? 0), 0);
  const diffs = list.flatMap((e) => e.differences);
  const by = (k) => diffs.filter((d) => d.kind === k).length;
  const causes = new Set(diffs.map((d) => d.cause)).size;
  const skipped = list.filter((e) => e.skipped).length;
  console.log(
    `\n${theme}: ${list.length} programs, ${units} units, ${compared} values compared, ${diffs.length} different ` +
      `(${by("gap")} real gap, ${by("deliberate")} deliberate, ${by("preview-only")} preview-only; ${causes} causes)` +
      (skipped ? `, ${skipped} skipped` : ""),
  );
}

const baseline = here("./baseline.json");
if (args["save-baseline"]) {
  writeFileSync(here("./baseline.md"), summary);
  // Compact: each cause once, then per theme and program, the paths that differ under each cause.
  const causes = [...new Set(flat.map((d) => d.cause))];
  const grouped = {};
  for (const d of flat) {
    const key = ((grouped[d.theme] ??= {})[d.key] ??= {});
    (key[causes.indexOf(d.cause)] ??= []).push(d.path);
  }
  const lines = [
    "{",
    ` "causes": ${JSON.stringify(causes.map((cause) => ({ kind: flat.find((d) => d.cause === cause).kind, cause })))},`,
    ` "totals": ${JSON.stringify(totals)},`,
    ` "differences": {`,
    Object.entries(grouped)
      .map(
        ([theme, keys]) =>
          `  ${JSON.stringify(theme)}: {\n${Object.entries(keys)
            .map(([key, byCause]) => `   ${JSON.stringify(key)}: ${JSON.stringify(byCause)}`)
            .join(",\n")}\n  }`,
      )
      .join(",\n"),
    " }",
    "}",
  ];
  writeFileSync(baseline, `${lines.join("\n")}\n`);
  console.log("\nSaved the baseline: compare/baseline.md and compare/baseline.json");
} else if (existsSync(baseline)) {
  const saved = JSON.parse(readFileSync(baseline, "utf8")).differences;
  const known = new Set(
    Object.entries(saved).flatMap(([theme, keys]) =>
      Object.entries(keys).flatMap(([key, byCause]) =>
        Object.values(byCause).flatMap((paths) => paths.map((path) => `${theme}|${key}|${path}`)),
      ),
    ),
  );
  const fresh = flat.filter((d) => !known.has(`${d.theme}|${d.key}|${d.path}`));
  console.log(`\nAgainst the baseline: ${fresh.length} new differences`);
  for (const d of fresh.slice(0, 50)) console.log(`  ${d.theme}  ${d.key}  ${d.path}`);
  if (fresh.length) process.exitCode = 1;
}
console.log(`\nResults: ${out}`);
