// Reconcile explicit case revisions; never overwrite or relabel historical runs.
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import { matrix, summarize, verdict } from "./model.mjs";
export function reconcile(cases, runs) {
  const expected = matrix(cases, "full");
  const selected = [],
    superseded = [],
    missing = [],
    priorFindings = [];
  for (const cell of expected) {
    const current = cases.find((c) => c.id === cell.caseId);
    const candidates = runs.flatMap((run) =>
      run.results
        .filter((r) => r.cell.id === cell.id && r.executed)
        .map((result) => ({
          runId: run.id,
          sourceStatus: run.status,
          runnerVersion: run.runnerVersion,
          caseVersion: run.cases.find((c) => c.id === cell.caseId)?.version,
          result,
        })),
    );
    for (const candidate of candidates.filter(
      (c) => c.caseVersion !== current.version,
    ))
      superseded.push({
        cellId: cell.id,
        runId: candidate.runId,
        caseVersion: candidate.caseVersion,
        verdict: candidate.result.verdict,
        reason:
          "Different explicitly recorded case revision; historical result retained.",
      });
    const matches = candidates.filter((c) => c.caseVersion === current.version);
    const chosen = matches.at(-1);
    for (const prior of matches.slice(0, -1))
      if (["Fail", "Review", "Known issue"].includes(prior.result.verdict))
        priorFindings.push({
          cellId: cell.id,
          runId: prior.runId,
          verdict: prior.result.verdict,
          reason:
            "Earlier same-version non-passing execution retained for explicit review; a later pass does not erase it.",
        });
    if (!chosen) {
      missing.push(cell.id);
      selected.push({
        cell,
        executed: false,
        verdict: "Not covered",
        layers: {
          execution: {
            status: "Not covered",
            reason: "No execution of the current case version",
          },
        },
      });
    } else
      selected.push({
        ...chosen.result,
        sourceRun: chosen.runId,
        sourceStatus: chosen.sourceStatus,
        sourceRunner: chosen.runnerVersion,
        caseVersion: chosen.caseVersion,
      });
  }
  const summary = summarize(selected, expected.length);
  if (priorFindings.length)
    summary.verdict = verdict({
      current: { status: summary.verdict },
      ...Object.fromEntries(
        priorFindings.map((f, i) => [i, { status: f.verdict }]),
      ),
    });
  return {
    scope:
      "Current Default case versions, full dimensions; explicit input runs only. Historical failures are retained under superseded when the case recipe changed.",
    summary,
    priorFindings,
    missing,
    superseded,
    results: selected,
  };
}
if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  const root = path.resolve(import.meta.dirname, "..");
  const allowPartial = process.argv.includes("--allow-partial");
  const ids = process.argv.slice(2).filter((a) => a !== "--allow-partial");
  if (!ids.length || ids.some((id) => !/^[a-zA-Z0-9-]+$/.test(id)))
    throw Error("Explicit run IDs required");
  const cases = JSON.parse(
    await fs.readFile(path.join(root, "bench/cases.json")),
  );
  const identities = [];
  const runs = [];
  for (const id of ids) {
    const bytes = await fs.readFile(
      path.join(root, ".bench-runs", id, "run.json"),
    );
    const run = JSON.parse(bytes);
    if (
      !["completed", ...(allowPartial ? ["cancelled"] : [])].includes(
        run.status,
      ) ||
      run.themePreset.id !== "default"
    )
      throw Error(
        "Only completed Default runs, or explicitly allowed partial Default runs, may be reconciled",
      );
    runs.push(run);
    identities.push({
      id,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      status: run.status,
      summary: run.summary,
      runner: run.runnerVersion,
      themePreset: run.themePreset,
      provenance: run.provenance,
    });
  }
  const identity = (run) =>
    JSON.stringify({
      artifacts: run.provenance.artifacts.map((a) => ({
        name: a.name,
        version: a.version,
        sha256: a.sha256,
      })),
      browser: run.provenance.browser.sha256,
      version: run.provenance.browser.version,
      theme: run.themePreset.definitionHash,
      hosts: run.provenance.hostFixtures.files,
    });
  if (runs.some((run) => identity(run) !== identity(runs[0])))
    throw Error(
      "Cannot reconcile different package/browser/theme/host identities",
    );
  const report = {
    ...reconcile(cases, runs),
    createdAt: new Date().toISOString(),
    cases: cases.map((c) => ({ id: c.id, version: c.version })),
    sourceRuns: identities,
  };
  const out = path.join(root, ".test-results", "bench-reconciliation.json");
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify({
      out,
      summary: report.summary,
      missing: report.missing.length,
      superseded: report.superseded.length,
    }),
  );
}
