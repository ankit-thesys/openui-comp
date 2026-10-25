# V5 matched performance results — issue #17

The fresh formal V5 benchmark and both ten-minute memory soaks passed their
pre-agreed checks. This is a scoped local performance result, not blanket beta
readiness or migration approval. Independent reproduction remains pending.
The worker released its browser window after the runs; no owned browser remains.

## Frozen inputs and execution

- W1 handoff commit: `63b7342c9`; runner commit: `819385b55`.
- Exact manifest SHA-256: `58f29005e395f360e521bc8f01992d5dc5ef2c8989861010b37802e5ebdda856`.
- All 10,866 frozen inputs and an independently enumerated 2,765 installed files
  matched before and after each run. The browser inventory includes 340 regular
  files and five symlinks. Archive copies contain the manifest and runner snapshots.
- Chrome for Testing 156.0.8078.47, mac-arm64; Node v22.22.2;
  Playwright 1.59.1. Browser executable SHA-256:
  `34fbfdb52aacee492bbada9972bf323eba663f8d8a069f86e2652e5158d6c580`.
  The complete browser metadata and locally computed checksums are in
  `v5-measured-summary.json` and both manifests; these are not vendor checksum claims.
- Benchmark: 2026-10-25 22:14:54–22:16:47 Asia/Kolkata.
  Soaks: 22:17:34–22:38:12. Raw timestamps use UTC.
- Actual installed OpenUI Renderer/parser, HTTP UTF-8 streaming and ordinary React
  response state; isolated baseline/runtime applications. Formal performance uses
  plain CSS with host stylesheet order `before`. Earlier framework compatibility
  runs are separate evidence.

There were eight excluded first-stream records, then ten alternating pairs in
each of four cells: 80 measured streams. No thresholds or component code changed.
The summaries reproduced exactly from the saved reports through `summarize.mjs`.

## Completion timing

Completion means exact final assistant source plus idle state. Values are ms.
Limits are at most 10% median and 15% p95 regression, separately in every cell.

| Workload/load    | Baseline median | Runtime median | Change | Baseline p95 | Runtime p95 | Change |
| ---------------- | --------------: | -------------: | -----: | -----------: | ----------: | -----: |
| Chat/paced       |         244.859 |        244.034 | -0.34% |      248.963 |     247.827 | -0.46% |
| Chat/stress      |         170.084 |        173.365 | +1.93% |      175.637 |     176.058 | +0.24% |
| Dashboard/paced  |         292.222 |        292.041 | -0.06% |      295.534 |     296.281 | +0.25% |
| Dashboard/stress |         176.677 |        178.291 | +0.91% |      191.852 |     195.543 | +1.92% |

Each arm/cell has ten observations; nearest-rank p95 is the maximum observation.
These are local point estimates, not production percentiles or confidence intervals.
The separate rendered-readiness diagnostic also passed all bounds: final DOM
counts/text and positive chart-bar geometry followed by two animation frames.
It does not measure paint or field INP.

Paced input-command p95 was 5.086/4.835ms for baseline/runtime chat and
3.881/3.409ms for dashboard, below the 100ms limit in each arm. Values changed
while streams remained active. This measures Playwright fill-command roundtrip,
not field INP.

## Memory, cleanup and styles

After 12 warmup cycles per workload, chat ran 600,295.784ms (483 measured cycles)
and dashboard 600,232.316ms (467 cycles). Each had 20 natural checkpoints,
with maximum lateness 1,731.355ms and 1,289.840ms respectively from the 30-second
target. Samples follow completed matched cycles. There were 48 genuine
cancellations per chat arm and 46 per dashboard arm.

Warm and terminal retained-heap endpoints use two standard garbage collections;
natural checkpoints use none. All checkpoints precede tab closure. No memory
pressure, profiling or additional collection was applied during measurement.

| Workload/arm       | Retained JS growth MiB | Endpoint aggregate RSS growth MiB | Maximum natural RSS growth from warm MiB |
| ------------------ | ---------------------: | --------------------------------: | ---------------------------------------: |
| Chat/baseline      |                  0.211 |                          -178.469 |                                  +16.172 |
| Chat/runtime       |                  0.367 |                          -226.859 |                                   +9.578 |
| Dashboard/baseline |                  0.362 |                           -54.078 |                                  +74.125 |
| Dashboard/runtime  |                  0.491 |                          -106.047 |                                  +37.156 |

Retained JS growth stayed below 5MiB in every arm/workload. No endpoint or natural
RSS growth exceeded the 100MiB investigation level. RSS sums process resident
memory and can count shared pages more than once; it is not private app memory.
Per-process-type endpoint totals were reviewed separately: browser, renderer,
GPU, network and storage each decreased in every arm/workload. The raw reports
retain every process sample; `v5-measured-summary.json` contains the per-type
endpoint changes and natural aggregate peaks.

Active streams and timers were zero at every checkpoint. Styles stayed constant
from warm through all natural and terminal checkpoints: baseline had zero inline
style tags/bytes and 2,010 rules from external styles; runtime had one style tag,
217,642 inline CSS bytes and 1,428 rules. This shows a plateau, not removal of
unused CSS or elimination of the eager stylesheet cost.

## Evidence and remaining limits

`v5-benchmark.tgz` and `v5-soak.tgz` preserve exact raw manifests, reports,
original/reproduced summaries and runner snapshots. `v5-archives.sha256` pins
both archives and this measured metadata summary. Earlier V1–V4 attempts,
static/patched prototypes and Chrome lifecycle diagnostics remain separate and
were not pooled into these results. Harness source was unchanged during V5;
its 34 tests passed before measurement (`cft-harness-tests.log.gz`).

These are deterministic local workloads. The ten-minute soaks use paced cells,
not stress cells. Warm timing does not settle cold startup, bundle cost, font
emission or eager styles; the eight cold records are diagnostic only. SSR,
hydration, concurrent SSR, headless chat-store/AG-UI, OpenUIChat shell and
AgentInterface integration are outside this result. Legacy code was read-only;
its existing missing `eve/client` strict-type failure remains disclosed.
The separate default HorizontalBar string-height/legend-fit issue is not waived;
these workloads use the stable vertical BarChart configuration. No claim of
universal error-free behavior or all-chart compatibility follows from this pass.
