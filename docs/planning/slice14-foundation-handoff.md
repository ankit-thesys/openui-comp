# Chart foundation handoff

The root chart dispatch authorizes implementation after the original read-only
slice14 proposal. Parent: reviewed PR36 d9d6c78f085bfb92d475d76bead2c73dbb428131.
Shared type bootstrap ad6f92672 and Worker2 prerequisites edf662fb9 are integrated.

Worker1 owns shared chart foundation, root barrel/dependencies, and Polar/Other
families. Worker2 owns Cartesian/Mini family paths and their tests. Do not revert
or duplicate each other's source. Existing react-ui remains read-only. Preserve
untracked crates/. Browser window remains Worker1 first; Worker2 source-only
until explicit release. No migration-wide or performance acceptance is claimed.

## Shared styling contract for family implementation

All paths below are under packages/react-ui-core/src/components/Charts/.

- shared/chartBaseDeclarations.ts exports concrete typed declarations:
  cartesianContainer, cartesianContainerInner, cartesianYAxisContainer,
  cartesianMainContainer, centeredContainer, centeredSvgWrapper, gridLine,
  zeroGridLine, activeDotOuter, activeDotInner, crosshairLine. Reuse them in the
  family-owned existing selectors in place of the original SCSS mixin bodies;
  preserve selector specificity. These are static objects, not a style factory.
- shared/chartTypography.ts exports svgTickLabel for the existing tick mixin.
- shared/animations/{drawLine,fadeAppear}.styles.ts export drawLineAnimation and
  fadeAppearAnimation. Use generated names instead of the original literal SCSS
  keyframe names; animation behavior must remain unchanged.
- shared/chartBase.styles.ts exports emptyClass and axis label classes. ChartShell
  and CartesianChartLayout already attach their applicable classes. Cartesian
  Area/Line/Bar families with independent empty wrappers must attach emptyClass.
- Shared MiniChartFrame, DefaultLegend, StackedLegend/View/layout, PortalTooltip,
  horizontal/vertical scroll buttons already attach their generated styles.
  Do not duplicate those shared conversions in family modules.

Only stock Goober css/keyframes APIs are used. Keep existing class hooks and
props. Concrete styles use token defaults matching existing defaultLightTheme.
No SCSS imports, generic style engine, selector parser or dependency manifest
resolver is introduced. Existing private spring/measurement code is copied.

## Public surface and dependencies

Charts/index.ts currently exports only implemented support: LegendStoreProvider,
useLegendEntry, LegendEntry, StackedLegendItem, StackedLegend/Props,
CHART_CLASS_PREFIX and the original five root chart types. HoverOverlayProps
stays internal. Public React PrintContext exports are restored separately.
Family and scatter-helper root exports are pending their committed source.

D3 runtime ranges and declaration ranges match old react-ui. Zustand remains a
peer (^4.5.5) with a matching development dependency, not a new bundled runtime.
The lock change adds only 21 core importer lines. CalendarHeatmap types/pure parts
and Funnel geometry are necessary unchanged prerequisites for shared hooks;
Worker1 will implement those owned families next.

## Validation boundary

See packages/react-ui-core/evidence/charts-foundation/README.md and raw logs.
Focused public support/type tests pass 3/3; build, strict types, scoped lint and
producer-native public support ESM/CJS imports pass. Both independent review
axes have no actionable foundation findings. Full suite, normal installed D3
families, strict consumer types, pruning and real Chrome family/state/theme/
resize/legend/tooltip/print-export validation remain pending. This checkpoint
unblocks family source work only.
