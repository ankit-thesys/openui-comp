# Expanded runtime measurement evidence

Decision remains OPEN. Correctness gates passed, but this candidate has material performance and process-memory costs. No production migration or acceptance is implied.

At SSR concurrency 50, median repetition p95 was **658 ms baseline / 1,406 ms runtime**, and document throughput was **90.4 / 43.0 responses/s**. Node fetch consumes runtime CSS inside HTML but does not fetch baseline linked CSS. Decoded document sizes were 111,932–145,634 bytes baseline and 1,639,889–1,673,599 runtime; these are not complete-page/network-transfer comparisons.

Native-speed Renderer paired duration changes were +11.3% chat, +8.9% dashboard, and +15.0% for the separately labeled expanded controls/chart diagnostic. FullChat native changes were +3.1% / +7.0%. Paced cells stayed close; pacing hides work. FullChat cold shared-bundle readiness was roughly 48 ms slower overall. Counters named `gooberMs` include adapter/guard work, not exclusively engine time. Input/frame proxies are not field INP; raw counts distinguish events initiated while streaming.

The candidate uses privately patched, pinned Goober plus library-owned cascade/delivery code. FullChat emits all 47 selected style resources at mount, rather than only used component styles. Actual warmed DOM contains **1,500,896 resource CSS characters plus 54 other inline STYLE characters**, stable through this soak. Baseline's 54 inline characters exclude its linked stylesheet. The earlier 880,729-byte inventory used an obsolete analysis-helper call and omitted 620,167 guard bytes. A post-timing read-only accounting replay confirms 1,500,896 UTF-8 CSS bytes, including 207,056 bytes in 19 families without observed matching DOM selectors. Prior DOM-use observations are reused; this is not new state coverage. The original host omitted a UTF-8 charset: its Windows-1252 decoded resource text has 1,500,896 code units versus 1,500,864 under UTF-8. Byte accounting and original DOM length therefore coincide incidentally. The separately documented header-only encoding control does not replace measured output or change the candidate/build.

## Final evidence

- `results/bench-renderer.json`: 140 measured runs, 14 excluded warmup runs, seven cells, ten alternating pairs each. Exact final source, settled text and style parity pass.
- `results/bench-fullchat.json`: 120 measured runs, 12 excluded warmup runs, actual AgentInterface/ChatProvider/store/HTTP/parser and expanded response. Exact final source and settled UI parity pass. Cold navigation/readiness and engine counters are separate from send-to-completion.
- `results/ssr-pressure.json`: 1,260 measured documents plus 420 excluded warmups; c1/10/25/50, three repetitions. Forty client-abort/health canaries do not instrument server-side drain.
- `results/soak-server.json`: five measured minutes per arm, fresh Next processes, concurrency ten, equal chat/dashboard completion counts. Baseline 7,870 completions/875 aborts; runtime 9,346/1,039. These counts are retention evidence, not throughput comparison.
- `results/soak-browser-rss.json`: five measured minutes per arm, fresh Chrome and backend, two pages. Baseline 732 completions, 41 pending/40 partial cancels; runtime 720, 40/39. Bounded backend-drain checks pass. No page errors remain.
- `results/summary.json` and `results/final-memory-pressure-summary.json`: machine-readable summaries. Raw checkpoint series remain authoritative.

The twenty-minute total soak excludes setup, warmup and terminal idle. Natural checkpoints every 30 seconds do not force GC. Warm and terminal idle/unmounted checkpoints force comparable GC. Runtime metrics arrays remain disabled during soak. Unique accents continue changing; resources plateau rather than growing throughout the load.

Server retained heap growth was +2.21 MB baseline and +1.74 MB runtime, below max(10% warm heap, 5 MiB). Browser growth was approximately 1.46/1.43 MiB per baseline page and 1.46/1.39 MiB per runtime page, below 5 MiB. Runtime absolute retained heap remained about **4.6 MiB higher per page**. DOM deltas were 0–8, listeners zero, and style/rule growth zero.

**JS diagnostic thresholds passing is not an overall memory pass.** Gross Chrome RSS was:

| Arm | Warm bytes | Terminal bytes | Peak bytes |
| --- | ---: | ---: | ---: |
| Baseline | 1,497,743,360 | 1,433,698,304 | 1,944,059,904 |
| Runtime | 1,534,394,368 | 1,815,527,424 | 2,048,901,120 |

Runtime increased about 268 MiB from its warm checkpoint and ended about 364 MiB above baseline. This remains adverse/unresolved. Passive CDP process inventories plus OS RSS sum shared resident pages more than once and do not isolate native CSS allocation or prove a leak. All eight process records are retained at warm/terminal checkpoints. Server RSS also increased despite stable retained JS heap; see raw values.

## Scope and reproduction

Next measures actual unseeded FullChat shell SSR plus an explicitly separate actual Renderer/parser companion. It does not claim server-preloaded conversation state in the actual chat store. Browser FullChat uses real HTTP after hydration. Full-document SSR success does not generalize to the separately preserved failing fragment host. Browser FullChat payloads include the expanded block; historical percentages are not directly comparable.

Dependencies and sibling source roots are in `config.mjs`. The components/chat agents build their final standalone and Next artifacts. Build the own Renderer snapshot with `SOURCES_FROZEN=1 node build-renderer.mjs`, then create a fresh run manifest with `SOURCES_FROZEN=1 node freeze.mjs`. Run these commands sequentially in an authorized exclusive window:

```
PERF_EXCLUSIVE=1 node bench-renderer.mjs
PERF_EXCLUSIVE=1 node bench-fullchat.mjs
PERF_EXCLUSIVE=1 node ssr-pressure.mjs
PERF_EXCLUSIVE=1 node soak-server.mjs
PERF_EXCLUSIVE=1 node soak-browser-rss.mjs
node summarize.mjs
```

Do not run builds or unrelated browser work during measurement. `PERF_SMOKE=1` and `SOAK_SMOKE=1` select short harness checks, not final evidence. Preserve their output before running full phases. `run-all.mjs`/`memory-all.mjs` preserve historical orchestration; use the explicit final commands above, which select the RSS browser checker.

Per-phase manifests are retained: `freeze-final-measured.json`, `freeze-final-memory.json`, and `freeze-final-browser-rss.json`. Earlier transient style, composer replacement, in-progress draft-text, partial cancellation-rotation and RSS-preflight outputs retain their own source snapshots/manifests. Timed completion snapshots remain separate from settled parity after typing/500 ms; settling does not extend timed duration. The measured README is preserved under `results/README-measured.md`. Final report/accounting-only changes have a separate post-report manifest/delta; they must not be mistaken for measured candidate changes.

Owned servers and Chrome instances have been stopped. No prior prototype or production source was edited by this measurement scratch.
