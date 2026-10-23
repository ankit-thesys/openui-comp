# Optimized owned runtime: fresh matched measurement round

Decision OPEN. All executed correctness gates passed, but performance and memory do not receive an overall pass. Runtime retains native-speed overhead and adverse concurrency-50 pressure; the long browser run retains an unresolved gross resident-memory signal despite stable JS/style counters and inconclusive short RSS replications.

## Timing and CSS

Ten alternating pairs per cell, excluded warmup pair, actual parser/Renderer and actual expanded FullChat HTTP/store. Renderer: 140 measured +14 warmup runs; FullChat:120+12. Equal chat/dashboard cells; expanded-only Renderer diagnostic separate. Exact final source and settled DOM/style parity passed. Timed snapshots are retained; settling and completed typing are outside completion timing. Input/event-to-frame and frame samples are proxies, not production INP. Cold readiness uses shared fixture bundles, not dedicated baseline/runtime shipping payloads.

| Native-speed cell | Baseline/runtime median ms | Median paired runtime change |
|---|---:|---:|
| Renderer chat |49.7 /54.3|+7.635%|
| Renderer dashboard |113.8 /117.25|+7.089%|
| Renderer expanded |181.55 /198.9|+9.757%|
| FullChat chat |139.3 /149.95|+4.336%|
| FullChat dashboard |144.0 /170.3|+17.220%|

Paced cells are near neutral and can hide work. Actual Renderer inline CSS totals:76,708B chat,97,392B dashboard,185,581B expanded (UTF8, including host style). Runtime FullChat readiness compiles66 records/135,731B; first expanded send compiles43 additional records/191,145B. Completed sampled FullChat total inline CSS339,692B including host style. The persistent unmounted soak reference retains326,245B; it is a different lifecycle state. Counters remain109 compiled records at warm and terminal; lookup/render/resource-emission attempt counters continue rising with work, as expected. compileMs includes record/adapter/guard construction, not isolated Goober cost. Emission attempts are not unique DOM resources. Baseline compile/render counters remain zero. Linked baseline stylesheet bytes are not included in inline style totals.

## Production Next document pressure

1,680 responses:1,260 measured +420 warmups, three measured replications per concurrency. Median replication p95 and requests/sec:

|Concurrency|Baseline p95 ms|Runtime p95 ms|Baseline RPS|Runtime RPS|
|---:|---:|---:|---:|---:|
|1|328.164|333.088|3.089|3.084|
|10|429.960|408.467|26.339|25.668|
|25|520.867|513.205|54.954|52.355|
|50|743.215|839.170|82.929|69.697|

Runtime decoded HTML452,383–490,025B versus baseline134,524–168,222B; runtime style-resource CSS306,320B. Node fetch reads inline runtime CSS but does not fetch baseline linked CSS. Validation scans/accounting are included in latency. This is local document-fetch/validation pressure, not complete-page latency or pure SSR capacity. Actual unseeded FullChat shell SSR is accompanied by separately labeled real Renderer/parser SSR; stored conversation SSR is not claimed. Forty client abort/health canaries do not instrument server-side SSR cancellation/drain.

## Twenty measured minutes of retention

Fresh processes per arm. Server baseline then runtime, five measured minutes each; browser runtime then baseline, five each. Warmup/setup/terminal controls are excluded. Natural checkpoints every30 seconds; forced GC only matching warmed and terminal idle/unmounted checkpoints. Unique numeric accents continue increasing. No build or other browser/CPU workload overlapped.

Server baseline300,252ms:9,145 full responses (4,573 chat/4,572 dashboard),1,017 client aborts; runtime300,270ms:9,141 (4,571/4,570),1,016 aborts. Each excludes30 warmups. Retained Node heap:baseline71,547,384→75,084,488B (+3,537,104);runtime73,618,848→76,552,832B (+2,933,984), within unchanged max(10%,5MiB) diagnostic budget. These concurrency10 counts are retention evidence, not throughput measurements.

Browser runtime300,020ms:774 full streams (387/387),44 pending +42 partial cancellations. Baseline300,094ms:788 (394/394),44+43. Each excludes8 warm full streams,2 pending+2 partial warm cancellations and4 canonical normalization streams (two warm/two terminal). Each cancellation waits actual running/content state and bounded backend drain; all passed. Warm/terminal reference is identical completed light-theme UI followed by unmount; raw natural terminal checkpoint remains separately retained.

Retained browser JS heap runtime chat25,945,432→27,440,436B (+1,495,004),dashboard26,008,076→27,391,920 (+1,383,844). Baseline chat24,490,556→25,893,080 (+1,402,524),dashboard24,533,700→25,881,096 (+1,347,396). Runtime terminal overhead is approximately1.45–1.55MB per page. All diagnostic budgets pass; DOM/listener/style-byte/style/rule deltas are zero at matched checkpoints. This does not prove leak absence.

### Unresolved resident memory

|Gross Chrome RSS bytes|Baseline|Runtime|
|---|---:|---:|
|Warmed matching GC|1,490,747,392|1,500,807,168|
|Terminal matching GC|1,436,532,736|1,754,169,344|
|Observed peak|1,993,375,744|2,027,913,216|

Runtime grows253,362,176B (+241.6MiB) from its warm checkpoint and ends317,636,608B (+302.9MiB) above baseline. Renderer category dominates:runtime905,822,208→1,182,892,032B (+277,069,824),baseline892,665,856→930,545,664 (+37,879,808). Runtime other categories shrink. Runtime natural RSS is1.836GB@30s,1.974GB@60s,peaks2.028GB@180s,2.015GB@300s,then1.754GB afterGC. Baseline peaks1.993GB@210s,1.777GB@300s,then1.437GB afterGC. Full per-process/category curves are in final-memory-analysis.json and raw checkpoints. CDP inventory includes4 renderer processes, browser,GPU,network/storage services; external Node driver is excluded. Summed RSS can double count shared pages and does not attribute allocations to CSS/native engines. Do not call this a memory fix or leak proof.

Three separate fresh-process60-second/arm RSS pairs alternate B/R,R/B,B/R, outside the20-minute soak. Median runtime-minus-baseline warm+3,801,088B,terminal-143,556,608B; high variability and the contrary long run leave attribution unresolved. All short canonical retention gates passed. Three pairs are not a confidence interval or production bound.

## Reproduction and provenance

Candidate core manifest SHA8471208c89dc168e6735a31bead901b934f0b66becc86bd3270a9384b95f7076; chat24791030baef2473f8d2151ed006ba967a4dacb6bc6ba4942ada898616f1121a. Own Renderer JS3,845,400B SHA477a57cbcf4e2bf6aa7f4734264c44559bf71e7ff1dc8e7258c9eaee3c07b30e. Per-phase executed checker hashes and exact freezes are in run-all.json/freeze-*.json. Final verification passed after run completion2026-10-23T21:59:27Z. Frozen inputs/README were not edited after measurement. Final notes live only in excluded results/.

Rebuild sequence: node build-renderer.mjs after sibling final builds; node freeze.mjs; explicitly reserve an exclusive local timing window; PERF_EXCLUSIVE=1 node run-all.mjs. The executed final run used PROBE_SKIP_PREFLIGHT=1 because separately preserved gates already passed. Localhost/Chrome required approved sandbox escalation. Ports4264/4265/4270 are owned; unknown occupied processes must not be terminated. On reproduction, do not reuse old artifact hashes as newly built provenance.

Preserved harness failures: sandbox EPERM launch; RSS warm/terminal workload mismatch with identical baseline/runtime DOM/listener growth; excluded partial Renderer run accidentally started after that failed gate. Exact old source/raw/freezes are preserved. Harness-only correction normalizes both reference states without loosening budgets or changing candidates. Corrected short gate passed; final Renderer restarted from scratch. Other passed preflights were not rerun. Timing snapshots/settled snapshots remain distinct.

Core prebenchmark chart-root ownership and SVG namespace resource defects were corrected before freeze, as was Chat RenameDialog portal theme. Standard lazy/per-owner compilation does not certify the inherited private Goober parser patch, root guards, arbitrary framework/cascade orders, all portals/API exports, CSP or fragment SSR. No new cache/style manager, production migration or acceptance is implied.
