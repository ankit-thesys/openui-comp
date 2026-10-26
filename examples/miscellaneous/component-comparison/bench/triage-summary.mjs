import fs from "node:fs/promises";
import path from "node:path";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
const id = process.argv[2];
if (!id || !/^[a-zA-Z0-9-]+$/.test(id)) throw Error("Run ID required");
const dir = path.resolve(".bench-runs", id);
const bytes = await fs.readFile(path.join(dir, "run.json"));
const run = JSON.parse(bytes);
const findings = [];
const propertyCounts = {};
for (const result of run.results) {
  if (result.verdict === "Pass") continue;
  const raw = result.evidence
    ? JSON.parse(gunzipSync(await fs.readFile(path.join(dir, result.evidence))))
    : {};
  const differences =
    raw.checkpoints?.flatMap((c) =>
      ["semantics", "layout", "styles"].flatMap((layer) =>
        (c.layers[layer].differences ?? []).map((d) => ({
          checkpoint: c.label,
          layer,
          ...d,
        })),
      ),
    ) ?? [];
  for (const d of differences)
    propertyCounts[d.path.split(".").at(-1)] =
      (propertyCounts[d.path.split(".").at(-1)] ?? 0) + 1;
  findings.push({
    caseId: result.cell.caseId,
    verdict: result.verdict,
    failures: result.layers.behavior?.assertions?.filter((a) => !a.pass),
    error: result.layers.behavior?.error,
    pageErrors: result.layers.behavior?.pageErrors,
    layers: Object.fromEntries(
      Object.entries(result.layers).map(([k, v]) => [k, v.status]),
    ),
    differences,
    screenshots: result.layers.screenshot,
    images: result.images,
    evidence: result.evidence,
  });
}
const summary = {
  id,
  runSha256: createHash("sha256").update(bytes).digest("hex"),
  summary: run.summary,
  propertyCounts,
  findings,
};
const output = path.resolve(
  ".bench-investigations",
  id,
  "classification-" + Date.now() + ".json",
);
await fs.mkdir(path.dirname(output), { recursive: true });
await fs.writeFile(output, JSON.stringify(summary, null, 2));
console.log(
  JSON.stringify(
    {
      id,
      runSha256: summary.runSha256,
      summary: run.summary,
      propertyCounts,
      findings: findings.map((f) => ({
        caseId: f.caseId,
        verdict: f.verdict,
        layers: f.layers,
        failures: f.failures?.map((a) => ({ id: a.id, actual: a.actual })),
        error: f.error,
        difference: f.differences[0],
        screenshot: f.screenshots?.captures,
      })),
    },
    null,
    2,
  ),
);
