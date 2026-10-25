import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { benchmarkFixture, soakFixture } from "./report.fixture.mjs";

const exec = promisify(execFile);
const cli = fileURLToPath(new URL("../summarize.mjs", import.meta.url));
async function summarize(change = () => {}, fixture = benchmarkFixture) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "beta17-summary-test-"));
  try {
    const { manifest, report } = fixture();
    change(report, manifest);
    await fs.writeFile(path.join(root, "manifest.json"), JSON.stringify(manifest));
    await fs.writeFile(path.join(root, "report.json"), JSON.stringify(report));
    try {
      const result = await exec(process.execPath, [
        cli,
        path.join(root, "manifest.json"),
        path.join(root, "report.json"),
      ]);
      return { code: 0, output: JSON.parse(result.stdout) };
    } catch (error) {
      return { code: error.code, output: JSON.parse(error.stdout) };
    }
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
}

test("the public summary command refuses an incomplete matched matrix", async () => {
  const result = await summarize((report) => report.runs.pop());
  assert.equal(result.code, 1);
  assert.equal(result.output.valid, false);
  assert.match(result.output.errors.join(" "), /80|missing|pair/i);
});

test("the summary rejects incorrect final output even when all timing samples are fast", async () => {
  const result = await summarize((report) => {
    report.runs[0].actualTextSha256 = "0".repeat(64);
  });
  assert.equal(result.code, 1);
  assert.equal(result.output.valid, false);
  assert.match(result.output.errors.join(" "), /output|content|text/i);
});

test("a duplicated pair cannot replace a missing baseline/runtime pair", async () => {
  const result = await summarize((report) => {
    report.runs[1] = { ...report.runs[0] };
  });
  assert.equal(result.code, 1);
  assert.equal(result.output.valid, false);
  assert.match(result.output.errors.join(" "), /pair|duplicate/i);
});

test("a complete correct matched report can pass without disguising synthetic data as a measurement", async () => {
  const result = await summarize();
  assert.equal(result.code, 0);
  assert.equal(result.output.valid, true);
  assert.equal(result.output.pass, true);
});

test("a dashboard regression cannot be averaged away by faster chat", async () => {
  const result = await summarize((report) => {
    for (const run of report.runs)
      if (run.arm === "runtime") run.elapsedMs = run.workload === "dashboard" ? 130 : 50;
  });
  assert.equal(result.code, 1);
  assert.equal(result.output.valid, true);
  assert.equal(result.output.pass, false);
  assert(result.output.timing.some((row) => row.workload === "dashboard" && row.pass === false));
});

test("input-command p95 is checked separately for each workload and arm", async () => {
  const result = await summarize((report) => {
    for (const run of report.runs)
      if (run.workload === "dashboard" && run.load === "paced" && run.arm === "baseline")
        run.inputMs = 101;
  });
  assert.equal(result.code, 1);
  assert.equal(result.output.valid, true);
  assert.equal(result.output.pass, false);
  const cell = result.output.input.find((r) => r.workload === "dashboard" && r.arm === "baseline");
  assert.equal(cell.p95, 101);
  assert.equal(cell.pass, false);
});

test("wrong rendered counts or a live terminal stream make timing evidence invalid", async () => {
  const result = await summarize((report) => {
    report.runs[0].domCounts.tables = 0;
    report.runs[0].activeAfter = 1;
  });
  assert.equal(result.code, 1);
  assert.equal(result.output.valid, false);
  assert.match(result.output.errors.join(" "), /DOM|table/);
  assert.match(result.output.errors.join(" "), /stream/);
});

test("changed frozen inputs invalidate otherwise complete fast results", async () => {
  const result = await summarize((report) => {
    report.integrity.after.artifact = "0".repeat(64);
  });
  assert.equal(result.code, 1);
  assert.equal(result.output.valid, false);
  assert.match(result.output.errors.join(" "), /integrity|input|changed/i);
});

test("missing excluded first-stream observations and non-alternating run order are rejected", async () => {
  const result = await summarize((report) => {
    report.cold.pop();
    report.runs.reverse();
  });
  assert.equal(result.code, 1);
  assert.equal(result.output.valid, false);
  assert.match(result.output.errors.join(" "), /first.stream|warmup|cold/i);
  assert.match(result.output.errors.join(" "), /order|alternat/i);
});

test("agreed median and p95 boundaries are inclusive and a tail breach is visible", async () => {
  const accepted = await summarize((report) => {
    for (const run of report.runs)
      if (run.arm === "runtime") run.elapsedMs = run.pair === 9 ? 115 : 110;
  });
  assert.equal(accepted.code, 0);
  const rejected = await summarize((report) => {
    for (const run of report.runs)
      if (run.arm === "runtime") run.elapsedMs = run.pair === 9 ? 116 : 110;
  });
  assert.equal(rejected.code, 1);
  assert.equal(rejected.output.valid, true);
});

test("a complete ten-minute two-workload soak can pass its retained-resource criteria", async () => {
  const result = await summarize(() => {}, soakFixture);
  assert.equal(result.code, 0);
  assert.equal(result.output.kind, "soak");
  assert.equal(result.output.pass, true);
});

test("short soaks or missing natural checkpoints cannot certify retention", async () => {
  const result = await summarize((report) => {
    report.runs[0].durationMs = 599_000;
    report.runs[1].samples.pop();
  }, soakFixture);
  assert.equal(result.code, 1);
  assert.equal(result.output.valid, false);
  assert.match(result.output.errors.join(" "), /duration|ten.minute|600/);
  assert.match(result.output.errors.join(" "), /sample|checkpoint/);
});

test("intermediate stylesheet growth and active streams fail even if teardown later looks clean", async () => {
  const result = await summarize((report) => {
    report.runs[0].samples[4].arms.runtime.styles.rules++;
    report.runs[1].samples[5].arms.runtime.activeStreams = 1;
  }, soakFixture);
  assert.equal(result.code, 1);
  assert.equal(result.output.pass, false);
  assert.match(result.output.errors.join(" "), /style|rule/);
  assert.match(result.output.errors.join(" "), /stream/);
});

test("retained heap fails per arm while gross RSS growth requests investigation only", async () => {
  const heap = await summarize((report) => {
    report.runs[1].arms.runtime.terminal.heapUsedBytes += 6 * 1024 * 1024;
  }, soakFixture);
  assert.equal(heap.code, 1);
  assert.equal(heap.output.valid, true);
  assert.equal(
    heap.output.resources.find((r) => r.workload === "dashboard" && r.arm === "runtime").heapPass,
    false,
  );
  const rss = await summarize((report) => {
    report.runs[0].arms.baseline.terminal.rss.totalBytes += 101 * 1024 * 1024;
  }, soakFixture);
  assert.equal(rss.code, 0);
  assert.equal(rss.output.resources[0].rssInvestigationRequired, true);
});

test("missing or already-completed cancellation observations cannot certify soak cleanup", async () => {
  const result = await summarize((report) => {
    report.runs[0].cancellations.pop();
    report.runs[1].cancellations[0].partialBefore = "dashboard complete";
  }, soakFixture);
  assert.equal(result.code, 1);
  assert.match(result.output.errors.join(" "), /cancellation/i);
  assert.match(result.output.errors.join(" "), /partial|incomplete/i);
});

test("unknown report kinds fail closed", async () => {
  const result = await summarize((report) => {
    report.kind = "unrecognized";
  });
  assert.equal(result.code, 1);
  assert.equal(result.output.valid, false);
});

test("incorrect excluded warmup output also invalidates the session", async () => {
  const result = await summarize((report) => {
    report.cold[0].actualTextSha256 = "0".repeat(64);
  });
  assert.equal(result.code, 1);
  assert.match(result.output.errors.join(" "), /output|text/);
});

test("a matching partial inventory cannot stand in for all frozen manifest inputs", async () => {
  const result = await summarize((report, manifest) => {
    manifest.inputs = { artifact: "1".repeat(64), omitted: "2".repeat(64) };
    report.fixtureManifestSha256 = createHash("sha256")
      .update(JSON.stringify(manifest))
      .digest("hex");
  });
  assert.equal(result.code, 1);
  assert.match(result.output.errors.join(" "), /inventory|frozen.*input/i);
});

test("input latency recorded after stream completion is not accepted as streaming input", async () => {
  const result = await summarize((report) => {
    report.runs[0].inputObservation.activeAfter = 0;
  });
  assert.equal(result.code, 1);
  assert.equal(result.output.valid, false);
  assert.match(result.output.errors.join(" "), /input.*stream/i);
});

test("a changed installed package file invalidates unchanged fixture inputs", async () => {
  const result = await summarize((report) => {
    report.integrity.installed.after["installed-0"] = "0".repeat(64);
  });
  assert.equal(result.code, 1);
  assert.match(result.output.errors.join(" "), /installed.*inventory/i);
});

test("a digest cannot substitute for preserved final raw source", async () => {
  const result = await summarize((report) => {
    delete report.runs[0].actualText;
  });
  assert.equal(result.code, 1);
  assert.match(result.output.errors.join(" "), /output.*text/i);
});

test("dashboard readiness rejects unpainted bars even with the correct element count", async () => {
  const result = await summarize((report) => {
    report.runs.find((run) => run.workload === "dashboard").visibleBarCount = 0;
  });
  assert.equal(result.code, 1);
  assert.match(result.output.errors.join(" "), /visible|bar/i);
});

test("paced input evidence requires an actual changed value", async () => {
  const result = await summarize((report) => {
    report.runs[0].inputObservation.valueBefore = "unchanged";
    report.runs[0].inputObservation.valueAfter = "unchanged";
  });
  assert.equal(result.code, 1);
  assert.match(result.output.errors.join(" "), /input.*value/i);
});
