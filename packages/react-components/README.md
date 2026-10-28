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

## Styling and overrides

Every component follows one styling contract: restyle any part of a component with a single
documented class, without `!important`. The [stable class reference](docs/reference/selectors.md),
generated from the components' own class constants, lists every class.

### Class names

| Kind             | Pattern                          | Example                              |
| ---------------- | -------------------------------- | ------------------------------------ |
| Root             | `openui-<component>`             | `openui-button`                      |
| Part             | `openui-<component>-<part>`      | `openui-button-icon`                 |
| Modifier         | `openui-<block>--<prop>-<value>` | `openui-button--variant-primary`     |
| Boolean modifier | `openui-<block>--<prop>`         | present only when the prop is `true` |

- `<component>` is the exported component name in kebab case. Sub-components and portal content
  belong to their component's family (`openui-tabs-trigger`).
- The root is the element that receives your `className`, `style` and `ref`; other elements the
  component renders are parts.
- A modifier names the prop and its value in kebab case, and the current value is always present,
  defaults included: a plain `<Button>` carries `openui-button--variant-primary`,
  `openui-button--size-medium` and `openui-button--tone-default`.

### States

Runtime states use the attributes the element already has, never extra classes: `:hover`,
`:active`, `:disabled`, `:focus-visible`, `[aria-*]` and Radix `[data-state]`. Add the same state
to a stable class to restyle it:

```css
.openui-button--variant-primary {
  background: navy;
}
.openui-button--variant-primary:hover {
  background: midnightblue;
}
```

### The override guarantee

Library rules for these components weigh one generated class, plus at most one state. Content the
library does not render itself (your children, icons inside an icon part) is styled at zero weight.
Markdown prose (paragraphs, headings, lists, quotes, rules and strong text) has no class of its
own: its rules weigh the root's generated class plus the tag, such as `.goN p`, so write
`.openui-markdown-renderer p { color: navy; }` to restyle it: it has the same weight and your
stylesheets sit after the library's in `<head>`, so it wins whenever it loads. A bare element selector such as `p { … }` in your app, or a reset, does not reach
markdown prose. A few structural rules weigh one more pseudo-class or tag, such as the spacing
between consecutive paragraphs (`p:has(+ p)`), so match that shape to change them. Code,
links, code-block roots, tables and table containers have the stable classes in the reference
and are styled on them, so element resets do not reach them; inside a blockquote, links and inline
code inherit the quote's colour, line-height and italic style like its other text.
`MarkDownRenderer` defaults to `variant="clear"` and always emits its variant modifier.
A rule of yours on a stable class, with the same state where you need one, therefore wins:

- whether your CSS loads before or after the library, because the library's `<style id="_goober">`
  is placed first in `<head>`, ahead of app stylesheets;
- after `<html class>` is rewritten, for example by a theme script, because nothing depends on a
  class on `<html>`;
- with no `!important` and no wrapper selector.

Load order: the token defaults' `@layer openui-defaults;` declaration comes first in `<head>`, then
the library sheet, then your CSS. If you place `<style id="_goober">` yourself, the library reuses it
where it is; keep it before your stylesheets.

Your rule has to match the library's shape: a resting-state rule does not restyle `:hover`, and a
rule in a named cascade layer loses to the unlayered library rules.

### Exceptions

- MarkDownRenderer retains four `!important` declarations on its third-party syntax-highlighter
  output: `padding: 25px`, `margin-top: 8px`, `margin-bottom: 8px`, and `margin-bottom: 0` on its
  last child. These declarations are exceptions to ordinary consumer overrides. The never-matching
  first-child `margin-top: 0 !important` rule has been removed (the copy button precedes the
  highlighter).
- The listed sources view, standalone CodeBlock and SliderBlock also retain their existing
  `!important` declarations. Syntax-highlighter theme maps and token output keep their third-party
  inline styles; use the code-block root class to restyle the block around that output.
- SliderBlock retains `border-color: … !important` on
  `.openui-slider-block-input[data-invalid="true"]`. Other properties remain ordinarily overridable.
  Slider marks and Radix track/range/thumb placement keep their dynamic inline positions.
- Markdown prose ignores bare element selectors (`p { … }`, element resets); target it through
  `.openui-markdown-renderer` instead.
- The Tabs indicator's width and position are set inline as the active tab changes, so they are
  not overridable; its colour and height are, through `.openui-tabs-indicator`.
- Sources retains an important width (180px), transparent background and hover background on
  listed-source items; ordinary background overrides do not beat them, even when the same element
  also has Carousel's item class.

### Cascade layer mode

Component rules are unlayered by default. Apps that order their CSS with cascade
layers, such as Tailwind 4, can put them in a layer instead:

```tsx
<ThemeProvider cssLayer="openui">{/* application */}</ThemeProvider>
```

Rules of components under the provider then sit in `@layer openui`, so any
unlayered app CSS beats them, whatever its specificity or load order, and so do
layers ordered after `openui`. Nested providers inherit `cssLayer` and can set
their own. A value that is not a layer name (or a dotted path such as
`app.openui`) is ignored, with a development warning. Components outside any provider stay unlayered. Each layer gets its own generated classes, so a component rendered both
in and out of a layer registers its rules twice.

The library declares no layer order. Put the order and an empty library sheet
first in `<head>`, before any stylesheet, in this order:

```html
<style>
  @layer theme, base, openui, components, utilities;
</style>
<style id="_goober"></style>
```

The library writes its rules into that `#_goober` tag instead of creating its
own. With this recipe, Tailwind 4 utilities such as `bg-red-500` beat
Button, and Tailwind's preflight in `base` does not reset it.

Writing the same `@layer` statement only in the app's CSS file does not work.
Layer priority follows where a layer first appears in the document, and the
library sheet comes before the app's CSS, so `openui` ranks first: below
Tailwind's `base`, whose preflight then clears Button's background, padding and
radius.

Without `cssLayer`, Tailwind 4 utilities lose to the unlayered component rules on
the same element. Use the important modifier (`!bg-red-500`, or `bg-red-500!`) or
target the stable class instead. In this default mode, Tailwind 3.4 and 4
preflights leave every element that carries a stable class styled, and markdown
prose too, since its rules outweigh the preflight's element selectors. Tailwind
3.3 and earlier conflict: their preflight `[type='button'] { background-color:
transparent }` clears button backgrounds. Tailwind 3 emits its preflight unlayered, so it beats layered rules:
use layer mode with Tailwind 4, not Tailwind 3.

Every Tailwind preflight also sets `*, ::before, ::after { box-sizing: border-box }`. Like #72, a
few components leave `box-sizing` to the page, so with that reset their declared sizes include
padding and border, which changes their geometry:

- Modal content: the `--size-{sm,md,lg}` widths (400, 560 and 720px) include the 1px border, so
  the panel is 2px narrower and its header and body 2px narrower inside it.
- VisualCard (`.openui-visual-card`): the 280px height includes the 1px border, so the card is 2px
  shorter.
- OverviewCard (`.openui-overview-card-block-card`): the full width includes its 10px padding and
  1px border, so the card fits its container instead of overflowing it by 22px, and its content is
  22px narrower.
- ImageBlock (`.openui-image-block`): the 240px height includes its 16px vertical padding, so the
  block is 32px shorter; its 24px loader includes the 3px border and shrinks from 30px to 24px.

Set `box-sizing` on those classes to keep either geometry.

## Automatic styles

Owned component styles use stock Goober and do not require a CSS import, setup
command or styling build plugin. Components register their styles the first time
they render. The build
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

Every component follows the [styling contract](#styling-and-overrides); its roots, parts,
modifiers and the runtime states it carries are in the generated
[stable class reference](docs/reference/selectors.md), which replaces the hand-written lists
earlier betas kept here. The package's `test/flat-allowlist.json` is empty. Chart-specific
notes are in the Charts section below; renamed classes are in the
[migration table](#migration-from-openuidevreact-ui-styling).

A rule on a stable class, with the same state where the library uses one, overrides the library
in either load order. Existing props, inline styles and theme APIs remain the primary
customization APIs; no styling prop is added. Old aliases are removed, so host elements
carrying only an old class name do not receive the new component styles.

The shared `openui-border-box` helper opts in only Buttons, FormControl and
TagBlock roots. Its flat rule registers when a user renders, honours `cssLayer`, and
survives replacement of `<html class>`. A single consumer class can override its box sizing. It does not style
descendants.

The shared `.openui-skeleton-pulse` class registers its animation and keyframes when
an animated Skeleton bar, pie shape or legend dot renders, in the provider's layer.
Override that class to change or disable the pulse. Both shared classes are listed in the
[stable class reference](docs/reference/selectors.md).

### Control selectors

Form controls (FormControl, Hint, Label, Input, TextArea, Buttons), choice controls
(CheckBox, Radio, Switch, Toggle, Chips), Slider and SliderBlock, Select, Calendar,
DatePicker and Modal are in the [generated reference](docs/reference/selectors.md). Their states
are attributes the elements already carry:

- Input and TextArea: `:focus-within`, `:disabled`, `[aria-invalid="true"]` and `::placeholder`;
  Input sizes are `--size-{small,medium,large}` modifiers.
- Label: `[aria-disabled="true"]`; the required asterisk is the `-required-asterisk` part.
- Checkbox and Radio items: Radix `[data-state]` and `:disabled`; Switch items: Radix
  `[data-state]` and `[data-disabled]`.
- Toggle items: Radix `[data-state="on"]` / `[data-state="off"]`; Chips items: `[aria-selected]`.

FormControl's error context still reaches Input, TextArea and Hint. For example,
`.openui-input { border-width: 2px; }` overrides Input's base border width regardless
of load order. Add the same state when overriding a state declaration:

```css
.openui-input:focus-within { box-shadow: none; }
.openui-input[aria-invalid="true"] { border-color: crimson; }
.openui-text-area[aria-invalid="true"] { border-color: crimson; }
.openui-check-box-item[data-state="checked"] {
  background-color: navy;
}
.openui-toggle-item[data-state="on"] {
  background-color: navy;
}
```

Slider `className`, `style` and `ref` apply to its inner Radix root (`.openui-slider`);
its outer wrapper is the `.openui-slider-wrapper` part. Checkbox/Radio/Switch
`className` forwarding likewise remains on their existing control elements.
Vendor inline styles are preserved: for example Radix RadioGroup and
ToggleGroup retain inline `outline: none`. The ordinary CSS override contract
covers the component's owned stylesheet declarations; it does not promise to
beat inline styles without using the existing inline customization API.

### Select, Calendar, DatePicker and Modal selectors

Select, Calendar and DatePicker follow the flat contract in both default and layer mode.
Calendar composes the public Select components, and portalled content receives the active
theme.

```css
.openui-select-trigger--size-sm {
  padding-left: 24px;
}
.openui-select-label {
  font-size: 14px;
}
.openui-calendar-day[data-selection="single"] {
  background: navy;
}
.openui-date-picker-content {
  z-index: 60;
}
```

Floating coordinates and measured dropdown bounds remain inline. Static appearance defaults
are flat CSS, including the Calendar content inside the floating DatePicker.

Modal has `.openui-modal`, its owned parts and `--size-{sm,md,lg}` modifiers. Sizes, close
paths and supported props remain unchanged.

```css
.openui-modal-close:focus-visible {
  outline-color: navy;
}
```

Select, DatePicker, Modal and Calendar month dropdowns retain their nested-theme
behavior in real portals. These client checks do not establish SSR, hydration or
concurrent server support.

### Presentation, layout and code notes

CodeBlock accepts two class props:

- `className` is added to the wrapper (`.openui-code-block`), next to its own classes.
- `syntaxHighlighterClassName` replaces the class on the third-party highlighter element. It
  defaults to `openui-code-block-syntax-highlighter`, whose rules (including its `!important`
  margin) apply only while that default is kept; pass your own class to style the highlighter
  yourself. MarkDownRenderer uses this to own its code blocks' spacing.

Skeleton dimensions, pie shape sizes, table columns and loader dimensions are passed through
private `--_openui-*` variables, so ordinary class rules can override the resulting properties.
DotMatrixLoader's trail also uses a private opacity variable; its dot class can override
opacity while it runs. CodeBlock reveals its copy button on root hover; copied state is
`.openui-code-block-copy-button[data-state="copied"]`. Its highlighter `margin: 0 !important`
remains a contract exception. The default highlighter frame's theme values are flat CSS, so its
colour, background and padding can be overridden on `.openui-code-block-syntax-highlighter`.
Token output and explicitly supplied `theme` maps retain the third-party inline style
API. Replacing `syntaxHighlighterClassName` (including with `""`) opts out of the
default frame rules and retains the third-party theme styles, as before.

Markdown descendant selectors retain their existing compound context. Vendor
inline syntax themes, floating coordinates, live loader opacity and private
keyframe identifiers keep their existing precedence and behavior.

SourceFaviconImage's stable class applies to the image and its globe fallback;
the fallback keeps its existing styling until overridden. Markdown and code wrappers
are converted independently of vendor syntax theme objects and official KaTeX
CSS and fonts. Existing per-instance inline geometry and colors, ThemeProvider
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
- Inline the returned string as is.
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

Charts register flat styles during render and need no document guard. Condensed charts reuse
their parent rules, SingleStackedBar remains an alias, and mini charts share MiniChartFrame.
No extra wrapper or duplicate family stylesheet is introduced.

| Public chart entries | Canonical owned root |
| --- | --- |
| AreaChart, AreaChartCondensed | `.openui-area-chart` |
| LineChart, LineChartCondensed | `.openui-line-chart` |
| BarChart, BarChartCondensed | `.openui-bar-chart` |
| HorizontalBarChart | `.openui-horizontal-bar-chart` |
| PieChart | `.openui-pie-chart` |
| RadialChart | `.openui-radial-chart` |
| RadarChart | `.openui-radar-chart` |
| ScatterChart | `.openui-scatter-chart` |
| HeatmapChart | `.openui-heatmap-chart` |
| FunnelChart | `.openui-funnel-chart` |
| CalendarHeatmap | `.openui-calendar-heatmap` |
| SegmentedBar, SingleStackedBar | `.openui-segmented-bar` |
| MiniAreaChart, MiniBarChart, MiniLineChart | `.openui-mini-{area,bar,line}-chart` (one root per export) |

HeatmapChart exposes `.openui-heatmap-chart-color-scale-ramp--ramp-mode-diverging::after`
for the diverging color-scale notch. The [generated reference](docs/reference/selectors.md)
lists every flat chart part, appearance modifier and shared foundation target.

| Shared role                         | Canonical target                                                                               |
| ----------------------------------- | ---------------------------------------------------------------------------------------------- |
| Empty state                         | `.openui-chart-empty`                                                                     |
| X/Y axis labels                     | `.openui-chart-x-axis-label`, `.openui-chart-y-axis-label`                           |
| Default legend                      | `.openui-default-legend`                                                            |
| Body tooltip wrapper/panel          | `.openui-chart-tooltip-portal`, `.openui-chart-tooltip`                              |
| Stacked legend                      | `.openui-stacked-legend`                                                            |
| Chart with stacked legend           | `.openui-chart-with-stacked-legend`                                                     |
| Stacked scrollbar                   | `.openui-stacked-legend-list` (`::-webkit-scrollbar` only)                          |
| Horizontal/vertical scroll controls | `.openui-scroll-buttons-horizontal`, `.openui-scroll-buttons-vertical` |

The flat classes above and in the [generated reference](./docs/reference/selectors.md)
follow the single-class override contract. The migration tables below record renamed aliases,
appearance modifiers and state hooks. Match the same state when overriding a state rule:

```css
.openui-bar-chart {
  position: relative;
}
.openui-area-chart-grid-line {
  stroke: navy;
}
.openui-area-chart-grid-line[data-zero] {
  stroke: purple;
}
.openui-heatmap-chart-color-scale-ramp--ramp-mode-diverging::after {
  opacity: 0.25;
}
.openui-chart-tooltip {
  border-radius: 12px;
}
.openui-scroll-buttons-horizontal-button:disabled {
  cursor: wait;
}
```

The emphasized zero-line class is rendered only when the data domain spans
negative values. The body tooltip retains its existing portal and nearest theme
scope; it does not depend on being a descendant of a chart container. LabelTooltip
is a separate existing Radix behavior with no owned chart CSS registration here.

SVG presentation attributes such as fill/stroke are different from inline CSS:
a matching stylesheet can override a presentation attribute. Existing inline
Heatmap label fill, container dimensions, mini size, animation delays and tooltip
FloatingUI/spring position/transform/opacity
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

Converted components follow the [styling contract](#styling-and-overrides). A
style module exports a `names` constant with its stable classes, the single source
for the markup and the generated reference, and a factory that receives Goober's
`css` and returns plain class maps. Components read them with the internal
`useStyles` hook, which registers the rules on first render:

```ts
// example.styles.ts
export const names = {
  root: "openui-example",
  label: "openui-example-label",
  size: { small: "openui-example--size-small", medium: "openui-example--size-medium" },
} as const;

export const exampleStyles = (css: StyleCss) => ({
  root: css`
    display: flex;
    &:disabled {
      cursor: not-allowed;
    }
  `,
  size: { small: css`padding: 4px;`, medium: css`padding: 8px;` },
  label: css`font-weight: 500;`,
});

// Example.tsx
const styles = useStyles(exampleStyles);
<div className={clsx(styles.root, styles.size[size], names.root, names.size[size], className)} />;
```

Each rule is one class plus at most one state. A parent's prop that changes a
part's value travels through a private `--_openui-<component>-*` variable the
part reads, not a descendant selector. After changing `names`, run
`pnpm docs:selectors` to regenerate the reference. The unit tests enforce the
selector budget, the naming grammar and the migration allowlist; see
`test/README.md`. Modules on the allowlist keep their module-level `css` call
behind a class on `html` until they are converted.

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

| Component                          | `@openuidev/react-ui`                                                                                                                       | `@openuidev/react-components`                                                                                                                                                                                               |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button                             | `.openui-button-base` (root)                                                                                                                | `.openui-button`                                                                                                                                                                                                            |
| Button                             | `.openui-button-base-{primary,secondary,tertiary}`                                                                                          | `.openui-button--variant-{primary,secondary,tertiary}`                                                                                                                                                                      |
| Button                             | `.openui-button-base-{extra-small,small,medium,large}`                                                                                      | `.openui-button--size-{extra-small,small,medium,large}`                                                                                                                                                                     |
| Button                             | `buttonType="normal"` prop                                                                                                                  | `tone="default"` (the default); emits `.openui-button--tone-default`                                                                                                                                                        |
| Button                             | `buttonType="destructive"` prop                                                                                                             | `tone="destructive"`; emits `.openui-button--tone-destructive`                                                                                                                                                              |
| Button                             | `.openui-button-base-destructive-{primary,secondary,tertiary}`                                                                              | `.openui-button--tone-destructive` with `.openui-button--variant-{…}`                                                                                                                                                       |
| Button                             | Icons as direct children                                                                                                                    | Each icon wrapped in `.openui-button-icon`                                                                                                                                                                                  |
| IconButton                         | `.openui-icon-button` (root)                                                                                                                | `.openui-icon-button` (unchanged; now the only root class)                                                                                                                                                                  |
| IconButton                         | `.openui-icon-button-icon`                                                                                                                  | `.openui-icon-button-icon` (unchanged)                                                                                                                                                                                      |
| IconButton                         | `.openui-icon-button-{primary,secondary,tertiary}`                                                                                          | `.openui-icon-button--variant-{primary,secondary,tertiary}`                                                                                                                                                                 |
| IconButton                         | `.openui-icon-button-{3-extra-small,2-extra-small,extra-small,small,medium,large}`                                                          | `.openui-icon-button--size-{3-extra-small,2-extra-small,extra-small,small,medium,large}`                                                                                                                                    |
| IconButton                         | `.openui-icon-button-{square,circle}`                                                                                                       | `.openui-icon-button--shape-{square,circle}`                                                                                                                                                                                |
| IconButton                         | `appearance="normal"` prop                                                                                                                  | `tone="default"` (the default); emits `.openui-icon-button--tone-default`                                                                                                                                                   |
| IconButton                         | `appearance="destructive"` prop                                                                                                             | `tone="destructive"`; emits `.openui-icon-button--tone-destructive`                                                                                                                                                         |
| IconButton                         | `.openui-icon-button-destructive-{primary,secondary,tertiary}`                                                                              | `.openui-icon-button--tone-destructive` with `.openui-icon-button--variant-{…}`                                                                                                                                             |
| Tabs                               | `.openui-tabs` (root), `.openui-tabs-list`, `.openui-tabs-trigger`, `.openui-tabs-content` and their parts                                  | Unchanged                                                                                                                                                                                                                   |
| Tabs                               | `.openui-tabs-clear`                                                                                                                        | `.openui-tabs--variant-clear`                                                                                                                                                                                               |
| Tabs                               | `.openui-tabs-list--{title,icon-title,icon-title-subtext,image-title,image-title-subtext}`                                                  | `.openui-tabs-list--variant-{title,icon-title,icon-title-subtext,image-title,image-title-subtext}`                                                                                                                          |
| Tabs                               | `.openui-tabs-list-container`                                                                                                               | Unchanged; now a part around the tablist, which is the TabsList root and receives `className`, `style` and `ref`                                                                                                            |
| Tabs                               | `<img>` inside `.openui-tabs-trigger-image`                                                                                                 | Also carries the new `.openui-tabs-trigger-img` part                                                                                                                                                                        |
| Tabs                               | `.openui-tabs-clear .openui-tabs-trigger`, `.openui-tabs-list--… .openui-tabs-trigger-icon` and other context selectors                     | The single class of the element, such as `.openui-tabs-trigger` or `.openui-tabs-trigger-icon`                                                                                                                              |
| Tabs                               | Scroll buttons styled by Tabs rules                                                                                                         | Styled as IconButtons (`.openui-icon-button…`); `.openui-tabs-scroll-button`, `-scroll-left` and `-scroll-right` remain as hooks                                                                                            |
| MarkDownRenderer                   | `.openui-markdown-renderer` (root), `.openui-markdown-renderer-code`, `.openui-markdown-renderer-link`                                      | Unchanged                                                                                                                                                                                                                   |
| MarkDownRenderer                   | `.openui-markdown-renderer-card`                                                                                                            | `.openui-markdown-renderer--variant-card`                                                                                                                                                                                   |
| MarkDownRenderer                   | `.openui-markdown-renderer-card-sunk`                                                                                                       | `.openui-markdown-renderer--variant-sunk`                                                                                                                                                                                   |
| MarkDownRenderer                   | No default `variant`, no clear modifier                                                                                                     | `variant="clear"` by default; always emits `.openui-markdown-renderer--variant-clear`                                                                                                                                       |
| MarkDownRenderer                   | Shared `.openui-code-block-wrapper`                                                                                                         | Also carries `.openui-markdown-renderer-code-block`; standalone CodeBlock defaults are unchanged                                                                                                                            |
| MarkDownRenderer                   | `.openui-code-block-syntax-highlighter` inside markdown                                                                                     | Removed inside markdown; target `.openui-markdown-renderer-code-block` for the owned root around third-party output. Standalone CodeBlock keeps the old class.                                                              |
| MarkDownRenderer                   | Shared `.openui-table` / `.openui-table-container`                                                                                          | Also carry `.openui-markdown-renderer-table` / `.openui-markdown-renderer-table-container`                                                                                                                                  |
| InlineMarkdownRenderer             | `.openui-inline-markdown-renderer`                                                                                                          | Unchanged root; the inline reset now belongs to `.openui-inline-markdown-renderer-content` on the composed markdown root                                                                                                    |
| InlineMarkdownRenderer             | `.openui-inline-markdown-renderer--dark`                                                                                                    | Removed (an inert theme marker); ThemeProvider continues to supply the theme                                                                                                                                                |
| Citation                           | `.openui-citation`, `.openui-citation-container`, `.openui-citation-tooltip`, `.openui-citation-tooltip-content`                            | Unchanged; the globe also carries `.openui-citation-icon`                                                                                                                                                                   |
| Citation                           | `.openui-citation-tooltip__content`                                                                                                         | `.openui-citation-tooltip-content`                                                                                                                                                                                          |
| CitationItem                       | `.openui-citation-item`, `.openui-citation-item-{logo,content,title,source}`                                                                | Unchanged family parts; `__{logo,content,title,source}` aliases removed                                                                                                                                                     |
| CitationItem                       | `.openui-citation-item--has-url`                                                                                                            | Removed derived marker; override `.openui-citation-item` or `.openui-citation-item:hover`                                                                                                                                   |
| Sources / ListedSources            | `.openui-listed-sources`, `.openui-listed-sources-header`                                                                                   | `.openui-sources`, `.openui-sources-header` (Sources family)                                                                                                                                                                |
| Sources / ListedSources            | `.openui-listed-sources-header__{title,buttons}`                                                                                            | `.openui-sources-{title,buttons}`                                                                                                                                                                                           |
| Sources / ListedSources            | Shared `.openui-carousel-item` on each source card                                                                                          | `.openui-sources-item-container` owns the card styling, including in layer mode; Carousel keeps its scrolling role                                                                                                          |
| Sources / ListedSources            | `.openui-listed-sources-item-container`                                                                                                     | `.openui-sources-item-container` (retains its important width and backgrounds)                                                                                                                                              |
| Sources / ListedSources            | `.openui-listed-sources-item-container--has-url`                                                                                            | Removed derived marker; override `.openui-sources-item-container:hover`, subject to the background exception                                                                                                                |
| ListedSourceItem                   | `.openui-listed-source-item`                                                                                                                | `.openui-sources-item`                                                                                                                                                                                                      |
| ListedSourceItem                   | `.openui-listed-source-item__{header,logo,title}`                                                                                           | `.openui-sources-item-{header,logo,title}`                                                                                                                                                                                  |
| ListedSourceItem                   | `.openui-listed-source-item__source-name`                                                                                                   | `.openui-sources-item-name`                                                                                                                                                                                                 |
| ListedSourceItem                   | `.openui-listed-source-item--has-url`                                                                                                       | Removed derived marker; override `.openui-sources-item`                                                                                                                                                                     |
| SourceFaviconImage                 | `.openui-source-favicon-image`                                                                                                              | Unchanged root; the fallback globe also carries it                                                                                                                                                                          |
| Shared border-box (#90)            | `.openui-border-box` on Buttons, FormControl and TagBlock                                                                                   | Unchanged; registered at render, flat and layer-aware. No prop renames.                                                                                                                                                     |
| TextBlock (TextBlockView)          | `.openui-text-block-root`, `.openui-text-block`                                                                                             | `.openui-text-block` only                                                                                                                                                                                                   |
| TextBlock                          | `.openui-text-block--{title-text,number-title-text,text-subtext,highlight-text-number-subtext,text,highlight-text,number,highlight-number}` | `.openui-text-block--variant-{…}`; default `title-text` always emitted                                                                                                                                                      |
| TextBlock                          | `.openui-text-block__{primary,secondary,tertiary}`                                                                                          | `.openui-text-block-{primary,secondary,tertiary}`                                                                                                                                                                           |
| TextBlock                          | `.openui-text-block__secondary--{positive,negative}`                                                                                        | `.openui-text-block-secondary--secondary-tone-{positive,negative}`                                                                                                                                                          |
| TextBlock                          | `.openui-text-block--type-textOnly`                                                                                                         | `.openui-text-block--type-text-only`; prop remains `type="textOnly"`                                                                                                                                                        |
| TextBlock                          | `--size-*`, `--align-*`, other `--type-*`                                                                                                   | Unchanged; defaults always emitted. `secondaryMaxLines` sets a private variable on the secondary part with `[data-clamped]`; layout defaults now live in CSS                                                                |
| Callout / TextCallout              | `.openui-{callout,text-callout}-root`, `-variant-{neutral,info,warning,success,danger}`, and `-{neutral,info,warning,success,danger}`       | `.openui-{callout,text-callout}` and `--variant-{neutral,info,warning,success,danger}`; defaults always emitted                                                                                                             |
| Callout                            | `-title-styled`, `-description-styled`                                                                                                      | `.openui-callout-title`, `.openui-callout-description`                                                                                                                                                                      |
| Callout                            | `.openui-callout-dismiss`, `.openui-callout-autodismiss`, `--callout-duration`                                                              | `.openui-callout[data-autodismiss]` and private `--_openui-callout-duration`; `duration` prop unchanged                                                                                                                     |
| TextCallout                        | `-content-styled`, `-content-title`, `-content-description`                                                                                 | `.openui-text-callout-content`, `-title`, `-description`                                                                                                                                                                    |
| TextContent                        | `.text-content`, `.openui-text-content-root`, `.text-content-{clear,card,sunk}`, `.openui-text-content-variant-*`                           | `.openui-text-content` and `--variant-{clear,card,sunk}`; default remains `sunk`                                                                                                                                            |
| TextContentWrapper                 | `.openui-text-content`, `.openui-text-content-wrapper-root`                                                                                 | `.openui-text-content-wrapper` and `--variant-{clear,card,sunk}`; default remains `clear`                                                                                                                                   |
| TextContentWrapper                 | `.openui-text-content-markdown`, `.openui-text-content-wrapper-markdown`                                                                    | `.openui-text-content-wrapper-markdown` only; math also has `-math`; paragraph spacing uses the shared prose renderer                                                                                                       |
| TextContentWrapper                 | `.openui-text-content-markdown-dark-mode`                                                                                                   | `[data-mode="dark"]` on the root; ThemeProvider still supplies the mode                                                                                                                                                     |
| InlineHeader                       | `.openui-inline-header-root`, `-heading-styled`, `-description-styled`                                                                      | `.openui-inline-header`, `-heading`, `-description`                                                                                                                                                                         |
| IconText                           | `.openui-icon-text-root`, `-layout-{horizontal,vertical}`, `--{horizontal,vertical}`                                                        | `.openui-icon-text`, `--layout-{horizontal,vertical}`; `--icon-variant-*` always emitted and `--bold` only when true                                                                                                        |
| IconText                           | `.openui-icon-text__content`                                                                                                                | `.openui-icon-text-content`                                                                                                                                                                                                 |
| IconTag                            | `.openui-icon-tag-root`, `-size-{xs,s,m,l,xl}`, `--{xs,s,m,l,xl}`                                                                           | `.openui-icon-tag`, `--size-{xs,s,m,l,xl}`; default remains `m`                                                                                                                                                             |
| IconTag                            | `-variant-*`, `--{neutral,info,success,warning,danger,inverted}`                                                                            | `--variant-{neutral,info,success,warning,danger,inverted}`; default remains `neutral`; owned SVG has `.openui-icon-tag-icon`                                                                                                |
| Tag                                | `.openui-tag-root`, `-size-{sm,md,lg}`, `-{sm,md,lg}`                                                                                       | `.openui-tag`, `--size-{sm,md,lg}`; default remains `md`                                                                                                                                                                    |
| Tag                                | `-variant-*`, `-{neutral,info,success,warning,danger}`                                                                                      | `--variant-{neutral,info,success,warning,danger}`; default remains `neutral`                                                                                                                                                |
| Tag                                | `.openui-tag-icon-styled`, `.openui-tag-text-styled`                                                                                        | `.openui-tag-icon`, `.openui-tag-text`                                                                                                                                                                                      |
| TagBlock / Separator               | `.openui-tag-block-root`, `.openui-separator-root`                                                                                          | `.openui-tag-block`, `.openui-separator`; Separator keeps Radix `[data-orientation]`                                                                                                                                        |
| Shared Skeleton pulse (#90)        | Animation on bars, pie shapes and legend dots                                                                                               | Also carry `.openui-skeleton-pulse`; animation and keyframes register at render. Existing classes and props are unchanged.                                                                                                  |
| Accordion                          | `.openui-accordion-{clear,card,sunk}`                                                                                                       | `.openui-accordion--variant-{clear,card,sunk}` (including default `clear`)                                                                                                                                                  |
| Accordion                          | `.openui-accordion` and its part classes                                                                                                    | Unchanged; open/closed overrides use `[data-state]`                                                                                                                                                                         |
| SectionV2                          | `.openui-section-v2` and its parts                                                                                                          | Unchanged                                                                                                                                                                                                                   |
| FoldableSectionRoot                | `.openui-foldable-section-root`                                                                                                             | `.openui-foldable-section`; other parts unchanged, open/closed overrides use `[data-state]`                                                                                                                                 |
| Steps                              | `.openui-steps-container` (outer root), `.openui-steps` (inner list)                                                                        | `.openui-steps` (root), `.openui-steps-list`                                                                                                                                                                                |
| Steps                              | `.openui-step-{item,connector,number,number-inner,content,title,details}`                                                                   | `.openui-steps-{item,connector,number,number-inner,content,title,details}`                                                                                                                                                  |
| Steps                              | `.openui-connector-line`                                                                                                                    | `.openui-steps-connector-line`                                                                                                                                                                                              |
| Card                               | `.openui-card-{clear,card,sunk}`                                                                                                            | `.openui-card--variant-{clear,card,sunk}` (including default `card`)                                                                                                                                                        |
| Card                               | `.openui-card-{standard,full}`                                                                                                              | `.openui-card--width-{standard,full}` (including default `standard`)                                                                                                                                                        |
| CardHeader                         | `.openui-header`, `.openui-header-{top,top-left,top-left-icon,top-right,bottom}`                                                            | `.openui-card-header`, `.openui-card-header-{top,top-left,top-left-icon,top-right,bottom}`                                                                                                                                  |
| Modal                              | `.openui-modal-root`                                                                                                                        | `.openui-modal` (portal root)                                                                                                                                                                                               |
| Modal                              | `.openui-modal-{sm,md,lg}` on content                                                                                                       | `.openui-modal--size-{sm,md,lg}` on the portal root (including default `md`)                                                                                                                                                |
| Modal                              | Overlay, content, header, title, close and body classes                                                                                     | Unchanged; close SVG also has `.openui-modal-close-icon`                                                                                                                                                                    |
| TooltipWrapper                     | `.openui-tooltip-content`                                                                                                                   | `.openui-tooltip-wrapper` (portal content root, receives `className`)                                                                                                                                                       |
| TooltipWrapper                     | `.openui-tooltip-{body,heading,text-content}`                                                                                               | `.openui-tooltip-wrapper-{body,heading,text}`                                                                                                                                                                               |
| CardBlockLayout (#100)             | `.openui-{small,medium}-card-block` and `.openui-card-layout-layout-{small,medium}`                                                         | `.openui-card-block-layout` and `--size-{small,medium}`                                                                                                                                                                     |
| CardBlockLayout                    | `--{grid,carousel}`, `--{composite-card,context-card,visual-first-card,overview-card,value-card}`                                           | `--layout-{grid,carousel}`, `--card-type-{composite-card,context-card,visual-first-card,overview-card,value-card}`; defaults emitted                                                                                        |
| CardBlockLayout                    | `.openui-{small,medium}-card-block__{grid,row,item,carousel,carousel-track,carousel-item}`, `.openui-card-layout-scrollbar`                 | `.openui-card-block-layout-{grid,row,item,carousel,carousel-track,carousel-item}`; scrollbar rules on `-carousel`                                                                                                           |
| CardBlockLayout                    | `__grid--responsive`, `__carousel--responsive`, `__grid--odd-count`, `__row--{1,2,3}`                                                       | Root `--responsive` only when true; row `[data-columns]` and item `[data-span="full"]` describe derived row geometry                                                                                                        |
| CardBlockLayout                    | `__carousel--mask-{left,right}` class combinations                                                                                          | `.openui-card-block-layout-carousel[data-mask="none\|left\|right\|both"]`                                                                                                                                                   |
| CardBlockLayout                    | `--openui-{small,medium}-card-gap`                                                                                                          | Gap remains the public `gap` prop; implementation variables are private `--_openui-card-block-layout-*`                                                                                                                     |
| CompositeCard / CompositeCardBlock | `.openui-composite-card__{wrapper,header,body,footer,footer-content}`, `.openui-composite-card-block-card-{wrapper,root}`                   | `.openui-composite-card-{wrapper,header,body,footer,footer-content}` and root `.openui-composite-card`; block also carries `.openui-composite-card-block`                                                                   |
| ContextCard / ContextCardBlock     | `__{vertical,slot,slot--top,slot--bottom,title-text,body-text,tag-wrapper,tag,chevron}`, `.openui-context-card-block-card-{root,image}`     | `.openui-context-card-{vertical,top,bottom,title-text,body-text,tag-wrapper,tag,chevron}`; root `.openui-context-card`, block `.openui-context-card-block`; `-chevron-icon` owns SVG sizing                                 |
| ContextCard                        | `--variant-{gray,info,success,warning,danger,image}`                                                                                        | `--bg-color-{default,gray,info,success,warning,danger}` (`item.bgColor`, implicit default included); image state `[data-background-image="true"]` and private image input replace inline `background-image`                 |
| VisualCard / VisualCardBlock       | `.openui-visual-first-card`, `__{top,tag,action,bottom}`, `.openui-visual-card-block-card-{root,clickable}`                                 | `.openui-visual-card`, `.openui-visual-card-{top,tag,action,bottom}`, block `.openui-visual-card-block`; action SVG has `-action-icon`                                                                                      |
| VisualCard                         | `--openui-visual-card-image`                                                                                                                | Private `--_openui-visual-card-image`; continue to pass `item.bgImageSrc`                                                                                                                                                   |
| OverviewCardBlock                  | `.openui-overview-card`, `.openui-overview-card-block-root`, `__{vertical,top-row,slot,slot--top,slot--bottom,chevron}`                     | Root `.openui-overview-card-block`; owned `.openui-overview-card-block-{card,vertical,top-row,top,bottom,chevron,chevron-icon}`                                                                                             |
| SnippetCardBlock                   | `.openui-value-card`, `.openui-snippet-card-block-root`, `__{lhs,rhs,rhs-content,chevron}`                                                  | Root `.openui-snippet-card-block`; owned `.openui-snippet-card-block-{card,lhs,rhs,rhs-content,chevron,chevron-icon}`                                                                                                       |
| Card clickability                  | `--static`, `--clickable` on the legacy card names                                                                                          | False emits no modifier. True emits `--clickable` on `.openui-{composite-card,context-card,visual-card,overview-card-block-card,snippet-card-block-card}`                                                                   |
| OptionCards                        | `.openui-option-cards-root`, `__{grid,row,item}`, `.openui-option-card`, `__{content,top,text,title,subtitle}`                              | `.openui-option-cards`, `.openui-option-cards-{grid,row,item,card,content,top,text,title,subtitle}`                                                                                                                         |
| OptionCards                        | `.openui-option-card__top--{icon,image}`                                                                                                    | `.openui-option-cards-top--top-content-variant-{icon,image}` (`item.topContentVariant`, default `icon` emitted)                                                                                                             |
| OptionCards                        | `--selected`, `--disabled`, `__row--{1,2,3}`, `__grid--{responsive,odd-count}`                                                              | Selection `[aria-checked]`, native `:disabled`; row `[data-columns]`, last spanning item `[data-span="full"]`; responsive grid is always enabled                                                                            |
| ListItem                           | `.openui-list-item-wrapper` (root), `.openui-list-item` (inner item)                                                                        | `.openui-list-item` (consumer root), `.openui-list-item-item` (inner part)                                                                                                                                                  |
| ListItem                           | `.openui-list-item-wrapper--small`                                                                                                          | `.openui-list-item--size-small`; default emits `--size-default`                                                                                                                                                             |
| ListItem                           | No indicator variant class                                                                                                                  | `.openui-list-item--variant-{number,icon,image}`; default emits `--variant-number`                                                                                                                                          |
| ListItem                           | `-wrapper-with-action`, `-clickable`, `-indicator-clickable`, `-indicator-no-subtitle`                                                      | Derived markers removed; root and item use `[data-action="true"]`, item uses `[data-subtitle="true"]`; `listHasSubtitle` emits `.openui-list-item--list-has-subtitle` only when true                                        |
| ListItem                           | Existing indicator, content, title, subtitle and action parts                                                                               | Unchanged; the owned image also carries `.openui-list-item-image`                                                                                                                                                           |
| ListBlock                          | `.openui-list-block--small`                                                                                                                 | `.openui-list-block--size-small`; default emits `--size-default`; variant always emits `--variant-{number,icon,image}`                                                                                                      |
| EntityList                         | `.openui-entity-list--{default,small}`                                                                                                      | `.openui-entity-list--size-{default,small}`                                                                                                                                                                                 |
| EntityList                         | `.openui-entity-list__row`, `__cell-{left,right}`                                                                                           | `.openui-entity-list-row`, `.openui-entity-list-cell-{left,right}`                                                                                                                                                          |
| EntityList                         | `__row--{header,body,footer}`, `__cell-{left,right}--{header,body,footer}`                                                                  | `.openui-entity-list-row--row-type-{header,body,footer}`; cells inherit row values                                                                                                                                          |
| EntityList                         | `__cell-right--{text,number}`                                                                                                               | `.openui-entity-list-cell-right--right-variant-{text,number}` (default is text)                                                                                                                                             |
| Table                              | `.openui-table`, `-container`, `-header`, `-body`, `-footer`, `-row`, `-head`, `-head-{content,icon,label}`, `-cell`                        | Unchanged roots and parts                                                                                                                                                                                                   |
| TableHead / TableCell              | Shared `.openui-table-align-{left,center,right}`                                                                                            | `.openui-table-head--align-{left,center,right}` on the head; `.openui-table-cell--align-{left,center,right}` on the cell; omitted align emits left while preserving the legacy header layout                                |
| ScrollableTable                    | `.openui-scrollable-table-wrapper`, `-scroll-container`, `-control`                                                                         | Unchanged parts; the table also carries the consumer root `.openui-scrollable-table`; icons carry `-icon`                                                                                                                   |
| ScrollableTable                    | `-control-{left,right,disabled}`                                                                                                            | `.openui-scrollable-table-control[data-side="left"/"right"]`, `[data-disabled="true"]`; measured table width uses `[data-scrollable="true"]`                                                                                |
| EditableTable                      | `.openui-editable-table-wrapper`                                                                                                            | `.openui-editable-table`                                                                                                                                                                                                    |
| EditableTable                      | `-scroll-control--{left,right,disabled}`                                                                                                    | `.openui-editable-table-scroll-control[data-side="left"/"right"]`, `[data-disabled="true"]`                                                                                                                                 |
| EditableTable                      | `-cell-outline-{top,bottom,left,right}-{selected,editing}`                                                                                  | `.openui-editable-table-cell-outline-{top,bottom,left,right}[data-state="selected"/"editing"]`; idle emits `[data-state="idle"]`; cell-base exposes the same state                                                          |
| EditableTable                      | Unclassed table sections, rows, heads and cells                                                                                             | `-table-header`, `-table-body`, `-header-row`, `-row`, `-head`, `-cell`; column widths are private variables read by CSS so consumer width wins                                                                             |
| EditableTable                      | Select dependency classes inside cells                                                                                                      | Owned `.openui-editable-table-select-{trigger,value,icon,content,viewport,item,item-text,check-wrapper,indicator,check-icon}` parts; Radix `[data-state]` and `[data-highlighted]` states remain; portals inherit the theme |
| EditableTable                      | Existing display, input, header, scroll and changes-bar parts                                                                               | Unchanged; URL warning wrapper also carries `-display-url-warning`; supplied icons carry `-icon`                                                                                                                            |
| MetricIndicator family             | `.openui-metric-indicator__{row,main-value,previous-value,subtext,trend}`                                                                   | `.openui-metric-indicator-{row,main-value,previous-value,subtext,trend}`                                                                                                                                                    |
| MetricIndicator family             | `__trend--{success,danger}`, `--has-subtext`                                                                                                | `.openui-metric-indicator-trend--direction-{up,down}`, root `[data-subtext="true"]`; `--variant-{inline,with-strikethrough}` remains                                                                                        |
| FormControl | `.openui-form-control` | Unchanged; now the only family root class (plus the shared `.openui-border-box` opt-in). |
| Hint | `.openui-hint` | `.openui-form-control-hint` (FormControl family member; also works standalone). |
| Hint | `.openui-hint-error` | `.openui-form-control-hint[data-invalid="true"]` |
| Input | `.openui-input` | Unchanged; now the only root class. |
| Input | `.openui-input-{small,medium,large}` | `.openui-input--size-{small,medium,large}`; default `medium` always emitted. |
| Input | `.openui-input-error` | `.openui-input[aria-invalid="true"]` |
| TextArea | `.openui-textarea` | `.openui-text-area` (kebab-case of the exported name). |
| TextArea | `.openui-textarea-error` | `.openui-text-area[aria-invalid="true"]` |
| Label | `.openui-label`, `.openui-label-required-asterisk` | Unchanged; root and independently styled required-asterisk part. |
| Label | `.openui-label-disabled` | `.openui-label[aria-disabled="true"]` |
| Buttons | `.openui-buttons` | Unchanged; now the only family root class (plus `.openui-border-box`). |
| Buttons | `.openui-buttons-{horizontal,vertical}` | `.openui-buttons--variant-{horizontal,vertical}`; default `horizontal` always emitted. |
| Form controls (#91) | `hasError`, `disabled`, `required`, Input `size` / `styles`, TextArea `rows`, Buttons `variant` | Props unchanged. `hasError` inherits from FormControl; explicit `false` opts out. Input/TextArea use `aria-invalid`, Hint uses `data-invalid`, Label uses `aria-disabled`. Explicit native ARIA attributes are forwarded and take precedence. |
| CheckBoxGroup | `.openui-checkbox-group`, beta `.openui-checkbox-group-root` | `.openui-check-box-group` |
| CheckBoxGroup | `.openui-checkbox-group-{clear,card,sunk}` | `.openui-check-box-group--variant-{clear,card,sunk}`; default `clear` always emitted |
| CheckBoxItem | `.openui-checkbox-item-root` (control), `.openui-checkbox-item-container` and beta `-container-root` (wrapper) | `.openui-check-box-item` (control root), `.openui-check-box-item-container` (part); `className`, `style`, `ref` stay on the control |
| CheckBoxItem | `.openui-checkbox-item-{indicator,content,label,description}` | `.openui-check-box-item-{indicator,content,label,description}`; new owned SVG `-icon` and path `-check` parts |
| RadioGroup | `.openui-radio-group`, beta `.openui-radio-group-root` | `.openui-radio-group` only |
| RadioGroup | `.openui-radio-group-{clear,card,sunk}` | `.openui-radio-group--variant-{clear,card,sunk}`; default `clear` always emitted |
| RadioItem | `.openui-radio-item-root` (control), `.openui-radio-item-container` and beta `-container-root` (wrapper) | `.openui-radio-item` (control root), `.openui-radio-item-container` (part); forwarding unchanged |
| RadioItem | `.openui-radio-item-svg-{path,border,inner}` | `.openui-radio-item-{path,border,inner}`; `-svg`, `-content`, `-label`, `-description` unchanged |
| SwitchGroup | `.openui-switch-group`, beta `.openui-switch-group-root` | `.openui-switch-group` only |
| SwitchGroup | `.openui-switch-group-{clear,card,sunk}` | `.openui-switch-group--variant-{clear,card,sunk}`; default `clear` always emitted |
| SwitchItem | `.openui-switch-item-root` (control), `.openui-switch-item-container` and beta `-container-root` (wrapper) | `.openui-switch-item` (control root), `.openui-switch-item-container` (part); forwarding and other part names unchanged |
| ToggleGroup / ToggleItem | `.openui-toggle-{group,item}`, beta `.openui-toggle-{group,item}-root` | `.openui-toggle-{group,item}` only; on/off remain Radix `[data-state]` |
| Chips | `.openui-chips`, beta `.openui-chips-root` | `.openui-chips` only |
| Chips | `.openui-chip-item`, `.openui-chip-item__{icon,text}` | `.openui-chips-item`, `.openui-chips-item-{icon,text}` |
| Chips | `.openui-chip-item--selected`, `.openui-chip-item--disabled` | `.openui-chips-item[aria-selected="true"]`, `.openui-chips-item:disabled`; no state classes |
| Choice controls (#92) | Public props | No prop renames; `type` on Chips/ToggleGroup changes selection behavior, not appearance, and adds no modifier |
| Select | `.openui-select-trigger-{sm,md,lg}`, `.openui-select-content-{sm,md,lg}` | `.openui-select-trigger--size-{sm,md,lg}`, `.openui-select-content--size-{sm,md,lg}`; default `md` always emitted. Content inherits Select/SelectTrigger `size`. |
| Select | `.openui-select-item--with-tick`, `.openui-select-item--without-tick` | `.openui-select-item--show-tick` only when `showTick` is true (the default); no false modifier. |
| Select | Trigger icon hidden by `hideDropdownIcon` | Also emits `.openui-select-trigger--hide-dropdown-icon` only when true. |
| Select | Content `position` / viewport `data-position` | `.openui-select-content--position-{popper,item-aligned}`; default `popper` always emitted. The viewport retains `data-position`. |
| Select | `.openui-select-{trigger,content,viewport,group,label,item,separator}` and icon/check/text-value parts | Unchanged. Value, item text and indicator now have owned `.openui-select-value`, `.openui-select-item-text` and `.openui-select-item-indicator` targets; Radix discards classes passed directly to Value/ItemText. Their inherited appearance is preserved. |
| Select | Props | Existing props unchanged. `SelectContent` adds `container` (portal destination) and `viewportClassName` so Calendar composes public Select parts. |
| Calendar | `.openui-calendar-container`, `.openui-calendar-root` | `.openui-calendar` (outer root receiving `className`/ref), `.openui-calendar-content` (DayPicker part). |
| Calendar | `.openui-calendar-{nav,dropdowns}-{mobile,fullscreen,tray,copilot}` | `.openui-calendar-{nav,dropdowns}`; `.openui-calendar--layout-{mobile,fullscreen,tray,copilot}` on the root records LayoutContextProvider's `layout`, including default `fullscreen`. |
| Calendar | `.openui-calendar-{single,range}-day`, `.openui-calendar-{single,range}-day-button` | `.openui-calendar-day`, `.openui-calendar-day-button` |
| Calendar | `.openui-calendar-single-day-selected`, `.openui-calendar-range-{start,middle,end}`, `.openui-calendar-today`, `.openui-calendar-disabled` | States on `.openui-calendar-day`: `[data-selection="single"]`, `[data-range-start]`, `[data-range-middle]`, `[data-range-end]`, `[data-today-unselected]`, `[data-disabled]`. Existing DayPicker ARIA/data attributes remain. |
| Calendar | `.openui-calendar-select-viewport-mobile` | Removed unused hook (the old Calendar never supplied its helper's `botType`); years retain the existing three-column grid in every layout. |
| Calendar | Other existing parts and props | Unchanged. Previously unnamed DayPicker months/weeks/week/caption-label/week-number/week-number-header structures now carry matching `.openui-calendar-*` part classes. Consumer `components` maps retain their existing replacement behavior; the day-state adapter wraps either default or custom Day renderers. |
| Calendar | `--openui-calendar-day-size`, `--openui-calendar-cell-radius` | Private `--_openui-calendar-day-size`, `--_openui-calendar-cell-radius`; use stable classes to override geometry. |
| DatePicker | `.openui-date-picker-renderer-floating-container` | `.openui-date-picker`; always emits `.openui-date-picker--mode-{single,range}` (default `single`). |
| DatePicker | `.openui-date-picker-renderer-floating-input-container`, `-input-container-text`, open-only `-input-container-icon` | `.openui-date-picker-trigger`, `.openui-date-picker-text`, always-present `.openui-date-picker-icon` |
| DatePicker | `…-input-container-open`, `…-input-container-not-open`, `…-input-container-has-no-selected-date` | `.openui-date-picker-trigger[data-state="open"/"closed"]`, `[data-placeholder="true"]` |
| DatePicker | `.openui-date-picker-renderer-floating-{reference,content,menu}` | `.openui-date-picker-{reference,content,menu}` |
| DatePicker | `.openui-date-picker-renderer-{single,range}-mode`, descendant Calendar root override | `.openui-date-picker-calendar`, `.openui-date-picker-calendar-content` (owned Calendar root via its public `components.Root` slot); props unchanged. |
| Slider | `.openui-slider-root` | `.openui-slider`; `className`, `style` and `ref` still target the Radix root. |
| Slider | `.openui-slider-wrapper` and existing container/track/range/thumb/handle/value/dot/label parts | Unchanged; min/max label spans also carry `.openui-slider-label`. |
| Slider | `variant="continuous"` / `"discrete"` | Props unchanged; always emit `.openui-slider--variant-{continuous,discrete}`. |
| Slider | `.openui-slider--disabled` | `.openui-slider[data-disabled]`; thumbs also expose Radix `[data-disabled]`. |
| Slider | `.openui-slider-range--at-min` | `.openui-slider-range[data-at-min]` |
| Slider | `.openui-slider-dots-dot--active` | `.openui-slider-dots-dot[data-state="active"]` (other marks use `inactive`). |
| SliderBlock | `.openui-slider-block`, `.openui-slider-block__{header,label,controls,content,validated-input-container,validated-select-container,validated-input,input,error-message,separator}` | Root unchanged; parts use single hyphens: `.openui-slider-block-{…}`. The error SVG also carries `.openui-slider-block-error-icon`. |
| SliderBlock | `.openui-slider-block__header--with-error`, `.openui-slider-block__input-error` | `.openui-slider-block-header[data-invalid="true"]`, `.openui-slider-block-input[data-invalid="true"]`; the input's important border is retained. |
| SliderBlock | `.is-range`, `.is-single`, `.openui-slider-block__controls--inputs` | Range controls use `.openui-slider-block-controls[data-range]`; absence means single. Input/Select roots have owned `.openui-slider-block-input` / `.openui-slider-block-select-trigger` parts. |
| SliderBlock | `variant="continuous"` / `"discrete"` | Always emit `.openui-slider-block--variant-{continuous,discrete}` for the requested variant, even while streaming temporarily renders a continuous nested Slider. |
| SliderBlock | Embedded Input and Select | Keep public `.openui-input--size-medium` and `.openui-select-trigger--size-md` names; props, validation and streaming behavior unchanged. |
| Skeleton (#101) | `.openui-skeleton-stack` | `.openui-skeleton`; props unchanged |
| SkeletonBar (#101) | `.openui-skeleton-bar` | Unchanged; still rendered through public Skeleton family components, not separately exported |
| PieChartSkeleton (#101) | `.openui-skeleton-pie-chart-wrapper` | `.openui-pie-chart-skeleton` |
| PieChartSkeleton (#101) | `.openui-skeleton-pie-chart-{container,shape,legend,legend-item,legend-dot}` | `.openui-pie-chart-skeleton-{container,shape,legend,legend-item,legend-dot}` |
| PieChartSkeleton (#101) | `.openui-skeleton-pie-chart-{donut,semi,semi-donut}` | Root `.openui-pie-chart-skeleton--variant-{pie,donut}` and `--appearance-{circular,semi-circular}`; defaults emitted, `variant` and `appearance` props unchanged |
| TableSkeleton (#101) | `.openui-skeleton-table`, `.openui-skeleton-table-{row,cell}` | `.openui-table-skeleton`, `.openui-table-skeleton-{row,cell}` |
| TableSkeleton (#101) | `.openui-skeleton-table-cell-short` | `.openui-table-skeleton-header-cell`; props unchanged |
| DotMatrixLoader (#101) | `.openui-dot-matrix-loader`, `.openui-dot-matrix-loader__dot` | Root unchanged, part becomes `.openui-dot-matrix-loader-dot`; root always emits `--variant-{default,compact}`; props unchanged |
| DotMatrixLoader (#101) | `--openui-dot-matrix-loader-{size,grid-size}` | Private `--_openui-dot-matrix-loader-*` variables; override width/height/grid on the stable class or use `size`/`variant` props |
| CodeBlock (#101) | `.openui-code-block-wrapper` | `.openui-code-block`; additive `className` behavior unchanged, including inside markdown |
| CodeBlock (#101) | `.openui-code-block-copy-button-copied` | `.openui-code-block-copy-button[data-state="copied"]`; idle uses `data-state="idle"` |
| CodeBlock (#101) | `.openui-code-block-syntax-highlighter` | Unchanged; `syntaxHighlighterClassName` still replaces the default class and all its rules; `""` opts out too |
| Chart base | `.openui-chart-empty`, `.openui-chart-empty-text` | Unchanged; registered during render, including SSR |
| Chart base | `.openui-cartesian-{x,y}-axis-label` | `.openui-chart-{x,y}-axis-label` |
| Default legend | `.openui-chart-legend-container`, `.openui-chart-legend--bottom` | `.openui-default-legend` (bottom padding is part of its base style) |
| Default legend | `.openui-chart-legend` | `.openui-default-legend-list` |
| Default legend | `.openui-chart-legend-{axis-label-container,axis-label,axis-label-text,item,item-indicator,item-label,item-label-container,item-percentage,toggle-button,toggle-button-icon}` | `.openui-default-legend-{…}` (same part suffix) |
| Default legend | SVG directly inside a legend item | Wrapped in `.openui-default-legend-item-icon`; SVG remains foreign icon content |
| Default legend | `.openui-chart-legend--{collapsed,expanded}` | `.openui-default-legend-list[data-state="collapsed" or "expanded"]` |
| Stacked legend | `.openui-stacked-legend-container` | `.openui-stacked-legend` |
| Stacked legend | `.openui-stacked-legend` (list) | `.openui-stacked-legend-list` |
| Stacked legend | `.openui-stacked-legend__{item,item-label,item-color-container,item-color,item-label-text,item-value}` | `.openui-stacked-legend-{…}` (same part suffix) |
| Stacked legend | `.openui-stacked-legend__item--active` | `.openui-stacked-legend-item[data-state="active"]` |
| Stacked legend | Header, scroll-button, show-more-button and separator parts | Unchanged |
| Stacked chart layout | `.openui-chart-with-stacked-legend` | Unchanged |
| Stacked chart layout | `.openui-chart-with-stacked-legend__{chart,legend}` | `.openui-chart-with-stacked-legend-{chart,legend}` |
| Stacked chart layout | `.openui-chart-with-stacked-legend--{row,column}` | `.openui-chart-with-stacked-legend[data-orientation="horizontal" or "vertical"]` |
| Chart tooltip | `.openui-portal-tooltip` | `.openui-chart-tooltip-portal` |
| Chart tooltip | `.openui-chart-tooltip` and its rendered `-label`, `-content*` parts | Unchanged; label text now also has `.openui-chart-tooltip-label-text` |
| Chart tooltip | Internal `--dot`, `--two-items`, `--standard`, `--vertical` classes | Dot appearance is the base; count-derived layout uses `[data-layout="two-items" or "multiple"]` on the affected parts |
| Chart tooltip | Unrendered `-label-heavy`, indicator `--line` / `--dashed`, wrapper `--nested` selectors | Removed; no public prop rendered these styles |
| Horizontal scroll controls | `.openui-chart-horizontal-scroll-buttons-container`, `.openui-chart-horizontal-scroll-button`, `--left`, `--right` | `.openui-scroll-buttons-horizontal`, `-button`, `-left`, `-right`; own SVGs also carry `-icon` |
| Vertical scroll controls | `.openui-chart-vertical-scroll-buttons-container`, `.openui-chart-vertical-scroll-button`, `--up`, `--down` | `.openui-scroll-buttons-vertical`, `-button`, `-up`, `-down`; own SVGs also carry `-icon` |
| Scroll controls | `.openui-chart-{horizontal,vertical}-scroll-button--disabled` | `.openui-scroll-buttons-{horizontal,vertical}-button:disabled` |
| Mini charts | `.openui-mini-chart`, `.openui-mini-{line,area,bar}-chart-container` | `.openui-mini-{line,area,bar}-chart` (one root per exported component) |
| Mini charts | `.openui-mini-{line,area,bar}-chart-*` drawing parts | Unchanged; SVGs, area gradient definitions and stops now also have stable part classes |
| Mini charts | `.openui-mini-chart--clickable` | `.openui-mini-{line,area,bar}-chart[data-clickable]` |
| Mini charts | `.openui-mini-chart-mark--animated` | `.openui-mini-{line,area,bar}-chart--is-animation-active` on the root, emitted only when the prop is true |
| Cartesian charts (#103) | `.openui-{area,bar,horizontal-bar,line,scatter}-chart-container` | `.openui-{area,bar,horizontal-bar,line,scatter}-chart` (the root; condensed wrappers use their family's root) |
| Cartesian charts (#103) | Existing axis, series, tick, crosshair, category-label and frame part classes | Unchanged; each rendered SVG/group/hit target, grid line, tick span, clip and gradient also has its own documented stable class |
| Cartesian entrances (#103) | `.openui-{area,line}-chart-{area-path,area-line,line}--animated`, `.openui-{bar,horizontal-bar}-chart-bar--animated`, `.openui-scatter-chart-dot--animated` | Corresponding drawing part's `--is-animation-active` modifier; emitted only while `isAnimationActive` is true and not printing. Bar internal lines have their own `-internal-line--is-animation-active` modifier. |
| Cartesian negative values (#103) | `.openui-{bar,horizontal-bar}-chart-bar--negative` | `[data-negative]` on the bar or internal line; add the same attribute to a stable-class override for that state |
| Cartesian zero baseline (#103) | `.openui-grid-zero-line` | `.openui-{area,bar,line,scatter}-chart-grid-line[data-zero]`; other grid lines carry the same part class without the state |
| PieChart, RadarChart, RadialChart, FunnelChart, HeatmapChart, CalendarHeatmap | `.openui-<chart>-container` | `.openui-<chart>`; owned drawing elements also have stable part classes |
| SegmentedBar / SingleStackedBar | `.openui-segmented-bar-container`, `-container--gap` | `.openui-segmented-bar`; gap comes from `--legend` and `--legend-variant-{default,stacked}` |
| SegmentedBar / SingleStackedBar | `.openui-segmented-bar` (track) | `.openui-segmented-bar-track` |
| Other charts | `-slice--animated`, `-polygon--animated`, `-bar--animated`, `-stage--animated`, `-cell--animated`, `-cell-label--animated`, `-segment--animated` | Same block with `--is-animation-active`; the chart root also emits `--is-animation-active` only when the prop is true |
| Other charts | Appearance axes previously implicit in markup/geometry | Root modifiers for Pie `variant`/`appearance`, Radar `variant`/`gridShape`, Radial `variant`, Funnel `orientation`/`edges`, Heatmap `rampMode`, Calendar `layout`/`legendVariant`, SegmentedBar `legendVariant`; defaults always emit their modifier and names use kebab-case |
| FunnelChart | `-ring--springy`, `-ring--bloom-{x,y}` | `.openui-funnel-chart-ring[data-motion="spring"]`; the root's `--orientation-{horizontal,vertical}` sets the private transform axis |
| HeatmapChart | `.openui-heatmap-chart-cell--empty` | `.openui-heatmap-chart-cell[data-empty]` |
| HeatmapChart | `.openui-heatmap-chart-color-scale-ramp--diverging` | `.openui-heatmap-chart-color-scale-ramp--ramp-mode-diverging`; sequential mode emits `--ramp-mode-sequential` |
| CalendarHeatmap | `.openui-calendar-heatmap-cell--level-N`, `--ghost`; ancestor `data-openui-highlight-level` dimming | `.openui-calendar-heatmap-cell[data-level="N"]`, `[data-ghost]`, `[data-dimmed]` on the affected cell |
| Image (#97) | `.openui-image` | Unchanged root; aspect wrapper and viewport now have `.openui-image-aspect` and `.openui-image-viewport`, with CSS defaults replacing Radix inline geometry |
| Image | `.openui-image-{fit,fill}` | `.openui-image--scale-{fit,fill}`; default `fill` always emitted |
| Image | `aspectRatio` without a modifier | `.openui-image-aspect--aspect-ratio-{1-1,3-2,3-4,4-3,16-9}` on the aspect part; default `3:2` always emitted; prop values unchanged |
| Image | `.openui-image--error` | `.openui-image[data-error]` |
| ImageBlock | `.openui-image-block-wrapper`, `-image`, `-loader` | `.openui-image-block`, `-image`, `-loader` |
| ImageBlock | `-wrapper--mobile`, `-image--mobile`, `-wrapper--error`, `-image--error` | `[data-breakpoint="mobile"]` and `[data-error]` on root/image; root also exposes `[data-loading]`; no prop renames |
| ImageText | `.openui-image-text--{horizontal,vertical}`, `__{image-container,image,content}` | `--layout-{horizontal,vertical}` and `-{image-container,image,content}`; default horizontal emitted, `bold` emits `--bold` only when true |
| ImageText | `imageSize` as inline width/height | Same numeric prop; geometry defaults live in CSS and can be overridden by `.openui-image-text-image-container` |
| ImageTextLarge | `.openui-image-text-large__{image-wrap,image,content}` | `.openui-image-text-large-{image-wrap,image,content}`; root unchanged; no prop renames |
| ImageGallery | `.openui-gallery`, `__{grid,image}`, `__show-all-button` | `.openui-image-gallery`, `-grid`, `-image`, `-show-all`; each owned img has `-img` |
| ImageGallery | `.openui-gallery--{single,double,triple,quad,default}`, `__image--main` | Root `[data-layout="…"]` derived from image count; tile `[data-position="1"]`; no invented layout prop |
| ImageGallery modal | `.openui-gallery__modal`, `__modal-{content,header,heading,main,carousel-container,carousel,thumbnail}` | `.openui-image-gallery-modal`, `-modal-{content,header,heading,main,carousel-container,carousel,thumbnail}` |
| ImageGallery modal | `__modal-carousel-button-container`, `__modal-carousel-button-container-{left,right}`, `__carousel-button`, `__carousel-button--{left,right}` | `.openui-image-gallery-modal-button-container`, `-modal-{left,right}-button`, `-modal-scroll-{left,right}`; close button has `-modal-close`, owned SVGs `-modal-icon` |
| ImageGallery modal | `__modal-thumbnail--active`, unclassified owned images | `.openui-image-gallery-modal-thumbnail[aria-pressed="true"]`; images have `-modal-main-image` and `-modal-thumbnail-image` |
| Carousel | `.openui-carousel--{card,sunk}` | `.openui-carousel--variant-{card,sunk}`; default card always emitted; `noSnap` and `showButtons` emit `--no-snap` / `--show-buttons` only when true |
| Carousel | `.openui-carousel-content--mask-{left,right}` | `.openui-carousel-content[data-mask="…"]` with `none`, `left`, `right` or `both` |
| Carousel | `.openui-carousel`, `-content`, `-content-wrapper`, `-item`, `-button`, `-button-{left,right}` | Unchanged parts; actual buttons also carry `-previous` / `-next`; their consumer `className`, `style`, and ref now share the actual button root |

For rollout #96, **TextBlock** is the established family name of the public `TextBlockView`
export; its stable root is `.openui-text-block`. The React export name is unchanged.
Callout's timed fade/collapse has the normal CSS animation priority: disable it with
`.openui-callout[data-autodismiss] { animation: none; }` before overriding animated padding,
opacity or height. That animation declaration is itself overridable in both load orders.

Pre-release `@openuidev/react-components` betas also emitted internal carrier classes that
react-ui never had. They are gone; use the class on the right instead:

| Beta-only class                                                                                    | Use                                                                                                                               |
| -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `.openui-button-root`                                                                              | `.openui-button`                                                                                                                  |
| `.openui-icon-button-root`                                                                         | `.openui-icon-button`                                                                                                             |
| `.openui-tabs-tabs`                                                                                | `.openui-tabs`                                                                                                                    |
| `.openui-tabs-container`                                                                           | `.openui-tabs-list-container`                                                                                                     |
| `.openui-tabs-list-styled`, `.openui-tabs-trigger-styled`, `.openui-tabs-content-styled`           | `.openui-tabs-list`, `.openui-tabs-trigger`, `.openui-tabs-content`                                                               |
| `.openui-mark-down-renderer-markdown-{root,code,link}`                                             | `.openui-markdown-renderer`, `-code`, `-link`                                                                                     |
| `.openui-inline-markdown-renderer-inline-markdown-root`                                            | `.openui-inline-markdown-renderer`                                                                                                |
| `.openui-citation-container-styled`, `.openui-citation-trigger`, `.openui-citation-tooltip-styled` | `.openui-citation-container`, `.openui-citation`, `.openui-citation-tooltip`                                                      |
| `.openui-citation-item-item`                                                                       | `.openui-citation-item`                                                                                                           |
| `.openui-sources-listed-sources-{list,header,title,buttons,container}`                             | `.openui-sources`, `.openui-sources-header`, `.openui-sources-title`, `.openui-sources-buttons`, `.openui-sources-item-container` |
| `.openui-sources-item-item`                                                                        | `.openui-sources-item`                                                                                                            |
| `.openui-source-favicon-image-root`                                                                | `.openui-source-favicon-image`                                                                                                    |
| `.openui-accordion-root`                                                                           | `.openui-accordion`                                                                                                               |
| `.openui-card-root`                                                                                | `.openui-card`                                                                                                                    |
| `.openui-card-header-root`                                                                         | `.openui-card-header`                                                                                                             |
| `.openui-section-block-section-v2-root`                                                            | `.openui-section-v2`                                                                                                              |
| `.openui-section-block-foldable-section-{root,item,header,trigger,content}`                        | `.openui-foldable-section` (root) or `.openui-foldable-section-{item,header,trigger,content}`                                     |
| `.openui-steps-root`, `.openui-steps-item`                                                         | `.openui-steps`, `.openui-steps-item`                                                                                             |
| `.openui-modal-portal-root`                                                                        | `.openui-modal`                                                                                                                   |
| `.openui-modal-{overlay,content,header,title,close,body}-root`                                     | `.openui-modal-{overlay,content,header,title,close,body}`                                                                         |
| `.openui-tooltip-wrapper-content`                                                                  | `.openui-tooltip-wrapper`                                                                                                         |
| `.openui-list-item-root`                                                                           | `.openui-list-item`                                                                                                               |
| `.openui-list-block-root`                                                                          | `.openui-list-block`                                                                                                              |
| `.openui-entity-list-root`                                                                         | `.openui-entity-list`                                                                                                             |
| `.openui-metric-indicator-root`                                                                    | `.openui-metric-indicator`                                                                                                        |
| `.openui-table-container-styled`, `.openui-table-table`                                            | `.openui-table-container`, `.openui-table`                                                                                        |
| `.openui-table-{footer,head,row,cell}-styled`                                                      | `.openui-table-{footer,head,row,cell}`                                                                                            |
| `.openui-table-alignment`                                                                          | Removed; target the head/cell root or its `--align-{left,center,right}` modifier                                                  |
| `.openui-table-scrollable-table-{wrapper,scroll-container,control}`                                | `.openui-scrollable-table-{wrapper,scroll-container,control}`                                                                     |
| `.openui-slider-wrapper-root` | `.openui-slider-wrapper` (part) / `.openui-slider` (root) |
| `.openui-slider-block-root` | `.openui-slider-block` |
| `.openui-select-{trigger,content,viewport,group,label,item,separator}-root` | `.openui-select-{trigger,content,viewport,group,label,item,separator}` |
| `.openui-calendar-container-root` | `.openui-calendar` |
| `.openui-date-picker-style-root` | `.openui-date-picker` / `.openui-date-picker-content` |
| `.openui-form-control-root` | `.openui-form-control` |
| `.openui-hint-root` | `.openui-form-control-hint` |
| `.openui-input-root` | `.openui-input` |
| `.openui-textarea-root` | `.openui-text-area` |
| `.openui-label-root` | `.openui-label` |
| `.openui-buttons-root` | `.openui-buttons` |
| `.openui-skeleton-root` | `.openui-skeleton` |
| `.openui-skeleton-bar-root` | `.openui-skeleton-bar` |
| `.openui-skeleton-pie-chart-skeleton-root` | `.openui-pie-chart-skeleton` |
| `.openui-skeleton-table-skeleton-root` | `.openui-table-skeleton` |
| `.openui-dot-matrix-loader-root` | `.openui-dot-matrix-loader` |
| `.openui-code-block-root` | `.openui-code-block` |
| `.openui-chart-empty-root`, `.openui-chart-{x,y}-axis-label-root` | `.openui-chart-empty`, `.openui-chart-{x,y}-axis-label` |
| `.openui-chart-default-legend-root`, `.openui-chart-stacked-legend-root` | `.openui-default-legend`, `.openui-stacked-legend` |
| `.openui-chart-stacked-legend-layout-root`, `.openui-chart-stacked-legend-scrollbar` | `.openui-chart-with-stacked-legend`, `.openui-stacked-legend-list` |
| `.openui-chart-tooltip-root`, `.openui-chart-tooltip-portal-root` | `.openui-chart-tooltip`, `.openui-chart-tooltip-portal` |
| `.openui-chart-{horizontal,vertical}-scroll-controls-root` | `.openui-scroll-buttons-{horizontal,vertical}` |
| `.openui-mini-chart-root` | `.openui-mini-{line,area,bar}-chart` |
| `.openui-{area,bar,horizontal-bar,line,scatter}-chart-root` | `.openui-{area,bar,horizontal-bar,line,scatter}-chart` |
| `.openui-{pie-chart,radar-chart,radial-chart,funnel-chart,heatmap-chart,calendar-heatmap,segmented-bar}-root` | The corresponding `.openui-<chart>` root |
| `.openui-heatmap-chart-diverging-ramp-root` | `.openui-heatmap-chart-color-scale-ramp--ramp-mode-diverging::after` |
| `.openui-image-root`, `-fit-styled`, `-fill-styled`, `-error` | `.openui-image`, `--scale-fit`, `--scale-fill`, `[data-error]` |
| `.openui-image-block-wrapper-styled`, `-wrapper-mobile`, `-image-styled`, `-image-mobile`, `-error`, `-loader-styled` | `.openui-image-block`, `[data-breakpoint="mobile"]`, `-image`, `[data-error]`, `-loader` |
| `.openui-image-text-root`, `-layout-{horizontal,vertical}` | `.openui-image-text`, `--layout-{horizontal,vertical}`; existing flat part carriers remain |
| `.openui-image-text-large-root` | `.openui-image-text-large`; existing flat image carriers remain |
| `.openui-image-gallery-gallery`, `-layout-openui-gallery-{single,double,triple,quad,default}`, `-main-image` | `.openui-image-gallery`, `[data-layout="…"]`, `-image[data-position="1"]`; grid/image/show-all carriers remain |
| `.openui-image-gallery-gallery-modal-{modal,content,header,heading,main,carousel-container,carousel,button-container,left-button,right-button,thumbnail,active-thumbnail}` | `.openui-image-gallery-modal`, `-modal-{content,header,heading,main,carousel-container,carousel,button-container,left-button,right-button,thumbnail}`; active uses `[aria-pressed="true"]` |
| `.openui-carousel-carousel`, `-content-styled`, `-item-styled`, `-button-styled` | `.openui-carousel`, `-content`, `-item`, `-button` |

The #95 citations and sources migration changes no prop names. No internal callers outside
these families reference their renamed classes, and no chat-kit source in the local kit branches
(`chat-kit-tone`, `dashboard-kit`, `intelligent-kit`, `chat-kit-separate`, `standalone-chat-kit`,
`react-chat-kit`, `nested-kit-discovery`, `production-core-kits`) references them; no chat-kit
files were changed.

The #96 text-block migration changes no prop names. No internal callers outside these families
reference their renamed classes; the docs app's `.openui-callout-title` rule styles react-ui's
Callout, which is unchanged. Chat-kit's ModelSwitcher styles (`modelSwitcher.styles.ts` in
`chat-kit-tone`, `dashboard-kit`, `chat-kit-separate`, `standalone-chat-kit` and
`nested-kit-discovery`) select `.openui-tag.openui-tag-sm` and `.openui-tag-text` on this
package's Tag. `.openui-tag` and `.openui-tag-text` are unchanged, but `.openui-tag-sm` is now
`.openui-tag--size-sm`, so that rule stops matching until the kit is updated; `react-chat-kit`
has the same names in test fixtures. No chat-kit files were changed.

The #97 media migration changes no prop names; Carousel buttons now forward consumer
`className`, `style` and ref to the actual button. No internal callers outside these families,
and no chat-kit source in the local kit branches, reference their renamed classes; no chat-kit
files were changed.

The #98 disclosure/layout/overlay migration changes no prop names. No internal callers outside
these families reference their renamed classes. No chat-kit directory or matching references
are present in this checkout; no chat-kit files were changed.

The #99 lists and tables migration changes no prop names. No internal callers outside these
families, and no chat-kit source in the local kit branches, reference their renamed classes; no
chat-kit files were changed.

The #100 card-block migration changes no public prop names. Blocks compose public text,
markdown, tag, citation and tooltip components; inherited private values preserve their existing
inline emphasis, image-tag appearance and snippet truncation. MetricIndicator is migrated by #99; ImageText
uses flat styles from #97 with the same snippet truncation variables. No renamed-card-class callers outside these families
or chat-kit directories/references were found; no chat-kit files changed.

Chart foundation props are unchanged. Data colors, dimming and draw-line length use private
`--_openui-*` variables; override the resulting CSS property on the stable class. Mini-chart
frame width/height, explicit `StackedLegend style` values, and the tooltip spring's positioning
transform remain geometry set by JavaScript. The tooltip panel and its appearance are class-overridable.
No chat-kit source references to these renamed chart classes were found for ticket #102.

Cartesian chart props are unchanged for ticket #103. Dynamic dimming, follower appearance and
entrance delays use private `--_openui-*` variables read by flat part styles. Chart frame
width/height, SVG coordinates, path lengths and spring positioning remain geometry set by
JavaScript. The public classes override appearance properties directly. Empty HorizontalBarChart
frames retain their existing layout and now carry their own family's stable root.
A repository-wide scan found no external/chat-kit references to the renamed classes; no kit was modified.

Ticket #104 changes no public prop names. Runtime chart appearance values use private
`--_openui-*` variables, read by flat class rules. Calendar level fills and the funnel spring
scale are private too. `SingleStackedBar` remains the `SegmentedBar` alias.
No references to these renamed classes were found outside react-components and the retained
react-ui implementation (including chat-kit consumers); no chat-kit source was changed.

## Beta import migration

Use `@openuidev/react-components` in place of the previous unpublished beta name
`@openuidev/react-ui-core`. The folder is now `packages/react-components`. There
is no compatibility alias. Component names, root-only exports, public types and
customization APIs are preserved. The existing `@openuidev/react-ui` package stays
unchanged. Historical validation artifact names remain valid for their recorded
baselines.
