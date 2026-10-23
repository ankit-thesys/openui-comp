# Full integration and memory results

Requested prototype checks pass with the demonstrated SSR-theme and framework-delivery adapters. Ready to plan a controlled migration of this static-generation approach; no production migration performed.

Full chat: **passed**, 4 scenario/arm cases. Production Next 16.4.2: **33/33** checks true. Combined full chat in Next: **passed**, 4 cases. Server soak: **passed**. Browser soak: **passed**.

## What these checks establish

The unchanged public AgentInterface shell exercises its real ChatProvider/store, streaming adapter, parser and library. Both chat and dashboard pass actual composer submission, partial/final responses, typing during streaming, follow-up/history restoration, cancellation/resubmission, theme/scroll behavior and unmount cleanup. Complete source content and actual chart/table output are asserted; CSS arms match DOM and sampled styles. A consumer storage adapter persists fixture conversation history on the local server. Resubmission is explicit, not an invented native retry action.

Actual OpenUI components in production Next pass requested theme styling before JavaScript, hydration without reported browser/console errors, form editing, local theme updates, arm-preserving client navigation and first-observed delayed styling. Plain CSS/Tailwind 3/Tailwind 4 consumer overrides work before JavaScript, after hydration and at delayed reveal. Concurrent custom themes remain isolated. Aborted streams are followed by successful requests.

A separate combined Next App Router fixture also passes all four chat/dashboard and CSS cases: real AgentInterface shell SSR, default-theme hydration, actual composer/store/parser streaming, and navigation cleanup through a cancelling Next proxy. Custom theme SSR is covered by Next-real, not custom AgentInterface themes. Streamed responses in the combined fixture begin after client interaction; they are not preloaded SSR chat history. This is not a completed hand-authored CSS-in-JS port.

An additional 120 recorded cancellations wait for actual partial response content and an active HTTP stream. Cleanup, empty remount state, styles, retained DOM/listeners and memory budgets are checked independently in each workload/CSS case. Result: passed.

## Required integration fixes

1. **SSR themes:** current ThemeProvider inserts custom tokens in the browser. The unadapted SSR control falls back to the default accent. The prototype library wrapper emits scoped tokens from the real resolved theme during SSR so server and client agree. Carry that behavior into the eventual library; do not make app authors extract tokens manually.
2. **CSS delivery:** use early unlayered component CSS for plain CSS/Tailwind 3; put component CSS in the components layer with standard layer order for Tailwind 4. The legacy conflict remains a tested negative control. Framework selection here is fixture configuration; full registry packaging/detection is still a separate implementation.
3. **Source bundling:** the isolated Next prebundle selects the universal entity decoder and shares the React singleton. These test-harness bundler fixes are distinct from Goober engine behavior. Production source was not patched.

## Memory soak

Each CSS arm ran 300 seconds of production Next SSR load in a fresh process and 300 seconds of browser cycles in a fresh Chrome process. Both workloads alternate within each arm. The measured intervals use natural garbage collection. Explicit GC is used only at warm/terminal cleanup checkpoints to diagnose retained heap. Browser pages remain open while the chat component is repeatedly mounted, streamed and unmounted. Counts below include warmup; cancellation counts are separate. Browser soak cancellation starts at isRunning, which can still be pending thread creation; it does not guarantee a network request had started. The separate full-chat correctness test cancels after an assistant message exists.

| Target | CSS | Completed | Cancellations | Warm retained heap MiB | Terminal retained heap MiB | Change | Peak sampled natural heap MiB |
|---|---|---:|---:|---:|---:|---:|---:|
| Next SSR | baseline | 3470 | 6 | 55.5 | 54.2 | -2.2% | 73.4 |
| Next SSR | generated | 3470 | 6 | 55.4 | 54.5 | -1.6% | 74.2 |
| Full chat browser (two pages) | baseline | 550 | 60 | 34.0 | 37.7 | +10.7% | 81.1 |
| Full chat browser (two pages) | generated | 550 | 60 | 34.0 | 37.7 | +10.7% | 77.2 |

Per-page retained heap baseline/chat: 16.7 → 18.4 MiB; within the per-page investigation budget.

Per-page retained heap baseline/dashboard: 17.3 → 19.2 MiB; within the per-page investigation budget.

Per-page retained heap generated/chat: 16.7 → 18.4 MiB; within the per-page investigation budget.

Per-page retained heap generated/dashboard: 17.3 → 19.2 MiB; within the per-page investigation budget.

Retained heap compares the warmed checkpoint with the higher of the post-load and final-idle measurements, a conservative terminal value. The investigation budget is the larger of 10% or 5 MiB. This is distinct from peak memory: short-lived allocations and RSS can remain higher without demonstrating an unreachable-object leak. Samples do not capture every instantaneous peak.

- Next baseline: peak sampled natural RSS 218.8 MiB; final forced-GC RSS 218.8 MiB. Process identity is recorded at every checkpoint.
- Next generated: peak sampled natural RSS 218.4 MiB; final forced-GC RSS 218.4 MiB. Process identity is recorded at every checkpoint.
- Browser baseline/chat: retained DOM nodes 194 → 194; listeners 174 → 174; stylesheets 2 → 2; top-level CSS rules 2051 → 2051; live streams after final teardown 0.
- Browser baseline/dashboard: retained DOM nodes 581 → 581; listeners 179 → 179; stylesheets 2 → 2; top-level CSS rules 2051 → 2051; live streams after final teardown 0.
- Browser generated/chat: retained DOM nodes 194 → 194; listeners 174 → 174; stylesheets 2 → 2; top-level CSS rules 2092 → 2092; live streams after final teardown 0.
- Browser generated/dashboard: retained DOM nodes 581 → 581; listeners 179 → 179; stylesheets 2 → 2; top-level CSS rules 2092 → 2092; live streams after final teardown 0.

The earlier standalone SSR RSS rise alone did not prove a leak. This follow-up measures separate processes, normal load behavior and retained heap after equivalent cleanup. A passing bounded soak is evidence against sustained retention in these paths, not proof of leak-free operation for hours, every chart type, accumulating long conversations or production traffic.

## Reproduction and evidence

[Protocol and commands](../VALIDATION-FOLLOWUP.md) · [full chat raw results](full-chat.json) · [Next explanation](NEXT-REAL.md) · [Next raw results](next-real.json) · [combined Next chat](NEXT-CHAT.md) · [combined raw results](next-chat.json) · [combined source hashes](next-chat-build.json) · [partial-response cancellations](partial-aborts.json) · [server memory checkpoints](memory-next.json) · [browser memory checkpoints](memory-browser.json) · [source/build hashes](integration-source-manifest.json)

No production components were migrated. Goober continues to run at build time. Cross-browser/full-chart coverage, strict CSP/portal theme support, slow-network behavior and deployment-specific rollout checks remain outside this bounded result.
