# Next work proposal — read-only, awaiting root dispatch

PR35 contains slice13, stacked on PR34. This document proposes scope and ownership; it does not start another implementation, assign external contributors, close issues or decide chat-helper/TL contracts.

## First finish deferred OptionCards from #10

The dependencies that caused its deferral now exist: InlineMarkdownRenderer from slice12 and private getRowConfiguration from slice13. OptionCards imports those two implementations, React and clsx; it needs no new runtime dependency.

Propose Worker2 own only `packages/react-ui-core/src/components/OptionCards/` source/styles/tests in a bounded follow-up. Worker1 owns its root export, integration evidence and any shared metadata. Reuse the committed helper without changing it or copying a second implementation. Preserve OptionCards, OptionCardsProps, OptionCardsItem and OptionCardsSelectionType from the current barrel.

Use public-root TDD for existing controlled single/multiple selection, exact onToggle values, group/radiogroup and card roles/attributes, disabled cards/global disabled, native forwarding/ref/class/style, invalid-value filtering, markdown/top icon/image slots and empty updates. Real Chrome should compare focus/keyboard/hover, disabled behavior, responsive row grouping, themes and both initial stylesheet orders. Preserve baseline defects; no new selection or styling API. A separate small stacked draft can keep this deferred control reviewable before the larger charts extraction.

## Then #14: full charts in core

The source Charts barrel exports19 family/variant entry points:

| Group | Existing runtime exports |
| --- | --- |
| Cartesian | AreaChart, AreaChartCondensed, LineChart, LineChartCondensed, BarChart, BarChartCondensed, HorizontalBarChart, ScatterChart |
| Polar | PieChart, RadialChart, RadarChart |
| Other | HeatmapChart, FunnelChart, CalendarHeatmap, SegmentedBar, SingleStackedBar |
| Mini | MiniAreaChart, MiniBarChart, MiniLineChart |

Also retain the existing chart public parts/types: LegendStoreProvider, useLegendEntry, StackedLegend, CHART_CLASS_PREFIX, scatter helpers, all exported props/data/options/legend/export types. This is an inventory from the actual source barrel, not a separate visualization package or new API proposal.

### Dependencies and foundation

Production chart imports require existing React/ReactDOM, clsx, lucide, Floating UI, Radix Tooltip and theme/control support, plus d3-scale, d3-shape, d3-selection and zustand. Audit exact existing workspace ranges and required D3 declaration packages before adding them; Worker1 alone updates package/lock. Verify no unrelated lock resolution changes. Do not import legacy production code.

Charts use both a private media-query usePrintContext hook and a distinct React PrintContext via useExportChartData. The latter lives at legacy src/context/PrintContext.tsx and is publicly exported by the old root. Preserve those existing concerns and exports separately; do not replace one with the other or add SSR support. Existing Button/IconButton/Separator implementations are already available. Charts/dependencies.ts is registry metadata referencing legacy dependency manifests; audit it separately from actual runtime imports rather than duplicating component implementations or creating a new registry system.

### Proposed exclusive ownership

| Batch | Owner | Files/responsibility | Depends on |
| --- | --- | --- | --- |
| Shared type bootstrap | Worker1 | Charts/types and required existing theme type dependencies only | Explicit dispatch after PR35 CI checkpoint |
| Family prerequisites | Worker2 | BarChart/types.ts, BarChart/parts/horizontalBarGeometry.ts, ScatterChart/types.ts; existing owned tests as relevant | Committed shared types; not the full foundation |
| Foundation | Worker1 | Charts/utils, hooks, shared/, shared chart styles, required PrintContext, root exports/deps/lock | Committed shared types AND Worker2 family prerequisites |
| Cartesian + mini | Worker2 | AreaChart/, LineChart/, BarChart/, ScatterChart/, MiniAreaChart/, MiniBarChart/, MiniLineChart/ and their local tests/styles | Committed foundation; no edits to shared hooks/layout |
| Polar | Worker1 | PieChart/, RadialChart/, RadarChart/ and local tests/styles | Committed foundation |
| Remaining families | Worker1 after polar, or bounded reassignment by root | HeatmapChart/, FunnelChart/, CalendarHeatmap/, SegmentedBar/ and local tests/styles | Committed foundation; explicit owner before edits |
| Integration | Worker1 | Charts barrel/root exports, package metadata, artifact freezing, combined pruning/type/build checks | All committed family batches |

The prerequisite split is necessary: useHorizontalBarChartOrchestrator directly imports BarChart/parts/horizontalBarGeometry and BarChart/types, while useScatterChartOrchestrator imports ScatterChart/types. Bar geometry and Bar types in turn import shared Charts/types. Therefore the dependency order is **Worker1 shared types → Worker2 family prerequisite files → Worker1 remaining foundation → dependent family implementation**. Do not declare the foundation buildable before those prerequisite commits, temporarily import legacy files, duplicate geometry or add a custom resolver. Worker2 retains ownership of those family paths throughout.

Both workers are not alone in the repository. Integrate committed batches only, preserve other edits and never modify the other owner's paths concurrently. Request a bounded shared change from its owner rather than adding a local patch. One shared implementation, no public Carousel substitution or custom runtime styling machinery.

### Validation gates

1. Public-root failing tests before minimal extraction; preserve props/data transformations/interaction behavior and convert owned styles one-to-one through stock Goober. Keep initial defaults, empty/loading/current animation behavior and baseline limitations explicit.
2. Normally packed artifact with full revision, tar hash/size, file manifest and immutable consumer lock. Native public ESM/CJS and strict declaration checks; test actual D3/zustand integration with supported tooling rather than assume legacy build behavior carries over. Report any unsupported native import instead of adding a custom resolver.
3. All19 families accounted for in real Chrome with deterministic data: rendering, empty data, default/custom/light/dark themes, container resize separately from explicit size props, supported legends/tooltips and relevant interactions, print/export data where applicable. Compare current baseline geometry/content; screenshots alone are reference evidence. Check generated container-query ordering and boundary widths, informed by slice13's regression.
4. Button-only imports must exclude chart JS/styles. Chart-only imports should exclude unrelated families where the current dependency graph permits it; measure retained modules instead of assuming it. Verify plain CSS/Tailwind3/Tailwind4 both initial orders and current explicit customization APIs.
5. Coordinate one browser window; source work can continue in parallel. Run meaningful affected tests during batches and one integrated suite at the final source checkpoint. Do not repeat unchanged unrelated matrices. Report raw failures, source/tool hashes and coverage gaps; no universal error-free, SSR, accessibility or performance claims.

## Baseline evidence and reserved work

Corrected chart baseline evidence from PR30 is reusable read-only; retain its exact revision and disclosed limits. Issues18/24 and `validation/friend-chart-baseline/` belong to the external contributor. Inspect their committed reference evidence read-only; do not edit it or count marked-untested scenarios as passing. Issue24 explicitly calls out missing legend toggles, size-prop versus container-resize distinctions and dark-mode coverage. The migration workers must cover their own actual extraction checks and disclose any inherited HorizontalBar width or other baseline defects.

## Excluded pending work

No #15 chat-helper implementation, #16 kit work requiring unresolved helper/TL packaging decisions, AgentInterface migration, registry distribution redesign, publication or deprecation. #17 final integrated streaming/performance/memory/migration guidance follows the component/chart inventory and remaining approved kit decisions. Existing SSR deferral remains. Root must dispatch the next bounded work before production edits begin.
