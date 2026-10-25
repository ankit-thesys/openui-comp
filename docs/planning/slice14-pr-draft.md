## Summary

```text
react-ui-core (root imports)
├── Cartesian charts + condensed variants
├── Polar, heatmap, funnel, calendar and segmented charts
├── Mini charts
└── existing legends, Scatter helpers and print-export context
```

## What

Extract the complete existing chart set into `@openuidev/react-ui-core`, preserving public props, behavior and customization while automatically registering stock-Goober styles. Related fork issue: https://github.com/ankit-thesys/openui-comp/issues/14. Stacked on draft PR36; legacy react-ui remains unchanged.

## Changes

- All19 existing chart entries/variants, their current public data/prop types, legends and Scatter helpers. Root imports only.
- Shared private geometry, measurement, spring and styling support; React PrintContext remains distinct from the private print-media hook.
- One-to-one SCSS style conversion through stock public Goober css/keyframes APIs. Ordinary selector rewrites preserve specificity; Calendar inline pattern color gets the same default previously supplied by global SCSS. No runtime patch or new styling API.
- Existing D3 ranges and Zustand peer classification; lock change limited to core importer records. No release or deprecation change.

## Evidence

Installed comparisons found two dependencies on legacy global defaults: Calendar's inline pattern color and the shared canvas tracking token. Matching CSS-variable/theme fallbacks restore the existing defaults while preserving explicit zero and CSS precedence. Public Line geometry has a genuine28-vs27red→green regression. Original failed artifacts and diagnostic reports are preserved. Radar overflow uses a supported terminal-:where selector after its computed-style regression failed.

## Test Plan

- [x] Reviewed combined source build/types and focused public support/family behavior/type/pruning checks pass. All19 public entries import natively through normal installed ESM/CJS; strict consumer Bundler/NodeNext ESM/NodeNext CJS declarations pass.
- [x] Owned corrected-source matrix:6 plain/Tailwind3/Tailwind4 initial-order cases,40,242 paired style/geometry observations on a5cdaa0fa. Exact archive/consumer/lock retained.
- [x] Corrected integrated artifact frozen at1d31a4b63ee66f03c21688d96cee28bcad8380ac,1,062,926bytes, SHA256638a8336a60800ae40fa4e46a7130ca41141393382652dd5cf9e73626a8de806. Normal-installed Line default/zero/precedence regression, native all19 ESM/CJS, strict consumer3modes and focused pruning pass. Affected owned comparison passes6cases/46,440paired observations; Worker2 remaining matrix follows on this artifact. Earlier7e broad6/46,656 and portal-rest interaction6/12,408 are historical evidence, not recertification of the corrected source.
- [x] Worker2 committed independent evidence4bcd0c13b integrated2323d977e on the same corrected artifact: Line6/11,664; HorizontalBar6/10,728 bounded observations plus6 inherited-instability records; remaining9 entries6/62,730. Total85,122 paired observations across separate batches sharing the same6 framework/order combinations. **Default HorizontalBar string-height/legend-fit strict comparison remains unpassed.**
- [x] Final integrated package CI136/136, format/lint/types/build/Publint/ATTW pass. Two existing ThemeProvider hook warnings remain; no lint errors. Final source review has no new technical findings; Worker2 evidence is committed and integrated. Remote checks remain pending.
- [ ] Fork remote build and changeset checks.

## Compatibility and limits

Browser target: Chrome, plain CSS and Tailwind v3/v4, both initial stylesheet orders. Intentional overrides use existing APIs and explicit important CSS where required. Keep settled endpoint/keyframe metadata validation distinct from phase-matched animation claims. Source supports existing streamed data updates; this slice does not certify streaming-parser throughput, SSR/hydration, concurrent server isolation, performance or memory. HorizontalBar's default string height combined with a fitting legend has an **unpassed strict baseline comparison** and baseline-confirmed sizing instability. This prop combination remains part of the public API; it is not reclassified as unsupported or counted as a parity pass. Worker2 separately verified inherited HorizontalBar onClick is unwired and numeric width affects scales without setting its CSS box. Scatter still emits no print-export metadata and its public domain helper clamps negative lower bounds; these behaviors remain unchanged. Dynamic host stylesheet replacement/reorder recovery remains unvalidated.

## Checklist

- [x] Related fork issue linked without closure instruction
- [x] Documentation and evidence updated
- [x] Backwards compatibility considered

## Merge danger

**Door:** two-way. **Blast Radius:** components. Draft only; depends on PR36. Local package checks pass and independent browser evidence is integrated with the explicit inherited HorizontalBar gap. Remote checks are pending; the unresolved default-fit strict comparison remains visible for review. Do not merge, publish or close migration tickets from this checkpoint.
