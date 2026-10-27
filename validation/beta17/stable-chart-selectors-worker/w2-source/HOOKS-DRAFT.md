# Shared chart canonical targets — integration draft

Source-only candidate `6662ff5424a5a43b509d5912cd85dd56871ace01`. W1 owns package README/coverage integration. No runtime acceptance is claimed. Existing aliases and nested parts remain on the existing DOM.

| Export | Canonical target | Source file |
| --- | --- | --- |
| `rootClass` | `.openui-chart-horizontal-scroll-controls-root` | `shared/cartesian/ScrollButtonsHorizontal/scrollButtonsHorizontal.styles.ts` |
| `rootClass` | `.openui-chart-vertical-scroll-controls-root` | `shared/cartesian/ScrollButtonsVertical/scrollButtonsVertical.styles.ts` |
| `emptyClass` | `.openui-chart-empty-root` | `shared/chartBase.styles.ts` |
| `yAxisLabelClass` | `.openui-chart-y-axis-label-root` | `shared/chartBase.styles.ts` |
| `xAxisLabelClass` | `.openui-chart-x-axis-label-root` | `shared/chartBase.styles.ts` |
| `rootClass` | `.openui-chart-default-legend-root` | `shared/core/DefaultLegend/defaultLegend.styles.ts` |
| `portalClass` | `.openui-chart-tooltip-portal-root` | `shared/core/PortalTooltip/portalTooltip.styles.ts` |
| `tooltipClass` | `.openui-chart-tooltip-root` | `shared/core/PortalTooltip/portalTooltip.styles.ts` |
| `rootClass` | `.openui-chart-stacked-legend-root` | `shared/core/StackedLegend/stackedLegend.styles.ts` |
| `layoutClass` | `.openui-chart-stacked-legend-layout-root` | `shared/core/StackedLegend/stackedLegend.styles.ts` |
| `scrollbarClass` | `.openui-chart-stacked-legend-scrollbar` | `shared/core/StackedLegend/stackedLegend.styles.ts` |
| `rootClass` | `.openui-mini-chart-root` | `shared/mini/miniChart.styles.ts` |

Ordinary later unlayered CSS may target actual canonical roots. Variant/state/descendant rules retain their existing context; validate the specific owned property and selector on actual rendered targets. A bare root is not promised to defeat nested/state selectors. Shared scrollbar is a pseudo-element-only target; do not invent a base declaration just to make an override assertion pass.

Tooltip position/top/left/transform/opacity remain owned by existing inline FloatingUI and spring behavior. Mini dimensions, legend indicator colors/hidden opacity/cursor, stacked layout sizing and SVG attributes retain existing inline precedence. Both shared keyframes remain unchanged and private; reduced-motion behavior must be measured without disabling animations or changing CSS. Empty-state styling is reused by chart family callers via the unchanged `emptyClass` import.

The guard is a private generated document marker with zero specificity, not a new consumer hook or generation-free CSS promise. No setup command, runtime helper, custom registry or stylesheet patch is introduced. Browser/emitted output/pruning/appearance/theme/host/global-order/portal/interaction validation remains pending the assigned window.
