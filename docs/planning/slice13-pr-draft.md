## What

Extract data views and composed cards into `@openuidev/react-ui-core` so consumers can use existing APIs with automatic stock-Goober styles and root imports. Related fork issue: https://github.com/ankit-thesys/openui-comp/issues/13. Stacked on draft PR34; legacy react-ui remains unchanged.

## Changes

- EditableTable and changes bar, EntityList, ListItem/ListBlock, both existing metric indicator variants, and all five approved composed card families.
- One private shared card layout; existing props, slots, refs, keyboard behavior and theme APIs preserved. Existing TanStack range added; lock change limited to three new core importer lines.
- Legacy's effective16px Select menu typography retained using existing SelectItem styles; no runtime patch or new styling API.

## Test Plan

- [x] Verified locally: integrated package CI107/107; format/lint/types/build/Publint/ATTW pass (two existing ThemeProvider lint warnings).
- [x] Frozen normal npm consumer: native public-root ESM/CJS, strict TS5.9.3 Bundler/NodeNext ESM/CJS and affected JS/Goober pruning pass.
- [x] Worker1 owned EditableTable/Composite/Context/Visual Chrome parity: six plain/Tailwind3/Tailwind4 initial-order cases,48,494 paired element snapshots, themes/nested/overrides, real edits and portals, hover/focus and image layers. Exact artifact491804 bytes, SHA256 f64973409f551181976cafa76b85a5915262f11e1bc2e2fe48a17c9103e069f4; evidence under packages/react-ui-core/evidence/data-cards.
- [ ] Worker2 independent metric/entity/list/Overview/Snippet browser checks against that same artifact.
- [ ] Fork remote CI after opening draft.

## Compatibility and limits

Preserve inherited Enter-save duplicate callback, metric sign formatting and ListItem keyboard behavior. Initial stylesheet orders are covered; dynamic stylesheet insertion/reordering recovery remains unvalidated. SSR/hydration/performance/memory are not certified here. No old code, dependency patches, custom runtime machinery, release or deprecation changes.

## Checklist

- [x] Related issue linked without closure instruction
- [x] Documentation and evidence updated
- [x] Backwards compatibility considered

## Merge danger

Draft only; depends on PR34 and the remaining independent A/C browser gate. Do not merge, publish or close migration tickets from this checkpoint.
