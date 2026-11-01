# Cross-module style order report

Recorded from the built contract fixtures. Each row identifies an element by its tag, stable
classes and occurrence among classed elements. Rules include potential states, pseudo-elements
and conditional branches, not only the state active at capture. Repeated identical rows are
grouped with all occurrence indexes. Common physical shorthands also include the longhands
they reset. Ancestor prose/SVG rules are excluded from the ancestor's properties. This is an
order-risk inventory, not a computed-style verdict.

## Table/initial

Elements 57: `div.openui-table-container.openui-scrollable-table-scroll-container`

Modules: `Table/scrollableTable.styles.mjs`, `Table/table.styles.mjs`

- Table/scrollableTable.styles.mjs ↔ Table/table.styles.mjs: overflow, overflow-x, overflow-y

Elements 58: `table.openui-table.openui-scrollable-table`

Modules: `Table/scrollableTable.styles.mjs`, `Table/table.styles.mjs`

- Table/scrollableTable.styles.mjs ↔ Table/table.styles.mjs: width
