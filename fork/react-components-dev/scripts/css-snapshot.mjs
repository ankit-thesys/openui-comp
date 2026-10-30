// One fork-only command: public SSR snapshots, the real client-only contract collection, and
// module provenance for the order report. Raw captures are temporary and never become baselines.
import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { styleProvenance } from "./style-provenance.mjs";

// Collision rows of an order report, keyed without occurrence indexes (they move with markup):
// "<component> | <element> | <module pair: shared properties>".
const collisionRows = (report) => {
  const rows = new Set();
  let component = "";
  for (const block of report.split(/\n(?=## |Elements )/)) {
    if (block.startsWith("## ")) component = block.slice(3).split("\n")[0];
    if (!block.startsWith("Elements ")) continue;
    const element = block.match(/`([^`]+)`/)?.[1];
    for (const [, collision] of block.matchAll(/^- (.+)$/gm))
      rows.add(`${component} | ${element} | ${collision}`);
  }
  return rows;
};

const record = process.argv.includes("--record");
const serverOnly = process.argv.includes("--server-only");
const capture = mkdtempSync(join(tmpdir(), "openui-css-"));
const cwd = fileURLToPath(new URL("../", import.meta.url));
// Every step runs even after a failure, so a declaration diff never hides the order comparison.
// Recording stops at the first failure instead: a partial baseline is worse than none.
const failed = [];
const run = (args) => {
  const { status } = spawnSync("pnpm", args, {
    cwd,
    stdio: "inherit",
    env: {
      ...process.env,
      OPENUI_CSS_CAPTURE: capture,
      OPENUI_CSS_RECORD: record ? "1" : "0",
    },
  });
  if (status === 0) return;
  if (record) throw new Error(`${args.join(" ")} failed (${status})`);
  failed.push(args.join(" "));
};
try {
  writeFileSync(join(capture, "provenance.json"), JSON.stringify(await styleProvenance()));
  run([
    "exec",
    "vitest",
    "run",
    "test/unit/css-snapshot.test.tsx",
    "test/unit/css-snapshot-layer.test.tsx",
  ]);
  if (!serverOnly) run(["exec", "playwright", "test", "client-only.contract.spec.ts"]);
  if (record) run(["exec", "prettier", "--write", "test/css-snapshot/*.json"]);
  // Keep reporting at the same TypeScript seam as the tests; no extra runtime dependency.
  run(["exec", "vitest", "run", "test/unit/css-order-report.test.ts"]);
  const added = [];
  for (const file of readdirSync(capture).filter((file) => file.endsWith(".md"))) {
    const report = readFileSync(join(capture, file), "utf8");
    const committed = join(cwd, "test/css-snapshot", file);
    const output = record ? committed : committed.replace(/\.md$/, ".current.md");
    writeFileSync(output, report);
    console.log(`Order report: ${output}`);
    if (record) continue;
    let baseline;
    try {
      baseline = collisionRows(readFileSync(committed, "utf8"));
    } catch {
      added.push(`${file}: no committed report (record it on the pre-migration build)`);
      continue;
    }
    const fresh = collisionRows(report);
    for (const row of fresh) if (!baseline.has(row)) added.push(`${file}: ${row}`);
    const removed = [...baseline].filter((row) => !fresh.has(row));
    if (removed.length)
      console.log(
        `Collisions gone from ${file} (fine):\n${removed.map((row) => `  - ${row}`).join("\n")}`,
      );
  }
  if (added.length) {
    console.error(
      `New cross-module collisions (equal-weight rules from two modules on one element):\n${added.map((row) => `  + ${row}`).join("\n")}`,
    );
    failed.push("order report comparison");
  }
  if (failed.length) {
    console.error(`css:check failed: ${failed.join("; ")}`);
    process.exitCode = 1;
  }
} finally {
  rmSync(capture, { recursive: true, force: true });
}
