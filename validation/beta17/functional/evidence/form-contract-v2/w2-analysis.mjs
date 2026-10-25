import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { arms, loads, pairOrder, thresholds, workloads } from "./protocol.mjs";

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
const p95 = (values) => [...values].sort((a, b) => a - b)[Math.ceil(values.length * 0.95) - 1];
const within = (value, baseline, percent) => value <= baseline + (baseline * percent) / 100;

export function cancellationErrors(observation, expectedText) {
  const errors = [];
  if (observation.activeBefore !== 1)
    errors.push("Cancellation did not observe one active session stream");
  if (
    typeof observation.partialBefore !== "string" ||
    observation.partialBefore.length === 0 ||
    observation.partialBefore.length >= expectedText.length ||
    !expectedText.startsWith(observation.partialBefore)
  )
    errors.push("Cancellation did not observe a genuine incomplete partial response");
  if (!["AbortError", "net::ERR_ABORTED", "ERR_ABORTED"].includes(observation.abortError))
    errors.push("No aborted-request observation");
  if (observation.activeAfter !== 0 || observation.timersAfter !== 0)
    errors.push("Cancellation left live streams or timers");
  if (observation.cancelledAfter !== observation.cancelledBefore + 1)
    errors.push("Server did not observe this cancellation");
  return errors;
}

function integrityErrors(manifest, report, manifestSha256) {
  const errors = [...(report.errors ?? [])];
  if (report.schemaVersion !== 1 || manifest.schemaVersion !== 1)
    errors.push("Unsupported evidence schema");
  if (
    !manifest.inputs ||
    !Object.keys(manifest.inputs).length ||
    !isDeepStrictEqual(report.integrity?.before, manifest.inputs)
  )
    errors.push("Frozen input inventory is missing, partial or different from the manifest");
  if (report.fixtureManifestSha256 !== manifestSha256)
    errors.push("Fixture manifest identity changed");
  const installed = report.integrity?.installed;
  if (
    !installed?.before ||
    Object.keys(installed.before).length < 5 ||
    !isDeepStrictEqual(installed.before, installed.after)
  )
    errors.push("Installed package inventory missing or changed");
  const before = report.integrity?.before;
  const after = report.integrity?.after;
  if (!before || !after || Object.keys(before).length === 0 || !isDeepStrictEqual(before, after))
    errors.push("Frozen input integrity changed or was not checked");
  if (
    before &&
    !Object.values(before).every(
      (value) => typeof value === "string" && /^[a-f0-9]{64}$/.test(value),
    )
  )
    errors.push("Invalid frozen input hashes");
  return errors;
}

export function summarizeBenchmark(manifest, report, manifestSha256) {
  const errors = integrityErrors(manifest, report, manifestSha256);
  if (report.runs.length !== 80) errors.push("Expected 80 matched measured streams");
  const seen = new Set();
  for (const run of report.runs) {
    const key = `${run.workload}/${run.load}/${run.pair}/${run.arm}`;
    if (seen.has(key)) errors.push(`Duplicate matched pair sample: ${key}`);
    seen.add(key);
  }
  for (const run of [...report.runs, ...(report.cold ?? [])]) {
    const cell = manifest.cells[`${run.workload}/${run.load}`];
    const expected = createHash("sha256").update(cell.expectedText).digest("hex");
    if (run.actualText !== cell.expectedText || run.actualTextSha256 !== expected)
      errors.push(`${run.workload}/${run.load}/${run.arm}: incorrect final output text`);
    for (const [name, probe] of Object.entries(cell.expectedDom)) {
      if (run.domCounts?.[name] !== probe.count)
        errors.push(`${run.workload}/${run.load}/${run.arm}: wrong DOM count ${name}`);
    }
    if (
      run.requiredTextFound?.length !== cell.requiredText.length ||
      !run.requiredTextFound.every((value) => value === true)
    )
      errors.push(`${run.workload}/${run.load}/${run.arm}: missing required rendered text`);
    if (run.status !== "idle")
      errors.push(`${run.workload}/${run.load}/${run.arm}: stream not idle`);
    if (run.activeAfter !== 0 || run.timersAfter !== 0)
      errors.push(`${run.workload}/${run.load}/${run.arm}: live terminal streams or timers`);
  }
  for (const workload of workloads)
    for (const load of loads)
      for (let pair = 0; pair < thresholds.pairsPerCell; pair++)
        for (const arm of arms) {
          if (!seen.has(`${workload}/${load}/${pair}/${arm}`))
            errors.push(`Missing matched pair ${workload}/${load}/${pair}/${arm}`);
        }
  if (report.cold?.length !== 8) errors.push("Missing excluded first-stream cold observations");
  for (const workload of workloads)
    for (const load of loads) {
      for (const arm of arms) {
        const first =
          report.cold?.filter(
            (run) => run.workload === workload && run.load === load && run.arm === arm,
          ) ?? [];
        if (first.length !== 1)
          errors.push(`Expected one excluded first stream for ${workload}/${load}/${arm}`);
      }
      const ordered = report.runs
        .filter((run) => run.workload === workload && run.load === load)
        .map((run) => `${run.pair}/${run.arm}`);
      const expectedOrder = Array.from({ length: thresholds.pairsPerCell }, (_, pair) =>
        pairOrder(pair).map((arm) => `${pair}/${arm}`),
      ).flat();
      if (!isDeepStrictEqual(ordered, expectedOrder))
        errors.push(`${workload}/${load}: non-alternating matched run order`);
    }
  const timing = [];
  for (const workload of workloads)
    for (const load of loads) {
      for (const metric of ["elapsedMs", "renderedElapsedMs"]) {
        const stats = {};
        for (const arm of arms) {
          const samples = report.runs
            .filter((r) => r.workload === workload && r.load === load && r.arm === arm)
            .map((r) => r[metric]);
          if (!samples.every((value) => Number.isFinite(value) && value > 0))
            errors.push(`${workload}/${load}/${arm}: invalid ${metric} samples`);
          stats[arm] = { n: samples.length, median: median(samples), p95: p95(samples) };
        }
        timing.push({
          workload,
          load,
          metric,
          ...stats,
          medianChangePercent: (stats.runtime.median / stats.baseline.median - 1) * 100,
          p95ChangePercent: (stats.runtime.p95 / stats.baseline.p95 - 1) * 100,
          pass:
            within(
              stats.runtime.median,
              stats.baseline.median,
              thresholds.medianRegressionPercent,
            ) && within(stats.runtime.p95, stats.baseline.p95, thresholds.p95RegressionPercent),
        });
      }
    }
  for (const run of report.runs.filter((run) => run.load === "paced")) {
    const observed = run.inputObservation;
    if (
      observed?.activeBefore !== 1 ||
      observed?.activeAfter !== 1 ||
      observed?.statusBefore !== "streaming" ||
      observed?.statusAfter !== "streaming"
    )
      errors.push(
        `${run.workload}/${run.arm}: input command was not observed during active streaming`,
      );
  }
  const input = [];
  for (const workload of workloads)
    for (const arm of arms) {
      const samples = report.runs
        .filter((r) => r.workload === workload && r.load === "paced" && r.arm === arm)
        .map((r) => r.inputMs);
      if (!samples.every((value) => Number.isFinite(value) && value >= 0))
        errors.push(`${workload}/${arm}: invalid input-command samples`);
      input.push({
        workload,
        arm,
        n: samples.length,
        p95: p95(samples),
        pass: p95(samples) <= thresholds.inputCommandP95Ms,
      });
    }
  const valid = errors.length === 0;
  return {
    kind: "benchmark",
    valid,
    pass:
      valid &&
      timing.filter((r) => r.metric === "elapsedMs").every((r) => r.pass) &&
      input.every((r) => r.pass),
    renderedDiagnosticPass:
      valid && timing.filter((r) => r.metric === "renderedElapsedMs").every((r) => r.pass),
    timing,
    input,
    errors,
  };
}

export function summarizeSoak(manifest, report, manifestSha256) {
  const errors = integrityErrors(manifest, report, manifestSha256);
  if (report.runs.length !== 2) errors.push("Expected chat and dashboard soak records");
  const resources = [];
  for (const workload of workloads) {
    const records = report.runs.filter((run) => run.workload === workload);
    if (records.length !== 1) {
      errors.push(`Missing or duplicate ${workload} soak`);
      continue;
    }
    const run = records[0];
    if (!Number.isFinite(run.durationMs) || run.durationMs < thresholds.soakMs)
      errors.push(`${workload}: soak duration below ten-minute / 600000ms minimum`);
    if (!Number.isInteger(run.warmupCycles) || run.warmupCycles < thresholds.warmupCycles)
      errors.push(`${workload}: incomplete warmup`);
    if (!Number.isInteger(run.iterations) || run.iterations < 10)
      errors.push(`${workload}: insufficient complete cycles`);
    if (
      !Array.isArray(run.samples) ||
      run.samples.length < thresholds.soakMs / thresholds.sampleEveryMs
    )
      errors.push(`${workload}: missing natural checkpoints`);
    for (const arm of arms) {
      const endpoints = run.arms[arm];
      const checkpoints = [
        endpoints.warm,
        ...run.samples.map((sample) => sample.arms[arm]),
        endpoints.terminal,
      ];
      for (const checkpoint of checkpoints) {
        if (
          !Number.isFinite(checkpoint.heapUsedBytes) ||
          checkpoint.heapUsedBytes < 0 ||
          !Number.isFinite(checkpoint.rss.totalBytes) ||
          checkpoint.rss.totalBytes < 0
        )
          errors.push(`${workload}/${arm}: invalid memory metrics`);
        if (checkpoint.activeStreams !== 0 || checkpoint.activeTimers !== 0)
          errors.push(`${workload}/${arm}: live streams or timers at unmounted checkpoint`);
        for (const metric of ["styleTags", "rules", "cssBytes"]) {
          if (
            !Number.isInteger(checkpoint.styles[metric]) ||
            checkpoint.styles[metric] < 0 ||
            checkpoint.styles[metric] !== endpoints.warm.styles[metric]
          )
            errors.push(`${workload}/${arm}: stylesheet ${metric} did not plateau`);
        }
      }
      const retainedHeapGrowthMiB =
        (endpoints.terminal.heapUsedBytes - endpoints.warm.heapUsedBytes) / 1024 ** 2;
      const rssGrowthMiB =
        (endpoints.terminal.rss.totalBytes - endpoints.warm.rss.totalBytes) / 1024 ** 2;
      resources.push({
        workload,
        arm,
        retainedHeapGrowthMiB,
        heapPass: retainedHeapGrowthMiB <= thresholds.retainedHeapGrowthMiB,
        rssGrowthMiB,
        rssInvestigationRequired: rssGrowthMiB > thresholds.rssInvestigationGrowthMiB,
      });
      const observations = run.cancellations.filter((observation) => observation.arm === arm);
      const expectedCycles = Array.from(
        { length: Math.floor(run.iterations / 10) },
        (_, index) => index * 10 + 9,
      );
      if (
        !isDeepStrictEqual(
          observations.map((observation) => observation.cycle),
          expectedCycles,
        )
      )
        errors.push(`${workload}/${arm}: missing or duplicated cancellation cycles`);
      for (const observation of observations)
        errors.push(
          ...cancellationErrors(observation, manifest.cells[`${workload}/paced`].expectedText).map(
            (error) => `${workload}/${arm}: ${error}`,
          ),
        );
    }
    for (const [index, sample] of run.samples.entries()) {
      if (
        sample.targetMs !== (index + 1) * thresholds.sampleEveryMs ||
        !Number.isFinite(sample.elapsedMs) ||
        sample.elapsedMs < sample.targetMs ||
        sample.elapsedMs > run.durationMs ||
        (index > 0 && sample.elapsedMs <= run.samples[index - 1].elapsedMs)
      )
        errors.push(`${workload}: invalid natural checkpoint schedule`);
    }
  }
  return {
    kind: "soak",
    valid: errors.length === 0,
    pass: errors.length === 0 && resources.every((row) => row.heapPass),
    resources,
    errors,
  };
}
