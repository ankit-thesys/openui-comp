## Summary

```text
react-ui-core (root imports)
├── EditableTable + private cells
├── metrics / entity and list views
└── composed cards → one private shared layout
```

## What

Extract data views and composed cards into `@openuidev/react-ui-core` so consumers can use existing APIs with automatic stock-Goober styles and root imports. Related fork issue: https://github.com/ankit-thesys/openui-comp/issues/13. Stacked on draft PR34; legacy react-ui remains unchanged.

## Changes

- EditableTable and changes bar, EntityList, ListItem/ListBlock, both existing metric indicator variants, and all five approved composed card families.
- One private shared card layout; existing props, slots, refs, keyboard behavior and theme APIs preserved. Existing TanStack range added; lock change limited to three new core importer lines.
- Legacy's effective16px Select menu typography retained using existing SelectItem styles; shared carousel base width precedes container overrides to preserve narrow widths. No runtime patch or new styling API.

## Evidence

- Before: narrow Overview carousel cards240px versus legacy200px; raw browser failure retained.
- After: base-before-container rule order restores200px at450/480px and240px at481/700/900px; strict independent comparisons pass.

## Test Plan

- [x] Historical integrated package CI107/107 onbaa3c1d93; format/lint/types/build/Publint/ATTW pass (two existing ThemeProvider lint warnings). After the shared-card CSS correction, targeted installed/native/types/pruning/build/format checks pass; unrelated suites were not repeated.
- [x] Frozen normal npm consumer: native public-root ESM/CJS, strict TS5.9.3 Bundler/NodeNext ESM/CJS and affected JS/Goober pruning pass.
- [x] Historical broader B/D Chrome parity: six initial-order cases /48,494 paired snapshots onbaa3c1d93. Corrected shared-layout production4119cddbe passes affected D responsive checks: six plain/Tailwind3/Tailwind4 order cases /10,656 paired snapshots at450/650/950px, grid/carousel and responsive-disabled control. Exact corrected artifact492247 bytes, SHA2562c29042765ee120d7f85dd4da7176152ee54cfa7dcaff794ee3990473ea59e02; evidence under packages/react-ui-core/evidence/data-cards/corrected-carousel.
- [x] Worker2 independent metric/entity/list/Overview/Snippet Chrome matrix:12 cases /56,268 paired snapshots on the same corrected4119cddbe artifact; exact package and lock unchanged. Includes narrow/boundary/wide carousel widths, masks, separate real LHS/RHS tooltip portal cases, themes and overrides.
- [ ] Fork remote CI after opening draft.

## Compatibility and limits

Preserve inherited Enter-save duplicate callback, metric sign formatting and ListItem keyboard behavior. Snippet tooltip triggers retain native DIV/tabIndex-1; simultaneous very long LHS/RHS composition remains unvalidated after the legacy LHS was not hoverable. Initial stylesheet orders are covered; dynamic stylesheet insertion/reordering recovery remains unvalidated. SSR/hydration/performance/memory are not certified here. No old code, dependency patches, custom runtime machinery, release or deprecation changes.

## Checklist

- [x] Related issue linked without closure instruction
- [x] Documentation and evidence updated
- [x] Backwards compatibility considered

## Merge danger

**Door:** two-way. **Blast Radius:** components. Draft only; depends on PR34. Local independent gates pass; remote CI remains pending. Do not merge, publish or close migration tickets from this checkpoint.
