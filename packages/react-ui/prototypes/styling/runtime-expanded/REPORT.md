# Expanded runtime Goober evaluation — October 24, 2026

**Decision remains OPEN.** The disabled-cursor difference is fixed in the tested candidate. Broader controls, chart samples and actual full chat pass the recorded correctness checks. Performance is mixed: paced chat remains close to baseline, but startup, saturated rendering and especially high-concurrency SSR show additional cost. This candidate needs a private Goober parser patch and still emits an aggregate full-chat stylesheet. It is evidence for discussion, not migration approval.

No production components were migrated. Package/component/ownership decisions remain unchanged. AgentInterface is reused as a test subject, not newly approved for extraction. Earlier static and runtime prototypes are preserved.

## What changed and what actually runs

The candidate runs object definitions through a **privately patched Goober 2.1.19** during render. React 19 stylesheet resources deliver them in the browser and full-document SSR. Scoped inline theme variables keep per-request accents out of Goober class generation and avoid the old provider's body-level theme writes. Library consumers supply no component CSS import, framework flag, styling setup command or build plugin. The test harness selects the host CSS assets to exercise each environment.

Base styles use the components layer. An additional **library-owned serializer**, separate from Goober, emits scoped per-property cascade rollback guards. The disabled cursor rule sits in the utilities layer at a specificity that preserves `not-allowed` against ordinary cursor utilities while allowing explicit `disabled:cursor-wait`. Both normal utility customization and this disabled contract pass in plain CSS, Tailwind 3.4.19 and Tailwind 4.3.3, with actual host CSS before and after component styles. This relies on the standard theme/base/components/utilities layer order; arbitrary resets or already-established incompatible layer orders are not certified.

Broader coverage exposed stock Goober's handling of comma lists inside functional selectors and nested `:not(:has(...))`, including actual Switch and AgentInterface selectors. A balanced selector-list parser and nesting substitution repair the tested cases. All seven exact regressions fail stock and pass the private patch; 1,749 selected source selectors across 47 style units pass structural checks. This is not a general CSS-parser certification. The upstream pin, license, original parser and minimal patch are preserved under `components/vendor/goober/`. Accepting responsibility for such a patch is a separate unresolved maintenance decision.

## Correctness evidence

| Area | Observed result | Scope limit |
| --- | --- | --- |
| Component catalog | All 12 configurations pass: three frameworks × two actual CSS orders × baseline/runtime | Representative components/states, not every export |
| Default/override styles | No-JavaScript defaults, hydrated defaults, normal/hover utility values and disabled cursor contract pass | Standard host styles/layer order |
| Controls and portals | Real input, selected/checked/disabled/open states, radio/Select interactions, Select/Modal/Tooltip portal style parity | Exhaustive focus/keyboard/active variants and chart tooltip portals not covered |
| Charts | Real hydrated Bar/Line/Pie geometry and sampled styles pass | Other chart families and no-JS chart geometry not certified |
| Full chat | Four actual chat/dashboard × baseline/runtime cases pass: composer Enter, pending/partial/exact final output, typing, history, cancel/resubmit, controls/charts, theme change and teardown/remount | Actual AgentInterface/ChatProvider/Zustand/AG-UI/Renderer; fixture supplies persistence |
| Production Next | Shell SSR, separate real Renderer/parser companion, hydration, post-hydration HTTP chat, navigation and eight concurrent isolated themes pass | Empty chat store during SSR; not server-preloaded stored conversation |
| Pressure correctness | 1,260 measured document responses plus 420 excluded warmups; no content/theme failures; 40 abort/health canaries | Client abort and subsequent endpoint health, not instrumented server cancellation/drain proof |

Full-document React SSR hoists style resources into head and survives unmount/remount. **Fragment SSR inside the hydrated root remains unsupported in this experiment:** unmount removes style elements and React's resource cache suppresses reinsertion on remount. That failing reproduction is retained. Full-document and Next success must not be generalized to all SSR hosts.

A post-timing encoding diagnostic also found that the standalone HTTP fixture omitted a UTF-8 charset and Chrome decoded its initial HTML as Windows-1252, corrupting Unicode CSS quote characters. A versioned proxy control adding only `charset=utf-8` restored exact CSS text and passed hydration/remount with the same 47 resource keys. The candidate and measured bundles were unchanged. The performance/soak evidence remains from the original fixture; it does not certify Unicode generated-content appearance. The DOM counter called `bytes` is actually text length; corrected payload accounting uses UTF-8 byte length. See `chat/results/encoding-v1.json`. This is a fixture encoding issue, separate from Goober's selector-parser issue.

The attempted render-phase `setMessages` preload did not populate the real Zustand SSR initial snapshot. That workaround was rejected and removed. The Next fixture explicitly labels its separate Renderer/parser SSR companion. Runtime execution emitted no captured hydration warnings; Next prebundle build warnings remain in the log.

## Fresh streaming measurements

Each cell has ten alternating matched pairs after one excluded warmup pair. The actual production parser/components run in both arms. The baseline uses their existing compiled Sass; both arms share the fixture's theme-scoping infrastructure, so this is a styling-path comparison rather than untouched application code. There are 140 measured Renderer runs and 120 measured full-chat runs; all exact-content and settled-style gates pass. No unrelated build/browser test overlaps measured windows.

Times below are each arm's median. Percentage is the median of the ten **paired** percentage changes, so it need not equal the percentage of the two displayed medians. These are exploratory laptop observations, not production SLOs or confidence intervals.

| Workload | Load | Baseline ms | Runtime ms | Paired change |
| --- | --- | ---: | ---: | ---: |
| Renderer chat | Paced normal | 301.1 | 313.9 | +0.2% |
| Renderer chat | Paced pressure | 1,131.5 | 1,134.4 | +0.3% |
| Renderer chat | Saturated | 53.7 | 57.7 | +11.3% |
| Renderer dashboard | Paced normal | 522.9 | 527.5 | +0.7% |
| Renderer dashboard | Paced pressure | 2,092.5 | 2,080.9 | −0.4% |
| Renderer dashboard | Saturated | 110.7 | 115.9 | +8.9% |
| Expanded controls/charts Renderer diagnostic | Saturated | 182.4 | 207.5 | +15.0% |
| Full chat, chat response | Paced normal | 560.4 | 554.6 | −0.8% |
| Full chat, chat response | Paced pressure | 946.9 | 949.9 | −0.4% |
| Full chat, chat response | Saturated | 126.6 | 129.5 | +3.1% |
| Full chat, dashboard response | Paced normal | 705.7 | 703.5 | −0.6% |
| Full chat, dashboard response | Paced pressure | 1,417.9 | 1,424.0 | +0.2% |
| Full chat, dashboard response | Saturated | 141.8 | 155.2 | +7.0% |

Pacing hides some CPU work. Small apparent gains are not evidence runtime is faster. Saturated expanded rendering increases median frame-p95 from about 50 ms to 75 ms, with longer blocking work. Saturated full-chat dashboard input-to-frame proxy rises from roughly 70 ms to 80 ms. These are synthetic timing proxies, not field INP or React commit durations; retained sample counts show whether input happened while streaming or afterward.

Across all full-chat runs, cold local navigation-to-ready median is **286.8 ms baseline versus 334.6 ms runtime** (about 48 ms additional). Full-chat generates much of its broad style inventory at mount, outside send-to-completion timing. Both arms share one fixture JavaScript bundle; readiness is not a dedicated production bundle/network comparison. Counters named `gooberMs` include adapter/guard work and must not be interpreted as pure engine time.

The expanded full-chat programs append a controls/layout/table/chart block to historical workloads. Both current arms use the same source, but historical timing percentages are not directly comparable.

## SSR pressure is the strongest adverse result

Each concurrency level has three measured repetitions after a separate warmup. The fixture renders an initial and a delayed second chat shell, plus its explicitly separate Renderer/parser content; the delayed shell intentionally waits 300 ms. The table shows median repetition p95 and median completed responses per second.

| Concurrent requests | Baseline p95 ms | Runtime p95 ms | Baseline responses/s | Runtime responses/s |
| --- | ---: | ---: | ---: | ---: |
| 1 | 329 | 342 | 3.1 | 3.0 |
| 10 | 396 | 453 | 26.4 | 24.4 |
| 25 | 518 | 625 | 56.2 | 43.7 |
| 50 | 658 | 1,406 | 90.4 | 43.0 |

At concurrency 50, runtime document p95 is about **2.14× baseline**, with roughly half the closed-loop throughput. Zero correctness errors does not make this a performance pass.

The fetch test consumes HTML, including runtime inline styles, but does not fetch the baseline's linked CSS. First 100 response-size samples in the separate server soak are roughly **1.64–1.67 MB runtime versus 112–146 KB baseline HTML**, as decoded, uncompressed document bytes (Node fetch decodes content compression). These are document sizes, not total transferred-page sizes. Large inline delivery, duplicated/broad style inventory and runtime generation all warrant investigation; this experiment does not isolate their individual contribution. The result is a real cost of this candidate, not proof that all runtime Goober designs have the same cost. Single-machine closed-loop throughput is not production capacity.

## Memory soak

Four fresh-process five-minute measured phases completed: server baseline/runtime and browser baseline/runtime, **twenty measured minutes total** plus warmup/setup/idle. Natural samples were taken every 30 seconds without forced GC. Warmed and terminal idle/unmounted checkpoints used explicit GC. Chat and dashboard were both exercised, including unique themes and cancellations.

| Retained JavaScript heap after cleanup | Baseline growth | Runtime growth |
| --- | ---: | ---: |
| Next server | +2.11 MiB (+3.01%) | +1.66 MiB (+2.15%) |
| Browser chat page | +1.46 MiB | +1.46 MiB |
| Browser dashboard page | +1.43 MiB | +1.39 MiB |

All stayed below the provisional investigation threshold of max(10% of warmed heap, 5 MiB). Browser DOM growth was 0 or 8 nodes, listener growth zero, and stylesheet/rule growth zero at matched teardown checkpoints. No content/theme/page errors or live browser streams remained. The baseline/runtime browser phases completed 732/720 streams with 81/79 pending or partial cancellations; the server phases completed 7,870/9,346 checked responses with 875/1,039 client aborts. These duration-based soak counts are retention evidence, not a controlled throughput comparison.

**Passing growth budgets does not mean equal memory cost.** Runtime's retained browser heap was about 4.6 MiB higher per page both at the warm and terminal checkpoints (terminal approximately 28.2 MiB versus 23.7 MiB). Server terminal retained heap was about 78.9 MiB runtime versus 72.3 MiB baseline.

Passive process RSS shows a larger unresolved difference:

| RSS, MiB | Baseline warm → terminal (sampled peak) | Runtime warm → terminal (sampled peak) |
| --- | ---: | ---: |
| Next server process | 267 → 322 (322) | 292 → 352 (360) |
| Gross Chrome process sum, two pages | 1,428 → 1,367 (1,854) | 1,463 → 1,731 (1,954) |

Runtime Chrome's terminal gross RSS is about **364 MiB above baseline**, and about **268 MiB above its own warmed checkpoint**, despite comparable JavaScript heap growth. This needs native/process-memory investigation before claiming a small overall memory impact. RSS sums may count shared resident pages more than once, are sensitive to process/allocator/GC behavior, and do not isolate the CSS engine. There was no predefined RSS pass budget; this is an adverse observation, not proof of a CSS leak. The five-minute windows do not prove long-run leak absence.

The first partial server attempt was stopped because cancellation scheduling favored one workload. The corrected complete five-minute phases supersede it. Browser RSS sampling used its own versioned checker and pre-run freeze; short smoke runs are preserved separately and excluded.

## Payload and unused components

The corrected accounting helper uses the same options as the executed boundary, including ownership guards. The original helper passed an obsolete boolean option and omitted 620,167 guard bytes; its 880,729-byte total was an undercount, preserved as failed accounting evidence. This correction changes reporting only, not the styles used in correctness/performance/memory measurements. The full-chat boundary automatically emits all 47 selected style families at mount: **1,500,896 CSS bytes** in the standalone inventory. In the sampled completed states, 28 families have matching DOM selectors; 19 families representing 207,056 bytes do not. Those may include closed, empty, portal or unused states, so they are not all proven dead code. Even a matched family contains unused states. The broad boundary does **not** meet the user's minimal unused-style requirement yet.

A dedicated Button entry initially retained aggregate ownership metadata (92,475 gzip JavaScript bytes). Splitting metadata per component corrected that issue: **7,910 gzip bytes runtime versus 3,968 baseline**, an additional 3,942 bytes. React is external and baseline CSS is excluded. No chart implementation or aggregate metadata is retained in that entry. An imported-but-unused Button drops out to a 51-byte marker. This is a bounded entry audit, not public-package root-export/tarball tree-shaking certification.

## Evidence, corrections and next review

The final source/build manifests identify the candidate and each executed harness revision. Failed experiments are preserved: initial catalog prop/payload/animation harness mistakes; fragment style loss; rejected SSR store preload; aggregate Button metadata retention; transient style samples; unstable composer lookup; typing text sampled before completion; and the initial partial server soak whose cancellation rotation favored one workload. Corrections are documented; failed/short runs are not counted as final measurements.

Before any acceptance, review:

1. Whether maintaining a private Goober parser patch plus the library-owned cascade/delivery adapter is acceptable.
2. How to reduce full-chat style emission and SSR response/server costs without losing automatic styling or correctness.
3. Whether full-document React/Next is a sufficient initial SSR boundary, and how to address fragment hosts and server-populated chat state if required.
4. Remaining package-install/root-export proof, full component/chart/state coverage, strict CSP and nonstandard host resets.

No architecture choice or implementation tickets were accepted. This round establishes broader correctness and exposes the costs that the next decision must address. See [reproduction instructions](README.md), [pre-measurement protocol](PROTOCOL.md), component/chat coverage documents and raw `performance/results/` files. Historical static evidence remains an independent comparison; it was not rerun as a third arm here.
