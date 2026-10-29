---
"@openuidev/react-components": minor
---

Settle shared-internal names and derived data attributes. Hint's class is `openui-hint` (it was `openui-form-control-hint`), since Hint is exported on its own. Names that repeated a segment are renamed: `openui-list-item-item` is now `openui-list-item-row`; `openui-editable-table-table`, `-table-header` and `-table-body` are now `openui-editable-table-grid`, `-grid-header` and `-grid-body`; `openui-chart-with-stacked-legend-legend` is now `openui-chart-with-stacked-legend-panel`. The selector reference marks shared internals (`openui-border-box`, `openui-skeleton-pulse` and the `openui-chart-*` family). Derived data attributes are public API and documented in the README. Boolean ones are absent when false: ListItem `data-action` and `data-subtitle`, MetricIndicator `data-subtext` and ContextCardBlock `data-background-image` no longer render `="false"`. Calendar's `data-selection` now names the mode (`"single"` or `"multiple"`).
