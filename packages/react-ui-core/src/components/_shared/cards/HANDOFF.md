# Slice13 Batch C source handoff

Built on Batch A670b14b70 from reviewed PR34c7d85dad3. Own one private shared CardBlockLayout/smallCardBlockUtils implementation and the small/medium Goober stylesheet; OverviewCardBlock and SnippetCardBlock source/styles/tests. Worker1 can consume the committed shared layout for Composite/Context/Visual; do not copy a second layout or substitute public Carousel. Root/package/dependency/lock changes remain Worker1-owned.

## Needed public root exports

Add `export * from "./components/OverviewCardBlock"` and `export * from "./components/SnippetCardBlock"`.
Family barrels preserve OverviewCardBlock plus OverviewCardBlockLayout/Item/Props; SnippetCardBlock plus SnippetCardTooltip/Item/Props. No standalone OverviewCard/SnippetCard or private layout/helper public exports. Batch A root families are listed in MetricIndicator/**tests**/HANDOFF.md. No new dependency.

## Source and checks

Component/helper logic is copied unchanged; only ordinary Goober class imports/attachments are added. Shared styles cover both existing sizes, row grouping, grid/container breakpoints, masks and carousel widths. No custom parser/injector/cache/pruner, new API or runtime dependency patch. The inherited zero-gap truthiness and consumer style precedence remain, as do item-key and callback `(item,index)` behavior.

Six owned public tests pass in `/private/tmp/core-data13-producer`, a source scratch package with staged root exports and existing installed tooling via symlinks. Both new families first failed missing-root-export tests. Overview exercises row counts0–5, click/Enter/Space callbacks with exact original object/index, refs/attributes/gap/style/update behavior. Snippet exercises public static markup slots, zero-valued RHS, chevron gating, grouping, attributes and empty input. It does NOT mock ResizeObserver or claim truncation/callback execution in JSDOM. Both cards' real layout/tooltip/mask/portal interactions remain browser work.

Strict source types/build, separate Prettier and semantic ESLint pass. Raw TDD/build/type/lint evidence under OverviewCardBlock/**tests**/results. Full package CI and normal installed strict/native/pruning checks are integration-owned; source scratch success does not establish them.

## Emitted-CSS correction and review

Public Goober extractCss diagnostic revealed the authored `:where(.carousel)::-webkit-scrollbar` form gains a generated descendant and changes matching. Fixed using one ordinary shared `scrollbarClass`, with `&::-webkit-scrollbar`, attached directly to the scroll element. Both incorrect scoped rules removed. No Goober/runtime transformation. Before/after diagnostic selectors retained in results. Other authored mask/container selectors are emitted; real geometry and browser CSS matching remain pending.

Independent Spec review: zero actionable source findings; independent Standards review: zero after reviewing the direct-scroll-class correction. Static reviews do not replace Chrome parity. Browser remains owned by Worker1; Worker2 has not launched Chrome. No legacy/previews/shared metadata/crates changes, merge/release/ticket closure or scope beyond A/C.
