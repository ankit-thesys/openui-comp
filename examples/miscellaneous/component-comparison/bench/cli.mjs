import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { runBench } from "./runner.mjs";
import { DEFAULT_CHROME } from "./model.mjs";
const root = path.resolve(import.meta.dirname, "..");
const args = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith("--"))
    .map((a) => a.slice(2).split("=")),
);
const safe = (id) => /^[a-zA-Z0-9][a-zA-Z0-9-]{0,120}$/.test(id);
const id =
  args.id ??
  new Date().toISOString().replace(/[:.]/g, "-") +
    "-" +
    randomUUID().slice(0, 8);
if (!safe(id)) throw Error("Invalid run ID");
let historical;
if (args["from-run"]) {
  if (!safe(args["from-run"])) throw Error("Invalid historical run");
  historical = JSON.parse(
    await fs.readFile(
      path.join(root, ".bench-runs", args["from-run"], "run.json"),
      "utf8",
    ),
  );
  if (args.preset && args.preset !== historical.themePreset.id)
    throw Error(
      "Historical reproduction uses its frozen preset; start a current run to choose another preset.",
    );
}
await fs.mkdir(path.join(root, ".bench-runs"), { recursive: true });
const dir = path.join(root, ".bench-runs", id);
await fs.mkdir(dir);
const bundleDir = path.join(dir, "runtime");
await fs.cp(
  historical
    ? path.join(root, ".bench-runs", historical.id, "runtime")
    : path.join(root, "dist"),
  bundleDir,
  { recursive: true },
);
const { createApp } = await import("../server.mjs");
const app = await createApp({
  env: { NODE_ENV: "production", COMPARISON_MODE: "mock" },
  distRoot: bundleDir,
});
app.server.listen(0, "127.0.0.1");
await new Promise((r) => app.server.once("listening", r));
const onSignal = () => {
  void fs.writeFile(
    path.join(dir, "cancel.requested"),
    "Requested by CLI signal\n",
  );
};
process.once("SIGINT", onSignal);
process.once("SIGTERM", onSignal);
try {
  const run = await runBench({
    id,
    bundleDir,
    origin: `http://127.0.0.1:${app.server.address().port}`,
    mode: args.mode ?? historical?.mode ?? "quick",
    presetId: args.preset ?? historical?.themePreset.id ?? "default",
    themeDefinitionOverride: historical?.themePreset,
    casesOverride: historical?.cases,
    checklistOverride: historical?.coverage,
    frozenProvenance: historical?.provenance,
    reproducesRunId: historical?.id,
    caseIds: args.case?.split(","),
    widths: args.width ? [Number(args.width)] : historical?.options.widths,
    themes: args.theme ? [args.theme] : historical?.options.themes,
    delivery: args.delivery,
    chrome: args.chrome ?? process.env.COMPARISON_CHROME ?? DEFAULT_CHROME,
    concurrency: args.concurrency ? Number(args.concurrency) : 2,
    onProgress: (p) => {
      if (p.completed % 20 === 0) console.log(JSON.stringify(p));
    },
  });
  console.log(
    JSON.stringify({
      id: run.id,
      summary: run.summary,
      uncoveredChecks: run.uncoveredChecks.length,
      error: run.error,
    }),
  );
  if (run.status === "infrastructure-error") process.exitCode = 2;
  else if (run.summary.verdict !== "Pass") process.exitCode = 1;
} finally {
  process.removeListener("SIGINT", onSignal);
  process.removeListener("SIGTERM", onSignal);
  await app.close();
}
