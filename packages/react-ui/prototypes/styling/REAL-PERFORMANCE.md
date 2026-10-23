# Real OpenUI performance diagnostic

This is a bounded implementation of the [performance plan](PERFORMANCE-PLAN.md), covering chat and dashboard equally. Read [measured results](results/REAL-PERFORMANCE.md) before making an adoption decision. The user’s earlier export is analyzed separately in [the sanitized summary](results/user-measurements-summary.md); it measured synthetic controls, not these components.

## What actually executes

`real/workloads.tsx` imports existing production `openuiChatLibrary` and `ThemeProvider`. Root-first OpenUI DSL arrives through a local AG-UI SSE response. The existing `processStreamedMessage` adapter accumulates and batches updates; production `Renderer` invokes the incremental parser and production component implementations. No production files are edited.

- Chat: Markdown/text, real Form/FormControl/Input, and two Buttons per block.
- Dashboard: the same controls, one real D3 BarChart per panel (12 bars), and one real Table per panel (10 visible rows, three columns).
- Browser tiers: five blocks/panels at 60 chunks/s, twenty at 120 chunks/s, and five with simulated 4× CPU slowdown. Dashboard stress therefore contains 20 charts and 200 visible table rows. Chart animation settings are the current production library adapter’s settings, identical in both arms.
- A chunk is a fixed number of source characters, not a model token. Root-first forward references and partially formed expressions exercise progressive parsing. The final source, rendered counts, paired DOM text, sampled computed styles and stable stylesheet rule counts are checked.

The adapter feeds React state directly; this is not a complete ChatProvider/store, historical conversation, auto-scroll, or OpenUIChat integration. The full component library is registered in both arms, so the bundle is intentionally broad. It does not measure tree-shaken kit packaging.

## What differs between arms

Baseline: current production Sass compiled to CSS.

Candidate: that stylesheet is converted to ordered objects and compiled through Goober at build time. Public selectors are preserved so both arms use the exact same production React components and JavaScript. Goober is absent from the browser bundle. This isolates static generation and delivery; it does not certify a complete hand-authored CSS-in-JS migration or arbitrary runtime variants.

A naive whole-stylesheet Goober string conversion changed declaration semantics. The prototype instead preserves declaration order, duplicates/fallbacks and conditional ancestry through an ordered AST adapter. The build fails unless every declaration, selector/condition ancestry, value and `!important` flag matches. This is a verified converter for the current stylesheet, not a general CSS compiler guarantee. Component migration still needs its own visual/behavior review.

## Browser protocol and metrics

Production minified bundles, Chrome, fresh iframe for each run, alternating arm order, one excluded warmup per arm per cell. Ten measured pairs per normal workload; five per heavy workload; three per 4× CPU workload. Warmup failures still fail correctness. This is fewer repetitions than the full adoption plan and has no mobile-network shaping.

The parser’s existing `sp.set` call is timed in both arms. Total parser time is synchronous parser/evaluator work; it is not total React/render/layout time. Common instrumentation overhead is present. Final elapsed time ends at two animation-frame callbacks after the completed render. Update and scripted input timings are also animation-frame opportunities, not exact paint time or field INP. Automated typing is identical in each arm.

The server schedules each chunk after the preceding write and honors backpressure. The nominal chunk rate is not a guaranteed open-loop arrival rate. Report actual stream duration and post-stream catch-up; do not interpret this as proof that an arbitrary fixed-rate production feed can be sustained. CSS and JavaScript load before timing starts; this does not measure cold start or first styled paint. CSS/JS compressed sizes are local estimates, not measured HTTP transfer.

Timing tests run without parallel SSR pressure. Run medians and paired differences use independent complete runs; chunks within a run are not independent samples. Small cohorts and one shared laptop do not establish statistical non-inferiority. Keep the interactive page visible and avoid other heavy work when comparing your own runs.

## SSR pressure protocol

Standalone production React `renderToPipeableStream`, fresh owned server, real completed OpenUI source parsed/rendered on every request. A request-local Suspense promise delays content by 25 ms. Concurrency 1, 10, 25 and 50, three repetitions, three requests per concurrent slot per repetition, alternating arm order and warmups. Each response checks actual components, shell/content order, CSS link before body and request theme markers.

Four sequential 150 ms canaries prove separate shell and delayed content transport chunks. Pressure runs record when client reads coalesce instead of calling TCP/read coalescing a rendering bug. Ten deliberate aborts check request counters and timer cleanup. CPU/RSS and event-loop observations are diagnostic; short, sequential closed-loop batches and a local load generator do not establish sustained server capacity or absence of memory leaks.

Both arms parse/render identical components and only change the stylesheet URL, so SSR differences primarily characterize common renderer cost and run noise. This client does not fetch CSS. Theme checks concern request markers, not rendered theme CSS: production ThemeProvider uses a client insertion effect. These tests do not validate hydration, first styled SSR paint, Next.js integration, simultaneous clients plus server load, or an open-loop queue. Prior small-fixture Next/CSS compatibility evidence remains separate.

## Reproduce and inspect

From this directory:

```sh
npm ci
npm ci --prefix real
npm run demo:real
# In another terminal, sequentially:
npm run check:real:browser
npm run check:real:ssr
npm run report:real
```

The browser check expects the demo on 4180. The SSR check refuses an occupied 4181, starts its own server and stops it afterward. `REAL_BROWSER_QUICK=1 npm run check:real:browser` is a smoke test and overwrites the browser result; it is not the full measurement matrix. Generated assets and dependencies are ignored. Locks, source fixtures, checkers and JSON results are versioned.

Remaining adoption coverage: completed CSS-in-JS port, full chat store/shell, real Next SSR hydration/theme CSS, slow CSS/network, framework matrix with the real library, other chart families/portals, long-conversation and teardown soak, repeated sessions and deployment-like sustained/open-loop pressure. Do not promote this diagnostic to a full library performance certification.


## Follow-up coverage

The later [integration and memory validation](VALIDATION-FOLLOWUP.md) adds full AgentInterface/ChatProvider/store behavior, production Next component SSR/hydration and fixed-teardown memory soaks. See its [separate measured report](results/INTEGRATION-VALIDATION.md). Earlier timings in this document remain the isolated parser/component benchmark; do not relabel them as full-shell timings.
