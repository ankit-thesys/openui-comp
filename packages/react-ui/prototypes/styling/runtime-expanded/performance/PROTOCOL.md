# Frozen measurement plan (before execution)

Aligns with /private/tmp/openui-runtime-expanded-report/PROTOCOL.md; decision remains open. No prior measurements certify this candidate. No timing or long load starts without the parent's exclusive execution authorization.

Candidate inputs are copied after both component and chat agents explicitly freeze. Record source, generated descriptor, metadata, dependency, CSS, built output and executed checker hashes. Retain build/correctness failures. Actual original/static baseline and new runtime execute the same parser/components. Chat and dashboard have equal cells and alternating scheduling; report them separately.

## Browser matched work

Renderer diagnostic: normal size3/60chunks/s/128chars, pressure size12/120chunks/s/64chars, and saturated size12/no timer pacing/64chars (server honors write backpressure). One excluded warmup pair and ten measured pairs per workload/load. Alternate arm order, fresh context per run, same loaded assets before timing. Check exact final source/DOM text, sampled styles, real table rows/chart paths and errors. Record parser/adapter work where instrumentation permits, Goober calls/time, update/input/frame proxies, long tasks, complete duration, actual stream time and catch-up. Native input samples may be absent if response finishes before scripted input; never present that as zero latency. Not cold CSS/JS transfer or field INP.

Actual FullChat diagnostic: same matched alternating procedure using actual composer/store/AgentInterface and deterministic backend. Normal2 blocks, pressure6 blocks, saturated6 blocks unless correctness/size evidence requires a documented pre-run adjustment. Same response and stream schedule both arms. This is distinct from Renderer replay; aggregated shell styles and broad component registration are payload limitations.

SSR pressure: prefer agent's production Next completed-response route. Bounded concurrency1/10/25/50, alternating chat/dashboard/themes, three repetitions, separate shell/delayed transport canaries, cancellation/drain and healthy requests. Closed-loop local diagnostics do not establish production capacity. A standalone alternative must be named explicitly.

## Comparable memory soak: 20 measured minutes TOTAL

Serial isolated fresh processes: Next server5min baseline +5min runtime, actual full-chat browser5min baseline +5min runtime. Setup, assets and warmup excluded. Both workloads alternate equally per phase. Server warm30 complete responses; ten bounded concurrent requests. Browser two persistent pages (chat/dashboard), eight warm completed streams, then mount/send/verify/unmount with reset stores and bounded backend history. Every tenth cycle cancels; distinguish pending versus genuinely partial active HTTP streams. Theme sequence includes finite and distinct accents, with source markers and scoped-host observations where API supports it.

Natural heap/RSS, DOM/listeners and stylesheet/resource/rule counts every30s at drained/unmounted checkpoints. Never force GC during measured load. Force GC only at equivalent warm pre-load and terminal idle/teardown checkpoints. Warm and terminal pages are unmounted; server requests drained. Disable unbounded instrumentation arrays during soak. Report per-page/scenario and arm sums, node heap vs RSS separately, process identities and active-stream drain.

Investigate retained heap growth >max(10% warm retained heap,5MiB), DOM growth>100, listener growth>20, errors/content mismatch/live streams, and warmed-checkpoint style/rule growth. Preserve full time series and resource IDs: distinguish newly used resources that plateau from continuing growth; do not silently waive a budget violation. These are diagnostics, not a no-leak proof, production budget, or inherited soak result.

Raw outputs and final source/build hashes remain in this new scratch. All owned servers and browsers stop afterward. Short smoke overrides are labeled and never represented as the20min run.

Correctness discovery before measurements: real ChatProvider's Zustand SSR initial snapshot does not expose a fixture's preloaded messages. No render-phase store mutation workaround is allowed. Next server measurements will identify real unseeded FullChat shell SSR and the separate real Renderer/parser SSR companion; full-chat conversation rendering is measured after actual HTTP hydration. Earlier proposed preloaded-conversation server gate is superseded, with failure preserved by the integration agent.

Candidate engine is expected to include a private pinned experimental Goober parser patch for functional-pseudo selectors. Its exact bytes/path/version must be frozen and reported separately; these results must not be described as stock-Goober measurements. FullChat aggregates expanded shell/component styles at mount, whereas Renderer boundary generation may repeat during stream updates. Cold navigation/readiness and engine counters are recorded separately from send-to-completion.
