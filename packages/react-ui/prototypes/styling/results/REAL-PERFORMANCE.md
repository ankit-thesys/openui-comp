# Real OpenUI performance results

Measured 2026-10-23T12:33:03.970Z; React 19.3.1, Goober 2.1.19. Apple M3 Pro, arm64, Node v22.22.2, Chrome 156.0.8078.47.

This measures actual OpenUI components, the headless streaming adapter and incremental parser/Renderer, comparing existing Sass CSS against equivalent CSS generated through Goober **at build time**. Both arms have identical JavaScript and no Goober runtime. The same production components are used, not a completed CSS-in-JS rewrite.

Correctness: 72 measured browser runs, 0 reported failures; 3096/3096 measured SSR responses, 0 reported failures. Warmups are excluded from timing tables. See [scope/reproduction and remaining coverage](../REAL-PERFORMANCE.md).

This pass shows no material browser slowdown from the tested static-generation path: paired median total-time changes range from roughly −1.8% to 0.0%. Treat small apparent improvements as run/frame scheduling variation, not a Goober speedup. Both workloads retained matching content and styles. This finding does not cover runtime Goober generation.

## Browser streaming

Rows show the median of complete runs. Paired delta is the median of candidate-minus-baseline within each pair, so it need not equal the difference between displayed medians. CPU 4× is a simulation. These small cohorts are descriptive evidence, not a statistical non-inferiority result.

| Workload | Panels/blocks | CPU | Pairs | Total baseline → generated ms | Paired change | Parser total baseline → generated ms | Update p95 baseline → generated ms |
|---|---:|---:|---:|---:|---:|---:|---:|
| chat | 5 | 1× | 10 | 825.2 → 813.1 | -9.0 ms / -1.1% | 7.9 → 7.5 | 34.7 → 35.3 |
| dashboard | 5 | 1× | 10 | 1511.9 → 1511.5 | -0.4 ms / -0.0% | 19.6 → 19.9 | 34.0 → 34.0 |
| chat | 20 | 1× | 5 | 842.8 → 828.6 | -14.8 ms / -1.8% | 12.0 → 11.6 | 36.8 → 34.6 |
| dashboard | 20 | 1× | 5 | 1543.2 → 1544.2 | -0.2 ms / -0.0% | 35.3 → 33.0 | 34.5 → 34.2 |
| chat | 5 | 4× | 3 | 813.4 → 813.2 | -1.0 ms / -0.1% | 16.7 → 17.2 | 50.4 → 49.7 |
| dashboard | 5 | 4× | 3 | 1496.6 → 1495.1 | +0.0 ms / +0.0% | 41.9 → 44.2 | 50.3 → 50.1 |

| Workload / size / CPU | Stream baseline → generated ms | Final catch-up baseline → generated ms | Input p95 baseline → generated ms | Long-task ms baseline → generated | Paired total delta range ms |
|---|---:|---:|---:|---:|---:|
| chat / 5 / 1× | 794.7 → 792.2 | 29.7 → 21.7 | 31.9 → 31.9 | 0.0 → 0.0 | -18.6 to +16.9 |
| dashboard / 5 / 1× | 1484.9 → 1485.0 | 27.4 → 27.5 | 31.8 → 31.7 | 0.0 → 0.0 | -1.5 to +3.2 |
| chat / 20 / 1× | 815.2 → 809.4 | 26.6 → 22.5 | 31.4 → 29.8 | 0.0 → 0.0 | -16.1 to +1.4 |
| dashboard / 20 / 1× | 1522.4 → 1523.7 | 25.9 → 18.1 | 31.7 → 31.4 | 0.0 → 0.0 | -17.6 to +1.1 |
| chat / 5 / 4× | 790.7 → 789.3 | 22.9 → 22.6 | 30.8 → 29.9 | 0.0 → 0.0 | -16.9 to +0.7 |
| dashboard / 5 / 4× | 1476.3 → 1474.9 | 20.3 → 21.4 | 31.0 → 30.4 | 0.0 → 0.0 | -1.5 to +3.2 |

Streaming totals include deterministic chunk pacing. Update/input observations end at two animation-frame callbacks, not actual paint or field INP. The chunk sender honors backpressure and schedules after each write; there is no fixed-arrival-rate queue test. Timings start after assets load. Parser timings are instrumented equally in both arms. Chrome native/4× results do not replace a browser/framework matrix.

## Payload and CSS parity

All 7825 ordered CSS declarations match selector/condition ancestry, value and importance. CSS gzip: 38546 → 38553 bytes (+7). Brotli: 29495 → 29527 bytes. Client JavaScript is identical: 920420 bytes gzip; the broad library registration is common overhead, not a Goober increase. Sizes are local compression estimates, not transfer measurements.

A naive whole-stylesheet string conversion failed semantic parity; the tested ordered AST adapter fixes that for the current stylesheet. This adapter and automatic integration would be OpenUI-maintained tooling.

## Standalone React streaming SSR pressure

Concurrency 1/10/25/50; three short repetitions per arm/cell, size 2, 25 ms deliberate Suspense delay. Values are the median of the three batch p95s/throughputs, not a pooled p95. Two SSR panels cannot be compared directly with twenty-panel browser timings.

| Workload | Concurrency | Responses across arms | End p95 baseline → generated ms | TTFB p95 baseline → generated ms | Throughput baseline → generated responses/s |
|---|---:|---:|---:|---:|---:|
| chat | 1 | 18 | 33.1 → 31.6 | 1.1 → 0.9 | 30.5 → 32.1 |
| chat | 10 | 180 | 51.2 → 61.4 | 20.1 → 23.4 | 199.2 → 187.1 |
| chat | 25 | 450 | 74.4 → 81.4 | 40.3 → 41.4 | 371.9 → 345.6 |
| chat | 50 | 900 | 105.9 → 106.3 | 48.5 → 57.6 | 498.3 → 493.0 |
| dashboard | 1 | 18 | 32.0 → 32.9 | 1.1 → 0.9 | 32.3 → 31.6 |
| dashboard | 10 | 180 | 60.0 → 53.3 | 26.0 → 21.7 | 177.5 → 203.1 |
| dashboard | 25 | 450 | 79.5 → 84.0 | 43.8 → 51.0 | 326.5 → 310.5 |
| dashboard | 50 | 900 | 139.5 → 125.1 | 70.1 → 80.4 | 404.1 → 413.7 |

4 separate-chunk canaries. Abort result: 10/10 recorded; active after cleanup 0. Per-request timing rows and batch CPU/RSS/event-loop snapshots are retained in [raw SSR results](real-ssr.json).

Server RSS rose from 204.4 to 469.3 MiB over the shared process. That is retained process memory/GC state across both arms, not a per-arm allocation or proof of a leak; an idle-checkpoint soak is still needed. Event-loop snapshots are cumulative, not per-cell histograms.

These are local bounded closed-loop batches. Both SSR arms render identical source and differ only in linked stylesheet URL. The Node client does not fetch CSS, hydrate, or validate theme CSS. Theme assertions check request markers. Throughput differences are not a Goober speedup/slowdown claim. High-concurrency queueing describes this shared-machine fixture, not deployment capacity. No sustained soak or retained-memory verdict.

## Your exported measurements

The earlier synthetic export contained one pair per workload. Chat took 10.66 → 10.72 seconds. Both dashboard arms fell behind: 24.10 → 24.56 seconds for ten nominal seconds, with p95 scheduling backlog above thirteen seconds. This is evidence of saturation in both controls, not a Goober-specific regression. Input activity was unequal; dashboard had no input samples. See [sanitized analysis](user-measurements-summary.md).

## Decision boundary

Use this evidence to judge the bounded static-generation approach, not to approve the complete migration. Remaining work includes full ChatProvider/shell integration, hand-authored component styles, real Next SSR hydration and theme CSS, network/first-paint checks, framework and browser coverage for the real library, long-session teardown soak, sustained/open-loop load and repeat sessions. No production components were migrated.

[Structured summary and source hashes](real-summary.json) · [browser raw results](real-browser.json) · [build inventory](real-build.json)
