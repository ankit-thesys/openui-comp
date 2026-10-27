# Chart stable-selector verification preparation — SOURCE ONLY

Prepared by the existing independent verifier on 2026-10-27. Baseline is frozen PR69 source `75f69041891147d52dc0f0d2c4b21a048e575aa8` at `/private/tmp/openui-selectors65-frozen`. No worker production files, dependencies, lab, browser, server or build were changed or started. This preparation does not own a browser/build window and is not runtime acceptance. Wait for the workers' explicit release and an immutable combined source hash, package tree, archive hash and installed-consumer handoff before runtime work.

Machine-readable source inventory: `/private/tmp/openui-charts-verifier-inventory.json`. It records exact baseline file/template hashes, registration lines, direct importers, media-block presence and ownership. It is a lexical source inventory, not evaluated Goober output or a specificity calculator.

## Inventory and ownership

Exactly **25 CSS registrations and nine keyframe definitions** occur in 21 chart style modules. No `!important` appears in these modules. W1 owns13 family registrations; W2 owns12 shared registrations. This count must be reconciled against final conversion ledger, not inferred from the number of chart exports.

| Owner | Module relative to components/Charts | CSS registrations |
| --- | --- | --- |
| W1 | AreaChart/areaChart.styles.ts | rootClass |
| W1 | LineChart/lineChart.styles.ts | rootClass |
| W1 | BarChart/barChart.styles.ts | rootClass |
| W1 | BarChart/horizontalBarChart.styles.ts | rootClass |
| W1 | PieChart/pieChart.styles.ts | rootClass |
| W1 | RadialChart/radialChart.styles.ts | rootClass |
| W1 | RadarChart/radarChart.styles.ts | rootClass |
| W1 | ScatterChart/scatterChart.styles.ts | rootClass |
| W1 | FunnelChart/funnelChart.styles.ts | rootClass |
| W1 | HeatmapChart/heatmapChart.styles.ts | rootClass, divergingRampClass |
| W1 | CalendarHeatmap/calendarHeatmap.styles.ts | rootClass |
| W1 | SegmentedBar/segmentedBar.styles.ts | rootClass |
| W2 | shared/chartBase.styles.ts | emptyClass, yAxisLabelClass, xAxisLabelClass |
| W2 | shared/cartesian/ScrollButtonsHorizontal/scrollButtonsHorizontal.styles.ts | rootClass |
| W2 | shared/cartesian/ScrollButtonsVertical/scrollButtonsVertical.styles.ts | rootClass |
| W2 | shared/core/DefaultLegend/defaultLegend.styles.ts | rootClass |
| W2 | shared/core/PortalTooltip/portalTooltip.styles.ts | portalClass, tooltipClass |
| W2 | shared/core/StackedLegend/stackedLegend.styles.ts | rootClass, layoutClass, scrollbarClass |
| W2 | shared/mini/miniChart.styles.ts | rootClass |

Nine keyframe definitions: family grow in vertical and horizontal Bar, appear in Funnel/Pie/Radar/Scatter, cellIn in CalendarHeatmap, shared drawLineAnimation and fadeAppearAnimation. Preserve source bodies/interpolation, duration/delay/fill-mode/transform-origin and media boundaries. Do not create replacement animation helpers.

`Charts/index.ts` exposes19 named chart variants: Area/AreaCondensed, Line/LineCondensed, Bar/BarCondensed/HorizontalBar, Pie, Radial, Radar, Scatter, Heatmap, Funnel, SegmentedBar/SingleStackedBar, CalendarHeatmap, MiniArea/MiniBar/MiniLine. SingleStackedBar is an exact SegmentedBar alias. Condensed wrappers delegate to their parent with `condensed`; HorizontalBar delegates to Bar with orientation horizontal. They have no separate CSS modules. All three mini families import MiniChartFrame, which owns the shared mini registration. Do not add duplicate registrations to wrappers.

## Specific source risks and required checks

### 1. SVG specificity is not uniformly one class

Actual baseline examples:
- `& line:where(.openui-area-chart-grid line)` has specificity(0,1,1) after the old generated class is substituted. The zero line adds an explicit `.openui-grid-zero-line`, giving(0,2,1). Line and Scatter repeat this pattern; HorizontalBar has a vertical-grid line rule.
- `& svg:where(.openui-chart-legend-item svg)` and portal tooltip svg/span selectors retain their SVG/type component. `:where` zeroes its contents, not the type outside it.
- `& :hover:where(.openui-heatmap-chart-cell)` keeps hover specificity. Calendar highlight rules also contain an attribute and `:not(.level-N)` outside `:where`.
- StackedLegend layout has both `&:where(.row)` and `&.openui-chart-with-stacked-legend--row ...`; these deliberately differ in specificity. Scroll-button descendants use ordinary class selectors, not `:where`.

Replacing the generated root with a canonical class should preserve these weights. Do not indiscriminately wrap retained type/state/attribute selectors in `:where` or duplicate a compound root as happened in the earlier markdown-dark defect. Final actual CSSOM, not source search alone, must confirm the zero-specificity private document guard is the only generated namespace and public selectors match real elements. Test each member of comma-separated lists; strip every recognized guard before flagging generated names outside the namespace.

For override probes use an equal-context later rule when necessary, e.g. family-root + line + zero-line class for the zero-grid case. A single unrelated part class cannot be advertised as beating a more-specific contextual rule. Query counts and `element.matches(rule.selectorText)` must be positive before reading properties.

### 2. New roots and old aliases/host isolation

Preserve existing dynamic aliases built from CHART_CLASS_PREFIX (`openui`), className props and query/test/export hooks. New canonical roots should be disjoint from old aliases and all new canonical registrations, including prior core hooks. The machine inventory is not a complete evaluated list of dynamic aliases; inspect final ledger and actual DOM.

Old aliases include mini-chart/container hooks, chart-empty/cartesian-axis labels, portal-tooltip/chart-tooltip, chart-legend and stacked-legend/container/layout/scrollbar hooks. Several CSS constants coexist on the same element: emptyClass + a family root, divergingRampClass + color-scale-ramp, and legend root/layout contexts. Preserve rule order and do not infer separate DOM nodes from separate constants. CalendarHeatmap's current root uses only rootClass and the caller className; do not assume an existing old public root alias that is not rendered.

Seed old-root-only and old-part-only HTML and SVG sentinels outside real charts. Check them before import, after import and after interactions in plain/TW3/TW4 before/after order. Include a real SVG `line` sentinel carrying grid/zero-line aliases. Old hook sentinels must not be selected by chart interactions (scope queries to actual chart fixture roots). No styling may leak just because the document namespace is activated.

### 3. Shared callers, mini/condensed and empty paths

- CartesianChartLayout imports shared x/y labels and owns fit-vs-scroll DOM. Area/Line/Bar import emptyClass directly; ChartShell handles common empty paths for other families.
- HorizontalBarChartImpl imports its family root directly. The empty Bar branch runs before the horizontal branch and currently combines vertical Bar root + shared empty class; preserve this routing.
- DefaultLegend, StackedLegendView, ChartWithStackedLegend and both scroll-button components import shared constants. MiniChartFrame applies shared root to three public families.
- HeatmapColorScale imports divergingRampClass separately. The pseudo-element must attach to the actual ramp, not require a family-root ancestor that might be absent in an optimized caller.
- Shared animations and declaration-only chartBaseDeclarations/chartTypography feed multiple family modules. Preserve bodies and current interpolation semantics; no new runtime style resolver.

Use representative optimized/lazy public imports for a condensed cartesian chart with labels, a mini chart, a chart with tooltip/legend, and empty state; include public StackedLegend if it renders independently. Bind actual entry-reachable static/dynamic graphs and exact input archives. Reuse accepted prior runtime evidence only for byte-identical sources. Presence of all emitted files is not eager download, and eager shared cost/zero-unused CSS are not newly solved by this conversion.

### 4. Portal/legend states

ChartTooltip uses createPortal into document.body. The wrapper explicitly combines portalClass, old `openui-portal-tooltip` and portalThemeClassName from useTheme; the inner panel combines tooltipClass and old `openui-chart-tooltip`. Root-scoping a new shared tooltip rule below the chart container would miss the real portal. Verify a real hovered chart's nested-theme popup, not a hand-built tooltip or direct mock.

Floating UI strategy/top/left/opacity/transition and the spring-written transform are existing inline positioning/animation. Probe stylesheet-owned panel border radius/padding/color and an owned wrapper property such as z-index, not inline position/transform. Preserve pointer-events:none so hovering tooltip does not steal chart interaction. Include actual tooltip item/label/separator rendering; >10 items has a separate five-item/view-more branch where practical within the existing harness.

DefaultLegend collapse/expand and hide/show series must preserve palette identity and layout. StackedLegend has hovered and active item backgrounds/transforms, row/column layouts, a scrollbar pseudo-element and overflow buttons. Cover one real overflow/disabled scroll control, hidden-series state and matching owned-part override; do not force a hidden disabled button to act. Theme/font measurement is consumed by chart dimensions, so restore consumer overrides before geometry/resize comparisons.

LabelTooltip is a separate Radix portal with an old hook but **no owned CSS registration in this baseline**. It is not the ChartTooltip panel. Do not invent a new registration or claim an ordinary label-tooltip style/portal-theme pass for an absent baseline rule. Preserve existing behavior and report inherited limitations separately.

### 5. Inline geometry/presentation attributes/owned properties

Keep separate ledgers:
- SVG presentation attributes (`fill`, `stroke`, x/y/width/height, path d) are not inline CSS declarations. A matching stylesheet may override presentation fill/stroke; preserve attribute geometry and use valid SVG computed-style probes.
- Existing inline styles are a different precedence contract: Heatmap cell-label `style.fill`; legend swatch `style.backgroundColor`; hidden legend item opacity; Calendar swatch-slot opacity and optional separator stroke; container width/height; MiniChartFrame size; portal transform/position; per-mark animationDelay. Do not assert normal CSS beats those inline values.
- Examples of useful stylesheet-owned probes: SVG grid stroke/dasharray with equal context, tick typography/fill, chart empty min-height/text, legend label color/gap, mini root cursor/min-size (without fighting inline size), portal panel padding/border-radius, Heatmap hover stroke, Calendar selected-level/ghost fill-opacity, diverging-ramp `::after` opacity/background.

Constrain requested widths to actual max/min/flex rules and avoid `inline-block` display expectations where flex/grid blockifies the result. SVG animated/transformed getBoundingClientRect is phase-dependent; compare settled natural finite entrances or use a separately documented standard equal-time animation probe. No global snapshot tolerances or removal of all opacity/transform checks.

### 6. Motion, print and inherited HorizontalBar

Most family entrances and shared mini animation declarations are inside `prefers-reduced-motion:no-preference`. SegmentedBar's animated transition rule is outside that media guard in the baseline; retain the existing contract rather than silently adding a new accessibility behavior. JS springs/dataMorph also read reduced-motion separately and can continue RAF work independently of document.getAnimations(); preserve those source files.

Use one normal-motion actual animated representative to confirm unchanged keyframes/final geometry, and one reduced-motion fixture for media activation and readable visible marks. Check Heatmap/Funnel print-media declarations if touched by conversion and preserve both pre-existing print/export mechanisms/data attributes; no full export-product revalidation needed for byte-identical export code.

HorizontalBar's default string-height + fit-legend resize feedback loop is an inherited, previously unpassed strict case. Relevant unchanged path: Bar→HorizontalBarChartImpl→useHorizontalBarChartOrchestrator→useChartShell/useContainerSize/useLegendHeight; `effectiveHeight = containerHeight || numericHeight`, then legend deduction feeds chartHeight. Source inspection explains why measurement/legend feedback is relevant; it is not a new reproduction or conclusive diagnosis. Use a pinned numeric-height stable case for selector parity and preserve the prior failing string-height witness separately. Do not call it solved, hide it by changing defaults, change geometry hooks, or attribute it to the selector migration without new paired evidence.

## Final bounded acceptance plan (after explicit release/freeze)

1. Verify frozen head/package tree/archives and distinct installed inputs. Compare declarations, fallback expressions and nine keyframe bodies; screen changed files for behavior/geometry/JS animation edits. Confirm old react-ui untouched. Reconcile all25 registration sites and canonical names with actual final ledger.
2. Reuse existing chart baseline/harness and selected stable data. In all six plain/TW3/TW4 before/after configurations, make one paired representative chart/mini/shared scene that exercises cartesian grid/zero-line, empty labels, legend, shared tooltip and SVG styling. Use byte-identical earlier family evidence for unaffected geometry; do not replay every old performance matrix.
3. Focused state checks: real nested-theme tooltip, legend hide/expand/active/overflow, one mini click, Heatmap/diverging pseudo, Calendar highlight/hover, actual condensed axis labels; source ledger + worker family matrix cover remaining registrations, with bounded independent spot checks for unique selector structures. Record observed vs directly overridden hooks separately.
4. Representative optimized/lazy imports and stock-global/namespace registration plateau. No custom import scanner, stylesheet injector, production patch or new library. Bind graph reachability and emitted assets to the final archives, not source checkout assumptions.
5. Report candidate regressions separately from inherited failures/inline limits. No SSR/hydration, full streaming, performance/memory/soak acceptance or broad release/CI changes under this selector gate. Preserve raw failed assertions and any corrected fixture follow-ups.

## Current disposition

Source-risk inventory complete. No conversion defect is asserted from this baseline-only review. **No browser/build executed or window claimed.** Await workers' frozen combined artifact and explicit release for independent bounded runtime acceptance. Root may relay this handoff to both workers; this verifier has not messaged them or edited their assignments.

## Frozen combined chart preflight COMPLETE — source/archive only

Candidate5e09b37c04a1a3be05b9447cf8b9effaf33a331f/tree2c31eb88b05349b48717c389deab040ec532fc7f and final archiveb09f11e6aa2809f42f7aee5eb2c23bd7bf6c58904d4a935918044f039ff7dd71 independently verified against69. Report `/private/tmp/openui-styles-independent-verification/charts-preflight/REPORT.md`, raw `/private/tmp/openui-styles-independent-verification/charts-preflight/source-archive-results.json`.

25 complete CSS bodies conserved in19 grouped registrations,25 canonical strings unique/no baseline quoted-literal collision;9 exact keyframes;1444 fallbacks/95files;440 unchanged declarations;371 owned embedded sources;2210installed members per distinct arm bound. Final/testedarchive differs ONLY README. Only19chartstylefiles+README changed. No import/install/build/browser execution and no production edit.

Reviewed worker1827 functional assertion records and four original invalid/stopped attempt dispositions; did not adopt them as independent runtime. Small/import runtime remains handoff-pending despite81on-disk records; no premature final acceptance. Focused existing-fixture runtime plan recorded in preflight REPORT. Worker1 retains window. Await explicit release/final immutable runtime handoff before any verifier browser/build work.
