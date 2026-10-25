# @openuidev/react-ui-core

OpenUI's reusable React UI, extracted in additive migration slices. The existing `@openuidev/react-ui` package remains unchanged. This package is under development; its beta version is provisional and no release is authorized by these changes.

## Controls

The root exposes Button, Input, TextArea, Buttons, IconButton, Label, FormControl/Hint, checkbox/radio/switch/toggle groups and items, Calendar, DatePicker, Select parts, Slider/SliderBlock and Chips, with their existing public types. OptionCards is deferred until its markdown, table and citation prerequisites are extracted. Preserve existing variants, sizes, native props, refs, error state and supported customization:

```tsx
import { Button, Input, TextArea, ThemeProvider } from "@openuidev/react-ui-core";

function Form() {
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

Input retains its existing `styles` alias as well as native `style` forwarding. FormControl and Hint preserve inherited error state and explicit overrides. Their context stays internal.

## Themes

Import public APIs from the package root:

```tsx
import { createTheme, ThemeProvider, useTheme } from "@openuidev/react-ui-core";

const brand = createTheme({ interactiveAccentDefault: "oklch(0.6 0.2 260 / 1)" });

function App() {
  return <ThemeProvider lightTheme={brand}>{/* application */}</ThemeProvider>;
}
```

Existing `lightTheme`, `darkTheme`, `mode`, deprecated `theme` and `cssSelector` props are preserved. `useTheme`, default themes, swatches, theme types, system-mode/preference hooks and preference constants are available from the root. Theme context objects stay internal. The existing LayoutContext, LayoutContextProvider and useLayoutContext APIs remain public for date-control layouts. There are no component subpath exports or new styling props.

A top-level provider still targets `body` by default. Nested providers automatically scope their tokens. For independent top-level themes, use separate existing `cssSelector` targets. The class returned by `useTheme().portalThemeClassName` preserves the existing portal theme mechanism. The extraction does not change legacy scoping or preference behavior.

`useThemeModePreference` retains JSON localStorage preferences, system-mode changes and the `data-openui-theme` document attribute. Blocked storage is tolerated. It does not synchronize preferences across independent hook instances or browser tabs; that existing behavior has not changed.

## Styling boundary

Component styling uses unmodified Goober through public module-scope `css` calls and ordinary React elements. A referenced component's styles register when its module evaluates, even before it renders. The user accepted this eager cost for the bounded first migration slice. The full-library prototype added about 225–235 ms of median local cold startup; that measurement is not a production-device guarantee. Import pruning and rendered automatic styling must both pass package-consumer checks.

Owned Goober component styles need no CSS import, setup command or styling build plugin. Existing customization uses component props, `className`, `style` and theme tokens where supported. Intentional overrides may require scoped important CSS or per-utility important modifiers (Tailwind v3 `!bg-red-500`; Tailwind v4 `bg-red-500!`). Ordinary utility classes are not guaranteed to beat component defaults. Host preflight remains enabled.

### Math vendor styles

TextContentWrapper keeps its existing lazy math renderer and automatically imports official KaTeX CSS/fonts through a private module. This is the accepted exception to Goober-owned component styles; legacy SCSS is not used. Ordinary component imports work without additional styling setup in the validated default Vite6.4.2 production build. Other bundlers need validation; bare esbuild requires font asset loaders and application CSS linking.

Vite may emit about1.07MB of unused font assets even when math is unused. This accepted output cost does not mean the browser downloads them: Button-only pages load no math CSS/fonts, and unused math JavaScript/CSS are pruned. The wrapper loads its math module whenever mounted, including non-math text. See the accepted [styling spec addendum](../../docs/specs/react-ui-extraction-styling.md).

React and ReactDOM 19 are the peer boundary. Chrome with plain CSS and Tailwind v3/v4 is the current browser target. **SSR, hydration, streaming SSR and concurrent server style isolation are deferred.** Do not infer server support from Node import or declaration checks.

## Data views and composed cards

Root imports now include `EditableTable`, `EditableTableChangesBar`, `EntityList`, `ListItem`, `ListBlock`, `MetricIndicatorInline`, `MetricIndicatorWithStrikethrough`, and the existing Composite/Context/Overview/Snippet/Visual card families and types. Their existing customization APIs are preserved; the shared card layout remains private.

Extraction retains inherited behavior, including two `onDataChange` notifications when Enter-save is followed by blur in EditableTable. See [slice13 validation evidence](./evidence/data-cards/README.md) for exact coverage and remaining independent checks. Browser comparisons cover initial stylesheet orders; dynamically replacing or reordering host styles after mount is not certified.

## Development

```sh
pnpm --filter @openuidev/react-ui-core typecheck
pnpm --filter @openuidev/react-ui-core test
pnpm --filter @openuidev/react-ui-core check:publint
pnpm --filter @openuidev/react-ui-core check:attw
```

The build preserves modules in ESM/CJS with matching declarations. Goober and React stay external dependencies. There are no old SCSS or generated CSS build inputs. Package metadata marks modules as removable when unused; class values referenced by rendered components must retain their Goober calls. Tests use built public exports. Layout containers, cards, sections and loading components are also exposed through the root, including their existing parts and types. Modal and TooltipWrapper are also exposed through the root. Their inherited focus, labeling and child-ref limitations are recorded in src/components/Modal/__tests__/INHERITED_LIMITATIONS.md; extraction does not redesign these APIs. Remaining families, charts and chat kits are later slices. See FORM_CONTROLS.md for this slice’s validation and inherited limitations.
