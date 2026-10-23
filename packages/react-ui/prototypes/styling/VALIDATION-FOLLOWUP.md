# Full integration and memory validation

This prototype follow-up closes three specific evidence gaps before migration: the actual chat shell/store, actual OpenUI under production Next streaming SSR/hydration, and memory retained after repeated work and cleanup. It keeps chat and dashboard equally represented and does not change production components.

## Chat integration

The current checkout exports `AgentInterface` as its public chat shell; the `OpenUIChat` directory contains shared helpers. The harness imports that existing shell unchanged, including its internal ChatProvider, actual store/hooks, fetchLLM/AG-UI adapter, production library and incremental parser. This is test reuse, not a decision to port AgentInterface.

Checks exercise composer Enter submission, typing during an active response, pending/partial/final states, follow-up messages, thread switching/history restoration, cancel and resubmit, local theme updates, scrolling, unmount cancellation and remount. Complete content must equal the deterministic expected OpenUI message. Baseline and generated arms must match rendered DOM and sampled styles. Actual dashboard table rows and bar paths are asserted instead of counting unrelated SVG icons.

The fixture provides a server-backed ChatStorage adapter. The default in-memory adapter does not persist all replies for later thread restoration; the fixture server records posted conversation and complete responses. That is a consumer/backend integration contract, not a styling fix. “Retry” in this harness explicitly resubmits the last user message; it does not claim a native retry action exists. History and instrumentation buffers are bounded and disclosed in the memory results.

## Production Next.js

The real-component fixture runs `next build --webpack` followed by `next start`. It tests initial requested theme without JavaScript, hydration, form input, local themes, client navigation, delayed content styled when first observed, differently themed concurrent requests, and continued availability after aborted streams. Plain CSS, Tailwind 3 and Tailwind 4 overrides are checked before JavaScript, after hydration and at delayed reveal.

The tested integration includes two automatic library-owned prototype adapters:

1. A scoped SSR theme-token helper uses the real ThemeProvider's resolved context. Without it, custom tokens are injected only in the browser and SSR falls back to the default theme. It is not enough to check request attributes.
2. Static component CSS precedes host CSS. Plain CSS/Tailwind 3 use unlayered output; Tailwind 4 uses the components layer and standard layer order. Legacy conflict cases remain explicit controls.

The helper is embedded in the fixture's library wrapper, not a manual token extraction step required from the app author. It must become part of the migration's library/distribution implementation. This prototype does not claim the future registry installer is finished or arbitrary host configuration is supported.

The isolated source prebundle also selects the universal entity decoder and shares one React instance with Next. These are bundler integration fixes, separate from the CSS engine. Goober still runs only at build time. See `results/NEXT-REAL.md` for precise evidence and limits.

## Memory protocol fixed before the full run

Server: five measured minutes per CSS arm in separate fresh production Next processes (ten minutes total), ten bounded concurrent requests, alternating chat/dashboard and custom themes. Warm 30 complete responses first. Each document includes immediate and delayed real components. No browser timing tests or build work run concurrently.

Browser: five measured minutes per CSS arm in separate fresh Chrome processes (ten minutes total). Each arm retains two pages, one chat and one dashboard, throughout its run. Repeatedly mount the actual shell, send a deterministic two-block/panel response, verify complete content and real component output, then unmount. Every tenth cycle aborts instead. Eight streams warm each arm before measuring. Workloads alternate, so neither is omitted. Stores reset at mount to distinguish accidental retention from intentionally accumulating conversation history.

Record natural heap/RSS and detached-tree counters every 30 seconds, at fixed unmounted/drained checkpoints. **Do not force GC during the measured load interval.** Explicit forced-GC snapshots are a separately labeled retention diagnostic before load and after load/idle, not normal application behavior. Warm and terminal snapshots use the same idle/teardown state. Track stylesheet/rule counts, DOM nodes/listeners, errors, active streams and process identity. Server CSS is not downloaded by the Node client, and SSR memory results do not measure browser CSS evaluation.

Investigation thresholds: retained heap growth greater than the larger of 10% of warm heap or 5 MiB; retained DOM-node growth over 100 or listener growth over 20; any stylesheet/rule growth at matching teardown checkpoints; missing content, runtime errors or live streams after teardown. These are prototype diagnostic budgets, not proof that no leak can ever occur. Server RSS is reported separately because allocator/JIT/cache retention can remain after unreachable objects are collected. The previous standalone SSR RSS rise cannot be called a leak solely from RSS.

The result is a bounded soak on one laptop, not hours/days of production traffic, real remote models, network failure simulation, all chart families, strict CSP or cross-browser certification.

## Reproduce

Initial dependencies: `npm ci`, `npm ci --prefix real`, `npm ci --prefix next-fixture`. Build the existing framework/static assets with `npm run build` and `npm run build:real` first.

```sh
npm run check:full-chat
npm run check:next-real
npm run check:next-chat
npm run check:memory
npm run check:partial-aborts
npm run report:integration
```

Commands for the two memory phases can also be run separately with `SOAK_PHASE=next` or `SOAK_PHASE=browser`. `SOAK_ARM_SECONDS` defaults to 300; shorter overrides are smoke checks, not equivalent soak evidence. Both checkers own their test servers and refuse occupied ports. No live API credentials or external model calls are required. Keep the prototype's original demos separate from these owned test ports.


## Additional cancellation coverage

The long browser soak deliberately cancels when the store becomes running, which can still be pending thread creation. A separate `check:partial-aborts` test waits for more than 100 characters of actual assistant response and confirms an active HTTP stream before cancelling. It repeats 30 times per workload/CSS-arm case (120 recorded cancellations), verifies server drain, empty DOM, healthy remount and fixed-checkpoint memory/styles. It is bounded cleanup evidence, not another long soak. Per-scenario retained heap is checked separately in the final report so one workload cannot mask growth in the other.

## Combined full chat inside Next

A separate production Next App Router fixture combines the actual AgentInterface/ChatProvider/store with the composer, parser and local AG-UI backend through Next route handlers. Four workload/CSS cases verify default-theme shell SSR and hydration, real composer submission and complete response content, chart/table output, and route-navigation cancellation reaching the backend. The wrapper explicitly calls the store cancellation method on unmount. Custom SSR themes are covered separately in Next-real. This fixture is a correctness check, not an additional memory soak. See [the combined evidence](results/NEXT-CHAT.md).
