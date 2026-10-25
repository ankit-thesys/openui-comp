# Slice13 Batch A handoff

Base reviewed PR34 c7d85dad3. Owned MetricIndicator, EntityList, ListItem, ListBlock source/styles/tests only. Legacy, root exports, dependencies, lockfile, previews and unrelated crates unchanged.

Worker1 should add root family exports for `./components/MetricIndicator`, `EntityList`, `ListItem`, `ListBlock`. Family barrels preserve exact runtime/types: MetricIndicatorWithStrikethrough, MetricIndicatorInline (no MetricIndicator alias); EntityList; ListItem; ListBlock plus their existing public types. No dependencies added.

## Public seam and evidence

Agreed seam: built package root through actual React DOM. Each family first fails because its public export is missing, then passes after extraction. Four behavior tests cover refs/class/style, metric sign/zero/previous/subtext, markdown/numeric rows, compact header/footer omission, list slots/callbacks/image alt and ListBlock propagation/index/shared-subtitle/update/empty behavior. Logs retained under results. The test-helper is unchanged. These are scratch-package source checks, not a normally installed final artifact or browser acceptance.

Scratch producer `/private/tmp/core-data13-producer` copies this checkout's source and uses existing installed development dependencies through symlinks. Only its temporary barrel adds owned exports. Strict source typecheck/build and four owned public tests pass. Shared metadata stays with Worker1. No browser run while Worker1 owns that window. Final combined package CI and installed native/strict/pruning/browser checks belong to integration.

## Preserved behavior and style boundary

One-to-one SCSS conversion uses module-scope stock Goober. Root class scoping uses terminal :where selectors to retain legacy specificity/class hooks; theme token fallbacks match legacy defaults. No injector/parser/cache/patch/new styling API.

Negative metric values are not normalized (`down/-2` displays `--2%`). Clickable ListItem retains role/tabIndex and click behavior but no keyboard activation handler. These are inherited limitations, not fixes. Small EntityList omits header/footer as before. ListBlock clones child props as before. Browser parity, hover/focus, real image loading, themes/host styles and responsive geometry remain pending. No SSR/performance/accessibility certification.

## Independent review

Spec: zero actionable findings; exact public behavior/types preserved.
Standards: zero actionable findings; no custom runtime machinery or warranted smell changes.
Both reviews read-only, no Chrome. These review results are source-only and do not replace browser acceptance.
