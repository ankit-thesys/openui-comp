# Slice13 dependency and ownership proposal

Status: read-only source investigation, not permission to start implementation. Based on fork issues [13](https://github.com/ankit-thesys/openui-comp/issues/13) and [7](https://github.com/ankit-thesys/openui-comp/issues/7), legacy source and corrected slice12 production88fdccf94. No slice13 production changes or tests have been run. Both previews and legacy remain untouched. Root dispatch must settle ownership before execution.

## Dependencies and proposed disjoint batches

| Batch | Proposed owner / exclusive new paths | Prerequisites | Output |
| --- | --- | --- | --- |
| A: small data/list leaves | Worker2: `components/MetricIndicator`, `EntityList`, `ListItem`, `ListBlock` | Existing InlineMarkdownRenderer; ListItem before ListBlock | Metric variants, entity rows, list primitives and owned public tests/styles |
| B: editable grid | Worker1: entire `components/EditableTable`, including private base cells/hooks/registry/styles | Existing Button, IconButton, Select, DatePicker, TooltipWrapper, safeUrl; shared dependency integration | All five cell types plus changes bar, keyboard/edit/portal/scroll behavior |
| C: shared card layout, overview/snippet | Worker2: `_shared/cards`, `OverviewCardBlock`, `SnippetCardBlock` | A's committed MetricIndicator; slice12 validated TextBlock/IconText/ImageText; existing TooltipWrapper | One shared layout implementation, mask/row helpers, small/medium layout styles; Overview and Snippet |
| D: remaining composed cards | Worker1 after B: `CompositeCardBlock`, `ContextCardBlock`, `VisualCardBlock` | C's shared layout committed first; InlineMarkdownRenderer and existing toCssUrl | Three card families and their standalone card exports |
| E: integration/acceptance | Worker1: root barrel, package metadata/lock, combined installed artifact/evidence | Committed batches A–D | Exact public exports, strict/native/pruning/package checks, coordinated browser evidence |

A and B can run independently after explicit dispatch. C follows A; D must consume committed C shared-layout code rather than copy it. No worker edits another batch's paths or shared root/dependency metadata. Worker2 can finish C while Worker1 finishes B. Browser windows remain serialized; prepare fixtures without Chrome while the other worker owns it.

Shared card layout is **not** the existing public Carousel component: legacy has its own `CardBlockLayout.tsx` and `smallCardBlockUtils.ts` with ResizeObserver/MutationObserver, grid grouping and scroll masks. Preserve that implementation once rather than redesign it around a different carousel. Existing private helper types stay private.

## Exact public root surface to preserve

All consumers use `@openuidev/react-ui-core`; no component subpaths or new aliases. Legacy family barrels export the following symbols:

| Family | Runtime exports | Public types |
| --- | --- | --- |
| EditableTable | `EditableTable`, `EditableTableChangesBar` | `EditableCellType`, `EditableTableRow`, `EditableTableColumn`, `EditableTableProps`, `EditableTableChangesBarProps` |
| EntityList | `EntityList` | `EntityListRow`, `EntityListSize`, `EntityListProps` |
| ListItem | `ListItem` | `ListItemVariant`, `ListItemSize`, `ListItemProps` |
| ListBlock | `ListBlock` | `ListBlockProps` |
| MetricIndicator | `MetricIndicatorWithStrikethrough`, `MetricIndicatorInline` | `MetricIndicatorTrend`, `MetricIndicatorWithStrikethroughProps`, `MetricIndicatorInlineProps` |
| CompositeCardBlock | `CompositeCard`, `CompositeCardBlock` | `CompositeCardBlockItem`, `CompositeCardProps`, `CompositeCardBlockProps` |
| ContextCardBlock | `ContextCard`, `ContextCardBlock` | `ContextCardBgColor`, `ContextCardBlockItem`, `ContextCardProps`, `ContextCardBlockProps` |
| OverviewCardBlock | `OverviewCardBlock` | `OverviewCardBlockLayout`, `OverviewCardBlockItem`, `OverviewCardBlockProps` |
| SnippetCardBlock | `SnippetCardBlock` | `SnippetCardTooltip`, `SnippetCardBlockItem`, `SnippetCardBlockProps` |
| VisualCardBlock | `VisualCard`, `VisualCardBlock` | `VisualCardBlockItem`, `VisualCardProps`, `VisualCardBlockProps` |

There is no public runtime component named `MetricIndicator`, no public standalone OverviewCard/SnippetCard, and no new public cell registry/hooks. Preserve existing ref targets and ReactNode slots. Overview/Snippet callbacks receive `(item,index)`; Composite/Context/Visual block callbacks receive `index`. Do not unify those signatures.

## Dependency and contract details to settle before dispatch

1. **Ticket13's Table wording differs from legacy.** EditableTable imports TanStack's **type** `Table`, not `../Table`; it renders native table/thead/tr/th/td with editable-specific selectors and scroll ownership. The ticket says “consume Table from the preceding slice.” Recommend retaining the legacy structure for extraction and clarifying that wording with root/TL. Replacing it with public Table/ScrollableTable is a structural change, not a necessary import fix; do not silently implement that refactor. The preceding Table still remains owned/delivered in slice12.
2. Add only the existing runtime dependency `@tanstack/react-table: ^8.21.3`, with shared package/lock changes owned by Worker1. React/clsx/lucide and the migrated controls already exist. Check native declarations with the actual resolved version; do not invent declaration shims.
3. Convert each family SCSS and EditableTable's nested `base/editableTableBase.scss` / `base/components/editableCellBase.scss`; C owns both `_shared/cards/smallCardBlock.scss` and `mediumCardBlock.scss` equivalents. Context/Visual/Editable styles read only z-index constants from legacy `chatUtils.scss`; copy the numeric styling values into owned Goober declarations without adding a chat/runtime dependency.
4. No family defines a `loading` prop. Cover empty arrays/missing slots and consumer-composed loading placeholders; do not add a new loading API to satisfy broad ticket wording.
5. Keep stock Goober and current customization APIs. Complex compound selectors, container queries, nested TextBlock composition and gradient masks need emitted-CSS plus real computed-style checks. The slice12 selector failure is evidence that source inspection alone is insufficient. No runtime selector rewriter/parser/cache/injector.

## Math gate: actual dependency paths

**None of these source families directly imports TextContentWrapper, rehype-katex, remark-math or KaTeX assets.** EntityList and ContextCard use InlineMarkdownRenderer, whose preserved pipeline is GFM/breaks/citations, not the math wrapper. MetricIndicator/ListItem/ListBlock and EditableTable have no markdown math path. Shared card layout has none.

Overview/Snippet/Composite/Visual accept arbitrary ReactNode slots. A consumer may supply TextContentWrapper there, but that is an optional composition path; it does not require importing math into the card implementation. Their built-in behavior and non-math fixtures are independent of the pending math styling decision. A fixture explicitly embedding math would remain gated, and complete slice12 acceptance/transition to slice13 remains root's decision. Do not label optional math composition as validated or silently accept experimental CSS tooling.

## Inherited behavior and validation risks

These are source observations and test targets, not newly demonstrated runtime defects:

- **ListItem keyboard:** clickable content has role=button/tabIndex but no keydown activation handler. Compare with baseline and report this limitation; do not quietly add behavior. ListBlock clones children, overwrites variant/size/index and derives shared subtitle spacing; fragments/mixed children and prop inheritance need baseline checks.
- **Metrics:** trend sign comes from direction plus the supplied numeric value, without normalization; previousValue/subtext placement differs by variant. Preserve exact text and conditional rendering, including zero/negative values.
- **EditableTable controlled data:** immutable onDataChange updates are row-index based; supplied row ids are not configured as TanStack getRowId. Reorder while selected/editing, external updates and unknown column types deserve explicit baseline observation. No selection redesign.
- **Editable input:** preserve Enter/Tab/Shift-Tab/Escape/F2/arrows, start-with-character, focus/select, blur save and cancel suppression; ensure no duplicate callback from keyboard plus blur. Number parsing maps non-finite/empty input to0. URL display uses safeUrl and a separate validity warning; do not widen allowed protocols.
- **Portal editors:** select saves on choice; date saves ISO string immediately on selection. Cancel afterward is not a new rollback guarantee. Exercise actual Select/DatePicker portals, outside click, theme scope and focus; inherited control limitations remain disclosed. No fake observers/geometry or mocked picker.
- **Scrollable editing:** real ResizeObserver, bounds, next-column snapping and cleanup, empty/no columns, data/column rerenders, unmount while editing. Keep native disabled semantics and measure visible/hidden controls with appropriate locators.
- **Shared cards:** `gap` uses truthiness, so numeric0 is omitted. Preserve before redesigning. Test item counts0/1/2/3/4/5, responsive containers (not only viewport), grid/carousel masks, resize/mutations and cleanup. CSS grid/gradient output must be validated with stock Goober.
- **Interaction slots:** clickable standalone cards can be focusable without a handler; Composite can contain nested actionable footer content. Verify bubbling/Enter/Space against baseline, not an invented accessible-button contract. Snippet uses TooltipWrapper's existing truncation/ref behavior and stable TextBlock selectors; test real overflow and portal themes.
- **Background images:** Context/Visual use existing toCssUrl. Preserve unsafe URL rejection, quoting, empty/missing images, optional aria-label and layering. No new URL rewriting layer.

## Acceptance sequence once implementation is authorized

Each batch begins with a missing-export/public-behavior red through built package root, then minimal extraction and green. Component behavior tests cover refs, callbacks, controlled updates, empty/content and current customization. Stateful editing/portal/scroll/masks use real Chrome and actual browser APIs, not mocked geometry or dependencies. Do not run unrelated completed matrices again.

After committed integration, freeze a normal installed npm artifact with full source revision, tarball hash/bytes, package lock, per-file manifest and runner/fixture/baseline hashes. Verify native ESM/CJS, strict skipLibCheck:false consumer types in Bundler/NodeNext ESM/CJS, standalone pruning of unrelated data/cards/math, independent build without legacy source/styles and package analyzers. New browser cases compare plain CSS/Tailwind3/4 with both actual stylesheet orders, themes, explicit overrides, disabled/edit/keyboard states and host isolation. Keep first failures and distinguish inherited/source, sampler and extraction issues. Both independent review axes must report no unresolved scoped findings. No SSR, universal accessibility, performance/soak or whole-migration completion is inferred from these checks.
