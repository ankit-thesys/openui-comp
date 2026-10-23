# Runtime Goober: component-owned CSS and immutable compilation

**Decision: OPEN.** This experiment does not accept runtime Goober or start migration. Prior static and expanded-runtime evidence is preserved.

## Result: improvements, not acceptance

**Unused family delivery and SSR overhead improved substantially. The long-run Chrome RSS concern is NOT resolved, and saturated dashboard streaming remains slower.** The changes use ordinary ownership, immutable memoization and React resources, but the overall prototype still contains custom parser/cascade infrastructure. Do not describe this as stock Goober or a clean, accepted standard integration.

| Measure | Earlier runtime candidate | New component-owned candidate | Interpretation |
| --- | --- | --- | --- |
| Full-chat delivered inline CSS | 1,500,896 UTF-8 bytes | 339,692 UTF-8 bytes | 77.4% reduction for the tested expanded fixture; still contains unused variants within emitted families |
| Next c50 document p95 (median repetition) | 1,406 ms vs 658 ms baseline | 839 ms vs 743 ms fresh baseline | Overhead drops from about 114% to 13%; historical fixtures/runs are not identical |
| Next c50 responses/second | 43.0 vs 90.4 baseline | 69.7 vs 82.9 fresh baseline | Runtime still about 16% below fresh baseline |
| Long-soak terminal gross Chrome RSS | Runtime about 364 MiB above baseline | Runtime about 303 MiB above baseline | Large process-memory signal remains; not proven to be CSS allocation or a leak |
| Dedicated Button gzip JS | 7,910 bytes | 7,910 bytes; original 3,968 | JS overhead remains; React external, baseline CSS excluded |

The previous static Goober prototype and previous runtime candidate are preserved. This round compares the candidate against original SCSS components, not against a fresh third static-Goober arm.

## What changed

The previous full-chat boundary emitted all 47 selected style families, including a shell aggregate that duplicated separately emitted shell styles. Its compiler also rebuilt immutable definitions on repeated rendering. The new candidate assigns styles to the actual copied component modules, splits shell ownership, emits conditional portal resources when mounted, and lazily compiles each fixed definition once. It keeps theme/request values out of the cache. No response-text scanner or custom runtime stylesheet registry selects resources.

A real detached browser DOM target replaces the fake browser target; public Goober extraction reads and clears it. Server targets still use an implementation-dependent shape. The preserved private parser fork and generated cascade guards remain experimental. See [the design audit](DESIGN-REVIEW.md) for the distinction between standard optimizations and custom infrastructure.

## Correctness and bundle evidence

The final component catalog passes twelve configurations (plain CSS, Tailwind v3 and Tailwind v4; host CSS before/after; baseline/runtime). The added actual non-condensed Bar case checks internal layout, and Modal/Tooltip styles are absent before those portal components mount. The source inventory covers 34 style units across 52 source modules, not the whole registry.

Button-only SSR now emits 13,820 CSS bytes and no chart/shell styles; the old eager-boundary control emits all 47 families and 1,504,425 HTML bytes. These are a targeted isolation control, not a whole-chat payload comparison. A fixed Button definition compiles once across 101 document renders. Eight simultaneous documents each receive their own theme and late Input resource after cache warmup.

The dedicated Button ESM entry is 7,910 gzip JavaScript bytes versus 3,968 baseline (+3,942); React is external and baseline CSS excluded. It contains no chart implementation or aggregate style metadata. An unused Button import reduces to a 51-byte marker. This is entry-level evidence, not public-package barrel/tarball certification.

Failed intermediate cases remain preserved: root-prefix chart ownership, in-SVG duplicate resources, and the full-chat rename-dialog portal theme. The first two were corrected through explicit source ownership; portal integration uses the existing theme API. Stock Goober still fails the new Switch selector control; the inherited private engine fork remains necessary for this candidate.

## Evidence status

Full-chat four-case integration, standalone SSR and nineteen production Next checks pass on the frozen candidate. Next tests include an initially empty real chat shell plus a separately labelled Renderer/parser SSR companion; they do not preload a conversation into the server chat store. Next fixture type checking remains skipped and known dynamic-require build warnings remain. All final measurements completed and the source/build freeze verified afterward. Timing comprises 140 Renderer and 120 full-chat measured runs, with ten alternating matched pairs per workload/load cell; warmups are excluded. SSR pressure covers 1,680 checked responses at concurrency 1/10/25/50. Three fresh-process memory pairs precede twenty measured minutes of server/browser soak. These are local bounded observations, not production capacity estimates. Do not interpret the microdiagnostic or successful component gates as a whole-system performance conclusion.

## Limits that remain regardless of benchmark outcome

This is selected actual-component coverage, not a complete core/kit migration. Source-to-style ownership is a reviewed authoring task, not a proven automatic arbitrary-library converter. Component-demand delivery is not per-state dead-rule elimination. The normal chat schema imports many implementations, so dedicated Button tree shaking does not establish kit-wide JavaScript pruning. Full-document React/Next is tested; the earlier fragment SSR/remount limitation remains unresolved. Strict CSP, arbitrary host CSS/layer ordering, full exports/variants, multi-version coexistence and production deployment capacity remain unproved. AgentInterface is a test subject, not approved for extraction.

## Measurement validity notes

A short preflight memory run exceeded the DOM/listener investigation thresholds in both arms by the same counts (chat +396 nodes/+25 listeners; dashboard +787/+29). Heap growth was below 1 MiB per page; styles/rules/bytes did not grow and backend activity drained to zero. The harness warm checkpoint ended after partial cancellations while terminal state could follow a full response. This prompted an explicitly versioned equal-state cleanup control; original raw results and the interrupted partial timing run are preserved and excluded from final measured results. No candidate code or threshold was changed to resolve this observation. The corrected short control passed with zero DOM/listener/style/rule growth in both arms. It also passed in every final short/long browser run. The original observations remain preserved; no threshold was relaxed.

## Streaming and SSR measurements

Median paired completion-time changes (runtime relative to original SCSS; positive is slower):

| Workload | Normal paced | Pressure paced | Unpaced saturation |
| --- | ---: | ---: | ---: |
| Actual Renderer chat | −0.48% | −0.21% | +7.64% |
| Actual Renderer dashboard | +0.25% | −0.01% | +7.09% |
| Actual full-chat chat | −0.59% | +0.12% | +4.34% |
| Actual full-chat dashboard | −0.29% | +0.48% | +17.22% |

The additional expanded Renderer stress case is +9.76%. Paced totals include waiting for input chunks and can conceal CPU costs. The full-chat first response performs 43 new style-definition compilations after 66 definitions at readiness; that first-use work remains inside the timed send-to-complete interval. CSS/resource lookup and React composition still occur on repeated renders. A smaller CSS payload does not establish faster streaming. Full-chat saturated median input-latency proxies are 69.5 vs 57.7 ms for chat and 88.7 vs 70.2 ms for dashboard; these are test proxies, not production INP. Raw per-pair distributions and counters are in the performance results.

| Next concurrency | Baseline p95 ms | Runtime p95 ms | Baseline responses/s | Runtime responses/s |
| --- | ---: | ---: | ---: | ---: |
| 1 | 328.2 | 333.1 | 3.1 | 3.1 |
| 10 | 430.0 | 408.5 | 26.3 | 25.7 |
| 25 | 520.9 | 513.2 | 55.0 | 52.4 |
| 50 | 743.2 | 839.2 | 82.9 | 69.7 |

Each row uses three measured repetitions after warmup. These local request timings include a deliberately delayed streamed shell, document transfer and validation. Runtime responses contain about 452–490 KB HTML including 306,320 CSS-resource bytes; baseline documents contain about 135–168 KB, with linked CSS not fetched by the Node client. This is document-delivery evidence, not a complete-page/network/capacity comparison. Both browser arms share a fixture JavaScript bundle; cold readiness is not independently packaged shipping-cost evidence.

## Memory: bounded JS retention passes; native/process concern remains

Final server and browser phases each run five measured minutes per arm, serially. The server completes 9,145 baseline and 9,141 runtime responses, split almost equally between chat/dashboard, excluding 30 warmups per arm. It records 1,017/1,016 client aborts. Client abort plus health checks do not establish instrumented server-side stream drainage.

| Retained heap growth after equivalent cleanup | Baseline | Runtime |
| --- | ---: | ---: |
| Node SSR | 3.37 MiB | 2.80 MiB |
| Browser chat | 1.34 MiB | 1.43 MiB |
| Browser dashboard | 1.28 MiB | 1.32 MiB |

The browser completes 788 baseline and 774 runtime streams, equally split between chat/dashboard, excluding warmup and canonical cleanup-control streams. Baseline records 44 pending/43 partial cancellations; runtime 44/42. Backend activity drains to zero, no page/content errors occur, and DOM/listener/style/rule/CSS-byte deltas are zero at equivalent checkpoints. Runtime still holds approximately 1.4–1.5 MiB more JS heap per page at the final checkpoint. These bounds do not establish leak absence over hours/days or accumulating conversations.

Three fresh-process 60-second-per-arm pairs, ordered B/R, R/B, B/R, show close warm gross RSS and lower runtime terminal RSS in every short pair. Terminal baseline/runtime MiB are 1410.5/1301.9, 1406.9/1270.0 and 1542.5/1291.5. Their median runtime-minus-baseline terminal difference is about −137 MiB. This variation must remain visible alongside the adverse longer run.

| Five-minute browser gross Chrome RSS | Baseline | Runtime |
| --- | ---: | ---: |
| Warm checkpoint | 1421.69 MiB | 1431.28 MiB |
| Terminal checkpoint | 1369.98 MiB | 1672.91 MiB |
| Change within arm | −51.70 MiB | +241.62 MiB |

The runtime terminal excess is **302.92 MiB**. Renderer-process totals dominate the growth (runtime +264.23 MiB vs baseline +36.13 MiB); the browser, GPU, network and storage categories do not explain the increase. The renderer category aggregates four Chrome processes, and gross RSS can double-count shared pages. JavaScript heaps and retained DOM/style counts do not explain native allocations. These results do **not** establish which native allocation grows or whether it is allocator retention versus a leak. Do not add an eviction manager or GC workaround based on this evidence. A standard browser/native-memory profile is the next diagnostic if runtime remains a candidate.

## What remains open

1. Whether the team accepts a maintained private Goober parser and generated cascade guards at all. The new Switch control still fails with stock Goober. Prefer an upstream-supported fix/contract over silently owning a fork.
2. A supported server target/integration contract: the experimental server sink relies on internal shape, while browser extraction now uses the public DOM target API.
3. The longer Chrome RSS excess and full-chat dashboard saturation overhead. Neither is fixed by the CSS reduction.
4. Consumer compatibility scope and source/package coverage, including fragment SSR/remount, CSP and unsupported component families recorded in COVERAGE.json.

No production migration, package/ownership change, acceptance or implementation ticket is introduced. The spec and Wayfinder decision remain OPEN.

## Traceability

- [Standard/custom audit](DESIGN-REVIEW.md) and [pre-execution protocol](PROTOCOL.md).
- [Core source/coverage](components/README.md), [coverage inventory](components/COVERAGE.json), [catalog results](components/results/catalog.json), [stock/private Switch control](components/results/switch-engine-control.json).
- [Actual full-chat/Next integration](chat/README.md), [full-chat results](chat/results/full-chat.json), [Next results](chat/results/next.json).
- [Measured streaming summary](performance/results/summary.json), [SSR pressure](performance/results/ssr-pressure.json), [RSS repetitions](performance/results/rss-replicated.json), [server soak](performance/results/soak-server.json), [browser soak](performance/results/soak-browser-rss.json), [process-memory analysis](performance/results/final-memory-analysis.json).
- [Dedicated Button bundle audit](bundle-audit.json), original failing eager-boundary reproduction and one-variable cache control alongside this report.
- Frozen source/build/checker hashes and failed intermediate attempts are preserved. See [reproduction instructions](README.md).
