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

Components are moving to one styling contract: restyle any part of a component with a single
documented class, without `!important`. Components that follow it are listed, with every class, in
the [stable class reference](docs/reference/selectors.md), which is generated from the components'
own class constants. Other components keep their earlier selectors, documented under
[Automatic styles](#automatic-styles), until they move.

### Class names

| Kind | Pattern | Example |
| --- | --- | --- |
| Root | `openui-<component>` | `openui-button` |
| Part | `openui-<component>-<part>` | `openui-button-icon` |
| Modifier | `openui-<block>--<prop>-<value>` | `openui-button--variant-primary` |
| Boolean modifier | `openui-<block>--<prop>` | present only when the prop is `true` |

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
.openui-button--variant-primary { background: navy; }
.openui-button--variant-primary:hover { background: midnightblue; }
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
- Markdown prose ignores bare element selectors (`p { … }`, element resets); target it through
  `.openui-markdown-renderer` instead.
- The Tabs indicator's width and position are set inline as the active tab changes, so they are
  not overridable; its colour and height are, through `.openui-tabs-indicator`.
- Components that have not moved to the contract register their styles on import, behind a class on
  `<html>`, and keep the selectors documented under [Automatic styles](#automatic-styles). The
  package's `test/flat-allowlist.json` lists their modules; it must be empty before a stable release.

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
`app.openui`) is ignored, with a development warning. Components outside any provider stay unlayered, and so do components
not yet converted to the flat convention (currently all but Button), under any
provider. Each layer gets its own generated classes, so a component rendered both
in and out of a layer registers its rules twice.

The library declares no layer order. Put the order and an empty library sheet
first in `<head>`, before any stylesheet, in this order:

```html
<style>@layer theme, base, openui, components, utilities;</style>
<style id="_goober"> </style>
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

## Automatic styles

Owned component styles use stock Goober and do not require a CSS import, setup
command or styling build plugin. Components on the styling contract above register
their styles the first time they render; the others register when a referenced
module evaluates, before the component renders. The build
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

The selectors in this and the following sections belong to components that have
not moved to the [styling contract](#styling-and-overrides) yet; Button, IconButton and
MarkDownRenderer have, and are documented in the [stable class reference](docs/reference/selectors.md).
The documented batches below use stable styling targets that register on import: a private
generated class on `html` is contained in `:where(...:root)` and adds zero
specificity. Consumers do not use that class. EditableTable retains its existing selectors.
Chart-owned targets are documented in the Charts section below.

Use ordinary **later, unlayered CSS** with the corresponding selector. Root rules
have one class of specificity; variants, sizes, states and parts retain their
additional selectors.

No `!important` is required for these matching overrides. This does not promise
that earlier CSS, a root-only selector against a variant rule, or normal CSS in a
named layer beats unlayered component rules. Existing props, inline styles and
theme APIs remain unchanged; no new styling prop is introduced. Old root aliases
remain available on actual components. Host elements carrying only those old
aliases do not acquire the new component styles.

The shared `openui-border-box` helper opts in only Buttons, FormControl and
TagBlock roots. Its flat rule registers when a user renders, honours `cssLayer`, and
survives replacement of `<html class>`. A single consumer class can override its box sizing. It does not style
descendants. Buttons, FormControl and TagBlock also have their remaining owned rules
converted in the batches below.

The shared `.openui-skeleton-pulse` class registers its animation and keyframes when
an animated Skeleton bar, pie shape or legend dot renders, in the provider's layer.
Override that class to change or disable the pulse. The Skeleton family's layout
rules remain on the migration allowlist. Both shared classes are listed in the
[stable class reference](docs/reference/selectors.md).

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
| CodeBlock | `.openui-code-block`, `.openui-code-block-copy-button`, `.openui-code-block-syntax-highlighter` (flat; see the generated reference) |
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
| DotMatrixLoader | `.openui-dot-matrix-loader`, `.openui-dot-matrix-loader-dot`, `--variant-{default,compact}` (flat) |
| Skeleton family | `.openui-skeleton`, `.openui-skeleton-bar`, `.openui-pie-chart-skeleton`, `.openui-table-skeleton` and their parts (flat; see the generated reference) |
| Sources | `.openui-sources-listed-sources-list`, `.openui-sources-listed-sources-header`, `.openui-sources-listed-sources-title`, `.openui-sources-listed-sources-buttons`, `.openui-sources-listed-sources-container`, `.openui-sources-item-item`, `.openui-sources-item-header`, `.openui-sources-item-name`, `.openui-sources-item-title`, `.openui-sources-item-logo` |
| SnippetCardBlock | `.openui-snippet-card-block-root` |
| ContextCardBlock | `.openui-context-card-block-card-image`, `.openui-context-card-block-card-root` |
| CompositeCardBlock | `.openui-composite-card-block-card-wrapper`, `.openui-composite-card-block-card-root` |
| OverviewCardBlock | `.openui-overview-card-block-root` |
| VisualCardBlock | `.openui-visual-card-block-card-clickable`, `.openui-visual-card-block-card-root` |
| _shared/cards | `.openui-card-layout-scrollbar`, `.openui-card-layout-layout-small`, `.openui-card-layout-layout-medium` |
| Accordion | `.openui-accordion-root` |
| Steps | `.openui-steps-root`, `.openui-steps-item` |
| SectionBlock | `.openui-section-block-foldable-section-root`, `.openui-section-block-foldable-section-item`, `.openui-section-block-foldable-section-header`, `.openui-section-block-foldable-section-trigger`, `.openui-section-block-foldable-section-content`, `.openui-section-block-section-v2-root` |
| Carousel | `.openui-carousel-carousel`, `.openui-carousel-content-styled`, `.openui-carousel-item-styled`, `.openui-carousel-button-styled` |
| EntityList | `.openui-entity-list-root` |
| Table | `.openui-table-scrollable-table-wrapper`, `.openui-table-scrollable-table-scroll-container`, `.openui-table-scrollable-table-control`, `.openui-table-container-styled`, `.openui-table-table`, `.openui-table-footer-styled`, `.openui-table-head-styled`, `.openui-table-row-styled`, `.openui-table-cell-styled`, `.openui-table-alignment` |
| TooltipWrapper | `.openui-tooltip-wrapper-body`, `.openui-tooltip-wrapper-heading`, `.openui-tooltip-wrapper-text`, `.openui-tooltip-wrapper-content` |
| Citation | `.openui-citation-container-styled`, `.openui-citation-trigger`, `.openui-citation-tooltip-styled`, `.openui-citation-tooltip-content`, `.openui-citation-item-item`, `.openui-citation-item-logo`, `.openui-citation-item-content`, `.openui-citation-item-title`, `.openui-citation-item-source` |
| ImageGallery | `.openui-image-gallery-gallery-modal-modal`, `.openui-image-gallery-gallery-modal-content`, `.openui-image-gallery-gallery-modal-header`, `.openui-image-gallery-gallery-modal-heading`, `.openui-image-gallery-gallery-modal-main`, `.openui-image-gallery-gallery-modal-carousel-container`, `.openui-image-gallery-gallery-modal-carousel`, `.openui-image-gallery-gallery-modal-button-container`, `.openui-image-gallery-gallery-modal-left-button`, `.openui-image-gallery-gallery-modal-right-button`, `.openui-image-gallery-gallery-modal-thumbnail`, `.openui-image-gallery-gallery-modal-active-thumbnail`, `.openui-image-gallery-gallery`, `.openui-image-gallery-grid`, `.openui-image-gallery-layout-openui-gallery-single`, `.openui-image-gallery-layout-openui-gallery-double`, `.openui-image-gallery-layout-openui-gallery-triple`, `.openui-image-gallery-layout-openui-gallery-quad`, `.openui-image-gallery-layout-openui-gallery-default`, `.openui-image-gallery-image`, `.openui-image-gallery-main-image`, `.openui-image-gallery-show-all` |


CodeBlock accepts two class props:

- `className` is added to the wrapper (`.openui-code-block`), next to its own classes.
- `syntaxHighlighterClassName` replaces the class on the third-party highlighter element. It
  defaults to `openui-code-block-syntax-highlighter`, whose rules (including its `!important`
  margin) apply only while that default is kept; pass your own class to style the highlighter
  yourself. MarkDownRenderer uses this to own its code blocks' spacing.
The Skeleton family, DotMatrixLoader and CodeBlock follow the flat override contract in
both default and layer mode. Their complete parts and modifiers are in the
[generated reference](docs/reference/selectors.md). Skeleton dimensions, pie shape sizes,
table columns and loader dimensions are passed through private `--_openui-*` variables,
so ordinary class rules can override the resulting properties. DotMatrixLoader's trail
also uses a private opacity variable; its dot class can override opacity while it runs.
CodeBlock reveals its copy button on root hover; copied state is
`.openui-code-block-copy-button[data-state="copied"]`. Its existing highlighter
`margin: 0 !important` remains a contract exception.
The default highlighter frame's theme values are flat CSS, so its colour, background
and padding can be overridden on `.openui-code-block-syntax-highlighter`.
Token output and explicitly supplied `theme` maps retain the third-party inline style
API. Replacing `syntaxHighlighterClassName` (including with `""`) opts out of the
default frame rules and retains the third-party theme styles, as before.

Sources retains its existing important width (180px), transparent background
and hover background on listed-source items. Ordinary background overrides do
not beat those declarations, even when the same element also has Carousel's
canonical item class. Use existing props/theme customization or intentionally
important CSS where appropriate; this is not an ordinary-override pass.

Dark
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

| Component | `@openuidev/react-ui` | `@openuidev/react-components` |
| --- | --- | --- |
| Button | `.openui-button-base` (root) | `.openui-button` |
| Button | `.openui-button-base-{primary,secondary,tertiary}` | `.openui-button--variant-{primary,secondary,tertiary}` |
| Button | `.openui-button-base-{extra-small,small,medium,large}` | `.openui-button--size-{extra-small,small,medium,large}` |
| Button | `buttonType="normal"` prop | `tone="default"` (the default); emits `.openui-button--tone-default` |
| Button | `buttonType="destructive"` prop | `tone="destructive"`; emits `.openui-button--tone-destructive` |
| Button | `.openui-button-base-destructive-{primary,secondary,tertiary}` | `.openui-button--tone-destructive` with `.openui-button--variant-{…}` |
| Button | Icons as direct children | Each icon wrapped in `.openui-button-icon` |
| IconButton | `.openui-icon-button` (root) | `.openui-icon-button` (unchanged; now the only root class) |
| IconButton | `.openui-icon-button-icon` | `.openui-icon-button-icon` (unchanged) |
| IconButton | `.openui-icon-button-{primary,secondary,tertiary}` | `.openui-icon-button--variant-{primary,secondary,tertiary}` |
| IconButton | `.openui-icon-button-{3-extra-small,2-extra-small,extra-small,small,medium,large}` | `.openui-icon-button--size-{3-extra-small,2-extra-small,extra-small,small,medium,large}` |
| IconButton | `.openui-icon-button-{square,circle}` | `.openui-icon-button--shape-{square,circle}` |
| IconButton | `appearance="normal"` prop | `tone="default"` (the default); emits `.openui-icon-button--tone-default` |
| IconButton | `appearance="destructive"` prop | `tone="destructive"`; emits `.openui-icon-button--tone-destructive` |
| IconButton | `.openui-icon-button-destructive-{primary,secondary,tertiary}` | `.openui-icon-button--tone-destructive` with `.openui-icon-button--variant-{…}` |
| Tabs | `.openui-tabs` (root), `.openui-tabs-list`, `.openui-tabs-trigger`, `.openui-tabs-content` and their parts | Unchanged |
| Tabs | `.openui-tabs-clear` | `.openui-tabs--variant-clear` |
| Tabs | `.openui-tabs-list--{title,icon-title,icon-title-subtext,image-title,image-title-subtext}` | `.openui-tabs-list--variant-{title,icon-title,icon-title-subtext,image-title,image-title-subtext}` |
| Tabs | `.openui-tabs-list-container` | Unchanged; now a part around the tablist, which is the TabsList root and receives `className`, `style` and `ref` |
| Tabs | `<img>` inside `.openui-tabs-trigger-image` | Also carries the new `.openui-tabs-trigger-img` part |
| Tabs | `.openui-tabs-clear .openui-tabs-trigger`, `.openui-tabs-list--… .openui-tabs-trigger-icon` and other context selectors | The single class of the element, such as `.openui-tabs-trigger` or `.openui-tabs-trigger-icon` |
| Tabs | Scroll buttons styled by Tabs rules | Styled as IconButtons (`.openui-icon-button…`); `.openui-tabs-scroll-button`, `-scroll-left` and `-scroll-right` remain as hooks |
| MarkDownRenderer | `.openui-markdown-renderer` (root), `.openui-markdown-renderer-code`, `.openui-markdown-renderer-link` | Unchanged |
| MarkDownRenderer | `.openui-markdown-renderer-card` | `.openui-markdown-renderer--variant-card` |
| MarkDownRenderer | `.openui-markdown-renderer-card-sunk` | `.openui-markdown-renderer--variant-sunk` |
| MarkDownRenderer | No default `variant`, no clear modifier | `variant="clear"` by default; always emits `.openui-markdown-renderer--variant-clear` |
| MarkDownRenderer | Shared `.openui-code-block-wrapper` | Also carries `.openui-markdown-renderer-code-block`; standalone CodeBlock defaults are unchanged |
| MarkDownRenderer | `.openui-code-block-syntax-highlighter` inside markdown | Removed inside markdown; target `.openui-markdown-renderer-code-block` for the owned root around third-party output. Standalone CodeBlock keeps the old class. |
| MarkDownRenderer | Shared `.openui-table` / `.openui-table-container` | Also carry `.openui-markdown-renderer-table` / `.openui-markdown-renderer-table-container` |
| Shared border-box (#90) | `.openui-border-box` on Buttons, FormControl and TagBlock | Unchanged; registered at render, flat and layer-aware. No prop renames. |
| Shared Skeleton pulse (#90) | Animation on bars, pie shapes and legend dots | Also carry `.openui-skeleton-pulse`; animation and keyframes register at render. Existing classes and props are unchanged. |
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

Pre-release `@openuidev/react-components` betas also emitted internal carrier classes that
react-ui never had. They are gone; use the class on the right instead:

| Beta-only class | Use |
| --- | --- |
| `.openui-button-root` | `.openui-button` |
| `.openui-icon-button-root` | `.openui-icon-button` |
| `.openui-tabs-tabs` | `.openui-tabs` |
| `.openui-tabs-container` | `.openui-tabs-list-container` |
| `.openui-tabs-list-styled`, `.openui-tabs-trigger-styled`, `.openui-tabs-content-styled` | `.openui-tabs-list`, `.openui-tabs-trigger`, `.openui-tabs-content` |
| `.openui-mark-down-renderer-markdown-{root,code,link}` | `.openui-markdown-renderer`, `-code`, `-link` |
| `.openui-skeleton-root` | `.openui-skeleton` |
| `.openui-skeleton-bar-root` | `.openui-skeleton-bar` |
| `.openui-skeleton-pie-chart-skeleton-root` | `.openui-pie-chart-skeleton` |
| `.openui-skeleton-table-skeleton-root` | `.openui-table-skeleton` |
| `.openui-dot-matrix-loader-root` | `.openui-dot-matrix-loader` |
| `.openui-code-block-root` | `.openui-code-block` |

## Beta import migration

Use `@openuidev/react-components` in place of the previous unpublished beta name
`@openuidev/react-ui-core`. The folder is now `packages/react-components`. There
is no compatibility alias. Component names, root-only exports, public types and
customization APIs are preserved. The existing `@openuidev/react-ui` package stays
unchanged. Historical validation artifact names remain valid for their recorded
baselines.
