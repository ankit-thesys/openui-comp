# Goober / OpenUI streaming performance validation

Status: staged prototype test plan, not performance approval. User confirmed chat and dashboard workloads have equal priority. The stylesheet-order compatibility fix is captured at prototype commit `09a336f3`. A bounded real-component replay and standalone SSR pressure pass is now implemented; see [scope and reproduction](REAL-PERFORMANCE.md) and [results](results/REAL-PERFORMANCE.md). The complete matrix below remains the adoption-validation plan, not a checklist already completed. React 19 is accepted; Goober/static-CSS adoption remains pending.

## Decision to make

Does the generated-static-CSS approach materially regress first usable UI, streaming responsiveness, memory, or server capacity compared with existing react-ui? Identify whether any regression comes from style delivery, generated payload, parsing, React rendering, chart work, or browser style/layout/paint.

Keep the existing package and migration boundaries unchanged. Charts remain in core; AgentInterface is not being ported. Existing chat interfaces may be used unchanged as a benchmark harness.

## What we know now

The build generates Goober rules once; installed external-delivery components reuse class names. That removes render-time Goober generation from this path, but does not eliminate browser CSS calculation or React work. Compatibility checks prove correct styles, not acceptable latency under load.

A standalone minified bundle of the installed prototype Button, with React externalized, is 4,532 bytes of JavaScript (1,164 gzip) plus a generated stylesheet of 1,747 bytes (592 gzip). These are local compression estimates, not whole-app transfer measurements or costs per component. The bundle contains no Goober runtime. It DOES retain both layered and unlayered CSS strings in JavaScript despite the external stylesheet: investigate separate class-only runtime metadata and build-time CSS artifacts before scaling to the full component set. Preserve the current build as the pre-optimization comparison.

See [preflight measurements](results/performance-preflight.json). The npm tarball's compressed size is not a browser bundle size. No conclusion about full OpenUI performance can be extrapolated from this small fixture.

## Exercise both kinds of streaming

1. **SSR streaming:** first server HTML, stylesheet availability, hydration and later Suspense content. Check cold and warm caches, slow CSS delivery, concurrent requests, cancellation and theme isolation.
2. **AI response streaming:** replay a fixed response through the real adapter/store, parser and Renderer while the user types, scrolls and clicks. Track accumulated-text growth, render cost and final correctness. A delayed Button alone cannot represent this workload.

Current integration points in the planning fork:

- `packages/react-headless/src/stream/processStreamedMessage.ts`: accumulates deltas; schedules message updates with requestAnimationFrame. Record received chunks separately from published updates because batching is expected.
- `packages/react-ui/src/components/OpenUIChat/GenUIAssistantMessage.tsx`: passes accumulated response and isStreaming to Renderer.
- `packages/react-lang/src/hooks/useOpenUIState.ts`: updates the incremental parser with the current program.
- `packages/react-lang/src/Renderer.tsx`: renders component implementations supplied by the library.
- `benchmarks/run-benchmark.ts`: token-count and estimated model latency comparison; this does not measure browser streaming performance. Existing sample responses may be reusable after validating them against the pinned library version.

## Matched comparisons

Use isolated pages, identical React/Next/parser versions, component props, output DOM, data, animations, schemas and request schedules. Pin commits and dependency locks. Do not mix old/new global CSS in one document.

| Comparison | Purpose |
| --- | --- |
| Existing real react-ui components with their built CSS | Production behavior baseline |
| Same representative components with Goober-generated CSS and automatic early import | Candidate; styling is the only intentional change |
| Existing small Button with hand-authored equivalent static CSS | Fast diagnostic control for delivery overhead; not a replacement for real-component validation |

First build a parity-checked vertical slice: Button, Input, Card, text/markdown, Table and one existing chart implementation. Use the same renderer and kit library mappings for both real-component variants; swap only implementations/styles. Include unchanged chat shell/scroll behavior as integration context. Missing components must be reported as missing coverage, not substituted with simplified SVG charts or buttons and called OpenUI validation.

Run matched route bundles plus an installed full-library size audit. A subset import should not accidentally pull every chart dependency or all kit styles. Distinguish installed-source size, build output, and assets actually requested by the route.

## Workload ladder

Use deterministic local replay with no live model/API calls. Store exact payload bytes, timestamps, chunk boundaries and random seed. Chunks are transport pieces, not tokens or React commits. Boundaries must include partially formed strings and component expressions. Always assert the final parsed/rendered result matches the completed input.

| Workload | Starting coverage |
| --- | --- |
| Typical chat | 25 visible components; 10 KB response; 20 chunks/second |
| Dense streamed UI | 100 visible components; 100 KB response; 60 chunks/second |
| Stress UI | 500 visible components; up to 500 KB response; 120 chunks/second with controlled bursts |
| Table/chart | 100 then 1,000 table rows; 100, 1,000 then 10,000 chart points; identical animation settings |
| Long conversation | 20 then 100 historical messages plus one active response; scroll away and back |
| Recovery | Abort/restart, route navigation, repeated mounts, theme change and portal open/close during streaming |
| Soak | 10 minutes of repeat streams; periodically unmount and return to the same idle state |

These are proposed synthetic tiers, not claims about production traffic. Record bytes/second and actual achieved rates. Avoid a full Cartesian product: start with normal/stress cases in plain CSS and Tailwind v3, then Tailwind v4; use Bootstrap/no-framework as smoke comparisons. Expand only for a regression or a supported scenario not otherwise represented.

## Measurements

| Area | What to collect |
| --- | --- |
| First content | TTFB, first HTML chunk, CSS transfer/ready, first correctly styled meaningful component, hydration-ready |
| Streaming | Chunk receipt → store publish → parser → React commit → next presentation opportunity; p50/p95 and maximum; final catch-up latency |
| Responsiveness | Scripted typing/click event-to-next-paint latency and scroll frame gaps during the stream; no lost input |
| Main thread | Long tasks, supported long-animation-frame entries, browser traces separating JS, style recalculation, layout and paint |
| Rendering | Commit count/duration and component counts in a separate production-profiling build |
| Payload | Per-route JS/CSS raw and actual encoded transfer, CSS strings duplicated in JS, unused framework modes/styles and chart dependency inclusion |
| Memory | Heap/DOM/stylesheet/rule counts over time and after repeated teardown; server RSS/heap and event-loop delay |
| Server | TTFB and final chunk latency distributions, completed streams/second, errors, cancellations, CPU and memory at each concurrency level |

Use ordinary production builds for headline timings. React Profiler adds overhead and is disabled in ordinary production builds: enable a profiling build only for attribution and label those results separately. Browser frame callbacks are presentation proxies, not proof of exact pixel paint; corroborate selected traces/screenshots. Feature-detect browser performance APIs and mark missing metrics unavailable. Do not label a few scripted interactions as field INP.

## Pressure-testing protocol

1. **Inventory and control:** record machine/OS, CPU, browser versions, commits, assets and dependency locks; reproduce correctness. Save the existing duplicated-metadata bundle before optimizing.
2. **Client pilot:** 5 warmups and 30 alternating paired runs per primary case, one browser at a time. Keep cold and warm caches separate. Reuse exact replay schedules. Record all runs, errors and outliers with a stated exclusion rule; no cherry-picking.
3. **Device sensitivity:** Chrome native speed, then a documented 4× CPU slowdown with 1.6 Mbps down / 150 ms RTT as a simulation, not certification of a real phone. WebKit native-speed cross-check. Firefox remains unavailable until the launch problem is resolved.
4. **SSR server load:** local production server, bounded concurrent streams at 1, 10, 25 and 50. Warm up, then measure at least 60 seconds per tier; report sample count. Test aborts and theme isolation. Fixed concurrency shows saturation; additionally replay a fixed arrival schedule and record offered, admitted, queued and completed requests so slow runs do not hide queueing. Stop on sustained failures or memory exhaustion.
5. **Separate contention:** do not run browser responsiveness tests and server saturation tests simultaneously on this laptop. Monitor the load generator. Treat results on one shared machine as comparative evidence, not a production capacity claim; repeat final capacity checks with a separate generator and deployment-like host.
6. **Soak and cleanup:** compare retained memory at the same idle checkpoints; use forced GC only in a separately labeled diagnostic run. Verify mounted styles plateau for a fixed installed component set and that teardown leaves no growing subscriptions/detached trees.
7. **Repeat and summarize:** repeat the primary matrix in a second session. Summarize paired differences and confidence intervals using runs as the independent unit. Correlated chunks within one stream are not independent samples. Unstable or contradictory results are inconclusive and trigger a focused rerun.

## Proposed acceptance budgets

These are provisional project budgets, not industry guarantees or approved product SLOs. Freeze them before interpreting results. For normal/dense workloads, candidate p95 must satisfy the larger of the stated relative and absolute allowances over the matched baseline:

- First correctly styled meaningful UI: at most 10% or 50 ms slower.
- Chunk-to-visible-update proxy: at most 10% or 16 ms slower; no unbounded backlog, missing final content or stalled stream.
- Scripted input response: p95 at most 200 ms on the defined test profile and no regression beyond 10% or 16 ms. A slow baseline does not excuse failing the absolute responsiveness target.
- Server TTFB/final-chunk p95: at most 10% or 20 ms slower at the same non-saturated load; completed throughput at least 90% of baseline, with no extra errors or leaked request state.
- Fixed-workload client stylesheet/rule counts must plateau. After teardown, investigate retained-heap growth exceeding 10% or 5 MB versus baseline and any sustained upward trend. Do not classify allocator noise as a proven leak.
- Initial matched-route payload: investigate increases over 5 KB gzip CSS or 2 KB gzip JS. These are review triggers; full-set budgets follow the inventory. No claim that CSS-first loading is free or that identical styling requires less CSS.

Stress tiers find the failure point; report capacity and recovery rather than promising 60 fps for arbitrary large tables/charts. Correctness, input loss, hydration failure, unstyled content, or unbounded growth are blockers regardless of average timings. Do not optimize by dropping required visuals, disabling animation only for one variant, or changing stream batching only in the candidate.

## Execution order and deliverables

1. Bundle inventory and isolated delivery/replay harness.
2. Real-component parity slice and the normal/dense streaming matrix.
3. Heavy charts/tables, SSR pressure, slow-device sensitivity and soak.
4. Investigate regressions, rerun only affected cases plus correctness checks, then decide.

Generate `performance.json`, a short comparison report, raw replay fixtures, failure artifacts and a small set of diagnostic traces from one reproducible command. Include commit/version information, measured vs unavailable status, per-stage time attribution, bundle deltas, and the maximum tested workload. Do not call the plan complete merely because a Button microbenchmark passes.

The first harness and prototype-only measurements should be a bounded initial pass. A credible full-OpenUI verdict additionally depends on implementing and validating the real-component slice; do not fold that unmeasured work into a promised short completion time.

## Current assessment

Low per-update styling overhead is plausible because Goober runs at build time. It is not established by timing evidence. The immediate measurable risk is carrying CSS in both the initial stylesheet and runtime metadata; the broader risks are full-library payload, repeated parsing/rendering, and chart/table layout work. Performance approval stays pending until the matched real-component streaming matrix passes.

## Instrumentation references

- [React Profiler: measurements and production profiling overhead](https://react.dev/reference/react/Profiler)
- [Long Animation Frames API: metrics and availability limits](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceLongAnimationFrameTiming)
