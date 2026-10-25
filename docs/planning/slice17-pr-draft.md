## What

Relates to fork issue #17. Add reproducible installed-package validation and
immutable evidence comparing the extracted core/chat library with legacy UI.
Formal local streaming timings and both ten-minute soaks meet the agreed
investigation thresholds; independent audit found no new blocker.

Stacked DRAFT on PR39. Evidence and maintainer tooling only; no production or
legacy implementation changes, release, deprecation or issue closure.

## Changes

- Freeze real HTTP UTF-8 chat/dashboard replay using installed public Renderer,
  parser, core and chat library; preserve props/actions/themes and module origins.
- Verify48 functional cases across plain CSS/Tailwind v3/v4 and both actual style
  orders; complete readiness also checks every manifest probe, live cancellation,
  semantic form validation/submission and immutable module/package identities.
- Pin official isolated Chrome for Testing156.0.8078.47 with all340files/5links,
  archive/metadata provenance and standard Playwright lifecycle. Preserve earlier
  harness/Chrome lifecycle failures and readiness diagnostics without pooling.
- Archive fresh80formal samples and both ten-minute paced soaks, exact manifests,
  runner snapshots, reproduced summaries and independent bounded audit evidence.

## Evidence

| Cell | Median completion change | p95 completion change |
| --- | ---: | ---: |
| Chat/paced | -0.34% | -0.46% |
| Chat/stress | +1.93% | +0.24% |
| Dashboard/paced | -0.06% | +0.25% |
| Dashboard/stress | +0.91% | +1.92% |

Limits:10% median/15% p95 per cell. Ten observations/arm/cell make nearest-rank p95
the maximum observed sample; these are local point estimates. Runtime paced
input-command p95 chat4.835 ms/dashboard3.409 ms, below 100 ms; not field INP.
Runtime retained-heap growth chat0.367 MiB/dashboard0.491 MiB, below 5 MiB after
12 warmup cycles and ten-minute soaks. Styles plateau; checkpoint streams/timers0;
RSS investigation trigger not reached. Inline CSS remains217,642 bytes eager.

Independent verifier exactly recomputed formal summaries/full-soak records and
Git archive identities, then ran16 bounded streams plus cancel/retry without
repeating the full benchmark/soaks. No new blocker. Its extra one-warmup DOM
equality failure is preserved and explained; formal criteria were unchanged.

## Test Plan

- [x] Frozen installed artifacts,10,866 inputs / 2,765 independent installed files,
  module origins, full browser identity and pre/post integrity checks.
- [x] Real functional48matrix and pinned complete8-case readiness; no unnecessary
  unchanged product checks repeated during performance quiet windows.
- [x] Fresh80formal samples after8 excluded first streams; two 600s paced soaks.
- [x] Independent raw audit/recomputation and bounded16-stream reproduction.
- [x] Final integrated harness suite34/34; independent aggregate Spec/Standards
  reviews clear for this stacked draft.
- [ ] Fork CI after draft creation.

## Limits and review boundary

Formal timing uses plain CSS/order-before; TW3/TW4 compatibility is separate
functional evidence. Soaks use paced workloads. Warm results do not settle cold
startup, approximately 572 KB gzip library JS, eager CSS or unused emitted KaTeX
fonts. DOM+twoRAF is a readiness diagnostic, not proof of presentation timing.

SSR/hydration/concurrent SSR, AgentInterface/OpenUIChat shell and headless chat
store/AG-UI are deferred. Legacy missing eve/client strict types and the separate
HorizontalBar string-height/legend-fit gap remain disclosed, unchanged and not
waived. Workloads use stable vertical BarChart; no all-chart/error-free guarantee.

REPORT.md and exact raw archives/hashes live under validation/beta17. No migration
or universal production performance approval follows from these scoped results.

## Checklist

- [x] Fork issue linked without closure instruction
- [x] Reproduction, evidence, import ownership and consumer guidance recorded
- [x] Backwards compatibility and inherited gaps explicitly considered

## Merge Danger

Two-way: validation/evidence/docs only, stacked DRAFT on PR39. No product changes
or merge/publication/deprecation/issue closure authorized.
