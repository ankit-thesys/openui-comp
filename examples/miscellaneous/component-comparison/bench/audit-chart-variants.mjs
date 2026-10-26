import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { chartVariantAssertions } from "./chart-variant-oracles.mjs";
const ids = process.argv.slice(2);
if (!ids.length || ids.some((id) => !/^[a-zA-Z0-9-]+$/.test(id)))
  throw Error("Explicit run IDs required");
const root = path.resolve(import.meta.dirname, ".."),
  results = [];
const sources = [];
for (const id of ids) {
  const bytes = await fs.readFile(
    path.join(root, ".bench-runs", id, "run.json"),
  );
  const run = JSON.parse(bytes);
  sources.push({
    id,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  });
  for (const result of run.results.filter((r) => r.executed)) {
    const c = run.cases.find((c) => c.id === result.cell.caseId);
    if (
      !c.variants ||
      ![
        "bar-chart-variants",
        "line-chart-variants",
        "area-chart-variants",
        "horizontal-bar-chart-variants",
        "pie-chart-variants",
      ].includes(c.id)
    )
      continue;
    const raw = JSON.parse(
      gunzipSync(
        await fs.readFile(path.join(root, ".bench-runs", id, result.evidence)),
      ),
    );
    const final = raw.checkpoints?.find((c) => c.label === "complete");
    const assertions = final ? chartVariantAssertions(c, final.probes) : [];
    results.push({
      cellId: result.cell.id,
      sourceRun: id,
      caseVersion: c.version,
      evidence: result.evidence,
      status: assertions.length
        ? assertions.every((a) => a.pass)
          ? "Pass"
          : "Fail"
        : "Not covered",
      assertions,
    });
  }
}
const oracleSha256 = createHash("sha256")
  .update(await fs.readFile(path.join(root, "bench/chart-variant-oracles.mjs")))
  .digest("hex");
const report = {
  oracleSha256,
  auditVersion: "chart-variants/1.0.0",
  scope:
    "Independent rendered SVG count, positive-area path/rect marks and fixed source data labels from original native DOM measurements; this does not rewrite original runs or certify all chart mathematics.",
  sources,
  results,
  summary: {
    executed: results.length,
    counts: Object.fromEntries(
      ["Pass", "Fail", "Not covered"].map((s) => [
        s,
        results.filter((r) => r.status === s).length,
      ]),
    ),
  },
};
await fs.mkdir(path.join(root, ".test-results"), { recursive: true });
const out = path.join(root, ".test-results/chart-variant-audit.json");
await fs.writeFile(out, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ out, summary: report.summary }));
