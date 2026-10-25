import { createHash } from "node:crypto";

const hash = (value) => createHash("sha256").update(value).digest("hex");
export function benchmarkFixture() {
  const cells = {};
  const runs = [];
  const cold = [];
  for (const workload of ["chat", "dashboard"]) {
    for (const load of ["paced", "stress"]) {
      const expectedText = `${workload} complete`;
      cells[`${workload}/${load}`] = {
        expectedText,
        expectedDom: {
          tables: { selector: "table", count: 1 },
          ...(workload === "dashboard" ? { bars: { selector: "rect", count: 3 } } : {}),
        },
        requiredText: ["Done"],
        payloadSha256: hash(expectedText),
        scheduleSha256: hash(load),
      };
      for (const arm of ["baseline", "runtime"])
        cold.push({
          workload,
          load,
          arm,
          elapsedMs: 200,
          renderedElapsedMs: 230,
          actualText: expectedText,
          inputObservation: {
            valueBefore: "",
            valueAfter: "changed",
            activeBefore: 1,
            activeAfter: 1,
            statusBefore: "streaming",
            statusAfter: "streaming",
          },
          actualTextSha256: hash(expectedText),
          domCounts: { tables: 1, ...(workload === "dashboard" ? { bars: 3 } : {}) },
          visibleBarCount: workload === "dashboard" ? 3 : null,
          requiredTextFound: [true],
          status: "idle",
          activeAfter: 0,
          timersAfter: 0,
        });
      for (let pair = 0; pair < 10; pair++) {
        for (const arm of pair % 2 ? ["runtime", "baseline"] : ["baseline", "runtime"]) {
          runs.push({
            workload,
            load,
            pair,
            arm,
            elapsedMs: 100,
            renderedElapsedMs: 120,
            inputMs: load === "paced" ? 50 : null,
            actualText: expectedText,
            inputObservation: {
              valueBefore: "",
              valueAfter: "changed",
              activeBefore: 1,
              activeAfter: 1,
              statusBefore: "streaming",
              statusAfter: "streaming",
            },
            actualTextSha256: hash(expectedText),
            domCounts: { tables: 1, ...(workload === "dashboard" ? { bars: 3 } : {}) },
            visibleBarCount: workload === "dashboard" ? 3 : null,
            requiredTextFound: [true],
            status: "idle",
            activeAfter: 0,
            timersAfter: 0,
          });
        }
      }
    }
  }
  const manifest = {
    schemaVersion: 1,
    productCommit: "synthetic-test-only",
    inputs: { artifact: hash("fixed") },
    cells,
  };
  const report = {
    schemaVersion: 1,
    kind: "benchmark",
    fixtureManifestSha256: hash(JSON.stringify(manifest)),
    integrity: {
      installed: {
        before: Object.fromEntries(
          Array.from({ length: 5 }, (_, i) => [`installed-${i}`, hash("fixed")]),
        ),
        after: Object.fromEntries(
          Array.from({ length: 5 }, (_, i) => [`installed-${i}`, hash("fixed")]),
        ),
      },
      before: { artifact: hash("fixed") },
      after: { artifact: hash("fixed") },
    },
    errors: [],
    cold,
    runs,
  };
  return { manifest, report };
}

export function soakFixture() {
  const { manifest, report } = benchmarkFixture();
  report.kind = "soak";
  const snapshot = (heapUsedBytes = 10_000_000, totalBytes = 100_000_000) => ({
    heapUsedBytes,
    heapTotalBytes: 30_000_000,
    styles: { styleTags: 2, cssBytes: 1000, rules: 10 },
    dom: { documents: 1, nodes: 25, jsEventListeners: 4 },
    activeStreams: 0,
    activeTimers: 0,
    rss: { totalBytes, processes: [] },
  });
  report.runs = ["chat", "dashboard"].map((workload) => ({
    workload,
    durationMs: 600_001,
    iterations: 10,
    warmupCycles: 12,
    arms: Object.fromEntries(
      ["baseline", "runtime"].map((arm) => [
        arm,
        { warm: snapshot(), terminal: snapshot(11_000_000) },
      ]),
    ),
    samples: Array.from({ length: 20 }, (_, index) => ({
      targetMs: (index + 1) * 30_000,
      elapsedMs: (index + 1) * 30_000,
      arms: { baseline: snapshot(), runtime: snapshot() },
    })),
    cancellations: ["baseline", "runtime"].map((arm) => ({
      arm,
      workload,
      load: "paced",
      cycle: 9,
      activeBefore: 1,
      partialBefore: workload,
      abortError: "net::ERR_ABORTED",
      activeAfter: 0,
      timersAfter: 0,
      cancelledBefore: 0,
      cancelledAfter: 1,
    })),
  }));
  return { manifest, report };
}
