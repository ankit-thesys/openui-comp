# Performance lab: first diagnostic prototype

This is a runnable **synthetic styling comparison**, not a full OpenUI performance approval. Chat and dashboard have equal priority. The complete [test plan](PERFORMANCE-PLAN.md) remains the acceptance path.

## Run and explore

```sh
npm ci
npm run demo
```

Open http://127.0.0.1:4177/performance.html. Use the link from the compatibility dashboard. Keep the tab visible; hidden-tab runs are invalidated. The full comparison runs one arm at a time in a fresh iframe.

1. Select Both, 100 cards, 60 chunks/second, 10 seconds and plain CSS. Click Run comparison.
2. Type in the frame's input, click Test response, and scroll while each arm runs. There are four runs: control and candidate for chat, then control and candidate for dashboard.
3. Repeat at 500 cards and 120 chunks/second. Dashboard adds 1,000 rows and 1,000 synthetic SVG points. This is deliberately stressful; observe typing and delivery lag.
4. Repeat with Tailwind v3 and v4. Use Stop if needed; partial results are labeled and retained.
5. Export measurements to save JSON locally. Nothing is sent to a server or stored automatically by the page.
6. Repeat without manual interaction and choose 3 or 5 paired repetitions; order alternates A/B and B/A. Manual exploration is useful but not a controlled regression experiment.

Each run has a fixed scheduled chunk count. The frame replays identical text at the chosen cadence, records scheduler delay, batches React publication with requestAnimationFrame, and checks final rendered sequence. Browser throttling may prevent the requested rate; delivery lag exposes that rather than silently slowing the workload.

## Comparison and meaning

- **Static control:** a React button with the same DOM, state behavior and exact CSS as the candidate. It is NOT the current react-ui Button.
- **Generated:** the prototype's actual `createComponents(mode, 'external').Button`, backed by Goober-generated external CSS.
- The lab chrome styles are scoped to its own controls so they do not restyle the measured buttons. Arbitrary unlayered host rules can still override layered component defaults by CSS design; this lab is not a guarantee against every host rule.
- Both arms have the same other content, stylesheet payload and common JavaScript bundle. This isolates component update overhead; it does not compare route loading or prove CSS tree-shaking. The preflight records duplicated CSS metadata separately.
- Chat grows text plus cards. Dashboard grows the same text, updates a table and a simple SVG polyline plus cards. These are synthetic workload shapes, not the real chat renderer or chart implementation.
- `Update p95` is latest published chunk receipt to a double-animation-frame presentation opportunity. It is not exact paint time and does not include chunks coalesced before publication; scheduled delivery lag and final catch-up are therefore reported separately.
- `Input p95` is input/click receipt to the same presentation proxy, not field INP. Unsupported long-task/heap APIs show unavailable. Heap samples are browser estimates without a controlled GC procedure.
- Rule/sheet deltas should remain zero for this fixed component set. No style generation occurs per update. A missing final render, timeout or hidden tab is a failed/invalid run, not a pass.

## Automated smoke verification

With the demo server running:

```sh
npm run check:performance
```

`PROTOTYPE_URL` may point at another local instance. Chrome must be installed. The smoke check runs both workloads and arms through plain CSS, Tailwind v3 and Tailwind v4, checks styling equivalence, final stream delivery, stable stylesheet/rule counts, Stop and JSON export. It writes `results/performance-smoke.json` and a screenshot. These few runs validate the harness; their timings are not statistical adoption evidence.

## Still required for the decision

- Equivalent ports of real components and the actual adapter/store/parser/Renderer path, with unchanged schemas and visuals.
- Cold/warm loading, route-specific CSS/JS payload and duplicate metadata removal comparison.
- SSR/streaming under bounded concurrency, cancellation and distinct themes.
- Slow-device profiles, historical conversations and a ten-minute memory/cleanup soak.
- Independent repeated sessions, supported browsers and user acceptance of workload/budgets.

Keep the Wayfinder prototype ticket open for the user's observations. No production migration or adoption has been approved.
