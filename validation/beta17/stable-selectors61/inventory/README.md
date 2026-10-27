# #56/#61–64 source-only migration preparation

Rebound 2026-10-27 to independently accepted #60 commit
`c1aaf994d5c0fbfb56b83685221eeea9b409e57c`, package tree
`a71ebda7e9812ff9a488ac8d025b6983be24e9ef`. All 254 inventoried source hashes
were compared against its Git blobs and match the previously inspected #59 source.
Only package README differs from #59. This does not imply archive byte identity:
#60's fresh vendor path provenance and actual smoke checks are documented by its
independent report. #61 pilot now owns Worker1's exclusive runtime/build window. No production edit, browser, build,
install or selector migration occurred for this inventory. PR42 and #59 unchanged.

## Proposed source-disjoint assignment

Whole folders include their owned style files, TSX parts and component-local docs.
This is a proposal for root assignment, not permission to implement.

| Gate/ticket | W1 | W2 |
| --- | --- | --- |
| #61, after #60 accepted | Button and IconButton pilot; settle stock registration, selector specificity, hook documentation and validation pattern | Read-only pilot review; prepare presentation coverage |
| #62, after #61 accepted | CheckBoxGroup/Item, Chips, FormControl including Hint, Input, Label, OptionCards, RadioGroup/Item, Slider, SwitchGroup/Item, TextArea, ToggleGroup/Item (15 folders) | No edits to those folders |
| #63, after #61 accepted | No edits to these folders | 41 presentation/layout folders listed in ownership.tsv; start with small wrappers, then compositions; explicit complex exceptions below |
| #64, after #61 accepted | Select, Calendar, DatePicker, Modal (four whole folders) | TooltipWrapper, Citation, ImageGallery (three whole folders) |

The inventory has 65 non-chart/non-theme component folders: 2 pilot, 15 controls,
41 presentation/layout and 7 direct portal families. Those are SOURCE COUNTS,
not counts of converted components or a commitment that every folder is eligible.
`ownership.tsv` gives exact assignments; `inventory.json` enumerates each source
file, its hashes, observed hook contexts/state selectors and cross-family imports.
`hooks.md` is a compact sample. Dynamic prefixes such as `openui-carousel--` are
not complete hooks; expand from actual variant maps before documenting them.

Presentation starting tranche: Buttons, TagBlock, Separator, Image,
SourceFaviconImage, IconText, TextContentWrapper. Then Card/CardHeader, Callout,
Tag/IconTag, ImageBlock/ImageText/ImageTextLarge, text/list/metric components.
Composition tranche: Accordion/Tabs/Steps/Carousel and card-block families with
shared layout, then EntityList/Table/Sources. No automatic bulk conversion.
EditableTable/vendor descendants/complex shapes are not silently counted complete.

## Existing hook examples and state contract

Observed names must become the selectors that actually carry owned declarations;
className presence alone is insufficient. Preserve names where practical.

| Family | Existing root/part examples | Variant/state examples to preserve |
| --- | --- | --- |
| Button/IconButton (#61) | openui-button-base; openui-icon-button and its openui-icon-button-icon span; Button has no owned left/text/right wrappers | primary/secondary/tertiary, destructive, sizes/shapes; :hover, :active, :disabled, focus; asChild semantics |
| Input/Label/FormControl (#62) | existing root and hint/label hooks in inventory | focus, disabled, error/context; no new sx API |
| CheckBox/Radio/Switch/Toggle (#62) | root/container/indicator/label hooks already observed | Radix data-state, disabled and focus; document actual selectors rather than inventing duplicate state classes |
| Buttons/TagBlock (#63) | openui-buttons; openui-tag-block | horizontal/vertical; #59 shared base coordination required |
| CardHeader/Callout (#63) | openui-header and top/bottom/side parts; openui-callout/title | existing card variants; semantic Callout variants |
| Accordion/Tabs (#63) | observed roots/parts in inventory | existing data-state and focus rules; keyboard behavior |
| Select/Calendar/DatePicker (#64 W1) | openui-select-content/viewport/trigger; openui-calendar-root; existing date-picker renderer hooks | open/closed, selected, highlighted, disabled; actual portal container and nested-theme scope |
| Tooltip/Citation/ImageGallery (#64 W2) | tooltip/citation tooltip/content/item roots; gallery modal parts | delayed/instant-open, pinned/hover states, gallery navigation/close/focus |

Full observed contexts are line-numbered in inventory.json, not inferred from
folder names. TextContent also retains non-openui existing names `text-content`,
`text-content-clear`, `text-content-card`, `text-content-sunk`; these were added
to the inventory rather than omitted by its original prefix filter. Review an
intentional openui-* alias/naming contract while preserving those classes where
practical. Its root and all three owned variants are ordinary conversion candidates. Root/part/variant/state classifications remain a manual review task
for each vertical slice. Do not publish incidental generated/vendor DOM as API.

## Shared files and cross-worker boundaries

- `src/styles/base.ts` (#59) is ONE integration-owned file, proposed W1/root only.
  Buttons/TagBlock belong W2 while FormControl belongs W1. A converted component
  cannot silently be called fully migrated if owned styles still depend on its
  generated shared class. #61 must choose/document a faithful stable-base pattern
  or an explicit common-rule exception before parallel batches touch those roots.
  Neither worker independently rewrites #59 or broadens global root applicability.
- `src/styles/defaults.ts`, package sideEffects, root entry, ThemeProvider and theme
  utilities stay unchanged unless a concrete need is reviewed at the gate. Root
  token defaults and ALL local token fallbacks are preserved; #58 removal deferred.
- `_shared/cards/cardBlockLayout.styles.ts` has selectors on descendants,
  container-query layout and generated classes composed by card-block components.
  Reserve this exact file and its card layout helpers to W2/#63; no W1 edits.
  Convert all actual consumers together or explicitly defer this shared area.
- `_shared/hooks`, icons and general utilities remain read-only by default. Portal
  behavior hooks (e.g. usePinnableTooltip) do not need rewriting for CSS selectors.
- `Calendar/components/helperComponents.tsx` directly imports Select's
  contentClass/viewportClass. W1 owns BOTH folders and converts dependency-first;
  do not remove style exports without updating this owned consumer in the same
  coordinated batch. DatePicker renders Calendar; keep these three together.
- EditableTable embeds Select and DatePicker editors and TooltipWrapper. W2 owns
  EditableTable but does not edit dependencies. Prefer defer whole editable family
  initially, then validate against accepted W1 portal changes before reconsidering.
- Citation/TooltipWrapper depend on shared behavior hooks and theme propagation;
  W2 owns their visual modules, not the hooks/ThemeProvider. Sources/card snippets
  use tooltips transitively: their consumer coverage crosses batches, file edits do not.
- Component docs can remain local per owner; a single package README/hook index and
  consolidated converted/deferred ledger must have one integration writer (root/W1)
  accepting worker entries, avoiding simultaneous edits. No new tooling/CI/release.

## Proposed complex exceptions (must be confirmed, not hidden)

1. **EditableTable entire family initially**: editable controls, portal cell editing,
   keyboard/selection and display/editor styles span dependencies. Deferred is safer
   than marking only its table root as full conversion. Record available existing
   hooks separately; they do not prove effective consumer overrides.
2. **MarkDownRenderer/InlineMarkdownRenderer**: inventory/convert the existing owned
   root, link, code, table and deliberate descendant rules; InlineMarkdownRenderer's
   inline wrapper, markdown scope, p and direct-child layout are owned candidates.
   KaTeX/vendor syntax-token DOM and inline themes are the specific boundary. Preserve
   vendor CSS and record partial areas exactly; no whole-family skip by association.
3. **CodeBlock**: owned wrapper positioning, copy-button placement/hover/copied-state
   rules and highlighter container margin/radius remain eligible. Existing highlighter
   `margin: 0 !important` stays a disclosed limitation, not a newly promised normal
   override. SyntaxHighlighter token colors/supplied inline theme are specifically
   outside the ordinary later-CSS guarantee. Do not defer the entire family.
4. **Calendar**: react-day-picker classNames, custom Select dropdown portals and
   direct style imports need coordinated W1 coverage. Can remain deferred if that
   scope exceeds the pilot pattern; do not classify it as a simple non-portal input.
5. **Skeleton and DotMatrixLoader**: SkeletonBar/stack ordinary owned styles are
   eligible; TableSkeleton/PieChartSkeleton are reviewed shape by shape, with exact
   exceptions only if justified. Private keyframe names alone are not a reason to
   defer owned hooks. DotMatrixLoader root grid/geometry and dot cosmetics remain
   eligible; runtime inline dot opacity/size variables are specific customization
   limits. Preserve animation behavior; do not disable it for comparisons.
6. **Floating/portalled geometry**: preserve existing dynamic inline placement and
   theme propagation. Distinguish owned cosmetic styles from third-party positioning;
   don't replace live coordinates with static declarations or invent an adapter.
7. **SourceFaviconImage**: `openui-source-favicon-image` applies to the successful
   img (object-fit/display), not its fallback. Image error/empty URL returns shared
   IconWrapper with no such hook. Convert the eligible image root and test success,
   error and URL changes; preserve shared icons and don't promise a fallback-icon hook.
8. **Shared-base and card-layout declarations**: cross-component registration and
   selector composition need one owner and all-consumer coverage before conversion.

These are proposed boundaries, not accepted waivers. #61/#65 must publish an exact
converted/partial/deferred ledger with reasons and available hooks, not claim all65.

## Charts excluded; indirect consumers still matter

No files under components/Charts may be selector-converted. Source inspection shows
Button/IconButton imported by DefaultLegend, StackedLegendView and horizontal/vertical
scroll buttons. DefaultLegend measures toggle-button clientWidth, so changed control
geometry can change legend fitting and overflow. #61 therefore needs bounded indirect chart-control smoke checks:
legend click/keyboard behavior, overflow scroll controls and geometry. Preserve
chart selector files and historical chart findings. 'No chart edits' is not proof
of no indirect chart effects. The chart tooltip/LabelTooltip implementation remains
outside #64, even though it is portalled.

## Validation and next gate

#60 accepted -> #61 pilot accepted -> source-disjoint #62/#63/#64 -> combined #65.
Root assigns exclusive build/browser windows; source work may overlap only after
release gates. Compare against accepted #60/#61 artifacts, not old PR42 or failed58.

Use the existing built-public-import browser seam. For every converted area verify
actual computed consumer root/part/variant/state overrides, ordinary later base
CSS without important, appropriate matching state selectors, default geometry,
keyboard/ref/callback semantics, host negatives, inherited/cleared token fallbacks,
provider-free light, explicit/nested themes and applicable portal scopes. Plain CSS,
actual TW3/TW4 and supported orders remain the boundary; do not promise all orders
or that one base class beats every state. Keep all historical failures visible.

Stock Goober registration strategy is a #61 validation gate. Button renders
iconLeft/children/iconRight directly; do not add wrappers or promise left/right/text
hooks without a separate reviewed contract. IconButton's existing icon span and
Radix Slot/asChild/ref/disabled semantics must stay intact. Button/IconButton don't
consume #59's borderBoxClass, so the pilot can establish registration without
rewriting the common base. Its simple generated rule must still be settled before
FormControl/Buttons/TagBlock are counted fully converted; arbitrary deferral solely
for deduplication is not approved.

Stock registration tests must include two independently imported components, both
import/mount orders and subsequent same-instance host-global updates. Existing same-instance
host global-update controls must stay covered; do not assume repeated global calls
are safe, add a private runtime patch, or invent a selector registry to force them.
Production tree shaking, first-use/multiple combinations, native imports/types,
existing build/typecheck and docs/coverage ledger complete each batch. No source
inventory is a compatibility pass; no implementation before #61 mechanism acceptance.

## Verifier preparation corrections applied

Read independent selectors56-prep/REPORT.md. Updated TextContent's four existing
non-openui hooks and corrected favicon success-image versus fallback scope in both
ledger and source inventory. Narrowed complex boundaries to specific owned/vendor/
inline areas; simple owned styles remain candidates. Registration/base handling,
Calendar direct Select imports and indirect chart controls remain gate requirements.
The accepted #60 source/archive binding is now recorded below; retain its actual
CodeBlock/Markdown/vendor dependency provenance in the next artifact handoff. #59 source-map bindings do not
certify #60's fresh dependencies or vendor smoke results. No runtime acceptance is
claimed by these corrections; #60 is now independently accepted; #62–64 remain blocked on #61 mechanism acceptance.

## Accepted #60 binding and next gate

Read `/private/tmp/openui-styles-independent-verification/ticket60/REPORT.md`.
Archive SHA256 `1db41852f9e5aa11ccbfe5a56cdb3d00c8ad753ad5e73cb19bdf4832e7f7b957`;
source binding is recorded in inventory.json. The 340 independent valid assessment
checks include explicitly preserved raw assertion corrections; this preparation
does not reinterpret or rerun them. Do not reuse #59 symlink-origin dist or a failed
#58 artifact. #63 execution order/per-family cases: `batch63.md`/`batch63.json`.
All execution remains gated on accepted #61 mechanism, shared-base decision and
root-assigned worktree/browser window. No production edits or new tooling occurred.
