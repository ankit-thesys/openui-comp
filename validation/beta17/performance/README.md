# #17 matched performance validation

The fresh formal V5 benchmark (80 measured streams) and both ten-minute soaks
passed the agreed checks. See [the scoped report](evidence/V5-REPORT.md) and its
exact archived raw evidence. Independent reproduction remains pending; these
results do not authorize migration or establish blanket beta readiness.

The synthetic unit fixtures test the evidence validator rather than OpenUI.
Pinned-browser diagnostic readiness is documented in `CFT-HANDOFF.md` and
`evidence/CFT-READINESS.md`. V1–V4 failures, interrupted samples and diagnostic
runs remain historical evidence, separate from V5.

## Handoff and execution

Agree `CONTRACT.md` and the pinned browser additions in `CFT-HANDOFF.md` with
Worker1 before using the runner. Do not change transport,
component code or replay payloads to accommodate a failed check. The contract
requires ordinary DOM controls and public runtime outputs, session-scoped server
stats and identical replay schedules in isolated baseline/runtime applications.
Worker1 owns package resolution/build inspection, all component/chart/state
functional coverage, the artifact inventory and the first browser window.

After independent harness review and the explicit release, run each mode in its
own new output directory. Node must support `import.meta.dirname`. Playwright
must already exist in the frozen consumer or be provided as an absolute module
path via `BETA17_PLAYWRIGHT_MODULE`; no dependencies are installed by this runner.

```sh
BETA17_QUIET_WINDOW_RELEASED=yes node validation/beta17/performance/run.mjs benchmark /absolute/frozen-manifest.json /absolute/new-benchmark-results
BETA17_QUIET_WINDOW_RELEASED=yes node validation/beta17/performance/run.mjs soak /absolute/frozen-manifest.json /absolute/new-soak-results
node validation/beta17/performance/summarize.mjs /absolute/new-benchmark-results/manifest.json /absolute/new-benchmark-results/report.json
```

The runner refuses an existing results directory and preserves partial reports
on failure. It hashes frozen inputs before and after, copies the exact manifest
and its runner source, and records Node/Chrome versions. The release environment
variable records an operator action; it cannot independently establish that
another person has released the browser window.

## Measurement meaning

Chat and dashboard each have paced and stress cells. Each cell gets one excluded
first stream per arm, then ten alternating baseline/runtime pairs (80 measured
streams). Main completion is exact final assistant source plus idle state.
Rendered correctness additionally requires the fixture's final DOM counts/text
and two animation frames; its elapsed time is a separate diagnostic, not a
browser paint or field INP measurement. Input-command latency is measured during
paced streaming separately for each workload and arm.

Each workload soak uses separate owned Chrome processes per arm, 12 warmup
cycles, at least ten minutes, repeated mount/unmount/theme changes, cancellation
on every tenth cycle, and natural samples at 30-second target intervals after
cycles finish. Record actual sampling lateness. Warm and terminal retained-heap
snapshots use two standard Chrome garbage collections; natural samples do not.
All acceptance checkpoints occur after unmount and before tab closure or memory
pressure. `SystemInfo.getProcessInfo` plus `ps` records per-process RSS; process
sampling failure invalidates that run rather than silently reporting zero.

The summary requires correctness and complete paired evidence before evaluating
median <=10% / p95 <=15% regression per cell. Each arm/workload input-command p95
must be <=100ms. Soak retained JS growth must be <=5MiB per arm/workload, stylesheet
counts/rules/bytes must plateau, and active streams/timers must be zero at each
checkpoint. RSS growth >100MiB requests investigation; it does not automatically
fail the heap criterion. Preserve process breakdowns for that investigation.

SSR, hydration and concurrent server rendering remain deferred. This runner
cannot certify them. Old static/patched and source-integration prototype results
remain historical comparisons, not installed-artifact acceptance. Keep the
known default HorizontalBar height/legend-fit gap explicit in final readiness;
a stable workload configuration does not waive all-chart coverage.

## Harness checks

```sh
node --test validation/beta17/performance/tests/*.test.mjs
```

The cancellation test opens one short-lived local HTTP server and closes it. All
other tests use CLI report fixtures and require no browser or OpenUI build.
