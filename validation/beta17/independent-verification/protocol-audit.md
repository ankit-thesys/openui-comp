# #17 independent protocol/provenance preparation

Status: read-only preparation; no #17 fixture/artifact handoff and no browser/timing/soak window received. No current-run pass/fail or migration/performance acceptance claimed.

## Pinned contract read

Historical reference commit a67bd0695f37ff0d6800de564562c152807f4e4e:
- validation/stock-goober-gate/PLAN.md, agreed performance thresholds section.
- validation/stock-goober-gate/performance/PLAN.md and README.md.
- measure-chat.mjs (recorded protocol/sequence), performance/summarize.mjs and summarize-memory.mjs.

That historical experiment explicitly was source integration, not a complete installed chat-kit benchmark. It supplies protocol/thresholds and examples; its numeric results do not certify the migrated packages. New #16functional passes also do not certify #17. Current reviewed product PR39 head89cdd43d8 as dispatched by root; freeze handoff still required. Workload boundary here is installed migration vs unchanged legacy, not a claim of isolated Goober-only causality.

## Fixed protocol — no new acceptance criteria

| Area | Existing requirement |
| --- | --- |
| Equal workloads | chat and dashboard, separately reported |
| Load | paced and stress, separately reported |
| Formal samples |10alternating matched pairs/cell after warmup;4workload/load cells ×2arms ×10=80measured streams |
| Order | AB then BA alternation across pair0..9, paired IDs retained |
| Streaming completion | median<=10%slower,p95<=15%slower, per workload/load; no pooling |
| Input | paced input-command p95<=100ms per workload AND arm, consistent with historical runner; not INP |
| DOM completion | expected terminal DOM/content +2RAF opportunities separately from message-idle completion; no actual paint/field-INP claim |
| Soak |10measured minutes EACH chat/dashboard after warmup; both arms measured with matched endpoints |
| Retention | warm→terminal retained JS heap growth<=5MiB; style/rule counts plateau; zero live streams after terminal/teardown |
| RSS | owned Chrome process-tree growth>100MiB prompts investigation, not automatic leak/failure |
| Samples | natural samples about30s; no forcedGC/profiling/detailed dumps in natural/final timing windows; matched endpoint GC and idle only |
| Boundaries | SSR deferred; no standalone helper/AgentInterface extraction/newcriteria/runtime patches |

Historical details to retain or explicitly document: benchmark records first-stream/cold observations separately from ten measured pairs (8cold arm/cell observations, not pooled into80). Historical soak uses12warmup cycles including cancellation, then800ms idle/matchedGC warm endpoint; natural30s samples and matching terminal endpoint. References permit separate source controls but the accepted new run must actually use frozen normally installed artifacts.

## Required frozen handoff before independent execution

1. Product source commits and six relevant internal artifacts (kits/core/renderer/lang-core/devtools/observability as applicable), hashes/sizes, install manifests/locks and full installed-file inventories. Preserve original immutable consumers, make independent consumer.
2. Baseline commit and runtime provenance, including its own dependencies. Legacy sources read-only; no cross-arm CSS, provider, module/cache contamination. Record dependency differences that prevent attributing overall migration cost solely to Goober.
3. Dedicated private fixture package identity (avoid kits self-reference), actual module graph/origin proof for both compiled arms, oneReact/renderer perarm as intended. Candidate UI must resolve to frozen installed kits/core, never workspace sources or baseline aliases. External tooling is distinguishable from product graph.
4. Exact fixture/runner/server/hostCSS/workload bytes and build manifests, hashes of served output rather than only source; recheck after run, including archives, installed files, consumers/lock, server and runner inputs.
5. Environment/tool/browser versions, browser headless/viewport/cache state, seed/payload/rate/chunksize/DOMworkload counts, exactstart/end/order and cancellation cadence. No overlapping browser/build/profiler work during formal timings/soaks.

## Independent runner audit checklist

- 80MEASURED streams with10unique pairs and botharms in eachcell; no duplicate/missing samples disguised by matching total. Cold/warmup not pooled. Counts/payload/rate identical within each pair; ten alternating pairs checked against timestamps. Failures preserved rather than retried/filtered into green.
- Completion waits for actual current request/message identity, terminal bytes/content/parser and expected DOM counts; page-idle leftover from previous stream cannot finish a new measurement. Keep message completion and DOM+RAF metrics distinct.
- Input command observed while response ACTIVE, with actual input state/value outcome; no idle-only timing or command success without event/render effect. Perworkload/arm p95, no pooled average. Basic numeric validity and units checked.
- Cancellation exercised only after active partial response observed; browser abort and serverclose/timer stop confirmed, then retry. Never report a pre-request abort as a cancelled stream. Expected AbortError separated from other parser/page/runtime/errors; unrelated errors fail.
- Summary medians/p95 independently recomputed from raw percell arrays using pinned formulas. With n10, nearest-rank p95 is max; do not claim high statistical precision. A failingcell cannot be hidden by faster anothercell or combined throughput.
- Tenminute duration measured, warmup excluded; natural timestamps monotonic/real and sample gaps visible, not only count>=19. Match baseline/candidate iterations and content/theme/cancel/unmount cycle; stabilize the same DOMstate at endpoints.
- Retained heap from matched warm/terminalGC endpoints, not final forcedpressure/tab-close values. Inspect intermediate heap/resources for plateau separately from transient natural heap. Existing threshold is5MiB; don't invent a slope tolerance to manufacture acceptance.
- Stable DOM/style/rule/listener/resource observations with actual teardown; serveractive zero at measured idle samples/terminal/afterteardown as historical protocol. Processes/RSS belong only to recorded ownedtrees; native RSS investigated separately from JSretention.
- Pressure/profiling/detailed memorydump diagnostics run only after acceptance endpoints or in separate browserrepetitions; never substitute those reclaimed values. Tabclose reclaim does not exclude retention in longlivedpage.
- Evidence validator itself rejects missing cell, duplicatepair, skipped scenario, wrong origin/hash/manifest, unexpected error, unfinishedstream and invalid summary. Existing meaningful tool regressions can support this; no test that merely mirrors implementation.

## Independent reproduction scope after release

After W1functional fixture and W2formal-run handoffs, audit exact frozen input/moduleorigin proof and rawsummary calculations first. Then reproduce bounded both-workload behavior/timing/resource observations using same public installed seams after explicit browserrelease; do not silently substitute a short run for formal10minutesoaks or claim independent full80/soak replication without executing it. Report passed/failed/not-tested with original hashes and limitations. User decisions still required for acceptance; no merges/releases/legacy repairs.

## Current findings / limits

No new fixture production finding established: validation/beta17 committed sources were not yet present at initial read. A current implementation audit waits for handoff rather than inventing defects from historical helpers. The old summarize-memory validity condition/count alone does not prove sampling cadence or plateau; independent raw inspection is still required. This is an evidence-check requirement, not a newly added threshold.

All worker/production/friend/legacy/preview directories remain read-only. Verifier checkout retains existing untracked crates/ and docs/planning/friend-independent-tasks.md. Only this isolated /private/tmp preparation file created. W1 owns initial browser, W2 next formal timings/soaks; verifier waits explicitrelease.
