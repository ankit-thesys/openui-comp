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

The first installed comparison found Calendar pattern fill differed without a provider because its inline token depended on legacy global defaults. A matching CSS-variable fallback restores the existing default; genuine focused red/green and the original comparison failure are preserved. Radar overflow uses a supported terminal-:where selector after its computed-style regression failed.

## Test Plan

- [x] Reviewed combined source build/types and focused public support/family behavior/type/pruning checks pass. All19 public entries import natively through normal installed ESM/CJS; strict consumer Bundler/NodeNext ESM/NodeNext CJS declarations pass.
- [x] Owned corrected-source matrix:6 plain/Tailwind3/Tailwind4 initial-order cases,40,242 paired style/geometry observations on a5cdaa0fa. Exact archive/consumer/lock retained.
- [x] Final integrated artifact frozen at7e425b5b7261b47dc28e331e7afc223179990237,1,062,310bytes, SHA256546f680f12516b0702cfb7c07bd092a781b4a402e8d9ee4e79b17eb9149424eb. Normal-installed bytes match archive, package/lock unchanged. Final owned broad6/46,656 and corrected portal-rest interaction6/12,408 comparisons pass, with exact installed-file and package/lock proofs recorded separately.
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
