# Expanded runtime measurements — pending execution

This scratch owns measurement scripts only. Decision remains open. No results from earlier candidates certify this build. Timing awaits parent authorization and the expanded components/full-chat agents' final correctness freeze.

After correctness freeze, build the Renderer snapshot with `SOURCES_FROZEN=1 node build-renderer.mjs`. The FullChat agent builds its standalone and production Next artifacts independently. Freeze all source/dependency/build hashes with `SOURCES_FROZEN=1 node freeze.mjs`; all measurement scripts verify this manifest before and after execution. Subsequent harness fixes require an explicit updated freeze and preserved failed raw output.

Within an exclusive timing window, run these commands sequentially from this directory:

```
PERF_EXCLUSIVE=1 node bench-renderer.mjs
PERF_EXCLUSIVE=1 node bench-fullchat.mjs
PERF_EXCLUSIVE=1 node ssr-pressure.mjs
PERF_EXCLUSIVE=1 node soak-server.mjs
PERF_EXCLUSIVE=1 node soak-browser.mjs
node summarize.mjs
```

`PERF_SMOKE=1` selects one measured pair after warmup. `SOAK_SMOKE=1` selects ten seconds per arm; these are harness checks and must not be reported as the final repeated benchmark or twenty-minute soak. Raw report fields label shortened runs. Never mix smoke/final files without preserving the prior raw file.

Next server measurements exercise the actual unseeded FullChat shell plus a clearly marked separate real Renderer/parser SSR companion; they do not claim SSR of a preloaded conversation in the actual ChatProvider store. Browser FullChat uses the actual composer/store/HTTP/parser. Renderer replay is separately labeled. The expanded saturated diagnostic exercises broader response controls/charts; the matched chat/dashboard cells retain equal weight.

Patched private Goober is experimental: freeze its upstream pin, license, patch and exact module bytes. FullChat aggregates all registered styles at mount; record cold navigation/readiness and its compile counters separately from send-to-completion. Renderer boundaries may compile on streamed updates. DOM input/frame measurements are browser timing proxies, not production INP. Saturated runs can complete before an input event; retain sample counts. Laptop concurrency throughput is not production capacity.

The memory phases total twenty measured minutes (five server minutes per arm, five browser minutes per arm), excluding setup/warmup and terminal idle. GC occurs only at warmed pre-load and terminal idle/unmounted checkpoints. Natural checkpoints do not force GC. Growth thresholds are investigation budgets, not proof of leak absence. Preserve first-used resource caching and continuing growth separately.
