// Rerun the original diagnostic inventory without silently adding newer cases.
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { once } from "node:events";
import { runBench } from "./runner.mjs";
import { createApp } from "../server.mjs";
const root = path.resolve(import.meta.dirname, "..");
const originalId = "2026-10-25T21-52-47-119Z-b79d8b85";
const originalBytes = await fs.readFile(
  path.join(root, ".bench-runs", originalId, "run.json"),
);
const original = JSON.parse(originalBytes);
const current = JSON.parse(
  await fs.readFile(path.join(root, "bench/cases.json")),
);
const changes = [];
const cases = original.cases.map((previous, index) => {
  // The original inventory accidentally reused image-loading for two different cases.
  const id =
    previous.id === "image-loading" && previous.name.startsWith("ImageBlock")
      ? "image-block-loading"
      : previous.id;
  const next = current.find((c) => c.id === id) ?? previous;
  const fields = [
    ...new Set([...Object.keys(previous), ...Object.keys(next)]),
  ].filter((k) => JSON.stringify(previous[k]) !== JSON.stringify(next[k]));
  if (fields.length)
    changes.push({
      originalIndex: index,
      originalId: previous.id,
      currentId: next.id,
      fields,
      before: previous,
      after: next,
    });
  return next;
});
if (cases.length !== 202 || new Set(cases.map((c) => c.id)).size !== 202)
  throw Error("Original inventory is not preserved");
const id = new Date().toISOString().replace(/[:.]/g, "-") + "-triage202";
const dir = path.join(root, ".bench-runs", id);
await fs.mkdir(dir, { recursive: true });
await fs.cp(path.join(root, "dist"), path.join(dir, "runtime"), {
  recursive: true,
});
await fs.writeFile(
  path.join(dir, "inventory-changes.json"),
  JSON.stringify(
    {
      originalId,
      originalSha256: createHash("sha256").update(originalBytes).digest("hex"),
      scope:
        "202 original cases, 390px/light/plain/instant; current corrected recipes, every change enumerated",
      changes,
    },
    null,
    2,
  ),
);
const app = await createApp({
  env: { NODE_ENV: "production", COMPARISON_MODE: "mock" },
  distRoot: path.join(dir, "runtime"),
});
app.server.listen(0, "127.0.0.1");
await once(app.server, "listening");
try {
  const run = await runBench({
    id,
    bundleDir: path.join(dir, "runtime"),
    origin: `http://127.0.0.1:${app.server.address().port}`,
    casesOverride: cases,
    widths: [390],
    themes: ["light"],
    delivery: "instant",
    concurrency: 4,
    onProgress: (p) => {
      if (p.completed % 20 === 0) console.log(JSON.stringify(p));
    },
  });
  console.log(
    JSON.stringify({ id, summary: run.summary, changedCases: changes.length }),
  );
} finally {
  await app.close();
}
