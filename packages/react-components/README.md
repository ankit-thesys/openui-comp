# @openuidev/react-components (beta)

Reusable OpenUI React components, charts and themes. This additive package keeps
existing component props, appearance and behavior while converting owned styles
to stock Goober. The existing `@openuidev/react-ui` remains unchanged.

## Imports and customization

All public components, supporting parts and types come from the package root.
There are no component subpath exports or new styling props.

```tsx
import { Button, Input, TextArea, ThemeProvider } from "@openuidev/react-components";

export function ContactForm() {
  return (
    <ThemeProvider>
      <Input aria-label="Name" size="medium" />
      <TextArea aria-label="Message" rows={3} />
      <Button variant="primary" type="submit">
        Send
      </Button>
    </ThemeProvider>
  );
}
```

The root includes inputs and controls; layout containers and their parts;
text, Markdown, images and citations; loading and help; tables, lists and composed
cards; and the existing chart families. Existing variants, native attributes,
refs, `className`, `style` and component-specific customization remain available.
Input also retains its existing `styles` alias. OptionCards remains controlled:
update `selected` in response to `onToggle`.

## Themes

```tsx
import { createTheme, ThemeProvider, useTheme } from "@openuidev/react-components";

const brand = createTheme({ interactiveAccentDefault: "oklch(0.6 0.2 260 / 1)" });

export function App() {
  return <ThemeProvider lightTheme={brand}>{/* application */}</ThemeProvider>;
}
```

Existing `lightTheme`, `darkTheme`, `mode`, deprecated `theme` and `cssSelector`
props are preserved. `useTheme`, default themes, swatches, theme types and
system/preference hooks and constants are public; theme context objects remain
private. LayoutContext/LayoutContextProvider/useLayoutContext and
PrintContext/PrintContextProvider/usePrintContext retain their public APIs.

A top-level provider targets `body` by default. Nested providers scope their
tokens automatically. For independent top-level themes, use separate existing
`cssSelector` targets. `useTheme().portalThemeClassName` retains the portal theme
mechanism. `useThemeModePreference` keeps JSON localStorage preferences and the
`data-openui-theme` document attribute; it does not synchronize separate hook
instances or browser tabs.

## Automatic styles

Owned component styles use unmodified Goober module-scope `css` calls and do not
require a CSS import, setup command or styling build plugin. Styles register
when a referenced module evaluates, before the component renders. The build
preserves modules and marks unused modules removable by the consumer's bundler.
A bundler may combine several retained components in a shared lazy chunk; their
styles can register together when that chunk evaluates. This is not a guarantee
of a separate stylesheet or network chunk for each component.

Importing the package also registers the existing light-theme token defaults on
the document root, without a provider. These defaults occupy the first CSS layer,
so normal host token declarations override them, including declarations in named
layers. Inherited container overrides and ThemeProvider scopes remain supported;
system dark mode does not change the provider-free defaults.

Component-level `var()` fallbacks are intentionally retained. Clearing an
inherited token, for example with `--openui-interactive-accent-default: initial`,
still uses the component's existing default. Automatic root defaults complement
that behavior; they do not replace the fallback when a consumer clears a token.

Buttons, FormControl and TagBlock share a root-only `box-sizing: border-box`
declaration. Descendant styling, component layout and state rules remain local.

Chrome with plain CSS, Tailwind v3 and Tailwind v4 is the current browser target.
Host preflight remains enabled. Ordinary utility classes do not necessarily beat
component defaults. Intentional overrides can use scoped important CSS or the
framework's important utility modifier: Tailwind v3 `!bg-red-500`, Tailwind v4
`bg-red-500!`. Existing component props, inline styles and theme tokens remain
the primary customization APIs. Replacing host styles dynamically after mount
has not been certified.

### Stable selectors

Button and IconButton use stable styling targets. Button follows the flat
convention: each stable class is a single class, every prop emits its current
value (defaults included), and its rules register through stock Goober the first
time a Button renders, with nothing added to `html`. Library rules weigh one
class, plus one state such as `:hover`, and the library sheet is placed first in
`<head>`, so a consumer rule of the same shape wins whether it loads before or
after the library: `.openui-button--variant-primary` for the resting look,
`.openui-button--variant-primary:hover` for the hover look.
IconButton still registers on import: a private generated class on `html` is
contained in `:where(...:root)` and adds zero specificity. Consumers do not use
that class. The documented batches below share this mechanism;
EditableTable retains its existing selectors. Chart-owned targets are documented
in the Charts section below.

| Target | Button | IconButton |
| --- | --- | --- |
| Root | `.openui-button` | `.openui-icon-button-root` |
| Preserved root alias | None | `.openui-icon-button` |
| Variant | `.openui-button--variant-primary` (also secondary/tertiary) | `.openui-icon-button-primary` (also secondary/tertiary) |
| Destructive | `tone="destructive"`: `.openui-button--tone-destructive` (default `.openui-button--tone-default`) | `.openui-icon-button-destructive-primary` (also secondary/tertiary) |
| Size | `.openui-button--size-{extra-small,small,medium,large}` | `.openui-icon-button-{3-extra-small,2-extra-small,extra-small,small,medium,large}` |
| Shape | Existing Button geometry | `.openui-icon-button-square`, `.openui-icon-button-circle` |
| State | `:hover`, `:active`, `:disabled` on any Button class | `:hover:not(:disabled)`, `:active:not(:disabled)`, `:disabled` |
| Owned part | `.openui-button-icon` (span around `iconLeft` and `iconRight`) | `.openui-icon-button-icon` (existing span) |

Use ordinary **later, unlayered CSS** with the corresponding selector. Root rules
have one class of specificity; variants, sizes, states and parts retain their
additional selectors. For example:

```css
.openui-button { border-width: 2px; }
.openui-button--variant-primary { background: navy; }
.openui-button--variant-primary:disabled { cursor: wait; }
.openui-icon-button-root .openui-icon-button-icon { gap: 4px; }
```

No `!important` is required for these matching overrides. This does not promise
that earlier CSS, a root-only selector against a variant rule, or normal CSS in a
named layer beats unlayered component rules. Existing props, inline styles and
theme APIs remain unchanged; no new styling prop is introduced. Old root aliases
remain available on actual components. Host elements carrying only those old
aliases do not acquire the new component styles.

The shared `openui-border-box` helper opts in only Buttons, FormControl and
TagBlock roots. A later root class can override its box sizing. It does not style
descendants. Buttons, FormControl and TagBlock also have their remaining owned rules
converted in the batches below.

### Control selectors

The control batch adds the following stable styling roots. Existing aliases,
parts, variants, native attributes, refs and customization props are retained.
No rendered wrapper is added. Component styles use the same private
zero-specificity document guard as the Button/IconButton pilot.

| Family | Styling root | Existing parts and states |
| --- | --- | --- |
| CheckBoxGroup | `.openui-checkbox-group-root` | Existing clear/card/sunk variant classes. |
| CheckBoxItem | `.openui-checkbox-item-container-root` | Container root; `.openui-checkbox-item-root`, indicator, content, label and description; checked/disabled states stay on the Radix control. |
| Chips | `.openui-chips-root` | Existing chip item, icon and text; selected/disabled modifiers and focus-visible state. |
| FormControl | `.openui-form-control-root`, `.openui-hint-root` | FormControl and Hint roots; error context still reaches Input/TextArea/Hint. |
| Input | `.openui-input-root` | Existing small/medium/large, error, focus, hover, disabled and placeholder selectors. |
| Label | `.openui-label-root` | Existing disabled modifier and required-asterisk part. |
| OptionCards | `.openui-option-cards-root` | Existing grid/row/card/content/text/title/subtitle/top parts; selected/disabled/focus-visible state and container queries. |
| RadioGroup | `.openui-radio-group-root` | Existing clear/card/sunk variants; native Radix behavior. |
| RadioItem | `.openui-radio-item-container-root` | Container root; existing control, SVG paths, content, label and description; checked/disabled states. |
| Slider | `.openui-slider-wrapper-root`, `.openui-slider-block-root` | Wrapper and SliderBlock roots; existing track/range/thumb/handle/value/dot/label/block parts and native disabled/focus/hover state. |
| SwitchGroup | `.openui-switch-group-root` | Existing clear/card/sunk variants. |
| SwitchItem | `.openui-switch-item-container-root` | Container root; existing control/thumb/content/label/description and checked/disabled states. |
| TextArea | `.openui-textarea-root` | Existing error, focus, hover and disabled selectors. |
| ToggleGroup | `.openui-toggle-group-root` | Existing group root and native disabled behavior. |
| ToggleItem | `.openui-toggle-item-root` | Existing item alias and on/off, hover and disabled state. |

For example, a later `.openui-input-root { border-width: 2px; }` overrides
Input's base border width. Use the corresponding variant, state or part selector
when overriding a declaration owned there:

```css
.openui-input-root:focus { box-shadow: none; }
.openui-checkbox-item-container-root .openui-checkbox-item-root[data-state="checked"] {
  background-color: navy;
}
.openui-toggle-item-root[data-state="on"] { background-color: navy; }
```

The Slider `className` still applies to its inner Radix root, while the new
styling root identifies its existing outer wrapper. Checkbox/Radio/Switch
`className` forwarding likewise remains on their existing control elements.
Vendor inline styles are preserved: for example Radix RadioGroup and
ToggleGroup retain inline `outline: none`. The ordinary CSS override contract
covers the component's owned stylesheet declarations; it does not promise to
beat inline styles without using the existing inline customization API.

### Select, Calendar, DatePicker and Modal selectors

These families retain their existing props, markup, behavior and theme delivery.
Ordinary overrides require the corresponding later, unlayered selector. Floating
coordinates and other existing inline styles keep their current precedence.

| Family | Stable styling targets | Scope |
| --- | --- | --- |
| Select | `.openui-select-trigger-root`, `.openui-select-content-root`, `.openui-select-viewport-root`, `.openui-select-group-root`, `.openui-select-label-root`, `.openui-select-item-root`, `.openui-select-separator-root` | Existing trigger, portaled content and parts; existing aliases, size classes, placeholder/open/checked/highlighted/disabled state remain. |
| Calendar | `.openui-calendar-container-root` | Existing outer wrapper scopes the existing DayPicker classes; owned declarations primarily target its parts, not the wrapper itself. `classNames` overrides keep their current behavior. |
| DatePicker | `.openui-date-picker-style-root` | Marks both the existing floating container and portal content. Qualify with their existing aliases when styling one role. Floating UI's inline coordinates are preserved. |
| Modal | `.openui-modal-portal-root`, `.openui-modal-overlay-root`, `.openui-modal-content-root`, `.openui-modal-header-root`, `.openui-modal-title-root`, `.openui-modal-close-root`, `.openui-modal-body-root` | Existing portal and parts; sizes, close paths and supported props remain unchanged. |

```css
.openui-select-trigger-root:where(.openui-select-trigger-sm) { padding-left: 24px; }
.openui-select-content-root.openui-select-content-sm .openui-select-label { font-size: 14px; }
.openui-calendar-container-root .openui-calendar-single-day-selected { background: navy; }
.openui-date-picker-style-root:where(.openui-date-picker-renderer-floating-content) { z-index: 60; }
.openui-modal-close-root:focus-visible { outline-color: navy; }
```

Calendar's custom dropdowns still use Select's private content/viewport exports;
this internal dependency is preserved. Select, DatePicker, Modal and Calendar
month dropdowns keep their existing nested-theme behavior in real portals.
These client checks do not establish SSR, hydration or concurrent server support.

### Presentation, layout and help selectors

The following canonical targets replace generated component attachment classes.
Existing aliases and props remain. Each target styles its existing root, part or
variant; use the matching descendant/state context for declarations owned there.
The private document guard contributes no specificity.

| Family | Canonical targets |
| --- | --- |
| Separator | `.openui-separator-root` |
| IconText | `.openui-icon-text-root`, `.openui-icon-text-layout-vertical`, `.openui-icon-text-layout-horizontal`, `.openui-icon-text-content` |
| TextContentWrapper | `.openui-text-content-wrapper-root`, `.openui-text-content-wrapper-markdown` |
| Image | `.openui-image-root`, `.openui-image-fit-styled`, `.openui-image-fill-styled`, `.openui-image-error` |
| SourceFaviconImage | `.openui-source-favicon-image-root` |
| Tag | `.openui-tag-root`, `.openui-tag-icon-styled`, `.openui-tag-text-styled`, `.openui-tag-size-sm`, `.openui-tag-size-md`, `.openui-tag-size-lg`, `.openui-tag-variant-neutral`, `.openui-tag-variant-info`, `.openui-tag-variant-success`, `.openui-tag-variant-warning`, `.openui-tag-variant-danger` |
| IconTag | `.openui-icon-tag-root`, `.openui-icon-tag-size-xs`, `.openui-icon-tag-size-s`, `.openui-icon-tag-size-m`, `.openui-icon-tag-size-l`, `.openui-icon-tag-size-xl`, `.openui-icon-tag-variant-neutral`, `.openui-icon-tag-variant-info`, `.openui-icon-tag-variant-success`, `.openui-icon-tag-variant-warning`, `.openui-icon-tag-variant-danger`, `.openui-icon-tag-variant-inverted` |
| TextContent | `.openui-text-content-root`, `.openui-text-content-variant-sunk`, `.openui-text-content-variant-card`, `.openui-text-content-variant-clear` |
| InlineHeader | `.openui-inline-header-root`, `.openui-inline-header-heading-styled`, `.openui-inline-header-description-styled` |
| Callout | `.openui-callout-root`, `.openui-callout-title-styled`, `.openui-callout-description-styled`, `.openui-callout-variant-info`, `.openui-callout-variant-danger`, `.openui-callout-variant-warning`, `.openui-callout-variant-success`, `.openui-callout-variant-neutral`, `.openui-callout-dismiss` |
| TextCallout | `.openui-text-callout-root`, `.openui-text-callout-variant-neutral`, `.openui-text-callout-variant-info`, `.openui-text-callout-variant-warning`, `.openui-text-callout-variant-success`, `.openui-text-callout-variant-danger`, `.openui-text-callout-content-styled`, `.openui-text-callout-title`, `.openui-text-callout-description` |
| MetricIndicator | `.openui-metric-indicator-root` |
| CodeBlock | `.openui-code-block-root` |
| MarkDownRenderer | `.openui-mark-down-renderer-markdown-code`, `.openui-mark-down-renderer-markdown-link`, `.openui-mark-down-renderer-markdown-root` |
| InlineMarkdownRenderer | `.openui-inline-markdown-renderer-inline-markdown-root` |
| ImageBlock | `.openui-image-block-wrapper-styled`, `.openui-image-block-wrapper-mobile`, `.openui-image-block-error`, `.openui-image-block-image-styled`, `.openui-image-block-image-mobile`, `.openui-image-block-loader-styled` |
| ImageText | `.openui-image-text-root`, `.openui-image-text-image-container`, `.openui-image-text-image`, `.openui-image-text-layout-vertical`, `.openui-image-text-layout-horizontal`, `.openui-image-text-content` |
| ImageTextLarge | `.openui-image-text-large-root`, `.openui-image-text-large-image-wrap`, `.openui-image-text-large-image` |
| TextBlock | `.openui-text-block-root` |
| ListItem | `.openui-list-item-root` |
| ListBlock | `.openui-list-block-root` |
| Card | `.openui-card-root` |
| CardHeader | `.openui-card-header-root` |
| Buttons | `.openui-buttons-root` |
| TagBlock | `.openui-tag-block-root` |
| DotMatrixLoader | `.openui-dot-matrix-loader-root` |
| Skeleton | `.openui-skeleton-pie-chart-skeleton-root`, `.openui-skeleton-root`, `.openui-skeleton-bar-root`, `.openui-skeleton-table-skeleton-root` |
| Sources | `.openui-sources-listed-sources-list`, `.openui-sources-listed-sources-header`, `.openui-sources-listed-sources-title`, `.openui-sources-listed-sources-buttons`, `.openui-sources-listed-sources-container`, `.openui-sources-item-item`, `.openui-sources-item-header`, `.openui-sources-item-name`, `.openui-sources-item-title`, `.openui-sources-item-logo` |
| SnippetCardBlock | `.openui-snippet-card-block-root` |
| ContextCardBlock | `.openui-context-card-block-card-image`, `.openui-context-card-block-card-root` |
| CompositeCardBlock | `.openui-composite-card-block-card-wrapper`, `.openui-composite-card-block-card-root` |
| OverviewCardBlock | `.openui-overview-card-block-root` |
| VisualCardBlock | `.openui-visual-card-block-card-clickable`, `.openui-visual-card-block-card-root` |
| _shared/cards | `.openui-card-layout-scrollbar`, `.openui-card-layout-layout-small`, `.openui-card-layout-layout-medium` |
| Accordion | `.openui-accordion-root` |
| Tabs | `.openui-tabs-tabs`, `.openui-tabs-container`, `.openui-tabs-list-styled`, `.openui-tabs-trigger-styled`, `.openui-tabs-content-styled` |
| Steps | `.openui-steps-root`, `.openui-steps-item` |
| SectionBlock | `.openui-section-block-foldable-section-root`, `.openui-section-block-foldable-section-item`, `.openui-section-block-foldable-section-header`, `.openui-section-block-foldable-section-trigger`, `.openui-section-block-foldable-section-content`, `.openui-section-block-section-v2-root` |
| Carousel | `.openui-carousel-carousel`, `.openui-carousel-content-styled`, `.openui-carousel-item-styled`, `.openui-carousel-button-styled` |
| EntityList | `.openui-entity-list-root` |
| Table | `.openui-table-scrollable-table-wrapper`, `.openui-table-scrollable-table-scroll-container`, `.openui-table-scrollable-table-control`, `.openui-table-container-styled`, `.openui-table-table`, `.openui-table-footer-styled`, `.openui-table-head-styled`, `.openui-table-row-styled`, `.openui-table-cell-styled`, `.openui-table-alignment` |
| TooltipWrapper | `.openui-tooltip-wrapper-body`, `.openui-tooltip-wrapper-heading`, `.openui-tooltip-wrapper-text`, `.openui-tooltip-wrapper-content` |
| Citation | `.openui-citation-container-styled`, `.openui-citation-trigger`, `.openui-citation-tooltip-styled`, `.openui-citation-tooltip-content`, `.openui-citation-item-item`, `.openui-citation-item-logo`, `.openui-citation-item-content`, `.openui-citation-item-title`, `.openui-citation-item-source` |
| ImageGallery | `.openui-image-gallery-gallery-modal-modal`, `.openui-image-gallery-gallery-modal-content`, `.openui-image-gallery-gallery-modal-header`, `.openui-image-gallery-gallery-modal-heading`, `.openui-image-gallery-gallery-modal-main`, `.openui-image-gallery-gallery-modal-carousel-container`, `.openui-image-gallery-gallery-modal-carousel`, `.openui-image-gallery-gallery-modal-button-container`, `.openui-image-gallery-gallery-modal-left-button`, `.openui-image-gallery-gallery-modal-right-button`, `.openui-image-gallery-gallery-modal-thumbnail`, `.openui-image-gallery-gallery-modal-active-thumbnail`, `.openui-image-gallery-gallery`, `.openui-image-gallery-grid`, `.openui-image-gallery-layout-openui-gallery-single`, `.openui-image-gallery-layout-openui-gallery-double`, `.openui-image-gallery-layout-openui-gallery-triple`, `.openui-image-gallery-layout-openui-gallery-quad`, `.openui-image-gallery-layout-openui-gallery-default`, `.openui-image-gallery-image`, `.openui-image-gallery-main-image`, `.openui-image-gallery-show-all` |

Sources retains its existing important width (180px), transparent background
and hover background on listed-source items. Ordinary background overrides do
not beat those declarations, even when the same element also has Carousel's
canonical item class. Use existing props/theme customization or intentionally
important CSS where appropriate; this is not an ordinary-override pass.

Clear Tabs overrides need its root, clear-state and relevant part context. Dark
Markdown descendant selectors retain their existing compound context. Vendor
inline syntax themes, floating coordinates, live loader opacity and private
keyframe identifiers keep their existing precedence and behavior.

### Selector conversion status

Button/IconButton, the 15 control families, Select/Calendar/DatePicker/Modal and
the presentation/layout/help families above are converted. The non-chart batches have passed their bounded independent gate. The chart
extension remains pending independent acceptance; this is not full beta approval.
All 1,444 existing token fallback expressions remain in place.

EditableTable remains deferred. The chart extension below also converts chart-owned and shared chart rules.
Its independent acceptance remains pending; chart behavior is unchanged.
Calendar's direct Select content/viewport dependency remains intact.

SourceFaviconImage's canonical image hook applies to the successful image only;
its shared icon fallback retains its existing styling. Markdown/code wrappers
are converted independently of vendor syntax theme objects and official KaTeX
CSS/fonts. Existing per-instance inline geometry and colors, ThemeProvider
serialization and animation behavior retain their contracts.

### Server-rendered styles

On the server, component styles live in Goober's in-memory sheet. Converted components register
their rules the first time they render, so a server **renders first, then collects** the CSS with
`getComponentStyles()`, and inlines it as the **first** element of `<head>`, ahead of the app's own
stylesheets:

```tsx
import { getComponentStyles } from "@openuidev/react-components";
import { renderToString } from "react-dom/server";

const html = renderToString(<App />); // 1. render: registers the styles this page uses
const css = getComponentStyles(); // 2. collect, after rendering
const page = `<!doctype html>
<html>
  <head>
    <style id="_goober">${css}</style>
    <link rel="stylesheet" href="/app.css" />
  </head>
  <body><div id="root">${html}</div></body>
</html>`;
```

- The page is styled before JavaScript runs, and app CSS after the sheet overrides converted
  components' equal-weight rules.
- Keep the `_goober` id: the browser adopts that element instead of injecting a second sheet.
- Inline the returned string as is. It is never empty, because the browser writes into the
  element's first text node and an empty `<style id="_goober"></style>` breaks the first style
  registration.
- Every call returns the full sheet collected so far, so concurrent requests cannot take each
  other's rules. The sheet is cumulative for the life of the process: a response may carry rules
  for components another request rendered, which is harmless.
- Do not call Goober's own `extractCss` from the same Goober instance: it empties the sheet before
  `getComponentStyles()` can collect it. Rules the application registers with that instance are
  included.
- ThemeProvider writes its theme variables in the browser, so a server-rendered first paint uses
  the components' built-in light values; `mode="dark"`, `lightTheme` and `darkTheme` apply once
  client JavaScript runs. Host `:root { --openui-… }` declarations in the app's own CSS apply from
  the first paint.
- **Streaming SSR is not supported yet.** With `renderToPipeableStream`, Next.js App Router or
  other streaming renderers, `<head>` is sent before most components render, so their styles are
  missing from the first paint. Those components are unstyled until client JavaScript renders
  them, then styled normally; nothing breaks.

### Math styles and fonts

TextContentWrapper retains its lazy math renderer and automatically imports
official KaTeX CSS/fonts from a private module. This accepted vendor-style
exception does not import legacy SCSS. The default Vite6.4.2 production build
handles it without consumer styling setup. Other bundlers need validation;
bare esbuild requires font loaders and application CSS linking.

Vite can emit about1.07MB of unused font assets. This accepted output cost does
not mean the browser downloads them on a Button-only page. The wrapper loads
its math module whenever mounted, including non-math text.

## Charts

```tsx
import { PieChart, ThemeProvider } from "@openuidev/react-components";

export function RevenueShare() {
  return (
    <ThemeProvider>
      <PieChart
        data={[
          { name: "Subscriptions", revenue: 80 },
          { name: "Services", revenue: 20 },
        ]}
        categoryKey="name"
        dataKey="revenue"
        variant="donut"
        height={320}
      />
    </ThemeProvider>
  );
}
```

Available entries include AreaChart/AreaChartCondensed,
LineChart/LineChartCondensed, BarChart/BarChartCondensed/HorizontalBarChart,
PieChart, RadialChart, RadarChart, ScatterChart, HeatmapChart, FunnelChart,
CalendarHeatmap, SegmentedBar, SingleStackedBar (the existing alias),
MiniAreaChart, MiniBarChart and MiniLineChart. Existing data/prop types, Scatter
helpers, LegendStoreProvider/useLegendEntry, StackedLegend and CHART_CLASS_PREFIX
are also public. Shared chart implementations remain private.

### Chart styling targets

All 19 public chart entries use the same stock-Goober registration mechanism and
private zero-specificity document guard. Condensed charts reuse their parent
rules, SingleStackedBar remains an alias, and mini charts share MiniChartFrame.
No extra wrapper or duplicate family stylesheet is introduced.

| Public chart entries | Canonical owned root |
| --- | --- |
| AreaChart, AreaChartCondensed | `.openui-area-chart-root` |
| LineChart, LineChartCondensed | `.openui-line-chart-root` |
| BarChart, BarChartCondensed | `.openui-bar-chart-root` |
| HorizontalBarChart | `.openui-horizontal-bar-chart-root` |
| PieChart | `.openui-pie-chart-root` |
| RadialChart | `.openui-radial-chart-root` |
| RadarChart | `.openui-radar-chart-root` |
| ScatterChart | `.openui-scatter-chart-root` |
| HeatmapChart | `.openui-heatmap-chart-root` |
| FunnelChart | `.openui-funnel-chart-root` |
| CalendarHeatmap | `.openui-calendar-heatmap-root` |
| SegmentedBar, SingleStackedBar | `.openui-segmented-bar-root` |
| MiniAreaChart, MiniBarChart, MiniLineChart | `.openui-mini-chart-root` (shared frame) |

HeatmapChart additionally exposes `.openui-heatmap-chart-diverging-ramp-root`
for its existing diverging color-scale ramp. Its owned declaration targets
`::after`; it does not add a generic base rule.

| Shared role | Canonical target |
| --- | --- |
| Empty state | `.openui-chart-empty-root` |
| X/Y axis labels | `.openui-chart-x-axis-label-root`, `.openui-chart-y-axis-label-root` |
| Default legend | `.openui-chart-default-legend-root` |
| Body tooltip wrapper/panel | `.openui-chart-tooltip-portal-root`, `.openui-chart-tooltip-root` |
| Stacked legend | `.openui-chart-stacked-legend-root` |
| Chart with stacked legend | `.openui-chart-stacked-legend-layout-root` |
| Stacked scrollbar | `.openui-chart-stacked-legend-scrollbar` (`::-webkit-scrollbar` only) |
| Horizontal/vertical scroll controls | `.openui-chart-horizontal-scroll-controls-root`, `.openui-chart-vertical-scroll-controls-root` |

Existing aliases and part/state classes remain on the same DOM and SVG nodes.
Ordinary later unlayered consumer CSS must match the owned root, type, part and
state context. SVG type selectors outside `:where()` still contribute specificity;
the private document guard contributes none. For example:

```css
.openui-bar-chart-root { position: relative; }
.openui-area-chart-root line:where(.openui-area-chart-grid line) {
  stroke: navy;
}
.openui-area-chart-root line.openui-grid-zero-line:where(.openui-area-chart-grid line) {
  stroke: purple;
}
.openui-heatmap-chart-diverging-ramp-root::after { opacity: 0.25; }
.openui-chart-tooltip-root { border-radius: 12px; }
.openui-chart-horizontal-scroll-controls-root
  .openui-chart-horizontal-scroll-button--disabled:disabled { cursor: wait; }
```

The emphasized zero-line class is rendered only when the data domain spans
negative values. The body tooltip retains its existing portal and nearest theme
scope; it does not depend on being a descendant of a chart container. LabelTooltip
is a separate existing Radix behavior with no owned chart CSS registration here.

SVG presentation attributes such as fill/stroke are different from inline CSS:
a matching stylesheet can override a presentation attribute. Existing inline
Heatmap label fill, legend swatch color/hidden opacity, container dimensions,
mini size, animation delays and tooltip FloatingUI/spring position/transform/opacity
keep their current precedence. Use existing props, palettes, themes and inline
customization for those values; ordinary CSS is not promised to beat inline styles.
The scrollbar hook controls its owned pseudo rule, not whether a native scrollbar
becomes visible on every platform.

All nine existing chart keyframes, media boundaries and animation behavior remain.
Normal/reduced motion and existing Heatmap/Funnel print rules are preserved;
SegmentedBar's transition stays outside the reduced-motion media guard as before.
No scales, physics, data transforms, geometry, mark attributes or JS animation
helpers are changed by selector conversion. Existing HorizontalBar limitations
below remain; numeric-height selector checks do not repair the inherited
string-height/legend-fit failure.

Registration is module-based: a shared style module or retained lazy chunk may
register styles for more than the currently visible part. This does not promise
zero-unused CSS, per-chart lazy stylesheet isolation, startup timing or heap
performance. The chart selector gate remains pending independent verification.

## Support boundary and inherited behavior

React/ReactDOM19 are required. Zod3.25+ or4 and Zustand4.5.5+ remain peer
dependencies. Non-streaming server rendering is supported with `getComponentStyles()` (see
[Server-rendered styles](#server-rendered-styles)). **Streaming SSR is deferred, and hydration is
not certified.** Client-side OpenUI response streaming is a separate capability.

Extraction preserves inherited behavior rather than redesigning it:

- HorizontalBar's `onClick` remains unwired; numeric width affects scales without
  setting the CSS box. String height with a fitting legend can cause sizing
  feedback, and that combination does not have a passing strict comparison.
- Scatter retains no print-export metadata, and its public domain helper clamps
  negative lower bounds.
- EditableTable can notify `onDataChange` twice when Enter-save is followed by blur.
- Modal and TooltipWrapper retain their existing focus, labeling and child-ref
  constraints. Consumers must provide accessible labels and appropriate children.

## Development

```sh
pnpm --filter @openuidev/react-components run build
pnpm --filter @openuidev/react-components run ci
```

ESM/CJS builds include matching declarations and source maps. Goober and React
remain external dependencies. Build inputs contain no old SCSS or generated CSS.

### Authoring styles

Component declarations and keyframes use stock Goober tagged template strings.
Reusable declaration fragments are plain template strings, interpolated where
needed; registration remains at the existing module-level call site:

```ts
const body = `
  font: var(--openui-text-body-default, 400 16px/1.5 "Inter", sans-serif);
`;
const scope = css`
  :where(&:root) {
    .openui-example-root {
      ${body}
      display: flex;
      &:disabled {
        cursor: not-allowed;
      }
    }
  }
`;
if (typeof document !== "undefined") {
  document.documentElement.classList.add(scope);
}
const rootClass = "openui-example-root";
```

Keep selector specificity, declaration order, token fallbacks and keyframe timing
when editing styles. Use CSS units explicitly: Goober does not add `px` to numeric
object values. Class-name maps are ordinary objects containing canonical target strings;
they are not CSS declaration objects.

The following retain their existing non-template contracts:

- Native `style` forwarding and computed chart geometry/animation values are
  per-instance React styles.
- ThemeProvider serializes scoped theme variables through its existing lifecycle.
- Syntax-highlighter theme maps use the third-party component's object API.
- KaTeX keeps its official vendor CSS and font assets.

These exceptions do not justify new static Goober declaration objects, custom
serializers or styling APIs.

## Migration from `@openuidev/react-ui` styling

Renamed stable classes and props, per component converted to the flat convention.

| Component | `@openuidev/react-ui` | `@openuidev/react-components` |
| --- | --- | --- |
| Button | `.openui-button-root` | `.openui-button` |
| Button | `.openui-button-base` | Removed; use `.openui-button` |
| Button | `.openui-button-base-{primary,secondary,tertiary}` | `.openui-button--variant-{primary,secondary,tertiary}` |
| Button | `.openui-button-base-{extra-small,small,medium,large}` | `.openui-button--size-{extra-small,small,medium,large}` |
| Button | `buttonType="normal"` prop | `tone="default"` (the default); emits `.openui-button--tone-default` |
| Button | `buttonType="destructive"` prop | `tone="destructive"`; emits `.openui-button--tone-destructive` |
| Button | `.openui-button-base-destructive-{primary,secondary,tertiary}` | `.openui-button--tone-destructive` with `.openui-button--variant-{…}` |
| Button | Icons as direct children | Each icon wrapped in `.openui-button-icon` |

## Beta import migration

Use `@openuidev/react-components` in place of the previous unpublished beta name
`@openuidev/react-ui-core`. The folder is now `packages/react-components`. There
is no compatibility alias. Component names, root-only exports, public types and
customization APIs are preserved. The existing `@openuidev/react-ui` package stays
unchanged. Historical validation artifact names remain valid for their recorded
baselines.
