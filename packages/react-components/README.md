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

Importing the package also registers the existing light-theme token defaults on
the document root, without a provider. These defaults occupy the first CSS layer,
so normal host token declarations override them, including declarations in named
layers. Inherited container overrides and ThemeProvider scopes remain supported;
system dark mode does not change the provider-free defaults.

Chrome with plain CSS, Tailwind v3 and Tailwind v4 is the current browser target.
Host preflight remains enabled. Ordinary utility classes do not necessarily beat
component defaults. Intentional overrides can use scoped important CSS or the
framework's important utility modifier: Tailwind v3 `!bg-red-500`, Tailwind v4
`bg-red-500!`. Existing component props, inline styles and theme tokens remain
the primary customization APIs. Replacing host styles dynamically after mount
has not been certified.

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

## Support boundary and inherited behavior

React/ReactDOM19 are required. Zod3.25+ or4 and Zustand4.5.5+ remain peer
dependencies. **SSR, hydration, streaming SSR and concurrent server style
isolation are deferred.** Node imports and declarations do not establish SSR
support. Client-side OpenUI response streaming is a separate capability.

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
const rootClass = css`
  ${body}
  display: flex;
  &:disabled {
    cursor: not-allowed;
  }
`;
```

Keep selector specificity, declaration order, token fallbacks and keyframe timing
when editing styles. Use CSS units explicitly: Goober does not add `px` to numeric
object values. Class-name maps are ordinary objects containing registered classes;
they are not CSS declaration objects.

The following retain their existing non-template contracts:

- Native `style` forwarding and computed chart geometry/animation values are
  per-instance React styles.
- ThemeProvider serializes scoped theme variables through its existing lifecycle.
- Syntax-highlighter theme maps use the third-party component's object API.
- KaTeX keeps its official vendor CSS and font assets.

These exceptions do not justify new static Goober declaration objects, custom
serializers or styling APIs.

## Beta import migration

Use `@openuidev/react-components` in place of the previous unpublished beta name
`@openuidev/react-ui-core`. The folder is now `packages/react-components`. There
is no compatibility alias. Component names, root-only exports, public types and
customization APIs are preserved. The existing `@openuidev/react-ui` package stays
unchanged. Historical validation artifact names remain valid for their recorded
baselines.
