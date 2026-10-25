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
- [ ] Worker2 independent Cartesian/Mini browser matrix on the same final artifact, including inherited HorizontalBar click verification.
- [ ] Final integrated package CI and affected independent review checkpoint.
- [ ] Fork remote build and changeset checks.

## Compatibility and limits

Browser target: Chrome, plain CSS and Tailwind v3/v4, both initial stylesheet orders. Intentional overrides use existing APIs and explicit important CSS where required. Keep settled endpoint/keyframe metadata validation distinct from phase-matched animation claims. Source supports existing streamed data updates; this slice does not certify streaming-parser throughput, SSR/hydration, concurrent server isolation, performance or memory. HorizontalBar's declared-but-unwired click callback is an inherited observation awaiting independent baseline confirmation. Dynamic host stylesheet replacement/reorder recovery remains unvalidated.

## Checklist

- [x] Related fork issue linked without closure instruction
- [x] Documentation and evidence updated
- [x] Backwards compatibility considered

## Merge danger

**Door:** two-way. **Blast Radius:** chart components and their core dependencies. Draft only; depends on PR36. Remaining independent/browser/package/remote checks must pass before any merge consideration. Do not merge, publish or close migration tickets from this checkpoint.
