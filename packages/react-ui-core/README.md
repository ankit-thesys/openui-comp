# @openuidev/react-ui-core

The first migration slice of OpenUI's reusable React UI. The existing `@openuidev/react-ui` package remains unchanged. This package is under development; its beta version is provisional and no release is authorized by these changes.

## Themes

Import public APIs from the package root:

```tsx
import { createTheme, ThemeProvider, useTheme } from "@openuidev/react-ui-core";

const brand = createTheme({ interactiveAccentDefault: "oklch(0.6 0.2 260 / 1)" });

function App() {
  return <ThemeProvider lightTheme={brand}>{/* application */}</ThemeProvider>;
}
```

Existing `lightTheme`, `darkTheme`, `mode`, deprecated `theme` and `cssSelector` props are preserved. `useTheme`, default themes, swatches, theme types, system-mode/preference hooks and preference constants are available from the root. Context objects stay internal. There are no component subpath exports or new styling props.

A top-level provider still targets `body` by default. Nested providers automatically scope their tokens. For independent top-level themes, use separate existing `cssSelector` targets. The class returned by `useTheme().portalThemeClassName` preserves the existing portal theme mechanism. The extraction does not change legacy scoping or preference behavior.

`useThemeModePreference` retains JSON localStorage preferences, system-mode changes and the `data-openui-theme` document attribute. Blocked storage is tolerated. It does not synchronize preferences across independent hook instances or browser tabs; that existing behavior has not changed.

## Styling boundary

Component styling uses unmodified Goober through public module-scope `css` calls and ordinary React elements. A referenced component's styles register when its module evaluates, even before it renders. The user accepted this eager cost for the bounded first migration slice. The full-library prototype added about 225–235 ms of median local cold startup; that measurement is not a production-device guarantee. Import pruning and rendered automatic styling must both pass package-consumer checks.

Browser users need no component CSS import, setup command or styling build plugin. Existing customization uses component props, `className`, `style` and theme tokens where supported. Intentional overrides may require scoped important CSS or per-utility important modifiers (Tailwind v3 `!bg-red-500`; Tailwind v4 `bg-red-500!`). Ordinary utility classes are not guaranteed to beat component defaults. Host preflight remains enabled.

React and ReactDOM 19 are the peer boundary. Chrome with plain CSS and Tailwind v3/v4 is the current browser target. **SSR, hydration, streaming SSR and concurrent server style isolation are deferred.** Do not infer server support from Node import or declaration checks.

## Development

```sh
pnpm --filter @openuidev/react-ui-core typecheck
pnpm --filter @openuidev/react-ui-core test
pnpm --filter @openuidev/react-ui-core check:publint
pnpm --filter @openuidev/react-ui-core check:attw
```

The build preserves modules in ESM/CJS with matching declarations. Goober and React stay external dependencies. There are no old SCSS or generated CSS build inputs. Package metadata marks modules as removable when unused; class values referenced by rendered components must retain their Goober calls. Tests use built public exports. Remaining families, charts and chat kits are later slices.
