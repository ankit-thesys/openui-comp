# Cross-module style order report

Recorded from the built contract fixtures. Each row identifies an element by its tag, stable
classes and occurrence among classed elements. Rules include potential states, pseudo-elements
and conditional branches, not only the state active at capture. Repeated identical rows are
grouped with all occurrence indexes. Common physical shorthands also include the longhands
they reset. Ancestor prose/SVG rules are excluded from the ancestor's properties. This is an
order-risk inventory, not a computed-style verdict.

## Charts/initial

Elements 90: `div.openui-line-chart.openui-line-chart--variant-natural.openui-chart-empty`

Modules: `Charts/LineChart/lineChart.styles.mjs`, `Charts/shared/chartBase.styles.mjs`

- Charts/LineChart/lineChart.styles.mjs ↔ Charts/shared/chartBase.styles.mjs: display

Elements 92: `div.openui-bar-chart.openui-bar-chart--variant-grouped.openui-chart-empty`

Modules: `Charts/BarChart/barChart.styles.mjs`, `Charts/shared/chartBase.styles.mjs`

- Charts/BarChart/barChart.styles.mjs ↔ Charts/shared/chartBase.styles.mjs: display

Elements 94, 600, 607, 1510: `div.openui-chart-empty.openui-pie-chart.openui-pie-chart--variant-pie.openui-pie-chart--appearance-circular`

Modules: `Charts/PieChart/pieChart.styles.mjs`, `Charts/shared/chartBase.styles.mjs`

- Charts/PieChart/pieChart.styles.mjs ↔ Charts/shared/chartBase.styles.mjs: align-items, display

Elements 186, 595: `button.openui-button.openui-button--variant-tertiary.openui-button--size-small.openui-button--tone-default.openui-default-legend-toggle-button`

Modules: `Button/button.styles.mjs`, `Charts/shared/core/DefaultLegend/defaultLegend.styles.mjs`

- Button/button.styles.mjs ↔ Charts/shared/core/DefaultLegend/defaultLegend.styles.mjs: color

Elements 343: `button.openui-icon-button.openui-icon-button--variant-secondary.openui-icon-button--size-2-extra-small.openui-icon-button--shape-square.openui-icon-button--tone-default.openui-scroll-buttons-horizontal-button.openui-scroll-buttons-horizontal-left`

Modules: `Charts/shared/cartesian/ScrollButtonsHorizontal/scrollButtonsHorizontal.styles.mjs`, `IconButton/iconButton.styles.mjs`

- Charts/shared/cartesian/ScrollButtonsHorizontal/scrollButtonsHorizontal.styles.mjs ↔ IconButton/iconButton.styles.mjs: background-color, cursor, transition, transition-delay, transition-duration, transition-property, transition-timing-function

Elements 346: `button.openui-icon-button.openui-icon-button--variant-secondary.openui-icon-button--size-2-extra-small.openui-icon-button--shape-square.openui-icon-button--tone-default.openui-scroll-buttons-horizontal-button.openui-scroll-buttons-horizontal-right`

Modules: `Charts/shared/cartesian/ScrollButtonsHorizontal/scrollButtonsHorizontal.styles.mjs`, `IconButton/iconButton.styles.mjs`

- Charts/shared/cartesian/ScrollButtonsHorizontal/scrollButtonsHorizontal.styles.mjs ↔ IconButton/iconButton.styles.mjs: background-color, cursor, transition, transition-delay, transition-duration, transition-property, transition-timing-function

Elements 530: `button.openui-icon-button.openui-icon-button--variant-secondary.openui-icon-button--size-extra-small.openui-icon-button--shape-square.openui-icon-button--tone-default.openui-scroll-buttons-vertical-button.openui-scroll-buttons-vertical-up`

Modules: `Charts/shared/cartesian/ScrollButtonsVertical/scrollButtonsVertical.styles.mjs`, `IconButton/iconButton.styles.mjs`

- Charts/shared/cartesian/ScrollButtonsVertical/scrollButtonsVertical.styles.mjs ↔ IconButton/iconButton.styles.mjs: background-color, cursor, transition, transition-delay, transition-duration, transition-property, transition-timing-function

Elements 533: `button.openui-icon-button.openui-icon-button--variant-secondary.openui-icon-button--size-extra-small.openui-icon-button--shape-square.openui-icon-button--tone-default.openui-scroll-buttons-vertical-button.openui-scroll-buttons-vertical-down`

Modules: `Charts/shared/cartesian/ScrollButtonsVertical/scrollButtonsVertical.styles.mjs`, `IconButton/iconButton.styles.mjs`

- Charts/shared/cartesian/ScrollButtonsVertical/scrollButtonsVertical.styles.mjs ↔ IconButton/iconButton.styles.mjs: background-color, cursor, transition, transition-delay, transition-duration, transition-property, transition-timing-function

Elements 620, 627, 634, 641, 648, 655, 662, 669, 6857, 6864, 6888, 6895: `div.openui-separator.openui-stacked-legend-separator`

Modules: `Charts/shared/core/StackedLegend/stackedLegend.styles.mjs`, `Separator/separator.styles.mjs`

Shared properties: none.

Elements 714: `button.openui-button.openui-button--variant-secondary.openui-button--size-small.openui-button--tone-default.openui-stacked-legend-show-more-button`

Modules: `Button/button.styles.mjs`, `Charts/shared/core/StackedLegend/stackedLegend.styles.mjs`

Shared properties: none.

Elements 2156: `div.openui-chart-empty.openui-radar-chart.openui-radar-chart--variant-line.openui-radar-chart--grid-shape-polygon`

Modules: `Charts/RadarChart/radarChart.styles.mjs`, `Charts/shared/chartBase.styles.mjs`

- Charts/RadarChart/radarChart.styles.mjs ↔ Charts/shared/chartBase.styles.mjs: align-items, display

Elements 2718: `div.openui-chart-empty.openui-radial-chart.openui-radial-chart--variant-circular`

Modules: `Charts/RadialChart/radialChart.styles.mjs`, `Charts/shared/chartBase.styles.mjs`

- Charts/RadialChart/radialChart.styles.mjs ↔ Charts/shared/chartBase.styles.mjs: align-items, display

Elements 3076: `div.openui-chart-empty.openui-funnel-chart.openui-funnel-chart--edges-curved.openui-funnel-chart--orientation-horizontal`

Modules: `Charts/FunnelChart/funnelChart.styles.mjs`, `Charts/shared/chartBase.styles.mjs`

- Charts/FunnelChart/funnelChart.styles.mjs ↔ Charts/shared/chartBase.styles.mjs: align-items, display

Elements 3501: `div.openui-chart-empty.openui-heatmap-chart.openui-heatmap-chart--ramp-mode-sequential`

Modules: `Charts/HeatmapChart/heatmapChart.styles.mjs`, `Charts/shared/chartBase.styles.mjs`

- Charts/HeatmapChart/heatmapChart.styles.mjs ↔ Charts/shared/chartBase.styles.mjs: align-items, display

Elements 6770: `div.openui-chart-empty.openui-calendar-heatmap.openui-calendar-heatmap--layout-fluid.openui-calendar-heatmap--legend-variant-swatches`

Modules: `Charts/CalendarHeatmap/calendarHeatmap.styles.mjs`, `Charts/shared/chartBase.styles.mjs`

- Charts/CalendarHeatmap/calendarHeatmap.styles.mjs ↔ Charts/shared/chartBase.styles.mjs: align-items, display

Elements 6797, 6823, 6911: `div.openui-default-legend.openui-segmented-bar-default-legend`

Modules: `Charts/SegmentedBar/segmentedBar.styles.mjs`, `Charts/shared/core/DefaultLegend/defaultLegend.styles.mjs`

- Charts/SegmentedBar/segmentedBar.styles.mjs ↔ Charts/shared/core/DefaultLegend/defaultLegend.styles.mjs: padding-top

Elements 6849, 6880: `div.openui-stacked-legend.openui-segmented-bar-stacked-legend`

Modules: `Charts/SegmentedBar/segmentedBar.styles.mjs`, `Charts/shared/core/StackedLegend/stackedLegend.styles.mjs`

Shared properties: none.

Elements 6928: `div.openui-chart-empty.openui-segmented-bar.openui-segmented-bar--legend-variant-default.openui-segmented-bar--legend`

Modules: `Charts/SegmentedBar/segmentedBar.styles.mjs`, `Charts/shared/chartBase.styles.mjs`

- Charts/SegmentedBar/segmentedBar.styles.mjs ↔ Charts/shared/chartBase.styles.mjs: align-items, display, justify-content

Elements 6934, 6937: `button.openui-icon-button.openui-icon-button--variant-secondary.openui-icon-button--size-extra-small.openui-icon-button--shape-square.openui-icon-button--tone-default.openui-stacked-legend-scroll-button`

Modules: `Charts/shared/core/StackedLegend/stackedLegend.styles.mjs`, `IconButton/iconButton.styles.mjs`

- Charts/shared/core/StackedLegend/stackedLegend.styles.mjs ↔ IconButton/iconButton.styles.mjs: align-items, cursor, display, justify-content
